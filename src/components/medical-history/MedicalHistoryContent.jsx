'use client'

import { useMemo, useState } from 'react'
import { MedicalTimeline } from './MedicalTimeline'
import { NextAppointmentCard } from './NextAppointmentCard'
import { mockMedicalTimeline } from './medicalHistoryMockData'
import { getNextAppointment, matchesMedicalHistoryFilters, sortMedicalHistoryEntries } from './medicalHistoryUtils'

export function MedicalHistoryContent({ initialEntries = mockMedicalTimeline }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const nextAppointment = useMemo(() => getNextAppointment(initialEntries), [initialEntries])
  const visibleEntries = useMemo(() => {
    const filters = { type: typeFilter, status: statusFilter }
    const filteredEntries = initialEntries.filter((entry) => matchesMedicalHistoryFilters(entry, filters))
    return sortMedicalHistoryEntries(filteredEntries)
  }, [initialEntries, statusFilter, typeFilter])

  return (
    <>
      <NextAppointmentCard appointment={nextAppointment} />
      <MedicalTimeline
        entries={visibleEntries}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
      />
    </>
  )
}
