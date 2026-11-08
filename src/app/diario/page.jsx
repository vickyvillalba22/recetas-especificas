"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JournalSection } from "../../components/home/JournalSection";
import { Footer } from "../../components/home/Footer";
import { X } from "../../components/ui/icons";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from "../../services/journalService";

export default function JournalPage() {
  const router = useRouter();
  const [journalText, setJournalText] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getJournalEntries()
      .then(setJournalEntries)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const saveJournalEntry = async (event) => {
    event.preventDefault();
    const text = journalText.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    try {
      const entry = editingEntry
        ? await updateJournalEntry({ id: editingEntry.id, text })
        : await createJournalEntry(text);
      setJournalEntries((current) =>
        editingEntry
          ? current.map((item) => (item.id === entry.id ? entry : item))
          : [entry, ...current],
      );
      setEditingEntry(null);
      setJournalText("");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const editJournalEntry = (entry) => {
    setEditingEntry(entry);
    setJournalText(entry.text);
    setError("");
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setJournalText("");
    setError("");
  };

  const requestDeleteJournalEntry = (entry) => {
    setEntryToDelete(entry);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setEntryToDelete(null);
    setDeleteError("");
  };

  const removeJournalEntry = async () => {
    if (!entryToDelete) return;
    const entry = entryToDelete;
    setDeleting(true);
    setDeleteError("");
    setError("");
    try {
      await deleteJournalEntry({ id: entry.id });
      setJournalEntries((current) =>
        current.filter((item) => item.id !== entry.id),
      );
      if (editingEntry?.id === entry.id) cancelEdit();
      setEntryToDelete(null);
    } catch (error) {
      setDeleteError(error.message);
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
        <button
          onClick={() => router.push("/")}
          className="mb-8 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft"
        >
          ← Volver al menú
        </button>
        <JournalSection
          journalText={journalText}
          onJournalTextChange={(event) => setJournalText(event.target.value)}
          onSave={saveJournalEntry}
          onEdit={editJournalEntry}
          onDelete={requestDeleteJournalEntry}
          onCancelEdit={cancelEdit}
          editingEntry={editingEntry}
          loading={loading}
          saving={saving}
          error={error}
          journalEntries={journalEntries}
        />
      </main>
      <Footer />
      {entryToDelete && (
        <DeleteJournalEntryModal
          onClose={closeDeleteModal}
          onConfirm={removeJournalEntry}
          loading={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
}

function DeleteJournalEntryModal({ onClose, onConfirm, loading, error }) {
  return (
    <div
      onClick={(event) =>
        event.target === event.currentTarget && !loading && onClose()
      }
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-journal-entry-title"
        className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"
      >
        <span className="mb-4 inline-flex rounded-full bg-coral/10 p-3 text-coral">
          <X size={20} />
        </span>
        <h2 id="delete-journal-entry-title" className="font-display text-2xl">
          ¿Eliminar entrada?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
          Esta acción no se puede deshacer. Se eliminará esta entrada del diario.
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            type="button"
            className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            type="button"
            className="flex-1 rounded-full bg-coral px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
