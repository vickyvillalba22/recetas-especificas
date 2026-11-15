'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const MAX_CACHE_ENTRIES = 10

export function RecommendationsPanel() {
  const { user } = useAuth()
  const [foodQuery, setFoodQuery] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const cooldownTimerRef = useRef(null)
  const recommendationsCacheRef = useRef(new Map())

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

  async function requestRecommendations(event) {
    event.preventDefault()
    if (isLoading || cooldownSeconds > 0) return

    const consulta = foodQuery.trim()
    if (!consulta) {
      setError('Escribí algunos ingredientes o contanos qué te gustaría comer.')
      setResult(null)
      return
    }

    if (consulta.length > 250) {
      setError('La consulta no puede superar los 250 caracteres.')
      setResult(null)
      return
    }

    const cacheKey = consulta.toLowerCase().replace(/\s+/g, ' ')
    const cachedResult = recommendationsCacheRef.current.get(cacheKey)
    if (cachedResult) {
      setError('')
      setResult(cachedResult)
      return
    }

    if (!user) {
      setError('Tu sesión no está disponible. Volvé a iniciar sesión.')
      setResult(null)
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 25000)

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
          type: 'recipes',
          consulta,
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'No pudimos obtener recomendaciones.')
      }

      if (!payload.result || !Array.isArray(payload.result.recetas)) {
        throw new Error('No recibimos recomendaciones para esta consulta.')
      }

      if (recommendationsCacheRef.current.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = recommendationsCacheRef.current.keys().next().value
        recommendationsCacheRef.current.delete(oldestKey)
      }
      recommendationsCacheRef.current.set(cacheKey, payload.result)
      setResult(payload.result)
    } catch (requestError) {
      setError(
        requestError.name === 'AbortError'
          ? 'La consulta tardó demasiado. Intentá nuevamente.'
          : requestError.message || 'No pudimos obtener recomendaciones.',
      )
    } finally {
      window.clearTimeout(timeoutId)
      setIsLoading(false)
      startCooldown()
    }
  }

  return (
    <form className="mt-6" onSubmit={requestRecommendations}>
      <label htmlFor="food-query" className="text-sm font-bold">
        ¿Qué tenés o qué te gustaría comer?
      </label>
      <textarea
        id="food-query"
        value={foodQuery}
        onChange={(event) => setFoodQuery(event.target.value)}
        maxLength={250}
        rows={4}
        className="field mt-2 min-h-28 resize-y"
        placeholder="Ej.: Tengo arroz, zanahoria y pollo, o tengo ganas de comer algo fresco."
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-ink/50 dark:text-cream/50">
          Podés escribir ingredientes o un antojo.
        </p>
        <span className="shrink-0 text-xs font-bold text-ink/45 dark:text-cream/50">
          {foodQuery.length}/250
        </span>
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!foodQuery.trim() || isLoading || cooldownSeconds > 0}
        className="mt-5 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading
          ? 'Buscando ideas...'
          : cooldownSeconds > 0
            ? `Esperá ${cooldownSeconds}s`
            : 'Recibir ideas'}
      </button>

      {result && Array.isArray(result.recetas) && result.recetas.length > 0 && (
        <section className="mt-8" aria-live="polite" aria-labelledby="recipes-result-title">
          <div className="mb-4">
            <h3 id="recipes-result-title" className="font-display text-2xl">
              Ideas para vos
            </h3>
            <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
              Estas sugerencias fueron adaptadas a la información de tu perfil.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {result.recetas.map((recipe, index) => (
              <article
                key={`${recipe.nombre || 'receta'}-${index}`}
                className="rounded-2xl border border-ink/10 bg-white p-5 dark:border-cream/10 dark:bg-ink-soft"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-coral">
                  Idea {index + 1}
                </span>
                <h4 className="mt-2 font-display text-xl">
                  {recipe.nombre}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-ink/65 dark:text-cream/65">
                  {recipe.descripcion}
                </p>
                <div className="mt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">
                    Ingredientes
                  </h5>
                  <ul className="mt-2 space-y-1 text-sm text-ink/75 dark:text-cream/75">
                    {recipe.ingredientes?.map((ingredient) => (
                      <li key={ingredient}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">
                    Preparación
                  </h5>
                  <p className="mt-2 text-sm leading-relaxed text-ink/75 dark:text-cream/75">
                    {recipe.preparacion}
                  </p>
                </div>
                {recipe.advertenciaIngredientes && (
                  <p className="mt-4 rounded-xl bg-sun/20 p-3 text-xs leading-relaxed text-ink/75 dark:text-cream/80">
                    {recipe.advertenciaIngredientes}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {result && (!Array.isArray(result.recetas) || result.recetas.length === 0) && (
        <p
          className="mt-6 rounded-xl border border-dashed border-ink/15 p-4 text-sm text-ink/55 dark:border-cream/15 dark:text-cream/55"
          aria-live="polite"
        >
          No encontramos recomendaciones para mostrar. Probá con otros ingredientes.
        </p>
      )}
    </form>
  )
}
