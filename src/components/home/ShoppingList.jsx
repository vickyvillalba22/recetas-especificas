import { Check, Copy, ListChecks, X } from '../ui/icons'

export function ShoppingList({ shoppingItems, checked, toggleItem, removeItem, clearList, onCopy, copied }) {
  return (
    <aside id="compras" className="rounded-3xl bg-moss p-6 text-cream shadow-soft">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-sun">Esta semana</p>
          <h2 className="font-display text-3xl">Lista de<br />compras</h2>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><ListChecks size={19} /></span>
      </div>
      <div className="mb-7 flex items-center justify-between border-b border-white/15 pb-5 text-sm">
        <span className="text-cream/60">{checked.length} de {shoppingItems.length} listos</span>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${shoppingItems.length ? (checked.length / shoppingItems.length) * 100 : 0}%` }} />
        </div>
      </div>
      {shoppingItems.length ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cream/45">Ingredientes de la semana</p>
            <button onClick={clearList} type="button" className="text-[10px] font-bold text-cream/55 transition hover:text-sun">Vaciar lista</button>
          </div>
          <div className="space-y-3">
            {shoppingItems.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${checked.includes(item.name) ? 'border-sun bg-sun text-moss' : 'border-white/25'}`}>
                    {checked.includes(item.name) && <Check size={13} strokeWidth={3} />}
                  </span>
                  <input className="sr-only" type="checkbox" checked={checked.includes(item.name)} onChange={() => toggleItem(item.name)} />
                  <span className={`truncate ${checked.includes(item.name) ? 'text-cream/40 line-through' : ''}`}>
                    {item.name} {item.count > 1 && <small className="ml-1 font-bold text-sun">x{item.count}</small>}
                  </span>
                </label>
                <button onClick={() => removeItem(item.name)} type="button" className="shrink-0 rounded-full p-1 text-cream/45 transition hover:bg-white/10 hover:text-sun" aria-label={`Eliminar ${item.name}`}>
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center">
          <ListChecks className="mx-auto mb-3 text-cream/40" size={24} />
          <p className="text-sm font-semibold">Tu lista está vacía</p>
          <p className="mt-1 text-xs leading-relaxed text-cream/50">Agrega ingredientes al menú para verlos aquí.</p>
        </div>
      )}
      <button onClick={onCopy} disabled={!shoppingItems.length} className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-sun py-3 text-sm font-bold text-moss transition hover:bg-[#f8d873] disabled:cursor-not-allowed disabled:opacity-40">
        {copied ? <><Check size={16} /> ¡Copiado!</> : <><Copy size={16} /> Compartir lista</>}
      </button>
    </aside>
  )
}
