function getEntryDate(entry) {
  return new Date(`${entry.date}T${entry.time || '12:00'}:00`)
}

const typeMap = {
  appointments: 'appointment',
  studies: 'study',
}

export function isUpcomingAppointment(entry, now = new Date()) {
  return entry.type === 'appointment'
    && entry.status === 'pending'
    && getEntryDate(entry).getTime() >= now.getTime()
}

export function matchesMedicalHistoryFilters(entry, { type = 'all', status = 'all' } = {}, now = new Date()) {
  const matchesType = type === 'all' || entry.type === typeMap[type]
  if (!matchesType) return false

  if (status === 'all') return true
  if (status === 'upcoming') return isUpcomingAppointment(entry, now)

  return !isUpcomingAppointment(entry, now)
}

export function sortMedicalHistoryEntries(entries, now = new Date()) {
  return [...entries].sort((first, second) => {
    const firstUpcoming = isUpcomingAppointment(first, now)
    const secondUpcoming = isUpcomingAppointment(second, now)

    if (firstUpcoming !== secondUpcoming) return firstUpcoming ? -1 : 1
    return getEntryDate(second).getTime() - getEntryDate(first).getTime()
  })
}

export function getNextAppointment(entries, now = new Date()) {
  return sortMedicalHistoryEntries(entries, now).find((entry) => isUpcomingAppointment(entry, now)) || null
}
