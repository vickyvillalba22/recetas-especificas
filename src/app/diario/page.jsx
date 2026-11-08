'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { JournalSection } from '../../components/home/JournalSection'
import { Footer } from '../../components/home/Footer'
import { createJournalEntry, deleteJournalEntry, getJournalEntries, updateJournalEntry } from '../../services/journalService'

export default function JournalPage() {
  const router = useRouter()
  const [journalText, setJournalText] = useState('')
  const [journalEntries, setJournalEntries] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getJournalEntries()
      .then(setJournalEntries)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [])

  const saveJournalEntry = async (event) => {
    event.preventDefault()
    const text = journalText.trim()
    if (!text) return
    setSaving(true)
    setError('')
    try {
      const entry = editingEntry
        ? await updateJournalEntry({ id: editingEntry.id, text })
        : await createJournalEntry(text)
      setJournalEntries((current) => editingEntry ? current.map((item) => item.id === entry.id ? entry : item) : [entry, ...current])
      setEditingEntry(null)
      setJournalText('')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const editJournalEntry = (entry) => {
    setEditingEntry(entry)
    setJournalText(entry.text)
    setError('')
  }

  const cancelEdit = () => {
    setEditingEntry(null)
    setJournalText('')
    setError('')
  }

  const removeJournalEntry = async (entry) => {
    if (!window.confirm('¿Eliminar esta entrada del diario?')) return
    setError('')
    try {
      await deleteJournalEntry({ id: entry.id })
      setJournalEntries((current) => current.filter((item) => item.id !== entry.id))
      if (editingEntry?.id === entry.id) cancelEdit()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream"><main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16"><button onClick={() => router.push('/')} className="mb-8 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft">← Volver al menú</button><JournalSection journalText={journalText} onJournalTextChange={(event) => setJournalText(event.target.value)} onSave={saveJournalEntry} onEdit={editJournalEntry} onDelete={removeJournalEntry} onCancelEdit={cancelEdit} editingEntry={editingEntry} loading={loading} saving={saving} error={error} journalEntries={journalEntries} /></main><Footer /></div>
}
