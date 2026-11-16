import 'server-only'

import { GoogleGenAI, Type } from '@google/genai'

const MODEL = 'gemini-3.5-flash-lite'
const JSON_MIME_TYPE = 'application/json'

let aiClient

function getAIClient() {
  if (aiClient) return aiClient

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada.')
  }

  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 15000 },
  })
  return aiClient
}

const recipesResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recetas: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          nombre: { type: Type.STRING },
          descripcion: { type: Type.STRING },
          tiempo: { type: Type.STRING },
          ingredientes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          preparacion: { type: Type.STRING },
          advertenciaIngredientes: { type: Type.STRING },
        },
        required: [
          'nombre',
          'descripcion',
          'tiempo',
          'ingredientes',
          'preparacion',
          'advertenciaIngredientes',
        ],
        propertyOrdering: [
          'nombre',
          'descripcion',
          'tiempo',
          'ingredientes',
          'preparacion',
          'advertenciaIngredientes',
        ],
      },
    },
  },
  required: ['recetas'],
  propertyOrdering: ['recetas'],
}

const ingredientImageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    ingredienteDetectado: { type: Type.STRING },
    esApto: { type: Type.BOOLEAN },
    veredicto: { type: Type.STRING },
    alternativa: { type: Type.STRING },
  },
  required: ['ingredienteDetectado', 'esApto', 'veredicto', 'alternativa'],
  propertyOrdering: [
    'ingredienteDetectado',
    'esApto',
    'veredicto',
    'alternativa',
  ],
}

function serializeHealthProfile(perfilSalud = {}) {
  const profile = {
    tipoSibo: perfilSalud.tipoSibo || null,
    tipoSiboOtro: perfilSalud.tipoSiboOtro || null,
    faseProtocoloNutricional: perfilSalud.faseProtocoloNutricional || null,
    faseProtocoloNutricionalOtra:
      perfilSalud.faseProtocoloNutricionalOtra || null,
    condicionesDigestivas: perfilSalud.condicionesDigestivas || [],
    condicionesDigestivasOtra: perfilSalud.condicionesDigestivasOtra || null,
    restriccionesAlimentarias: perfilSalud.restriccionesAlimentarias || [],
    restriccionesAlimentariasOtra:
      perfilSalud.restriccionesAlimentariasOtra || null,
    preferenciaAlimentaria: perfilSalud.preferenciaAlimentaria || null,
    preferenciaAlimentariaOtra: perfilSalud.preferenciaAlimentariaOtra || null,
    ingredientesAEvitar: perfilSalud.ingredientesAEvitar || null,
  }

  const nonEmptyProfile = Object.fromEntries(
    Object.entries(profile).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim().length > 0
      return value !== null && value !== undefined
    }),
  )

  return JSON.stringify(nonEmptyProfile)
}

function parseJsonResponse(response) {
  const text = response?.text?.trim()
  const finishReason = response?.candidates?.[0]?.finishReason || 'unknown'
  if (!text) {
    const error = new Error('Gemini devolvió una respuesta vacía.')
    error.rawResponse = ''
    error.finishReason = finishReason
    throw error
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('Gemini raw response:', JSON.stringify(text))
    console.log('Gemini finish reason:', finishReason)
  }

  try {
    return JSON.parse(text)
  } catch {
    const error = new Error('Gemini devolvió una respuesta JSON inválida.')
    error.rawResponse = text
    error.finishReason = finishReason
    throw error
  }
}

export async function recomendarRecetas({ consulta, perfilSalud }) {
  const normalizedConsulta = String(consulta || '').trim()
  if (!normalizedConsulta) {
    throw new Error('La consulta de ingredientes no puede estar vacía.')
  }

  const profile = serializeHealthProfile(perfilSalud)
  const response = await getAIClient().models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Sos un asistente culinario especializado en SIBO y alimentación baja en FODMAP. Recomendá comidas de forma prudente y no reemplaces la indicación de un profesional de la salud.

Perfil de salud del usuario, en JSON:
${profile}

Ingredientes disponibles o antojo del usuario:
${normalizedConsulta}

Devolvé exactamente 3 ideas de recetas o comidas seguras para este perfil. Priorizá los ingredientes que pidió el usuario y respetá estrictamente su fase, condiciones, restricciones, alergias, preferencia alimentaria e ingredientes a evitar. Si algún ingrediente pedido no es apto o requiere cautela, no lo uses como ingrediente principal y explicalo brevemente en advertenciaIngredientes. Si todos son aptos, usá una cadena vacía en ese campo. No inventes diagnósticos ni afirmes seguridad médica absoluta.

Sé breve y directo:
- nombre: máximo 60 caracteres;
- descripción: máximo 160 caracteres;
- tiempo: indicá el tiempo total aproximado, por ejemplo "20 minutos";
- ingredientes: usá prioritariamente los ingredientes aportados por el usuario y únicamente los necesarios para la receta;
- podés agregar como máximo 1 o 2 ingredientes complementarios si hacen falta para completar la preparación;
- preparación: máximo 400 caracteres;
- advertenciaIngredientes: máximo 160 caracteres.

Si el usuario indicó ingredientes aptos, intentá incorporarlos como base de cada receta. No agregues ingredientes innecesarios ni fuerces un ingrediente que sea incompatible con el perfil de salud; en ese caso, explicalo brevemente en advertenciaIngredientes. No agregues explicaciones fuera del JSON y respetá exactamente el esquema solicitado.`,
          },
        ],
      },
    ],
    config: {
      maxOutputTokens: 1200,
      responseMimeType: JSON_MIME_TYPE,
      responseSchema: recipesResponseSchema,
    },
  })

  console.log('Gemini usage metadata:', response?.usageMetadata || null)

  return {
    result: parseJsonResponse(response),
    debug: {
      rawResponse: response?.text?.trim() || '',
      finishReason: response?.candidates?.[0]?.finishReason || 'unknown',
    },
  }
}

export async function analizarIngredienteImagen({
  imageBase64,
  mimeType = 'image/jpeg',
  perfilSalud,
}) {
  if (!imageBase64) {
    throw new Error('La imagen es obligatoria.')
  }

  const profile = serializeHealthProfile(perfilSalud)
  const response = await getAIClient().models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Analizá la imagen para identificar el ingrediente o alimento principal visible y evaluarlo según el perfil de salud del usuario.

Perfil de salud del usuario, en JSON:
${profile}

Indicaciones:
- Si no podés identificar un ingrediente con suficiente confianza, indicá "No identificado" y explicalo brevemente.
- Determiná si puede comerlo según tipo de SIBO, fase, condiciones digestivas, restricciones, alergias, preferencia e ingredientes a evitar.
- El campo veredicto debe tener como máximo 2 oraciones, ser claro y prudente.
- Si no es apto, incluí una alternativa concreta; si es apto, usá una cadena vacía.
- No reemplaces la indicación de un profesional de la salud.
- Respondé únicamente con el JSON solicitado.`,
          },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      maxOutputTokens: 150,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: JSON_MIME_TYPE,
      responseSchema: ingredientImageResponseSchema,
    },
  })

  return parseJsonResponse(response)
}
