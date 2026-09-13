import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JournalSection } from '../components/home/JournalSection'
import { Footer } from '../components/home/Footer'

function readJournalEntries() {
  try { return JSON.parse(localStorage.getItem('sibo-journal') || '[]') } catch { return [] }
}

function formatJournalDate(date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function JournalPage() {
  const navigate = useNavigate()
  const [journalText, setJournalText] = useState('')
  const [journalEntries, setJournalEntries] = useState(readJournalEntries)

  const saveJournalEntry = (event) => {
    event.preventDefault()
    const text = journalText.trim()
    if (!text) return
    const entries = [{ id: Date.now(), text, date: formatJournalDate(new Date()) }, ...journalEntries]
    setJournalEntries(entries)
    setJournalText('')
    localStorage.setItem('sibo-journal', JSON.stringify(entries))
  }

  return <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream"><main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16"><button onClick={() => navigate('/')} className="mb-8 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft">← Volver al menú</button><JournalSection journalText={journalText} onJournalTextChange={(event) => setJournalText(event.target.value)} onSave={saveJournalEntry} journalEntries={journalEntries} /></main><Footer /></div>
}
