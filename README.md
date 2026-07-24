# Notas

Aplicación de notas en markdown, con cuadernos, etiquetas y búsqueda de texto
completo — pensada para crecer con búsqueda semántica y un chat que responde
usando tus propias notas.

![CI](https://github.com/NicolasAndradeRetamal/notas-app/actions/workflows/ci.yml/badge.svg)

## Demo

- **URL desplegada:** _pendiente — el proyecto aún no está desplegado. Ver la
  sección [Despliegue](#despliegue) para el procedimiento._
- **Captura de pantalla:** _pendiente._

## Stack

| Capa               | Tecnología                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Framework          | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) + TypeScript 6                             |
| Backend            | Server Actions y Route Handlers del propio Next.js (sin API REST separada)                                               |
| Base de datos      | PostgreSQL 18 con la extensión [pgvector](https://github.com/pgvector/pgvector), vía [Prisma 7](https://www.prisma.io)   |
| Auth               | [Auth.js v5](https://authjs.dev) (`Credentials` + sesión JWT)                                                            |
| Estilos            | [Tailwind CSS 4](https://tailwindcss.com) (configuración CSS-first)                                                      |
| Tests              | [Vitest](https://vitest.dev) + React Testing Library (unidad) · [Playwright](https://playwright.dev) (extremo a extremo) |
| Gestor de paquetes | [pnpm](https://pnpm.io)                                                                                                  |

Versiones exactas de cada dependencia en [`package.json`](./package.json) y
justificación de cada elección en [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Funcionalidades

- Registro y login con email y contraseña, sesión persistente
- CRUD de notas con editor markdown y vista previa en vivo
- Organización en cuadernos (un solo nivel) y etiquetas transversales
- Búsqueda de texto completo por título y contenido, con resaltado de
  coincidencias, filtrable por cuaderno y por etiqueta
- Papelera con restauración y purga manual
- Aislamiento estricto entre usuarios: cada quien ve solo sus propias notas

**En la hoja de ruta** (ver la sección 7 de `ARCHITECTURE.md`): búsqueda
semántica por significado, resumen automático de notas largas y un chat que
responde preguntas citando las notas propias como fuente, todo con la API de
Claude ejecutándose siempre del lado del servidor.

## Requisitos previos

- [Node.js 24.13.0](https://nodejs.org) o superior
- [pnpm 11.1.2](https://pnpm.io/installation) (`corepack enable` lo instala
  automáticamente si usas Corepack)
- [Docker](https://www.docker.com/) y Docker Compose, para levantar PostgreSQL
  en local

## Cómo levantarlo

```bash
# 1. Clonar el repositorio
git clone https://github.com/NicolasAndradeRetamal/notas-app.git
cd notas-app

# 2. Instalar dependencias (también genera el cliente de Prisma vía postinstall)
pnpm install

# 3. Configurar las variables de entorno
cp .env.example .env
# Genera AUTH_SECRET y pégalo en .env:
openssl rand -base64 32
# alternativa sin openssl:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 4. Levantar PostgreSQL (queda escuchando en localhost:5433)
docker compose up -d

# 5. Aplicar las migraciones
pnpm db:migrate

# 6. Sembrar datos de ejemplo (crea la cuenta de demostración, ver abajo)
pnpm db:seed

# 7. Arrancar la aplicación en modo desarrollo
pnpm dev
```

La aplicación queda disponible en <http://localhost:3000>.

> El contenedor de PostgreSQL usa la imagen `pgvector/pgvector:pg18` desde el
> día uno, aunque la extensión `vector` no se activa hasta la fase 2 de IA:
> evita cambiar de imagen a mitad de proyecto. Publica el puerto **5433** en
> el host (el 5432 se reserva para otro proyecto del portafolio en la misma
> máquina).

### Cuenta de demostración

El seed (`pnpm db:seed`) crea un usuario con notas, cuadernos y etiquetas de
ejemplo:

| Campo      | Valor                 |
| ---------- | --------------------- |
| Email      | `demo@notas.app`      |
| Contraseña | `contrasena-demo-123` |

## Scripts disponibles

| Script                              | Qué hace                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                          | Arranca la aplicación en modo desarrollo                     |
| `pnpm build`                        | Genera el build de producción                                |
| `pnpm start`                        | Sirve el build de producción ya generado                     |
| `pnpm lint`                         | Analiza el código con ESLint                                 |
| `pnpm format` / `pnpm format:check` | Formatea con Prettier / verifica el formato sin escribir     |
| `pnpm typecheck`                    | Verifica los tipos con `tsc --noEmit`, sin emitir archivos   |
| `pnpm test`                         | Corre los tests unitarios con Vitest                         |
| `pnpm test:watch`                   | Vitest en modo watch                                         |
| `pnpm test:coverage`                | Tests unitarios con reporte de cobertura                     |
| `pnpm e2e`                          | Corre los tests extremo a extremo con Playwright             |
| `pnpm db:generate`                  | Regenera el cliente de Prisma                                |
| `pnpm db:migrate`                   | Crea y aplica migraciones en desarrollo                      |
| `pnpm db:deploy`                    | Aplica migraciones ya existentes (uso en CI/producción)      |
| `pnpm db:seed`                      | Siembra datos de ejemplo, incluida la cuenta de demostración |
| `pnpm db:studio`                    | Abre Prisma Studio para explorar la base de datos            |

## Tests

```bash
# Tests unitarios y de componentes (Vitest + React Testing Library)
pnpm test

# Con reporte de cobertura
pnpm test:coverage

# Tests extremo a extremo (Playwright): construyen la app, la arrancan
# y navegan sobre ella con Chromium. Requieren PostgreSQL disponible
# (docker compose up -d) y las variables de entorno configuradas.
pnpm e2e
```

Los tests unitarios y de componentes cubren la capa de servidor —validación,
autorización, mapeo a DTO y utilidades— y los componentes con lógica real
—formularios, editor markdown, saneamiento del contenido y diálogos—.
Trabajan con Prisma mockeado, así que no requieren una base de datos.

Los tests extremo a extremo sí la necesitan y recorren los flujos completos:
registro, sesión, CRUD de notas, organización, búsqueda y papelera. El más
importante es `e2e/isolation.spec.ts`, que crea dos usuarios y verifica que
ninguno puede ver ni alcanzar por URL directa los recursos del otro.

La integración continua (`.github/workflows/ci.yml`) ejecuta, en cada push y
cada pull request: `typecheck`, `lint`, aplicación de migraciones contra un
PostgreSQL efímero (para detectar migraciones rotas), `test` y `build`.

## Estructura del proyecto

```
notas-app/
├── prisma/              # Schema, migraciones versionadas y seed de datos
├── e2e/                 # Tests Playwright
├── src/
│   ├── app/              # App Router: solo enrutado y composición de páginas
│   ├── components/       # Componentes de presentación (no tocan Prisma)
│   ├── server/            # Server actions, queries, auth, mappers — 'server-only'
│   ├── lib/               # Utilidades compartidas (env, prisma, markdown...)
│   ├── schemas/           # Esquemas Zod, contrato compartido cliente/servidor
│   └── types/             # DTOs del dominio
├── tests/               # Setup y helpers de Vitest
├── docker-compose.yml   # PostgreSQL + pgvector para desarrollo
└── .github/workflows/   # Integración continua
```

Detalle completo de cada carpeta y las reglas que la gobiernan en la
sección 5 de [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Arquitectura y diseño

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — stack y versiones exactas,
  diagrama del sistema, modelo de datos, contrato entre capas, autenticación,
  seguridad, testing y las decisiones de diseño técnico con sus alternativas
  descartadas.
- [`DESIGN.md`](./DESIGN.md) — sistema de diseño: identidad visual, paleta,
  tipografía, tokens, catálogo de componentes y especificación de pantallas.

## Despliegue

La aplicación es Next.js con renderizado dinámico dominante (Server Actions,
sesión leída en cada request): no es un sitio estático, así que necesita un
entorno con backend, no solo hosting de archivos.

### Camino recomendado: Vercel + Neon

| Pieza         | Proveedor                                           | Por qué                                                                                                                                                                         |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aplicación    | [Vercel](https://vercel.com) (plan Hobby, gratuito) | Soporte nativo de Next.js App Router, Server Actions y streaming (route handlers de IA en la fase 2); despliega directo desde el repositorio sin necesidad de una imagen Docker |
| Base de datos | [Neon](https://neon.tech) (plan gratuito)           | PostgreSQL serverless con la extensión `pgvector` disponible, que la fase 2 necesita; no exige tarjeta de crédito para el nivel gratuito                                        |

Pasos:

1. **Crear el proyecto en Neon**
   - Crear una cuenta y un proyecto nuevo en <https://neon.tech>.
   - Copiar la cadena de conexión que ofrece el panel (ya incluye
     `sslmode=require`); es el valor de `DATABASE_URL`.
   - (Fase 2) Habilitar la extensión desde el editor SQL de Neon:
     `CREATE EXTENSION IF NOT EXISTS vector;`

2. **Aplicar las migraciones contra Neon**
   Desde tu máquina, con `DATABASE_URL` apuntando temporalmente a Neon:

   ```bash
   DATABASE_URL="<cadena-de-conexion-de-neon>" pnpm db:deploy
   # Opcional: sembrar la cuenta de demostración en producción
   DATABASE_URL="<cadena-de-conexion-de-neon>" pnpm db:seed
   ```

3. **Importar el repositorio en Vercel**
   - <https://vercel.com/new>, seleccionar el repositorio `notas-app`.
   - Framework detectado automáticamente: Next.js. No hace falta tocar el
     comando de build ni el de instalación (`pnpm install --frozen-lockfile`
     por defecto en proyectos con `pnpm-lock.yaml`).

4. **Configurar las variables de entorno en Vercel** (Project Settings →
   Environment Variables):

   | Variable          | Valor                                                                                                               |
   | ----------------- | ------------------------------------------------------------------------------------------------------------------- |
   | `DATABASE_URL`    | La cadena de conexión de Neon                                                                                       |
   | `AUTH_SECRET`     | Generada con `openssl rand -base64 32` (una distinta de la de desarrollo)                                           |
   | `AUTH_TRUST_HOST` | `true`                                                                                                              |
   | `AUTH_URL`        | La URL pública que asigna Vercel (opcional: Auth.js puede inferirla de la petición, pero fijarla es más predecible) |

5. **Desplegar.** Cada push a `main` genera un despliegue de producción; cada
   pull request recibe un despliegue de vista previa con su propia URL.

6. **Verificar.** `GET /api/health` debe responder `{ "status": "ok" }`.

### Sobre el Dockerfile de producción

Este repositorio **no incluye un `Dockerfile` de producción a propósito**:
como el despliegue objetivo es Vercel, que construye la aplicación
directamente desde el código fuente sin necesidad de una imagen, mantener un
`Dockerfile` alternativo sería infraestructura sin uso real y otro artefacto
que mantener sincronizado con `next.config.ts`. `docker-compose.yml` sigue
existiendo únicamente para levantar PostgreSQL en desarrollo local.

Si en el futuro se prefiere autohospedar en un proveedor tipo Railway o
Render en vez de Vercel, la migración es sencilla: añadir
`output: 'standalone'` a `next.config.ts` y un `Dockerfile` multi-stage
(build con todas las dependencias → imagen final solo con
`.next/standalone`, `.next/static` y `public`); el `docker-compose.yml`
actual ya deja listo el servicio de base de datos para ese escenario. En ese
caso, la base de datos gestionada tendría que seguir soportando `pgvector`
(Neon, Render Postgres o Railway sirven).

### Variables de entorno

Documentadas y con valores de ejemplo en [`.env.example`](./.env.example).
Se validan al arrancar con Zod (`src/lib/env.ts`): si falta una variable
obligatoria, el proceso falla de inmediato en vez de romperse en la primera
petición.
