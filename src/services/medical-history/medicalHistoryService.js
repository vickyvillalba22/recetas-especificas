'use client'

import { addDoc, deleteDoc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import {
  firebaseTimestampToDate,
  firebaseTimestampToISOString,
  getCurrentUserId,
  getUserCollection,
  getUserDocument,
  runFirestoreOperation,
} from '../firestoreService'
import {
  MEDICAL_RECORD_COLLECTION,
  MEDICAL_RECORD_TYPES,
  normalizeMedicalRecord,
  STUDY_STATUSES,
  validateMedicalRecord,
} from './medicalHistoryModel'

const editableFields = [
  'type',
  'date',
  'time',
  'specialty',
  'professional',
  'reason',
  'modality',
  'location',
  'status',
  'notes',
  'studyType',
  'result',
]

function normalizeDate(value) {
  const date = firebaseTimestampToDate(value)
  if (date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
  }

  if (typeof value === 'string') return value.slice(0, 10)
  return null
}

function prepareMedicalRecordData(data) {
  const prepared = {
    ...data,
    ...(data?.type === MEDICAL_RECORD_TYPES.STUDY && !data.status
      ? { status: STUDY_STATUSES.COMPLETED }
      : {}),
  }

  const validation = validateMedicalRecord(prepared)
  if (!validation.valid) {
    const error = new Error('Revisá los datos del registro médico.')
    error.code = 'validation/invalid-medical-record'
    error.details = validation.errors
    throw error
  }

  return editableFields.reduce((payload, field) => {
    if (prepared[field] !== undefined) payload[field] = prepared[field]
    return payload
  }, {})
}

export function mapMedicalRecordSnapshot(snapshot) {
  const data = snapshot.data()

  return normalizeMedicalRecord({
    id: snapshot.id,
    userId: data.userId || null,
    type: data.type || null,
    date: normalizeDate(data.date),
    time: data.time || '',
    specialty: data.specialty || '',
    professional: data.professional || '',
    reason: data.reason || '',
    modality: data.modality || '',
    location: data.location || '',
    status: data.status || null,
    notes: data.notes || '',
    studyType: data.studyType || '',
    result: data.result || '',
    createdAt: firebaseTimestampToISOString(data.createdAt),
    updatedAt: firebaseTimestampToISOString(data.updatedAt),
  })
}

export async function getMedicalRecords() {
  return runFirestoreOperation(async () => {
    const userId = getCurrentUserId()
    const snapshot = await getDocs(getUserCollection(MEDICAL_RECORD_COLLECTION))

    return snapshot.docs.map(mapMedicalRecordSnapshot)
      .map((record) => ({ ...record, userId: record.userId || userId }))
  }, 'No se pudieron cargar los registros médicos.')
}

export async function createMedicalRecord(data) {
  return runFirestoreOperation(async () => {
    const userId = getCurrentUserId()
    const payload = prepareMedicalRecordData(data)
    const recordRef = await addDoc(getUserCollection(MEDICAL_RECORD_COLLECTION), {
      ...payload,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return mapMedicalRecordSnapshot(await getDoc(recordRef))
  }, 'No se pudo guardar el registro médico.')
}

export async function updateMedicalRecord({ id, data }) {
  return runFirestoreOperation(async () => {
    if (!id) throw new Error('Falta el identificador del registro médico.')

    const recordRef = getUserDocument(MEDICAL_RECORD_COLLECTION, id)
    const currentSnapshot = await getDoc(recordRef)
    if (!currentSnapshot.exists()) throw new Error('El registro médico no existe.')

    const mergedData = {
      ...currentSnapshot.data(),
      ...data,
      type: data?.type || currentSnapshot.data().type,
    }
    const payload = prepareMedicalRecordData(mergedData)

    await updateDoc(recordRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    })

    return mapMedicalRecordSnapshot(await getDoc(recordRef))
  }, 'No se pudo actualizar el registro médico.')
}

export async function deleteMedicalRecord(id) {
  return runFirestoreOperation(async () => {
    if (!id) throw new Error('Falta el identificador del registro médico.')
    await deleteDoc(getUserDocument(MEDICAL_RECORD_COLLECTION, id))
  }, 'No se pudo eliminar el registro médico.')
}
