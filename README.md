# 💳 Sistema de Pagos 

Sistema de pagos con API RESTful que integra **Node.js (NestJS)**, **Python (FastAPI)** y **PostgreSQL**.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## 📐 Arquitectura

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│   Cliente /      │       │   API Node.js        │       │  Servicio Python │
│   Postman        │──────▶│   (NestJS + Drizzle) │──────▶│  (FastAPI)       │
│                  │       │   :3000               │       │  :8000           │
└─────────────────┘       └──────────┬───────────┘       └─────────────────┘
                                     │                     Simula procesamiento
                                     │                     80% aprobado
                                     ▼                     20% rechazado
                          ┌──────────────────────┐
                          │   PostgreSQL          │
                          │   :5432               │
                          │   - usuarios          │
                          │   - tarjetas          │
                          │   - pagos             │
                          └──────────────────────┘
```

---

## 🗂️ Estructura del Proyecto

```
.
├── api-node/                  # API REST (NestJS + Drizzle ORM)
│   ├── src/
│   │   ├── database/          # Configuración Drizzle + schema
│   │   ├── usuarios/          # Módulo de usuarios (CRUD)
│   │   ├── tarjetas/          # Módulo de tarjetas (CRUD)
│   │   ├── pagos/             # Módulo de pagos (CRUD + procesamiento)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── service-python/            # Servicio de procesamiento (FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services/
│   │       └── payment_processor.py
│   ├── Dockerfile
│   └── requirements.txt
├── database/                  # Scripts SQL
│   ├── init.sql               # Creación de tablas, índices, triggers
│   └── seed.sql               # Datos de ejemplo
├── postman/                   # Colección de Postman
│   └── Sistema_de_Pagos.postman_collection.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- **Docker** y **Docker Compose** (recomendado)
- O bien para ejecución manual:
  - **Node.js** >= 18
  - **Python** >= 3.10
  - **PostgreSQL** >= 14

---

### Opción 1: Con Docker (recomendado) 🐳

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd payment_system

# Levantar todos los servicios
docker compose up --build

# O en segundo plano
docker compose up --build -d
```

Eso es todo. Docker Compose levanta automáticamente:

| Servicio | URL |
|----------|-----|
| **API NestJS** | http://localhost:3000 |
| **Swagger API** | http://localhost:3000/docs |
| **FastAPI** | http://localhost:8000 |
| **Swagger FastAPI** | http://localhost:8000/docs |
| **PostgreSQL** | localhost:5432 |

La base de datos se inicializa automáticamente con `init.sql` y se carga con datos de ejemplo desde `seed.sql`.

```bash
# Para detener los servicios
docker compose down

# Para detener y eliminar volúmenes (reset completo de BD)
docker compose down -v
```

---

### Opción 2: Sin Docker (manual)

#### 1. Base de Datos PostgreSQL

```bash
# Crear la base de datos
createdb pagos_db

# Ejecutar scripts de inicialización
psql -U postgres -d pagos_db -f database/init.sql
psql -U postgres -d pagos_db -f database/seed.sql
```

#### 2. Servicio Python (FastAPI)

```bash
cd service-python

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servicio
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 3. API Node.js (NestJS)

```bash
cd api-node

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# Ejecutar en modo desarrollo
npm run start:dev

# O compilar y ejecutar en producción
npm run build
npm run start:prod
```

#### Variables de Entorno (api-node/.env)

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pagos_db
PYTHON_SERVICE_URL=http://localhost:8000
PORT=3000
```

---

## 📖 Documentación API (Swagger)

Ambos servicios cuentan con documentación interactiva Swagger:

| Servicio | Swagger UI | ReDoc |
|----------|-----------|-------|
| **API NestJS** | http://localhost:3000/docs | — |
| **FastAPI** | http://localhost:8000/docs | http://localhost:8000/redoc |

---

## 🔗 Endpoints

### API Node.js (NestJS) — Prefijo: `/api/v1`

#### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/usuarios` | Crear un usuario |
| `GET` | `/api/v1/usuarios` | Listar todos los usuarios |
| `GET` | `/api/v1/usuarios/:id` | Obtener usuario por ID |
| `PUT` | `/api/v1/usuarios/:id` | Actualizar un usuario |
| `DELETE` | `/api/v1/usuarios/:id` | Eliminar un usuario |

#### Tarjetas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/tarjetas` | Registrar una tarjeta |
| `GET` | `/api/v1/tarjetas` | Listar todas las tarjetas |
| `GET` | `/api/v1/tarjetas/usuario/:usuarioId` | Tarjetas de un usuario |
| `GET` | `/api/v1/tarjetas/:id` | Obtener tarjeta por ID |
| `DELETE` | `/api/v1/tarjetas/:id` | Eliminar una tarjeta |

#### Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/pagos` | Crear un pago (procesado por Python) |
| `GET` | `/api/v1/pagos` | Listar todos los pagos |
| `GET` | `/api/v1/pagos/usuario/:usuarioId` | Historial de pagos de un usuario |
| `GET` | `/api/v1/pagos/:id` | Obtener pago por ID |

### Servicio Python (FastAPI)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check del servicio |
| `POST` | `/procesar-pago` | Procesar un pago (80% aprobado / 20% rechazado) |

---

## 🧪 Pruebas con Postman

1. Importar la colección desde `postman/Sistema_de_Pagos.postman_collection.json`
2. La colección incluye variables pre-configuradas con IDs de los datos seed
3. Ejecutar las requests en orden:
   - **Health Checks** → verificar que los servicios estén activos
   - **Servicio Python** → probar procesamiento directo
   - **Usuarios** → CRUD completo
   - **Tarjetas** → registro y consulta
   - **Pagos** → crear pagos (se procesan vía Python) y consultar historial

---

## 🗃️ Base de Datos

### Diagrama ER

```
usuarios (1) ──────< (N) tarjetas
    │
    │ (1)
    │
    └──────< (N) pagos >──────── (1) tarjetas
```

### Tablas

- **usuarios**: `id`, `nombre`, `apellido`, `email` (unique), `telefono`, `created_at`, `updated_at`
- **tarjetas**: `id`, `usuario_id` (FK), `numero_tarjeta`, `titular`, `fecha_expiracion`, `tipo`, `marca`, `activa`, `created_at`, `updated_at`
- **pagos**: `id`, `usuario_id` (FK), `tarjeta_id` (FK), `monto`, `moneda`, `descripcion`, `estado`, `referencia`, `created_at`, `updated_at`

### Datos de Ejemplo (Seed)

Se incluyen 5 usuarios, 6 tarjetas y 7 pagos de ejemplo para pruebas inmediatas.

---

## ⚙️ Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| **API Principal** | Node.js + NestJS |
| **ORM** | Drizzle ORM |
| **Procesamiento de Pagos** | Python + FastAPI |
| **Base de Datos** | PostgreSQL 16 |
| **Contenedores** | Docker + Docker Compose |
| **Documentación** | Swagger / OpenAPI |
| **Validación** | class-validator (NestJS) + Pydantic (FastAPI) |

---

## 📝 Notas

- El servicio Python simula el procesamiento con un resultado **aleatorio** (80% aprobado, 20% rechazado).
- Los UUIDs se generan automáticamente por PostgreSQL.
- Los triggers actualizan `updated_at` automáticamente en cada UPDATE.
- Se incluyen índices para optimizar consultas frecuentes.
