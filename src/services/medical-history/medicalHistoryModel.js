export const MEDICAL_RECORD_COLLECTION = 'medicalRecords'

export const MEDICAL_RECORD_TYPES = Object.freeze({
  APPOINTMENT: 'appointment',
  STUDY: 'study',
})

export const APPOINTMENT_STATUSES = Object.freeze({
  PENDING: 'pending',
  ATTENDED: 'attended',
  CANCELLED: 'cancelled',
})

export const STUDY_STATUSES = Object.freeze({
  COMPLETED: 'completed',
})

export const MEDICAL_RECORD_STATUSES = Object.freeze({
  ...APPOINTMENT_STATUSES,
  ...STUDY_STATUSES,
})

export const MEDICAL_RECORD_SCHEMA = Object.freeze({
  common: {
    required: ['type', 'date'],
    optional: ['id', 'createdAt', 'updatedAt'],
  },
  appointment: {
    required: ['time', 'specialty', 'professional', 'status'],
    optional: ['reason', 'modality', 'location', 'notes'],
  },
  study: {
    required: ['studyType', 'status'],
    optional: ['result', 'notes'],
  },
})

const allowedTypes = Object.values(MEDICAL_RECORD_TYPES)
const allowedStatuses = Object.values(MEDICAL_RECORD_STATUSES)

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

export function validateMedicalRecord(record) {
  const errors = {}

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: { record: 'El registro médico es obligatorio.' } }
  }

  if (!allowedTypes.includes(record.type)) {
    errors.type = 'El tipo de registro médico no es válido.'
  }

  if (!isPresent(record.date)) {
    errors.date = 'La fecha es obligatoria.'
  }

  const schema = MEDICAL_RECORD_SCHEMA[record.type]
  if (!schema) {
    return { valid: false, errors }
  }

  for (const field of [...schema.required]) {
    if (!isPresent(record[field])) {
      errors[field] = 'Este campo es obligatorio.'
    }
  }

  if (record.status && !allowedStatuses.includes(record.status)) {
    errors.status = 'El estado del registro médico no es válido.'
  }

  if (record.type === MEDICAL_RECORD_TYPES.APPOINTMENT && record.status === STUDY_STATUSES.COMPLETED) {
    errors.status = 'El estado completed solo corresponde a estudios.'
  }

  if (record.type === MEDICAL_RECORD_TYPES.STUDY && Object.values(APPOINTMENT_STATUSES).includes(record.status)) {
    errors.status = 'El estado del estudio no es válido.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function normalizeMedicalRecord(record) {
  if (!record) return null

  return {
    ...record,
    type: record.type || null,
    date: record.date || null,
    status: record.status || null,
    notes: record.notes || '',
  }
}
