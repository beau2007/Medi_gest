"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FcSearch, FcPlus, FcConferenceCall } from "react-icons/fc"

type ApiPatient = {
  id: string
  numeroDossier: string
  nom: string
  prenom: string
  dateNaissance: string
  sexe: string
}

type Row = {
  id: string
  nom: string
  age: number
  sexe: "H" | "F"
  dossier: string
}

export default function DoctorsPatients() {
  const [rows, setRows] = useState<Row[]>([])
  const [myPatientIds, setMyPatientIds] = useState<Set<string>>(new Set())
  const [doctorEmail, setDoctorEmail] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function computeAge(isoDate: string): number {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return 0
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
    return age
  }

  useEffect(() => {
    // load connected user's email
    try {
      const raw = window.localStorage.getItem('currentUser') || window.sessionStorage.getItem('currentUser')
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.email) setDoctorEmail(String(u.email))
      }
    } catch {}
    let alive = true
    setLoading(true)
    setError(null)
    fetch('/api/patients')
      .then(r => r.json())
      .then(json => {
        if (!alive) return
        const list: ApiPatient[] = json?.patients ?? []
        const mapped: Row[] = list.map(p => ({
          id: p.id,
          nom: `${p.nom} ${p.prenom ?? ''}`.trim(),
          age: computeAge(p.dateNaissance),
          sexe: p.sexe?.toUpperCase().startsWith('F') ? 'F' : 'H',
          dossier: p.numeroDossier,
        }))
        setRows(mapped)
      })
      .catch(() => setError('Impossible de charger les patients.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  // fetch dossiers created by this doctor to partition patients
  useEffect(() => {
    let alive = true
    if (!doctorEmail) return
    fetch(`/api/dossiers?createdByEmail=${encodeURIComponent(doctorEmail)}`)
      .then(r => r.json())
      .then(json => {
        if (!alive) return
        const dossiers: Array<{ patientId: string }> = json?.dossiers ?? []
        setMyPatientIds(new Set(dossiers.map(d => d.patientId)))
      })
      .catch(() => {})
    return () => { alive = false }
  }, [doctorEmail])

  const patients = useMemo(() => {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter(
      (p) => p.nom.toLowerCase().includes(s) || p.id.toLowerCase().includes(s) || p.dossier.toLowerCase().includes(s)
    )
  }, [q, rows])

  const prisEnCharge = useMemo(() => patients.filter(p => myPatientIds.has(p.id)), [patients, myPatientIds])
  const nonPrisEnCharge = useMemo(() => patients.filter(p => !myPatientIds.has(p.id)), [patients, myPatientIds])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-indigo-600 tracking-tight">
          <FcConferenceCall /> Mes patients
        </h1>
        <p className="text-sm text-indigo-400">Liste des patients rattachés au médecin connecté.</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <FcSearch className="pointer-events-none absolute left-3 top-2.5" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom, ID ou dossier..."
            className="w-72 rounded-lg border border-slate-300 bg-[var(--card)] pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tableau: patients pris en charge par moi */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--card)] shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-medium text-[var(--foreground)]">Pris en charge par moi ({prisEnCharge.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[var(--muted)] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3.5 text-left font-medium">ID</th>
                <th className="px-5 py-3.5 text-left font-medium">Nom</th>
                <th className="px-5 py-3.5 text-left font-medium">Âge</th>
                <th className="px-5 py-3.5 text-left font-medium">Sexe</th>
                <th className="px-5 py-3.5 text-left font-medium">Dossier</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[var(--muted)]">Chargement…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-red-600">{error}</td>
                </tr>
              )}
              {!loading && !error && prisEnCharge.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[var(--muted)]">
                    Aucun patient pris en charge.
                  </td>
                </tr>
              )}
              {prisEnCharge.map((p) => (
                <tr key={p.id} className="even:bg-black/5 hover:bg-black/10">
                  <td className="px-5 py-3.5 text-[var(--muted)]">{p.id}</td>
                  <td className="px-5 py-3.5 text-[var(--foreground)] font-medium">{p.nom}</td>
                  <td className="px-5 py-3.5">{p.age}</td>
                  <td className="px-5 py-3.5">{p.sexe}</td>
                  <td className="px-5 py-3.5">{p.dossier}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-3">
                      <Link href={`/dossiers/${p.id}`} className="text-[var(--muted)] hover:text-[var(--foreground)]">Dossier</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tableau: patients non pris en charge */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--card)] shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-medium text-[var(--foreground)]">Non pris en charge ({nonPrisEnCharge.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[var(--muted)] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3.5 text-left font-medium">ID</th>
                <th className="px-5 py-3.5 text-left font-medium">Nom</th>
                <th className="px-5 py-3.5 text-left font-medium">Âge</th>
                <th className="px-5 py-3.5 text-left font-medium">Sexe</th>
                <th className="px-5 py-3.5 text-left font-medium">Dossier</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && !error && nonPrisEnCharge.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[var(--muted)]">Tous les patients sont pris en charge.</td>
                </tr>
              )}
              {nonPrisEnCharge.map((p) => (
                <tr key={p.id} className="even:bg-black/5 hover:bg-black/10">
                  <td className="px-5 py-3.5 text-[var(--muted)]">{p.id}</td>
                  <td className="px-5 py-3.5 text-[var(--foreground)] font-medium">{p.nom}</td>
                  <td className="px-5 py-3.5">{p.age}</td>
                  <td className="px-5 py-3.5">{p.sexe}</td>
                  <td className="px-5 py-3.5">{p.dossier}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-3">
                      <Link href={`/dossiers/creer/${p.id}`} className="text-emerald-700 hover:text-emerald-800">Créer dossier</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

