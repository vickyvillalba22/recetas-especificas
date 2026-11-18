'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Camera, FileUpload, Info, X } from '../ui/icons'

const MAX_IMAGE_BYTES = 200 * 1024
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const API_TIMEOUT_MS = 30000
const INGREDIENT_STATES = ['apto', 'no_apto', 'no_identificado']

function getIngredientState(result) {
  if (INGREDIENT_STATES.includes(result?.estado)) return result.estado
  return result?.esApto ? 'apto' : 'no_apto'
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error('La imagen no tiene dimensiones válidas.'))
        return
      }
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
  const videoRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const cooldownTimerRef = useRef(null)
  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        window.clearInterval(cooldownTimerRef.current)
      }
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
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

  async function processImageFile(file) {
    if (!(file instanceof File) || file.size <= 0) {
      setError('El archivo seleccionado está vacío o no es válido.')
      return
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setError('Formato no compatible. Usá una imagen JPG, PNG o WebP.')
      return
    }

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

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await processImageFile(file)
  }

  async function openCamera() {
    setError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no permite acceder a la cámara. Podés seleccionar un archivo.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      cameraStreamRef.current = stream
      setIsCameraOpen(true)
    } catch {
      setError(
        'No pudimos acceder a la cámara. Revisá los permisos del navegador o seleccioná un archivo.',
      )
    }
  }

  function closeCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
    setIsCameraOpen(false)
  }

  async function captureCameraImage() {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) {
      setError('La cámara todavía no está lista. Esperá un momento e intentá nuevamente.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      const blob = await canvasToBlob(canvas, 0.9)
      closeCamera()
      await processImageFile(new File([blob], 'captura-camara.jpg', { type: 'image/jpeg' }))
    } catch (captureError) {
      setError(captureError.message || 'No pudimos capturar la imagen.')
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
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/que-puedo-comer', {
        method: 'POST',
        signal: controller.signal,
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
        const error = new Error(payload.error || 'No pudimos analizar la imagen.')
        error.code = payload.code
        error.status = response.status
        throw error
      }

      if (!payload.result || typeof payload.result !== 'object') {
        throw new Error('No recibimos un resultado para esta imagen.')
      }

      setResult(payload.result)
    } catch (requestError) {
      if (requestError.name === 'AbortError') {
        setError('El análisis tardó demasiado. Revisá tu conexión e intentá nuevamente.')
      } else if (
        requestError.code === 'SESSION_EXPIRED' ||
        requestError.status === 401
      ) {
        setError('Tu sesión venció. Volvé a iniciar sesión para analizar la imagen.')
      } else if (requestError.code === 'INVALID_IMAGE') {
        setError(requestError.message)
      } else if (requestError.code === 'RATE_LIMIT') {
        setError(requestError.message)
      } else if (requestError.code === 'GEMINI_UNAVAILABLE') {
        setError('El servicio de análisis está temporalmente ocupado. Intentá nuevamente en unos segundos.')
      } else {
        setError(requestError.message || 'No pudimos analizar la imagen. Intentá nuevamente.')
      }
    } finally {
      window.clearTimeout(timeoutId)
      setIsLoading(false)
      startCooldown()
    }
  }

  const resultState = result ? getIngredientState(result) : null

  return (
    <div className="mt-6">
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_IMAGE_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        className="rounded-2xl border border-dashed border-ink/15 p-5 dark:border-cream/15"
        aria-busy={isPreparing || isLoading}
      >
        <div className="flex flex-col items-center text-center">
          {(isPreparing || isLoading) && (
            <p
              className="mb-4 rounded-xl bg-sage/60 px-4 py-2 text-sm font-bold text-moss dark:bg-moss/25 dark:text-sage"
              role="status"
              aria-live="polite"
            >
              {isPreparing ? 'Preparando imagen...' : 'Analizando alimento...'}
            </p>
          )}
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
                  {isLoading ? 'Estamos analizando la imagen.' : 'Imagen lista para analizar.'}
                </p>
               <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isLoading || isPreparing}
                   className="inline-flex items-center justify-center gap-2 rounded-full border border-moss px-4 py-2.5 text-xs font-bold text-moss transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-50 dark:border-sage dark:text-sage dark:hover:bg-moss/25"
                 >
                   <FileUpload size={16} />
                   Reemplazar imagen
                 </button>
                 <button
                   type="button"
                   onClick={clearImage}
                   disabled={isLoading || isPreparing}
                   className="rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink/60 transition hover:border-coral/40 hover:text-coral disabled:cursor-not-allowed disabled:opacity-50 dark:border-cream/15 dark:text-cream/60"
                 >
                   Quitar imagen
                 </button>
               </div>
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
              {isCameraOpen ? (
                <div className="w-full">
                  <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-ink">
                    <video
                      ref={(node) => {
                        videoRef.current = node
                        if (node && cameraStreamRef.current) {
                          node.srcObject = cameraStreamRef.current
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="max-h-80 w-full object-contain"
                    />
                  </div>
                  <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={captureCameraImage}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink"
                    >
                      <Camera size={18} />
                      Capturar foto
                    </button>
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="rounded-full border border-moss px-6 py-3.5 text-sm font-bold text-moss transition hover:bg-sage dark:border-sage dark:text-sage dark:hover:bg-moss/25"
                    >
                      Cancelar
                    </button>
                  </div>
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
                  <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={openCamera}
                      disabled={isPreparing}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Camera size={18} />
                      Abrir cámara
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPreparing}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-moss px-6 py-3.5 text-sm font-bold text-moss transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-50 dark:border-sage dark:text-sage dark:hover:bg-moss/25"
                    >
                      <FileUpload size={18} />
                      Seleccionar archivo
                    </button>
                  </div>
                </>
              )}
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
                resultState === 'apto'
                  ? 'bg-sage text-moss dark:bg-moss/30 dark:text-sage'
                  : resultState === 'no_apto'
                    ? 'bg-coral/10 text-coral'
                    : 'bg-sun/20 text-ink dark:text-cream'
              }`}
            >
              {resultState === 'apto'
                ? 'Apto según tu perfil'
                : resultState === 'no_apto'
                  ? 'No recomendado según tu perfil'
                  : 'No pudimos identificarlo'}
            </span>
          </div>
          <p className="mt-3 text-xs text-ink/50 dark:text-cream/50">
            Análisis completado según la imagen y la información de tu perfil.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/75 dark:text-cream/75">
            {result.veredicto}
          </p>
          {resultState === 'no_apto' && result.alternativa && (
            <p className="mt-4 rounded-xl bg-sage/70 p-3 text-sm leading-relaxed text-ink/75 dark:bg-moss/25 dark:text-cream/80">
              <strong>Alternativa:</strong> {result.alternativa}
            </p>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-sun/15 p-3 text-xs leading-relaxed text-ink/70 dark:bg-sun/10 dark:text-cream/75">
            <Info size={16} className="mt-0.5 shrink-0 text-ink/60 dark:text-cream/60" />
            <p>
              Esta información es orientativa y no reemplaza la indicación de un
              profesional de la salud.
            </p>
          </div>
          <button
            type="button"
            onClick={clearImage}
            disabled={isLoading || isPreparing}
            className="mt-5 rounded-full border border-moss px-5 py-3 text-sm font-bold text-moss transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-50 dark:border-sage dark:text-sage dark:hover:bg-moss/25"
          >
            Analizar otra imagen
          </button>
        </section>
      )}
    </div>
  )
}
