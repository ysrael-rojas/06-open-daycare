---
description: Verifica y marca los criterios de aceptación de un spec en specs/. Uso: /verify-spec <NN | slug | NN-slug | ruta>
agent: spec-verifier
---

Verificá los criterios de aceptación del spec: $ARGUMENTS

Seguí el workflow del agente spec-verifier: localizá el spec, revisá contexto y Next.js (docs locales + Context7), corré lint/typecheck, validá las pantallas con Playwright contra references/, marcá `- [x]` solo los criterios que pasan (desmarcando regresiones) y reportá en el chat con evidencia.
