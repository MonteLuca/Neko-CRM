# CRM Frontend - Angular

Aplicación frontend desarrollada en Angular para la gestión de clientes de una empresa. El proyecto simula un sistema CRM consumiendo datos desde una Mock API con [JSON Server](https://github.com/typicode/json-server).

## Funcionalidades

- Login simulado con credenciales demo
- Rutas protegidas con guard funcional
- Dashboard con métricas y gráficos simples (por estado, por mes, por provincia)
- Listado de clientes con búsqueda, filtros y paginación
- Alta y edición de clientes (formulario reactivo)
- Vista detalle con acciones
- Baja lógica (estado `DELETED` y `deletedAt`)
- Interceptor HTTP con token simulado
- Estados de carga, empty states, confirmaciones y notificaciones (PrimeNG Toast)
- Diseño responsive con barra de navegación y menú lateral en móvil

## Tecnologías

- Angular 21 (standalone components)
- TypeScript 5.9
- Angular Router (lazy loading)
- Reactive Forms
- HttpClient, guards e interceptors
- JSON Server
- PrimeNG 21 y tema Aura (`@primeuix/themes`)

## Requisitos

- **Node.js** compatible con Angular 21: **20.19+**, **22.12+** o **24+** (recomendado: **22 LTS** actual). El repo incluye `.nvmrc` con una versión sugerida.
- npm 8+
- JSON Server (incluido como dependencia de desarrollo del proyecto)

Si `npm install` muestra advertencias `EBADENGINE`, actualizá Node (por ejemplo con [nvm-windows](https://github.com/coreybutler/nvm-windows) o el instalador oficial).

## Instalación y ejecución

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
```

2. En una terminal, levantar la Mock API (lee `db.json` en la raíz del proyecto):

```bash
npm run mock-api
```

Por defecto la API queda en `http://localhost:3000` y expone el recurso `/clients`.

3. En otra terminal, levantar Angular:

```bash
npm start
```

4. Abrir en el navegador: `http://localhost:4200`

## Credenciales demo

| Campo    | Valor          |
|----------|----------------|
| Email    | admin@crm.com  |
| Contraseña | 123456     |

Tras el login se guarda en `localStorage` un token falso (`mock-jwt-token`) y los datos básicos del usuario administrador simulado.

## Scripts útiles

| Script        | Descripción                    |
|---------------|--------------------------------|
| `npm start`   | Servidor de desarrollo Angular |
| `npm run mock-api` | JSON Server en puerto 3000 |
| `npm run build` | Build de producción        |
| `npm test`    | Tests unitarios (Karma)      |

## Estructura del proyecto

Código organizado por capas y features (`core`, `layout`, `features`, `shared`), alineado a una arquitectura escalable para portfolio.

## Notas

- La baja lógica no elimina el registro: actualiza con `PATCH` estado `DELETED` y fecha en `deletedAt`.
- En el listado, por defecto se excluyen clientes dados de baja; podés incluirlos eligiendo el filtro de estado correspondiente.
