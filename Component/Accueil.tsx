"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FcHome, FcBusinessman, FcCalendar } from 'react-icons/fc'

export const metadata = {
  title: 'Accueil | MediGest',
}

type Role = 'MEDECIN' | 'INFIRMIER' | 'TECHNICIEN_IMAGERIE' | 'TECHNICIEN_LABORATOIRE' | 'SECRETAIRES' | 'PHARMACIEN' | 'ADMINISTRATIF'
type CurrentUser = { nom?: string; prenom?: string; civilite?: 'M.' | 'Mme' | 'Dr' | string; role?: Role }

export default function AccueilPage() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('currentUser') || window.sessionStorage.getItem('currentUser')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  const fullName = user ? `${user.nom ?? ''}${user.prenom ? ' ' + user.prenom : ''}`.trim() : ''
  const hello = user
    ? (user.role === 'MEDECIN' ? `Heureux de vous revoir Dr. ${fullName || 'Utilisateur'}` : `Heureux de vous revoir M/Mne ${fullName || 'Utilisateur'}`)
    : 'Bienvenue à MediGest'

  // Contenu sans données fictives ni ajouts manuels

  return (
    <main className="min-h-screen">
      {/* Hero with wave */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300 text-xs font-medium ring-1 ring-inset ring-cyan-500/20">
              <FcHome />
              MediGest • Accueil
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {hello}
            </h1>
            <p className="text-[var(--muted)] max-w-2xl">
              Accédez rapidement à vos informations clés et actions courantes au sein de la clinique.
            </p>
            {user && (
              <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 shadow-sm ring-1 ring-white/15">
                <FcBusinessman />
                <span className="text-sm">Connecté(e) à MediGest</span>
              </div>
            )}
          </div>
        </div>
        {/* Wave */}
        <svg className="block w-full text-[var(--card)]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,16C1120,11,1280,21,1360,26.7L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z" />
        </svg>
      </section>

      {/* Sections retirées: stats/actions rapides et opérations (données manuelles) */}

      {/* About and info */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-white/5 ring-1 ring-white/10 p-6">
            <h2 className="text-xl font-semibold">À propos de la Clinique</h2>
            <p className="mt-3 text-slate-300">
              La Clinique MediGest offre des soins de qualité, centrés sur le patient, avec une équipe pluridisciplinaire engagée et des plateaux techniques modernes.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                <h3 className="text-sm font-medium">Notre mission</h3>
                <p className="mt-2 text-sm text-slate-300">Proposer des soins accessibles et efficaces, en améliorant continuellement la qualité.</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                <h3 className="text-sm font-medium">Nos valeurs</h3>
                <p className="mt-2 text-sm text-slate-300">Respect, excellence, confidentialité, innovation et esprit d'équipe.</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-6">
            <h2 className="text-xl font-semibold">Infos pratiques</h2>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="font-medium">Heures de visite</div>
              <div className="text-[var(--muted)]">Tous les jours • 10:00 - 12:00 et 16:00 - 18:00</div>
            </div>
            <div>
              <div className="font-medium">Admissions urgentes</div>
              <div className="text-[var(--muted)]">24h/24 • 7j/7</div>
            </div>
            <div>
              <div className="font-medium">Contact</div>
              <div className="text-[var(--muted)]">+212 5XX XX XX XX • contact@medigest.ma</div>
            </div>
            <div className="pt-2">
              <Link href="/dashboard" className="inline-flex items-center text-cyan-300 hover:text-cyan-200">Aller au tableau de bord →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
