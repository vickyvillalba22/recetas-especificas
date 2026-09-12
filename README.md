# sibo.decis

Boilerplate de una aplicación web para planificar comidas y organizar una lista de compras siguiendo una alimentación baja en FODMAP. Incluye un asistente de recetas conectado a Gemini.

## Requisitos

- Node.js 20 o superior
- Una API key de Google AI Studio

## Instalación

```bash
npm install
copy .env.example .env
```

Edita `.env` y agrega tu clave:

```env
GEMINI_API_KEY=tu_api_key_de_gemini
PORT=3001
```

Inicia el frontend y el backend en desarrollo:

```bash
npm run dev
```

La interfaz estará en `http://localhost:5173`. Vite redirige las llamadas `/api` al servidor Express, que corre en `http://localhost:3001` y expone `POST /api/recipe-suggestions`.

## Scripts

- `npm run dev`: Vite y la API en modo desarrollo.
- `npm run build`: genera el build de producción del frontend.
- `npm run preview`: previsualiza el build.
- `npm start`: inicia solo la API.

## Estructura

```text
src/                 Interfaz React y estilos Tailwind
server/index.js      API Express y helper de @google/genai
.env.example         Variables de entorno documentadas
vite.config.js       Configuración de Vite
```

La API key se consume únicamente en el backend. No uses el prefijo `VITE_` para esta variable, ya que Vite expondría su valor al cliente. Las sugerencias no sustituyen el consejo de un profesional de salud.
