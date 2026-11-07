let entries = []

function formatJournalDate(date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function getJournalEntries() {
  return entries.map((entry) => ({ ...entry }))
}

export async function createJournalEntry(text) {
  const entry = {
    id: `mock-entry-${Date.now()}`,
    text,
    date: formatJournalDate(new Date()),
  }
  entries = [entry, ...entries]
  return { ...entry }
}
