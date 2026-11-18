'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAuthErrorMessage, useAuth } from '../../../context/AuthContext'
import { INITIAL_HEALTH_PROFILE } from '../../../services/health-profile/healthProfileDefaults'
import { getHealthProfile, saveHealthProfile } from '../../../services/health-profile/healthProfileService'
import { DietaryPreferencesStep } from '../../onboarding/steps/DietaryPreferencesStep'
import { MedicalHealthStep } from '../../onboarding/steps/MedicalHealthStep'
import { CurrentPathologyStep } from '../../onboarding/steps/CurrentPathologyStep'
import { PersonalContextStep } from '../../onboarding/steps/PersonalContextStep'

export function EditHealthProfile() {
  const { user, profile, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_HEALTH_PROFILE,
    ...(profile?.perfilSalud || {}),
  }))
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      if (!user) {
        setLoadingProfile(false)
        return
      }

      try {
        const savedHealthProfile = await getHealthProfile()
        if (active) {
          setFormData({
            ...INITIAL_HEALTH_PROFILE,
            ...savedHealthProfile,
          })
        }
      } catch (loadError) {
        if (active) setError(getAuthErrorMessage(loadError))
      } finally {
        if (active) setLoadingProfile(false)
      }
    }

    if (!authLoading) loadProfile()

    return () => {
      active = false
    }
  }, [authLoading, user])

  function updateFormData(updates) {
    setFormData((currentData) => ({
      ...currentData,
      ...updates,
    }))
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      await saveHealthProfile(formData)
      setMessage('Tus datos de salud se actualizaron correctamente.')
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loadingProfile) return null
  if (!user) return null

  const email = profile?.email || user.email || ''

  return (
    <main className="min-h-screen bg-cream px-5 pb-20 pt-10 text-ink dark:bg-ink-dark dark:text-cream sm:pt-16">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-coral">Configuración</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Editar perfil de salud</h1>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
            Podés actualizar estos datos cuando quieras. El email de tu cuenta no se puede modificar desde acá.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-ink/10 bg-white p-5 dark:border-cream/10 dark:bg-ink-soft">
          <label className="block text-sm font-bold">
            Email de la cuenta
            <input className="field mt-2 opacity-60" type="email" value={email} disabled readOnly />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
            <h2 className="font-display text-2xl">Datos personales y de contexto</h2>
            <div className="mt-6">
              <PersonalContextStep formData={formData} onChange={updateFormData} />
            </div>
          </section>

          <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
            <h2 className="font-display text-2xl">Datos médicos y de salud general</h2>
            <div className="mt-6">
              <MedicalHealthStep formData={formData} onChange={updateFormData} />
            </div>
          </section>

          <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
            <h2 className="font-display text-2xl">Patología actual y fase del tratamiento</h2>
            <div className="mt-6">
              <CurrentPathologyStep formData={formData} onChange={updateFormData} />
            </div>
          </section>

          <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
            <h2 className="font-display text-2xl">Restricciones y preferencias</h2>
            <div className="mt-6">
              <DietaryPreferencesStep formData={formData} onChange={updateFormData} />
            </div>
          </section>

          {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          {message && <p className="rounded-xl bg-moss/10 p-3 text-sm text-moss dark:text-sage">{message}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/perfil"
              className="rounded-full border border-ink/15 px-6 py-3 text-center text-sm font-bold text-ink/75 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando cambios...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
