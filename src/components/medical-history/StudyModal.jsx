import { BookHeart, X } from '../ui/icons'

export function StudyModal({ study, onClose, onSubmit, loading = false, error = '' }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.(new FormData(event.currentTarget))
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="study-modal-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage"><BookHeart size={19} /></span>
            <h2 id="study-modal-title" className="font-display text-3xl">{study ? 'Editar estudio' : 'Agregar estudio'}</h2>
            <p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Registrá el resultado de un estudio médico.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 transition hover:bg-black/5 dark:hover:bg-cream/10" aria-label="Cerrar"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">Fecha<input required type="date" name="date" defaultValue={study?.date || ''} className="field mt-2" /></label>
            <label className="block text-sm font-bold">Tipo de estudio<input required name="studyType" defaultValue={study?.studyType || ''} className="field mt-2" placeholder="Ej. Test de Aire Espirado SIBO H₂/CH₄" /></label>
          </div>
          <label className="block text-sm font-bold">Resultado <span className="font-normal text-ink/40 dark:text-cream/40">(opcional)</span><input name="result" defaultValue={study?.result || ''} className="field mt-2" placeholder="Ej. Positivo Hidrógeno, Normal" /></label>
          <label className="block text-sm font-bold">Notas <span className="font-normal text-ink/40 dark:text-cream/40">(opcional)</span><textarea name="notes" defaultValue={study?.notes || ''} className="field mt-2 min-h-32" placeholder="Observaciones o indicaciones relacionadas" /></label>
          {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Guardando...' : study ? 'Guardar cambios' : 'Guardar estudio'}</button>
        </form>
      </div>
    </div>
  )
}
