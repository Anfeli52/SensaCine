# SensaCine — Frontend

Aplicación web de **SensaCine**: cartelera, selección de sillas en tiempo real, reserva con pago simulado, "Mis reservas" y panel de administración. Construida con **React 18 + TypeScript + Vite**, estilos con **Tailwind CSS**, datos del servidor con **React Query**, estado global con **Zustand**, rutas con **React Router 6**, y tiempo real con **Socket.IO**.

> Visión general del proyecto: [README principal](../README.md) · API y base de datos: [README del backend](../sensacine-backend/README.md).

---

## 🛠️ Requisitos Previos

- **Node.js** 18 o superior y **npm** 9 o superior.
- El **backend** de SensaCine en ejecución (por defecto en `http://localhost:3000`). Sigue su [guía de instalación](../sensacine-backend/README.md#-guía-de-instalación-y-comandos-paso-a-paso).

---

## 🚀 Instalación y Ejecución

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente (puerto 5173). |
| `npm run build` | Comprueba los tipos con TypeScript y genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la versión generada por `build`. |

`npm run build` es también la forma de validar que todo el código compila: el frontend no tiene pruebas automáticas.

### Variables de entorno (opcionales)
Se definen en un archivo `.env` dentro de `frontend/` (hay una plantilla en `.env.example`). Vite las lee **al arrancar**, así que reinicia `npm run dev` después de cambiarlas.

| Variable | Valor por defecto | Para qué sirve |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Dirección base de la API REST. |
| `VITE_SOCKET_URL` | el mismo origen | Dirección del servidor WebSocket. |

En desarrollo no hace falta configurar nada: Vite redirige `/api` y `/socket.io` a `http://localhost:3000` (ver `vite.config.ts`), por lo que el navegador solo habla con el puerto 5173.

---

## 📁 Estructura del Proyecto

```
frontend/src/
├── app/                   # Arranque: App, proveedores (React Query) y router
├── features/              # Un módulo por funcionalidad
│   ├── auth/              # Login, registro y sesión (store de Zustand)
│   ├── catalogo/          # Cartelera, búsqueda por título, filtro por género y detalle con funciones
│   ├── menu/              # Menú gastronómico de cada película
│   ├── reservas/          # Sillas en tiempo real, comensales, resumen y "Mis reservas"
│   ├── pagos/             # Tarjetas simuladas y pasarela de pago
│   ├── admin/             # Panel de administración
│   ├── cocina/            # (pendiente)
│   └── resenas/           # (pendiente)
├── shared/
│   ├── components/        # Button, Input, Modal, Badge, Spinner, StatCard, Navbar, Footer
│   └── layouts/           # MainLayout, AuthLayout, AdminLayout
├── routes/ProtectedRoute.tsx   # Restringe rutas por sesión y rol
└── lib/                   # apiClient (Axios con JWT), queryClient y socket (Socket.IO)
```

Dentro de cada feature la organización es la misma: `api/` (llamadas HTTP), `hooks/` (React Query), `components/`, `pages/` y `types`. El alias `@/` apunta a `src/`.

---

## 🧭 Rutas de la aplicación

| Ruta | Pantalla | Acceso |
| :--- | :--- | :--- |
| `/` | Cartelera | Público |
| `/menu/:peliculaId` | Menú gastronómico de la película | Público |
| `/auth/login`, `/auth/register` | Inicio de sesión y registro (`/login` y `/register` redirigen aquí) | Público |
| `/reservas/asientos` | Selección de sillas | Sesión iniciada |
| `/reservas/alergenos` | Comensales y restricciones alimentarias | Sesión iniciada |
| `/reservas/resumen` | Resumen y pago | Sesión iniciada |
| `/reservas/historial` (también `/reservas/activas` y `/reservas/mis-reservas`) | Mis reservas: próximas funciones e historial | Sesión iniciada |
| `/admin/peliculas`, `funciones`, `salas`, `usuarios`, `productos`, `reservas` | Panel de administración | Solo `admin` |

Las pantallas de reserva comprueban la sesión por sí mismas y redirigen a `/login` si no hay usuario. Cualquier ruta desconocida vuelve a la cartelera.

---

## 🔌 Cómo se conecta con el backend

- **REST:** `lib/apiClient.ts` añade el token JWT a cada petición y, si el servidor responde `401`, cierra la sesión.
- **Datos del servidor:** React Query cachea las consultas y las refresca.
- **Estado local persistente:** Zustand guarda la sesión (`features/auth`, en `localStorage`) y la reserva temporal en curso (`features/reservas/bloqueoStore.ts`).
- **Tiempo real:** `lib/socket.ts` abre una conexión Socket.IO autenticada con el mismo JWT. La pantalla de sillas entra a la "sala" de la función y actualiza la caché de React Query cuando llegan los eventos `asientos:pendientes`, `asientos:ocupados` y `asientos:liberados`.

### El flujo de reserva en el código

| Pieza | Responsabilidad |
| :--- | :--- |
| `SeatSelectionPage`, `SeatMap`, `Seat` | Mapa de sala con los estados Disponible, Seleccionado, Pendiente y Ocupado. Al continuar, pide al servidor retener las sillas. |
| `useAsientos` | Carga la disponibilidad y la mantiene al día con los eventos de WebSocket. |
| `BloqueoTimer` | Muestra los 15 minutos restantes y los contrasta con el servidor cada 10 s: el servidor es quien decide cuándo vence. |
| `useRestaurarBloqueo` | Al recargar la página, recupera la reserva temporal y su tiempo real desde el servidor. |
| `AlergenosPage` | Nombre y restricciones de cada comensal. Volver a la selección libera las sillas. |
| `ResumenReservaPage`, `PasarelaPagoModal` | Resumen y pago con tarjeta. |
| `useCrearReserva` | Envía la reserva; el servidor cobra y la crea en una sola operación y calcula el monto. |
| `MisReservasPage` | Próximas funciones e historial con el desglose por silla y el menú. |

---

## 🎨 Estilo y diseño

Interfaz de estilo Apple clara, con tarjetas redondeadas, azul de acción `#0071e3` y barra de navegación de vidrio esmerilado. Los tokens propios (radios `apple*`, sombras y colores) están en `tailwind.config.js`. La guía de estilo completa está en [`apple-DESIGN.md`](./apple-DESIGN.md).

---

## 📌 Pantallas pendientes

El **panel de cocina** y las **reseñas** tienen su carpeta reservada en `features/` pero todavía no tienen pantallas.
