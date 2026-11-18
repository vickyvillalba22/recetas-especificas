import { BookHeart, Calendar, Plus } from '../ui/icons'

export function MedicalHistoryActions({ onCreateAppointment, onCreateStudy }) {
  return (
    <div className="mt-7 flex w-full flex-nowrap rounded-full bg-sage p-1 dark:bg-moss/25 sm:w-fit">
      <button
        type="button"
        onClick={onCreateAppointment}
        className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-moss px-2 py-2.5 text-[14px] font-bold text-cream shadow-sm transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss sm:gap-2 sm:px-5 sm:text-sm"
      >
        <Calendar size={17} />
        Agendar turno
      </button>
      <button
        type="button"
        onClick={onCreateStudy}
        className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2.5 text-[14px] font-bold text-moss transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss dark:text-sage dark:hover:bg-ink-soft sm:gap-2 sm:px-5 sm:text-sm"
      >
        <BookHeart size={17} />
        Agregar estudio
      </button>
    </div>
  )
}
