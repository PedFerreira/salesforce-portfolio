# Planning Poker

Ferramenta gratuita de estimativa colaborativa para times ágeis, publicada em
**[pedroferreira.site/poker](https://pedroferreira.site/poker/)**. O
facilitador cria uma sala, compartilha o link e o time vota em tempo real —
sem cadastro.

**Stack:** Next.js 16 (export estático) · React 19 · Tailwind 4 · shadcn ·
Supabase (Postgres + Auth anônimo + Realtime) · Cloudflare Turnstile.

## Arquitetura

Não existe servidor de aplicação. O Next.js gera HTML/JS estático, servido
pelo GitHub Pages junto com o portfólio, e o navegador fala direto com o
Supabase:

| Peça | Onde |
|---|---|
| Regras de negócio (criar sala, entrar, nova rodada, revelar, encerrar) | Funções `security definer` no Postgres, chamadas via RPC — [`supabase/migrations/0001_schema.sql`](supabase/migrations/0001_schema.sql) |
| Identidade do navegador | Sessão **anônima** do Supabase Auth, criada só após o **Turnstile** validar que é humano |
| Votação ao vivo | Supabase Realtime em **canal privado** `room:{id}` (Presence) |
| Eventos de controle | Enviados **só pelo banco** (`realtime.send`) depois de checar que quem pediu é o facilitador |
| Limpeza | `pg_cron` no próprio banco — [`0002_cron.sql`](supabase/migrations/0002_cron.sql) |
| Ponte UI ↔ banco | [`lib/api.ts`](lib/api.ts) |

Os votos nunca vão para o banco: cada navegador guarda o próprio voto e só o
publica na presence quando o facilitador revela a rodada.

### Proteções contra abuso

- **Turnstile** antes de qualquer sessão anônima (bloqueia scripts) + limite
  nativo do Supabase de logins anônimos por IP.
- **5 salas por hora** por sessão, **200 salas ativas** no total e **50
  participantes** por sala (validados no banco).
- **Canais privados:** só membros da sala conectam; navegadores só publicam
  presence — ninguém forja "revelar", "nova rodada" ou "encerrar".
- **Heartbeat autenticado:** só membros mantêm a sala viva; salas sem
  atividade por 1h são encerradas; sessões anônimas com mais de 7 dias são
  apagadas.
- Tabelas com RLS ligada e sem policies: nada é lido/escrito direto via API
  REST, só pelas RPCs.

**Limites conhecidos:** dentro de uma sala, um participante com um cliente
modificado ainda pode mexer na própria presence (ex.: votar como
Observador). Afeta só aquela sessão, não expõe dados.

## Configuração (uma vez)

### 1. Supabase (plano Free)

1. Crie um projeto **pessoal** novo em [supabase.com](https://supabase.com).
2. **SQL Editor:** rode `supabase/migrations/0001_schema.sql` e depois
   `0002_cron.sql`. (Se o `pg_cron` reclamar, habilite em
   *Integrations → Cron* e rode de novo.)
3. **Authentication → Sign In / Providers:** ative **Allow anonymous sign-ins**.
4. **Authentication → Attack Protection:** ative **Captcha protection** com
   provedor **Turnstile** e cole a **Secret Key** do Cloudflare (passo 2).
5. **Realtime → Settings:** desative **Allow public access** (só canais
   privados passam a ser aceitos).
6. **Authentication → URL Configuration:** *Site URL* =
   `https://pedroferreira.site/poker/`.
7. Anote a **Project URL** e a chave **anon/publishable** (*Project Settings → API*).

### 2. Cloudflare Turnstile (grátis)

1. Em [dash.cloudflare.com](https://dash.cloudflare.com) → *Turnstile* → *Add widget*.
2. Hostnames: `pedroferreira.site` (e `localhost` para testes). Modo: **Managed**.
3. Copie a **Site Key** (vai no GitHub) e a **Secret Key** (vai no Supabase).

O domínio não precisa estar na Cloudflare.

### 3. GitHub

1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. *Settings → Secrets and variables → Actions → **Variables***:
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TURNSTILE_SITE_KEY`.
   São valores públicos (vão para o navegador), por isso *Variables* e não *Secrets*.
3. Faça push na `main` (ou rode o workflow **Deploy site** manualmente).

## Desenvolvimento local

```bash
cd poker-app
cp .env.example .env.local   # preencha URL/chave do Supabase
npm install
npm run dev                  # http://localhost:3000/poker
```

Sem `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, o login anônimo é feito sem captcha —
nesse caso desligue o captcha no Supabase do ambiente de teste, ou use as
[chaves de teste do Turnstile](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

Checagens: `npm run typecheck`, `npm run lint`, `npm run build` (gera `out/`).

## Plano gratuito do Supabase

- Projetos Free **pausam após ~7 dias sem atividade**. Reative pelo
  dashboard se acontecer.
- Realtime Free: até **200 conexões simultâneas** e **100 mensagens/s**.
