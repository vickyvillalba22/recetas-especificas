'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthErrorMessage, useAuth } from '../../context/AuthContext'
import { saveHealthProfile } from '../../services/healthProfileService'
import { ArrowLeft } from '../../components/ui/icons'
import { ConfirmationScreen } from './ConfirmationScreen'
import { DietaryPreferencesStep } from './steps/DietaryPreferencesStep'
import { PrivacyNotice } from './PrivacyNotice'
import { MedicalHealthStep } from './steps/MedicalHealthStep'
import { CurrentPathologyStep } from './steps/CurrentPathologyStep'
import { PersonalContextStep } from './steps/PersonalContextStep'
import { INITIAL_HEALTH_PROFILE } from '../../services/healthProfileDefaults'

const TOTAL_STEPS = 4

const STEP_CONTENT = [
  {
    title: 'Datos personales',
    description: 'Estos datos nos ayudan a personalizar tu experiencia. Todos los campos son opcionales.',
  },
  {
    title: 'Datos médicos',
    description: 'Esta información es opcional y nos ayuda a comprender mejor tus necesidades digestivas. No reemplaza la evaluación de un profesional de la salud.',
  },
  {
    title: 'Sobre tu diagnóstico',
    description: 'Esta información nos ayuda a orientar las recetas y el menú semanal. Si no conocés tu tipo de SIBO o todavía no definiste una fase, podés indicarlo.',
  },
  {
    title: 'Preferencias',
    description: 'Estos datos nos permiten filtrar recetas y adaptar tus propuestas de comidas. Todo es opcional y podés modificarlo más adelante.',
  },
]

export function Onboarding() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_HEALTH_PROFILE,
    ...(profile?.perfilSalud || {}),
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const step = STEP_CONTENT[currentStep]
  const progress = useMemo(() => ((currentStep + 1) / TOTAL_STEPS) * 100, [currentStep])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep, privacyAccepted])

  function updateFormData(updates) {
    setFormData((currentData) => ({
      ...currentData,
      ...updates,
    }))
  }

  function goToPreviousStep() {
    if (currentStep === 0) {
      setPrivacyAccepted(false)
      return
    }

    setCurrentStep((stepIndex) => Math.max(stepIndex - 1, 0))
  }

  function goToNextStep() {
    setCurrentStep((stepIndex) => Math.min(stepIndex + 1, TOTAL_STEPS - 1))
  }

  async function finishOnboarding() {
    if (!user || saving) return

    setSaving(true)
    setError('')

    try {
      await saveHealthProfile(formData)
      setShowConfirmation(true)
      setSaving(false)
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError))
      setSaving(false)
    }
  }

  if (authLoading) return null
  if (!user) return null
  if (showConfirmation) {
    return <ConfirmationScreen onContinue={() => router.replace('/')} />
  }
  if (!privacyAccepted) {
    return <PrivacyNotice onAccept={() => setPrivacyAccepted(true)} onSkip={() => router.replace('/')} />
  }

  const isLastStep = currentStep === TOTAL_STEPS - 1

  return (
    <main className="min-h-screen bg-cream px-5 pb-10 pt-24 text-ink dark:bg-ink-dark dark:text-cream sm:pb-16 sm:pt-28">
      <button
        type="button"
        onClick={goToPreviousStep}
        disabled={saving}
        aria-label="Volver atrás"
        title="Volver atrás"
        className="fixed left-5 top-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink shadow-md transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft size={19} />
      </button>

      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl">Tu perfil</h1>
          </div>
          <span className="shrink-0 text-sm font-semibold text-ink/60 dark:text-cream/60">
            Paso {currentStep + 1} de {TOTAL_STEPS}
          </span>
        </div>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-cream/10" aria-label={`Progreso: ${progress}%`}>
          <div className="h-full rounded-full bg-moss transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
          <div className="mb-8">
            <h2 className="font-display text-2xl">{step.title}</h2>
            <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">{step.description}</p>
          </div>

          {currentStep === 0 ? (
            <PersonalContextStep formData={formData} onChange={updateFormData} />
          ) : currentStep === 1 ? (
            <MedicalHealthStep formData={formData} onChange={updateFormData} />
          ) : currentStep === 2 ? (
            <CurrentPathologyStep formData={formData} onChange={updateFormData} />
          ) : currentStep === 3 ? (
            <DietaryPreferencesStep formData={formData} onChange={updateFormData} />
          ) : null }

          {error && <p className="mt-6 rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={isLastStep ? finishOnboarding : goToNextStep}
                disabled={saving}
                className="order-1 rounded-full bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLastStep ? 'Finalizar' : 'Continuar'}
              </button>
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={saving}
                className="order-2 rounded-full px-5 py-3 text-sm font-bold text-moss transition hover:bg-sage/40 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sage dark:hover:bg-moss/20"
              >
                {saving ? 'Guardando...' : 'Guardar y salir'}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
