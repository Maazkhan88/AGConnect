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
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "out-*/**",
    "build/**",
    "next-env.d.ts",
    // Local build snapshots and generated output that are not source.
    "drizzle/**",
    "examples/**",
  ]),
]);

export default eslintConfig;
