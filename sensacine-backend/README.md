# SensaCine — Backend

Backend para el sistema de **SensaCine**. Diseñado con una arquitectura limpia y modular por capas (`routes` → `controller` → `service` → `repository`), inyección de dependencias desacoplada, DTOs con tipado estricto y validación de esquemas con **Zod**, autenticación **JWT** y control de acceso basado en roles, **Socket.IO** para la disponibilidad de sillas en tiempo real, envío de correo con **Nodemailer** / API de Gmail y **Prisma ORM** conectado a **PostgreSQL**.

> Visión general del proyecto: [README principal](../README.md) · Interfaz web: [README del frontend](../frontend/README.md).

---

## 📁 Estructura del Proyecto

```
sensacine-backend/
├── prisma/
│   ├── schema.prisma        # 18 modelos mapeados a PostgreSQL
│   ├── seed.ts              # Dataset de ejemplo: películas, salas, funciones, menú, usuarios y reservas
│   └── migrations/          # Historial de migraciones (prisma migrate)
├── src/
│   ├── modules/
│   │   ├── auth/            # ✅ Registro y login con JWT
│   │   ├── catalogo/        # ✅ Películas (CRUD y estados) y menú de cada película
│   │   ├── programacion/    # ✅ Salas, asientos y funciones (valida choques de horario)
│   │   ├── menu/            # ✅ Productos del menú y restricciones alimentarias (admin)
│   │   ├── reservas/        # ✅ Disponibilidad de sillas, bloqueo temporal, reserva con pago,
│   │   │                    #    "mis reservas" (activas e historial) y gestión admin
│   │   ├── pagos/           # ✅ Tarjetas simuladas, recarga de saldo y pago
│   │   ├── notificaciones/  # ✅ Correo de confirmación de la reserva
│   │   ├── admin/           # ✅ Gestión de usuarios (rol y estado)
│   │   ├── cocina/          # ⏳ Panel de órdenes de cocina (pendiente)
│   │   └── resenas/         # ⏳ Calificaciones post-función (pendiente)
│   ├── common/
│   │   ├── errors/AppError.ts
│   │   ├── middlewares/     # authMiddleware (JWT y requireRole), validateSchema, errorHandler
│   │   └── helpers/         # asyncHandler, dateUtils (zona horaria de Bogotá)
│   ├── infrastructure/
│   │   ├── prisma/client.ts # Instancia única de PrismaClient
│   │   ├── logger/winston.ts
│   │   ├── socket/          # Socket.IO: una sala por función y notificador de sillas
│   │   └── email/           # Envío de correo: API de Gmail (OAuth2) y SMTP
│   ├── scripts/send-test-email.ts   # npm run mail:test
│   ├── config/env.ts        # Validación de variables de entorno con Zod
│   ├── di/container.ts      # Inyección de dependencias (Composition Root)
│   ├── app.ts               # Express, middlewares y rutas
│   └── server.ts            # HTTP + WebSocket + barrido de reservas temporales vencidas
├── .env.example             # Plantilla de variables de entorno
├── .env                     # Variables locales (NO subir a Git)
├── package.json
└── tsconfig.json
```

Cada módulo sigue la misma organización: `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.repository.ts`, más `*.types.ts` (contratos), `*.validator.ts` (Zod), `dtos/` y `__tests__/`.

---

## 🗄️ Modelo de Datos

PostgreSQL con **18 modelos** y migraciones versionadas con Prisma (`prisma/schema.prisma`).

| Área | Modelos |
| :--- | :--- |
| **Cuentas** | `Usuario`, `Tarjeta` |
| **Catálogo y programación** | `Pelicula`, `Sala`, `Asiento`, `Funcion` |
| **Menú** | `Producto`, `RestriccionAlimentaria`, `ProductoRestriccion` |
| **Reservas** | `Reserva`, `ReservaAsiento`, `ReservaRestriccion`, `BloqueoAsiento`, `Pago` |
| **Notificaciones y cocina** | `Notificacion`, `OrdenCocina` |
| **Definidos, aún sin uso** | `Resena`, `LogAuditoria` |

- `BloqueoAsiento` guarda las sillas retenidas temporalmente (15 minutos). Una restricción única `(función, silla)` impide que dos usuarios retengan la misma. Un barrido cada 5 segundos libera las vencidas y avisa por WebSocket.
- `POST /api/reservas` crea en una sola transacción la `Reserva`, sus `ReservaAsiento` (con el nombre del comensal), las `ReservaRestriccion`, una `OrdenCocina` en estado `Pendiente` por comensal, el `Pago` y una `Notificacion`, descuenta el saldo de la `Tarjeta` y elimina el bloqueo.

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

#### Correo de confirmación de reservas (opcional)
Al confirmarse una reserva se envía un correo al email registrado del usuario. Sin configuración la app funciona igual, pero esos correos quedan en estado `fallido` en la tabla `notificacion` y se avisa en el log.

**Opción A (recomendada): API de Gmail por HTTPS.** No usa los puertos de correo, así que funciona aunque tu red los bloquee.
1. En <https://console.cloud.google.com> crea un proyecto y activa la **Gmail API** (APIs y servicios > Biblioteca).
2. En *Pantalla de consentimiento de OAuth*: tipo **Externo**, agrega tu Gmail como *usuario de prueba* y el permiso `https://www.googleapis.com/auth/gmail.send`.
3. En *Credenciales* crea un **ID de cliente OAuth** de tipo *Aplicación web*, con `https://developers.google.com/oauthplayground` como URI de redirección autorizado.
4. En <https://developers.google.com/oauthplayground>: engranaje ⚙ > *Use your own OAuth credentials* (pega el ID y el secreto) > autoriza el permiso `gmail.send` con tu Gmail > *Exchange authorization code for tokens* y copia el **Refresh token**.
5. En `.env`:
   ```env
   GMAIL_CLIENT_ID=xxxx.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=el_secreto_del_cliente
   GMAIL_REFRESH_TOKEN=1//el_refresh_token
   MAIL_FROM="SensaCine <tu_correo@gmail.com>"
   ```
> ⚠️ Mientras la app esté en modo *Prueba* el refresh token **caduca a los 7 días**. Para evitarlo, pulsa **Publicar aplicación** en la pantalla de consentimiento (seguirá marcada como "no verificada", lo cual sirve para uso personal). El refresh token equivale a una contraseña para enviar como tú: solo va en `.env`.

**Opción B: SMTP** (solo si tu red permite los puertos 587/465). Crea una *contraseña de aplicación* en <https://myaccount.google.com/apppasswords> (requiere verificación en dos pasos) y define `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS` y `MAIL_FROM`.

Si están las tres variables `GMAIL_*` se usa la Opción A; si no, SMTP. Comprueba la configuración enviando un correo de ejemplo (reinicia el backend después de editar `.env`):
```bash
npm run mail:test -- destino@correo.com
```

---

### Paso 3: Generar el Cliente de Prisma
```bash
npm run prisma:generate
```

---

### Paso 4: Aplicar las Migraciones (crear las tablas)
La base de datos `sensacine` debe existir (vacía) en tu PostgreSQL; los comandos de Prisma no la crean. Luego:
```bash
npx prisma migrate deploy
```
Aplica en orden todas las migraciones de `prisma/migrations/`, sin pedir confirmación y sin borrar datos. **Repite este comando (y `npm run prisma:generate`) cada vez que hagas `git pull` y lleguen migraciones nuevas.**

> ⚠️ **No uses `prisma db push`** en este proyecto: crea las tablas sin registrar las migraciones y después `migrate deploy` falla con "la base de datos no está vacía" (error `P3005`). Si ya lo hiciste, en tu BD **local** corre `npx prisma migrate reset`: la borra, reaplica todas las migraciones y ejecuta el seed (pierdes sus datos).
>
> `npm run prisma:migrate` (`migrate dev`) es solo para **crear** una migración nueva después de cambiar `schema.prisma`.

---

### Paso 5: Poblar la Base de Datos con el Dataset Inicial (Seed)
```bash
npm run seed
```
Crea: **8 películas** con póster, **3 salas** (40, 50 y 24 asientos), **40 funciones** (8 por día durante 5 días, desde el día en que se ejecuta), el **menú de cada película** (28 platos), **11 restricciones alimentarias**, reservas de ejemplo en las primeras funciones y estos usuarios:

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| `admin` | `admin@sensacine.com` | `Admin1234!` |
| `cliente` | `cliente@sensacine.com`, `maria@sensacine.com`, `andres@sensacine.com` | `Cliente1234!` |
| `cocina` | `cocina@sensacine.com` | `Cocina1234!` |

> Son credenciales **solo para desarrollo local**. Es seguro volver a ejecutar el seed: no duplica lo que ya existe.

---

### Paso 6: Iniciar el Servidor en Desarrollo
```bash
npm run dev
```
Consola: `🚀 Servidor SensaCine escuchando en http://localhost:3000`

---

## 📡 Referencia de la API

Base: `http://localhost:3000`. Los endpoints protegidos requieren `Authorization: Bearer <token>` (el token se obtiene en `POST /api/auth/login`). Los errores responden `{ "error": "mensaje" }` con su código HTTP.

**Acceso:** 🌐 público · 🔑 sesión iniciada · 🛡️ solo `admin`.

### Salud y autenticación
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | 🌐 | Comprueba que el servidor responde. |
| `POST` | `/api/auth/register` | 🌐 | Registra un usuario (`nombre`, `email`, `password`). |
| `POST` | `/api/auth/login` | 🌐 | Devuelve `token` (8 h) y los datos del usuario. Un usuario inactivo recibe 403. |

### Películas y menú
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/peliculas` | 🌐 | Películas activas. Con `?todas=true`, todas. |
| `GET` | `/api/peliculas/:id` | 🌐 | Detalle de una película. |
| `GET` | `/api/peliculas/:id/menu` | 🌐 | Menú gastronómico de la película. |
| `POST` `PUT` `DELETE` | `/api/peliculas[/:id]` | 🛡️ | Crea, edita o elimina una película (no se elimina si tiene funciones o platos asociados). |
| `GET` `POST` `PUT` `DELETE` | `/api/productos[/:id]` | 🛡️ | Gestión de los platos del menú. |
| `PATCH` | `/api/productos/:id/estado` | 🛡️ | Activa o desactiva un plato. |

### Salas y funciones
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/salas`, `/api/salas/:id` | 🌐 | Consulta de salas. |
| `POST` `PUT` `DELETE` | `/api/salas[/:id]` | 🛡️ | Gestión de salas y su distribución de asientos. |
| `GET` | `/api/funciones` | 🌐 | Lista funciones. Filtros: `fecha`, `idSala`, `idPelicula`, `estado`, `desdeFecha`, `hastaFecha`, `soloFuturas=true`. |
| `GET` | `/api/funciones/:id` | 🌐 | Detalle de una función. |
| `POST` `PUT` `DELETE` | `/api/funciones[/:id]` | 🛡️ | Gestión de funciones (rechaza choques de horario en la misma sala). |

### Reservas
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/reservas/funciones/:id/seats` | 🔑 | Sillas de la función con su estado (`disponible`, `pendiente`, `ocupado`) y tu bloqueo vigente (`mi_bloqueo`). |
| `GET` | `/api/reservas/halls/:id/seats` | 🔑 | Sillas de una sala. |
| `POST` | `/api/reservas/funciones/:id/bloqueos` | 🔑 | Retiene sillas 15 minutos (`idsAsiento`, máx. 8). Responde 409 si alguna ya no está disponible. |
| `GET` | `/api/reservas/funciones/:id/bloqueos/mio` | 🔑 | Tu bloqueo vigente con los segundos restantes (200), o 204 si no tienes. |
| `DELETE` | `/api/reservas/funciones/:id/bloqueos` | 🔑 | Libera tus sillas retenidas. |
| `POST` | `/api/reservas` | 🔑 | **Crea la reserva y cobra la tarjeta en una transacción.** Cuerpo: `idFuncion`, `idTarjeta`, `comensales[]` (`idAsiento`, `nombrePersona`, `restricciones[]`, `otraRestriccion?`). El monto lo calcula el servidor y exige un bloqueo vigente. |
| `GET` | `/api/reservas/activas` | 🔑 | Tus reservas de funciones que aún no terminan. |
| `GET` | `/api/reservas/historial` | 🔑 | Tu historial: reservas canceladas, finalizadas y confirmadas de funciones ya terminadas. |
| `GET` | `/api/reservas/historial/:id` | 🔑 | Detalle de una reserva tuya (otra persona no puede verla: 404). |
| `GET` | `/api/reservas/admin`, `/api/reservas/admin/:id` | 🛡️ | Todas las reservas. |
| `PATCH` | `/api/reservas/admin/:id/estado` | 🛡️ | Cambia el estado: `Confirmado`, `Cancelado` o `Finalizado`. |

### Tarjetas y pagos (simulados)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` `POST` | `/api/tarjetas` | 🔑 | Lista o crea tus tarjetas. |
| `PATCH` | `/api/tarjetas/:id/saldo` | 🔑 | Recarga el saldo. |
| `DELETE` | `/api/tarjetas/:id` | 🔑 | Desactiva la tarjeta. |
| `POST` | `/api/tarjetas/:id/pagar` | 🔑 | Descuenta un monto del saldo. **No crea reserva**; el flujo de compra usa `POST /api/reservas`. |

### Usuarios
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/admin/usuarios` | 🛡️ | Lista los usuarios. |
| `PATCH` | `/api/admin/usuarios/:id/rol` | 🛡️ | Cambia el rol (`cliente`, `admin`, `cocina`). |
| `PATCH` | `/api/admin/usuarios/:id/estado` | 🛡️ | Activa o desactiva la cuenta (`activo`, `inactivo`). |

### Tiempo real (Socket.IO)
Se conecta al mismo servidor enviando el JWT en `auth.token`. El cliente emite `funcion:join` / `funcion:leave` con el id de la función y recibe `asientos:pendientes`, `asientos:ocupados` y `asientos:liberados` (`{ idFuncion, idsAsiento }`).

---

## 🧪 Pruebas

### 1. Pruebas Unitarias (Automáticas con Jest)
```bash
npm test
```
Ejecuta **73 pruebas unitarias** (9 suites) con repositorios simulados, sin base de datos real: autenticación, películas, salas, funciones, reservas (incluida la creación con pago), historial, notificaciones y envío de correo.

---

### 2. Pruebas de Endpoints HTTP

#### A. Listar Películas Activas (Pantalla Principal - Público)
```bash
curl http://localhost:3000/api/peliculas
```
**Respuesta:** Array con las películas activas (título, sinopsis, duración, género, posterUrl y precioBaseExperiencia).

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
curl -X DELETE http://localhost:3000/api/peliculas/9 \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

---

## 📋 Resumen de Scripts de `package.json`

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor en modo desarrollo con `ts-node-dev` (hot-reload). |
| `npm run seed` | Ejecuta `prisma/seed.ts`: películas, salas, funciones, menú, usuarios y reservas de ejemplo. |
| `npm run build` | Compila el código TypeScript a JavaScript en la carpeta `dist/`. |
| `npm start` | Ejecuta la versión compilada en producción desde `dist/server.js`. |
| `npm test` | Ejecuta todos los tests unitarios con Jest. |
| `npm run test:watch` | Ejecuta los tests en modo interactivo/watch. |
| `npm run prisma:generate` | Genera y actualiza los tipos del cliente Prisma en TypeScript. |
| `npm run prisma:migrate` | `prisma migrate dev`: **crea** una migración nueva tras cambiar `schema.prisma`. Para aplicar las existentes usa `npx prisma migrate deploy`. |
| `npm run mail:test -- correo@dominio.com` | Envía un correo de confirmación de ejemplo para comprobar la configuración de correo. |
| `npm run prisma:studio` | Abre la interfaz gráfica web de Prisma en `http://localhost:5555`. |

---

## 📌 Limitaciones Conocidas

- **Pagos simulados:** las tarjetas son ficticias y el número se guarda **sin cifrar**. No usar datos de tarjetas reales.
- **Correos fallidos:** quedan registrados como `fallido` en `notificacion`, pero no se reintentan automáticamente.
- **Cocina y reseñas:** el rol `cocina` y las órdenes (`OrdenCocina`) existen, pero no hay panel para gestionarlas; la tabla `resena` y el tipo de notificación `solicitud_resena` están definidos sin funcionalidad. Los módulos `cocina/` y `resenas/` están vacíos.
- **Cancelación:** solo un administrador puede cambiar el estado de una reserva; el espectador no puede cancelar.
- **Auditoría:** el modelo `LogAuditoria` no se usa.

---

## 🔧 Solución a Problemas Comunes (Troubleshooting)

### 1. `❌ Variables de entorno inválidas`
- Asegúrate de tener el archivo `.env` en la raíz `sensacine-backend/.env` con todas las variables requeridas.

### 2. `Can't reach database server at localhost:5432`
- Verifica que el servicio de PostgreSQL esté iniciado y las credenciales en `DATABASE_URL` sean correctas.

### 3. `Token de autenticación no proporcionado / inválido`
- Agrega el encabezado `Authorization: Bearer <token>` obtenido tras hacer login en `/api/auth/login`.

### 4. `P3005: The database schema is not empty` al ejecutar `migrate deploy`
- La BD se creó antes con `prisma db push`. En tu BD **local** ejecuta `npx prisma migrate reset` (la borra, reaplica las migraciones y corre el seed).

### 5. Error 500 o fallos raros después de resetear la BD
- Tu navegador conserva la sesión de un usuario que el reset eliminó: el token sigue siendo válido pero apunta a un usuario que ya no existe. **Cierra sesión y vuelve a iniciar sesión** (o regístrate de nuevo).

### 6. La reserva se crea pero no llega el correo de confirmación
- El backend lee `.env` **solo al arrancar**: reinícialo después de editarlo.
- Mira la terminal del backend: `Correo enviado a …` significa que Google aceptó el envío; `No se pudo enviar la confirmación de la reserva #N: …` explica la causa. También puedes revisar `notificacion.estado` (`enviado`, `fallido` o `pendiente`).
- El correo va al email **de la cuenta que reserva**. Los usuarios del seed tienen correos ficticios: usa una cuenta con una dirección real.
- Comprueba la configuración con `npm run mail:test -- tu_correo@gmail.com`.

### 7. `Connection timeout` al enviar por SMTP
- Tu red bloquea los puertos de correo (587/465). Usa la **API de Gmail** (Opción A de la configuración de correo), que funciona por HTTPS.
