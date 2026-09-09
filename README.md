# SensaCine

Plataforma de cine inmersivo y experiencias gastronómicas sensoriales.

---

## 📁 Estructura del Repositorio

- **[`frontend/`](./frontend)**: Aplicación cliente en **React 18 + TypeScript + Vite + Tailwind CSS + React Query + Zustand**, diseñada con estética **Apple Dark & Frosted Glass**.
- **[`sensacine-backend/`](./sensacine-backend)**: Servidor Backend en **Node.js + TypeScript + Express + Prisma ORM + PostgreSQL** con arquitectura por capas, DTOs y validación Zod.

---

## 🚀 Inicio Rápido

### 1. Iniciar el Backend
```bash
cd sensacine-backend
npm install
# Configurar .env con tu PostgreSQL
npx prisma db push
npm run seed     # Inserta las 15 películas y usuario admin inicial
npm run dev      # Servidor en http://localhost:3000
```

### 2. Iniciar el Frontend
```bash
cd frontend
npm install
npm run dev      # Cliente en http://localhost:5173
```
