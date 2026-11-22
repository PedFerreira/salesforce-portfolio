-- =============================================================================
-- Planning Poker — schema para hospedagem 100% estática (GitHub Pages)
--
-- Não existe servidor de aplicação: o navegador fala direto com o Supabase.
-- Toda regra de negócio que antes vivia nas rotas /api do Next.js mora aqui,
-- em funções `security definer` chamadas via RPC por usuários autenticados
-- (sessões anônimas do Supabase Auth, protegidas por Cloudflare Turnstile).
--
-- Modelo de segurança:
--   * Tabelas com RLS ligada e SEM policies -> ninguém lê/escreve direto via
--     PostgREST. O único caminho são as funções abaixo.
--   * Canais Realtime são privados (`room:{id}`): só membros da sala recebem
--     mensagens, e clientes só podem publicar PRESENCE. Eventos de controle
--     (nova rodada, revelar, encerrar) só saem do banco via realtime.send(),
--     depois de checar que quem pediu é o facilitador da sala.
--   * Limites anti-abuso: 5 salas/hora por sessão, 200 salas ativas no total,
--     50 participantes por sala, expurgo após 1h sem atividade.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------
create table public.rooms (
  id               text primary key,
  project_name     text not null check (char_length(project_name) between 1 and 120),
  facilitator_name text not null check (char_length(facilitator_name) between 1 and 60),
  deck_type        text not null check (deck_type in ('fibonacci', 'shirt_size', 'semaforo')),
  created_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create index rooms_last_activity_idx on public.rooms (last_activity_at);

create table public.room_members (
  room_id        text not null references public.rooms (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  is_facilitator boolean not null default false,
  joined_at      timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index room_members_user_idx on public.room_members (user_id);

-- Registro de criações (sobrevive ao encerramento da sala) para o rate limit.
create table public.room_creations (
  id         bigint generated always as identity primary key,
  user_id    uuid not null,
  created_at timestamptz not null default now()
);
create index room_creations_user_time_idx on public.room_creations (user_id, created_at);

alter table public.rooms          enable row level security;
alter table public.room_members   enable row level security;
alter table public.room_creations enable row level security;

revoke all on public.rooms, public.room_members, public.room_creations from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Helpers internos (não expostos via RPC)
-- -----------------------------------------------------------------------------
create or replace function public.iso_utc(ts timestamptz)
returns text
language sql immutable
set search_path = ''
as $$
  select to_char(ts at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
$$;

-- 10 caracteres sem ambíguos (0/O, 1/I/l) — o ID vai no link compartilhável.
create or replace function public.generate_room_id()
returns text
language plpgsql volatile
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  bytes  bytea := extensions.gen_random_bytes(10);
  result text := '';
  i      int;
begin
  for i in 0..9 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.new_round(p_ticket_code text)
returns jsonb
language sql volatile
set search_path = ''
as $$
  select jsonb_build_object(
    'id',         gen_random_uuid(),
    'ticketCode', p_ticket_code,
    'status',     'voting',
    'createdAt',  public.iso_utc(clock_timestamp()),
    'revealedAt', null
  );
$$;

create or replace function public.clean_ticket_code(p_ticket_code text)
returns text
language plpgsql immutable
set search_path = ''
as $$
declare
  v text := btrim(coalesce(p_ticket_code, ''));
begin
  if char_length(v) not between 1 and 15 then
    raise exception 'invalid_input';
  end if;
  return v;
end;
$$;

create or replace function public.assert_facilitator(p_room_id text)
returns void
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (
    select 1 from public.room_members
    where room_id = p_room_id and user_id = auth.uid() and is_facilitator
  ) then
    raise exception 'forbidden';
  end if;
end;
$$;

create or replace function public.broadcast_room_event(p_room_id text, p_event jsonb)
returns void
language sql volatile security definer
set search_path = ''
as $$
  select realtime.send(p_event, 'room_event', 'room:' || p_room_id, true);
$$;

-- -----------------------------------------------------------------------------
-- RPCs públicas (chamadas pelo navegador com sessão anônima)
-- -----------------------------------------------------------------------------
create or replace function public.create_room(
  p_project_name     text,
  p_facilitator_name text,
  p_deck_type        text,
  p_ticket_code      text
)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_uid         uuid := auth.uid();
  v_project     text := btrim(coalesce(p_project_name, ''));
  v_facilitator text := btrim(coalesce(p_facilitator_name, ''));
  v_ticket      text := public.clean_ticket_code(p_ticket_code);
  v_room_id     text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if char_length(v_project) not between 1 and 120
     or char_length(v_facilitator) not between 1 and 60
     or p_deck_type is null
     or p_deck_type not in ('fibonacci', 'shirt_size', 'semaforo') then
    raise exception 'invalid_input';
  end if;

  -- Serializa criações da mesma sessão para o rate limit não ser burlado
  -- com requisições paralelas.
  perform pg_advisory_xact_lock(hashtext('poker:create_room:' || v_uid::text));

  if (select count(*) from public.room_creations
      where user_id = v_uid and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;

  if (select count(*) from public.rooms) >= 200 then
    raise exception 'capacity_reached';
  end if;

  loop
    v_room_id := public.generate_room_id();
    exit when not exists (select 1 from public.rooms where id = v_room_id);
  end loop;

  insert into public.rooms (id, project_name, facilitator_name, deck_type)
  values (v_room_id, v_project, v_facilitator, p_deck_type);

  insert into public.room_members (room_id, user_id, is_facilitator)
  values (v_room_id, v_uid, true);

  insert into public.room_creations (user_id) values (v_uid);

  -- A rodada 1 não é transmitida (ninguém está no canal ainda): vai só na
  -- resposta e o facilitador a publica na própria presence ao entrar.
  return jsonb_build_object('roomId', v_room_id, 'round', public.new_round(v_ticket));
end;
$$;

-- Entra na sala (idempotente) e devolve os dados públicos dela.
-- Retorna null se a sala não existe (link errado ou sala encerrada).
create or replace function public.join_room(p_room_id text)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_room public.rooms%rowtype;
  v_is_facilitator boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_room from public.rooms where id = p_room_id;
  if not found then
    return null;
  end if;

  select is_facilitator into v_is_facilitator
  from public.room_members where room_id = p_room_id and user_id = v_uid;

  if not found then
    if (select count(*) from public.room_members where room_id = p_room_id) >= 50 then
      raise exception 'room_full';
    end if;
    insert into public.room_members (room_id, user_id, is_facilitator)
    values (p_room_id, v_uid, false);
    v_is_facilitator := false;
  end if;

  update public.rooms set last_activity_at = now() where id = p_room_id;

  return jsonb_build_object(
    'id',              v_room.id,
    'projectName',     v_room.project_name,
    'facilitatorName', v_room.facilitator_name,
    'deckType',        v_room.deck_type,
    'createdAt',       public.iso_utc(v_room.created_at),
    'isFacilitator',   v_is_facilitator
  );
end;
$$;

-- Heartbeat: só membros da sala mantêm a sala viva.
create or replace function public.touch_room(p_room_id text)
returns void
language plpgsql volatile security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (
    select 1 from public.room_members where room_id = p_room_id and user_id = auth.uid()
  ) then
    raise exception 'forbidden';
  end if;
  update public.rooms set last_activity_at = now() where id = p_room_id;
end;
$$;

create or replace function public.start_round(p_room_id text, p_ticket_code text)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_round jsonb;
begin
  perform public.assert_facilitator(p_room_id);
  v_round := public.new_round(public.clean_ticket_code(p_ticket_code));
  update public.rooms set last_activity_at = now() where id = p_room_id;
  perform public.broadcast_room_event(
    p_room_id, jsonb_build_object('type', 'round_started', 'round', v_round)
  );
  return v_round;
end;
$$;

create or replace function public.reveal_round(p_room_id text, p_round_id uuid)
returns text
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_revealed_at text := public.iso_utc(clock_timestamp());
begin
  perform public.assert_facilitator(p_room_id);
  if p_round_id is null then
    raise exception 'invalid_input';
  end if;
  update public.rooms set last_activity_at = now() where id = p_room_id;
  perform public.broadcast_room_event(
    p_room_id,
    jsonb_build_object('type', 'reveal_requested', 'roundId', p_round_id, 'revealedAt', v_revealed_at)
  );
  return v_revealed_at;
end;
$$;

create or replace function public.close_room(p_room_id text)
returns void
language plpgsql volatile security definer
set search_path = ''
as $$
begin
  perform public.assert_facilitator(p_room_id);
  perform public.broadcast_room_event(
    p_room_id, jsonb_build_object('type', 'room_closed', 'reason', 'manual')
  );
  delete from public.rooms where id = p_room_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Expurgo (chamado só pelo pg_cron — ver 0002_cron.sql)
-- -----------------------------------------------------------------------------
create or replace function public.purge_inactive_rooms()
returns integer
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select id from public.rooms where last_activity_at < now() - interval '1 hour'
  loop
    perform public.broadcast_room_event(
      r.id, jsonb_build_object('type', 'room_closed', 'reason', 'inactivity')
    );
    delete from public.rooms where id = r.id;
    v_count := v_count + 1;
  end loop;

  delete from public.room_creations where created_at < now() - interval '1 day';
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões das funções: por padrão o Postgres dá EXECUTE a PUBLIC.
-- Só as RPCs da aplicação ficam disponíveis, e só para `authenticated`
-- (sessões anônimas do Supabase Auth também usam esse papel).
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.create_room(text, text, text, text) to authenticated;
grant execute on function public.join_room(text)                     to authenticated;
grant execute on function public.touch_room(text)                    to authenticated;
grant execute on function public.start_round(text, text)             to authenticated;
grant execute on function public.reveal_round(text, uuid)            to authenticated;
grant execute on function public.close_room(text)                    to authenticated;

-- -----------------------------------------------------------------------------
-- Realtime Authorization (canais privados `room:{id}`)
-- -----------------------------------------------------------------------------
create or replace function public.is_room_topic_member(p_topic text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.room_members m
    where m.user_id = auth.uid() and 'room:' || m.room_id = p_topic
  );
$$;
grant execute on function public.is_room_topic_member(text) to authenticated;

-- Membros recebem broadcast (eventos do banco) e presence da própria sala.
create policy "poker members receive room messages"
on realtime.messages for select to authenticated
using (
  realtime.messages.extension in ('broadcast', 'presence')
  and public.is_room_topic_member((select realtime.topic()))
);

-- Membros só podem PUBLICAR presence. Broadcast enviado pelo navegador é
-- negado — eventos de controle só saem das RPCs acima.
create policy "poker members track presence"
on realtime.messages for insert to authenticated
with check (
  realtime.messages.extension = 'presence'
  and public.is_room_topic_member((select realtime.topic()))
);
