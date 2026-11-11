const umbral70 = { statements: 70, branches: 70, functions: 70, lines: 70 };

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
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  // Umbral del 70 %: si baja, `npm run test:coverage` falla y el PR queda bloqueado.
  // Se exige en el conjunto Y en cada módulo, para que uno flojo no se esconda
  // detrás de otros al 100 %. Al agregar un módulo nuevo, súmalo a esta lista.
  coverageThreshold: {
    global: umbral70,
    "./src/modules/admin/": umbral70,
    "./src/modules/auditoria/": umbral70,
    "./src/modules/auth/": umbral70,
    "./src/modules/catalogo/": umbral70,
    "./src/modules/cocina/": umbral70,
    "./src/modules/menu/": umbral70,
    "./src/modules/notificaciones/": umbral70,
    "./src/modules/programacion/": umbral70,
    "./src/modules/reservas/": umbral70,
  },
};
