# Migraciones de Supabase

Este proyecto usa Supabase (Postgres + Auth) como backend. Los cambios de esquema se
versionan en este repo **y** se aplican al proyecto remoto a través del MCP de Supabase.

## Patrón de migraciones

1. **Ubicación.** Todo el SQL versionado vive en `supabase/migrations/`.
2. **Nombre.** `<version>_<snake_case_name>.sql`, donde `<version>` es la versión que
   registra la migración remota (misma que devuelve `apply_migration`). Ejemplo:
   `20260912000000_create_daycares.sql`.
3. **Aplicación vía MCP.** El cambio se aplica con la herramienta MCP
   `apply_migration`, usando como `name` el `<snake_case_name>` del archivo
   (por ejemplo `create_daycares`). No se usa la CLI local de Supabase.
4. **Espejo del SQL.** El archivo del repo debe contener **el mismo SQL exacto** que se
   aplicó vía MCP, con el mismo `<version>` que devolvió `apply_migration`. Repo y base
   de datos quedan sincronizados.
5. **RLS obligatorio.** Toda tabla creada en un esquema expuesto (`public`) debe habilitar
   Row Level Security (`alter table ... enable row level security`). El acceso se otorga
   con políticas explícitas; mientras no existan, el acceso vía Data API queda denegado.
   No se usan `user_metadata` ni decisiones de autorización en el cliente.
6. **Verificación.** Después de aplicar:
   - `execute_sql` para comprobar el esquema (columnas, tipos, `not null`, PK, defaults) y
     `relrowsecurity = true` en `pg_tables` / `pg_class`.
   - `execute_sql` para comprobar los datos semilla.
   - `get_advisors(type: "security")` para confirmar que no aparecen avisos nuevos.

## Convenciones

- Identificadores en minúsculas y `snake_case`.
- Claves primarias `uuid` con `default gen_random_uuid()` (consistencia con las FKs `uuid`
  del resto del esquema).
- Lo persistido en la base de datos va en **inglés**; las etiquetas en español se traducen
  en la capa de UI.
- Los seeds usan identificadores fijos para ser reproducibles e idempotentes por inspección.
