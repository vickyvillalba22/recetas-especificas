'use client'

const GENDER_OPTIONS = [
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero-no-decir', label: 'Prefiero no decir' },
]

const REGION_OPTIONS = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Ecuador',
  'España',
  'México',
  'Paraguay',
  'Perú',
  'Uruguay',
  'Venezuela',
  'Otro',
]

function getInputValue(value) {
  return value ?? ''
}

export function PersonalContextStep({ formData, onChange }) {
  return (
    <div className="space-y-6">

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Nombre o apodo
          <span className="mt-1 block text-xs font-normal text-ink/50 dark:text-cream/50">
            ¿Cómo querés que te llamemos?
          </span>
          <input
            className="field mt-2"
            type="text"
            value={getInputValue(formData.nombreApodo)}
            onChange={(event) => onChange({ nombreApodo: event.target.value || null })}
            placeholder="Ej. Sol"
            maxLength={60}
            autoComplete="nickname"
          />
        </label>

        <label className="block text-sm font-bold">
          Fecha de nacimiento
          <input
            className="field mt-2"
            type="date"
            value={getInputValue(formData.fechaNacimiento)}
            onChange={(event) => onChange({ fechaNacimiento: event.target.value || null })}
            max={new Date().toISOString().split('T')[0]}
          />
        </label>

        <label className="block text-sm font-bold">
          Género / sexo biológico
          <select
            className="field mt-2"
            value={getInputValue(formData.sexoBiologico)}
            onChange={(event) => onChange({ sexoBiologico: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold">
          País / región
          <select
            className="field mt-2"
            value={getInputValue(formData.paisRegion)}
            onChange={(event) => onChange({ paisRegion: event.target.value || null })}
          >
            <option value="">Seleccionar</option>
            {REGION_OPTIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
