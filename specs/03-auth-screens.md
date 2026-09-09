# SPEC 03 — Login y activación de cuenta

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-09
> **Objective:** Implementar las rutas standalone `/login` y `/activar-cuenta` replicando visualmente `references/pantallas/login.dc.html` y `activar-cuenta.dc.html` —sin el selector "Personal / Familia" en el login y sin navegación real en ningún elemento—, sin agregarlas al sidebar.

## Scope

**In:**

- Ruta `/login`: réplica de las 2 columnas del mockup (panel de marca degradado a la izquierda + formulario a la derecha), **eliminando** por completo el bloque "INGRESO COMO" con los botones "Personal" y "Familia".
- Ruta `/activar-cuenta`: réplica centrada del mockup con los valores del mockup pre-rellenados (card "Mateo · Sala Soles", código `7K4P9`, email `lucia.fernandez@gmail.com`, contraseña enmascarada, check de autorización marcado).
- Formularios decorativos estáticos (server components, sin estado): inputs vacíos o con valor literal según pantalla, sin validación ni submit.
- Páginas autocontenidas (`app/login/page.tsx`, `app/activar-cuenta/page.tsx`), sin `Sidebar`, sin shell de la app y sin `data/mock/`.
- Reuso del tema de SPEC 01: `next/font/google` ya en `app/layout.tsx`, utilidad `font-display` (Fredoka), `SunIcon` de `components/icons.tsx` (idéntico al sol de ambos mockups), body Nunito.
- Copia 100% literal del texto en español de ambos mockups.

**Out of scope (specs futuras):**

- Autenticación real, sesiones, validación de formularios ni envío de datos.
- Cualquier navegación entre estas pantallas o hacia el feed (`/`) desde estos formularios.
- Pantallas de familia (familia-feed, familia-cuenta) y los destinos "post-login".
- Responsive móvil.
- Agregar ítems al sidebar o tocar `components/Sidebar.tsx`.

## Data model

Esta spec no introduce estructuras de datos nuevas ni archivos de mock. Los textos visibles en español y los valores pre-rellenados son literales de cada página (la invitación es dato ficticio de una sola pantalla, no un modelo reutilizable). Convención de código limpio de SPEC 01: identificadores/clases en inglés; el copy mostrado queda en español.

## Implementation plan

1. Crear `app/login/page.tsx` (server component, sin `Sidebar`): contenedor `min-h-screen` con `bg-[#FBF4EC]` y grid `1.05fr 1fr`. Columna izquierda con degradado `linear-gradient(155deg,#F6A98E 0%,#F2937A 45%,#EC7E62 100%)`, los dos círculos decorativos blancos translúcidos, fila de marca (caja 46px `rgba(255,255,255,.22)` radius 14 + `SunIcon` blanco 26px + "OpenDayCare" en `font-display`), h1 "El día de cada niño, / compartido con su familia.", párrafo y footer "🌿 Guardería Sala Soles". Columna derecha centrada (max-width 392px): h2 "Iniciar sesión", subtítulo, labels "EMAIL"/"CONTRASEÑA", input email **vacío**, input password con placeholder "••••••••", "¿Olvidaste tu contraseña?" visual, CTA degradado `linear-gradient(180deg,#F4977E,#EE8164)` "Iniciar sesión", y footer "¿Te invitó la guardería? Activá tu cuenta" visual. Verificar: `npx tsc --noEmit` y `/login` a 1280px muestra ambas columnas sin "INGRESO COMO"/"Personal"/"Familia".
2. Crear `app/activar-cuenta/page.tsx` (server component): contenedor centrado `bg-[#FBF4EC]` max-width 440px con el logo 58px (degradado `linear-gradient(155deg,#F8C3A8,#F2937A)` + `SunIcon`), h1 "Bienvenida a OpenDayCare", párrafo introductorio, card de invitado (`#fff`/`#EADFD0`, avatar "M" `#A9D9E8`/`#1F7A93`, "Te invitaron a seguir a" + "Mateo · Sala Soles"), inputs pre-rellenados con `defaultValue` (código `7K4P9` Fredoka con letter-spacing, email, contraseña enmascarada con borde `#F2A78E`), fila de autorización `#FBF1D6` con check `#5FB97E`, CTA "Activar mi cuenta" y footer "¿Ya tenés cuenta? Iniciar sesión" visual. Verificar: `/activar-cuenta` a 1280px replica el mockup.
3. Ajustes finos de fidelidad comparando ambas rutas con `references/pantallas/login.dc.html` y `activar-cuenta.dc.html` (radios 14–18px, letter-spacing de labels `.7px`, sombras de CTAs `0 10px 22px -8px rgba(238,129,100,.7)`) y pase final de `npm run lint` + `npx tsc --noEmit`. Verificar que ningún elemento navega (sin `<a href>`/`<Link>` en ninguna página).

## Acceptance criteria

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] `/login` tiene layout de 2 columnas: panel izquierdo degradado con decoraciones, "OpenDayCare", h1 "El día de cada niño, compartido con su familia.", párrafo y "🌿 Guardería Sala Soles"; derecha con "Iniciar sesión", "Ingresá para ver el día de hoy." y el formulario.
- [ ] En `/login` no aparece el texto "INGRESO COMO", ni "Personal", ni "Familia"; el input de email está vacío y el de contraseña muestra placeholder "••••••••".
- [ ] En `/login` están "¿Olvidaste tu contraseña?", el CTA "Iniciar sesión" y el footer "¿Te invitó la guardería? Activá tu cuenta" (en `#C5503A`).
- [ ] `/activar-cuenta` muestra logo, "Bienvenida a OpenDayCare", la card "Te invitaron a seguir a / Mateo · Sala Soles" (avatar "M"), y los inputs pre-rellenados `7K4P9`, `lucia.fernandez@gmail.com` y contraseña enmascarada (con borde `#F2A78E`).
- [ ] En `/activar-cuenta` la fila de autorización está marcada (`#FBF1D6`, check `#5FB97E`, texto "Autorizo a la guardería…"), con CTA "Activar mi cuenta" y footer "¿Ya tenés cuenta? Iniciar sesión".
- [ ] Ninguna de las dos páginas importa `Sidebar` ni muestra el nav de la app (Feed/Niños/Avisos/Mi cuenta).
- [ ] Clic en cualquier botón o vínculo de ambas páginas no navega a ninguna ruta (no produce 404 ni cambio de URL).
- [ ] A 1280×800 `/login` y `/activar-cuenta` lucen idénticas a sus mockups `.dc.html` (no hay screenshots para estas dos pantallas; comparación visual manual + verificación con Playwright del texto/estructura).

## Decisions

- **Yes:** mantener las 2 columnas del login y eliminar solo el bloque de rol. Réplica fiel; el selector era un mecanismo de demo (cambiaba email y destino según rol).
- **No:** simplificar el login a una sola columna centrada. Se alejaría del mockup sin beneficio.
- **Yes:** email del login vacío. El pre-relleno `caro@opendaycare.com` era un artefacto del toggle de rol que ya no existe.
- **No:** mantener un valor de email por defecto en el login.
- **Yes:** `/activar-cuenta` con valores pre-rellenados literales del mockup (código, email, contraseña enmascarada, check marcado). Réplica visual exacta.
- **Yes:** sin navegación en ningún elemento de ambas pantallas, incluido el vínculo entre `/login` y `/activar-cuenta`. Decisión explícita del usuario: pantallas 100% GUI.
- **No:** `<Link>`/`href` hacia `/`, `/login` o `/activar-cuenta` (rutas ya existentes) en estos CTA. Se conectará cuando exista flujo de autenticación real.
- **Yes:** páginas autocontenidas por ruta, sin `data/mock/` ni shell compartido. La invitación es dato ficticio de una pantalla; a diferencia de feed/kids no se reutiliza.
- **No:** crear `data/mock/auth.ts` ni componentes `components/auth/*`. Overengineering para dos literales de una sola pantalla.
- **Yes:** `SunIcon` existente en `components/icons.tsx` (stroke 2.2, misma geometría que el sol de ambos mockups) para la marca; sin íconos ni dependencias nuevas.
- **Yes:** inputs no controlados con `defaultValue`. Evita el warning de React de `value` sin `onChange` en una pantalla sin estado.
- **No:** interactividad client (`use client`) ni lógica de formulario en esta spec.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Inputs con `value` sin `onChange` generan warning de React en consola | Usar `defaultValue` (no controlados) en los inputs pre-rellenados. |
| Fondo global `#F6ECDF` (SPEC 01) difiere del fondo de estos mockups `#FBF4EC` | Cada página fija su propio contenedor con `bg-[#FBF4EC]` y `min-h-screen`. |
| No existen screenshots PNG de login/activar-cuenta | Comparación manual contra los `.dc.html` y verificación estructural con Playwright en `/verify-spec`. |
| Que "sin navegación" confunda en un futuro (pantallas aisladas sin forma de llegar) | Documentado en Decisions; se enlazará en una spec de autenticación. |

## What is **not** in this spec

- Autenticación, sesión, validación ni envío de formularios.
- Navegación real desde estos formularios (ni hacia el feed, ni entre `/login` y `/activar-cuenta`).
- Cambios en el `Sidebar` ni en las rutas existentes (`/`, `/kids`).
- Pantallas de familia ni destinos post-login.
- Responsive móvil.

Cada uno de esos, si llega, va en su propia spec.
