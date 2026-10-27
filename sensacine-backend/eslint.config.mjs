import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "coverage/**", "prisma/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Se avisa pero no bloquea: el código existente usa `any` en varios puntos.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "jest.setup.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  }
);
