import { Calendar, Clock3, PencilEdit, UserCircle } from '../ui/icons'

function formatAppointmentDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function NextAppointmentCard({ appointment, onEdit }) {
  if (!appointment) {
    return (
      <section className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-white p-5 shadow-soft dark:border-cream/15 dark:bg-ink-soft dark:shadow-soft-dark sm:px-6 sm:py-5" aria-labelledby="next-appointment-empty-title">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Próximo turno</p>
        <h2 id="next-appointment-empty-title" className="mt-2 font-display text-xl">Todavía no tenés turnos próximos</h2>
        <p className="mt-1 text-sm text-ink/55 dark:text-cream/55">
          Cuando agregues un turno, vas a verlo destacado en este espacio.
        </p>
      </section>
    )
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl bg-moss text-white shadow-soft" aria-labelledby="next-appointment-title">
      <div className="border-b border-white/15 px-5 py-3 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-cream/75">Próximo turno</p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[minmax(170px,.8fr)_minmax(0,1.8fr)_auto] sm:items-center sm:gap-6 sm:px-6 sm:py-5">
        <div>
          <h2 id="next-appointment-title" className="font-display text-2xl leading-tight">
            {appointment.specialty}
          </h2>
          <p className="mt-1 text-sm text-white/75">{appointment.reason}</p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={17} className="shrink-0 text-cream" />
            <span className="capitalize">{formatAppointmentDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={17} className="shrink-0 text-cream" />
            <span>{appointment.time} hs</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle size={17} className="shrink-0 text-cream" />
            <span>{appointment.professional}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-cream/70 text-[9px] font-bold">●</span>
            <span>{appointment.modality} · {appointment.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:justify-self-end">
          <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-cream">
            Agendado
          </span>
          {onEdit && (
            <button type="button" onClick={() => onEdit(appointment)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-cream transition hover:bg-white/20">
              <PencilEdit size={14} />
              Editar
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
