<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto

- Stack: Next.js 16.3.4 (App Router) + React 19 + TypeScript strict + Tailwind v4. Sin `tailwind.config.*`: el tema se declara en `app/globals.css` con `@theme`. Alias `@/*` → raíz del repo.
- La app es todavía el scaffold de `create-next-app`. Las pantallas reales (login, feed, niños, avisos…) se construyen replicando los mockups de `references/` en rutas bajo `app/`.
- UI y código en español (nombres de pantallas, copy "OpenDayCare", tipografías Fredoka/Nunito según los mockups).

## Comandos

- `npm run dev` — servidor de desarrollo.
- `npm run lint` — ESLint (config flat: `eslint.config.mjs`).
- No hay test runner configurado. No hay script de typecheck: verificar con `npx tsc --noEmit` o `npm run build`.

## Diseño de referencia

- `references/pantallas/*.dc.html` son mockups estáticos autocontenidos en formato `dc-runtime` (tags `x-dc`/`dc-import`, `support.js` generado): NO son fuentes React ni forman parte del build. Trátalos como read-only: no editar ni copiar su HTML como JSX.
- `references/screenshots/*.png` son capturas de la UI esperada. Consulta ambos antes de construir una pantalla.

## MCPs

- Playwright Screenshots y cualquier cosa relacionada a Playwright tienen que estar en la carpeta .playwright-mcp.
- Context7 usaremos este MCP para traer la documentacion actualizada del framework.
- Supabase MCP: usar sus herramientas (`execute_sql`, `apply_migration`, `list_tables`, `get_advisors`, `search_docs`, etc.) para operar la base de datos, revisar logs y consultar la documentación.

## Supabase

- Backend: Supabase (Postgres + Auth). La autenticación vive en `auth.users`; los datos de dominio en tablas de `public`, con `users.id` = mismo UUID que Supabase Auth.
- Credenciales en `.env` (`SUPABASE_DB_PASSWORD`); `.env.template` es la plantilla versionada. Nunca exponer `service_role`/secret keys: en Next.js cualquier `NEXT_PUBLIC_*` llega al navegador. En cliente usar publishable keys.
- Esquema de referencia (tablas, enums, columnas) en `../07-DB-Schema/opendaycare-database-schema.md` (referencia `docs`). Todavía no está aplicado en la base de datos.
- Convención de idioma: lo persistido en DB va en **inglés** (enums, tags, códigos); las etiquetas en español se traducen en la capa de UI.
- Antes de tocar la DB (tablas, columnas, migraciones, RLS, índices, funciones, SQL): cargar las skills `supabase` y `supabase-postgres-best-practices`. RLS obligatorio en tablas de esquemas expuestos; no usar `user_metadata` para decisiones de autorización. Verificar los cambios con una query de prueba.
- **Migraciones obligatorias:** todo cambio en la base de datos (tablas, columnas, índices, RLS/políticas, funciones, triggers, seeds y cualquier DDL o dato persistente) se aplica **siempre** mediante una migración versionada: MCP `apply_migration` + archivo espejo en `supabase/migrations/` (ver `supabase/README.md`). `execute_sql` queda reservado para consultas de lectura y verificación, nunca para cambios persistentes.

## Flujo de trabajo

- Features grandes: usa la skill `spec` (spec en `specs/NN-slug.md`, en español, no aprobarla automáticamente) y luego `spec-impl` (crea rama `spec-NN-slug`).

## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear especificaciones.
- /spec-impl Usaremos esta skill para hacer las implementaciones.
- /verify-spec Usaremos este comando para verificar los criterios de aceptacion de una spec.

## Skills de Supabase

- `supabase` — cualquier tarea de Supabase (DB, Auth, RLS, migraciones, Edge Functions, Storage, Realtime, logs, debugging). Verifica contra la documentación/changelog actual antes de implementar.
- `supabase-postgres-best-practices` — reglas de Postgres (índices, consultas, RLS, esquema, concurrencia, pgvector/pg_cron). Cargarla antes de escribir o cambiar SQL.

## Spec Driven Development - Agente y comando de verificación

- El agente custom **`spec-verifier`** (definido en `.opencode/agent/spec-verifier.md`) verifica los criterios de aceptación de un spec en `specs/`: localiza el spec (por número, slug, `NN-slug` o ruta), corre lint/typecheck, consulta Context7 y los docs locales de Next.js para validar convenciones, y usa Playwright para comprobar las pantallas contra `references/`. Solo edita el checklist de criterios en `specs/`: marca `- [x]` SOLO los que pasan y desmarca los que ahora fallan (regresiones). No corrige código ni cambia el Status.
- El comando **`/verify-spec`** (definido en `.opencode/command/verify-spec.md`) invoca a ese agente. Uso: `/verify-spec <NN | slug | NN-slug | ruta>`. Ejemplo: `/verify-spec 01-home-feed`. Usarlo tras `/spec-impl` para comprobar un spec ya implementado.

## Reglas de código

- Usar codigo limpio, nombres, funciones, variables, etc. en ingles.
