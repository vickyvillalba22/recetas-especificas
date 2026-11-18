'use client'

import { useEffect, useRef, useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useAuth } from '../context/AuthContext'
import { Footer } from '../components/home/Footer'
import { HeroSection } from '../components/home/HeroSection'
import { ShoppingList } from '../components/home/ShoppingList'
import { WeeklyMenu } from '../components/home/WeeklyMenu'
import { AddShoppingItemsModal } from '../components/home/modals/AddShoppingItemsModal'
import { ClearListModal } from '../components/home/modals/ClearListModal'
import { DeleteMealModal } from '../components/home/modals/DeleteMealModal'
import { MealModal } from '../components/home/modals/MealModal'
import { CROSS_WEEK_DRAG_ENABLED, mealTimes } from '../components/home/weeklyMenuConstants'
import { getShoppingList, saveShoppingList } from '../services/home/shoppingListService'
import { createMeal, deleteMeal, getWeeklyMenu, moveOrSwapMeals, updateMeal } from '../services/home/weeklyMenuService'
import { useShoppingList } from '../hooks/useShoppingList'
import {
  getMealIngredients,
  getShoppingItems,
} from '../utils/shoppingListUtils'
import {
  addDays,
  formatDateKey,
  formatDayName,
  formatMonthShort,
  formatWeekRange,
  getDayIndexInWeek,
  getMonday,
  initialMenu,
  menuFromRows,
  swapMenuSlots,
  weekdays,
} from '../utils/weeklyMenuUtils'

export function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [menu, setMenu] = useState(initialMenu)
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')
  const [mealTarget, setMealTarget] = useState(null)
  const [mealSaving, setMealSaving] = useState(false)
  const [mealToDelete, setMealToDelete] = useState(null)
  const [mealDeleting, setMealDeleting] = useState(false)
  const [activeDrag, setActiveDrag] = useState(null)
  const [dragOrigin, setDragOrigin] = useState(null)
  const [pendingCrossWeek, setPendingCrossWeek] = useState(null)
  const [mealMoveSaving, setMealMoveSaving] = useState(false)
  const weeklyMenuRef = useRef(null)
  const [weeklyMenuHeight, setWeeklyMenuHeight] = useState(null)
  const {
    shoppingItems,
    checked,
    showClearListModal,
    showAddShoppingModal,
    shoppingItemSaving,
    shoppingModalError,
    copied,
    loadShoppingItems,
    replaceMealIngredients,
    removeIngredientsFromShoppingList,
    toggleShoppingItem,
    changeShoppingItemQuantity,
    changeShoppingItemUnit,
    copyShoppingList,
    openAddShoppingModal,
    addManualShoppingItems,
    clearShoppingList,
    confirmClearShoppingList,
    closeAddShoppingModal,
    closeClearListModal,
  } = useShoppingList({ weekStart, setMenuError })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor))

  useEffect(() => {
    const element = weeklyMenuRef.current
    if (!element) return undefined

    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height)
      setWeeklyMenuHeight(nextHeight || null)
    }

    updateHeight()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

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

  const openMealModal = (target) => {
    const targetDayIndex = weekdays.indexOf(target.day)
    const date = target.date || (targetDayIndex >= 0
      ? formatDateKey(addDays(weekStart, targetDayIndex))
      : formatDateKey(new Date()))

    setMealTarget({ ...target, date })
  }

  useEffect(() => {
    let active = true
    if (authLoading) return undefined
    if (!user) {
      setMenuLoading(false)
      setMenuError('')
      loadShoppingItems([])
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
        loadShoppingItems(persistedItems)
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

  const persistMeal = async ({ day, meal, date, name, ingredients }) => {
    const currentMeal = mealTarget?.editing ? mealTarget.recipe : null
    const savedMeal = currentMeal?.id
      ? await updateMeal({
          id: currentMeal.id,
          date,
          mealType: meal.toLowerCase(),
          recipeName: name,
          ingredients,
        })
      : await createMeal({
          date,
          mealType: meal.toLowerCase(),
          recipeName: name,
          ingredients,
        })
    const nextMenu = { ...menu }
    const movedFromOriginalSlot = mealTarget?.editing
      && (mealTarget.day !== day || mealTarget.meal !== meal)
    if (movedFromOriginalSlot) {
      nextMenu[mealTarget.day] = { ...nextMenu[mealTarget.day], [mealTarget.meal]: null }
    }
    nextMenu[day] = { ...nextMenu[day], [meal]: savedMeal }
    setMenu(nextMenu)
    return nextMenu
  }

  const saveManualMeal = async (event) => {
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
    const dayIndex = getDayIndexInWeek(date, weekStart)
    const day = weekdays[dayIndex]
    if (!name || dayIndex < 0) return
    if (!mealTarget?.editing && menu[day]?.[meal]?.id) {
      setMenuError('Ese día y momento ya tiene una comida. Elegí otra fecha o momento.')
      return
    }
    const previousIngredients = getMealIngredients(mealTarget?.editing ? mealTarget.recipe : menu[day]?.[meal])
    setMenuError('')
    setMealSaving(true)
    try {
      await persistMeal({ day, meal, date, name, ingredients })
      await replaceMealIngredients(previousIngredients, ingredients || [])
      setMealTarget(null)
    } catch (error) {
      setMenuError(error.message)
    } finally {
      setMealSaving(false)
    }
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
      }, mealTimes)
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

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
        <main id="inicio" className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
          <HeroSection weekStart={weekStart} formatWeekRange={formatWeekRange} onPreviousWeek={() => setWeekStart((current) => addDays(current, -7))} onNextWeek={() => setWeekStart((current) => addDays(current, 7))} disabled={mealMoveSaving} crossWeekDragEnabled={CROSS_WEEK_DRAG_ENABLED} />
          {menuLoading && <p className="mb-4 text-sm text-ink/50 dark:text-cream/50">Cargando tu menú...</p>}
          {mealMoveSaving && <p className="mb-4 text-sm text-ink/50 dark:text-cream/50">Guardando el movimiento...</p>}
          {menuError && <p className="mb-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">No pudimos cargar el menú guardado: {menuError}</p>}
          <div className="grid items-stretch gap-6 xl:grid-cols-[1fr_310px]">
             <div ref={weeklyMenuRef} className="min-w-0">
               <WeeklyMenu menu={menu} weekStart={weekStart} weekdays={weekdays} onAddMeal={openMealModal} onDeleteMeal={setMealToDelete} formatDayName={formatDayName} formatMonthShort={formatMonthShort} activeDrag={activeDrag} dragDisabled={mealMoveSaving || mealDeleting} />
             </div>
             <ShoppingList height={weeklyMenuHeight} shoppingItems={shoppingItems} checked={checked} toggleItem={toggleShoppingItem} changeQuantity={changeShoppingItemQuantity} changeUnit={changeShoppingItemUnit} clearList={clearShoppingList} onCopy={copyShoppingList} copied={copied} onAddItems={openAddShoppingModal} />
          </div>
         </main>
          <Footer />
          {mealTarget && <MealModal target={mealTarget} minDate={formatDateKey(weekStart)} maxDate={formatDateKey(addDays(weekStart, 6))} onClose={() => setMealTarget(null)} onSubmit={saveManualMeal} error={menuError} loading={mealSaving} />}
           {showAddShoppingModal && <AddShoppingItemsModal onClose={closeAddShoppingModal} onSubmit={addManualShoppingItems} loading={shoppingItemSaving} error={shoppingModalError} />}
           {showClearListModal && <ClearListModal onClose={closeClearListModal} onConfirm={confirmClearShoppingList} />}
         {mealToDelete && <DeleteMealModal meal={mealToDelete} onClose={() => setMealToDelete(null)} onConfirm={confirmDeleteMeal} loading={mealDeleting} />}
       </div>
      <DragOverlay>{activeDrag ? <div className="rounded-xl bg-moss px-4 py-3 text-sm font-semibold text-white shadow-xl">{activeDrag.name}</div> : null}</DragOverlay>
    </DndContext>
  )
}
