'use client'

const SIBO_TYPE_OPTIONS = [
  { value: 'hidrogeno', label: 'SIBO de Hidrógeno (H₂)' },
  { value: 'metano-imo', label: 'SIBO de Metano / IMO (CH₄)' },
  { value: 'sulfuro-hidrogeno', label: 'SIBO de Sulfuro de Hidrógeno (H₂S)' },
  { value: 'no-se-mixto-no-aplica', label: 'No lo sé / Mixto / No aplica' },
  { value: 'otro', label: 'Otro' },
]

const PROTOCOL_PHASE_OPTIONS = [
  {
    value: 'fase-1-eliminacion',
    label: 'Fase 1: Eliminación / Baja en FODMAPs estricta',
  },
  {
    value: 'fase-2-reintroduccion',
    label: 'Fase 2: Reintroducción',
  },
  {
    value: 'fase-3-mantenimiento',
    label: 'Fase 3: Mantenimiento / Personalizada',
  },
  {
    value: 'sin-fase-alimentacion-general',
    label: 'Sin fase definida / Alimentación general',
  },
  { value: 'otro', label: 'Otro' },
]

const SYMPTOM_OPTIONS = [
  { value: 'hinchazon-distension', label: 'Hinchazón / distensión' },
  { value: 'gases', label: 'Gases' },
  { value: 'dolor-abdominal', label: 'Dolor abdominal' },
  { value: 'diarrea', label: 'Diarrea' },
  { value: 'estrenimiento', label: 'Estreñimiento' },
  { value: 'fatiga-niebla-mental', label: 'Fatiga / niebla mental' },
  { value: 'otro', label: 'Otro' },
]

function getValue(value) {
  return value ?? ''
}

function toggleValue(values, value) {
  const currentValues = Array.isArray(values) ? values : []

  return currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value]
}

function SymptomCheckboxes({ values, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">Síntomas predominantes</legend>
      <p className="mt-1 text-xs font-normal text-ink/50 dark:text-cream/50">
        Podés seleccionar más de una opción.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {SYMPTOM_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 p-3 text-sm font-normal transition hover:border-moss/50 dark:border-cream/10"
          >
            <input
              className="mt-0.5 h-4 w-4 accent-moss"
              type="checkbox"
              checked={Array.isArray(values) && values.includes(option.value)}
              onChange={() => onChange(toggleValue(values, option.value))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function CurrentPathologyStep({ formData, onChange }) {
  const symptoms = Array.isArray(formData.sintomasPredominantes)
    ? formData.sintomasPredominantes
    : []

  return (
    <div className="space-y-8">

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Tipo de SIBO (si aplica)
          <select
            className="field mt-2"
            value={getValue(formData.tipoSibo)}
            onChange={(event) => onChange({ tipoSibo: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {SIBO_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold">
          Fase actual del protocolo nutricional
          <select
            className="field mt-2"
            value={getValue(formData.faseProtocoloNutricional)}
            onChange={(event) => onChange({ faseProtocoloNutricional: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {PROTOCOL_PHASE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {formData.tipoSibo === 'otro' && (
        <label className="block text-sm font-bold">
          Especificá otro tipo de SIBO
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.tipoSiboOtro)}
            onChange={(event) => onChange({ tipoSiboOtro: event.target.value || null })}
            placeholder="Escribí el tipo"
            maxLength={120}
          />
        </label>
      )}

      {formData.faseProtocoloNutricional === 'otro' && (
        <label className="block text-sm font-bold">
          Especificá otra fase
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.faseProtocoloNutricionalOtra)}
            onChange={(event) => onChange({ faseProtocoloNutricionalOtra: event.target.value || null })}
            placeholder="Escribí la fase"
            maxLength={120}
          />
        </label>
      )}

      <SymptomCheckboxes
        values={symptoms}
        onChange={(nextValues) => onChange({ sintomasPredominantes: nextValues })}
      />

      {symptoms.includes('otro') && (
        <label className="block text-sm font-bold">
          Especificá otro síntoma
          <input
            className="field mt-2"
            type="text"
            value={getValue(formData.sintomasPredominantesOtro)}
            onChange={(event) => onChange({ sintomasPredominantesOtro: event.target.value || null })}
            placeholder="Escribí el síntoma"
            maxLength={120}
          />
        </label>
      )}
    </div>
  )
}
