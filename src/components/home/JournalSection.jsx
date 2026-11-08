import { BookHeart, PencilEdit, Trash } from "../ui/icons";

export function JournalSection({
  journalText,
  onJournalTextChange,
  onSave,
  onEdit,
  onDelete,
  onCancelEdit,
  editingEntry,
  loading,
  saving,
  error,
  journalEntries,
}) {
  return (
    <section
      id="diario"
      className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage">
            <BookHeart size={14} /> Tu espacio personal
          </span>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            Diario de
            <br />
            <em className="font-normal text-coral">cómo te sientes.</em>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60 dark:text-cream/60">
            Registrá síntomas, energía o cualquier detalle que quieras recordar.
            Es solo para vos.
          </p>
          <form onSubmit={onSave} className="mt-6">
            <textarea
              value={journalText}
              onChange={onJournalTextChange}
              className="field min-h-32 resize-y"
              placeholder="¿Cómo te sentiste hoy?"
              aria-label="Nueva entrada del diario"
              disabled={saving}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                disabled={saving}
                className="rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Guardando..."
                  : editingEntry
                    ? "Actualizar entrada"
                    : "Guardar entrada"}
              </button>
              {editingEntry && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={saving}
                  className="rounded-full border border-ink/15 px-5 py-3.5 text-sm font-bold text-ink/70 dark:border-cream/15 dark:text-cream/70"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
          {error && (
            <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">
              {error}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-cream p-5 dark:bg-ink sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-xl">Tus registros</h3>
            <span className="text-xs font-bold text-ink/40 dark:text-cream/40">
              {journalEntries.length}{" "}
              {journalEntries.length === 1 ? "entrada" : "entradas"}
            </span>
          </div>
          {loading ? (
            <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15">
              <p className="text-sm text-ink/50 dark:text-cream/50">
                Cargando tus registros...
              </p>
            </div>
          ) : journalEntries.length ? (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {journalEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="flex items-stretch gap-4 rounded-xl border border-ink/10 bg-white p-4 dark:border-cream/10 dark:bg-ink-soft"
                >
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/75 dark:text-cream/75">
                      {entry.text}
                    </p>
                  </div>
                  <aside className="flex w-28 shrink-0 flex-col items-end border-l border-ink/10 pl-3 text-right dark:border-cream/10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="grid size-8 place-items-center rounded-full bg-sage text-moss transition hover:bg-moss hover:text-white dark:bg-moss/30 dark:text-sage dark:hover:bg-moss"
                        aria-label="Editar entrada"
                      >
                        <PencilEdit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry)}
                        className="grid size-8 place-items-center rounded-full bg-coral text-white transition hover:bg-ink"
                        aria-label="Eliminar entrada"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center gap-1 whitespace-nowrap text-[10px] font-bold leading-snug">
                      <time
                        dateTime={entry.createdAt || undefined}
                        className="text-moss dark:text-sage"
                      >
                        {entry.date}
                      </time>
                      <span className="text-ink/30 dark:text-cream/30">,</span>
                      <time
                        dateTime={entry.createdAt || undefined}
                        className="font-normal text-ink/40 dark:text-cream/40"
                      >
                        {entry.time}
                      </time>
                    </div>
                  </aside>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15">
              <div>
                <BookHeart
                  className="mx-auto mb-3 text-moss/40 dark:text-sage/40"
                  size={26}
                />
                <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
                  Todavía no hay registros
                </p>
                <p className="mt-1 text-xs text-ink/40">
                  Tu primera nota aparecerá aquí.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
