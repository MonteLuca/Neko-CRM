# CRM Clientes — Documentación del proyecto

> **Uso en Notion:** en Notion, menú **⋯** del espacio o página → **Importar** → **Markdown** y elegí este archivo.  
> **En GitHub:** este archivo se renderiza como documentación en la raíz del repositorio (vista prolija de títulos, listas y tablas).

---

## Resumen

Aplicación **Angular 21** para gestión de clientes (CRM de demostración). Los datos salen de una **API simulada** con **[JSON Server](https://github.com/typicode/json-server)**, que lee y escribe el archivo `db.json` en la raíz del proyecto.

| Pieza            | Rol breve                                      |
|------------------|------------------------------------------------|
| Frontend Angular | UI, rutas, formularios, dashboard              |
| JSON Server      | REST sobre `db.json` (recurso principal `/clients`) |
| `db.json`        | “Base de datos” en JSON (ideal para demo/portfolio) |

---

## Stack técnico

- Angular 21 (componentes standalone), TypeScript 5.9  
- Router con lazy loading, formularios reactivos, HttpClient  
- PrimeNG 21, tema Aura, Chart.js  
- JSON Server (devDependency) para la mock API  

---

## Funcionalidades (alto nivel)

- Login simulado y rutas protegidas (guard)  
- Dashboard con métricas y gráficos  
- ABM de clientes: listado con búsqueda, filtros y paginación; alta, edición y detalle  
- Baja lógica (`DELETED` + `deletedAt`)  
- Interceptor HTTP con token simulado  
- UX: loading, vacíos, confirmaciones, toasts  

---

## Cómo correrlo en local

1. **Node:** 20.19+, 22.12+ o 24+ (ver `.nvmrc` si existe).  
2. Instalar dependencias: `npm install`  
3. Terminal A — API mock: `npm run mock-api` → suele quedar en `http://localhost:3000`  
4. Terminal B — Angular: `npm start` → `http://localhost:4200`  

**Credenciales demo**

| Campo        | Valor         |
|-------------|---------------|
| Email       | admin@crm.com |
| Contraseña  | 123456        |

---

## API mock (JSON Server)

- **Origen de datos:** `db.json`  
- **Recurso expuesto:** `/clients` (y el resto de claves de primer nivel del JSON, si las hubiera)  
- **Comando local:** `npm run mock-api` (equivale a `json-server --watch db.json --port 3000`)  

> JSON Server es adecuado para **desarrollo y demos**. No es una base de datos persistente en producción ni sustituye autenticación real.

---

## Despliegue — dónde y cómo

Tenés **dos partes**: el **build estático de Angular** y el **proceso Node que ejecuta JSON Server**.

### Frontend (Angular compilado)

Generás el build con `npm run build` (salida típica en `dist/...`). Ese contenido lo podés subir a:

| Servicio            | Notas breves |
|---------------------|--------------|
| **Vercel**          | Conectar el repo; framework preset Angular; variable de entorno para la URL de la API si la configurás en build. |
| **Netlify**         | Build `npm run build`, carpeta de publicación según `angular.json` (por ejemplo `dist/crm-frontend/browser` o la que indique tu `outputPath`). |
| **Cloudflare Pages**| Similar a Netlify: comando de build + directorio de salida. |
| **GitHub Pages**    | Posible con `angular-cli-ghpages` o workflow que publique la carpeta `dist`; la ruta base suele requerir `base href`. |

### “Backend” (JSON Server en la nube)

Cualquier PaaS que ejecute **Node** con un comando de inicio sirve. Ejemplos:

| Servicio   | Idea general |
|------------|----------------|
| **Render** | Web Service: repo Node, `npm install`, comando de start. El puerto lo define la plataforma (`PORT`); el comando debe escuchar en `0.0.0.0`. |
| **Railway**| Igual: servicio Node, variables de entorno, comando `json-server` o `npx json-server`. |
| **Fly.io** | Dockerfile o imagen Node + comando de arranque. |

**Comando típico en hosting** (adaptá el puerto a la variable del proveedor):

```bash
npx json-server --watch db.json --host 0.0.0.0 --port ${PORT:-3000}
```

**CORS:** si el Angular queda en otro dominio (ej. `*.netlify.app`) y la API en otro, el navegador puede bloquear peticiones. Opciones: proxy del frontend, reglas CORS en un pequeño wrapper alrededor de JSON Server, o mismo dominio vía reverse proxy.

**URL de la API en producción:** hoy `src/environments/environment.ts` apunta a `http://localhost:3000`. Para producción conviene un `environment.prod.ts` (o variables de build) con la URL pública de tu JSON Server y `fileReplacements` en `angular.json`, o configurar la URL vía variable en el pipeline de CI.

---

## Scripts npm (referencia)

| Script            | Descripción              |
|-------------------|--------------------------|
| `npm start`       | Servidor de desarrollo Angular |
| `npm run mock-api`| JSON Server (puerto 3000) |
| `npm run build`   | Build de producción      |
| `npm test`        | Tests unitarios          |

---

## Estructura conceptual del código

Organización por capas y features: `core`, `layout`, `features`, `shared`.

---

## Notas de negocio / datos

- La baja lógica no borra el registro: se actualiza estado y `deletedAt`.  
- En listados, por defecto se excluyen dados de baja según filtros de la app.  

---

*Documento generado para portfolio, Notion y lectura en GitHub. El detalle de instalación mínima sigue en `README.md`.*
