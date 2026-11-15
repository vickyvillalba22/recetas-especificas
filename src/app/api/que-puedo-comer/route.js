import { getAdminAuth, getAdminDb } from '../../../lib/firebase/admin'
import {
  analizarIngredienteImagen,
  recomendarRecetas,
} from '../../../lib/aiService'

export const runtime = 'nodejs'

const MAX_TEXT_LENGTH = 250
const MAX_IMAGE_BYTES = 300 * 1024
const RATE_LIMIT_MAX_REQUESTS = 5
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const DAILY_LIMIT_MAX_REQUESTS = 30
const DAILY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000

const requestsByUser = new Map()

function jsonError(message, status) {
  return Response.json({ error: message }, { status })
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
  return ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)
}

function isValidBase64(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length % 4 === 0 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(value)
  )
}

export async function POST(request) {
  const user = await getAuthenticatedUser(request)
  if (!user) return jsonError('No autorizado.', 401)

  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('El cuerpo de la solicitud no es un JSON válido.', 400)
  }

  if (!body || typeof body !== 'object') {
    return jsonError('La solicitud es inválida.', 400)
  }

  if (!['recipes', 'image'].includes(body.type)) {
    return jsonError('El tipo de consulta no es válido.', 400)
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
      return jsonError('La imagen es obligatoria.', 400)
    }

    const effectiveMimeType =
      imagePayload.mimeType || body.mimeType || 'image/jpeg'
    if (!isSupportedImageMimeType(effectiveMimeType)) {
      return jsonError('El formato de imagen no es compatible.', 415)
    }

    if (!isValidBase64(imagePayload.data)) {
      return jsonError('La imagen Base64 no es válida.', 400)
    }

    const imageBase64Bytes = Buffer.byteLength(imagePayload.data, 'utf8')
    if (
      !Number.isFinite(imageBase64Bytes) ||
      imageBase64Bytes > MAX_IMAGE_BYTES
    ) {
      return jsonError('La imagen supera el límite permitido de 300 KB.', 413)
    }
  }

  const rateLimitType = isRateLimited(user.uid)
  if (rateLimitType === 'daily') {
    return jsonError(
      'Alcanzaste el límite de 30 consultas diarias. Intentá nuevamente mañana.',
      429,
    )
  }

  if (rateLimitType === 'minute') {
    return jsonError(
      'Alcanzaste el límite de 5 consultas por minuto. Intentá nuevamente en unos segundos.',
      429,
    )
  }

  try {
    const profileSnapshot = await getAdminDb().doc(`users/${user.uid}`).get()
    if (!profileSnapshot.exists) {
      return jsonError('No se encontró el perfil del usuario.', 404)
    }

    const perfilSalud = profileSnapshot.data()?.perfilSalud
    if (!perfilSalud || typeof perfilSalud !== 'object') {
      return jsonError(
        'Todavía no hay un perfil de salud configurado. Completá el onboarding.',
        400,
      )
    }

    if (body.type === 'recipes') {
      const result = await recomendarRecetas({
        consulta: body.consulta.trim(),
        perfilSalud,
      })
      return Response.json({ result })
    }

    const result = await analizarIngredienteImagen({
      imageBase64: imagePayload.data,
      mimeType:
        imagePayload.mimeType || body.mimeType || 'image/jpeg',
      perfilSalud,
    })
    return Response.json({ result })
  } catch (error) {
    console.error('Qué puedo comer API error:', error)
    return jsonError(
      'No pudimos procesar la consulta. Intentá nuevamente más tarde.',
      500,
    )
  }
}
