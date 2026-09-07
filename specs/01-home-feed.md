# SPEC 01 — Home: feed de la sala (vista maestra)

> **Status:** Aprobado
> **Date:** 2026-09-07
> **Objective:** Implementar la pantalla de feed (vista maestra) como home `/` replicando visualmente `references/pantallas/feed.dc.html`, sin autenticación ni persistencia.

## Scope

**In:**

- Reemplazar el scaffold de `create-next-app` en `/` por la réplica del feed.
- Componentes reutilizables del shell (`components/Sidebar`, `components/PostCard`, íconos SVG inline) y composición en `app/page.tsx`.
- Datos ficticios tipados en `data/mock/` (usuario, sala, niños, publicaciones).
- Estilo Tailwind v4 con valores arbitrarios lo más fieles al mockup; Fredoka/Nunito con `next/font/google`; base visual en `app/globals.css`.
- Copia 100% literal del texto en español y de la vista maestra.

**Out of scope (specs futuras):**

- Autenticación y cualquier ruta de login.
- Base de datos / persistencia / API.
- Las demás pantallas (niños, avisos, mi cuenta, crear publicación, detalle, foto, vistas de familia).
- Responsive móvil y comportamiento adaptativo.
- Interactividad real (likes, comentarios, navegación).

## Data model

Convención de código limpio: identificadores, tipos, claves y campos en **inglés**; las etiquetas que se muestran al usuario (badges, "Para:…", roles, copy) se resuelven desde esos valores internos mediante mapas/helpers y quedan en **español**.

```ts
// data/mock/feed.ts

// --- Badges ---------------------------------------------------------------
export type BadgeKind = "achievement" | "activity" | "announcement";

export const BADGE_META: Record<BadgeKind, { label: string; bg: string; color: string }> = {
  achievement: { label: "LOGRO", bg: "#CFEBD8", color: "#3E9B6C" },
  activity: { label: "ACTIVIDAD", bg: "#C7E7F1", color: "#2E89A6" },
  announcement: { label: "ANUNCIO", bg: "#CCD8F4", color: "#4E72C8" },
};

// --- Audience -------------------------------------------------------------
export type Audience = { kind: "family"; familyName: string } | { kind: "room" };

export const AUDIENCE_PREFIX: Record<Audience["kind"], string> = {
  family: "Para: familia de",
  room: "Para: toda la sala",
};

export const audienceLabel = (audience: Audience): string =>
  audience.kind === "family"
    ? `${AUDIENCE_PREFIX.family} ${audience.familyName}`
    : AUDIENCE_PREFIX.room;

// --- Post -----------------------------------------------------------------
export interface Child {
  name: string;
  initials: string;
  avatarColor: string;
  avatarTextColor: string;
}

export type PostSubject = { type: "child"; child: Child } | { type: "announcement" };

export interface Post {
  id: string;
  badge: BadgeKind;
  subject: PostSubject; // header del post: avatar+nombre del niño, o megáfono + "Anuncio general"
  createdAt: string; // "14:20"
  publishedByMe: boolean; // true → "publicado por vos"
  audience: Audience;
  body: string;
  photo?: { label: string; height: number };
  likes: number;
  comments: number;
}

// --- User & room ----------------------------------------------------------
export const currentUser = {
  id: "user-caro",
  name: "Caro Giménez",
  roleLabel: "Maestra · Soles",
  initials: "C",
  avatarColor: "#F2937A",
  avatarTextColor: "#FFFFFF",
};

export const room = {
  headlineLabel: "GUARDERÍA · SALA SOLES",
  name: "Sala Soles",
  childrenCount: 12,
  dateLabel: "martes 17 jun",
};

// --- Mock data ------------------------------------------------------------
export const todayPosts: Post[] = [
  {
    id: "post-1",
    badge: "achievement",
    subject: { type: "child", child: { name: "Mateo", initials: "M", avatarColor: "#A9D9E8", avatarTextColor: "#1F7A93" } },
    createdAt: "14:20",
    publishedByMe: true,
    audience: { kind: "family", familyName: "Mateo" },
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    comments: 1,
  },
  // post-2 → activity: Mateo, pintando con témperas, photo { label: "Foto · pintando con témperas", height: 200 }, 5/2
  // post-3 → announcement: megáfono, parque del viernes, audience { kind: "room" }, 8/0
];
```

## Implementation plan

1. `app/layout.tsx` + `app/globals.css`: metadatos/título OpenDayCare, cargar Fredoka y Nunito con `next/font/google`, quitar scaffold (Geist, fondo blanco), setear body con `#F6ECDF`, tipografías y scrollbar. Verificar: `npm run dev` muestra página en blanco sin scaffold.
2. Crear `data/mock/feed.ts` con los tipos en inglés (`BadgeKind`, `Audience`, `Post`, `currentUser`, `room`) y las 3 publicaciones exactas del mockup. Los labels en español viven en `BADGE_META` y en `audienceLabel`.
3. Crear `components/` con los SVG inline y `Sidebar` (logo OpenDayCare "Sala Soles", botón "Nueva publicación", nav Feed/Niños/Avisos/Mi cuenta con ítem Feed activo, footer Caro + logout) con enlaces visuales sin navegación.
4. Crear `components/PostCard` (header con avatar/badge, "Para:", texto, foto opcional con placeholder dashed, footer likes/comentarios/"Editar") y componer `app/page.tsx`: header de sala, fila "Compartí un momento…", separador "PUBLICADO HOY" y la lista de posts.
5. Ajustes finos de fidelidad comparando con `references/pantallas/feed.dc.html` (layout 248px + scroll propio, shadows, radios, letter-spacing).

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] En `/` no queda nada del scaffold (ni Geist, ni textos en inglés, ni assets de create-next-app en uso).
- [ ] El sidebar mide 248px, es sticky (100vh) con scroll propio en el main, fondo `#FFFDF9` y borde `#ECE0D0`.
- [ ] Fondo general `#F6ECDF`; textos en Fredoka (títulos/marca) y Nunito (cuerpo); heading "Buenas, Caro" y "GUARDERÍA · SALA SOLES" presentes.
- [ ] Aparecen las 3 publicaciones con badges "LOGRO" (verde #3E9B6C), "ACTIVIDAD" (azul #2E89A6) y "ANUNCIO" (azul #4E72C8), con sus textos, horas, "Para:", counts de ❤️ y 💬 y enlace "Editar".
- [ ] La actividad muestra el bloque "Foto · pintando con témperas" (placeholder dashed, altura 200px).
- [ ] Fila "Compartí un momento…" y botón "Nueva publicación" presentes; ningún enlace navega a ruta inexistente (no 404 al hacer clic).
- [ ] A 1280×800 la pantalla luce idéntica a `references/screenshots/feed.png` (comparación visual manual).

## Decisions

- **Yes:** código limpio con nombres en inglés (tipos, claves, campos) mapeados a etiquetas visuales en español. Alineado con AGENTS.md.
- **No:** valores internos en español (p. ej. `TipoBadge = "LOGRO"`) mezclados con el render. Dificulta reutilización cuando llegue la API.
- **Yes:** componentes reutilizables en `components/`. El shell se repetirá en las demás pantallas; no duplicarlo en `page.tsx`.
- **No:** página monolítica en `app/page.tsx`. Dificultaría las próximas specs.
- **Yes:** datos ficticios tipados en `data/mock/`. Camino listo para inyectar API después.
- **No:** datos hardcodeados inline en el JSX.
- **Yes:** enlaces visuales sin navegación (sin href). Evita 404 mientras no existen las rutas.
- **No:** href a rutas futuras reales.
- **Yes:** Tailwind con valores arbitrarios fieles al mockup (hex exactos inline).
- **No:** centralizar la paleta en `@theme` en esta spec (decisión del usuario: "valores lo más parecido posible").
- **Yes:** fuentes con `next/font/google`.
- **No:** `<link>` a Google Fonts.
- **Yes:** SVG inline copiados del mockup.
- **No:** `lucide-react` (dependencia nueva).
- **Yes:** solo desktop, fiel al mockup.

## What is **not** in this spec

- Autenticación, rutas de login.
- Base de datos, persistencia o fetching real.
- Cualquier pantalla que no sea el feed maestra.
- Responsive móvil.
- Interacciones reales (likes, comentarios, navegar).

Cada uno de esos, si llega, va en su propia spec.
