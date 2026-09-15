import { useEffect, useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CirclePlus, Clock3 } from '../ui/icons'

const mealTimes = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena']

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function DayTab({ day, index, date, active, activeDrag, onSelect }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `calendar-day-${index}`,
    data: { kind: 'day-tab', dayIndex: index },
  })

  useEffect(() => {
    if (isOver && activeDrag?.kind === 'meal' && !active) onSelect(day)
  }, [active, activeDrag, day, isOver, onSelect])

  return <button ref={setNodeRef} role="tab" aria-selected={active} aria-controls={`meals-${day}`} onClick={() => onSelect(day)} className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-full border px-1 py-2 transition ${active ? 'border-moss bg-moss text-white shadow-lg shadow-moss/20' : 'border-ink/10 bg-cream text-ink/60 hover:border-moss/40 hover:text-moss dark:border-cream/10 dark:bg-ink dark:text-cream/60 dark:hover:border-moss/40 dark:hover:text-sage'} ${isOver && activeDrag ? 'ring-2 ring-sun ring-offset-2 ring-offset-cream dark:ring-offset-ink-soft' : ''}`}><span className="text-[10px] font-bold uppercase tracking-wider">{day.slice(0, 3)}</span><span className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-semibold leading-none ${active ? 'bg-sun/95 text-moss' : 'bg-white/80 text-ink dark:bg-ink-soft dark:text-cream'}`}>{date.getDate()}</span></button>
}

function CalendarMeal({ day, meal, dayIndex, mealIndex, value, onAddMeal, activeDrag, dropDisabled }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `calendar-slot-${dayIndex}-${mealIndex}`,
    data: { kind: 'slot', dayIndex, mealIndex },
    disabled: dropDisabled,
  })
  const hasMeal = Boolean(value?.id)
  const isSource = activeDrag?.mealId === value?.id

  return <div ref={setNodeRef} className={`meal-card group text-left transition ${hasMeal ? 'meal-card--filled' : ''} ${isOver ? 'ring-2 ring-moss ring-offset-2 ring-offset-cream dark:ring-sage dark:ring-offset-ink-soft' : ''}`}>
    {hasMeal ? <DraggableCalendarMeal day={day} meal={meal} dayIndex={dayIndex} mealIndex={mealIndex} value={value} onAddMeal={onAddMeal} isSource={isSource} /> : <button type="button" onClick={() => onAddMeal({ day, meal })} className="flex w-full flex-col text-left"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{meal}</span><span className="block text-sm font-semibold leading-snug text-moss dark:text-sage">+ Agregar comida</span></button>}
  </div>
}

function DraggableCalendarMeal({ day, meal, dayIndex, mealIndex, value, onAddMeal, isSource }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `calendar-meal-${value.id}`,
    data: { kind: 'meal', mealId: value.id, name: value.name, ingredients: value.ingredients, sourceDayIndex: dayIndex, sourceMealIndex: mealIndex },
  })

  return <button ref={setNodeRef} type="button" onClick={() => onAddMeal({ day, meal })} {...attributes} {...listeners} className={`flex w-full touch-none select-none flex-col text-left cursor-grab active:cursor-grabbing ${isSource ? 'opacity-40' : ''}`}><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{meal}</span><span className="block text-sm font-semibold leading-snug group-hover:text-coral">{value.name}</span><span className="mt-1.5 flex items-center gap-1 text-[10px] text-ink/40 dark:text-cream/40"><Clock3 size={11} /> Ver comida</span></button>
}

export function DraggableWeeklyCalendar({ menu, weekStart, days, onAddMeal, activeDrag, dropDisabled }) {
  const [activeDay, setActiveDay] = useState('Lunes')
  const activeMeals = menu[activeDay] || {}
  const activeDate = addDays(weekStart, days.indexOf(activeDay))
  const selectDay = (day) => setActiveDay(day)

  return <section id="menu" className="weekly-calendar mb-6 rounded-3xl border border-ink/10 bg-white p-4 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-6"><div className="mb-6 flex items-center justify-between gap-4"><div><h2 className="font-display text-2xl">Menú semanal</h2><p className="mt-1 text-sm text-ink/50 dark:text-cream/50">{activeDrag ? 'Elegí otro día y soltá la comida en un momento.' : 'Elige un día para ver sus comidas.'}</p></div><button onClick={() => onAddMeal({ day: activeDay })} className="flex shrink-0 items-center gap-2 rounded-full bg-sage px-4 py-2.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage"><CirclePlus size={15} /> <span className="hidden sm:inline">Agregar comida</span><span className="sm:hidden">Agregar</span></button></div><div role="tablist" aria-label="Días de la semana" className="-mx-1 grid grid-cols-7 gap-2 px-1 pb-2">{days.map((day, index) => <DayTab key={day} day={day} index={index} date={addDays(weekStart, index)} active={day === activeDay} activeDrag={activeDrag} onSelect={selectDay} />)}</div><div id={`meals-${activeDay}`} role="tabpanel" className="mt-6 border-t border-ink/10 pt-5 dark:border-cream/10"><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-2xl text-moss dark:text-sage">{activeDay}</h3><span className="text-xs font-bold uppercase tracking-wider text-ink/35 dark:text-cream/35">{activeDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(activeMeals).map(([meal, value], mealIndex) => <CalendarMeal key={meal} day={activeDay} meal={meal} dayIndex={days.indexOf(activeDay)} mealIndex={mealIndex} value={value} onAddMeal={onAddMeal} activeDrag={activeDrag} dropDisabled={dropDisabled} />)}</div></div></section>
}
