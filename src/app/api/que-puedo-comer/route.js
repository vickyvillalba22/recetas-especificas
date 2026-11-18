import { getAdminAuth, getAdminDb } from '../../../lib/firebase/admin'
import {
  analizarIngredienteImagen,
  recomendarRecetas,
} from '../../../lib/aiService'

export const runtime = 'nodejs'

const MAX_TEXT_LENGTH = 250
const MAX_IMAGE_BYTES = 200 * 1024
const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const RATE_LIMIT_MAX_REQUESTS = 5
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const DAILY_LIMIT_MAX_REQUESTS = 30
const DAILY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000

const requestsByUser = new Map()

function jsonError(message, status, code, debug) {
  return Response.json(
    { error: message, ...(code ? { code } : {}), ...(debug ? { debug } : {}) },
    { status },
  )
}

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || ''
  return authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''
}

async function getAuthenticatedUser(request) {
  const token = getBearerToken(request)
  if (!token) return null

  try {
    return await getAdminAuth().verifyIdToken(token)
  } catch {
    return null
  }
}

function isRateLimited(uid) {
  const now = Date.now()
  const recentRequests = (requestsByUser.get(uid) || []).filter(
    (timestamp) => now - timestamp < DAILY_LIMIT_WINDOW_MS,
  )
  const minuteRequests = recentRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )

  if (recentRequests.length >= DAILY_LIMIT_MAX_REQUESTS) {
    requestsByUser.set(uid, recentRequests)
    return 'daily'
  }

  if (minuteRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestsByUser.set(uid, recentRequests)
    return 'minute'
  }

  recentRequests.push(now)
  requestsByUser.set(uid, recentRequests)
  return null
}

function normalizeImagePayload(imageBase64) {
  if (typeof imageBase64 !== 'string') return null

  const dataUrlMatch = imageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      data: dataUrlMatch[2],
    }
  }

  return {
    mimeType: null,
    data: imageBase64,
  }
}

function isSupportedImageMimeType(mimeType) {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType)
}

function isValidBase64(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length % 4 === 0 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(value)
  )
}

function getDecodedBase64Bytes(value) {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
  return Math.floor((value.length * 3) / 4) - padding
}

function isGeminiUnavailableError(error) {
  const status = error?.status || error?.code
  const message = String(error?.message || '').toLowerCase()

  return (
    status === 503 ||
    status === '503' ||
    message.includes('unavailable') ||
    message.includes('high demand')
  )
}

export async function POST(request) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return jsonError('La sesión venció o no es válida.', 401, 'SESSION_EXPIRED')
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('El cuerpo de la solicitud no es un JSON válido.', 400, 'INVALID_REQUEST')
  }

  if (!body || typeof body !== 'object') {
    return jsonError('La solicitud es inválida.', 400, 'INVALID_REQUEST')
  }

  if (!['recipes', 'image'].includes(body.type)) {
    return jsonError('El tipo de consulta no es válido.', 400, 'INVALID_REQUEST')
  }

  let imagePayload
  if (body.type === 'recipes') {
    if (typeof body.consulta !== 'string') {
      return jsonError('La consulta de ingredientes es obligatoria.', 400)
    }

    const consulta = body.consulta.trim()
    if (!consulta) {
      return jsonError('La consulta de ingredientes no puede estar vacía.', 400)
    }

    if (consulta.length > MAX_TEXT_LENGTH) {
      return jsonError(
        `La consulta no puede superar los ${MAX_TEXT_LENGTH} caracteres.`,
        413,
      )
    }
  } else {
    imagePayload = normalizeImagePayload(body.imageBase64)
    if (!imagePayload?.data) {
      return jsonError('La imagen es obligatoria.', 400, 'INVALID_IMAGE')
    }

    const effectiveMimeType =
      imagePayload.mimeType || body.mimeType || 'image/jpeg'
    if (!isSupportedImageMimeType(effectiveMimeType)) {
      return jsonError('El formato de imagen no es compatible.', 415, 'INVALID_IMAGE')
    }

    if (!isValidBase64(imagePayload.data)) {
      return jsonError('La imagen Base64 no es válida.', 400, 'INVALID_IMAGE')
    }

    const imageBytes = getDecodedBase64Bytes(imagePayload.data)
    if (!Number.isFinite(imageBytes) || imageBytes > MAX_IMAGE_BYTES) {
      return jsonError(
        'La imagen supera el límite permitido de 200 KB.',
        413,
        'INVALID_IMAGE',
      )
    }
  }

  const rateLimitType = isRateLimited(user.uid)
  if (rateLimitType === 'daily') {
      return jsonError(
        'Alcanzaste el límite de 30 consultas diarias. Intentá nuevamente mañana.',
        429,
        'RATE_LIMIT',
      )
  }

  if (rateLimitType === 'minute') {
    return jsonError(
      'Alcanzaste el límite de 5 consultas por minuto. Intentá nuevamente en unos segundos.',
      429,
      'RATE_LIMIT',
    )
  }

  try {
    const profileStartTime = Date.now()
    const profileSnapshot = await getAdminDb().doc(`users/${user.uid}`).get()
    const profileDurationMs = Date.now() - profileStartTime
    if (!profileSnapshot.exists) {
      return jsonError('No se encontró el perfil del usuario.', 404)
    }

    const perfilSalud = profileSnapshot.data()?.perfilSalud
    if (
      !perfilSalud ||
      typeof perfilSalud !== 'object' ||
      Array.isArray(perfilSalud)
    ) {
      return jsonError(
        'Todavía no hay un perfil de salud configurado. Completá el onboarding.',
        400,
      )
    }

    if (body.type === 'recipes') {
      const geminiStartTime = Date.now()
      try {
        const recommendation = await recomendarRecetas({
          consulta: body.consulta.trim(),
          perfilSalud,
        })
        console.log('Qué puedo comer timings:', {
          type: body.type,
          profileDurationMs,
          geminiDurationMs: Date.now() - geminiStartTime,
          totalDurationMs: Date.now() - profileStartTime,
        })
        return Response.json({
          result: recommendation.result,
          debug: recommendation.debug,
        })
      } catch (error) {
        console.error('Qué puedo comer Gemini timing:', {
          type: body.type,
          profileDurationMs,
          geminiDurationMs: Date.now() - geminiStartTime,
          totalDurationMs: Date.now() - profileStartTime,
        })
         return jsonError(
           error.message || 'Gemini no pudo procesar la respuesta.',
           502,
           isGeminiUnavailableError(error) ? 'GEMINI_UNAVAILABLE' : 'AI_ERROR',
           {
            rawResponse: error.rawResponse || '',
            finishReason: error.finishReason || 'unknown',
          },
        )
      }
    }

    try {
      const result = await analizarIngredienteImagen({
        imageBase64: imagePayload.data,
        mimeType:
          imagePayload.mimeType || body.mimeType || 'image/jpeg',
        perfilSalud,
      })
      return Response.json({ result })
    } catch (error) {
      console.error('Qué puedo comer image analysis error:', error)
      return jsonError(
        isGeminiUnavailableError(error)
          ? 'El servicio de análisis está temporalmente ocupado.'
          : 'No pudimos analizar la imagen.',
        isGeminiUnavailableError(error) ? 503 : 502,
        isGeminiUnavailableError(error) ? 'GEMINI_UNAVAILABLE' : 'AI_ERROR',
      )
    }
  } catch (error) {
    console.error('Qué puedo comer API error:', error)
    return jsonError('Ocurrió un error inesperado. Intentá nuevamente más tarde.', 500, 'INTERNAL_ERROR')
  }
}
