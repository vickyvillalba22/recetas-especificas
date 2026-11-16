import { Calendar, Clock3, UserCircle } from '../ui/icons'

function formatAppointmentDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function NextAppointmentCard({ appointment }) {
  if (!appointment) return null

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

        <span className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-cream sm:justify-self-end">
          Agendado
        </span>
      </div>
    </section>
  )
}
