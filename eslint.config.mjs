import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "PropertyDefinition[definite=true]",
          message:
            "Do not use definite assignment assertions. Initialize the property or model it as optional.",
        },
        {
          selector: "VariableDeclarator[definite=true]",
          message:
            "Do not use definite assignment assertions. Initialize the variable or model it as optional.",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prettier.config.mjs",
    "vitest.config.ts",
    "**/*.test.ts",
  ]),
]);

export default eslintConfig;
