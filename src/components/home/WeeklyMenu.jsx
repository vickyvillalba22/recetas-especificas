import { useEffect, useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CirclePlus, Clock3 } from '../ui/icons'
import { getMealDragId, getSlotDropId, mealTimes } from './weeklyMenuConstants'

function DraggableMeal({ value, day, meal, dayIndex, mealIndex, onAddMeal, mobile = false, isDragging, dragDisabled }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: getMealDragId(value.id, mobile ? 'mobile' : 'desktop'),
    disabled: dragDisabled,
    data: {
      kind: 'meal',
      mealId: value.id,
      name: value.name,
      ingredients: value.ingredients,
      sourceDayIndex: dayIndex,
      sourceMealIndex: mealIndex,
      view: mobile ? 'mobile' : 'desktop',
    },
  })

  const className = mobile
    ? `flex min-h-[62px] w-full touch-none select-none items-center justify-between gap-3 rounded-xl border border-ink/5 bg-white p-3 text-left transition dark:border-cream/10 dark:bg-ink-soft ${isDragging ? 'opacity-40' : ''} cursor-grab active:cursor-grabbing`
    : `meal-card group select-none text-left transition ${isDragging ? 'opacity-40' : ''} cursor-grab active:cursor-grabbing`

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onAddMeal({ day, meal })}
      disabled={dragDisabled}
      {...attributes}
      {...listeners}
      className={className}
    >
      <span>
        {mobile && <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{meal}</span>}
        <span className={`block text-sm font-semibold leading-snug ${mobile ? '' : 'mb-1.5 group-hover:text-coral'}`}>{value.name}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-ink/40 dark:text-cream/40">
        <Clock3 size={mobile ? 13 : 11} />
        {!mobile && (mealIndex === 0 ? '10 min' : mealIndex === 1 ? '25 min' : '15 min')}
      </span>
    </button>
  )
}

function MealSlot({ day, meal, dayIndex, mealIndex, value, onAddMeal, activeDrag, dropDisabled, dragDisabled, mobile = false }) {
  const { isOver, setNodeRef } = useDroppable({
    id: getSlotDropId(dayIndex, mealIndex, mobile ? 'mobile' : 'desktop'),
    data: { kind: 'slot', dayIndex, mealIndex, view: mobile ? 'mobile' : 'desktop' },
    disabled: dropDisabled || dragDisabled,
  })
  const hasMeal = Boolean(value?.id)
  const isSource = activeDrag?.mealId === value?.id
  const baseClass = mobile
    ? `flex min-h-[62px] w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${mealIndex === 3 ? 'bg-[#fff8ef] dark:bg-ink-soft' : 'bg-white dark:bg-ink-soft'}`
    : `meal-card group text-left transition ${hasMeal ? 'meal-card--filled' : ''}`
  const dropClass = isOver
    ? 'ring-2 ring-moss ring-offset-2 ring-offset-cream dark:ring-sage dark:ring-offset-ink-soft'
    : 'border-ink/5 dark:border-cream/10'

  return (
    <div ref={setNodeRef} className={`${baseClass} ${dropClass}`}>
      {hasMeal ? (
        <DraggableMeal
          value={value}
          day={day}
          meal={meal}
          dayIndex={dayIndex}
          mealIndex={mealIndex}
          onAddMeal={onAddMeal}
          mobile={mobile}
          isDragging={isSource}
          dragDisabled={dragDisabled}
        />
      ) : (
        <button type="button" onClick={() => onAddMeal({ day, meal })} disabled={dragDisabled} className="flex w-full items-center justify-between gap-3 text-left">
          <span>
            {mobile && <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">{meal}</span>}
            <span className="block text-sm font-semibold leading-snug text-moss dark:text-sage">+ Agregar comida</span>
          </span>
          <CirclePlus size={mobile ? 16 : 15} className="shrink-0 text-ink/40 dark:text-cream/40" />
        </button>
      )}
    </div>
  )
}

function MobileDayTab({ day, index, date, active, activeDrag, onSelect }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `mobile-day-${index}`,
    data: { kind: 'mobile-day', dayIndex: index },
  })

  useEffect(() => {
    if (isOver && activeDrag?.kind === 'meal' && !active) onSelect(day)
  }, [active, activeDrag, day, isOver, onSelect])

  return <button ref={setNodeRef} type="button" role="tab" aria-selected={active} onClick={() => onSelect(day)} onPointerEnter={() => activeDrag?.kind === 'meal' && onSelect(day)} className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1.5 transition ${active ? 'border-moss bg-moss text-white shadow-md shadow-moss/20' : 'border-ink/10 bg-cream text-ink/60 dark:border-cream/10 dark:bg-ink dark:text-cream/60'} ${isOver && activeDrag ? 'ring-2 ring-sun ring-offset-1 ring-offset-cream dark:ring-offset-ink-soft' : ''}`}><span className="text-[9px] font-bold uppercase tracking-wider">{day.slice(0, 3)}</span><span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold leading-none ${active ? 'bg-sun text-moss' : 'bg-white text-ink dark:bg-ink-soft dark:text-cream'}`}>{date.getDate()}</span></button>
}

export function WeeklyMenu({ menu, weekStart, weekdays, onAddMeal, formatDayName, formatMonthShort, activeDrag, dropDisabled, dragDisabled }) {
  const [mobileDay, setMobileDay] = useState(weekdays[0])
  const activeMobileDay = weekdays.includes(mobileDay) ? mobileDay : weekdays[0]

  useEffect(() => {
    if (!weekdays.includes(mobileDay)) setMobileDay(weekdays[0])
  }, [mobileDay, weekdays])

  return <section id="menu" className="rounded-3xl border border-ink/10 bg-white p-4 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl">Menú semanal</h2><p className="mt-1 text-sm text-ink/50 dark:text-cream/50">{activeDrag ? 'Soltá la comida en otro día o momento.' : 'Una guía flexible para tu semana.'}</p></div><button onClick={() => onAddMeal({ day: 'Lunes' })} disabled={dragDisabled} className="hidden items-center gap-2 rounded-full bg-sage px-4 py-2.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage sm:flex"><CirclePlus size={15} /> Agregar comida</button></div>
      <div className="mb-4 grid grid-cols-7 gap-1 md:hidden" role="tablist" aria-label="Días de la semana">{weekdays.map((day, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return <MobileDayTab key={day} day={day} index={index} date={date} active={day === activeMobileDay} activeDrag={activeDrag} onSelect={setMobileDay} /> })}</div>
      <div className="md:hidden">{weekdays.map((day, dayIndex) => { const date = new Date(weekStart); date.setDate(date.getDate() + dayIndex); const meals = menu[day] || {}; const isActive = day === activeMobileDay; const visibilityClass = isActive ? '' : 'pointer-events-none invisible absolute left-[-9999px] top-0 w-full'; return <article key={day} className={`${visibilityClass} rounded-2xl border border-ink/10 bg-cream p-4 dark:border-cream/10 dark:bg-ink`} aria-hidden={!isActive}><div className="mb-3 flex items-center justify-between"><div><h3 className={`font-display text-xl ${dayIndex === 0 ? 'text-coral' : 'text-moss dark:text-sage'}`}>{day}</h3><span className="text-xs font-bold text-ink/35 dark:text-cream/35">{date.getDate()} {formatMonthShort(date)}</span></div><button onClick={() => onAddMeal({ day })} disabled={dragDisabled || !isActive} className="flex items-center gap-1 rounded-full bg-sage px-3 py-1.5 text-[10px] font-bold text-moss dark:bg-moss/30 dark:text-sage"><CirclePlus size={13} /> Agregar</button></div><div className="grid grid-cols-1 gap-2">{Object.entries(meals).map(([meal, value], mealIndex) => <MealSlot key={meal} day={day} meal={meal} dayIndex={dayIndex} mealIndex={mealIndex} value={value} onAddMeal={onAddMeal} activeDrag={activeDrag} dropDisabled={dropDisabled || !isActive} dragDisabled={dragDisabled} mobile />)}</div></article> })}</div>
     <div className="hidden overflow-x-auto md:block"><div className="min-w-[850px]"><div className="grid grid-cols-[100px_repeat(7,minmax(100px,1fr))] gap-2 border-b border-ink/10 pb-3 text-[11px] font-bold uppercase tracking-wider text-ink/45 dark:border-cream/10 dark:text-cream/45"><div>Momento</div>{weekdays.map((day, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return <div key={day} className={index === 0 ? 'text-coral' : ''}><div className="flex items-center gap-1">{formatDayName(date)}<span className="font-normal">{date.getDate()}</span><button onClick={() => onAddMeal({ day })} disabled={dragDisabled} className="ml-auto rounded-full p-1 text-moss hover:bg-sage dark:hover:bg-moss/30" aria-label={`Agregar comida el ${day}`}><CirclePlus size={13} /></button></div></div> })}</div>{mealTimes.map((meal, mealIndex) => <div className="grid grid-cols-[100px_repeat(7,minmax(100px,1fr))] gap-2 border-b border-ink/10 py-3 last:border-0 dark:border-cream/10" key={meal}><div className="pt-3 text-xs font-bold text-ink/45 dark:text-cream/45">{meal}</div>{Object.entries(menu).map(([day, meals]) => <MealSlot key={day} day={day} meal={meal} dayIndex={weekdays.indexOf(day)} mealIndex={mealIndex} value={meals[meal]} onAddMeal={onAddMeal} activeDrag={activeDrag} dropDisabled={dropDisabled} dragDisabled={dragDisabled} />)}</div>)}</div></div>
  </section>
}
