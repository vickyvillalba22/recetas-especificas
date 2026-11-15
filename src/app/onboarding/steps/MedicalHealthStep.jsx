'use client'

const DIAGNOSIS_OPTIONS = [
  { value: 'confirmado', label: 'Sí, tengo un diagnóstico confirmado' },
  { value: 'en-estudio', label: 'Estoy en proceso de estudio' },
  { value: 'sospecha-prevencion', label: 'No, solo sospecha o prevención' },
  { value: 'otro', label: 'Otro' },
]

const PROFESSIONAL_OPTIONS = [
  { value: 'gastroenterologo', label: 'Gastroenterólogo' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'ambos', label: 'Ambos' },
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'otro', label: 'Otro' },
]

const DIGESTIVE_CONDITION_OPTIONS = [
  { value: 'sii', label: 'Síndrome de Intestino Irritable (SII)' },
  { value: 'gastritis', label: 'Gastritis' },
  { value: 'reflujo', label: 'Reflujo gastroesofágico' },
  { value: 'celiaquia', label: 'Celiaquía' },
  { value: 'eii', label: 'Enfermedad Inflamatoria Intestinal' },
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'otra', label: 'Otra' },
]

const MEDICATION_OPTIONS = [
  { value: 'antibioticos-rifaximina', label: 'Antibióticos / Rifaximina' },
  { value: 'probióticos', label: 'Probióticos' },
  { value: 'enzimas-digestivas', label: 'Enzimas digestivas' },
  { value: 'procinéticos', label: 'Procinéticos' },
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'otro', label: 'Otro' },
]

const ACTIVITY_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario' },
  { value: 'ligero', label: 'Ligero' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'activo', label: 'Activo' },
  { value: 'otro', label: 'Otro' },
]

function getValue(value) {
  return value ?? ''
}

function toggleMultipleValue(values, value, exclusiveValue) {
  const currentValues = Array.isArray(values) ? values : []

  if (value === exclusiveValue) {
    return currentValues.includes(value) ? [] : [value]
  }

  return currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues.filter((currentValue) => currentValue !== exclusiveValue), value]
}

function CheckboxGroup({ title, options, values, exclusiveValue, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{title}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 p-3 text-sm font-normal transition hover:border-moss/50 dark:border-cream/10"
          >
            <input
              className="mt-0.5 h-4 w-4 accent-moss"
              type="checkbox"
              checked={Array.isArray(values) && values.includes(option.value)}
              onChange={() => onChange(toggleMultipleValue(values, option.value, exclusiveValue))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function MedicalHealthStep({ formData, onChange }) {
  const conditions = Array.isArray(formData.condicionesDigestivas)
    ? formData.condicionesDigestivas
    : []
  const medication = Array.isArray(formData.medicacionSuplementacion)
    ? formData.medicacionSuplementacion
    : []

  return (
    <div className="space-y-8">

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          ¿Contás con diagnóstico médico confirmado?
          <select
            className="field mt-2"
            value={getValue(formData.diagnosticoMedico)}
            onChange={(event) => onChange({ diagnosticoMedico: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {DIAGNOSIS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold">
          ¿Estás bajo seguimiento profesional?
          <select
            className="field mt-2"
            value={getValue(formData.seguimientoProfesional)}
            onChange={(event) => onChange({ seguimientoProfesional: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {PROFESSIONAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(formData.diagnosticoMedico === 'otro' || formData.seguimientoProfesional === 'otro') && (
        <label className="block text-sm font-bold">
          Especificá tu respuesta
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.contextoMedicoOtro)}
            onChange={(event) => onChange({ contextoMedicoOtro: event.target.value || null })}
            placeholder="Escribí tu respuesta"
            maxLength={120}
          />
        </label>
      )}

      <CheckboxGroup
        title="Condiciones digestivas asociadas"
        options={DIGESTIVE_CONDITION_OPTIONS}
        values={conditions}
        exclusiveValue="ninguna"
        onChange={(nextValues) => onChange({ condicionesDigestivas: nextValues })}
      />

      {conditions.includes('otra') && (
        <label className="block text-sm font-bold">
          Especificá otra condición
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.condicionesDigestivasOtra)}
            onChange={(event) => onChange({ condicionesDigestivasOtra: event.target.value || null })}
            placeholder="Escribí la condición"
            maxLength={120}
          />
        </label>
      )}

      <div>
        <CheckboxGroup
          title="Medicación o suplementación actual"
          options={MEDICATION_OPTIONS}
          values={medication}
          exclusiveValue="ninguno"
          onChange={(nextValues) => onChange({ medicacionSuplementacion: nextValues })}
        />
        <p className="mt-2 text-xs font-normal text-ink/50 dark:text-cream/50">
          Podés seleccionar más de una opción.
        </p>
      </div>

      {medication.includes('otro') && (
        <label className="block text-sm font-bold">
          Especificá otra medicación o suplementación
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.medicacionSuplementacionOtra)}
            onChange={(event) => onChange({ medicacionSuplementacionOtra: event.target.value || null })}
            placeholder="Escribí el nombre"
            maxLength={120}
          />
        </label>
      )}

      <label className="block text-sm font-bold">
        Nivel de actividad física
        <select
          className="field mt-2"
          value={getValue(formData.nivelActividadFisica)}
          onChange={(event) => onChange({ nivelActividadFisica: event.target.value || null })}
        >
          <option value="">Seleccionar</option>
          {ACTIVITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
