# Gladiator Fitness — Sistema de gestión de gimnasio (Parte 1)

Sistema web full-stack para administrar clientes, membresías y asistencia de
un gimnasio. Cubre los requerimientos de la **Parte 1** del examen:

1. Inicio de sesión con roles (Administrador / Cliente) y cierre de sesión.
2. Gestión de clientes (registrar, editar, buscar, activar/desactivar).
3. Gestión de membresías (tipos, asignación, fecha de inicio y vencimiento).
4. Control de asistencia (registrar entrada, consultar, validación estricta
   de membresía activa antes de permitir el ingreso).
5. Dashboard con métricas (total de clientes, membresías activas/vencidas,
   asistencias).

La conexión a la base de datos definitiva en **AWS (RDS PostgreSQL)** la
configurará el compañero de infraestructura. El backend ya está preparado
para ese cambio: **solo se deben actualizar las variables de entorno**
(`.env`), sin tocar código.

## Arquitectura

```
gladiator-fitness/
├── backend/     API REST (Node.js + Express + Sequelize + PostgreSQL)
├── frontend/    SPA del sistema de gestión (React + Vite + React Router + Axios)
└── landing/     Página informativa del gimnasio (HTML/CSS/JS estático, Parte 2)
```

- **Autenticación**: JWT firmado por el backend. El rol (`admin` / `cliente`)
  y el `clientId` viajan dentro del token.
- **Autorización**: middleware `authorizeRoles('admin')` protege las rutas
  exclusivas de administrador (clientes, tipos de membresía, asignación de
  membresías, registrar entrada).
- **Modularidad / AWS**: toda la configuración de conexión a PostgreSQL vive
  en `backend/src/config/database.js` y se alimenta 100% de variables de
  entorno (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` o bien
  `DATABASE_URL`, más `DB_SSL` para RDS). No hay credenciales ni hosts
  quemados en el código.

## Modelo de datos (resumen)

| Tabla              | Descripción                                                        |
|--------------------|---------------------------------------------------------------------|
| `users`             | Credenciales de acceso (username, password hasheado, rol, activo)  |
| `clients`           | Perfil del cliente, vinculado 1-a-1 a `users`                      |
| `membership_types`  | Tipos de membresía (nombre, duración en días, precio)              |
| `memberships`       | Membresía asignada a un cliente (fecha inicio / vencimiento)       |
| `attendances`       | Registro de cada intento de ingreso (permitido / denegado, motivo) |
| `payments`          | Pago asociado a cada membresía asignada (monto, método, estado)    |

El **estado de una membresía** (`activa` / `vencida`) se calcula en tiempo
real comparando `fecha_vencimiento` con la fecha actual — nunca se guarda un
campo "activo" que pueda quedar desactualizado.

## Requisitos previos

- Node.js 18+
- PostgreSQL 13+ (local, Docker, o ya la instancia de AWS RDS cuando esté lista)

## Backend

```bash
cd backend
cp .env.example .env      # y completar credenciales de la BD
npm install
npm run seed               # crea el usuario admin y tipos de membresía base
npm run dev                 # http://localhost:4000
```

Usuario administrador creado por el seed (editable en `.env`):
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`

### Variables de entorno (`backend/.env`)

Ver `backend/.env.example`. Las más relevantes para la transición a AWS:

```
DB_HOST=...        # endpoint de la instancia RDS
DB_PORT=5432
DB_NAME=gladiator_fitness
DB_USER=...
DB_PASSWORD=...
DB_SSL=true          # RDS normalmente exige SSL
# o alternativamente:
DATABASE_URL=postgres://usuario:password@host:5432/gladiator_fitness
```

Al arrancar, el servidor sincroniza automáticamente las tablas
(`sequelize.sync`) contra la base configurada — sea local o AWS — sin
necesidad de scripts SQL manuales.

### Endpoints principales

| Método | Ruta                                | Rol         | Descripción                          |
|--------|--------------------------------------|-------------|----------------------------------------|
| POST   | `/api/auth/login`                    | público     | Inicio de sesión                       |
| POST   | `/api/auth/logout`                   | autenticado | Cierre de sesión                       |
| GET    | `/api/auth/me`                       | autenticado | Usuario actual                         |
| GET    | `/api/clients?q=&active=`            | admin       | Listar / buscar clientes               |
| POST   | `/api/clients`                       | admin       | Registrar cliente                      |
| PUT    | `/api/clients/:id`                   | admin       | Editar cliente                         |
| PATCH  | `/api/clients/:id/deactivate`        | admin       | Desactivar cliente                     |
| PATCH  | `/api/clients/:id/activate`          | admin       | Reactivar cliente                      |
| GET    | `/api/membership-types`              | autenticado | Listar tipos de membresía              |
| POST   | `/api/membership-types`              | admin       | Crear tipo de membresía                |
| GET    | `/api/memberships?clientId=&estado=` | autenticado | Listar membresías                      |
| POST   | `/api/memberships`                   | admin       | Asignar membresía a un cliente         |
| POST   | `/api/attendance/checkin`            | admin       | Registrar entrada (valida membresía)   |
| GET    | `/api/attendance?clientId=`          | autenticado | Consultar asistencias                  |
| GET    | `/api/dashboard/metrics`             | admin       | Métricas del dashboard                 |
| GET    | `/api/payments?clientId=`            | admin       | Consultar pagos                        |

## Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL apuntando al backend
npm install
npm run dev                  # http://localhost:5173
```

Páginas: `Login`, `Dashboard` (admin), `Clientes` (admin), `Membresías`
(admin), `Asistencia` (admin) y una vista simplificada `Mi cuenta` para el
rol `cliente` (ve su propia membresía y su historial de asistencias).

## Página informativa (`landing/`)

Sitio estático independiente del sistema de gestión — es el entregable
"página Gimnasio informativa" de la Parte 2. No requiere build ni Node:
son solo `index.html`, `css/styles.css` y `js/main.js`, listos para copiarse
tal cual a la carpeta de publicación de IIS.

```bash
cd landing
python -m http.server 8080   # o cualquier servidor estático para probar en local
```

Incluye hero, sobre nosotros, horarios, planes (tomados de los tipos de
membresía por defecto), galería de instalaciones, entrenadores, testimonios
y contacto, con botones "Acceder al sistema" que enlazan al frontend. La URL
del sistema se configura en una sola constante (`APP_URL`) en
`landing/js/main.js` — actualizarla al dominio definitivo cuando el sistema
quede publicado.

## Módulo de pagos

Cada vez que se asigna una membresía se registra, en la misma transacción,
un pago (`monto`, `método de pago`, `fecha`, `estado`). El monto se
autocompleta con el precio del tipo de membresía elegido, pero el
administrador puede editarlo (p. ej. descuentos). El dashboard muestra el
total recaudado y cada cliente puede ver su propio historial de pagos desde
"Mi cuenta".

## Notas de diseño

- Al registrar un cliente se crea automáticamente su usuario de acceso
  (`role: cliente`). Si no se especifican usuario/contraseña, se usa la
  cédula por defecto — editable luego por el administrador.
- "Eliminar cliente" se implementó como **baja lógica** (`active = false`)
  en vez de borrado físico, para conservar el historial de membresías y
  asistencias.
- El control de asistencia registra **todo intento de ingreso**, permitido
  o denegado, con el motivo del rechazo (membresía vencida/inexistente o
  cliente inactivo) — esto da trazabilidad completa para el módulo de
  auditoría/asistencias.
- El "cierre de sesión" es del lado del cliente (se descarta el JWT
  guardado); el endpoint `/api/auth/logout` existe por completitud de la
  API y como punto de extensión si más adelante se requiere invalidar
  tokens del lado del servidor.

## Próximos pasos (fuera de esta Parte 1)

- Conectar `backend/.env` a la instancia PostgreSQL de AWS RDS (a cargo del
  compañero de infraestructura).
- Parte 2: repositorio GitHub, servidor Windows con IIS, pipeline CI/CD de
  despliegue automático.
