-- MenuClick + Supabase: configuração inicial simples
-- Abra o Supabase > SQL Editor > New query > cole tudo > Run.

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Remove políticas antigas com o mesmo nome, se existirem.
drop policy if exists "menuclick_app_state_select" on public.app_state;
drop policy if exists "menuclick_app_state_insert" on public.app_state;
drop policy if exists "menuclick_app_state_update" on public.app_state;

-- MODO INICIANTE:
-- Permite que o app leia e atualize apenas a linha principal do MenuClick.
-- Funciona para testar sem login. Para produção, troque por login + permissões por restaurante.
create policy "menuclick_app_state_select"
on public.app_state
for select
to anon, authenticated
using (id = 'menuclick-main');

create policy "menuclick_app_state_insert"
on public.app_state
for insert
to anon, authenticated
with check (id = 'menuclick-main');

create policy "menuclick_app_state_update"
on public.app_state
for update
to anon, authenticated
using (id = 'menuclick-main')
with check (id = 'menuclick-main');

insert into public.app_state (id, data)
values ('menuclick-main', '{}'::jsonb)
on conflict (id) do nothing;

-- Opcional: buckets para uma versão futura com imagens reais no Storage.
-- A versão deste ZIP ainda salva as imagens dentro do JSON/localStorage para facilitar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('menuclick-products', 'menuclick-products', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('menuclick-reviews', 'menuclick-reviews', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('menuclick-banners', 'menuclick-banners', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
