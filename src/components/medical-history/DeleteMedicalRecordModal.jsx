import { Trash, X } from '../ui/icons'

export function DeleteMedicalRecordModal({ record, onClose, onConfirm, loading = false }) {
  if (!record) return null

  const isAppointment = record.type === 'appointment'
  const recordLabel = isAppointment ? 'turno' : 'estudio'
  const recordName = isAppointment ? record.specialty : record.studyType

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && !loading && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="delete-medical-record-title" className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex rounded-full bg-coral/10 p-3 text-coral">
            <Trash size={20} />
          </span>
          <button type="button" onClick={onClose} disabled={loading} className="rounded-full p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/50 dark:hover:bg-cream/10 dark:hover:text-cream" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <h2 id="delete-medical-record-title" className="mt-4 font-display text-2xl">¿Eliminar este {recordLabel}?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
          Se eliminará <strong className="text-ink dark:text-cream">{recordName || `este ${recordLabel}`}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="flex-1 rounded-full bg-coral px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
