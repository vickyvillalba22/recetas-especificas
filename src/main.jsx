import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Icon } from '@iconify/react'
import './styles.css'

function HugeIcon({ icon, size = 24, strokeWidth: _strokeWidth, ...props }) {
  return <Icon icon={`hugeicons:${icon}`} width={size} height={size} {...props} />
}

const BookHeart = (props) => <HugeIcon icon="book-02" {...props} />
const Check = (props) => <HugeIcon icon="check" {...props} />
const CirclePlus = (props) => <HugeIcon icon="add-circle" {...props} />
const Clock3 = (props) => <HugeIcon icon="clock-01" {...props} />
const Copy = (props) => <HugeIcon icon="copy-01" {...props} />
const Leaf = (props) => <HugeIcon icon="organic-food" {...props} />
const ListChecks = (props) => <HugeIcon icon="list-checks" {...props} />
const Menu = (props) => <HugeIcon icon="menu-01" {...props} />
const Moon = (props) => <HugeIcon icon="moon-01" {...props} />
const Sparkles = (props) => <HugeIcon icon="sparkles" {...props} />
const Sun = (props) => <HugeIcon icon="sun-01" {...props} />
const X = (props) => <HugeIcon icon="cancel-01" {...props} />

const initialMenu = {
  Lunes: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
  Martes: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
  Miércoles: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
  Jueves: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
  Viernes: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
  Sábado: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
  Domingo: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null },
}

const weekdays = Object.keys(initialMenu)

const motivationalPhrases = [
  '¡Un día a la vez! Cada elección consciente es un paso más hacia sentirte excelente.',
  'Cuidar tu panza también es una forma de quererte. ¡Hoy va a ser un gran día!',
  'La paciencia es la mejor receta del menú. ¡Vas muy bien!',
  'Tu cuerpo se está reacomodando. Dale tiempo, amor y buena comida.',
  'Comer bien no es una restricción, es el camino para volver a disfrutar sin molestias.',
  'Hoy elegimos sentirnos bien. ¡A armar ese menú!',
  'Tu intestino te va a agradecer cada ingrediente pensado con cariño.',
  'Cada fase tiene su fin; pronto vas a estar disfrutando de todos tus platos favoritos.',
  'Sanar lleva su tiempo, pero cada día suma. ¡Fuerza!',
  'La comida real es tu mejor medicina. ¡A nutrirse bien hoy!',
  'Hoy no hay microbioma rebelde que nos gane la batalla. ¡A conquistar el día!',
  'Tranqui, hoy las bacterias se portan bien y comemos rico.',
  'Menos fermentación, más motivación. ¡Vamos que se puede!',
  'Un salud por una pancita deshinchada y feliz. 🥂',
  '¡Hoy la casa invita buena digestión y cero hinchazón!',
  'Al SIBO le ganamos con estrategia, organización y mucho sabor.',
  'Recordatorio del día: Sos mucho más fuerte que cualquier restricción alimentaria.',
  'Chau inflamación, hola energía. ¡A meterle a la semana!',
  'El equipo de cocina (y el amor de tu vida) están de tu lado. ❤️',
  'Misión de hoy: Comer rico, sentirse liviano y disfrutar el día.',
]

function getMealName(meal) {
  return typeof meal === 'string' ? meal : meal?.name || ''
}

function getMealIngredients(meal) {
  return Array.isArray(meal?.ingredients) ? meal.ingredients : []
}

function getShoppingItems(menu) {
  const grouped = new Map()
  Object.values(menu).forEach((day) => Object.values(day).forEach((meal) => {
    getMealIngredients(meal).forEach((ingredient) => {
      const name = ingredient.trim()
      if (!name) return
      const key = name.toLocaleLowerCase()
      const current = grouped.get(key)
      grouped.set(key, current ? { ...current, count: current.count + 1 } : { name, count: 1 })
    })
  }))
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

function formatWeekRange(start) {
  const end = addDays(start, 6)
  const startMonth = start.toLocaleDateString('es-ES', { month: 'long' })
  const endMonth = end.toLocaleDateString('es-ES', { month: 'long' })
  const year = end.getFullYear() !== new Date().getFullYear() ? ` ${end.getFullYear()}` : ''
  return startMonth === endMonth ? `${start.getDate()} — ${end.getDate()} de ${endMonth}${year}` : `${start.getDate()} de ${startMonth} — ${end.getDate()} de ${endMonth}${year}`
}

function formatDayName(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')
}

function formatMonthShort(date) {
  return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase()
}

function formatJournalDate(date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function WeeklyCalendar({ menu, weekStart, days, onAddMeal }) {
  const [activeDay, setActiveDay] = useState('Lunes')
  const activeMeals = menu[activeDay] || {}
  const activeDate = addDays(weekStart, days.indexOf(activeDay))

  return <section id="menu" className="weekly-calendar mb-6 rounded-3xl border border-ink/10 bg-white p-4 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-6">
    <div className="mb-6 flex items-center justify-between gap-4">
      <div><h2 className="font-display text-2xl">Menú semanal</h2><p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Elige un día para ver sus comidas.</p></div>
      <button onClick={() => onAddMeal({ day: activeDay })} className="flex shrink-0 items-center gap-2 rounded-full bg-sage px-4 py-2.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage"><CirclePlus size={15} /> <span className="hidden sm:inline">Agregar comida</span><span className="sm:hidden">Agregar</span></button>
    </div>
    <div role="tablist" aria-label="Días de la semana" className="-mx-1 grid grid-cols-7 gap-2 px-1 pb-2">
      {days.map((day, index) => {
        const date = addDays(weekStart, index)
        const isActive = day === activeDay
        return <button key={day} role="tab" aria-selected={isActive} aria-controls={`meals-${day}`} onClick={() => setActiveDay(day)} className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-full border px-1 py-2 transition ${isActive ? 'border-moss bg-moss text-white shadow-lg shadow-moss/20' : 'border-ink/10 bg-cream text-ink/60 hover:border-moss/40 hover:text-moss dark:border-cream/10 dark:bg-ink dark:text-cream/60 dark:hover:border-moss/40 dark:hover:text-sage'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">{day.slice(0, 3)}</span>
          <span className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-semibold leading-none ${isActive ? 'bg-sun/95 text-moss' : 'bg-white/80 text-ink dark:bg-ink-soft dark:text-cream'}`}>{date.getDate()}</span>
        </button>
      })}
    </div>
    <div id={`meals-${activeDay}`} role="tabpanel" className="mt-6 border-t border-ink/10 pt-5 dark:border-cream/10">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-2xl text-moss dark:text-sage">{activeDay}</h3><span className="text-xs font-bold uppercase tracking-wider text-ink/35 dark:text-cream/35">{activeDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(activeMeals).map(([meal, value]) => {
          const mealName = getMealName(value)
          return <button onClick={() => onAddMeal({ day: activeDay, meal })} key={meal} className={`meal-card group text-left ${mealName ? 'meal-card--filled' : ''}`}><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{meal}</span><span className={`block text-sm font-semibold leading-snug ${mealName ? 'group-hover:text-coral' : 'text-moss dark:text-sage'}`}>{mealName || '+ Agregar comida'}</span>{mealName && <span className="mt-1.5 flex items-center gap-1 text-[10px] text-ink/40 dark:text-cream/40"><Clock3 size={11} /> Ver comida</span>}</button>
        })}
      </div>
    </div>
  </section>
}

function MotivationalSplash({ phrase }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-cream px-6 text-center text-ink dark:bg-ink-dark dark:text-cream">
    <div className="flex max-w-xl flex-col items-center">
      <span className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-moss text-cream shadow-lg shadow-moss/20"><Leaf size={30} strokeWidth={2.2} /></span>
       <p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-coral">sibo<span className="text-ink/30 dark:text-cream/30">.</span>decis</p>
      <blockquote className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">“{phrase}”</blockquote>
      <div className="mt-9 flex items-center gap-2" aria-label="Cargando tu semana"><span className="h-2 w-2 rounded-full bg-coral" /><span className="h-2 w-2 rounded-full bg-sun" /><span className="h-2 w-2 rounded-full bg-moss" /></div>
    </div>
  </div>
}

function App() {
  const [menu, setMenu] = useState(initialMenu)
  const shoppingItems = getShoppingItems(menu)
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [checked, setChecked] = useState([])
  const [showGenerator, setShowGenerator] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mealTarget, setMealTarget] = useState(null)
  const [journalText, setJournalText] = useState('')
  const [copied, setCopied] = useState(false)
  const [showMotivation, setShowMotivation] = useState(true)
  const [motivationalPhrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)])
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('sibo-theme') || 'light' } catch { return 'light' }
  })
  const [journalEntries, setJournalEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sibo-journal') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('sibo-journal', JSON.stringify(journalEntries)) }, [journalEntries])
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('sibo-theme', theme) } catch {}
  }, [theme])

  const toggleItem = (name) => setChecked((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])

  async function generateRecipe(event) {
    event.preventDefault()
    setLoading(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/recipe-suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setRecipe(data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  function addRecipeToMenu() {
    if (!recipe) return
    setMenu((current) => ({ ...current, Domingo: { ...current.Domingo, Cena: { name: recipe.name, ingredients: recipe.ingredients?.map((item) => item.name) || [] } } }))
    setShowGenerator(false); setRecipe(null)
  }

  function saveManualMeal(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const day = form.get('day')
    const meal = form.get('meal')
    const name = form.get('name')?.trim()
    const ingredients = form.get('ingredients')?.split(',').map((ingredient) => ingredient.trim()).filter(Boolean)
    if (!name) return
    setMenu((current) => ({ ...current, [day]: { ...current[day], [meal]: { name, ingredients } } }))
    setMealTarget(null)
  }

  function saveJournalEntry(event) {
    event.preventDefault()
    const text = journalText.trim()
    if (!text) return
    setJournalEntries((current) => [{ id: Date.now(), text, date: formatJournalDate(new Date()) }, ...current])
    setJournalText('')
  }

  async function copyShoppingList() {
    if (!shoppingItems.length) return
    const text = `Lista de compras · sibo.decis\n${shoppingItems.map((item) => `- ${item.name}${item.count > 1 ? ` x${item.count}` : ''}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      const fallback = document.createElement('textarea')
      fallback.value = text
      document.body.appendChild(fallback)
      fallback.select()
      document.execCommand('copy')
      document.body.removeChild(fallback)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

   useEffect(() => {
     const timer = window.setTimeout(() => setShowMotivation(false), 4500)
     return () => window.clearTimeout(timer)
   }, [])

   return <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
     {showMotivation && <MotivationalSplash phrase={motivationalPhrase} />}
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-sm dark:border-cream/10 dark:bg-ink-dark/85">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-10">
         <a className="flex items-center gap-3" href="#inicio"><span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-cream"><Leaf size={21} strokeWidth={2.5} /></span><span className="font-display text-xl font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span></a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/65 dark:text-cream/65 md:flex"><a className="text-moss dark:text-sun" href="#menu">Mi menú</a><a href="#compras">Lista de compras</a><a href="#ideas">Ideas rápidas</a><a href="#diario">Diario</a></nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft" aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={() => setMobileNavOpen((open) => !open)} className="rounded-full border border-ink/15 p-2 text-ink/70 dark:border-cream/15 dark:text-cream/80 md:hidden" aria-label="Abrir menú" aria-expanded={mobileNavOpen}><Menu size={20} /></button>
          <button onClick={() => setShowGenerator(true)} className="hidden items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-bold text-white shadow-lg shadow-coral/20 transition hover:bg-[#d9624c] sm:flex"><Sparkles size={16} /> Crear receta</button>
        </div>
      </div>
      {mobileNavOpen && <nav className="border-t border-ink/10 bg-cream px-4 py-4 dark:border-cream/10 dark:bg-ink-dark md:hidden"><div className="mx-auto flex max-w-[1440px] flex-col gap-1 text-sm font-semibold"><a onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 text-moss hover:bg-white dark:hover:bg-ink-soft" href="#menu">Mi menú</a><a onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="#compras">Lista de compras</a><a onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="#ideas">Ideas rápidas</a><a onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="#diario">Diario</a><button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark') }} className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-ink/10 px-3 py-3 text-ink/80 dark:border-cream/15 dark:text-cream/80">{theme === 'dark' ? <><Sun size={16} /> Modo claro</> : <><Moon size={16} /> Modo oscuro</>}</button><button onClick={() => { setMobileNavOpen(false); setShowGenerator(true) }} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-bold text-white"><Sparkles size={16} /> Crear receta</button></div></nav>}
    </header>

     <main id="inicio" className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
       <section className="mb-10 flex flex-col justify-between gap-7 sm:mb-12 sm:gap-8 lg:flex-row lg:items-end"><div><p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-coral sm:text-xs sm:tracking-[0.2em]"><span className="h-2 w-2 shrink-0 rounded-full bg-coral" /> Semana del {formatWeekRange(weekStart)}</p><h1 className="max-w-2xl font-display text-[clamp(3.25rem,13vw,4.5rem)] leading-[.92] tracking-tight">Comer bien,<br /><em className="font-normal text-moss dark:text-sage">sentirte mejor.</em></h1><p className="mt-5 max-w-md text-sm leading-relaxed text-ink/60 dark:text-cream/60 sm:mt-6 sm:text-base">Tu semana baja en FODMAP, organizada con calma y pensada para disfrutar cada bocado.</p></div><div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3"><button onClick={() => setWeekStart((current) => addDays(current, -7))} className="rounded-full border border-ink/15 px-3 py-3 text-xs font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft sm:px-5 sm:text-sm">← Anterior</button><button onClick={() => setWeekStart((current) => addDays(current, 7))} className="rounded-full border border-ink/15 px-3 py-3 text-xs font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft sm:px-5 sm:text-sm">Siguiente →</button></div></section>
       <WeeklyCalendar menu={menu} weekStart={weekStart} days={weekdays} onAddMeal={setMealTarget} />
       <div className="grid gap-6 xl:grid-cols-[1fr_310px]">
         <section id="menu" className="rounded-3xl border border-ink/10 bg-white p-4 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl">Menú semanal</h2><p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Una guía flexible para tu semana.</p></div><button onClick={() => setMealTarget({ day: 'Lunes' })} className="hidden items-center gap-2 rounded-full bg-sage px-4 py-2.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage sm:flex"><CirclePlus size={15} /> Agregar comida</button></div>
           <div className="space-y-3 md:hidden">{Object.entries(menu).map(([day, meals], dayIndex) => { const date = addDays(weekStart, dayIndex); return <article key={day} className="rounded-2xl border border-ink/10 bg-cream p-4 dark:border-cream/10 dark:bg-ink"><div className="mb-3 flex items-center justify-between"><h3 className={`font-display text-xl ${dayIndex === 0 ? 'text-coral' : 'text-moss dark:text-sage'}`}>{day}</h3><div className="flex items-center gap-2"><span className="text-xs font-bold text-ink/35 dark:text-cream/35">{date.getDate()} {formatMonthShort(date)}</span><button onClick={() => setMealTarget({ day })} className="flex items-center gap-1 rounded-full bg-sage px-3 py-1.5 text-[10px] font-bold text-moss dark:bg-moss/30 dark:text-sage"><CirclePlus size={13} /> Agregar</button></div></div><div className="grid grid-cols-1 gap-2">{Object.entries(meals).map(([meal, value], mealIndex) => { const mealName = getMealName(value); return <button onClick={() => setMealTarget({ day, meal })} key={meal} className={`flex min-h-[62px] items-center justify-between gap-3 rounded-xl border border-ink/5 p-3 text-left dark:border-cream/10 ${mealIndex === 3 ? 'bg-[#fff8ef] dark:bg-ink-soft' : 'bg-white dark:bg-ink-soft'}`}><span><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{meal}</span><span className={`block text-sm font-semibold leading-snug ${mealName ? '' : 'text-moss dark:text-sage'}`}>{mealName || '+ Agregar comida'}</span></span><span className="shrink-0 text-[10px] text-ink/40 dark:text-cream/40">{mealName ? <Clock3 size={13} /> : <CirclePlus size={16} />}</span></button> })}</div></article> })}</div>
           <div className="hidden overflow-x-auto md:block"><div className="min-w-[850px]"><div className="grid grid-cols-[100px_repeat(7,minmax(100px,1fr))] gap-2 border-b border-ink/10 pb-3 text-[11px] font-bold uppercase tracking-wider text-ink/45 dark:border-cream/10 dark:text-cream/45"><div>Momento</div>{weekdays.map((day, index) => { const date = addDays(weekStart, index); return <div key={day} className={index === 0 ? 'text-coral' : ''}><div className="flex items-center gap-1">{formatDayName(date)}<span className="font-normal">{date.getDate()}</span><button onClick={() => setMealTarget({ day })} className="ml-auto rounded-full p-1 text-moss hover:bg-sage dark:hover:bg-moss/30" aria-label={`Agregar comida el ${day}`}><CirclePlus size={13} /></button></div></div> })}</div>{['Desayuno', 'Almuerzo', 'Merienda', 'Cena'].map((meal, mealIndex) => <div className="grid grid-cols-[100px_repeat(7,minmax(100px,1fr))] gap-2 border-b border-ink/10 py-3 last:border-0 dark:border-cream/10" key={meal}><div className="pt-3 text-xs font-bold text-ink/45 dark:text-cream/45">{meal}</div>{Object.entries(menu).map(([day, meals]) => { const mealName = getMealName(meals[meal]); return <button onClick={() => setMealTarget({ day, meal })} key={day} className={`meal-card group text-left ${mealName ? 'meal-card--filled' : ''}`}><span className={`mb-1.5 block text-sm font-semibold leading-snug ${mealName ? 'group-hover:text-coral' : 'text-moss dark:text-sage'}`}>{mealName || '+ Agregar comida'}</span><span className="flex items-center gap-1 text-[10px] text-ink/40 dark:text-cream/40">{mealName && <><Clock3 size={11} /> {mealIndex === 0 ? '10 min' : mealIndex === 1 ? '25 min' : '15 min'}</>}</span></button> })}</div>)}</div></div>
         </section>
         <aside id="compras" className="rounded-3xl bg-moss p-6 text-cream shadow-soft"><div className="mb-8 flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-sun">Esta semana</p><h2 className="font-display text-3xl">Lista de<br />compras</h2></div><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><ListChecks size={19} /></span></div><div className="mb-7 flex items-center justify-between border-b border-white/15 pb-5 text-sm"><span className="text-cream/60">{checked.length} de {shoppingItems.length} listos</span><div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-sun transition-all" style={{ width: `${shoppingItems.length ? (checked.length / shoppingItems.length) * 100 : 0}%` }} /></div></div>{shoppingItems.length ? <div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-cream/45">Ingredientes de la semana</p><div className="space-y-3">{shoppingItems.map((item) => <label key={item.name} className="flex cursor-pointer items-center gap-3 text-sm"><span className={`grid h-5 w-5 place-items-center rounded-md border transition ${checked.includes(item.name) ? 'border-sun bg-sun text-moss' : 'border-white/25'}`}>{checked.includes(item.name) && <Check size={13} strokeWidth={3} />}</span><input className="sr-only" type="checkbox" checked={checked.includes(item.name)} onChange={() => toggleItem(item.name)} /><span className={checked.includes(item.name) ? 'text-cream/40 line-through' : ''}>{item.name} {item.count > 1 && <small className="ml-1 font-bold text-sun">x{item.count}</small>}</span></label>)}</div></div> : <div className="rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center"><ListChecks className="mx-auto mb-3 text-cream/40" size={24} /><p className="text-sm font-semibold">Tu lista está vacía</p><p className="mt-1 text-xs leading-relaxed text-cream/50">Agrega recetas al menú para ver aquí sus ingredientes.</p></div>}<button onClick={copyShoppingList} disabled={!shoppingItems.length} className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-sun py-3 text-sm font-bold text-moss transition hover:bg-[#f8d873] disabled:cursor-not-allowed disabled:opacity-40">{copied ? <><Check size={16} /> ¡Copiado!</> : <><Copy size={16} /> Compartir lista</>}</button></aside>
      </div>
       <section id="ideas" className="mt-8 grid items-center gap-6 rounded-3xl bg-[#f0e9db] p-6 dark:bg-ink-soft sm:p-10 lg:grid-cols-[1fr_auto] lg:px-12"><div><span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage"><Sparkles size={13} /> Asistente SIBO</span><h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">¿No sabes qué cocinar?<br /><em className="font-normal text-coral">Te damos una idea.</em></h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60 dark:text-cream/60">Cuéntanos qué tienes en la cocina y crea una receta rica y baja en FODMAP en segundos.</p></div><button onClick={() => setShowGenerator(true)} className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition hover:bg-moss dark:bg-sun dark:text-ink dark:hover:bg-coral dark:hover:text-white"><Sparkles size={16} /> Generar con IA</button></section>
      <section id="diario" className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10"><div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12"><div><span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage"><BookHeart size={14} /> Tu espacio personal</span><h2 className="font-display text-3xl leading-tight sm:text-4xl">Diario de<br /><em className="font-normal text-coral">cómo te sientes.</em></h2><p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60 dark:text-cream/60">Registra síntomas, energía o cualquier detalle que quieras recordar. Es solo para ti.</p><form onSubmit={saveJournalEntry} className="mt-6"><textarea value={journalText} onChange={(event) => setJournalText(event.target.value)} className="field min-h-32 resize-y" placeholder="¿Cómo te sentiste hoy?" aria-label="Nueva entrada del diario" /><button className="mt-3 w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white transition hover:bg-ink sm:w-auto sm:px-6">Guardar entrada</button></form></div><div className="rounded-2xl bg-cream p-5 dark:bg-ink sm:p-6"><div className="mb-5 flex items-center justify-between"><h3 className="font-display text-xl">Tus registros</h3><span className="text-xs font-bold text-ink/40 dark:text-cream/40">{journalEntries.length} {journalEntries.length === 1 ? 'entrada' : 'entradas'}</span></div>{journalEntries.length ? <div className="max-h-80 space-y-3 overflow-y-auto pr-1">{journalEntries.map((entry) => <article key={entry.id} className="rounded-xl border border-ink/10 bg-white p-4 dark:border-cream/10 dark:bg-ink-soft"><p className="text-sm leading-relaxed text-ink/75 dark:text-cream/75">{entry.text}</p><time className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{entry.date}</time></article>)}</div> : <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15"><div><BookHeart className="mx-auto mb-3 text-moss/40 dark:text-sage/40" size={26} /><p className="text-sm font-semibold text-ink/60 dark:text-cream/60">Todavía no hay registros</p><p className="mt-1 text-xs text-ink/40">Tu primera nota aparecerá aquí.</p></div></div>}</div></div></section>
       </main>
        <footer className="border-t border-ink/10 px-5 py-8 dark:border-cream/10 lg:px-10">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <span className="font-display text-lg font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span>
            <p className="text-xs text-ink/45 dark:text-cream/45">developed by Victoria Villalba</p>
          </div>
        </footer>
    {mealTarget && <MealModal target={mealTarget} days={weekdays} onClose={() => setMealTarget(null)} onSubmit={saveManualMeal} />}
    {showGenerator && <GeneratorModal onClose={() => { setShowGenerator(false); setRecipe(null); setError('') }} onSubmit={generateRecipe} loading={loading} recipe={recipe} error={error} onAdd={addRecipeToMenu} />}
  </div>
}

function MealModal({ target, days, onClose, onSubmit }) { return <div className="fixed inset-0 z-20 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"><div className="mb-6 flex items-start justify-between"><div><span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage"><CirclePlus size={18} /></span><h2 className="font-display text-3xl">Agregar comida</h2><p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Completa tu menú a tu manera.</p></div><button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-cream/10" aria-label="Cerrar"><X size={20} /></button></div><form onSubmit={onSubmit} className="space-y-5"><label className="block text-sm font-bold">Día<select name="day" defaultValue={target.day} className="field mt-2">{days.map((day) => <option key={day}>{day}</option>)}</select></label><label className="block text-sm font-bold">Momento<select name="meal" defaultValue={target.meal || 'Cena'} className="field mt-2"><option>Desayuno</option><option>Almuerzo</option><option>Merienda</option><option>Cena</option></select></label><label className="block text-sm font-bold">Nombre de la receta<input autoFocus required name="name" className="field mt-2" placeholder="Ej. Ensalada de pollo y quinoa" /></label><label className="block text-sm font-bold">Ingredientes <span className="font-normal text-ink/40 dark:text-cream/40">(separados por comas)</span><textarea required name="ingredients" className="field mt-2 min-h-24" placeholder="Ej. tomate, lechuga, pollo" /></label><button className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white">Guardar en el menú</button></form></div></div> }

function GeneratorModal({ onClose, onSubmit, loading, recipe, error, onAdd }) { return <div className="fixed inset-0 z-20 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"><div className="mb-6 flex items-start justify-between"><div><span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage"><Sparkles size={18} /></span><h2 className="font-display text-3xl">Una idea para tu mesa</h2></div><button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-cream/10" aria-label="Cerrar"><X size={20} /></button></div>{recipe ? <div><h3 className="font-display text-2xl text-moss dark:text-sage">{recipe.name}</h3><p className="mt-2 text-sm text-ink/60 dark:text-cream/60">{recipe.description}</p><p className="mt-3 flex items-center gap-1 text-xs font-bold text-coral"><Clock3 size={14} /> {recipe.time}</p><h4 className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/45 dark:text-cream/45">Ingredientes</h4><ul className="mt-3 space-y-2 text-sm">{recipe.ingredients?.map((item) => <li key={item.name} className="flex justify-between border-b border-ink/10 pb-2 dark:border-cream/10"><span>{item.name}</span><span className="text-ink/50 dark:text-cream/50">{item.amount}</span></li>)}</ul><h4 className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/45 dark:text-cream/45">Preparación</h4><ol className="mt-3 space-y-2 text-sm leading-relaxed">{recipe.steps?.map((step, i) => <li key={step}><b className="mr-2 text-coral">{i + 1}.</b>{step}</li>)}</ol><button onClick={onAdd} className="mt-7 w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white">Agregar al domingo</button></div> : <form onSubmit={onSubmit} className="space-y-5"><label className="block text-sm font-bold">¿Para qué comida?<select name="mealType" defaultValue="cena" className="field mt-2"><option>desayuno</option><option>almuerzo</option><option>merienda</option><option>cena</option></select></label><label className="block text-sm font-bold">¿Qué ingredientes tienes?<textarea name="ingredients" className="field mt-2 min-h-24" placeholder="Ej. pollo, arroz, zanahoria..." /></label><label className="block text-sm font-bold">Alguna preferencia <span className="font-normal text-ink/40 dark:text-cream/40">(opcional)</span><input name="preferences" className="field mt-2" placeholder="Ej. vegetariana, rápida, sin lácteos..." /></label>{error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Pensando...' : <><Sparkles size={16} /> Crear receta</>}</button><p className="text-center text-[11px] text-ink/40 dark:text-cream/40">Las sugerencias son orientativas. Consulta siempre a tu profesional de salud.</p></form>}</div></div> }

createRoot(document.getElementById('root')).render(<App />)
