import { useState } from 'react'
import { Plus, X } from '../../ui/icons'
import { shoppingUnits } from '../../../utils/shoppingUnits'

export function AddShoppingItemsModal({ onClose, onSubmit, loading, error }) {
  const [rows, setRows] = useState([{ name: '', quantity: 1, unit: 'unidad' }])

  const updateRow = (index, field, value) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row))
  }

  const addRow = () => setRows((current) => [...current, { name: '', quantity: 1, unit: 'unidad' }])
  const removeRow = (index) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))

  return (
    <div onClick={(event) => event.target === event.currentTarget && !loading && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="add-shopping-items-title" className="w-full max-w-lg rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-shopping-items-title" className="font-display text-2xl">Agregar ingredientes</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">Sumá ingredientes extra a tu lista de compras.</p>
          </div>
          <button onClick={onClose} disabled={loading} type="button" className="rounded-full p-2 text-ink/50 transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/50 dark:hover:bg-cream/10 dark:hover:text-cream" aria-label="Cerrar"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_72px_96px_36px] items-end gap-2">
                <label className="text-xs font-bold">
                  {index === 0 && <span>Ingrediente</span>}
                  <input name="ingredientName" value={row.name} onChange={(event) => updateRow(index, 'name', event.target.value)} disabled={loading} className="field mt-2" placeholder="Ej. tomate" />
                </label>
                <label className="text-xs font-bold">
                  {index === 0 && <span>Cantidad</span>}
                  <input name="ingredientQuantity" type="number" min="0.01" step="0.01" value={row.quantity} onChange={(event) => updateRow(index, 'quantity', event.target.value)} disabled={loading} className="field mt-2 px-2 text-center" />
                </label>
                <label className="text-xs font-bold">
                  {index === 0 && <span>Unidad</span>}
                  <select name="ingredientUnit" value={row.unit} onChange={(event) => updateRow(index, 'unit', event.target.value)} disabled={loading} className="field mt-2 px-2">
                    {shoppingUnits.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                {rows.length > 1 ? <button onClick={() => removeRow(index)} disabled={loading} type="button" className="mb-1 grid h-10 w-9 place-items-center rounded-full text-ink/45 transition hover:bg-coral/10 hover:text-coral disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/45" aria-label={`Quitar ingrediente ${index + 1}`}><X size={17} /></button> : <span />}
              </div>
            ))}
          </div>
          <button onClick={addRow} disabled={loading} type="button" className="mt-4 flex items-center gap-1.5 text-sm font-bold text-moss transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-sage dark:hover:text-cream"><Plus size={16} /> Agregar otro ingrediente</button>
          {error && <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} disabled={loading} type="button" className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink">Cancelar</button>
            <button disabled={loading} type="submit" className="flex-1 rounded-full bg-moss px-4 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Agregando...' : 'Agregar a la lista'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
