'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Camera, X } from '../ui/icons'

const MAX_IMAGE_BYTES = 200 * 1024

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No pudimos leer la imagen seleccionada.'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('No pudimos preparar la imagen.'))
        }
      },
      'image/jpeg',
      quality,
    )
  })
}

async function compressImage(file) {
  const image = await loadImage(file)
  let width = image.naturalWidth
  let height = image.naturalHeight

  if (width > 800) {
    height = Math.round(height * (800 / width))
    width = 800
  }

  const canvas = document.createElement('canvas')
  let quality = 0.7

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, quality)
    if (blob.size <= MAX_IMAGE_BYTES) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      return {
        base64: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
        previewUrl: dataUrl,
      }
    }

    if (quality > 0.4) {
      quality = Math.max(0.4, quality - 0.1)
    } else {
      width = Math.max(320, Math.round(width * 0.85))
      height = Math.max(320, Math.round(height * 0.85))
    }
  }

  throw new Error('La imagen no pudo comprimirse por debajo de 200 KB.')
}

export function FoodScannerPanel() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const cooldownTimerRef = useRef(null)
  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        window.clearInterval(cooldownTimerRef.current)
      }
    }
  }, [])

  function startCooldown() {
    if (cooldownTimerRef.current) {
      window.clearInterval(cooldownTimerRef.current)
    }

    setCooldownSeconds(3)
    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(cooldownTimerRef.current)
          cooldownTimerRef.current = null
          return 0
        }

        return current - 1
      })
    }, 1000)
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsPreparing(true)
    setError('')
    setResult(null)

    try {
      const compressedImage = await compressImage(file)
      setImage(compressedImage)
    } catch (preparationError) {
      setImage(null)
      setError(
        preparationError.message || 'No pudimos preparar la imagen.',
      )
    } finally {
      setIsPreparing(false)
    }
  }

  function clearImage() {
    setImage(null)
    setResult(null)
    setError('')
  }

  async function analyzeImage() {
    if (!image || isPreparing || isLoading || cooldownSeconds > 0) return

    if (!user) {
      setError('Tu sesión no está disponible. Volvé a iniciar sesión.')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/que-puedo-comer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          imageBase64: image.base64,
          mimeType: image.mimeType,
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'No pudimos analizar la imagen.')
      }

      if (!payload.result || typeof payload.result !== 'object') {
        throw new Error('No recibimos un resultado para esta imagen.')
      }

      setResult(payload.result)
    } catch (requestError) {
      setError(requestError.message || 'No pudimos analizar la imagen.')
    } finally {
      setIsLoading(false)
      startCooldown()
    }
  }

  return (
    <div className="mt-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="rounded-2xl border border-dashed border-ink/15 p-5 dark:border-cream/15">
        <div className="flex flex-col items-center text-center">
          {image ? (
            <div className="w-full">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl bg-ink">
                <img
                  src={image.previewUrl}
                  alt="Alimento seleccionado para analizar"
                  className="max-h-80 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={isLoading}
                  aria-label="Quitar imagen"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink/75 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-3 text-xs text-ink/50 dark:text-cream/50">
                Imagen lista para analizar.
              </p>
              <button
                type="button"
                onClick={analyzeImage}
                disabled={isPreparing || isLoading || cooldownSeconds > 0}
                className="mt-5 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading
                  ? 'Analizando...'
                  : cooldownSeconds > 0
                    ? `Esperá ${cooldownSeconds}s`
                    : 'Analizar alimento'}
              </button>
            </div>
          ) : (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sage text-moss dark:bg-moss/30 dark:text-sage">
                <Camera size={28} />
              </span>
              <h3 className="mt-4 font-display text-2xl">
                Analizá un alimento
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60 dark:text-cream/60">
                Sacale una foto al ingrediente que quieras consultar y recibí una
                orientación adaptada a tu perfil.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPreparing}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera size={18} />
                {isPreparing ? 'Preparando imagen...' : 'Abrir cámara'}
              </button>
            </>
          )}
          {error && (
            <p className="mt-4 w-full rounded-xl bg-coral/10 p-3 text-left text-sm text-coral">
              {error}
            </p>
          )}
        </div>
      </div>

      {result && (
        <section
          className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 text-left dark:border-cream/10 dark:bg-ink-soft"
          aria-live="polite"
          aria-labelledby="ingredient-result-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-coral">
                Resultado del análisis
              </span>
              <h3 id="ingredient-result-title" className="mt-1 font-display text-2xl">
                {result.ingredienteDetectado || 'Ingrediente no identificado'}
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                result.esApto
                  ? 'bg-sage text-moss dark:bg-moss/30 dark:text-sage'
                  : 'bg-coral/10 text-coral'
              }`}
            >
              {result.esApto ? 'Apto según tu perfil' : 'No apto según tu perfil'}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/75 dark:text-cream/75">
            {result.veredicto}
          </p>
          {!result.esApto && result.alternativa && (
            <p className="mt-4 rounded-xl bg-sage/70 p-3 text-sm leading-relaxed text-ink/75 dark:bg-moss/25 dark:text-cream/80">
              <strong>Alternativa:</strong> {result.alternativa}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
