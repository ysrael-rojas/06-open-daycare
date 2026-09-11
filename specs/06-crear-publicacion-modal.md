# SPEC 06 — Modal "Nueva publicación"

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-11
> **Objective:** Agregar al botón "Nueva publicación" del sidebar un modal que replique `references/pantallas/crear-publicacion.dc.html` como overlay cliente —selección múltiple de niños en PARA con "Toda la sala" excluyente, tipo único y contenido precargado—, sin persistencia.

## Scope

**In:**

- `components/NewPostModal.tsx` (cliente, `"use client"`): componente autocontenido con el trigger + el overlay modal.
- Trigger: el `<button>` "Nueva publicación" del sidebar se mueve dentro del componente **conservando su diseño** (gradiente `linear-gradient(180deg,#F4977E,#EE8164)`, `PlusIcon` y clases actuales), ahora con `onClick` que abre el modal. Como vive en `Sidebar`, el modal queda disponible en `/`, `/kids` y `/kids/[slug]`, igual que en los mockups.
- Overlay: backdrop fijo `bg-[rgba(63,54,46,0.5)]` que cubre toda la ventana (sidebar incluido), card centrada `max-w-[580px]` idéntica al mockup (`#FBF4EC`, borde `#ECE0D0`, radius 24, sombra `0 20px 50px -24px rgba(63,54,46,.35)`).
- Header (padding `20px 26px`, borde inferior `#ECE0D0`): "Cancelar" (izq, `#94887B`, 700) / "Nueva publicación" (Fredoka 600 18px) / "Publicar" (der, `#D9583C`, 800).
- Sección PARA: chips de **los 8 niños** de `data/mock/kids.ts` (iniciales y colores reales, primer nombre derivado de `fullName`) + chip "Toda la sala".
- Multi-selección de niños: cada chip alterna (toggle). Seleccionado = fondo `#3F362E`, texto blanco, borde `#3F362E`; no seleccionado = fondo `#FFFDF9`, texto `#6E6359`, borde `#ECE0D0`.
- Exclusión mutua con "Toda la sala": al marcar "Toda la sala" se desmarcan todos los niños; al marcar un niño se desmarca "Toda la sala".
- Estado inicial literal del mockup: **Mateo seleccionado** (equivale a `kidIds: ["kid-mateo-fernandez"]`, `allRoom: false`).
- Sección TIPO: 7 chips (Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio) con los colores exactos del mockup; **selección única**, "Comida" (`food`) por defecto. Seleccionado = color lleno del mockup; no seleccionado = fondo `#FFFDF9`, borde `#ECE0D0`, texto `#6E6359`.
- Sección DESCRIPCIÓN: `<textarea>` con el texto precargado del mockup ("Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón.") y placeholder "Contá cómo le fue hoy…".
- Sección FOTOS: una miniatura 96×96 con ícono de imagen (`ImageIcon`) sobre `#F4ECE1` y el tile dashed "Agregar" (PlusIcon `#C5503A`); ambos **solo visuales**.
- Cierre por: "Cancelar", tecla `Escape`, clic en el backdrop y "Publicar" (sin validación, simula el envío). Al cerrar se resetea al estado inicial del mockup (Mateo, Comida, texto y foto).
- Ícono reutilizado: `ImageIcon` ya existe en `components/icons.tsx`; no se agregan íconos nuevos.

**Out of scope (specs futuras):**

- Persistencia, API o creación real de publicaciones.
- Carga real de fotos (input file, preview, drag & drop).
- Ruta propia `/publicar` o navegación: el modal es overlay de estado cliente.
- Validación de campos o mensajes de error.
- TIPO como parte del modelo `Post`/`BadgeKind` de SPEC 01.
- Responsive móvil y trap de foco completo.

## Data model

Esta spec no introduce archivos de datos nuevos. Reutiliza `kids` de `data/mock/kids.ts` (SPEC 02) y define tipos locales dentro de `components/NewPostModal.tsx`.

```ts
// components/NewPostModal.tsx

type PostType =
  | "food" | "nap" | "activity" | "achievement" | "mood" | "photo" | "announcement";

// label + colores exactos del mockup (seleccionado)
const POST_TYPES: { id: PostType; label: string; bg: string; color: string }[] = [
  { id: "food",         label: "Comida",    bg: "#9A7B1E", color: "#FFFFFF" },
  { id: "nap",          label: "Siesta",    bg: "#E7DCF6", color: "#7B5FC0" },
  { id: "activity",     label: "Actividad", bg: "#2E89A6", color: "#FFFFFF" },
  { id: "achievement",  label: "Logro",     bg: "#CFEBD8", color: "#3E9B6C" },
  { id: "mood",         label: "Ánimo",     bg: "#F9D2DE", color: "#C56486" },
  { id: "photo",        label: "Foto",      bg: "#FBD8CC", color: "#D9684A" },
  { id: "announcement", label: "Anuncio",   bg: "#CCD8F4", color: "#4E72C8" },
];

// Estado local del formulario (no persiste)
interface NewPostForm {
  allRoom: boolean;
  kidIds: string[];
  type: PostType;
  description: string;
}

const INITIAL_FORM: NewPostForm = {
  allRoom: false,
  kidIds: ["kid-mateo-fernandez"],
  type: "food",
  description:
    "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón.",
};
```

El primer nombre de cada chip se deriva con `kid.fullName.split(" ")[0]`.

## Implementation plan

1. `components/NewPostModal.tsx` (cliente): mover el `<button>` "Nueva publicación" del sidebar (mismas clases) dentro del componente con estado `open`; construir el overlay con backdrop `bg-[rgba(63,54,46,0.5)]`, card `max-w-[580px]` y header "Cancelar" / "Nueva publicación" / "Publicar"; cerrar con `Escape`, backdrop y botones, reseteando al cerrar. Roles `dialog`/`aria-modal`/`aria-labelledby`. Verificar: `npx tsc --noEmit`.
2. Sección PARA: mapear `kids` a chips (iniciales + colores reales, primer nombre) + chip "Toda la sala"; estado `{ allRoom, kidIds }` iniciado en Mateo; toggles con la exclusión mutua; estilos seleccionado/no seleccionado del mockup y `aria-pressed`. Verificar manualmente: marcar un niño desmarca "Toda la sala" y viceversa; Mateo arranca marcado.
3. Sección TIPO: lista `POST_TYPES`, estado único iniciado en `food`; seleccionado = color lleno, no seleccionado = neutro; `aria-pressed`. Verificar visualmente contra `crear-publicacion.dc.html`.
4. DESCRIPCIÓN + FOTOS: `<textarea>` precargado con placeholder, miniatura `ImageIcon` y tile "Agregar" (solo visual). Verificar: el modal completo luce como el mockup.
5. Integrar en `components/Sidebar.tsx`: reemplazar el `<button>` por `<NewPostModal />`; `Sidebar` sigue siendo server component. Verificar: `/` sigue idéntico a `references/screenshots/feed.png` y el botón abre el modal sobre la pantalla.
6. Pase final `npm run lint` + `npx tsc --noEmit` y verificación con Playwright (abrir por botón, 8 chips + "Toda la sala", exclusión mutua, TIPO único con Comida por defecto, contenido precargado, cierre por Cancelar/Escape/backdrop/Publicar y reset).

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] En `/`, clic en "Nueva publicación" abre el modal centrado con backdrop oscuro que cubre todo (sidebar incluido).
- [ ] El modal replica `crear-publicacion.dc.html`: header "Cancelar" / "Nueva publicación" (Fredoka) / "Publicar" (`#D9583C`), secciones PARA, TIPO, DESCRIPCIÓN y FOTOS con sus labels y estilos.
- [ ] PARA muestra los 8 niños de `data/mock/kids.ts` (con sus iniciales y colores) más el chip "Toda la sala".
- [ ] Mateo aparece seleccionado al abrir, con el estilo `#3F362E`/texto blanco del mockup.
- [ ] Se pueden marcar/desmarcar varios niños a la vez.
- [ ] Marcar "Toda la sala" desmarca todos los niños; marcar cualquier niño desmarca "Toda la sala".
- [ ] TIPO permite elegir un solo tipo, con "Comida" seleccionada por defecto; el seleccionado usa el color lleno del mockup y el resto se ve neutro.
- [ ] La DESCRIPCIÓN arranca con el texto del mockup y es editable.
- [ ] FOTOS muestra la miniatura con ícono de imagen y el tile "Agregar" (sin carga real).
- [ ] "Cancelar", la tecla `Escape` y el clic en el backdrop cierran el modal sin modificar el feed.
- [ ] "Publicar" cierra el modal (sin validación) y al reabrir el formulario vuelve al estado inicial (Mateo, Comida, texto y foto).
- [ ] A 1280×800 el modal abierto luce como `references/pantallas/crear-publicacion.dc.html` / `references/screenshots/compose.png`, y el feed cerrado sigue idéntico a `references/screenshots/feed.png`.

## Decisions

- **Yes:** trigger = botón "Nueva publicación" del sidebar movido al componente cliente, conservando su diseño (respuesta del usuario). Es el botón literal y coincide con los mockups.
- **No:** usar la fila "Compartí un momento…" del feed como trigger. Se deja intacta.
- **Yes:** chips de PARA con los 8 niños de `data/mock/kids.ts` (respuesta del usuario). Coherente con `Kid` de SPEC 02 y evita hardcodear 3 nombres.
- **No:** replicar solo Mateo/Sofía/Benjamín. El mockup es una muestra, no el listado real.
- **Yes:** "Toda la sala" y los niños son mutuamente excluyentes (pedido explícito del usuario). Es la única regla de negocio de la spec.
- **Yes:** estado inicial Mateo seleccionado y descripción/foto precargadas (respuesta del usuario). Réplica literal del mockup.
- **No:** formulario vacío. El mockup muestra contenido y se pidió fidelidad exacta.
- **Yes:** TIPO con selección única y "Comida" por defecto (respuesta del usuario).
- **No:** TIPO multiselección o estático. El mockup resalta una sola opción.
- **Yes:** no seleccionado = neutro `#FFFDF9`/`#ECE0D0`/`#6E6359` (respuesta del usuario). Da contraste claro de selección sin inventar 7 pares de colores.
- **No:** tinte suave por tipo ni anillo. Menos legible y más código para una pantalla sin persistencia.
- **Yes:** "Publicar" cierra sin validación (respuesta del usuario). Es solo interfaz.
- **No:** validar descripción/destinatario con bordes rojos. No fue pedido y el mockup no muestra errores.
- **Yes:** `POST_TYPES` local en el componente. Los colores del modal no coinciden 1:1 con `BADGE_META` de SPEC 01 y no se quiere acoplar el modelo `Post`/`BadgeKind`.
- **No:** extender `data/mock/feed.ts` con los 7 tipos. Sería modelar persistencia que no existe.
- **Yes:** trigger dentro de `NewPostModal`. Mantiene `Sidebar` como server component, igual que SPEC 04 con `AddKidModal`.
- **Yes:** `ImageIcon` existente para la miniatura. Evita un ícono nuevo.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| El mockup `crear-publicacion.dc.html` es una página standalone, no un overlay con sidebar detrás | Comparar la card (580px y contenido) contra el mockup y el contexto con sidebar contra el feed + backdrop. |
| Regresión en `/` o `/kids` al mover el botón "Nueva publicación" del `Sidebar` | El botón conserva markup/clases exactas dentro del componente; verificar el sidebar tras el paso 5. |
| Los 8 chips desbordan el ancho del mockup (que mostraba 3) | Los contenedores PARA y TIPO ya usan `flex-wrap` con `gap`; verificar el wrap a 1280×800. |
| La distinción seleccionado/no seleccionado en TIPO no existe en el mockup | Documentada aquí: lleno vs. neutro; verificar que "Comida" se vea como el mockup al abrir. |
| Modal cliente: warning de React o focus/Escape mal manejados | Probar `Escape`, backdrop y `aria-modal` en el paso 6 con Playwright. |

## What is **not** in this spec

- Persistencia, API ni creación real de publicaciones.
- Carga real de fotos (input file, preview, drag & drop).
- Ruta `/publicar` ni navegación post-publicación.
- Validación de campos o mensajes de error.
- TIPO dentro del modelo `Post`/`BadgeKind` de SPEC 01.
- Responsive móvil ni trap de foco completo.

Cada uno de esos, si llega, va en su propia spec.
