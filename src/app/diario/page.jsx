'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { JournalSection } from '../../components/home/JournalSection'
import { Footer } from '../../components/home/Footer'
import { createJournalEntry, getJournalEntries } from '../../services/mockJournalService'

export default function JournalPage() {
  const router = useRouter()
  const [journalText, setJournalText] = useState('')
  const [journalEntries, setJournalEntries] = useState([])

  useEffect(() => {
    getJournalEntries().then(setJournalEntries)
  }, [])

  const saveJournalEntry = async (event) => {
    event.preventDefault()
    const text = journalText.trim()
    if (!text) return
    const entry = await createJournalEntry(text)
    setJournalEntries((current) => [entry, ...current])
    setJournalText('')
  }

  return <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream"><main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16"><button onClick={() => router.push('/')} className="mb-8 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft">← Volver al menú</button><JournalSection journalText={journalText} onJournalTextChange={(event) => setJournalText(event.target.value)} onSave={saveJournalEntry} journalEntries={journalEntries} /></main><Footer /></div>
}
