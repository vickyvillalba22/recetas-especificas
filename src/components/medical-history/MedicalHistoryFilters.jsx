import { Filter } from '../ui/icons'

const typeFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'appointments', label: 'Turnos' },
  { value: 'studies', label: 'Estudios' },
]

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'completed', label: 'Realizados' },
]

export function MedicalHistoryFilters({ typeFilter, statusFilter, onTypeChange, onStatusChange, className = '' }) {
  return (
    <section className={`rounded-3xl border border-ink/10 bg-white p-5 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-6 ${className}`} aria-label="Filtros de historia clínica">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage/60 text-moss dark:bg-moss/30 dark:text-sage">
          <Filter size={18} />
        </span>
        <div>
          <h2 className="text-sm font-bold">Filtrar registros</h2>
          <p className="text-xs text-ink/50 dark:text-cream/50">Encontrá rápidamente lo que necesitás.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <FilterGroup label="Tipo" options={typeFilters} value={typeFilter} onChange={onTypeChange} />
        <FilterGroup label="Estado" options={statusFilters} value={statusFilter} onChange={onStatusChange} />
      </div>
    </section>
  )
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-ink/50 dark:text-cream/50">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
                active
                  ? 'border-moss bg-moss text-white shadow-sm'
                  : 'border-ink/10 bg-cream text-ink/65 hover:border-moss/40 hover:bg-sage/40 dark:border-cream/10 dark:bg-ink dark:text-cream/65 dark:hover:bg-moss/20'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
