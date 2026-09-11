# SPEC 05 — Modal "Vincular padre"

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-09-11
> **Objective:** Agregar a `/kids/[slug]` un modal "Vincular padre" que se abre al pulsar el enlace "Vincular otro padre" del panel PADRES VINCULADOS, replicando `references/pantallas/vincular-padre.dc.html` como overlay cliente —con nombre del niño dinámico, parentesco seleccionable y validación visual ligera—, sin persistencia.

## Scope

**In:**

- `components/LinkParentModal.tsx` (cliente, `"use client"`): componente autocontenido con el trigger + el overlay modal.
- Trigger: el `<a>` "Vincular otro padre" del perfil se convierte en `<button>` que **conserva el diseño** (círculo punteado + `PlusIcon` + texto `#C5503A`), ahora con `onClick` que abre el modal.
- Overlay: backdrop fijo `bg-[rgba(63,54,46,0.5)]` que cubre toda la ventana (sidebar incluido), card centrada `max-w-[480px]` idéntica al mockup (`#FBF4EC`, borde `#ECE0D0`, radius 24, sombra).
- Header: título "Vincular padre" (Fredoka 600 18px) + subtítulo dinámico "a {kid.fullName}" (13px `#A89A8B`) + botón X 34px (`#F0E6D8` / `#94887B`).
- Bloque informativo `#E3ECFB` con ícono de info (`#4E72C8`) y copy dinámico "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {firstName}.".
- Campos: NOMBRE DEL PADRE/MADRE (placeholder "Ej. Diego Fernández") y EMAIL (placeholder "correo@ejemplo.com"), con los estilos del mockup.
- PARENTESCO: 3 botones (Mamá / Papá / Tutor/a) con **selección interactiva** (Mamá por defecto); seleccionado `#CCD8F4`/borde `#9FB8EC`/texto `#4E72C8`, no seleccionado `#FFFDF9`/borde `#ECE0D0`/texto `#6E6359`.
- Caja CÓDIGO DE INVITACIÓN **literal "7K4P9"** (`#FBF1D6`, borde dashed `#E6D08A`, código Fredoka 34px con letter-spacing 7px, "Vence en 7 días").
- CTA "Enviar invitación" con ícono de envío y gradiente `linear-gradient(180deg,#F4977E,#EE8164)`.
- Validación visual ligera: al pulsar "Enviar invitación" con nombre vacío o email con formato inválido, esos campos quedan con borde rojo `#E46A4F` y el modal no se cierra (sin mensajes de texto).
- Cierre por: X, tecla `Escape`, clic en el backdrop y "Enviar invitación" (si pasa validación). Al cerrar se resetea el formulario y el parentesco vuelve a Mamá.
- Íconos nuevos en `components/icons.tsx`: `CloseIcon`, `InfoIcon`, `SendIcon` (geometría copiada del mockup).

**Out of scope (specs futuras):**

- Persistencia, API, envío de correo real o alta efectiva de un padre.
- Modificar la lista `kid.parents` o agregar un badge "PENDIENTE" al enviar.
- Navegación a `perfil-nino.dc.html`: la X y el CTA del mockup son links, aquí solo cierran.
- Código de invitación generado o único por niño (queda literal `7K4P9`).
- Edición de padres existentes.
- Responsive móvil y trap de foco completo.

## Data model

Esta spec no introduce estructuras de datos nuevas ni toca `data/mock/kids.ts`. El único dato que recibe el componente es el nombre del niño, vía prop.

```ts
// components/LinkParentModal.tsx
type LinkParentRelation = "mother" | "father" | "guardian";

// Estado local del formulario (no persiste):
// { fullName: string; email: string; relation: LinkParentRelation }
```

`kidName: string` se pasa desde `app/kids/[slug]/page.tsx` como `kid.fullName`; el primer nombre para el copy del aviso se deriva con `kidName.split(" ")[0]`.

## Implementation plan

1. `components/icons.tsx`: agregar `CloseIcon` (path `M18 6 6 18M6 6l12 12`), `InfoIcon` (circle `12,12,r10` + `M12 16v-4M12 8h.01`) y `SendIcon` (`m22 2-7 20-4-9-9-4z` + `M22 2 11 13`). Verificar: `npx tsc --noEmit`.
2. `components/LinkParentModal.tsx` (cliente): trigger `<button>` que replica el enlace "Vincular otro padre" (círculo punteado `border-[#D8CBBA]` + `PlusIcon` + texto `#C5503A`) y estado `open`; overlay con backdrop `bg-[rgba(63,54,46,0.5)]` que cierra al clic fuera y panel `max-w-[480px]` con el header del mockup. Roles `dialog`/`aria-modal`/`aria-labelledby`. Verificar: `npx tsc --noEmit`.
3. Completar el cuerpo del modal en el mismo componente: bloque informativo `#E3ECFB` con `InfoIcon`, campos NOMBRE/EMAIL, fila PARENTESCO con estado `relation` (`"mother"` por defecto), caja del código `7K4P9` y CTA "Enviar invitación" con `SendIcon`. Verificar visualmente contra `vincular-padre.dc.html`.
4. Lógica del formulario: estado `{ fullName, email, relation }`; `enviar()` valida nombre no vacío y email con formato válido, marca `errors` y cierra solo si todo pasa; cierre con `Escape` y reset del form + relación al abrir/cerrar. Verificar manualmente: enviar con campos vacíos pinta bordes rojos y no cierra; enviar válido cierra y el próximo abrir está limpio.
5. Integrar en `app/kids/[slug]/page.tsx`: reemplazar el `<a>` "Vincular otro padre" por `<LinkParentModal kidName={kid.fullName} />`; el resto del perfil queda intacto. Verificar: `/kids/mateo-fernandez` sigue idéntico a `perfil-nino.dc.html` y el botón abre el modal sobre la pantalla.
6. Pase final `npm run lint` + `npx tsc --noEmit` y verificación con Playwright (abrir por botón, nombre del niño en título/aviso, selección de parentesco, código `7K4P9`, validación roja, cierres por X/Escape/backdrop/Enviar válido).

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] En `/kids/mateo-fernandez`, clic en "Vincular otro padre" abre el modal centrado con backdrop oscuro que cubre todo (sidebar incluido).
- [ ] El modal replica `vincular-padre.dc.html`: header "Vincular padre" (Fredoka) / "a Mateo Fernández" / botón X; bloque azul de aviso; campos NOMBRE DEL PADRE/MADRE y EMAIL con sus placeholders; fila PARENTESCO; caja "CÓDIGO DE INVITACIÓN" con `7K4P9` y "Vence en 7 días"; CTA "Enviar invitación" con ícono.
- [ ] El subtítulo dice "a {nombre del niño}" y el aviso dice "Solo verá el feed de {primer nombre}" según el perfil abierto (p. ej. "a Mateo Fernández" / "…el feed de Mateo").
- [ ] PARENTESCO permite seleccionar Mamá, Papá o Tutor/a, con Mamá seleccionada por defecto y el estilo de resaltado del mockup.
- [ ] El código de invitación muestra siempre `7K4P9`.
- [ ] Al pulsar "Enviar invitación" con nombre vacío o email inválido, los campos faltantes quedan con borde rojo y el modal permanece abierto.
- [ ] Con nombre y email válidos, "Enviar invitación" cierra el modal, la lista de padres del perfil no cambia y el formulario queda limpio la próxima vez que se abre.
- [ ] La X, la tecla `Escape` y el clic en el backdrop cierran el modal sin modificar el perfil.
- [ ] A 1280×800 el modal abierto luce como `references/pantallas/vincular-padre.dc.html` (no hay screenshot PNG de esta pantalla) y el perfil cerrado sigue idéntico a `perfil-nino.dc.html`.

## Decisions

- **Yes:** trigger = el enlace "Vincular otro padre" convertido en `<button>` conservando el diseño (respuesta del usuario). Evita un botón nuevo y no rompe el layout del panel.
- **No:** crear un botón "Vincular padre" adicional. Duplicaría el acceso que ya existe.
- **Yes:** modal como overlay de estado cliente con backdrop (respuesta del usuario). Consistente con `AddKidModal` (SPEC 04).
- **No:** card centrada sin backdrop. Se alejaría del patrón ya establecido en la app.
- **Yes:** nombre del niño dinámico en título y aviso (respuesta del usuario). El modal funciona en los 8 perfiles, no solo Mateo.
- **No:** hardcodear "Mateo Fernández". Coherencia con `Kid` de SPEC 02.
- **Yes:** parentesco con selección interactiva, Mamá por defecto (respuesta del usuario). Es solo UI, sin persistencia.
- **No:** fila PARENTESCO estática. El mockup ya resalta una opción; hacerla seleccionable es gratis en un componente cliente.
- **Yes:** código de invitación literal `7K4P9` (respuesta del usuario). Réplica del mockup sin lógica extra.
- **No:** generar código aleatorio. No aporta a una pantalla sin persistencia.
- **Yes:** validación visual ligera al enviar (borde rojo, sin mensajes), coherente con SPEC 04.
- **No:** enviar siempre / deshabilitar el CTA. Se muestra qué es obligatorio sin construir lógica de errores real.
- **Yes:** X, `Escape`, backdrop y "Enviar invitación" válido cierran y resetean (respuesta del usuario). Flujo de demo completo sin tocar el perfil.
- **No:** navegar a `perfil-nino.dc.html` desde la X/CTA. La app es SPA; el mockup enlazaba entre páginas estáticas.
- **Yes:** tipo local `LinkParentRelation` (`mother`/`father`/`guardian`) en el componente. `ParentRelation` de SPEC 02 no incluye "guardian" y describe padres ya vinculados; no se toca ese modelo.
- **No:** persistir ni agregar el padre a `kid.parents`. El usuario pidió explícitamente "solo interfaz, sin base de datos".
- **Yes:** trigger dentro de `LinkParentModal`. Mantiene `app/kids/[slug]/page.tsx` como server component, igual que SPEC 04.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| El mockup `vincular-padre.dc.html` es una página standalone, no un overlay con sidebar detrás | Comparar solo la card (ancho 480px y contenido); el contexto con sidebar se valida contra el perfil + backdrop. |
| Regresión en `/kids/[slug]` (SPEC 02) al convertir el `<a>` en `<button>` dentro del componente | Conservar markup/clases exactas del enlace; verificar el perfil tras el paso 5. |
| Modal cliente: warning de React o focus/Escape mal manejados | Probar `Escape`, backdrop y `aria-modal` en el paso 6 con Playwright. |
| El copy dinámico usa solo el primer nombre; nombres compuestos podrían recortarse | Es el comportamiento esperado del aviso ("Solo verá el feed de Mateo"); documentado aquí. |

## What is **not** in this spec

- Persistencia, API, envío de correo real o alta efectiva de un padre.
- Modificar `kid.parents` o agregar un badge "PENDIENTE".
- Navegación a `perfil-nino.dc.html` desde la X o el CTA.
- Código de invitación generado o único por niño.
- Edición de padres existentes.
- Responsive móvil ni trap de foco completo.

Cada uno de esos, si llega, va en su propia spec.
