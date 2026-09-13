import { HARDCODED_USER_ID, supabase } from '../lib/supabase'

const TABLE_NAME = 'recipes'

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Revisa las variables VITE_SUPABASE_* en tu archivo .env.')
  }

  return supabase
}

function normalizeJsonArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return value.split('\n').map((item) => item.trim()).filter(Boolean)
    }
  }

  return []
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  return []
}

function mapRecipe(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    ingredients: normalizeJsonArray(row.ingredients),
    steps: normalizeJsonArray(row.steps),
    time: row.time || '',
    tags: normalizeTags(row.tags),
    createdAt: row.created_at,
  }
}

function getError(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

const RECIPE_COLUMNS = 'id, user_id, name, description, ingredients, steps, time, tags, created_at'

export async function getPublicRecipes() {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .select(RECIPE_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw new Error(getError(error, 'No se pudieron cargar las recetas.'))
  return (data || []).map(mapRecipe)
}

export async function createRecipe({ name, description = '', ingredients = [], steps = [], time = '', tags = [], userId = HARDCODED_USER_ID }) {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      name,
      description,
      ingredients: normalizeJsonArray(ingredients),
      steps: normalizeJsonArray(steps),
      time,
      tags: normalizeTags(tags),
    })
    .select(RECIPE_COLUMNS)
    .single()

  if (error) throw new Error(getError(error, 'No se pudo guardar la receta.'))
  return mapRecipe(data)
}

export async function updateRecipe({ id, name, description = '', ingredients = [], steps = [], time = '', tags = [], userId = HARDCODED_USER_ID }) {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .update({
      name,
      description,
      ingredients: normalizeJsonArray(ingredients),
      steps: normalizeJsonArray(steps),
      time,
      tags: normalizeTags(tags),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select(RECIPE_COLUMNS)
    .single()

  if (error) throw new Error(getError(error, 'No se pudo actualizar la receta.'))
  return mapRecipe(data)
}

export async function deleteRecipe({ id, userId = HARDCODED_USER_ID }) {
  const { error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(getError(error, 'No se pudo eliminar la receta.'))
}
