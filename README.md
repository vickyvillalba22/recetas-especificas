# sibo.decis

Aplicación web para planificar comidas y organizar una lista de compras siguiendo una alimentación baja en FODMAP.

Actualmente el proyecto está migrado a Next.js y utiliza Firebase Authentication y Cloud Firestore para usuarios, menú semanal, diario, recetas y listas de compras.

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
- `/recetas`: galería de recetas generales.
- `/mis-recetas`: recetas personales del usuario.
- `/diario`: diario personal.
- `/admin`: placeholder del panel administrativo.
- `/admin/recetas`: gestión administrativa de recetas generales.

## Estructura

```text
src/app/              Rutas y layouts de Next.js App Router
src/components/       Componentes reutilizables de React
src/services/         Servicios de Firebase y helpers de Firestore
src/app/globals.css   Estilos globales y configuración Tailwind
next.config.mjs       Configuración de Next.js
```

Los datos actuales se guardan por usuario en Firebase. Los datos del menú, las recetas y el diario se separan por usuario; las recetas generales se almacenan en `publicRecipes`.

## Configuración administrativa

Las operaciones administrativas usan Firebase Admin SDK únicamente del lado servidor. Para asignar el primer administrador, crea un `.env.local` con estas variables privadas:

```env
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@tu-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Luego ejecuta:

```bash
npm run admin:bootstrap -- tu-email@gmail.com
```

Después, cierra sesión y vuelve a ingresar para renovar el token con el rol `admin`. Las credenciales privadas nunca deben comenzar con `NEXT_PUBLIC_` ni subirse al repositorio.
