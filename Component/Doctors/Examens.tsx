"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { FcSearch, FcBiotech, FcOpenedFolder } from "react-icons/fc"

type Examen = {
  id: string
  patient: string
  type: string // ex: Hématologie, Imagerie, Biochimie
  dateDemande: string
  statut: "en_attente" | "en_cours" | "disponible"
}

const STATUT_LABEL: Record<Examen["statut"], string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  disponible: "Résultat disponible",
}

export default function DoctorsExamens() {
  // Données fictives – à remplacer par un fetch selon le médecin connecté
  const data: Examen[] = [
    { id: "EX-501", patient: "K. Amina", type: "Hématologie", dateDemande: "2025-10-10", statut: "en_cours" },
    { id: "EX-502", patient: "B. Alain", type: "Imagerie", dateDemande: "2025-10-09", statut: "disponible" },
    { id: "EX-503", patient: "S. Rita", type: "Biochimie", dateDemande: "2025-10-08", statut: "en_attente" },
  ]

  const [q, setQ] = useState("")
  const [statut, setStatut] = useState<"all" | Examen["statut"]>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const list = useMemo(() => {
    let arr = data
    if (statut !== "all") arr = arr.filter((x) => x.statut === statut)
    if (typeFilter !== "all") arr = arr.filter((x) => x.type === typeFilter)
    if (!q.trim()) return arr
    const s = q.toLowerCase()
    return arr.filter((x) => x.patient.toLowerCase().includes(s) || x.id.toLowerCase().includes(s) || x.type.toLowerCase().includes(s))
  }, [q, statut, typeFilter])

  const types = Array.from(new Set(data.map((d) => d.type)))

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-[var(--foreground)]">
          <FcBiotech /> Examens demandés
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-[var(--card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="disponible">Disponible</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-[var(--card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (patient, ID, type)"
              className="w-64 rounded-lg border border-slate-300 bg-[var(--card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FcSearch className="pointer-events-none absolute right-2 top-2.5" />
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl bg-[var(--card)] shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full text-sm">
          <thead className="text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Patient</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Date demande</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((x) => (
              <tr key={x.id} className="hover:bg-black/5">
                <td className="px-4 py-3 text-[var(--muted)]">{x.id}</td>
                <td className="px-4 py-3 text-[var(--foreground)] font-medium">{x.patient}</td>
                <td className="px-4 py-3">{x.type}</td>
                <td className="px-4 py-3">{x.dateDemande}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-black/5 px-2 py-1 text-xs text-[var(--muted)] ring-1 ring-black/10">{STATUT_LABEL[x.statut]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/examens/${x.id}`} className="text-blue-700 hover:underline">Détails</Link>
                    {x.statut === "disponible" && (
                      <Link href={`/examens/${x.id}/resultat`} className="text-green-700 inline-flex items-center gap-1 hover:underline">
                        <FcOpenedFolder /> Résultat
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

