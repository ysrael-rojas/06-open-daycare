# SPEC 02 — Niños: listado y perfil

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-09
> **Objective:** Implementar las pantallas de niños (`/kids`) y perfil de niño (`/kids/[slug]`) replicando visualmente `references/pantallas/ninos.dc.html` y `perfil-nino.dc.html`, sin autenticación ni persistencia.

## Scope

**In:**

- Ruta `/kids`: réplica del listado con header "GESTIÓN / Niños", botón "Agregar niño", buscador decorativo, sección "SALA SOLES · 8 niños" y grid de 2 columnas con los 8 niños del mockup.
- Ruta `/kids/[slug]`: réplica del perfil con datos coherentes para los 8 niños (solo Mateo está definido en el mockup; el resto con datos plausibles consistentes con su card: edad, badge de alergia o "VINCULAR", nº de padres).
- Datos ficticios tipados en `data/mock/kids.ts` (nuevo, independiente de `feed.ts`).
- Navegación real donde la ruta existe: cards → `/kids/[slug]`, "Volver a Niños" → `/kids`, nav Feed → `/` y Niños → `/kids`, logo sin cambios.
- Efecto hover de las cards (`border #F2A78E` + `translateY(-2px)`), íconos nuevos en `components/icons.tsx`, `components/KidCard.tsx`, `Sidebar` con href para rutas existentes.
- Slugs desconocidos → `notFound()` (sin crash).
- Copia 100% literal del texto en español; shell, tipografías y colores reutilizados de SPEC 01.

**Out of scope (specs futuras):**

- Autenticación y cualquier ruta de login.
- Base de datos / persistencia / API.
- Rutas sin pantalla aún: crear publicación, agregar niño/editar, vincular padre, resumen del día, avisos, mi cuenta (botones quedan visuales, sin 404).
- Responsive móvil.
- Interactividad real (buscador que filtra, agregar/vincular, hover de estado, salas múltiples).

## Data model

Convención de SPEC 01: tipos/claves/campos en **inglés**; etiquetas visibles en **español** vía mapas/helpers.

```ts
// data/mock/kids.ts

export type AllergyKind = "peanut" | "lactose";

export const ALLERGY_META: Record<
  AllergyKind,
  { chipLabel: string; chipBg: string; chipColor: string; note: string }
> = {
  peanut: { chipLabel: "MANÍ", chipBg: "#FBD8CC", chipColor: "#D9684A", note: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila." },
  lactose: { chipLabel: "LACTOSA", chipBg: "#FBD8CC", chipColor: "#D9684A", note: "Alergia a la lactosa. Sustituir la leche por bebida vegetal en la merienda." },
};

export const LINK_CHIP = { label: "VINCULAR", bg: "#F9D2DE", color: "#C56486" };

export type ParentRelation = "mother" | "father";
export type ParentStatus = "active" | "pending";

export const PARENT_RELATION_LABEL: Record<ParentRelation, string> = {
  mother: "Mamá",
  father: "Papá",
};

export const PARENT_STATUS_META: Record<
  ParentStatus,
  { badgeLabel: string; badgeBg: string; badgeColor: string; suffix: string }
> = {
  active: { badgeLabel: "ACTIVA", badgeBg: "#CFEBD8", badgeColor: "#3E9B6C", suffix: "" },   // suffix fem./masc. según relación
  pending: { badgeLabel: "PENDIENTE", badgeBg: "#F7E7A6", badgeColor: "#9A7B1E", suffix: "invitación enviada" },
};

export interface Parent {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  avatarTextColor: string;
  relation: ParentRelation;
  status: ParentStatus;
}

export interface Kid {
  id: string;
  slug: string;           // ascii, ej. "mateo-fernandez"
  fullName: string;
  initials: string;
  avatarColor: string;
  avatarTextColor: string;
  ageYears: number;
  birthDateLabel: string; // "12 mar 2022"
  enrollmentLabel: string; // "feb 2025"
  allergies: AllergyKind[];
  parents: Parent[];
}

export const kidsRoom = { name: "Sala Soles" };

// Helpers derivados (labels en español desde valores en inglés)
export const ageLabel = (kid: Kid): string;
export const parentCountLabel = (kid: Kid): string; // "sin/1 padre/N padres vinculados"
export const kidSubtitle = (kid: Kid): string;      // `${ageLabel} · ${parentCountLabel}`
export const kidChip = (kid: Kid): { label: string; bg: string; color: string } | null; // alergia 1ª → chip, 0 padres → VINCULAR, si no null
export const parentSubtitle = (p: Parent): string;  // "Mamá · activa" | "Papá · invitación enviada"

export const kids: Kid[] = [
  // Mateo Fernández — slug "mateo-fernandez", M, #A9D9E8/#1F7A93, 3 años, "12 mar 2022", "feb 2025",
  //   alergia peanut; padres Lucía (mother/active, L, #C9B6E8/#FFFFFF) y Diego (father/pending, D, #A9C7E8/#FFFFFF)  → fiel al mockup
  // Sofía Méndez    — "sofia-mendez",    1 padre, sin alergias
  // Benjamín Ruiz   — "benjamin-ruiz",   2 padres, sin alergias
  // Valentina Soto  — "valentina-soto",  0 padres → chip VINCULAR
  // Tomás Díaz      — "tomas-diaz",      alergia lactose, 1 padre
  // Emma Castro     — "emma-castro",     1 padre, sin alergias
  // Lucas Romero    — "lucas-romero",    1 padre, sin alergias
  // Olivia Vega     — "olivia-vega",     1 padre, sin alergias
];
// El resto de los niños lleva datos plausibles (fechas/ingreso coherentes con la edad, nombres de padres inventados)
// para que las 8 cards naveguen a un perfil real sin 404.
```

## Implementation plan

1. `data/mock/kids.ts`: tipos, metas de alergias/status, helpers derivados y los 8 niños (Mateo literal al mockup). Verificar: `npx tsc --noEmit` sin errores.
2. `components/icons.tsx`: agregar `SearchIcon`, `ChevronLeftIcon`, `ChevronRightIcon` y `AlertTriangleIcon` (copiados del mockup).
3. `components/KidCard.tsx`: card `server component` que recibe `kid`, avatar + nombre + subtítulo derivado + chip (`kidChip`) o chevron, con transición y hover `border #F2A78E` / `-translate-y-[2px]`. Aún sin `href`.
4. `app/kids/page.tsx`: compose header (eyebrow "GESTIÓN", título "Niños", botón "Agregar niño"), buscador decorativo con `SearchIcon`, fila "SALA SOLES · {kids.length} niños", grid 2 columnas con `KidCard`. Verificar: `/kids` a 1280px luce como `references/screenshots/ninos.png` y nada navega a ruta inexistente.
5. `app/kids/[slug]/page.tsx`: parámetro dinámico (await `params`, typing según docs locales de Next en `node_modules/next/dist/docs/`), lookup por slug en `kids`; si no existe → `notFound()`. Réplica de `perfil-nino.dc.html`: "Volver a Niños", header avatar+nombre+edad/sala+botón "Editar", bloque de alergias si `allergies.length > 0`, filas Fecha nacimiento/Sala/Ingreso, panel "PADRES VINCULADOS" con avatares+subtítulo+badge status y "Vincular otro padre". Verificar perfil de Mateo idéntico al mockup.
6. Conectar navegación: `href` de `KidCard` → `/kids/${kid.slug}`; `Sidebar` con href en Feed (`/`) y Niños (`/kids`) y `activeItem` correcto en cada página; enlaces sin ruta siguen visuales. Verificar: recorrer `/kids` → cada perfil → "Volver", nav Feed/Niños sin 404; `/kids/slug-inventado` → 404; comparación visual con `references/screenshots/ninos.png` y `perfil-nino.dc.html`.

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] `/kids` muestra eyebrow "GESTIÓN", h1 "Niños", botón "Agregar niño", buscador "Buscar niño…" y sección "SALA SOLES · 8 niños" con los 8 niños en grid 2 columnas.
- [ ] Las cards copian los textos, avatares y colores del mockup; chips "MANÍ" (Mateo), "LACTOSA" (Tomás) y "VINCULAR" (Valentina); el resto muestra chevron. El hover usa borde `#F2A78E` y sube 2px.
- [ ] Cada card navega a `/kids/[slug]` y el perfil muestra el mismo nombre, edad, sala, alergia y nº de padres que su card.
- [ ] El perfil de Mateo es idéntico a `perfil-nino.dc.html`: fechas "12 mar 2022" y "feb 2025", nota de maní, padres Lucía (ACTIVA, "Mamá · activa") y Diego (PENDIENTE, "Papá · invitación enviada"), botón "Resumen del día" y enlaces "Editar"/"Vincular otro padre" presentes.
- [ ] "Volver a Niños" y el nav (Feed → `/`, Niños → `/kids`) navegan sin 404; enlaces sin ruta (Editar, Agregar niño, Nueva publicación, Resumen del día, Vincular otro padre, logout) no navegan a rutas inexistentes.
- [ ] `/kids/slug-desconocido` renderiza 404 (sin error en consola).
- [ ] A 1280×800 `/kids` luce idéntica a `references/screenshots/ninos.png` (comparación visual manual) y `/kids/mateo-fernandez` al mockup `perfil-nino.dc.html` (no hay screenshot del perfil).

## Decisions

- **Yes:** todos los niños con perfil propio navegable. Evita 404 y da un modelo coherente para futuras specs; solo Mateo es literal, el resto es plausible.
- **No:** solo perfil de Mateo o perfiles genéricos. Cards rotas o datos incoherentes con el badge.
- **Yes:** campo `slug` ASCII explícito por niño (`mateo-fernandez`).
- **No:** derivar slug del nombre normalizado (acentos/espacios frágiles).
- **Yes:** `data/mock/kids.ts` independiente de `feed.ts` (SPEC 01 intacta).
- **No:** refactorizar el feed para compartir el modelo ahora. Se consolida cuando llegue la API.
- **Yes:** buscador decorativo (sin estado client). Interactividad real queda para una spec con datos reales.
- **No:** `use client` para filtrar. Mismo criterio de interacción mínima que SPEC 01.
- **Yes:** navegación real solo donde la ruta existe; botones de pantallas futuras sin href.
- **No:** href hacia rutas que aún no existen (evita 404), ni `notFound` por defecto en enlaces válidos.
- **Yes:** derivar chips/subtítulos de los datos con helpers (`kidChip`, `parentCountLabel`) en inglés→español, igual que `BADGE_META`/`audienceLabel`.
- **No:** hardcodear los chips/textos derivados por card en el JSX.
- **Yes:** reutilizar `Sidebar`/`icons`/tipografías/colores de SPEC 01 extendiéndolos (no duplicar el shell).
- **No:** pantallas monolíticas o copiar el aside por página.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| `[slug]` en Next 16: params asíncronos y typing propios de esta versión | Consultar `node_modules/next/dist/docs/` antes de escribir la ruta (regla AGENTS.md). |
| Perfil definido solo para Mateo: el resto de datos se inventa y puede divergir en specs futuras | Documentar en este spec que el resto es provisional y vive solo en `data/mock/kids.ts`. |
| Regresión en `/` (feed) al tocar `Sidebar` compartido | Cambios aditivos (href opcional + `activeItem`); verificar `/` tras el paso 6. |

## What is **not** in this spec

- Autenticación, rutas de login.
- Base de datos, persistencia o fetching real.
- Pantallas de crear/editar niño, vincular padre, resumen del día, avisos, mi cuenta.
- Responsive móvil.
- Interactividad real (buscador, agregar/vincular, hover funcional).

Cada uno de esos, si llega, va en su propia spec.
