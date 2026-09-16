# SPEC 09 — Login real y protección de rutas

> **Status:** Aprobado
> **Depends on:** SPEC 03, SPEC 07, SPEC 08
> **Date:** 2026-09-16
> **Objective:** Conectar `/login` a Supabase Auth con email y contraseña, proteger `/`, `/kids` y `/kids/[slug]` (redirect optimista en `proxy.ts` + `getClaims()` server-side), cerrar sesión desde el sidebar y mostrar el usuario real de `public.users` en la UI, agregando las migraciones de `auth.identities` y de la política RLS de lectura propia.

## Scope

**In:**

- `supabase/migrations/<v1>_seed_staff_email_identity.sql`: espejo del SQL aplicado vía MCP; inserta la identidad `email` del usuario `22222222-…` en `auth.identities` para que `signInWithPassword` funcione con `ysrael@google.com` / `123456789@`.
- `supabase/migrations/<v2>_users_select_own_policy.sql`: espejo de la política RLS `users_select_own` (`select`, rol `authenticated`, `(select auth.uid()) = id`).
- MCP `apply_migration` con nombres `seed_staff_email_identity` y `users_select_own_policy`.
- `utils/auth.ts`: helper `getCurrentUser()` (memoizado con `cache`) que resuelve sesión + perfil.
- `app/login/actions.ts` (`"use server"`): `signIn` (`signInWithPassword`) y `signOut` (`signOut` + redirect a `/login`).
- `components/LoginForm.tsx` (`"use client"`): formulario real con `useActionState`, conservando el markup exacto de la columna derecha de `/login` (labels EMAIL/CONTRASEÑA, CTA degradado, footer).
- `app/login/page.tsx`: sigue siendo server component; columna de marca intacta, columna derecha pasa a `<LoginForm />`; si ya hay sesión, redirige a `/`.
- `utils/supabase/proxy.ts` y `proxy.ts`: `updateSession` usa el resultado de `getClaims()` para redirigir.
- Rutas protegidas: `/`, `/kids`, `/kids/[slug]`. Rutas públicas: `/login`, `/activar-cuenta`.
- `app/page.tsx`, `app/kids/page.tsx`, `app/kids/[slug]/page.tsx`: async, `getCurrentUser()` + `redirect("/login")` si no hay sesión, y pasan el usuario real a `Sidebar`.
- `components/Sidebar.tsx`: recibe `user` por prop (deja de importar `currentUser` del mock) y el `LogoutIcon` pasa a ser un `<form action={signOut}>`.
- Saludo del feed ("Buenas, {nombre}") y avatar de la fila "Compartí un momento…" con el usuario real.
- Eliminación del export `currentUser` de `data/mock/feed.ts` (queda sin consumidores).
- Copy de errores en español; etiquetas de rol traducidas en UI (`staff` → "Guardería", `parent` → "Familia", `admin` → "Administración").

**Out of scope (specs futuras):**

- Registro/signup y `/activar-cuenta` real (requiere `invitations`, `children`, `parent_children`).
- Login con Google/OAuth, magic link, recuperación de contraseña real ("¿Olvidaste tu contraseña?" sigue decorativo).
- Navegación entre `/login` y `/activar-cuenta` (siguen sin enlaces, como en SPEC 03).
- Políticas RLS de escritura (`update`/`insert`/`delete`) y autorización por tenant/rol.
- Leer o persistir `notify_on_post` / `daily_summary_enabled`; usar `avatar_url` (el seed no la tiene).
- Conectar el feed, los niños y los modales a la base de datos real.
- Responsive móvil.
- Trigger `AFTER INSERT` sobre `auth.users`.

## Data model

Migración 1 — identidad email del usuario staff (mismo UUID de SPEC 08):

```sql
-- supabase/migrations/<v1>_seed_staff_email_identity.sql
insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
values (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object(
    'sub', '22222222-2222-2222-2222-222222222222',
    'email', 'ysrael@google.com',
    'email_verified', true
  ),
  'email',
  '22222222-2222-2222-2222-222222222222',
  now(), now(), now()
);
```

Notas verificadas contra la base real: en este proyecto `auth.identities` tiene `id uuid` PK, `provider_id text not null`, `unique (provider_id, provider)` y `email` como columna **generada** (`lower(identity_data->>'email')`), por eso `email` no se incluye en el `insert`.

Migración 2 — lectura del perfil propio:

```sql
-- supabase/migrations/<v2>_users_select_own_policy.sql
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);
```

Contrato de aplicación (`utils/auth.ts`):

```ts
export type UserRole = "staff" | "parent" | "admin";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  role: UserRole | null;
  roleLabel: string;
  avatarColor: string;
  avatarTextColor: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  staff: "Guardería",
  parent: "Familia",
  admin: "Administración",
};

const AVATAR_PALETTE = [
  { bg: "#F2937A", text: "#FFFFFF" },
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#CFEBD8", text: "#3E9B6C" },
  { bg: "#E7DCF6", text: "#7B5FC0" },
  { bg: "#F9D2DE", text: "#C56486" },
];
```

`getCurrentUser()` usa `getClaims()`; con sesión consulta `public.users` (`id`, `full_name`, `role`, `avatar_url`) con `.eq("id", claims.sub).maybeSingle()`; `initials` = iniciales de `full_name`; color = índice estable derivado de los códigos de `id` sobre `AVATAR_PALETTE`. **Degradación:** si no hay fila en `public.users`, devuelve `fullName` = parte local del email, `initials` de ese texto, `role: null`, `roleLabel: "Cuenta"`. Sin sesión devuelve `null`.

## Implementation plan

1. Aplicar MCP `apply_migration(name: "seed_staff_email_identity", query: <migración 1>)`, capturar la versión y crear el espejo `supabase/migrations/<v1>_seed_staff_email_identity.sql`. Verificar con `execute_sql`: exactamente 1 fila en `auth.identities` con `user_id = 22222222-…`, `provider = 'email'`, `provider_id = 22222222-…`, `identity_data->>'email' = 'ysrael@google.com'` y `email = 'ysrael@google.com'`. Verificar el login real contra la API de Auth (`POST /auth/v1/token?grant_type=password` con `NEXT_PUBLIC_SUPABASE_URL` + publishable key y las credenciales de prueba) → devuelve `access_token`.
2. Aplicar MCP `apply_migration(name: "users_select_own_policy", query: <migración 2>)`, capturar la versión y crear el espejo `<v2>_users_select_own_policy.sql`. Verificar: `pg_policies` tiene exactamente una política `users_select_own` (`cmd = 'SELECT'`, `roles = {authenticated}`) en `public.users`, y `get_advisors(type: "security")` no suma WARN/ERROR.
3. Crear `utils/auth.ts` con `CurrentUser`, `ROLE_LABELS`, `AVATAR_PALETTE` y `getCurrentUser()` (memoizado con `cache` de React). Verificar: `npx tsc --noEmit`.
4. Crear `app/login/actions.ts` con `signIn(state, formData)` (valida email/contraseña no vacíos, `signInWithPassword`, error en español → `{ error }`, éxito → `revalidatePath("/", "layout")` + `redirect("/")` fuera del `try/catch`) y `signOut()` (`supabase.auth.signOut()` + `redirect("/login")`). Verificar: `npx tsc --noEmit`.
5. Crear `components/LoginForm.tsx` (`"use client"`, `useActionState(signIn, undefined)`) reusando el markup/clases de la columna derecha de `app/login/page.tsx`, con `name="email"` / `name="password"`, `required`, mensaje de error inline (`#C5503A`), CTA `disabled` + "Ingresando…" mientras `pending`; "¿Olvidaste tu contraseña?" y el footer quedan decorativos. Refactorizar `app/login/page.tsx` para renderizar `<LoginForm />` y redirigir a `/` si `getCurrentUser()` no es `null`. Verificar: `/login` a 1280×800 sigue igual al mockup de SPEC 03 y `npx tsc --noEmit`.
6. Modificar `utils/supabase/proxy.ts` y `proxy.ts`: tras `getClaims()`, si no hay claims y el path no es `/login` ni `/activar-cuenta` → `NextResponse.redirect('/login')`; si hay claims y el path es `/login` → redirect a `/`. Verificar con el servidor de desarrollo: sin sesión `/`, `/kids` y `/kids/[slug]` caen en `/login`; `/login` y `/activar-cuenta` responden 200; con sesión `/login` cae en `/`.
7. Conectar el usuario real: `app/page.tsx`, `app/kids/page.tsx` y `app/kids/[slug]/page.tsx` pasan a `async` con `getCurrentUser()` + `redirect("/login")` si es `null` y pasan `user` a `<Sidebar user={user} />`; `components/Sidebar.tsx` tipa la prop y envuelve el botón de logout en `<form action={signOut}>`; eliminar `currentUser` de `data/mock/feed.ts` y sus usos. Verificar: el sidebar muestra "Ysrael" + "Guardería" + iniciales "Y", y `/`, `/kids`, `/kids/[slug]` siguen idénticos a `references/`.
8. Pase final: `npm run lint` + `npx tsc --noEmit` y verificación con Playwright de los cuatro flujos (redirect sin sesión, error inline con credenciales inválidas, login correcto hasta `/`, logout de vuelta a `/login`).

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] `list_migrations` incluye `seed_staff_email_identity` y `users_select_own_policy`, con espejos en `supabase/migrations/` de la misma versión y el mismo SQL.
- [ ] Existe exactamente 1 fila en `auth.identities` con `user_id = 22222222-…`, `provider = 'email'`, `provider_id = 22222222-…` y `email = 'ysrael@google.com'`.
- [ ] `POST /auth/v1/token?grant_type=password` con `ysrael@google.com` / `123456789@` devuelve `access_token`.
- [ ] `public.users` tiene exactamente una política RLS (`users_select_own`, `select`, rol `authenticated`, `(select auth.uid()) = id`) y `get_advisors(type: "security")` no reporta WARN/ERROR nuevos.
- [ ] Sin sesión, `/`, `/kids` y `/kids/[slug]` redirigen a `/login`; `/activar-cuenta` responde 200.
- [ ] Con sesión activa, `/login` redirige a `/`.
- [ ] En `/login`, credenciales inválidas muestran un mensaje de error en español bajo el formulario, sin cambiar de URL ni romper el layout del mockup.
- [ ] Mientras el formulario se envía, el CTA "Iniciar sesión" queda deshabilitado.
- [ ] Login con `ysrael@google.com` / `123456789@` llega al feed `/`.
- [ ] El sidebar muestra `full_name` real ("Ysrael"), iniciales "Y", el label de rol traducido ("Guardería") y un color de avatar estable derivado del id.
- [ ] El botón de logout del sidebar cierra la sesión y redirige a `/login`; después, `/` vuelve a redirigir a `/login`.
- [ ] Si el usuario autenticado no tiene fila en `public.users`, la UI degrada a email/iniciales sin errores de consola.
- [ ] `data/mock/feed.ts` ya no exporta `currentUser` y ningún componente lo importa.
- [ ] `/`, `/kids` y `/kids/[slug]` a 1280×800 siguen idénticos a `references/` salvo el nombre/rol del sidebar.

## Decisions

- **Sí:** login real solo en `/login`; `/activar-cuenta` sigue decorativa (respuesta del usuario). La activación depende de `invitations`/`children`, que no existen.
- **No:** signup/registro nuevo. El alta real llegará por invitación en otra spec.
- **Sí:** migración que agrega la identidad `email` al usuario semilla (respuesta del usuario). Es la vía reproducible para que la contraseña ya creada en SPEC 08 sea utilizable.
- **No:** crear el usuario con la Admin API o un formulario de signup. Agrega una vía de creación de usuarios fuera del versionado.
- **Sí:** mantener `ysrael@google.com` / `123456789@` (respuesta del usuario). No requiere tocar `encrypted_password`.
- **No:** incluir la columna generada `email` en el `insert` de `auth.identities`. Verificado en la base real: es `GENERATED ALWAYS`.
- **Sí:** política RLS solo `select` del propio usuario (respuesta del usuario). Es lo mínimo para leer el perfil en la UI.
- **No:** `update` propio ni políticas por daycare. No hay UI que edite el perfil y la autorización por tenant va en su propia spec.
- **Sí:** `(select auth.uid())` en la política. Evita re-evaluar `auth.uid()` por fila (best practice de Postgres).
- **Sí:** protección en dos capas: redirect optimista en `proxy.ts` + `getClaims()` en cada página (respuesta del usuario). Es lo que recomiendan los docs de Next 16 (Proxy como primera barrera) y Supabase (`getClaims` para proteger datos).
- **No:** solo proxy o solo páginas. El proxy no debe ser la única defensa.
- **Sí:** `getClaims()` y no `getSession()`/`getUser()`. `getSession` no revalida el token y `getUser` hace un round-trip innecesario; `getClaims` es lo que pide AGENTS.md.
- **Sí:** rutas protegidas `/`, `/kids`, `/kids/[slug]` y públicas `/login`, `/activar-cuenta` (respuesta del usuario).
- **Sí:** usuario autenticado en `/login` redirige a `/` (respuesta del usuario). Evita el login con sesión activa.
- **Sí:** logout conectado al `LogoutIcon` del sidebar (respuesta del usuario). El botón ya existía decorativo.
- **Sí:** errores inline en español + CTA deshabilitado en `pending` (respuesta del usuario). Mantiene la estética del mockup.
- **No:** página `/error` aparte. Agrega una pantalla sin diseño de referencia.
- **Sí:** mostrar el usuario real en sidebar y feed (respuesta del usuario). Implica la política RLS y `utils/auth.ts`.
- **Sí:** degradar con email/iniciales si falta la fila en `public.users` (respuesta del usuario). Un perfil incompleto no debe bloquear la sesión.
- **Sí:** iniciales + color derivado del id (respuesta del usuario). `avatar_url` es nullable y el seed no la trae.
- **No:** usar `avatar_url`. Sin dato y sin UI de carga de imagen todavía.
- **Sí:** `signIn` y `signOut` en `app/login/actions.ts`. Un solo módulo de acciones de auth.
- **Sí:** `getCurrentUser()` en `utils/auth.ts` memoizado con `cache`. Centraliza sesión + perfil y evita duplicar el fetch por render.
- **Sí:** `Sidebar` recibe `user` por prop y sigue siendo server component. El `form action={signOut}` no requiere `"use client"`.
- **Sí:** eliminar el export `currentUser` de `data/mock/feed.ts`. Queda sin consumidores y sería dead code.
- **No:** navegación entre `/login` y `/activar-cuenta`. Se mantiene la decisión de SPEC 03 hasta que exista el flujo de invitación.
- **Sí:** spec en `specs/09-auth-login-y-proteccion-de-rutas.md` (respuesta del usuario). Es principalmente de app; las dos migraciones van dentro.
- **No:** partir la spec en `specs/database/` + `specs/`. Login, protección y perfil se verifican juntos.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Insertar en `auth.identities` por SQL no es una vía oficialmente soportada y el esquema de `auth` puede cambiar | Verificar el login contra la API de Auth en el paso 1; si falla, migrar a la Admin API. |
| La contraseña de prueba queda literal en la migración versionada | Es una credencial de desarrollo, ya documentada en SPEC 08. No usar este patrón para usuarios reales. |
| Loop de redirects entre `proxy.ts` y los chequeos de página | Definir la lista de rutas públicas en un solo lugar de `utils/supabase/proxy.ts` y probar cada ruta (protegida y pública) en el paso 6. |
| `getClaims()` cae a `getUser()` (round-trip) si el proyecto usa claves simétricas | Es el comportamiento documentado de la librería; se acepta la latencia del proxy. |
| Sin la política RLS el perfil se lee vacío y la UI degrada en silencio | El paso 2 verifica `pg_policies` y el paso 7 comprueba el nombre real en el sidebar. |
| `redirect()` dentro de un `try/catch` queda silenciado | El `redirect` de `signIn`/`signOut` va fuera del `try/catch` (paso 4). |
| Eliminar `currentUser` de `data/mock/feed.ts` rompe otro consumidor | Se verificó con grep: solo lo usan `app/page.tsx` y `components/Sidebar.tsx`, ambos en el paso 7. |
| El formulario deja de parecerse al mockup al volverse cliente | `LoginForm.tsx` reusa las clases exactas del markup actual y se compara con el mockup en el paso 5. |
| Reintentar la migración de identidad duplica la fila | `unique (provider_id, provider)` y PK en `id` hacen fallar el segundo intento. |
| Los cookies de sesión (httpOnly) complican la verificación con Playwright | Verificar el flujo completo por UI (login → `/` → logout → `/login`), no por inspección de cookies. |

## What is **not** in this spec

- Registro/signup y activación real de cuenta (`/activar-cuenta` sigue decorativa).
- OAuth, magic link y recuperación de contraseña real.
- Navegación entre `/login` y `/activar-cuenta`.
- Políticas RLS de escritura y autorización por tenant/rol.
- Persistir o editar preferencias del perfil (`notify_on_post`, `daily_summary_enabled`, `avatar_url`).
- Conectar feed, niños y modales a la base de datos real.
- Trigger `AFTER INSERT` sobre `auth.users`.
- Responsive móvil.

Cada uno de esos, si llega, va en su propia spec.
