import { CirclePlus, X } from '../../ui/icons'

export function MealModal({ target, days, onClose, onSubmit, error, loading }) {
  const isEditing = Boolean(target.editing)

  return (
    <div onClick={(event) => event.target === event.currentTarget && !loading && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage">
              <CirclePlus size={18} />
            </span>
            <h2 className="font-display text-3xl">{isEditing ? 'Editar comida' : 'Agregar comida'}</h2>
            <p className="mt-1 text-sm text-ink/50 dark:text-cream/50">{isEditing ? 'Editá los datos de esta comida.' : 'Completa tu menú a tu manera.'}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="rounded-full p-2 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-cream/10" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block text-sm font-bold">
            Día
            <select name="day" defaultValue={target.day} disabled={loading} className="field mt-2">
              {days.map((day) => <option key={day}>{day}</option>)}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Momento
            <select name="meal" defaultValue={target.meal || 'Cena'} disabled={loading} className="field mt-2">
              <option>Desayuno</option>
              <option>Almuerzo</option>
              <option>Merienda</option>
              <option>Cena</option>
            </select>
          </label>
          <label className="block text-sm font-bold">
            Nombre de la receta
            <input autoFocus required name="name" defaultValue={target.recipe?.name || ''} disabled={loading} className="field mt-2" placeholder="Ej. Ensalada de pollo y quinoa" />
          </label>
          <label className="block text-sm font-bold">
            Ingredientes <span className="font-normal text-ink/40 dark:text-cream/40">(opcional, separados por comas)</span>
            <textarea name="ingredients" defaultValue={target.recipe?.ingredients?.join(', ') || ''} disabled={loading} className="field mt-2 min-h-24" placeholder="Ej. tomate, 1 kg de lechuga, 500 g de pollo" />
          </label>
          {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Guardando cambios...' : isEditing ? 'Guardar cambios' : 'Guardar en el menú'}
          </button>
        </form>
      </div>
    </div>
  )
}
