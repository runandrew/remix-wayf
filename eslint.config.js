import { defineConfig, includeIgnoreFile } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { importX } from "eslint-plugin-import-x";
import { fileURLToPath } from "node:url";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));
const scriptFiles = ["**/*.{js,jsx,ts,tsx}"];
const typeScriptFiles = ["**/*.{ts,tsx}"];

export default defineConfig(
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  {
    files: scriptFiles,
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.commonjs,
      },
    },
  },
  {
    files: scriptFiles,
    ...react.configs.flat.recommended,
    settings: {
      // "detect" calls context.getFilename(), which ESLint 10 removed.
      react: {
        version: "19.3",
      },
    },
  },
  {
    files: scriptFiles,
    ...react.configs.flat["jsx-runtime"],
  },
  {
    files: scriptFiles,
    ...jsxA11y.flatConfigs.recommended,
    settings: {
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
  },
  {
    files: scriptFiles,
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: typeScriptFiles,
  })),
  {
    files: typeScriptFiles,
    ...importX.flatConfigs.recommended,
  },
  {
    files: typeScriptFiles,
    rules: {
      // An interface that only extends another type is how react/prop-types
      // sees component props. A type alias hides them.
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
    },
  },
  {
    files: typeScriptFiles,
    ...importX.flatConfigs.typescript,
    settings: {
      "import-x/internal-regex": "^(@/|~/)",
      "import-x/core-modules": ["virtual:react-router/server-build"],
      "import-x/resolver": {
        node: {
          extensions: [".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
);
