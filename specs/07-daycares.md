# SPEC 07 — Tabla `daycares` y patrón de migraciones

> **Status:** Aprobado
> **Date:** 2026-09-12
> **Objective:** Crear la tabla `daycares` en Supabase aplicando el primer patrón de migraciones versionado (archivo en `supabase/migrations/` espejo de la migración aplicada vía MCP), con RLS habilitado y una fila semilla de la guardería de los mockups.

## Scope

**In:**

- `supabase/README.md`: documenta el patrón de migraciones (ubicación, nombre, aplicación vía MCP, espejo del SQL, RLS obligatorio, verificación).
- `supabase/migrations/<version>_create_daycares.sql`: SQL versionado en el repo, con la **misma versión** que registra la MCP al aplicar.
- Tabla `public.daycares` en el proyecto Supabase remoto, vía MCP `apply_migration` con nombre `create_daycares`.
- RLS habilitado en `public.daycares` **sin políticas** (acceso denegado a `anon`/`authenticated`).
- Una fila semilla: `id = 11111111-1111-1111-1111-111111111111`, `name = "Guardería Sala Soles"`.
- Verificación con `execute_sql` y `get_advisors(type: "security")`.

**Out of scope (specs futuras):**

- El resto de las 12 tablas del esquema (`users`, `rooms`, `children`, `parent_children`, `invitations`, `posts`, `post_children`, `post_photos`, `reactions`, `comments`, `daily_summaries`, `devices`).
- Auth, trigger `AFTER INSERT` en `auth.users` y la tabla `users`.
- Cliente Supabase/SSR en Next.js (`lib/supabase`, `@supabase/ssr`) y variables `NEXT_PUBLIC_*`.
- Políticas RLS por tenant (dependen de `users`).
- Grants/roles explícitos más allá de los defaults de Supabase.
- Seeds de datos de mock adicionales.

## Data model

```sql
-- supabase/migrations/<version>_create_daycares.sql
create table public.daycares (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

alter table public.daycares enable row level security;

insert into public.daycares (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Guardería Sala Soles');
```

Convenciones:

- Identificadores en minúsculas (best practice de Postgres).
- PK `uuid` con `default gen_random_uuid()`, según el doc de referencia y para mantener consistencia con las FKs `uuid` del resto del esquema.
- Sin `updated_at`: el doc de referencia solo lista `id`, `name`, `created_at` para `daycares`.
- Seed con UUID fijo para que sea reproducible e idempotente por inspección.

## Implementation plan

1. Crear `supabase/README.md` con el patrón: carpeta `supabase/migrations/`, archivo `<version>_<snake_case_name>.sql`, aplicar con MCP `apply_migration` usando el mismo `<name>`, espejar el SQL exacto, RLS obligatorio y verificación con `execute_sql` + `get_advisors`. Verificar: el archivo existe y describe los cuatro pasos.
2. Aplicar la migración con MCP `apply_migration(name: "create_daycares", query: <DDL de arriba>)` y capturar la versión devuelta. Verificar: `list_migrations` incluye `create_daycares`.
3. Crear `supabase/migrations/<version>_create_daycares.sql` con el SQL exacto aplicado, usando la versión del paso 2. Verificar: el prefijo del archivo coincide con la versión de `list_migrations`.
4. Verificar el esquema con `execute_sql`: columnas, tipos, `not null`, PK y `relrowsecurity = true` en `public.daycares`.
5. Verificar el seed con `execute_sql`: `select id, name from public.daycares;` devuelve exactamente una fila.
6. Correr `get_advisors(type: "security")` y confirmar que no hay avisos nuevos sobre `daycares`. Confirmar que `npm run lint` y `npx tsc --noEmit` siguen pasando (no se tocó código de la app).

## Acceptance criteria

- [x] `supabase/README.md` existe y describe el patrón (ubicación, nombre `<version>_snake_case.sql`, aplicación vía MCP, espejo del SQL, RLS obligatorio).
- [x] `list_migrations` incluye una migración llamada `create_daycares`.
- [x] Existe `supabase/migrations/<version>_create_daycares.sql` con el mismo SQL y `<version>` igual a la de la migración remota.
- [x] `public.daycares` existe con columnas `id uuid`, `name text not null`, `created_at timestamptz not null default now()`.
- [x] `id` es primary key con default `gen_random_uuid()`.
- [x] `public.daycares` tiene RLS habilitado (`relrowsecurity = true`).
- [x] No existe ninguna política RLS en `daycares` (acceso denegado a `anon`/`authenticated`).
- [x] Existe exactamente una fila con id `11111111-1111-1111-1111-111111111111` y name `Guardería Sala Soles`.
- [x] `get_advisors(type: "security")` no reporta avisos WARN/ERROR nuevos sobre `daycares`; el INFO `rls_enabled_no_policy` es esperado mientras RLS esté habilitado sin políticas.
- [x] `npm run lint` y `npx tsc --noEmit` siguen pasando.

## Decisions

- **Sí:** solo la tabla `daycares`; el resto del esquema va en specs futuras. Mantiene la spec en una frase y un solo dominio.
- **No:** crear las 13 tablas de una vez. Sería una spec demasiado grande.
- **Sí:** MCP `apply_migration` + archivo espejo en `supabase/migrations/`. Deja historial tanto en la DB como versionado en el repo.
- **No:** solo MCP sin archivo. El historial no quedaría en el repo.
- **No:** instalar Supabase CLI local. Setup extra que hoy no se necesita; la MCP ya está conectada.
- **Sí:** RLS habilitado sin políticas. Bloquea todo acceso vía Data API hasta que exista el modelo de autorización (`users`).
- **No:** lectura para `authenticated` o pública. Todavía no hay modelo de autorización ni auth implementada.
- **Sí:** seed con UUID fijo `11111111-1111-1111-1111-111111111111`. Reproducible y detectable si se reintenta.
- **No:** UUID autogenerado en el seed. Rompería la reproducibilidad.
- **Sí:** PK `uuid default gen_random_uuid()`. Coincide con el doc de referencia y con las FKs `uuid` del resto del esquema.
- **No:** `bigint identity`. Mejor localidad de índice, pero rompería la consistencia de FKs del esquema.
- **No:** `updated_at`. El doc no lo lista para `daycares`.
- **Sí:** `name not null` y `created_at default now()`. El doc no marca nulos y toda guardería necesita nombre.
- **Sí:** documentar el patrón en `supabase/README.md`. Queda junto al código que describe.
- **No:** `AGENTS.md` para el patrón. Evita cargar el archivo global del agente con detalle de un solo proyecto.
- **Sí:** nombre de archivo con la versión de la MCP. Repo y DB quedan sincronizados.
- **No:** numeración secuencial manual. Puede desincronizarse de la versión remota.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| La MCP registra la versión al aplicar y el archivo del repo debe usar esa misma versión | Capturar la versión que devuelve `apply_migration` y nombrar el archivo en el paso 3. |
| `gen_random_uuid()` no disponible | Está en core de Postgres 13+; verificar con `execute_sql` que el default quedó aplicado. |
| RLS sin políticas sorprende al construir el frontend | Documentado: el acceso se habilita en la spec de `users`/auth; hoy no hay consumidor. |
| Los grants por defecto a `anon`/`authenticated` varían según Data API settings | Con RLS habilitado y sin políticas todo acceso es denegado; confirmar con el advisor de seguridad. |
| Reintentar la migración duplicaría tabla o seed | `create table` falla si ya existe; el seed usa UUID fijo para detectar duplicados. |

## What is **not** in this spec

- El resto de tablas del esquema.
- Auth, trigger `AFTER INSERT` en `auth.users` y la tabla `users`.
- Cliente Supabase/SSR en Next.js y variables de entorno.
- Políticas RLS por tenant.
- Seeds adicionales.
- Grants/roles explícitos.

Cada uno de esos, si llega, va en su propia spec.
