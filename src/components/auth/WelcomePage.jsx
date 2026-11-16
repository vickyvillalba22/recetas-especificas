'use client'

import Link from 'next/link'
import { Leaf } from '../ui/icons'

export function WelcomePage() {
  return (
    <main className="welcome-page-background relative isolate flex min-h-screen overflow-hidden bg-ink-dark px-6 py-8 text-white sm:px-10 sm:py-10">
      <div className="relative z-10 flex w-full flex-col">
        <Link
          href="/"
          aria-label="sibo.decis, volver al inicio"
          className="flex w-fit items-center gap-3 rounded-full text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-cream shadow-lg shadow-black/20">
            <Leaf size={23} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span>
        </Link>

        <section className="my-auto w-full max-w-xl py-16 sm:py-20">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-cream/75">Una forma más simple de cuidarte</p>
          <h1 className="max-w-lg font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Comer bien también puede sentirse fácil.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Organizá tus comidas, recetas, lista de compras y diario personal en un solo lugar.
          </p>
          <div className="mt-9 flex w-full gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-moss px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full border border-white/45 bg-white/10 px-7 py-3.5 text-center text-sm font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Crear cuenta
            </Link>
          </div>
        </section>

        <p className="text-xs text-white/60">Tu alimentación, organizada a tu manera.</p>
      </div>

    </main>
  )
}
