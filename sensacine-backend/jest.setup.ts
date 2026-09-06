/// <reference types="node" />

// Se carga antes de cada suite de tests (ver jest.config.js -> setupFiles).
// Los tests unitarios nunca tocan la base de datos real, pero env.ts exige
// estas variables para arrancar, así que les damos valores dummy aquí.
process.env.DATABASE_URL ||= "postgresql://user:pass@localhost:5432/sensacine_test?schema=public";
process.env.JWT_SECRET ||= "test-secret-not-used-in-unit-tests";
