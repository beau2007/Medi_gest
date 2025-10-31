"use client"
import { useEffect, useMemo, useState } from 'react'

type Dossier = {
  id: string
  patientId: string
  groupeSanguin?: string | null
  poids?: number | null
  taille?: number | null
  allergies: string[]
  antecedents?: any
  traitementsEnCours?: any
  vaccinations?: any
  notes?: string | null
  createdByEmail?: string | null
}

export default function DossierMedicale({ patientId }: { patientId: string }) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('currentUser') || window.sessionStorage.getItem('currentUser')
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.email) setEmail(String(u.email))
      }
    } catch {}
  }, [])

  useEffect(() => {
    let alive = true
    if (!patientId) return
    setLoading(true)
    setError(null)
    fetch(`/api/dossiers?patientId=${encodeURIComponent(patientId)}`)
      .then(r => r.json())
      .then(json => {
        if (!alive) return
        if (json?.error) { setError(json.error); setDossier(null); return }
        setDossier(json?.dossier || null)
      })
      .catch(() => setError("Impossible de charger le dossier médical."))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [patientId])

  const authorized = useMemo(() => {
    if (!dossier) return false
    // Autorisé uniquement si l'email du créateur correspond à l'utilisateur courant (si email est présent)
    if (dossier.createdByEmail && email) return dossier.createdByEmail === email
    // Si pas d'email stocké côté dossier, on ne montre pas par défaut
    return false
  }, [dossier, email])

  if (loading) return <div className="text-sm text-[var(--muted)]">Chargement…</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!dossier) return <div className="text-sm text-[var(--muted)]">Aucun dossier disponible.</div>
  if (!authorized) return <div className="text-sm text-red-600">Accès refusé: vous n'êtes pas l'auteur de ce dossier.</div>

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Info label="Groupe sanguin" value={dossier.groupeSanguin || '—'} />
        <Info label="Poids (kg)" value={dossier.poids != null ? String(dossier.poids) : '—'} />
        <Info label="Taille (cm)" value={dossier.taille != null ? String(dossier.taille) : '—'} />
      </div>

      <Block label="Allergies">
        {Array.isArray(dossier.allergies) && dossier.allergies.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-[var(--foreground)]">
            {dossier.allergies.map((a: string, i: number) => <li key={i}>{a}</li>)}
          </ul>
        ) : (
          <span className="text-sm text-[var(--muted)]">Aucune</span>
        )}
      </Block>

      <Block label="Antécédents">
        <PreJson value={dossier.antecedents} />
      </Block>
      <Block label="Traitements en cours">
        <PreJson value={dossier.traitementsEnCours} />
      </Block>
      <Block label="Vaccinations">
        <PreJson value={dossier.vaccinations} />
      </Block>

      <Block label="Notes">
        <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{dossier.notes || '—'}</p>
      </Block>
    </section>
  )
}

function Info({ label, value }: { label: string, value: string }) {
  return (
    <div className="rounded-lg bg-black/5 p-4 ring-1 ring-black/10">
      <div className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-sm text-[var(--foreground)]">{value}</div>
    </div>
  )
}

function Block({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-[var(--foreground)] mb-2">{label}</h2>
      <div className="rounded-lg bg-[var(--card)] ring-1 ring-slate-200 p-4">{children}</div>
    </section>
  )
}

function PreJson({ value }: { value: any }) {
  if (!value) return <span className="text-sm text-[var(--muted)]">—</span>
  // value peut être un tableau (après refactor) ou un objet
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-sm text-[var(--muted)]">—</span>
    return (
      <ul className="list-disc list-inside text-sm text-[var(--foreground)]">
        {value.map((v, i) => <li key={i}>{String(v)}</li>)}
      </ul>
    )
  }
  return (
    <pre className="text-xs text-[var(--foreground)] overflow-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

