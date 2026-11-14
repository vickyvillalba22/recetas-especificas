"use client";

import { useEffect } from "react";
import { Download, X } from "../ui/icons";

// Journal-specific PDF export dialog.
export function JournalExportModal({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClose,
  onSubmit,
  entryCount,
  loading,
  error,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

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
        aria-labelledby="journal-export-title"
        className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-4 inline-flex rounded-full bg-sage p-3 text-moss dark:bg-moss/30 dark:text-sage">
              <Download size={20} />
            </span>
            <h2 id="journal-export-title" className="font-display text-2xl">
              Descargar diario
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="grid size-9 place-items-center rounded-full text-ink/50 transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/50 dark:hover:bg-ink"
            aria-label="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
          Elegí el período que querés incluir en el archivo PDF.
        </p>

        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Desde
              <input
                type="date"
                value={fromDate}
                onChange={onFromDateChange}
                max={toDate || undefined}
                disabled={loading}
                required
                className="field mt-2"
              />
            </label>
            <label className="text-sm font-semibold">
              Hasta
              <input
                type="date"
                value={toDate}
                onChange={onToDateChange}
                min={fromDate || undefined}
                disabled={loading}
                required
                className="field mt-2"
              />
            </label>
          </div>

          <p className="mt-4 text-xs text-ink/50 dark:text-cream/50">
            {entryCount === 1
              ? "Se incluirá 1 entrada."
              : `Se incluirán ${entryCount} entradas.`}
          </p>

          {error && (
            <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-moss px-4 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generando..." : "Descargar PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
