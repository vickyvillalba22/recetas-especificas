import { ArrowLeft, BookHeart } from '../../../components/ui/icons'
import { MedicalHistoryContent } from '../../../components/medical-history/MedicalHistoryContent'

export const metadata = {
  title: 'Mi historia clínica',
}

export default function MedicalHistoryPage() {
  return (
    <main className="min-h-screen bg-cream px-5 pb-20 pt-10 text-ink dark:bg-ink-dark dark:text-cream lg:px-10 lg:pt-16">
      <div className="mx-auto max-w-[1000px]">

        <header className="mt-2 flex items-start gap-4 sm:mt-10 sm:gap-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sage text-moss dark:bg-moss/35 dark:text-sage sm:h-16 sm:w-16">
            <BookHeart size={30} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Mi perfil</p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl">Mi historia clínica</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60 dark:text-cream/60 sm:text-base">
              Tené en un solo lugar tus turnos, estudios médicos y las indicaciones importantes de tu seguimiento.
            </p>
          </div>
        </header>

        <MedicalHistoryContent />
      </div>
    </main>
  )
}
