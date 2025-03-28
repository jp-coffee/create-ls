import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/explicit-function-return-type": "error",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
