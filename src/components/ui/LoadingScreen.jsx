'use client'

import { useEffect, useState } from 'react'

const motivationalPhrases = [
  '¡Un día a la vez! Cada elección consciente es un paso más hacia sentirte excelente.',
  'Cuidar tu panza también es una forma de quererte. ¡Hoy va a ser un gran día!',
  'La paciencia es la mejor receta del menú. ¡Vas muy bien!',
  'Tu cuerpo se está reacomodando. Dale tiempo, amor y buena comida.',
]

export function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    setPhraseIndex(Math.floor(Math.random() * motivationalPhrases.length))
  }, [])

  return (
    <main className="fixed inset-0 z-50 grid place-items-center bg-cream px-6 text-center text-ink dark:bg-ink-dark dark:text-cream">
      <div className="flex w-full max-w-2xl flex-col items-center">
        <blockquote className="font-display text-3xl leading-tight sm:text-5xl">“{motivationalPhrases[phraseIndex]}”</blockquote>
        <div className="relative mt-9 h-40 w-32 sm:h-48 sm:w-40" role="img" aria-label="Cargando">
          <img src="/assets/imgs/loader.png" alt="" className="absolute inset-0 h-full w-full object-contain opacity-20" />
          <div className="loading-image-fill absolute inset-0 overflow-hidden">
            <img src="/assets/imgs/loader.png" alt="" className="h-full w-full object-contain" />
          </div>
        </div>
      </div>
    </main>
  )
}
