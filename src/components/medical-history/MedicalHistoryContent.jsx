'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MedicalHistoryActions } from './MedicalHistoryActions'
import { MedicalTimeline } from './MedicalTimeline'
import { NextAppointmentCard } from './NextAppointmentCard'
import { AppointmentModal } from './AppointmentModal'
import { DeleteMedicalRecordModal } from './DeleteMedicalRecordModal'
import { StudyModal } from './StudyModal'
import { getNextAppointment, matchesMedicalHistoryFilters, sortMedicalHistoryEntries } from './medicalHistoryUtils'
import { createMedicalRecord, deleteMedicalRecord, getMedicalRecords, updateMedicalRecord } from '../../services/medical-history/medicalHistoryService'
import { MEDICAL_RECORD_TYPES } from '../../services/medical-history/medicalHistoryModel'

export function MedicalHistoryContent() {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [modalType, setModalType] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

  useEffect(() => {
    let active = true

    async function loadMedicalRecords() {
      if (authLoading) return

      if (!user) {
        if (active) {
          setEntries([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError('')

      try {
        const records = await getMedicalRecords()
        if (active) setEntries(records)
      } catch (loadError) {
        if (active) {
          setEntries([])
          setError(loadError.message || 'No pudimos cargar tus registros médicos.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMedicalRecords()

    return () => {
      active = false
    }
  }, [authLoading, retryToken, user])

  const nextAppointment = useMemo(() => getNextAppointment(entries), [entries])
  const visibleEntries = useMemo(() => {
    const filters = { type: typeFilter, status: statusFilter }
    const filteredEntries = entries.filter((entry) => matchesMedicalHistoryFilters(entry, filters))
    return sortMedicalHistoryEntries(filteredEntries)
  }, [entries, statusFilter, typeFilter])

  function openCreateModal(type) {
    setEditingRecord(null)
    setSaveError('')
    setSuccessMessage('')
    setModalType(type)
  }

  function retryLoadingRecords() {
    setError('')
    setRetryToken((currentToken) => currentToken + 1)
  }

  function openEditModal(record) {
    setEditingRecord(record)
    setSaveError('')
    setSuccessMessage('')
    setModalType(record.type)
  }

  function closeModal() {
    if (saving) return
    setModalType(null)
    setEditingRecord(null)
    setSaveError('')
  }

  async function handleSave(formData) {
    const data = Object.fromEntries(formData.entries())
    data.type = modalType
    setSaving(true)
    setSaveError('')
    setSuccessMessage('')

    try {
      const savedRecord = editingRecord
        ? await updateMedicalRecord({ id: editingRecord.id, data })
        : await createMedicalRecord(data)

      setEntries((currentEntries) => (
        editingRecord
          ? currentEntries.map((entry) => entry.id === savedRecord.id ? savedRecord : entry)
          : [...currentEntries, savedRecord]
      ))
      setSuccessMessage(editingRecord ? 'El registro médico se actualizó correctamente.' : 'El registro médico se guardó correctamente.')
      setModalType(null)
      setEditingRecord(null)
    } catch (saveOperationError) {
      setSaveError(saveOperationError.message || 'No pudimos guardar el registro médico.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(record, status) {
    setUpdatingStatusId(record.id)
    setError('')
    setSuccessMessage('')

    try {
      const updatedRecord = await updateMedicalRecord({
        id: record.id,
        data: { ...record, status },
      })
      setEntries((currentEntries) => currentEntries.map((entry) => entry.id === updatedRecord.id ? updatedRecord : entry))
      setSuccessMessage('El estado del turno se actualizó correctamente.')
    } catch (statusError) {
      setError(statusError.message || 'No pudimos actualizar el estado del turno.')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  async function handleDelete(record) {
    setRecordToDelete(record)
  }

  async function confirmDelete() {
    if (!recordToDelete) return
    const record = recordToDelete
    const label = record.type === MEDICAL_RECORD_TYPES.APPOINTMENT ? 'turno' : 'estudio'

    setDeletingId(record.id)
    setError('')
    setSuccessMessage('')

    try {
      await deleteMedicalRecord(record.id)
      setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== record.id))
      setSuccessMessage(`El ${label} se eliminó correctamente.`)
      setRecordToDelete(null)
    } catch (deleteError) {
      setError(deleteError.message || `No pudimos eliminar el ${label}.`)
    } finally {
      setDeletingId(null)
    }
  }

  const actionButtons = (
    <MedicalHistoryActions
      onCreateAppointment={() => openCreateModal(MEDICAL_RECORD_TYPES.APPOINTMENT)}
      onCreateStudy={() => openCreateModal(MEDICAL_RECORD_TYPES.STUDY)}
    />
  )
  const modals = (
    <>
      <DeleteMedicalRecordModal
        record={recordToDelete}
        onClose={() => !deletingId && setRecordToDelete(null)}
        onConfirm={confirmDelete}
        loading={Boolean(deletingId)}
      />
      {modalType === MEDICAL_RECORD_TYPES.APPOINTMENT && (
        <AppointmentModal
          key={`appointment-${editingRecord?.id || 'new'}`}
          appointment={editingRecord}
          onClose={closeModal}
          onSubmit={handleSave}
          loading={saving}
          error={saveError}
        />
      )}
      {modalType === MEDICAL_RECORD_TYPES.STUDY && (
        <StudyModal
          key={`study-${editingRecord?.id || 'new'}`}
          study={editingRecord}
          onClose={closeModal}
          onSubmit={handleSave}
          loading={saving}
          error={saveError}
        />
      )}
    </>
  )

  if (loading) {
    return (
      <>
        {actionButtons}
        {modals}
        <MedicalHistoryLoadingState />
      </>
    )
  }

  if (error) {
    return (
      <>
        {actionButtons}
        {modals}
        <div className="mt-8 rounded-3xl border border-coral/20 bg-coral/10 p-6 text-sm text-coral">
          <p>{error}</p>
          <button type="button" onClick={retryLoadingRecords} className="mt-4 rounded-full bg-coral px-4 py-2 text-xs font-bold text-white transition hover:opacity-90">
            Reintentar
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {actionButtons}
      {successMessage && <p className="mt-4 rounded-xl bg-moss/10 px-4 py-3 text-sm text-moss dark:bg-moss/20 dark:text-sage" role="status">{successMessage}</p>}
      {modals}
      <NextAppointmentCard appointment={nextAppointment} onEdit={openEditModal} />
      <MedicalTimeline
        entries={visibleEntries}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onEdit={openEditModal}
        onStatusChangeRecord={handleStatusChange}
        onDelete={handleDelete}
        deletingId={deletingId}
        updatingStatusId={updatingStatusId}
        emptyMessage={entries.length === 0 ? 'Todavía no tenés registros médicos.' : 'No hay registros que coincidan con estos filtros.'}
      />
    </>
  )
}

function MedicalHistoryLoadingState() {
  return (
    <div className="mt-8 space-y-5" aria-label="Cargando historia clínica" aria-busy="true">
      <div className="h-32 animate-pulse rounded-3xl bg-ink/10 dark:bg-cream/10" />
      <div className="h-8 w-56 animate-pulse rounded-xl bg-ink/10 dark:bg-cream/10" />
      <div className="h-48 animate-pulse rounded-3xl bg-ink/10 dark:bg-cream/10" />
    </div>
  )
}
