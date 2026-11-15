'use client'

const RESTRICTION_OPTIONS = [
  { value: 'sin-gluten-tacc', label: 'Sin Gluten / TACC' },
  { value: 'sin-lactosa', label: 'Sin Lactosa' },
  { value: 'sin-lacteos-proteina-leche', label: 'Sin Lácteos / Proteína de leche' },
  { value: 'sin-fructosa', label: 'Sin Fructosa' },
  { value: 'baja-en-histamina', label: 'Baja en Histamina' },
  { value: 'sin-frutos-secos', label: 'Sin Frutos Secos' },
  { value: 'sin-huevo', label: 'Sin Huevo' },
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'otra', label: 'Otra' },
]

const FOOD_PREFERENCE_OPTIONS = [
  { value: 'omnivora', label: 'Omnívora' },
  { value: 'vegetariana', label: 'Vegetariana' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'pescetariana', label: 'Pescetariana' },
  { value: 'otro', label: 'Otro' },
]

function getValue(value) {
  return value ?? ''
}

function toggleRestriction(values, value) {
  const currentValues = Array.isArray(values) ? values : []

  if (value === 'ninguna') {
    return currentValues.includes(value) ? [] : [value]
  }

  return currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues.filter((currentValue) => currentValue !== 'ninguna'), value]
}

export function DietaryPreferencesStep({ formData, onChange }) {
  const restrictions = Array.isArray(formData.restriccionesAlimentarias)
    ? formData.restriccionesAlimentarias
    : []

  return (
    <div className="space-y-8">

      <fieldset>
        <legend className="text-sm font-bold">Otras restricciones o alergias</legend>
        <p className="mt-1 text-xs font-normal text-ink/50 dark:text-cream/50">
          Podés seleccionar más de una opción.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {RESTRICTION_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 p-3 text-sm font-normal transition hover:border-moss/50 dark:border-cream/10"
            >
              <input
                className="mt-0.5 h-4 w-4 accent-moss"
                type="checkbox"
                checked={restrictions.includes(option.value)}
                onChange={() => onChange({ restriccionesAlimentarias: toggleRestriction(restrictions, option.value) })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {restrictions.includes('otra') && (
        <label className="block text-sm font-bold">
          Especificá otra restricción o alergia
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.restriccionesAlimentariasOtra)}
            onChange={(event) => onChange({ restriccionesAlimentariasOtra: event.target.value || null })}
            placeholder="Escribí la restricción o alergia"
            maxLength={120}
          />
        </label>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Preferencia alimentaria general
          <select
            className="field mt-2"
            value={getValue(formData.preferenciaAlimentaria)}
            onChange={(event) => onChange({ preferenciaAlimentaria: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {FOOD_PREFERENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {formData.preferenciaAlimentaria === 'otro' && (
          <label className="block text-sm font-bold">
            Especificá tu preferencia
            <input
              className="field mt-2"
              type="text"
              value={getValue(formData.preferenciaAlimentariaOtra)}
              onChange={(event) => onChange({ preferenciaAlimentariaOtra: event.target.value || null })}
              placeholder="Escribí tu preferencia"
              maxLength={120}
            />
          </label>
        )}
      </div>

      <label className="block text-sm font-bold">
        Ingredientes a evitar / No me gustan
        <span className="mt-1 block text-xs font-normal text-ink/50 dark:text-cream/50">
          Podés separarlos con comas. Ejemplo: ajo, cebolla, brócoli, picante.
        </span>
        <input
          className="field mt-2"
          type="text"
          value={getValue(formData.ingredientesAEvitar)}
          onChange={(event) => onChange({ ingredientesAEvitar: event.target.value || null })}
          placeholder="Escribí los ingredientes"
          maxLength={500}
        />
      </label>
    </div>
  )
}
