'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MealModal } from '../components/home/modals/MealModal'
import { RecipeAddedModal } from '../components/home/modals/RecipeAddedModal'
import { getShoppingList, saveShoppingList } from '../services/home/shoppingListService'
import { createMeal, getWeeklyMenu } from '../services/home/weeklyMenuService'
import { addDays, formatDateKey, getMonday } from '../utils/weeklyMenuUtils'
import { groupShoppingItems, mergeShoppingItems } from '../utils/shoppingListUtils'

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getCurrentDateKey() {
  return formatDateKey(new Date())
}

export function useRecipeMenuFlow() {
  const router = useRouter()
  const [target, setTarget] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const currentWeekStart = getMonday(new Date())
  const minDate = formatDateKey(currentWeekStart)
  const maxDate = formatDateKey(addDays(currentWeekStart, 6))

  function openAddRecipe(recipe) {
    setError('')
    setTarget({
      date: getCurrentDateKey(),
      meal: 'Cena',
      recipe,
    })
  }

  function closeMealModal() {
    if (saving) return
    setTarget(null)
    setError('')
  }

  async function saveRecipeToMenu(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const date = form.get('date')
    const meal = form.get('meal')
    const name = form.get('name')?.trim()
    const ingredients = form
      .get('ingredients')
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (!date || !meal || !name) return

    setSaving(true)
    setError('')

    try {
      const mealType = meal.toLowerCase()
      const mealsOnDate = await getWeeklyMenu({ startDate: date, endDate: date })
      const occupied = mealsOnDate.some((item) => item.date === date && item.mealType === mealType)
      if (occupied) {
        throw new Error('Ese día y momento ya tiene una comida. Elegí otra fecha o momento.')
      }

      await createMeal({
        date,
        mealType,
        recipeName: name,
        ingredients,
      })

      const weekId = formatDateKey(getMonday(parseDateKey(date)))
      const savedList = await getShoppingList({ weekId })
      const nextItems = mergeShoppingItems(
        savedList?.items || [],
        groupShoppingItems(ingredients),
      )
      await saveShoppingList({ weekId, items: nextItems })

      setTarget(null)
      setConfirmation({ recipeName: name })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  function closeConfirmation() {
    setConfirmation(null)
  }

  function goToMenu() {
    setConfirmation(null)
    router.push('/')
  }

  const modals = (
    <>
      {target && (
        <MealModal
          target={target}
          minDate={minDate}
          maxDate={maxDate}
          onClose={closeMealModal}
          onSubmit={saveRecipeToMenu}
          error={error}
          loading={saving}
        />
      )}
      {confirmation && (
        <RecipeAddedModal
          recipeName={confirmation.recipeName}
          onClose={closeConfirmation}
          onGoToMenu={goToMenu}
        />
      )}
    </>
  )

  return {
    openAddRecipe,
    modals,
  }
}
