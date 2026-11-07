# sibo.decis

Aplicación web para planificar comidas y organizar una lista de compras siguiendo una alimentación baja en FODMAP.

Actualmente el proyecto está migrado a Next.js. La conexión con Firebase todavía no está implementada; el menú, las recetas y el diario utilizan datos temporales en memoria para validar la interfaz.

## Requisitos

- Node.js 20.9 o superior.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Scripts

- `npm run dev`: inicia Next.js en desarrollo.
- `npm run build`: genera el build de producción.
- `npm start`: inicia el build de producción.

## Rutas actuales

- `/`: menú principal.
- `/bienvenida`: bienvenida inicial.
- `/login`: placeholder de inicio de sesión.
- `/registro`: placeholder de registro.
- `/recetas`: recetas temporales.
- `/diario`: diario temporal.
- `/admin`: placeholder del panel administrativo.

## Estructura

```text
src/app/              Rutas y layouts de Next.js App Router
src/components/       Componentes reutilizables de React
src/services/mock*    Servicios temporales en memoria
src/app/globals.css   Estilos globales y configuración Tailwind
next.config.mjs       Configuración de Next.js
```

Firebase Authentication y Cloud Firestore se incorporarán en la siguiente etapa. Los datos temporales se reinician al recargar la aplicación.
