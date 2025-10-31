"use client"
import { useState } from 'react'

type Props = {
  patientId: string
  onSaved?: () => void
}

type DossierForm = {
  groupeSanguin?: string
  poids?: string
  taille?: string
  allergies?: string // comma-separated or line-based
  antecedentsLines?: string // one item per line
  traitementsLines?: string // one item per line
  vaccinationsLines?: string // one item per line
  notes?: string
}

export default function DossierMedicalForm({ patientId, onSaved }: Props) {
  const [form, setForm] = useState<DossierForm>({
    groupeSanguin: '',
    poids: '',
    taille: '',
    allergies: '',
    antecedentsLines: '',
    traitementsLines: '',
    vaccinationsLines: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof DossierForm>(k: K, v: DossierForm[K]) { setForm(f => ({ ...f, [k]: v })) }

  function inputClass() {
    return "mt-1 w-full rounded-lg border bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none transition border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 placeholder:text-[var(--muted)]"
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      let createdByEmail: string | null = null
      try {
        const raw = window.localStorage.getItem('currentUser') || window.sessionStorage.getItem('currentUser')
        if (raw) {
          const u = JSON.parse(raw)
          if (u?.email) createdByEmail = String(u.email)
        }
      } catch {}

      const payload: any = {
        patientId,
        groupeSanguin: form.groupeSanguin || null,
        notes: form.notes || null,
        createdByEmail: createdByEmail || null,
      }
      if (form.poids) payload.poids = Number(form.poids)
      if (form.taille) payload.taille = Number(form.taille)
      if (form.allergies) {
        const csv = form.allergies.includes(',')
          ? form.allergies.split(',')
          : form.allergies.split('\n')
        payload.allergies = csv.map((s: string) => s.trim()).filter(Boolean)
      }
      const toList = (s?: string) => (s || '').split('\n').map(x => x.trim()).filter(Boolean)
      const antecedentsArr = toList(form.antecedentsLines)
      const traitementsArr = toList(form.traitementsLines)
      const vaccinationsArr = toList(form.vaccinationsLines)
      if (antecedentsArr.length) payload.antecedents = antecedentsArr
      if (traitementsArr.length) payload.traitementsEnCours = traitementsArr
      if (vaccinationsArr.length) payload.vaccinations = vaccinationsArr

      const res = await fetch('/api/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Échec de l’enregistrement du dossier médical.')
        return
      }
      onSaved?.()
    } catch (e) {
      setError('Erreur réseau/serveur.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Groupe sanguin</label>
          <select className={inputClass()} value={form.groupeSanguin} onChange={e => setField('groupeSanguin', e.target.value)}>
            <option value="">--</option>
            <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Poids (kg)</label>
          <input className={inputClass()} type="number" step="0.1" value={form.poids} onChange={e => setField('poids', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Taille (cm)</label>
          <input className={inputClass()} type="number" value={form.taille} onChange={e => setField('taille', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Allergies (lignes ou virgules)</label>
        <textarea className={inputClass()} rows={2} placeholder={"Pollen\nPénicilline"} value={form.allergies} onChange={e => setField('allergies', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Antécédents (une ligne par élément)</label>
          <textarea className={inputClass()} rows={4} placeholder={'Appendicectomie\nAsthme'} value={form.antecedentsLines} onChange={e => setField('antecedentsLines', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Traitements en cours (une ligne par élément)</label>
          <textarea className={inputClass()} rows={4} placeholder={'Ibuprofène 200mg\nVitamine D'} value={form.traitementsLines} onChange={e => setField('traitementsLines', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Vaccinations (une ligne par élément)</label>
          <textarea className={inputClass()} rows={4} placeholder={'Tétanos\nHépatite B'} value={form.vaccinationsLines} onChange={e => setField('vaccinationsLines', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea className={inputClass()} rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} />
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={submitting} className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm">
          {submitting ? 'Validation…' : 'Valider'}
        </button>
      </div>
    </form>
  )
}
