# 🎬 SensaCine

**SensaCine** es una plataforma web de **cine inmersivo con experiencia gastronómica sensorial**. Los espectadores consultan la cartelera, eligen su función y sus sillas en un mapa de sala que se actualiza **en tiempo real**, indican quién ocupará cada silla y qué **restricciones alimentarias** tiene, pagan y reciben un **correo de confirmación**.

Durante la proyección, la cocina sirve un plato individual a cada comensal, adaptado a sus restricciones. El sistema incluye además un **panel de administración** para gestionar la programación del cine.

---

## 📑 Contenido

1. [¿Qué se puede hacer?](#-qué-se-puede-hacer)
2. [Cómo funciona una reserva](#-cómo-funciona-una-reserva)
3. [Tecnologías](#-tecnologías)
4. [Cómo está construido](#-cómo-está-construido)
5. [Estado del proyecto](#-estado-del-proyecto)
6. [Dueños del proyecto](#-dueños-del-proyecto)

---

## ✨ ¿Qué se puede hacer?

### Como espectador
- **Explorar la cartelera:** buscar películas por título, filtrarlas por género y ver las funciones disponibles por fecha y horario.
- **Conocer el menú:** cada película tiene su propio menú gastronómico, con entradas, platos fuertes, postres y bebidas.
- **Elegir sillas en vivo:** el mapa de la sala muestra qué sillas están **disponibles**, **seleccionadas**, **pendientes** (alguien las está reservando) y **ocupadas**, y se actualiza sin recargar la página.
- **Reservar sin carreras:** al continuar, tus sillas quedan retenidas **15 minutos** para que completes la reserva con calma, y nadie más puede tomarlas.
- **Indicar restricciones alimentarias:** por cada silla se registra el nombre del comensal y sus alergias o restricciones, para que la cocina prepare su menú.
- **Pagar y recibir confirmación:** el pago se hace con una tarjeta simulada y llega un **correo** con la película, la fecha, la hora, la sala, las sillas y el monto pagado.
- **Consultar sus reservas:** "Mis reservas" muestra las próximas funciones y el historial, con el detalle de cada una.

### Como administrador
Un panel para gestionar **películas**, **funciones** (con control de choques de horario), **salas y sus asientos**, el **menú gastronómico**, los **usuarios** (roles y estado de cada cuenta) y las **reservas**.

---

## 🔄 Cómo funciona una reserva

```mermaid
flowchart LR
    A[Cartelera] --> B[Película y función]
    B --> C[Mapa de sillas<br/>en tiempo real]
    C -->|Continuar| D[Sillas en PENDIENTE<br/>15 minutos]
    D --> E[Comensales y<br/>restricciones]
    E --> F[Resumen]
    F --> G[Pago con tarjeta]
    G --> H[Reserva confirmada<br/>+ correo]
    D -. Volver o vencer el tiempo .-> C
```

1. El espectador elige una función y sus sillas. Los demás ven el mapa actualizarse al instante.
2. Al continuar, las sillas quedan retenidas durante 15 minutos.
3. Indica quién ocupará cada silla y sus restricciones alimentarias, y revisa el resumen.
4. Al pagar, la reserva se confirma y el cobro se realiza **en una sola operación**: si algo falla, no se cobra ni queda nada a medias.
5. Las sillas pasan a ocupadas para todos y llega el correo de confirmación.

Si el espectador vuelve atrás o se agota el tiempo, las sillas se liberan de inmediato para los demás.

---

## 🧰 Tecnologías

| Parte | Tecnologías |
| :--- | :--- |
| **Interfaz web** | React 18, TypeScript, Vite, Tailwind CSS, React Query, Zustand |
| **Servidor** | Node.js, TypeScript, Express, Zod |
| **Base de datos** | PostgreSQL con Prisma ORM |
| **Tiempo real** | Socket.IO |
| **Seguridad** | Autenticación con JWT y control de acceso por roles |
| **Correo** | API de Gmail o SMTP |
| **Pruebas** | Jest |

---

## 🧱 Cómo está construido

El repositorio reúne dos aplicaciones independientes que se comunican por HTTP y por WebSocket. Cada una tiene su propio README con la explicación técnica de cómo está construida, sus carpetas y su ejecución:

| Aplicación | Qué contiene | Documentación |
| :--- | :--- | :--- |
| 🖥️ **Frontend** (`frontend/`) | La interfaz web que usan espectadores y administradores. | **[README del Frontend](./frontend/README.md)** |
| ⚙️ **Backend** (`sensacine-backend/`) | La API, el tiempo real, el correo y la base de datos. | **[README del Backend](./sensacine-backend/README.md)** |

---

## 🌿 Estrategia de ramas

El equipo adoptó una estrategia de ramas basada en **GitHub Flow**, con una única rama permanente (`main`) y ramas temporales para desarrollar las funcionalidades asociadas a cada Historia de Usuario (HU).

Se eligió este flujo en lugar de Git Flow porque el equipo está conformado por cuatro integrantes, trabaja con sprints de dos o tres semanas y cuenta con un único entorno de entrega. De esta manera, se evita mantener ramas permanentes adicionales, como `develop` o `release`, que agregarían complejidad al proceso actual.

### Flujo de trabajo

1. **Rama principal (`main`):** contiene la versión integrada del proyecto. Los cambios se incorporan mediante Pull Requests (PR), evitando modificaciones directas.
2. **Ramas de funcionalidad (`feature/HU-XX`):** cada rama se crea para desarrollar una funcionalidad asociada a una Historia de Usuario específica. Por ejemplo, `feature/HU-15`.
3. **Desarrollo y commits:** el integrante responsable implementa los cambios y realiza commits pequeños, descriptivos y asociados con el trabajo realizado.
4. **Pull Request:** al terminar la funcionalidad, se abre un PR hacia `main` para que otro integrante revise los cambios y solicite modificaciones cuando sea necesario.
5. **Integración:** una vez completada la revisión y cumplidas las condiciones de aprobación, el PR se fusiona con `main`.

### Diagrama de la estrategia de ramas

```text
                  main
                    |
          ┌─────────┼─────────┐
          ▼         ▼         ▼
     feature/   feature/   feature/
      HU-15      HU-16      HU-17
          │         │         │
          └─────────┴─────────┘
                    │
                    ▼
                   main
```

**Posible evolución:** en futuros sprints se contempla incorporar una rama `staging` para realizar pruebas en un entorno similar al de producción antes de los despliegues. Esta rama no forma parte de la estrategia actual.

## 📝 Convención de commits

Para mantener un historial de cambios claro, uniforme y fácil de rastrear, el equipo utiliza una convención de commits basada en tipos de cambio. Cada mensaje comienza con un prefijo que identifica el propósito del commit y, opcionalmente, incluye un emoji representativo.

| Tipo | Emoji | Descripción | ¿Cuándo usarlo? |
| :--- | :---: | :--- | :--- |
| `feat` | ✨ | Nueva funcionalidad | Añadir un endpoint, componente o lógica nueva. |
| `fix` | 🐛 | Corrección de errores | Corregir un error o comportamiento inesperado. |
| `docs` | 📝 | Documentación | Modificar el README, la documentación técnica o los comentarios. |
| `style` | 💄 | Formato y estilo | Realizar cambios de formato o estilos que no modifican la lógica. |
| `refactor` | ♻️ | Refactorización | Mejorar la estructura del código sin corregir errores ni añadir funcionalidades. |
| `perf` | ⚡ | Rendimiento | Mejorar la velocidad de ejecución o el consumo de recursos. |
| `test` | ✅ | Pruebas | Añadir o corregir pruebas unitarias, de integración o extremo a extremo. |
| `build` | 📦 | Construcción | Modificar dependencias, scripts de construcción o archivos como `package.json`. |
| `ci` | 🎡 | Integración continua | Modificar la configuración de herramientas de integración continua. |
| `chore` | 🔨 | Tareas rutinarias | Realizar tareas de mantenimiento que no modifican directamente la funcionalidad. |
| `revert` | ⏪ | Reversión | Deshacer un commit anterior. |

### Formato de los mensajes

Los mensajes siguen esta estructura:

```text
tipo: descripción breve del cambio
```

**Ejemplos:**

```text
feat: agregar listado de usuarios 
fix: corregir validación de reservas 
docs: actualizar instrucciones de instalación
test: agregar pruebas para el servicio de reservas
refactor: organizar la lógica del catálogo
```

Esta convención facilita la comprensión del historial de cambios, la identificación de correcciones y funcionalidades, y la trazabilidad entre el desarrollo, las Historias de Usuario y los Pull Requests.

---
## 📌 Estado del proyecto

**Disponible hoy:** cuentas y roles, cartelera y menú por película, sillas en tiempo real con reserva temporal, comensales y restricciones alimentarias, pagos simulados, correo de confirmación, "Mis reservas" y el panel de administración completo.

**Próximamente:**
- **Panel de cocina** para gestionar las órdenes de cada comensal.
- **Reseñas** de las funciones a las que se asistió.
- **Cancelación de reservas** por parte del espectador.

> Los pagos son una **simulación**: no se procesan tarjetas reales.

---

## 👥 Dueños del proyecto

- Andrés Felipe Medina Díaz
- Juan David Agudelo Diago
- Cesar Andrés Díaz Jimenez
- Sharon Abella Zuray Díaz
