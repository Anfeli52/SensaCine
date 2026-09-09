# SensaCine — Backend

Backend para el sistema de **SensaCine**. Diseñado con una arquitectura limpia y modular por capas (`routes` → `controller` → `service` → `repository`), inyección de dependencias desacoplada, DTOs con tipado estricto y validación de esquemas con **Zod**, autenticación **JWT** y control de acceso basado en roles, y **Prisma ORM** conectado a **PostgreSQL**.

---

## 📁 Estructura del Proyecto

```
sensacine-backend/
├── prisma/
│   ├── schema.prisma        # 16 entidades del MER mapeadas a PostgreSQL
│   ├── seed.ts              # Script de seed (15 películas + usuario admin inicial)
│   └── migrations/          # Historial de migraciones generado con prisma migrate
├── src/
│   ├── modules/
│   │   ├── auth/             # ✅ Módulo de Autenticación (Registro y Login con JWT)
│   │   │   ├── dtos/         # RegisterDTO, LoginDTO, AuthResponseDTO, LoginResponseDTO
│   │   │   ├── __tests__/    # Tests unitarios con mock repository
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.validator.ts
│   │   ├── catalogo/         # ✅ Módulo de Catálogo y Películas (CRUD completo)
│   │   │   ├── dtos/         # CreatePeliculaDTO, UpdatePeliculaDTO, PeliculaResponseDTO
│   │   │   ├── __tests__/    # Tests unitarios para PeliculaService
│   │   │   ├── pelicula.controller.ts
│   │   │   ├── pelicula.service.ts
│   │   │   ├── pelicula.repository.ts
│   │   │   ├── pelicula.routes.ts
│   │   │   ├── pelicula.types.ts
│   │   │   └── pelicula.validator.ts
│   │   ├── menu/             # Productos, restricciones alimentarias
│   │   ├── reservas/         # Reservas, reserva_asiento, reserva_restriccion
│   │   ├── pagos/            # Pasarela de pagos
│   │   ├── resenas/          # Calificaciones post-función
│   │   ├── notificaciones/   # Envíos de correos y alertas
│   │   ├── cocina/           # Panel de órdenes de cocina
│   │   └── admin/            # Panel administrativo
│   ├── common/
│   │   ├── errors/AppError.ts
│   │   ├── middlewares/errorHandler.ts
│   │   ├── middlewares/validateSchema.ts
│   │   ├── middlewares/authMiddleware.ts  # Autenticación JWT y requireRole("admin")
│   │   └── helpers/asyncHandler.ts
│   ├── infrastructure/
│   │   ├── prisma/client.ts   # Instancia Singleton de PrismaClient
│   │   ├── logger/winston.ts  # Logger estructurado con Winston
│   │   └── email/             # Servicio de correo
│   ├── config/env.ts          # Validación de variables de entorno con Zod
│   ├── di/container.ts        # Inyección de dependencias (Composition Root)
│   ├── app.ts                 # Configuración de Express, middlewares y rutas
│   └── server.ts              # Inicialización y arranque del servidor HTTP
├── .env.example               # Plantilla de variables de entorno
├── .env                       # Variables de entorno locales (NO subir a Git)
├── package.json
└── tsconfig.json
```

---

## 🛠️ Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **npm**: Versión 9 o superior.
- **PostgreSQL**: Servidor corriendo localmente o en la nube.

---

## 🚀 Guía de Instalación y Comandos Paso a Paso

### Paso 1: Instalar Dependencias
```bash
npm install
```

---

### Paso 2: Configurar las Variables de Entorno (`.env`)
> ⚠️ **Importante**: El archivo `.env` debe ubicarse en la **raíz de `sensacine-backend/`** (NO dentro de la carpeta `src/`).

Crea tu archivo `.env` a partir del archivo de ejemplo:

**En Linux / macOS / Git Bash:**
```bash
cp .env.example .env
```

**En Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Ajusta tus credenciales reales de PostgreSQL en `.env`:
```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/sensacine?schema=public"
JWT_SECRET="sensacine-super-secreto-desarrollo-2026"
BCRYPT_SALT_ROUNDS=10
```

---

### Paso 3: Generar el Cliente de Prisma
```bash
npm run prisma:generate
```

---

### Paso 4: Sincronizar Base de Datos y Crear Tablas
```bash
npx prisma db push
```
*(O `npm run prisma:migrate` para flujo con archivos de migración).*

---

### Paso 5: Poblar la Base de Datos con el Dataset Inicial (Seed)
Inserta **15 películas populares con posters en alta resolución** y crea el usuario **Administrador** por defecto:
```bash
npm run seed
```

> **Credenciales del Administrador creado:**
> - **Email:** `admin@sensacine.com`
> - **Contraseña:** `Admin1234!`
> - **Rol:** `admin`

---

### Paso 6: Iniciar el Servidor en Desarrollo
```bash
npm run dev
```
Consola: `🚀 Servidor SensaCine escuchando en http://localhost:3000`

---

## 🎬 Endpoints del Módulo de Películas (`/api/peliculas`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/peliculas` | **Público** | Lista las películas activas para la pantalla principal. (Usa `?todas=true` para listar todo). |
| `GET` | `/api/peliculas/:id` | **Público** | Obtiene el detalle de una película por su ID. |
| `POST` | `/api/peliculas` | **Solo Admin** (`Bearer Token`) | Crea una nueva película. |
| `PUT` | `/api/peliculas/:id` | **Solo Admin** (`Bearer Token`) | Actualiza una película existente. |
| `DELETE` | `/api/peliculas/:id` | **Solo Admin** (`Bearer Token`) | Elimina una película. |

---

## 🧪 Pruebas del Módulo de Películas y Autenticación

### 1. Pruebas Unitarias (Automáticas con Jest)
```bash
npm test
```
Ejecuta 9 pruebas unitarias verificando lógica de películas (filtrado activas, validaciones, CRUD con mock repository) y autenticación.

---

### 2. Pruebas de Endpoints HTTP

#### A. Listar Películas Activas (Pantalla Principal - Público)
```bash
curl http://localhost:3000/api/peliculas
```
**Respuesta:** Array con las 15 películas activas con sus títulos, sinopsis, duración, género, posterUrl y precioBaseExperiencia.

---

#### B. Obtener Detalle de una Película
```bash
curl http://localhost:3000/api/peliculas/1
```

---

#### C. Iniciar Sesión como Administrador (`POST /api/auth/login`)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sensacine.com", "password": "Admin1234!"}'
```
**Respuesta esperada (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "usuario": {
    "id": 1,
    "nombre": "Administrador SensaCine",
    "email": "admin@sensacine.com",
    "rol": "admin"
  }
}
```

---

#### D. Crear Nueva Película (Requiere Token de Administrador)
```bash
curl -X POST http://localhost:3000/api/peliculas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PEGA_AQUI_TU_TOKEN_JWT>" \
  -d '{
    "titulo": "Deadpool & Wolverine",
    "sinopsis": "Wolverine se recupera de sus heridas cuando se cruza con Deadpool.",
    "duracionMinutos": 128,
    "genero": "Acción / Comedia",
    "clasificacion": "R",
    "posterUrl": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    "precioBaseExperiencia": 29000
  }'
```
*(Si intentas llamar este endpoint sin token o con un usuario de rol cliente, recibirás un código `401 Unauthorized` o `403 Forbidden`).*

---

#### E. Actualizar y Eliminar Película (Admin)
```bash
# Actualizar precio o datos
curl -X PUT http://localhost:3000/api/peliculas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d '{"precioBaseExperiencia": 31000}'

# Eliminar película
curl -X DELETE http://localhost:3000/api/peliculas/16 \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

---

## 📋 Resumen de Scripts de `package.json`

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor en modo desarrollo con `ts-node-dev` (hot-reload). |
| `npm run seed` | Ejecuta `prisma/seed.ts` e inserta el dataset de 15 películas y el usuario admin. |
| `npm run build` | Compila el código TypeScript a JavaScript en la carpeta `dist/`. |
| `npm start` | Ejecuta la versión compilada en producción desde `dist/server.js`. |
| `npm test` | Ejecuta todos los tests unitarios con Jest. |
| `npm run test:watch` | Ejecuta los tests en modo interactivo/watch. |
| `npm run prisma:generate` | Genera y actualiza los tipos del cliente Prisma en TypeScript. |
| `npm run prisma:migrate` | Aplica migraciones de esquema a la base de datos de PostgreSQL. |
| `npm run prisma:studio` | Abre la interfaz gráfica web de Prisma en `http://localhost:5555`. |

---

## 🔧 Solución a Problemas Comunes (Troubleshooting)

### 1. `❌ Variables de entorno inválidas`
- Asegúrate de tener el archivo `.env` en la raíz `sensacine-backend/.env` con todas las variables requeridas.

### 2. `Can't reach database server at localhost:5432`
- Verifica que el servicio de PostgreSQL esté iniciado y las credenciales en `DATABASE_URL` sean correctas.

### 3. `Token de autenticación no proporcionado / inválido`
- Agrega el encabezado `Authorization: Bearer <token>` obtenido tras hacer login en `/api/auth/login`.
