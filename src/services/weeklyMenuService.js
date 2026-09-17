import { HARDCODED_USER_ID, supabase } from '../lib/supabase'

const TABLE_NAME = 'weekly-menu'

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Revisa las variables VITE_SUPABASE_* en tu archivo .env.')
  }

  return supabase
}

function normalizeIngredients(ingredients) {
  if (Array.isArray(ingredients)) return ingredients
  if (typeof ingredients === 'string') {
    try {
      const parsed = JSON.parse(ingredients)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return ingredients.split(',').map((ingredient) => ingredient.trim()).filter(Boolean)
    }
  }

  return []
}

function mapMeal(row) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    mealType: row.meal_type,
    name: row.recipe_name || '',
    ingredients: normalizeIngredients(row.ingredients),
  }
}

function getError(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

export async function getWeeklyMenu({ startDate, endDate, userId = HARDCODED_USER_ID }) {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .select('id, user_id, date, meal_type, recipe_name, ingredients')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw new Error(getError(error, 'No se pudo cargar el menú semanal.'))
  return (data || []).map(mapMeal)
}

export async function createMeal({ date, mealType, recipeName, ingredients = [], userId = HARDCODED_USER_ID }) {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      date,
      meal_type: mealType,
      recipe_name: recipeName,
      ingredients: normalizeIngredients(ingredients),
    })
    .select('id, user_id, date, meal_type, recipe_name, ingredients')
    .single()

  if (error) throw new Error(getError(error, 'No se pudo guardar la comida.'))
  return mapMeal(data)
}

export async function updateMeal({ id, date, mealType, recipeName, ingredients = [], userId = HARDCODED_USER_ID }) {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .update({
      date,
      meal_type: mealType,
      recipe_name: recipeName,
      ingredients: normalizeIngredients(ingredients),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, user_id, date, meal_type, recipe_name, ingredients')
    .single()

  if (error) throw new Error(getError(error, 'No se pudo actualizar la comida.'))
  return mapMeal(data)
}

export async function moveOrSwapMeals({ sourceId, sourceDate, sourceMealType, targetId = null, targetDate, targetMealType, userId = HARDCODED_USER_ID }) {
  const { data, error } = await getSupabaseClient().rpc('move_or_swap_weekly_meals', {
    p_user_id: userId,
    p_source_id: String(sourceId),
    p_source_date: sourceDate,
    p_source_meal_type: sourceMealType,
    p_target_id: targetId ? String(targetId) : null,
    p_target_date: targetDate,
    p_target_meal_type: targetMealType,
  })

  if (error) throw new Error(getError(error, 'No se pudo mover la comida.'))
  return (data || []).map(mapMeal)
}

export async function deleteMeal({ id, userId = HARDCODED_USER_ID }) {
  const { error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(getError(error, 'No se pudo eliminar la comida.'))
}
