/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  // Cobertura medida sobre la lógica de negocio (services y plantillas), no sobre
  // controllers/routes/repositorios, que dependen de Express o de la BD real.
  collectCoverageFrom: ["src/modules/**/*.service.ts", "src/modules/**/*.template.ts"],
  coverageReporters: ["text", "lcov", "json-summary"],
  // Si la cobertura baja de 70 %, `npm run test:coverage` falla y bloquea el PR.
  coverageThreshold: {
    global: { statements: 70, branches: 70, functions: 70, lines: 70 },
  },
};
