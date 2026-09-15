import { useDroppable } from '@dnd-kit/core'

function WeekArrow({ direction, weekOffset, onClick, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `week-arrow-${direction}`,
    data: { kind: 'week-arrow', weekOffset },
  })

  return <button ref={setNodeRef} onClick={onClick} className={`rounded-full border px-3 py-3 text-xs font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft sm:px-5 sm:text-sm ${isOver ? 'border-moss bg-sage/50 text-moss ring-2 ring-moss/30 dark:border-sage dark:bg-moss/30 dark:text-sage' : 'border-ink/15'}`}>{children}</button>
}

export function HeroSection({ weekStart, formatWeekRange, onPreviousWeek, onNextWeek }) {
  return <section className="mb-10 flex flex-col justify-between gap-7 sm:mb-12 sm:gap-8 lg:flex-row lg:items-end"><div><p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-coral sm:text-xs sm:tracking-[0.2em]"><span className="h-2 w-2 shrink-0 rounded-full bg-coral" /> Semana del {formatWeekRange(weekStart)}</p><h1 className="max-w-2xl font-display text-[clamp(3.25rem,13vw,4.5rem)] leading-[.92] tracking-tight">Comer bien,<br /><em className="font-normal text-moss dark:text-sage">sentirte mejor.</em></h1><p className="mt-5 max-w-md text-sm leading-relaxed text-ink/60 dark:text-cream/60 sm:mt-6 sm:text-base">Tu semana baja en FODMAP, organizada con calma y pensada para disfrutar cada bocado.</p></div><div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3"><WeekArrow direction="previous" weekOffset={-1} onClick={onPreviousWeek}>← Anterior</WeekArrow><WeekArrow direction="next" weekOffset={1} onClick={onNextWeek}>Siguiente →</WeekArrow></div></section>
}
