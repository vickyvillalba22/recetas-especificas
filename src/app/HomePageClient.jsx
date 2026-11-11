'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { Footer } from '../components/home/Footer'
import { HeroSection } from '../components/home/HeroSection'
import { ShoppingList } from '../components/home/ShoppingList'
import { WeeklyMenu } from '../components/home/WeeklyMenu'
import { CROSS_WEEK_DRAG_ENABLED, mealTimes } from '../components/home/weeklyMenuConstants'
import { Check, CirclePlus, Plus, X } from '../components/ui/icons'
import { getShoppingList, saveShoppingList } from '../services/shoppingListService'
import { createMeal, deleteMeal, getWeeklyMenu, moveOrSwapMeals, updateMeal } from '../services/weeklyMenuService'

const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const initialMenu = Object.fromEntries(weekdays.map((day) => [day, { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null }]))
function getMealIngredients(meal) {
  return Array.isArray(meal?.ingredients) ? meal.ingredients : []
}

function groupShoppingItems(ingredients) {
  const grouped = new Map()
  ingredients.forEach((ingredient) => {
    const name = String(ingredient || '').trim()
    if (!name) return
    const key = name.toLocaleLowerCase()
    const current = grouped.get(key)
    grouped.set(key, current ? { ...current, count: current.count + 1 } : { name, count: 1, checked: false })
  })
  return [...grouped.values()]
}

function getShoppingItems(menu) {
  const ingredients = []
  Object.values(menu).forEach((day) =>
    Object.values(day).forEach((meal) => ingredients.push(...getMealIngredients(meal))),
  )
  return groupShoppingItems(ingredients)
}

function getNewShoppingItems(ingredients, previousIngredients = []) {
  const previousNames = new Set(previousIngredients.map((ingredient) => String(ingredient || '').trim().toLocaleLowerCase()))
  return groupShoppingItems(ingredients.filter((ingredient) => !previousNames.has(String(ingredient || '').trim().toLocaleLowerCase())))
}

function mergeShoppingItems(items, additions = []) {
  const merged = items.map((item) => ({ ...item }))
  const indexes = new Map(merged.map((item, index) => [item.name.trim().toLocaleLowerCase(), index]))

  additions.forEach((item) => {
    const key = item.name.trim().toLocaleLowerCase()
    const index = indexes.get(key)
    if (index === undefined) {
      indexes.set(key, merged.length)
      merged.push({ ...item, checked: false })
      return
    }
    merged[index] = { ...merged[index], count: (Number(merged[index].count) || 1) + (Number(item.count) || 1) }
  })

  return merged
}

function removeShoppingIngredients(items, ingredients) {
  const removals = new Map(groupShoppingItems(ingredients).map((item) => [item.name.toLocaleLowerCase(), item.count]))
  return items.flatMap((item) => {
    const removalCount = removals.get(item.name.trim().toLocaleLowerCase())
    if (!removalCount) return [item]
    const remainingCount = (Number(item.count) || 1) - removalCount
    return remainingCount > 0 ? [{ ...item, count: remainingCount }] : []
  })
}

function getMonday(date) {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - ((day + 6) % 7))
  return monday
}

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function formatDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function formatWeekRange(start) {
  const end = addDays(start, 6)
  const startMonth = start.toLocaleDateString('es-ES', { month: 'long' })
  const endMonth = end.toLocaleDateString('es-ES', { month: 'long' })
  return startMonth === endMonth ? `${start.getDate()} — ${end.getDate()} de ${endMonth}` : `${start.getDate()} de ${startMonth} — ${end.getDate()} de ${endMonth}`
}

function formatDayName(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')
}

function formatMonthShort(date) {
  return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase()
}

function menuFromRows(rows, weekStart) {
  const menu = Object.fromEntries(weekdays.map((day) => [day, { ...initialMenu[day] }]))
  const mealNames = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    merienda: 'Merienda',
    cena: 'Cena',
  }
  const dates = Array.from({ length: 7 }, (_, index) => formatDateKey(addDays(weekStart, index)))

  rows.forEach((row) => {
    const dayIndex = dates.indexOf(row.date)
    const mealName = mealNames[String(row.mealType).toLowerCase()]
    if (dayIndex < 0 || !mealName) return
    menu[weekdays[dayIndex]][mealName] = {
      id: row.id,
      name: row.name,
      ingredients: row.ingredients,
    }
  })

  return menu
}

function swapMenuSlots(menu, source, target) {
  const sourceDay = weekdays[source.dayIndex]
  const targetDay = weekdays[target.dayIndex]
  const sourceMeal = mealTimes[source.mealIndex]
  const targetMeal = mealTimes[target.mealIndex]
  const sourceValue = menu[sourceDay]?.[sourceMeal]
  const targetValue = menu[targetDay]?.[targetMeal]

  if (!sourceValue) return menu

  if (sourceDay === targetDay) {
    return {
      ...menu,
      [sourceDay]: {
        ...menu[sourceDay],
        [sourceMeal]: targetValue,
        [targetMeal]: sourceValue,
      },
    }
  }

  return {
    ...menu,
    [sourceDay]: { ...menu[sourceDay], [sourceMeal]: targetValue },
    [targetDay]: { ...menu[targetDay], [targetMeal]: sourceValue },
  }
}

function MealModal({ target, days, onClose, onSubmit, error, loading }) {
  const isEditing = Boolean(target.editing)

  return (
    <div onClick={(event) => event.target === event.currentTarget && !loading && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage">
              <CirclePlus size={18} />
            </span>
            <h2 className="font-display text-3xl">{isEditing ? 'Editar comida' : 'Agregar comida'}</h2>
            <p className="mt-1 text-sm text-ink/50 dark:text-cream/50">{isEditing ? 'Editá los datos de esta comida.' : 'Completa tu menú a tu manera.'}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="rounded-full p-2 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-cream/10" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block text-sm font-bold">
            Día
            <select name="day" defaultValue={target.day} disabled={loading} className="field mt-2">
              {days.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Momento
            <select name="meal" defaultValue={target.meal || 'Cena'} disabled={loading} className="field mt-2">
              <option>Desayuno</option>
              <option>Almuerzo</option>
              <option>Merienda</option>
              <option>Cena</option>
            </select>
          </label>
          <label className="block text-sm font-bold">
            Nombre de la receta
            <input autoFocus required name="name" defaultValue={target.recipe?.name || ''} disabled={loading} className="field mt-2" placeholder="Ej. Ensalada de pollo y quinoa" />
          </label>
          <label className="block text-sm font-bold">
            Ingredientes <span className="font-normal text-ink/40 dark:text-cream/40">(opcional, separados por comas)</span>
            <textarea name="ingredients" defaultValue={target.recipe?.ingredients?.join(', ') || ''} disabled={loading} className="field mt-2 min-h-24" placeholder="Ej. tomate, lechuga, pollo" />
          </label>
          {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Guardando cambios...' : isEditing ? 'Guardar cambios' : 'Guardar en el menú'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ClearListModal({ onClose, onConfirm }) {
  return (
    <div onClick={(event) => event.target === event.currentTarget && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="clear-list-title" className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <h2 id="clear-list-title" className="font-display text-2xl">¿Vaciar la lista?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">Se eliminarán todos los ingredientes y sus checks de esta semana.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} type="button" className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink">
            Cancelar
          </button>
          <button onClick={onConfirm} type="button" className="flex-1 rounded-full bg-coral px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
            Vaciar lista
          </button>
        </div>
      </div>
    </div>
  )
}

function AddShoppingItemsModal({ onClose, onSubmit, loading, error }) {
  const [rows, setRows] = useState([{ name: '', count: 1 }])

  const updateRow = (index, field, value) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row))
  }

  const addRow = () => setRows((current) => [...current, { name: '', count: 1 }])

  const removeRow = (index) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))

  return (
    <div onClick={(event) => event.target === event.currentTarget && !loading && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="add-shopping-items-title" className="w-full max-w-lg rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-shopping-items-title" className="font-display text-2xl">Agregar ingredientes</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">Sumá ingredientes extra a tu lista de compras.</p>
          </div>
          <button onClick={onClose} disabled={loading} type="button" className="rounded-full p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/50 dark:hover:bg-cream/10 dark:hover:text-cream" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_76px_36px] items-end gap-2">
                <label className="text-xs font-bold">
                  {index === 0 && <span>Ingrediente</span>}
                  <input name="ingredientName" value={row.name} onChange={(event) => updateRow(index, 'name', event.target.value)} disabled={loading} className="field mt-2" placeholder="Ej. tomate" />
                </label>
                <label className="text-xs font-bold">
                  {index === 0 && <span>Cantidad</span>}
                  <input name="ingredientCount" type="number" min="1" step="1" value={row.count} onChange={(event) => updateRow(index, 'count', event.target.value)} disabled={loading} className="field mt-2 text-center" />
                </label>
                {rows.length > 1 ? (
                  <button onClick={() => removeRow(index)} disabled={loading} type="button" className="mb-1 grid h-10 w-9 place-items-center rounded-full text-ink/45 transition hover:bg-coral/10 hover:text-coral disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/45" aria-label={`Quitar ingrediente ${index + 1}`}>
                    <X size={17} />
                  </button>
                ) : <span />}
              </div>
            ))}
          </div>
          <button onClick={addRow} disabled={loading} type="button" className="mt-4 flex items-center gap-1.5 text-sm font-bold text-moss transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-sage dark:hover:text-cream">
            <Plus size={16} /> Agregar otro ingrediente
          </button>
          {error && <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} disabled={loading} type="button" className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink">
              Cancelar
            </button>
            <button disabled={loading} type="submit" className="flex-1 rounded-full bg-moss px-4 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Agregando...' : 'Agregar a la lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteMealModal({ meal, onClose, onConfirm, loading }) {
  return (
    <div onClick={(event) => event.target === event.currentTarget && !loading && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-meal-title" className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <h2 id="delete-meal-title" className="font-display text-2xl">¿Eliminar comida?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">¿Estás seguro de que querés eliminar <strong className="text-ink dark:text-cream">{meal.recipe.name}</strong> del menú?</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={loading} type="button" className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} type="button" className="flex-1 rounded-full bg-coral px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Eliminando...' : 'Eliminar comida'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [menu, setMenu] = useState(initialMenu)
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')
  const [shoppingItems, setShoppingItems] = useState([])
  const [showClearListModal, setShowClearListModal] = useState(false)
  const [showAddShoppingModal, setShowAddShoppingModal] = useState(false)
  const [shoppingItemSaving, setShoppingItemSaving] = useState(false)
  const [shoppingModalError, setShoppingModalError] = useState('')
  const [mealTarget, setMealTarget] = useState(null)
  const [mealSaving, setMealSaving] = useState(false)
  const [mealToDelete, setMealToDelete] = useState(null)
  const [mealDeleting, setMealDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeDrag, setActiveDrag] = useState(null)
  const [dragOrigin, setDragOrigin] = useState(null)
  const [pendingCrossWeek, setPendingCrossWeek] = useState(null)
  const [mealMoveSaving, setMealMoveSaving] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sibo-theme') || 'light'
    } catch {
      return 'light'
    }
  })
  const checked = shoppingItems.filter((item) => item.checked).map((item) => item.name)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor))

  const persistCrossWeekMove = async ({ source, dropTarget }) => {
    if (!dragOrigin) return
    const sourceDay = weekdays[source.sourceDayIndex]
    const sourceMeal = mealTimes[source.sourceMealIndex]
    const sourceValue = dragOrigin.menu[sourceDay]?.[sourceMeal]
    if (!sourceValue) return

    const targetDay = weekdays[dropTarget.dayIndex]
    const targetMeal = mealTimes[dropTarget.mealIndex]
    const targetValue = menu[targetDay]?.[targetMeal]
    const savedMeals = await moveOrSwapMeals({
      sourceId: sourceValue.id,
      sourceDate: formatDateKey(addDays(dragOrigin.weekStart, source.sourceDayIndex)),
      sourceMealType: sourceMeal.toLowerCase(),
      targetId: targetValue?.id || null,
      targetDate: formatDateKey(addDays(weekStart, dropTarget.dayIndex)),
      targetMealType: targetMeal.toLowerCase(),
    })
    const savedSource = savedMeals.find((meal) => String(meal.id) === String(sourceValue.id))
    if (!savedSource) throw new Error('No pudimos confirmar el movimiento de la comida.')

    const nextTargetMenu = {
      ...menu,
      [targetDay]: { ...menu[targetDay], [targetMeal]: savedSource },
    }
    setMenu(nextTargetMenu)
  }

  useEffect(() => {
    if (!searchParams.get('addRecipe')) return
    let recipeToAdd = null
    try {
      recipeToAdd = JSON.parse(sessionStorage.getItem('sibo-recipe-to-add') || 'null')
      sessionStorage.removeItem('sibo-recipe-to-add')
    } catch {}
    if (!recipeToAdd) {
      router.replace('/', { scroll: false })
      return
    }
    setMealTarget({
      day: 'Lunes',
      meal: 'Cena',
      recipe: recipeToAdd,
    })
    router.replace('/', { scroll: false })
  }, [router, searchParams])

  useEffect(() => {
    let active = true
    if (authLoading) return undefined
    if (!user) {
      setMenuLoading(false)
      setMenuError('')
      setShoppingItems([])
      return undefined
    }

    setMenuLoading(true)
    if (!mealMoveSaving) setMenuError('')
    const weekId = formatDateKey(weekStart)
    Promise.all([
      getWeeklyMenu({
        startDate: weekId,
        endDate: formatDateKey(addDays(weekStart, 6)),
      }),
      getShoppingList({ weekId }),
    ])
      .then(async ([rows, savedList]) => {
        if (!active) return
        const nextMenu = menuFromRows(rows, weekStart)
        const persistedItems = savedList ? savedList.items : getShoppingItems(nextMenu)
        setMenu(nextMenu)
        setShoppingItems(persistedItems)
        if (!savedList) {
          await saveShoppingList({ weekId, items: persistedItems })
        }
      })
      .catch((error) => {
        if (active) setMenuError(error.message)
      })
      .finally(() => {
        if (active) setMenuLoading(false)
      })
    return () => {
      active = false
    }
  }, [authLoading, user, weekStart])

  useEffect(() => {
    if (!CROSS_WEEK_DRAG_ENABLED || menuLoading || !pendingCrossWeek?.dropTarget || !dragOrigin) return
    const { source, dropTarget } = pendingCrossWeek
    setPendingCrossWeek(null)
    completeCrossWeekMove({ source, dropTarget })
  }, [dragOrigin, menuLoading, pendingCrossWeek])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('sibo-theme', theme)
    } catch {}
  }, [theme])

  const persistMeal = async ({ day, meal, name, ingredients }) => {
    const dayIndex = weekdays.indexOf(day)
    const currentMeal = menu[day]?.[meal]
    const savedMeal = currentMeal?.id
      ? await updateMeal({
          id: currentMeal.id,
          date: formatDateKey(addDays(weekStart, dayIndex)),
          mealType: meal.toLowerCase(),
          recipeName: name,
          ingredients,
        })
      : await createMeal({
          date: formatDateKey(addDays(weekStart, dayIndex)),
          mealType: meal.toLowerCase(),
          recipeName: name,
          ingredients,
        })
    const nextMenu = {
      ...menu,
      [day]: { ...menu[day], [meal]: savedMeal },
    }
    setMenu(nextMenu)
    return nextMenu
  }

  const addIngredientsToShoppingList = async (ingredients) => {
    if (!ingredients.length) return
    const nextItems = mergeShoppingItems(shoppingItems, ingredients)
    setShoppingItems(nextItems)
    await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
  }

  const saveManualMeal = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const day = form.get('day')
    const meal = form.get('meal')
    const name = form.get('name')?.trim()
    const ingredients = form
      .get('ingredients')
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (!name) return
    const previousIngredients = getMealIngredients(menu[day]?.[meal])
    const newShoppingItems = getNewShoppingItems(ingredients || [], previousIngredients)
    setMenuError('')
    setMealSaving(true)
    try {
      await persistMeal({ day, meal, name, ingredients })
      await addIngredientsToShoppingList(newShoppingItems)
      setMealTarget(null)
    } catch (error) {
      setMenuError(error.message)
    } finally {
      setMealSaving(false)
    }
  }

  const removeIngredientsFromShoppingList = async (ingredients) => {
    if (!ingredients.length) return
    const nextItems = removeShoppingIngredients(shoppingItems, ingredients)
    if (JSON.stringify(nextItems) === JSON.stringify(shoppingItems)) return
    setShoppingItems(nextItems)
    await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
  }

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return
    const target = mealToDelete
    const dayIndex = weekdays.indexOf(target.day)
    setMealDeleting(true)
    setMenuError('')
    try {
      await deleteMeal({
        id: target.recipe.id,
        date: formatDateKey(addDays(weekStart, dayIndex)),
      })
      setMenu((current) => ({
        ...current,
        [target.day]: { ...current[target.day], [target.meal]: null },
      }))
      setMealToDelete(null)
      await removeIngredientsFromShoppingList(getMealIngredients(target.recipe))
    } catch (error) {
      setMenuError(error.message)
    } finally {
      setMealDeleting(false)
    }
  }

  const restoreDragOrigin = () => {
    if (!dragOrigin) return
    setWeekStart(dragOrigin.weekStart)
    setMenu(dragOrigin.menu)
    setPendingCrossWeek(null)
  }

  const completeCrossWeekMove = async ({ source, dropTarget }) => {
    setMealMoveSaving(true)
    setMenuError('')
    try {
      await persistCrossWeekMove({ source, dropTarget })
    } catch (error) {
      restoreDragOrigin()
      setMenuError(error.message)
    } finally {
      setDragOrigin(null)
      setPendingCrossWeek(null)
      setMealMoveSaving(false)
    }
  }

  const handleDragStart = ({ active }) => {
    if (mealMoveSaving) return
    setActiveDrag(active.data.current || null)
    setDragOrigin({ weekStart: new Date(weekStart), menu })
    setPendingCrossWeek(null)
  }

  const handleDragOver = ({ active, over }) => {
    if (!CROSS_WEEK_DRAG_ENABLED) return
    const source = active.data.current
    const target = over?.data.current
    if (source?.kind !== 'meal' || target?.kind !== 'week-arrow' || !dragOrigin) return

    const weekOffset = Number(target.weekOffset)
    if (![1, -1].includes(weekOffset)) return
    const targetWeekStart = addDays(dragOrigin.weekStart, weekOffset * 7)
    const targetWeekKey = formatDateKey(targetWeekStart)
    const originWeekKey = formatDateKey(dragOrigin.weekStart)
    if (targetWeekKey === originWeekKey) {
      setWeekStart(dragOrigin.weekStart)
      setMenu(dragOrigin.menu)
      setPendingCrossWeek(null)
      return
    }
    if (formatDateKey(weekStart) === targetWeekKey) return
    setPendingCrossWeek({ targetWeekStart, source })
    setMenu(initialMenu)
    setWeekStart(targetWeekStart)
  }

  const handleDragEnd = async ({ active, over }) => {
    const source = active.data.current
    const target = over?.data.current

    if (pendingCrossWeek) {
      if (target?.kind === 'slot') {
        if (menuLoading) {
          setMealMoveSaving(true)
          setMenuError('')
          setPendingCrossWeek((current) =>
            current
              ? {
                  ...current,
                  dropTarget: {
                    dayIndex: target.dayIndex,
                    mealIndex: target.mealIndex,
                  },
                }
              : current,
          )
          setActiveDrag(null)
          return
        }
        setPendingCrossWeek(null)
        await completeCrossWeekMove({
          source,
          dropTarget: { dayIndex: target.dayIndex, mealIndex: target.mealIndex },
        })
      } else restoreDragOrigin()
      setPendingCrossWeek(null)
      setActiveDrag(null)
      return
    }

    setActiveDrag(null)
    setDragOrigin(null)
    if (source?.kind !== 'meal' || target?.kind !== 'slot') return
    if (source.sourceDayIndex === target.dayIndex && source.sourceMealIndex === target.mealIndex) return

    const sourceDay = weekdays[source.sourceDayIndex]
    const sourceMeal = mealTimes[source.sourceMealIndex]
    const targetDay = weekdays[target.dayIndex]
    const targetMeal = mealTimes[target.mealIndex]
    const sourceValue = menu[sourceDay]?.[sourceMeal]
    const targetValue = menu[targetDay]?.[targetMeal]
    if (!sourceValue) return

    setMealMoveSaving(true)
    setMenuError('')
    try {
      await moveOrSwapMeals({
        sourceId: sourceValue.id,
        sourceDate: formatDateKey(addDays(weekStart, source.sourceDayIndex)),
        sourceMealType: sourceMeal.toLowerCase(),
        targetId: targetValue?.id || null,
        targetDate: formatDateKey(addDays(weekStart, target.dayIndex)),
        targetMealType: targetMeal.toLowerCase(),
      })
      const nextMenu = swapMenuSlots(menu, {
        dayIndex: source.sourceDayIndex,
        mealIndex: source.sourceMealIndex,
      }, {
        dayIndex: target.dayIndex,
        mealIndex: target.mealIndex,
      })
      setMenu(nextMenu)
    } catch (error) {
      setMenuError(error.message)
    } finally {
      setMealMoveSaving(false)
    }
  }

  const handleDragCancel = () => {
    if (pendingCrossWeek) restoreDragOrigin()
    setPendingCrossWeek(null)
    setDragOrigin(null)
    setActiveDrag(null)
  }

  const copyShoppingList = async () => {
    if (!shoppingItems.length) return
    const text = `Lista de compras · sibo.decis\n${shoppingItems.map((item) => `- ${item.name}${item.count > 1 ? ` x${item.count}` : ''}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const fallback = document.createElement('textarea')
      fallback.value = text
      document.body.appendChild(fallback)
      fallback.select()
      document.execCommand('copy')
      document.body.removeChild(fallback)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const toggleShoppingItem = async (name) => {
    const nextItems = shoppingItems.map((item) => item.name === name ? { ...item, checked: !item.checked } : item)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({
        weekId: formatDateKey(weekStart),
        items: nextItems,
      })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  const changeShoppingItemQuantity = async (name, delta) => {
    const currentItem = shoppingItems.find((item) => item.name === name)
    if (!currentItem) return
    const nextCount = (Number(currentItem.count) || 1) + delta
    const nextItems = nextCount > 0
      ? shoppingItems.map((item) => item.name === name ? { ...item, count: nextCount } : item)
      : shoppingItems.filter((item) => item.name !== name)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  const openAddShoppingModal = () => {
    setShoppingModalError('')
    setShowAddShoppingModal(true)
  }

  const addManualShoppingItems = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const names = form.getAll('ingredientName')
    const counts = form.getAll('ingredientCount')
    const additions = names
      .map((value, index) => ({
        name: String(value || '').trim(),
        count: Math.max(1, Number(counts[index]) || 1),
      }))
      .filter((item) => item.name)

    if (!additions.length) {
      setShoppingModalError('Ingresá al menos un ingrediente.')
      return
    }

    setShoppingItemSaving(true)
    setShoppingModalError('')
    const previousItems = shoppingItems
    const nextItems = mergeShoppingItems(shoppingItems, additions)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
      setShowAddShoppingModal(false)
    } catch (error) {
      setShoppingItems(previousItems)
      setShoppingModalError(error.message)
    } finally {
      setShoppingItemSaving(false)
    }
  }

  const clearShoppingList = async () => {
    if (!shoppingItems.length) return
    setShowClearListModal(true)
  }

  const confirmClearShoppingList = async () => {
    setShowClearListModal(false)
    setShoppingItems([])
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: [] })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
        <main id="inicio" className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
          <HeroSection weekStart={weekStart} formatWeekRange={formatWeekRange} onPreviousWeek={() => setWeekStart((current) => addDays(current, -7))} onNextWeek={() => setWeekStart((current) => addDays(current, 7))} disabled={mealMoveSaving} crossWeekDragEnabled={CROSS_WEEK_DRAG_ENABLED} />
          {menuLoading && <p className="mb-4 text-sm text-ink/50 dark:text-cream/50">Cargando tu menú...</p>}
          {mealMoveSaving && <p className="mb-4 text-sm text-ink/50 dark:text-cream/50">Guardando el movimiento...</p>}
          {menuError && <p className="mb-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">No pudimos cargar el menú guardado: {menuError}</p>}
          <div className="grid gap-6 xl:grid-cols-[1fr_310px]">
            <WeeklyMenu menu={menu} weekStart={weekStart} weekdays={weekdays} onAddMeal={setMealTarget} onDeleteMeal={setMealToDelete} formatDayName={formatDayName} formatMonthShort={formatMonthShort} activeDrag={activeDrag} dragDisabled={mealMoveSaving || mealDeleting} />
              <ShoppingList shoppingItems={shoppingItems} checked={checked} toggleItem={toggleShoppingItem} changeQuantity={changeShoppingItemQuantity} clearList={clearShoppingList} onCopy={copyShoppingList} copied={copied} onAddItems={openAddShoppingModal} />
          </div>
         </main>
          <Footer />
          {mealTarget && <MealModal target={mealTarget} days={weekdays} onClose={() => setMealTarget(null)} onSubmit={saveManualMeal} error={menuError} loading={mealSaving} />}
          {showAddShoppingModal && <AddShoppingItemsModal onClose={() => setShowAddShoppingModal(false)} onSubmit={addManualShoppingItems} loading={shoppingItemSaving} error={shoppingModalError} />}
          {showClearListModal && <ClearListModal onClose={() => setShowClearListModal(false)} onConfirm={confirmClearShoppingList} />}
         {mealToDelete && <DeleteMealModal meal={mealToDelete} onClose={() => setMealToDelete(null)} onConfirm={confirmDeleteMeal} loading={mealDeleting} />}
       </div>
      <DragOverlay>{activeDrag ? <div className="rounded-xl bg-moss px-4 py-3 text-sm font-semibold text-white shadow-xl">{activeDrag.name}</div> : null}</DragOverlay>
    </DndContext>
  )
}
