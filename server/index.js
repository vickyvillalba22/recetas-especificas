import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.post('/api/recipe-suggestions', async (req, res) => {
  const { mealType = 'cena', ingredients = '', preferences = '' } = req.body ?? {}

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Configura GEMINI_API_KEY en el archivo .env del servidor.' })
  }

  const prompt = `Eres una nutricionista experta en recetas bajas en FODMAP para personas con SIBO. Sugiere una receta sencilla para ${mealType}.
Ingredientes disponibles: ${ingredients || 'elige ingredientes comunes bajos en FODMAP'}.
Preferencias: ${preferences || 'ninguna'}.
Devuelve únicamente un JSON válido con esta forma: {"name":"...","description":"...","time":"...","ingredients":[{"name":"...","amount":"..."}],"steps":["..."]}.
No hagas afirmaciones médicas. Respeta porciones bajas en FODMAP y evita ajo, cebolla, trigo y legumbres.`

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })
    const text = response.text?.replace(/^```json\s*|\s*```$/g, '').trim()
    const recipe = JSON.parse(text)
    return res.json(recipe)
  } catch (error) {
    console.error('Gemini recipe error:', error)
    return res.status(502).json({ error: 'No pudimos generar la receta. Inténtalo de nuevo.' })
  }
})

app.listen(port, () => console.log(`API lista en http://localhost:${port}`))
