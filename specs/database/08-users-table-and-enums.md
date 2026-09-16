# SPEC 08 — Tabla `users` y enums `user_role` / `user_status`

> **Status:** Implementado
> **Depends on:** SPEC 07
> **Date:** 2026-09-16
> **Objective:** Crear en Supabase los enums `user_role` y `user_status` y la tabla `public.users` (perfil de dominio vinculado a `auth.users`, con varios usuarios por daycare), con RLS habilitado sin políticas, trigger de `updated_at` e índice en `daycare_id`, más un seed de un usuario staff de prueba.

## Scope

**In:**

- `supabase/migrations/<v1>_create_user_enums_and_users.sql`: espejo del SQL aplicado vía MCP.
- `supabase/migrations/<v2>_seed_staff_user.sql`: espejo del seed aplicado vía MCP.
- MCP `apply_migration` con nombres `create_user_enums_and_users` y `seed_staff_user`.
- Enums `public.user_role` (`staff`, `parent`, `admin`) y `public.user_status` (`pending`, `active`).
- Tabla `public.users` con las 10 columnas del doc de referencia, PK/FK a `auth.users(id)` `ON DELETE CASCADE` y FK `daycare_id` a `public.daycares(id)`.
- RLS habilitado en `public.users` **sin políticas** (acceso denegado a `anon`/`authenticated`).
- Índice `users_daycare_id_idx` sobre `daycare_id`.
- Función genérica `public.set_updated_at()` + trigger `users_set_updated_at` (`before update`).
- Seed del usuario staff `ysrael@google.com` (fila en `auth.users` + fila en `public.users`).
- Verificación con `execute_sql` y `get_advisors(type: "security")`.

**Out of scope (specs futuras):**

- Trigger `AFTER INSERT` sobre `auth.users` y la función `SECURITY DEFINER` que auto-crea el perfil (el doc lo sugiere, pero se difiere).
- Fila en `auth.identities`: el login email/password real queda pendiente.
- Los otros 4 enums (`relationship_type`, `invitation_status`, `post_type`, `child_status`) y las otras 11 tablas.
- Políticas RLS y autorización por tenant.
- Cliente Supabase/SSR en Next.js (`lib/supabase`, `@supabase/ssr`, `NEXT_PUBLIC_*`).
- Conectar `/login` y `/activar-cuenta` a auth real (siguen decorativas).
- Seeds adicionales (padres, niños, etc.).

## Data model

```sql
-- supabase/migrations/<v1>_create_user_enums_and_users.sql
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.users (
  id                    uuid primary key references auth.users (id) on delete cascade,
  daycare_id            uuid not null references public.daycares (id),
  role                  public.user_role not null,
  status                public.user_status not null default 'active',
  full_name             text not null,
  avatar_url            text,
  notify_on_post        boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index users_daycare_id_idx on public.users (daycare_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

alter table public.users enable row level security;
```

```sql
-- supabase/migrations/<v2>_seed_staff_user.sql
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'ysrael@google.com',
  extensions.crypt('123456789@', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Ysrael"}'::jsonb,
  now(),
  now()
);

insert into public.users (id, daycare_id, role, status, full_name)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'staff',
  'active',
  'Ysrael'
);
```

Convenciones: identificadores en minúsculas/`snake_case`; PK `uuid` = mismo UUID que `auth.users`; UUIDs fijos en los seeds para reproducibilidad; lo persistido en inglés.

## Implementation plan

1. Aplicar la migración 1 con MCP `apply_migration(name: "create_user_enums_and_users", query: <DDL>)` y capturar la versión devuelta. Verificar: `list_migrations` incluye el nombre; `execute_sql` confirma los dos enums y la tabla.
2. Crear `supabase/migrations/<v1>_create_user_enums_and_users.sql` con el SQL exacto y la versión del paso 1. Verificar: el prefijo coincide con `list_migrations`.
3. Verificar estructura con `execute_sql`: columnas/tipos/`not null`/defaults, PK, FKs (`auth.users` cascade, `daycares` no action), `relrowsecurity = true`, cero filas en `pg_policies` para `users`, índice `users_daycare_id_idx` y trigger `users_set_updated_at`. Verificar el trigger con un `UPDATE` de verificación sin cambio de contenido (`set full_name = full_name`) y comprobar que `updated_at` avanzó.
4. Aplicar la migración 2 con MCP `apply_migration(name: "seed_staff_user", query: <seed>)` y capturar la versión. Verificar: existe la fila en `auth.users` y en `public.users`.
5. Crear `supabase/migrations/<v2>_seed_staff_user.sql` con el SQL exacto y la versión del paso 4.
6. Verificar el seed: exactamente una fila en `auth.users` con `email = 'ysrael@google.com'`, `encrypted_password` no nulo y `extensions.crypt('123456789@', encrypted_password) = encrypted_password`; exactamente una fila en `public.users` con `id = 22222222-…`, `full_name = 'Ysrael'`, `role = 'staff'`, `status = 'active'`, `daycare_id = 11111111-…`.
7. Correr `get_advisors(type: "security")` (sin WARN/ERROR nuevos; el INFO `rls_enabled_no_policy` es esperado) y confirmar que `npm run lint` y `npx tsc --noEmit` siguen pasando (no se tocó código de la app).

## Acceptance criteria

- [x] `list_migrations` incluye `create_user_enums_and_users` y `seed_staff_user`.
- [x] Existen los espejos `supabase/migrations/<v1>_create_user_enums_and_users.sql` y `<v2>_seed_staff_user.sql` con versión igual a la remota y el mismo SQL.
- [x] `public.user_role` existe con exactamente `staff`, `parent`, `admin` (en ese orden).
- [x] `public.user_status` existe con exactamente `pending`, `active` (en ese orden).
- [x] `public.users` existe con `id`, `daycare_id`, `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at`, `updated_at` y los tipos del doc.
- [x] `id` es PK con FK a `auth.users(id)` `ON DELETE CASCADE`.
- [x] `daycare_id` es `not null` con FK a `public.daycares(id)`.
- [x] `status` default `'active'`; `notify_on_post` y `daily_summary_enabled` default `true`; `created_at`/`updated_at` default `now()`; `avatar_url` nullable.
- [x] `public.users` tiene RLS habilitado (`relrowsecurity = true`) y **cero** políticas en `pg_policies`.
- [x] Existe el índice `users_daycare_id_idx` sobre `daycare_id`.
- [x] Existe el trigger `users_set_updated_at` y un `UPDATE` hace avanzar `updated_at`.
- [x] `public.set_updated_at()` existe con `search_path` fijado en `''`.
- [x] Existe exactamente una fila en `auth.users` con `email = 'ysrael@google.com'` y `encrypted_password` no nulo.
- [x] La contraseña `123456789@` verifica contra `encrypted_password` (`extensions.crypt(...) = encrypted_password`).
- [x] Existe exactamente una fila en `public.users` con `id = 22222222-2222-2222-2222-222222222222`, `full_name = 'Ysrael'`, `role = 'staff'`, `status = 'active'`, `daycare_id = 11111111-1111-1111-1111-111111111111`.
- [x] `get_advisors(type: "security")` no reporta avisos WARN/ERROR nuevos sobre `users` (el INFO `rls_enabled_no_policy` es esperado).
- [x] `npm run lint` y `npx tsc --noEmit` siguen pasando.

## Decisions

- **Sí:** solo enums + tabla, sin trigger `AFTER INSERT` sobre `auth.users` (respuesta del usuario). Mantiene la spec en un dominio y el trigger va con el flujo de signup.
- **No:** incluir el trigger del doc ahora. Requiere decidir el contrato de `raw_user_meta_data`, que pertenece a la spec de auth.
- **Sí:** solo `user_role` y `user_status` (respuesta del usuario). Los otros 4 enums pertenecen a tablas que no existen.
- **Sí:** `daycare_id not null` (respuesta del usuario). Modela "un usuario pertenece a una guardería".
- **No:** `daycare_id` nullable. Agregaría un caso de borde (admin global) sin uso hoy.
- **Sí:** RLS habilitado sin políticas (respuesta del usuario). Consistente con `daycares` de SPEC 07; no hay cliente ni auth en la app.
- **No:** políticas propias o por daycare. Sin `auth.uid()` consumido todavía, serían código muerto y superficie de error.
- **Sí:** las 10 columnas del doc (respuesta del usuario). Evita migraciones correctivas cuando la UI las pida.
- **No:** duplicar `email` en `public.users`. Ya vive en `auth.users`; el doc lo prohíbe explícitamente.
- **Sí:** trigger `updated_at` + índice `daycare_id` (respuesta del usuario). Práctica estándar de Postgres y costo nulo.
- **Sí:** función genérica `public.set_updated_at()` reutilizable por futuras tablas, en vez de una función por tabla.
- **Sí:** `set search_path = ''` en la función. Evita el advisor `function_search_path_mutable` sin cambiar el comportamiento.
- **No:** `ON DELETE CASCADE` en `daycare_id`. El default `NO ACTION` evita borrar una guardería con usuarios.
- **Sí:** dos migraciones separadas (respuesta del usuario): estructura vs. seed. El seed de demo no ensucia la migración de esquema.
- **Sí:** seed del staff `ysrael@google.com` / `full_name = 'Ysrael'` / `role = 'staff'` / `status = 'active'` (respuesta del usuario).
- **No:** fila en `auth.identities` (respuesta del usuario). El login email/password no funcionará hasta que se agregue.
- **Sí:** UUID fijo `22222222-…` para el staff y el daycare `11111111-…` de SPEC 07. Reproducible y detectable si se reintenta.
- **Sí:** contraseña encriptada con `extensions.crypt`/`gen_salt('bf')`. Es el mismo algoritmo de Supabase Auth, así que la contraseña queda usable a futuro.
- **Sí:** `raw_user_meta_data` mínimo (`{"full_name":"Ysrael"}`), sin `role`/`daycare_id`. AGENTS.md prohíbe decidir autorización con `user_metadata`.
- **Sí:** `email_confirmed_at = now()`. Deja la cuenta confirmada para cuando exista login real.
- **No:** cliente Supabase/SSR en la app. Ya quedó fuera en SPEC 07; esta spec es solo base de datos.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Insertar en `auth.users` por SQL no es una vía oficialmente soportada por Supabase (la recomendada es la Admin API) y el esquema de `auth` puede cambiar | Verificar con `execute_sql` que la fila y la contraseña quedan válidas; si cambia, migrar a la Admin API cuando exista el cliente. |
| La contraseña de prueba queda literal en la migración versionada del repo | Es una credencial de desarrollo local, no una clave de servicio; documentado aquí. No usar este patrón para usuarios reales. |
| El seed falla si el daycare `11111111-…` no existe (SPEC 07) | Verificar `select 1 from public.daycares where id = '11111111-…'` antes de aplicar la migración 2. |
| `create or replace function public.set_updated_at()` puede chocar si otra spec define el mismo nombre con otra firma | Nombre y firma documentados aquí; las specs futuras reutilizan esta función en lugar de redefinirla. |
| El `UPDATE` de verificación del trigger modifica `updated_at` de la fila del staff | Es un update sin cambio de contenido (`full_name = full_name`); no altera datos de negocio. |
| RLS sin políticas bloquea todo acceso vía Data API | Esperado y documentado; se habilita cuando existan las políticas de tenant. |
| El advisor reporta `rls_enabled_no_policy` como INFO | Ya es el estado esperado en `daycares`; no se considera regresión. |
| Reintentar el seed duplicaría filas | La PK del UUID fijo hace fallar el segundo intento; el daycare de SPEC 07 ya usa el mismo criterio. |

## What is **not** in this spec

- Trigger `AFTER INSERT` sobre `auth.users` y su función `SECURITY DEFINER`.
- Fila en `auth.identities` (login email/password real).
- Los otros 4 enums y las otras 11 tablas del esquema.
- Políticas RLS y autorización por tenant.
- Cliente Supabase/SSR en Next.js y variables de entorno.
- Conectar `/login` y `/activar-cuenta` a auth real.
- Seeds adicionales.

Cada uno de esos, si llega, va en su propia spec.
