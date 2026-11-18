'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { saveFavoriteRecipe } from '../../services/recipes/favoriteRecipesService'
import { useRecipeMenuFlow } from '../../hooks/useRecipeMenuFlow'
import { CirclePlus, Star } from '../ui/icons'

const MAX_CACHE_ENTRIES = 10

export function RecommendationsPanel() {
  const { user } = useAuth()
  const { openAddRecipe, modals: recipeMenuModals } = useRecipeMenuFlow()
  const [foodQuery, setFoodQuery] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [favoriteError, setFavoriteError] = useState('')
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(() => new Set())
  const [favoriteSavingId, setFavoriteSavingId] = useState(null)
  const [debugResponse, setDebugResponse] = useState(null)
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

  function normalizeGeneratedRecipe(recipe, index) {
    const name = String(recipe.nombre || 'Receta sugerida').trim()
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return {
      ...recipe,
      id: `gemini-${slug || 'receta'}-${index + 1}`,
      name,
      description: recipe.descripcion || '',
      time: recipe.tiempo || '',
      ingredients: Array.isArray(recipe.ingredientes) ? recipe.ingredientes : [],
      steps: recipe.preparacion ? [recipe.preparacion] : [],
      origin: 'gemini',
      aiWarning: recipe.advertenciaIngredientes || '',
    }
  }

  async function saveGeneratedFavorite(recipe) {
    setFavoriteSavingId(recipe.id)
    setFavoriteError('')
    try {
      await saveFavoriteRecipe(recipe)
      setFavoriteRecipeIds((current) => new Set(current).add(recipe.id))
    } catch (favoriteSaveError) {
      setFavoriteError(favoriteSaveError.message)
    } finally {
      setFavoriteSavingId(null)
    }
  }

  function addGeneratedRecipeToMenu(recipe) {
    openAddRecipe(recipe)
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
    setFavoriteError('')
    setResult(null)
    setDebugResponse(null)
    setFavoriteRecipeIds(new Set())

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 120000)

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
        if (payload.debug) setDebugResponse(payload.debug)
        throw new Error(payload.error || 'No pudimos obtener recomendaciones.')
      }

      if (!payload.result || !Array.isArray(payload.result.recetas)) {
        throw new Error('No recibimos recomendaciones para esta consulta.')
      }

      if (payload.debug) setDebugResponse(payload.debug)

      const normalizedResult = {
        ...payload.result,
        recetas: payload.result.recetas.map(normalizeGeneratedRecipe),
      }

      if (recommendationsCacheRef.current.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = recommendationsCacheRef.current.keys().next().value
        recommendationsCacheRef.current.delete(oldestKey)
      }
      recommendationsCacheRef.current.set(cacheKey, normalizedResult)
      setResult(normalizedResult)
    } catch (requestError) {
      if (requestError.debug) setDebugResponse(requestError.debug)
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
    <>
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
      {favoriteError && (
        <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">
          {favoriteError}
        </p>
      )}
      {debugResponse && (
        <details className="mt-4 rounded-xl border border-ink/15 bg-ink/5 p-3 text-xs dark:border-cream/15 dark:bg-cream/5">
          <summary className="cursor-pointer font-bold">
            Respuesta cruda de Gemini (diagnóstico temporal)
          </summary>
          <p className="mt-2 text-ink/60 dark:text-cream/60">
            Motivo de finalización: {debugResponse.finishReason}
          </p>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 font-mono text-[11px] dark:bg-ink">
            {debugResponse.rawResponse || '(respuesta vacía)'}
          </pre>
        </details>
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
                  {recipe.name}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-ink/65 dark:text-cream/65">
                  {recipe.description}
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
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-ink/10 pt-4 dark:border-cream/10">
                  <button
                    type="button"
                    onClick={() => saveGeneratedFavorite(recipe)}
                    disabled={favoriteSavingId === recipe.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      favoriteRecipeIds.has(recipe.id)
                        ? 'border-sun/40 bg-sun/15 text-ink dark:text-cream'
                        : 'border-ink/15 text-ink/60 hover:border-sun/50 hover:text-sun dark:border-cream/15 dark:text-cream/60'
                    }`}
                    aria-pressed={favoriteRecipeIds.has(recipe.id)}
                  >
                    <Star size={15} className={favoriteRecipeIds.has(recipe.id) ? 'fill-current text-sun' : ''} />
                    {favoriteRecipeIds.has(recipe.id) ? 'Guardada' : 'Favorita'}
                  </button>
                  <button
                    type="button"
                    onClick={() => addGeneratedRecipeToMenu(recipe)}
                    className="flex items-center gap-2 rounded-full bg-moss px-3 py-2 text-xs font-bold text-white transition hover:bg-ink"
                  >
                    <CirclePlus size={15} /> Menú
                  </button>
                </div>
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
      {recipeMenuModals}
    </>
  )
}
