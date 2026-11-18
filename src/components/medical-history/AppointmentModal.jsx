import { Calendar, X } from '../ui/icons'

export function AppointmentModal({ appointment, onClose, onSubmit, loading = false, error = '' }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.(new FormData(event.currentTarget))
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="appointment-modal-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage"><Calendar size={19} /></span>
            <h2 id="appointment-modal-title" className="font-display text-3xl">{appointment ? 'Editar turno' : 'Agendar turno'}</h2>
            <p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Completá los datos de tu próxima consulta.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 transition hover:bg-black/5 dark:hover:bg-cream/10" aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">Fecha<input required type="date" name="date" defaultValue={appointment?.date || ''} className="field mt-2" /></label>
            <label className="block text-sm font-bold">Hora<input required type="time" name="time" defaultValue={appointment?.time || ''} className="field mt-2" /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">Especialidad<input required name="specialty" defaultValue={appointment?.specialty || ''} className="field mt-2" placeholder="Ej. Gastroenterología" /></label>
            <label className="block text-sm font-bold">Profesional<input required name="professional" defaultValue={appointment?.professional || ''} className="field mt-2" placeholder="Ej. Dra. María González" /></label>
          </div>
          <label className="block text-sm font-bold">Motivo <span className="font-normal text-ink/40 dark:text-cream/40">(opcional)</span><input name="reason" defaultValue={appointment?.reason || ''} className="field mt-2" placeholder="Ej. Control digestivo" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">Modalidad<select name="modality" defaultValue={appointment?.modality || 'Presencial'} className="field mt-2"><option>Presencial</option><option>Virtual</option></select></label>
            <label className="block text-sm font-bold">Estado<select name="status" defaultValue={appointment?.status || 'pending'} className="field mt-2"><option value="pending">Pendiente</option><option value="attended">Asistido</option><option value="cancelled">Cancelado</option></select></label>
          </div>
          <label className="block text-sm font-bold">Lugar <span className="font-normal text-ink/40 dark:text-cream/40">(opcional)</span><input name="location" defaultValue={appointment?.location || ''} className="field mt-2" placeholder="Ej. Centro Médico Belgrano" /></label>
          <label className="block text-sm font-bold">Notas <span className="font-normal text-ink/40 dark:text-cream/40">(opcional)</span><textarea name="notes" defaultValue={appointment?.notes || ''} className="field mt-2 min-h-24" placeholder="Indicaciones o notas de la consulta" /></label>
          {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Guardando...' : appointment ? 'Guardar cambios' : 'Guardar turno'}</button>
        </form>
      </div>
    </div>
  )
}
