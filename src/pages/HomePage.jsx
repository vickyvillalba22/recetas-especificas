import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useLocation, useNavigate } from 'react-router-dom'
import { DraggableWeeklyCalendar } from '../components/home/DraggableWeeklyCalendar'
import { Footer } from '../components/home/Footer'
import { HeroSection } from '../components/home/HeroSection'
import { ShoppingList } from '../components/home/ShoppingList'
import { WeeklyMenu } from '../components/home/WeeklyMenu'
import { Check, CirclePlus, Leaf, X } from '../components/ui/icons'
import { createMeal, getWeeklyMenu, updateMeal } from '../services/weeklyMenuService'

const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const mealTimes = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena']
const initialMenu = Object.fromEntries(weekdays.map((day) => [day, { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null }]))
const motivationalPhrases = [
  '¡Un día a la vez! Cada elección consciente es un paso más hacia sentirte excelente.',
  'Cuidar tu panza también es una forma de quererte. ¡Hoy va a ser un gran día!',
  'La paciencia es la mejor receta del menú. ¡Vas muy bien!',
  'Tu cuerpo se está reacomodando. Dale tiempo, amor y buena comida.',
]

function getMealIngredients(meal) {
  return Array.isArray(meal?.ingredients) ? meal.ingredients : []
}

function getShoppingItems(menu) {
  const grouped = new Map()
  Object.values(menu).forEach((day) => Object.values(day).forEach((meal) => getMealIngredients(meal).forEach((ingredient) => {
    const name = ingredient.trim()
    if (!name) return
    const key = name.toLocaleLowerCase()
    const current = grouped.get(key)
    grouped.set(key, current ? { ...current, count: current.count + 1 } : { name, count: 1 })
  })))
  return [...grouped.values()]
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
  const mealNames = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', merienda: 'Merienda', cena: 'Cena' }
  const dates = Array.from({ length: 7 }, (_, index) => formatDateKey(addDays(weekStart, index)))

  rows.forEach((row) => {
    const dayIndex = dates.indexOf(row.date)
    const mealName = mealNames[String(row.mealType).toLowerCase()]
    if (dayIndex < 0 || !mealName) return
    menu[weekdays[dayIndex]][mealName] = { id: row.id, name: row.name, ingredients: row.ingredients }
  })

  return menu
}

function MealModal({ target, days, onClose, onSubmit, error }) {
  return <div onClick={(event) => event.target === event.currentTarget && onClose()} className="fixed inset-0 z-40 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"><div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"><div className="mb-6 flex items-start justify-between"><div><span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage"><CirclePlus size={18} /></span><h2 className="font-display text-3xl">Agregar comida</h2><p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Completa tu menú a tu manera.</p></div><button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-cream/10" aria-label="Cerrar"><X size={20} /></button></div><form onSubmit={onSubmit} className="space-y-5"><label className="block text-sm font-bold">Día<select name="day" defaultValue={target.day} className="field mt-2">{days.map((day) => <option key={day}>{day}</option>)}</select></label><label className="block text-sm font-bold">Momento<select name="meal" defaultValue={target.meal || 'Cena'} className="field mt-2"><option>Desayuno</option><option>Almuerzo</option><option>Merienda</option><option>Cena</option></select></label><label className="block text-sm font-bold">Nombre de la receta<input autoFocus required name="name" defaultValue={target.recipe?.name || ''} className="field mt-2" placeholder="Ej. Ensalada de pollo y quinoa" /></label><label className="block text-sm font-bold">Ingredientes <span className="font-normal text-ink/40 dark:text-cream/40">(separados por comas)</span><textarea required name="ingredients" defaultValue={target.recipe?.ingredients?.join(', ') || ''} className="field mt-2 min-h-24" placeholder="Ej. tomate, lechuga, pollo" /></label>{error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}<button type="submit" className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white">Guardar en el menú</button></form></div></div>
}

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(initialMenu)
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')
  const [checked, setChecked] = useState([])
  const [mealTarget, setMealTarget] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeDrag, setActiveDrag] = useState(null)
  const [dragOrigin, setDragOrigin] = useState(null)
  const [pendingCrossWeek, setPendingCrossWeek] = useState(null)
  const [showMotivation, setShowMotivation] = useState(() => {
    try {
      if (sessionStorage.getItem('sibo-motivation-shown')) return false
      sessionStorage.setItem('sibo-motivation-shown', '1')
    } catch {}
    return true
  })
  const [motivationalPhrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)])
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('sibo-theme') || 'light' } catch { return 'light' }
  })
  const shoppingItems = getShoppingItems(menu)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor))

  useEffect(() => {
    if (!location.state?.recipeToAdd) return
    setMealTarget({ day: 'Lunes', meal: 'Cena', recipe: location.state.recipeToAdd })
    navigate('/', { replace: true, state: null })
  }, [location.state, navigate])

  useEffect(() => {
    let active = true
    setMenuLoading(true)
    setMenuError('')
    getWeeklyMenu({ startDate: formatDateKey(weekStart), endDate: formatDateKey(addDays(weekStart, 6)) })
      .then((rows) => { if (active) setMenu(menuFromRows(rows, weekStart)) })
      .catch((error) => { if (active) setMenuError(error.message) })
      .finally(() => { if (active) setMenuLoading(false) })
    return () => { active = false }
  }, [weekStart])

  useEffect(() => {
    if (menuLoading || !pendingCrossWeek?.dropTarget || !dragOrigin) return
    const { source, dropTarget } = pendingCrossWeek
    const sourceDay = weekdays[source.sourceDayIndex]
    const sourceMeal = mealTimes[source.sourceMealIndex]
    const sourceValue = dragOrigin.menu[sourceDay]?.[sourceMeal]
    if (!sourceValue) return
    const targetDay = weekdays[dropTarget.dayIndex]
    const targetMeal = mealTimes[dropTarget.mealIndex]
    setMenu((current) => ({ ...current, [targetDay]: { ...current[targetDay], [targetMeal]: sourceValue } }))
    setPendingCrossWeek(null)
    setDragOrigin(null)
  }, [dragOrigin, menuLoading, pendingCrossWeek])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('sibo-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    if (!showMotivation) return undefined
    const timer = window.setTimeout(() => setShowMotivation(false), 4500)
    return () => window.clearTimeout(timer)
  }, [showMotivation])

  const persistMeal = async ({ day, meal, name, ingredients }) => {
    const dayIndex = weekdays.indexOf(day)
    const currentMeal = menu[day]?.[meal]
    const savedMeal = currentMeal?.id
      ? await updateMeal({ id: currentMeal.id, date: formatDateKey(addDays(weekStart, dayIndex)), mealType: meal.toLowerCase(), recipeName: name, ingredients })
      : await createMeal({ date: formatDateKey(addDays(weekStart, dayIndex)), mealType: meal.toLowerCase(), recipeName: name, ingredients })
    setMenu((current) => ({ ...current, [day]: { ...current[day], [meal]: savedMeal } }))
  }

  const saveManualMeal = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const day = form.get('day')
    const meal = form.get('meal')
    const name = form.get('name')?.trim()
    const ingredients = form.get('ingredients')?.split(',').map((item) => item.trim()).filter(Boolean)
    if (!name) return
    setMenuError('')
    try {
      await persistMeal({ day, meal, name, ingredients })
      setMealTarget(null)
    } catch (error) {
      setMenuError(error.message)
    }
  }

  const restoreDragOrigin = () => {
    if (!dragOrigin) return
    setWeekStart(dragOrigin.weekStart)
    setMenu(dragOrigin.menu)
    setPendingCrossWeek(null)
  }

  const handleDragStart = ({ active }) => {
    setActiveDrag(active.data.current || null)
    setDragOrigin({ weekStart: new Date(weekStart), menu })
    setPendingCrossWeek(null)
  }

  const handleDragOver = ({ active, over }) => {
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

  const handleDragEnd = ({ active, over }) => {
    const source = active.data.current
    const target = over?.data.current

    if (pendingCrossWeek) {
      if (target?.kind === 'slot') {
        if (menuLoading) {
          setPendingCrossWeek((current) => current ? { ...current, dropTarget: { dayIndex: target.dayIndex, mealIndex: target.mealIndex } } : current)
          setActiveDrag(null)
          return
        }
        const sourceMeal = mealTimes[source.sourceMealIndex]
        const sourceDay = weekdays[source.sourceDayIndex]
        const sourceValue = dragOrigin?.menu[sourceDay]?.[sourceMeal]
        const targetDay = weekdays[target.dayIndex]
        const targetMeal = mealTimes[target.mealIndex]
        if (sourceValue) setMenu((current) => ({ ...current, [targetDay]: { ...current[targetDay], [targetMeal]: sourceValue } }))
      } else restoreDragOrigin()
      setPendingCrossWeek(null)
      setDragOrigin(null)
      setActiveDrag(null)
      return
    }

    setActiveDrag(null)
    setDragOrigin(null)
    if (source?.kind !== 'meal' || target?.kind !== 'slot') return
    if (source.sourceDayIndex === target.dayIndex && source.sourceMealIndex === target.mealIndex) return

    setMenu((current) => {
      const sourceDay = weekdays[source.sourceDayIndex]
      const targetDay = weekdays[target.dayIndex]
      const sourceMeal = mealTimes[source.sourceMealIndex]
      const targetMeal = mealTimes[target.mealIndex]
      const sourceValue = current[sourceDay]?.[sourceMeal]
      if (!sourceValue) return current
      if (sourceDay === targetDay) return { ...current, [sourceDay]: { ...current[sourceDay], [sourceMeal]: current[targetDay][targetMeal], [targetMeal]: sourceValue } }
      return { ...current, [sourceDay]: { ...current[sourceDay], [sourceMeal]: current[targetDay][targetMeal] }, [targetDay]: { ...current[targetDay], [targetMeal]: sourceValue } }
    })
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

  return <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}><div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">{showMotivation && <div className="fixed inset-0 z-50 grid place-items-center bg-cream px-6 text-center text-ink dark:bg-ink-dark dark:text-cream"><div className="flex w-full max-w-2xl flex-col items-center"><span className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-moss text-cream shadow-soft"><Leaf size={30} /></span><p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-coral">sibo<span className="text-ink/30 dark:text-cream/30">.</span>decis</p><blockquote className="font-display text-3xl leading-tight sm:text-5xl">“{motivationalPhrase}”</blockquote></div></div>}<main id="inicio" className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16"><HeroSection weekStart={weekStart} formatWeekRange={formatWeekRange} onPreviousWeek={() => setWeekStart((current) => addDays(current, -7))} onNextWeek={() => setWeekStart((current) => addDays(current, 7))} />{menuLoading && <p className="mb-4 text-sm text-ink/50 dark:text-cream/50">Cargando tu menú...</p>}{menuError && <p className="mb-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">No pudimos cargar el menú guardado: {menuError}</p>}<DraggableWeeklyCalendar menu={menu} weekStart={weekStart} days={weekdays} onAddMeal={setMealTarget} activeDrag={activeDrag} /><div className="grid gap-6 xl:grid-cols-[1fr_310px]"><WeeklyMenu menu={menu} weekStart={weekStart} weekdays={weekdays} onAddMeal={setMealTarget} formatDayName={formatDayName} formatMonthShort={formatMonthShort} activeDrag={activeDrag} /><ShoppingList shoppingItems={shoppingItems} checked={checked} toggleItem={(name) => setChecked((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])} onCopy={copyShoppingList} copied={copied} /></div></main><Footer />{mealTarget && <MealModal target={mealTarget} days={weekdays} onClose={() => setMealTarget(null)} onSubmit={saveManualMeal} error={menuError} />}</div><DragOverlay>{activeDrag ? <div className="rounded-xl bg-moss px-4 py-3 text-sm font-semibold text-white shadow-xl">{activeDrag.name}</div> : null}</DragOverlay></DndContext>
}
