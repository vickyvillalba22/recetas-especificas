'use client'

import { useState } from 'react'
import { Calendar, Clock3, Filter, PencilEdit, Trash, UserCircle } from '../ui/icons'
import { MedicalHistoryFilters } from './MedicalHistoryFilters'

const statusLabels = {
  pending: 'Pendiente',
  attended: 'Asistido',
  cancelled: 'Cancelado',
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

export function MedicalTimeline({ entries, typeFilter, statusFilter, onTypeChange, onStatusChange, onEdit, onStatusChangeRecord, onDelete, deletingId, updatingStatusId, emptyMessage = 'No hay registros que coincidan con estos filtros.' }) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openNotesId, setOpenNotesId] = useState(null)

  return (
    <section className="mt-10" aria-labelledby="medical-timeline-title">
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Seguimiento</p>
          <h2 id="medical-timeline-title" className="mt-2 font-display text-2xl sm:text-3xl">Línea de tiempo médica</h2>
        </div>
        <div className="relative flex items-center gap-3">
          <span className="hidden text-sm text-ink/50 dark:text-cream/50 sm:block">{entries.length} {entries.length === 1 ? 'registro' : 'registros'}</span>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-label={filtersOpen ? 'Cerrar filtros' : 'Abrir filtros'}
            aria-expanded={filtersOpen}
            className={`grid h-11 w-11 place-items-center rounded-full border transition ${
              filtersOpen
                ? 'border-moss bg-moss text-white'
                : 'border-ink/10 bg-white text-ink/60 hover:border-moss/40 hover:text-moss dark:border-cream/10 dark:bg-ink-soft dark:text-cream/60 dark:hover:text-sage'
            }`}
          >
            <Filter size={19} />
          </button>

          {filtersOpen && (
            <div className="absolute right-0 top-14 z-20 w-72 max-w-[calc(100vw-2.5rem)]">
              <MedicalHistoryFilters
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                onTypeChange={onTypeChange}
                onStatusChange={onStatusChange}
                className="shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="relative mt-6 space-y-5 before:absolute before:bottom-6 before:left-[15px] before:top-6 before:w-px before:bg-moss/25">
          {entries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onStatusChange={onStatusChangeRecord}
              onDelete={onDelete}
              isDeleting={deletingId === entry.id}
              isUpdatingStatus={updatingStatusId === entry.id}
              notesOpen={openNotesId === entry.id}
              onToggleNotes={() => setOpenNotesId((currentId) => currentId === entry.id ? null : entry.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/55 dark:border-cream/15 dark:text-cream/55">
          {emptyMessage}
        </div>
      )}
    </section>
  )
}

function TimelineEntry({ entry, onEdit, onStatusChange, onDelete, isDeleting, isUpdatingStatus, notesOpen, onToggleNotes }) {
  const isAppointment = entry.type === 'appointment'
  const hasNotes = Boolean(entry.notes?.trim())

  return (
    <article className="relative pl-10">
      <span className={`absolute left-0 top-5 grid h-8 w-8 place-items-center rounded-full border-4 border-cream text-white dark:border-ink-dark ${isAppointment ? 'bg-moss' : 'bg-coral'}`}>
        {isAppointment ? <Calendar size={14} /> : <span className="text-xs font-bold">✓</span>}
      </span>

      <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-ink/50 dark:text-cream/50">
              {isAppointment ? 'Turno / consulta' : 'Estudio médico'}
            </p>
            <h3 className="mt-2 font-display text-xl">
              {isAppointment ? entry.specialty : entry.studyType}
            </h3>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isAppointment && onStatusChange ? (
              <select
                value={entry.status}
                onChange={(event) => onStatusChange(entry, event.target.value)}
                disabled={isUpdatingStatus || isDeleting}
                aria-label={`Estado del turno de ${entry.specialty}`}
                className="rounded-full border border-moss/20 bg-sage/60 px-3 py-1.5 text-xs font-bold text-moss outline-none transition focus:border-moss disabled:cursor-not-allowed disabled:opacity-50 dark:border-sage/20 dark:bg-moss/30 dark:text-sage"
              >
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            ) : isAppointment ? (
              <span className="rounded-full bg-sage/60 px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage">{statusLabels[entry.status]}</span>
            ) : null}
            {onEdit && (
              <button type="button" onClick={() => onEdit(entry)} disabled={isDeleting} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-bold text-ink/55 transition hover:border-moss/40 hover:text-moss disabled:cursor-not-allowed disabled:opacity-50 dark:border-cream/10 dark:text-cream/55 dark:hover:text-sage">
                <PencilEdit size={14} />
                Editar
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={() => onDelete(entry)} disabled={isDeleting || isUpdatingStatus} aria-label={`Eliminar ${isAppointment ? 'turno' : 'estudio'}`} className="grid h-8 w-8 place-items-center rounded-full border border-coral/20 text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-40">
                <Trash size={15} />
              </button>
            )}
            {hasNotes && (
              <div className="relative">
                <button
                  type="button"
                  onClick={onToggleNotes}
                  aria-expanded={notesOpen}
                  className="rounded-full border border-moss/20 px-3 py-1.5 text-xs font-bold text-moss transition hover:bg-sage/40 dark:border-sage/20 dark:text-sage dark:hover:bg-moss/20"
                >
                  Ver notas
                </button>
                {notesOpen && (
                  <div className="absolute right-0 top-10 z-20 w-72 max-w-[calc(100vw-3.5rem)] rounded-2xl border border-ink/10 bg-white p-4 text-left text-sm leading-relaxed text-ink/70 shadow-2xl dark:border-cream/10 dark:bg-ink-soft dark:text-cream/70">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-coral">Notas</p>
                    {entry.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/60 dark:text-cream/60">
          <span className="flex items-center gap-2">
            <Calendar size={16} />
            {formatDate(entry.date)}
          </span>
          {isAppointment && (
            <>
              <span className="flex items-center gap-2">
                <Clock3 size={16} />
                {entry.time} hs
              </span>
              <span className="flex items-center gap-2">
                <UserCircle size={16} />
                {entry.professional}
              </span>
            </>
          )}
        </div>

        {isAppointment ? (
          <div className="mt-5 rounded-2xl bg-sage/35 px-4 py-3 text-sm text-ink/70 dark:bg-moss/20 dark:text-cream/70">
            <strong className="font-bold text-ink dark:text-cream">Motivo:</strong> {entry.reason}
          </div>
        ) : (
          <div className="mt-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-ink/45 dark:text-cream/45">Resultado</p>
              <p className="mt-1 text-sm font-semibold text-coral">{entry.result}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
