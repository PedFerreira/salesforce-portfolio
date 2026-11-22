-- =============================================================================
-- Tarefas agendadas (pg_cron) — rodam dentro do próprio banco, sem servidor.
-- Se o comando abaixo falhar, habilite antes em:
--   Dashboard -> Integrations -> Cron (ou Database -> Extensions -> pg_cron)
-- =============================================================================
create extension if not exists pg_cron;

-- A cada 15 min: encerra salas sem atividade há mais de 1h (avisa quem ainda
-- estiver conectado via evento `room_closed`) e limpa o log de rate limit.
select cron.schedule(
  'poker-purge-inactive-rooms',
  '*/15 * * * *',
  $$ select public.purge_inactive_rooms(); $$
);

-- Diariamente: remove sessões anônimas com mais de 7 dias (as salas e
-- vínculos delas já terão sido expurgados por inatividade).
select cron.schedule(
  'poker-purge-anonymous-users',
  '30 3 * * *',
  $$ delete from auth.users where is_anonymous is true and created_at < now() - interval '7 days'; $$
);
