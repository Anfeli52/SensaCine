# SensaCine — Backend

Backend para el sistema de **SensaCine**. Diseñado con una arquitectura limpia y modular por capas (`routes` → `controller` → `service` → `repository`), inyección de dependencias desacoplada, DTOs con tipado estricto y validación de esquemas con **Zod**, y **Prisma ORM** conectado a **PostgreSQL**.

---

## 📁 Estructura del Proyecto

```
sensacine-backend/
├── prisma/
│   ├── schema.prisma        # 16 entidades del MER mapeadas a PostgreSQL
│   └── migrations/          # Historial de migraciones generado con prisma migrate
├── src/
│   ├── modules/
│   │   ├── auth/             # ✅ Módulo de Autenticación y Registro de Usuarios
│   │   │   ├── dtos/         # DTOs de entrada y salida (RegisterDTO, AuthResponseDTO)
│   │   │   ├── __tests__/    # Tests unitarios con mocks (sin tocar la BD)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.validator.ts
│   │   ├── catalogo/         # Películas, salas, asientos, funciones
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
- **PostgreSQL**: Servidor corriendo localmente (puerto `5432` por defecto) o en la nube (Supabase, Neon, Railway, Docker, etc.).

---

## 🚀 Guía de Instalación y Comandos Paso a Paso

### Paso 1: Instalar Dependencias
Instala los paquetes necesarios del proyecto.
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

Abre el archivo `.env` y coloca tus credenciales reales de PostgreSQL:
```env
NODE_ENV=development
PORT=3000

# Formato: postgresql://<usuario>:<password>@<host>:<puerto>/<nombre_base_datos>?schema=public
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/sensacine?schema=public"

JWT_SECRET="sensacine-super-secreto-desarrollo-2026"
BCRYPT_SALT_ROUNDS=10
```

---

### Paso 3: Generar el Cliente de Prisma (`prisma generate`)
Lee el archivo `prisma/schema.prisma` y compila los tipos de TypeScript y métodos del ORM dentro de `node_modules/@prisma/client`:
```bash
npm run prisma:generate
```

---

### Paso 4: Crear la Base de Datos y las Tablas

Existen dos alternativas según el flujo de trabajo:

#### Opción A (Recomendada para equipo): Ejecutar Migraciones
Crea la base de datos si no existe, ejecuta las sentencias SQL para crear las 16 tablas y guarda el historial en `prisma/migrations/`:
```bash
npm run prisma:migrate
```
*Si es la primera vez, la terminal te pedirá un nombre para la migración. Escribe: `init`*.

#### Opción B (Prototipado rápido): Sincronizar Esquema Directo
Si solo deseas sincronizar el esquema con la base de datos sin generar archivos de migración:
```bash
npx prisma db push
```

---

### Paso 5: Explorar la Base de Datos Visualmente (Opcional)
Abre una interfaz gráfica web en `http://localhost:5555` para ver, insertar y editar registros en las tablas de PostgreSQL:
```bash
npm run prisma:studio
```

---

### Paso 6: Iniciar el Servidor en Desarrollo
Inicia el servidor con recarga automática en caliente (*hot-reloading*):
```bash
npm run dev
```
Deberías ver en consola:
```
🚀 Servidor SensaCine escuchando en http://localhost:3000
```

---

## 🧪 Pruebas del Módulo de Autenticación (`auth`)

El módulo `auth` cuenta con dos niveles de pruebas:

### 1. Pruebas Unitarias (Automáticas con Jest - Sin necesidad de Base de Datos)
Verifican la lógica del servicio `AuthService`, el hashing seguro con `bcrypt`, que nunca se exponga el `passwordHash` y el manejo de errores de duplicados usando un repositorio mock en memoria:
```bash
npm test
```
Para ejecutar en modo observador durante desarrollo:
```bash
npm run test:watch
```

---

### 2. Pruebas de Endpoints HTTP (Servidor en ejecución)

Asegúrate de que el servidor esté corriendo (`npm run dev`) y realiza las siguientes pruebas:

#### A. Health Check (Verificar que el servidor responde)
- **cURL / Git Bash / Linux / macOS:**
  ```bash
  curl http://localhost:3000/health
  ```
- **Windows PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
  ```
- **Respuesta esperada:**
  ```json
  { "status": "ok" }
  ```

---

#### B. Registro de Usuario Exitoso (`POST /api/auth/register`)
- **cURL / Git Bash / Linux / macOS:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"nombre": "Ana Torres", "email": "ana@example.com", "password": "supersecreta123"}'
  ```
- **Windows PowerShell:**
  ```powershell
  $body = @{
    nombre = "Ana Torres"
    email = "ana@example.com"
    password = "supersecreta123"
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
  ```
- **Respuesta esperada (201 Created):**
  ```json
  {
    "id": 1,
    "nombre": "Ana Torres",
    "email": "ana@example.com",
    "rol": "cliente"
  }
  ```

---

#### C. Validación de Datos Incorrectos (`400 Bad Request`)
Prueba enviando una contraseña muy corta (menos de 8 caracteres) o un email inválido:
- **cURL:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"nombre": "A", "email": "email-no-valido", "password": "123"}'
  ```
- **Respuesta esperada (400 Bad Request):**
  ```json
  {
    "error": "Datos inválidos",
    "details": {
      "nombre": ["El nombre debe tener al menos 2 caracteres"],
      "email": ["Email inválido"],
      "password": ["La contraseña debe tener al menos 8 caracteres"]
    }
  }
  ```

---

#### D. Manejo de Email Duplicado (`409 Conflict`)
Vuelve a enviar la petición con el mismo email que ya registraste previamente:
- **Respuesta esperada (409 Conflict):**
  ```json
  {
    "error": "Ya existe un usuario registrado con este email"
  }
  ```

---

## 📋 Resumen de Scripts de `package.json`

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor en modo desarrollo con `ts-node-dev` (hot-reload). |
| `npm run build` | Compila el código TypeScript a JavaScript en la carpeta `dist/`. |
| `npm start` | Ejecuta la versión compilada en producción desde `dist/server.js`. |
| `npm test` | Ejecuta todos los tests unitarios con Jest. |
| `npm run test:watch` | Ejecuta los tests en modo interactivo/watch. |
| `npm run prisma:generate` | Genera y actualiza los tipos del cliente Prisma en TypeScript. |
| `npm run prisma:migrate` | Aplica migraciones de esquema a la base de datos de PostgreSQL. |
| `npm run prisma:studio` | Abre la interfaz gráfica web de Prisma en `http://localhost:5555`. |

---

## 🔧 Solución a Problemas Comunes (Troubleshooting)

### 1. `❌ Variables de entorno inválidas: { DATABASE_URL: [...] }`
- **Causa**: El archivo `.env` no existe en la raíz o falta alguna variable obligatoria (`DATABASE_URL`, `JWT_SECRET`).
- **Solución**: Asegúrate de tener el archivo `.env` en `sensacine-backend/.env` (no en `src/.env`) y con todas las claves definidas según `.env.example`.

### 2. `Can't reach database server at localhost:5432` / `P1001`
- **Causa**: El servicio de PostgreSQL no está iniciado o las credenciales (usuario/contraseña/puerto) en `DATABASE_URL` son incorrectas.
- **Solución**:
  - Verifica que PostgreSQL esté corriendo en tu equipo (ej. en Servicios de Windows, Docker, o aplicación pgAdmin).
  - Confirma el usuario y contraseña en el `.env`.

### 3. `The database sensacine does not exist`
- **Solución**: Ejecuta `npm run prisma:migrate` y cuando Prisma pregunte si deseas crear la base de datos, presiona `y` + Enter.

### 4. `Cannot find module '@prisma/client'` o errores de tipos en modelos
- **Solución**: Ejecuta `npm run prisma:generate` para regenerar los tipos estáticos de Prisma.

### 5. Advertencias de Vulnerabilidades en `npm audit`
- **Solución**: El proyecto ya incluye `overrides` en `package.json` para fijar las versiones seguras de `tar` y `qs`. Ejecuta `npm install` para que se apliquen y `npm audit` reportará **0 vulnerabilidades**.

---

## 🧩 Cómo Replicar el Patrón para un Nuevo Módulo (Ej. `catalogo`)

1. En `src/modules/catalogo/`, crea `pelicula.types.ts` con la interfaz del repositorio (`IPeliculaRepository`).
2. Crea `pelicula.repository.ts` implementando esa interfaz usando `prisma.pelicula`.
3. Crea `pelicula.service.ts` con la lógica de negocio y validaciones.
4. Crea `pelicula.controller.ts`, `pelicula.validator.ts` y `pelicula.routes.ts`.
5. Define los DTOs en `catalogo/dtos/` (`CreatePeliculaDTO.ts`, `PeliculaResponseDTO.ts`).
6. Registra la instancia en `src/di/container.ts`.
7. Monta la ruta en `src/app.ts`: `app.use("/api/peliculas", peliculaRoutes)`.
8. Agrega los tests unitarios con repositorio falso en `catalogo/__tests__/pelicula.service.test.ts`.
