import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Assets read-only de referencia (mockups dc-runtime generados). No forman parte del build y no deberían lintearse.
    "references/**",
    // Artefactos generados por Playwright MCP durante la verificación.
    ".playwright-mcp/**",
  ]),
]);

export default eslintConfig;
