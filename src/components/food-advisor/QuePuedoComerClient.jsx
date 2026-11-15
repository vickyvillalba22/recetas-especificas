'use client'

import { useState } from 'react'
import { Camera, Sparkles } from '../ui/icons'
import { FoodScannerPanel } from './FoodScannerPanel'
import { RecommendationsPanel } from './RecommendationsPanel'

const OPTIONS = [
  {
    id: 'recommendations',
    label: 'Recibir ideas',
    icon: Sparkles,
    description: 'Ideas de comidas adaptadas a tu perfil.',
  },
  {
    id: 'scanner',
    label: 'Escanear alimentos',
    icon: Camera,
    description: 'Analizá un ingrediente con una foto.',
  },
]

export function QuePuedoComerClient() {
  const [selectedOption, setSelectedOption] = useState('recommendations')
  const selected = OPTIONS.find((option) => option.id === selectedOption)
  const SelectedIcon = selected.icon

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
        <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
          <span className="inline-flex rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage">
            Asistente para tus comidas
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            ¿Qué puedo <em className="font-normal text-coral">comer?</em>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/60 dark:text-cream/60 sm:text-base">
            Encontrá ideas adaptadas a tu perfil de salud o analizá un alimento
            antes de incorporarlo a tu comida.
          </p>

          <div
            className="mt-8 flex w-full flex-nowrap rounded-full bg-sage p-1 dark:bg-moss/25"
            role="tablist"
            aria-label="Opciones de qué puedo comer"
          >
            {OPTIONS.map(({ id, label }) => {
              const isSelected = selectedOption === id

              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`food-advisor-panel-${id}`}
                  onClick={() => setSelectedOption(id)}
                  className={`min-h-11 min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-2.5 text-[14px] font-bold transition sm:px-5 sm:text-sm ${
                    isSelected
                      ? 'bg-moss text-cream shadow-sm'
                      : 'text-moss hover:bg-white/70 dark:text-sage dark:hover:bg-ink-soft'
                  }`}
                >
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          <div
            id={`food-advisor-panel-${selectedOption}`}
            role="tabpanel"
            className="mt-8 rounded-2xl border border-ink/10 bg-cream p-5 dark:border-cream/10 dark:bg-ink"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-sage p-2 text-moss dark:bg-moss/30 dark:text-sage">
                <SelectedIcon size={20} />
              </span>
              <div>
                <h2 className="font-display text-2xl">{selected.label}</h2>
                <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
                  {selected.description}
                </p>
              </div>
            </div>

            {selectedOption === 'recommendations' ? (
              <RecommendationsPanel />
            ) : (
              <FoodScannerPanel />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
