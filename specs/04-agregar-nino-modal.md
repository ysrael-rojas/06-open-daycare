# SPEC 04 — Modal "Agregar niño"

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-09-09
> **Objective:** Agregar a `/kids` un modal "Agregar niño" que se abre al hacer clic en el botón existente, replicando `references/pantallas/agregar-nino.dc.html` como overlay cliente —con máscara de fecha dd/mm/aaaa, 3 salas ficticias y validación visual de los campos obligatorios—, sin persistencia.

## Scope

**In:**

- `components/AddKidModal.tsx` (cliente, `"use client"`): componente autocontenido que incluye el botón trigger "Agregar niño" (se mueve desde el header de `/kids`, estilo intacto) + el overlay modal.
- Overlay: backdrop oscuro translúcido fijo que cubre toda la ventana (sidebar incluido), card centrada de ~520px idéntica al mockup (fondo `#FBF4EC`, borde `#ECE0D0`, radius 24, header con "Cancelar" / título "Agregar niño" en Fredoka / "Guardar" en `#D9583C`).
- Formulario con los campos del mockup: NOMBRE COMPLETO, FECHA DE NACIMIENTO, SALA, ALERGIAS (ETIQUETAS) y NOTAS MÉDICAS, con copia 100% literal.
- Máscara de fecha dd/mm/aaaa: input de texto que solo acepta dígitos y auto-inserta `/` al completar día (2) y mes (2).
- Selector SALA con 3 opciones ficticias **Soles (por defecto), Lunas, Estrellas**, renderizado como `<select>` estilizado `appearance-none` + chevron, fiel al campo del mockup.
- Validación visual ligera de obligatorios (nombre no vacío, fecha completa `dd/mm/aaaa`, sala elegida): al pulsar Guardar, los campos incompletos quedan con borde rojo (`#E46A4F`) y el modal no se cierra. Sin mensajes de texto.
- Cierre del modal por: "Cancelar", "Guardar" (si pasa validación, simula el guardado y cierra), tecla `Escape` y clic en el backdrop. Al cerrar se resetea el formulario; la lista de `/kids` nunca se modifica.
- Datos ficticios de salas tipados en `data/mock/kids.ts` (extiende spec 02; sin archivo nuevo).
- Alergias y notas médicas como campos opcionales de texto plano (fiel al mockup: el input de alergias no crea chips).

**Out of scope (specs futuras):**

- Alta real de niños, persistencia o llamadas a API.
- Ruta propia `/kids/agregar` o navegación: el modal es overlay de estado cliente sobre `/kids`.
- Chips de alergias interactivos (el label "ETIQUETAS" del mockup es solo copy).
- Edición de niño y la pantalla que abre "Guardar" tras un alta real.
- Responsive móvil y revalidación de accesibilidad completa (trap de foco).

## Data model

Extiende `data/mock/kids.ts` (spec 02). No introduce archivos nuevos ni cambia `Kid`/`kids`.

```ts
export interface KidRoom {
  id: string;   // "soles" | "lunas" | "estrellas"
  name: string; // "Soles" | "Lunas" | "Estrellas" (label visible, español)
}

export const kidRooms: KidRoom[] = [
  { id: "soles", name: "Soles" },
  { id: "lunas", name: "Lunas" },
  { id: "estrellas", name: "Estrellas" },
];

export const defaultRoomId = "soles"; // coherencia con kidsRoom (spec 02)
```

Sin helpers nuevos: el estado del formulario vive dentro de `AddKidModal` (nombre, fecha `dd/mm/aaaa`, sala seleccionada).

## Implementation plan

1. `data/mock/kids.ts`: agregar `KidRoom`, `kidRooms` y `defaultRoomId`. Verificar: `npx tsc --noEmit`.
2. `components/icons.tsx`: agregar `ChevronDownIcon` (trayecto `m6 9 6 6 6-6`, stroke 2.2) para el campo Sala. Verificar: `npx tsc --noEmit`.
3. `components/AddKidModal.tsx` (cliente): botón trigger "+ Agregar niño" (misma clase gradient que hoy está en `app/kids/page.tsx`), estado `open`, y estructura del modal: backdrop fijo `bg-[rgba(63,54,46,0.5)]` que cierra con clic fuera, panel `max-w-[520px]` con header Cancelar/título/Guardar y el formulario del mockup (nombre, fecha, sala con chevron, alergias, notas médicas). Cerrar con `Escape` y resetear el form al abrir/cerrar. Roles `dialog`/`aria-modal`. Verificar: `npx tsc --noEmit`.
4. Lógica del formulario en el mismo componente: helper `formatDateMask(raw)` que filtra no-dígitos y agrega `/` en las posiciones 2 y 4; estado `{ fullName, birthDate, roomId, allergies, medicalNotes }`; `guardar()` valida los 3 obligatorios y marca `errors`, y si todo pasa cierra (sin crear nada). Verificar manualmente: escribir fecha inserta las barras solas; Guardar con campos vacíos pinta bordes rojos y no cierra.
5. Integrar en `app/kids/page.tsx`: reemplazar el `<button>` "Agregar niño" del header por `<AddKidModal />`; el resto del listado queda intacto. Verificar: `/kids` sigue idéntico a `references/screenshots/ninos.png` y abrir el modal muestra la card del mockup sobre la pantalla con backdrop.
6. Pase final `npm run lint` + `npx tsc --noEmit` y verificación visual/estructural con Playwright (abrir por botón, 3 salas, máscara de fecha, validación roja, cierre por Cancelar/Escape/backdrop/Guardar válido).

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] En `/kids`, clic en "Agregar niño" abre el modal centrado sobre la pantalla (backdrop translúcido que cubre todo, incluido el sidebar).
- [ ] El modal replica `agregar-nino.dc.html`: header "Cancelar" (izq, `#94887B`) / "Agregar niño" (Fredoka) / "Guardar" (der, `#D9583C`, weight 800), y los 5 campos con sus labels ("NOMBRE COMPLETO", "FECHA DE NACIMIENTO", "SALA", "ALERGIAS (ETIQUETAS)", "NOTAS MÉDICAS") y placeholders literales.
- [ ] El campo de fecha solo acepta dígitos y muestra el formato `dd/mm/aaaa` con las barras auto-insertadas.
- [ ] El selector SALA muestra las opciones "Soles", "Lunas" y "Estrellas", con "Soles" preseleccionada, y un chevron a la derecha.
- [ ] Al pulsar "Guardar" con nombre vacío, fecha incompleta o sin sala, los campos faltantes quedan con borde rojo y el modal permanece abierto.
- [ ] Con los 3 obligatorios completos, "Guardar" cierra el modal, la lista de `/kids` no cambia y el formulario queda vacío la próxima vez que se abre.
- [ ] "Cancelar", la tecla `Escape` y el clic en el backdrop cierran el modal sin modificar `/kids`.
- [ ] A 1280×800 el modal abierto luce como `references/pantallas/agregar-nino.dc.html` (comparación visual; no hay screenshot PNG de esta pantalla) y `/kids` cerrado sigue idéntico a `references/screenshots/ninos.png`.

## Decisions

- **Yes:** modal como overlay de estado cliente sobre `/kids`, no como ruta. El usuario lo pidió explícitamente ("al dar click me muestre la ventana modal") y evita una ruta nueva.
- **No:** `/kids/agregar` o navegación real. Overengineering para una pantalla sin persistencia; si el alta real llega, puede mudarse a ruta o fetch.
- **Yes:** trigger dentro de `AddKidModal`. Evita levantar estado de apertura en `app/kids/page.tsx` (que sigue siendo server component).
- **No:** `use client` en toda la página `/kids`. La interactividad queda aislada en un único componente.
- **Yes:** salas "Soles, Lunas, Estrellas" con "Soles" por defecto (respuesta del usuario). Coherente con `kidsRoom`/mockup de spec 02.
- **Yes:** `<select>` nativo estilizado (`appearance-none` + chevron) en vez de listbox custom. Mismo look, con semántica y teclado gratis.
- **Yes:** máscara dd/mm/aaaa auto-insertando barras. Réplica literal del placeholder del mockup y del pedido "una máscara".
- **No:** `<input type="date">` nativo. Se aleja del formato del mockup y cambia el look.
- **Yes:** validación visual ligera al pulsar Guardar (bordes rojos, sin mensajes). Es "solo interfaz": se muestra qué es obligatorio sin construir lógica de errores real.
- **No:** Guardar deshabilitado ni persistencia simulada. La validación ligera es suficiente para el alcance UI.
- **Yes:** "Guardar" válido cierra y "Cancelar"/`Escape`/backdrop también cierran (respuesta del usuario). Flujo de demo completo sin tocar la lista.
- **Yes:** salas tipadas en `data/mock/kids.ts` reutilizando convención inglés→español de spec 02.
- **No:** archivo `data/mock/rooms.ts` nuevo. Tres opciones de una sala no justifican un módulo aparte.
- **Yes:** alergias/notas como texto plano, fiel al mockup. El "(ETIQUETAS)" no genera chips en esta spec.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| El mockup `agregar-nino.dc.html` es una página standalone, no un overlay con sidebar detrás | Comparar solo la card del modal (ancho 520px y contenido); el contexto con sidebar se valida contra `/kids` + backdrop. |
| Regresión en `/kids` (spec 02) al mover el botón del header | El botón conserva su markup/clases exactas dentro del nuevo componente; verificar `/kids` tras el paso 5. |
| Modal cliente: warning de React o focus/Escape mal manejados | Probar `Escape`, backdrop y `aria-modal` en el paso 6 con Playwright. |

## What is **not** in this spec

- Alta real de niños, persistencia o API.
- Ruta `/kids/agregar` ni navegación a una pantalla post-guardado.
- Chips de alergias interactivos ni editor de etiquetas.
- Edición de niños existentes.
- Responsive móvil ni trap de foco completo.

Cada uno de esos, si llega, va en su propia spec.
