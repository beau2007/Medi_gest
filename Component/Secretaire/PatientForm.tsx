"use client"
import { useState } from 'react'

type PatientFormData = {
  numeroDossier: string
  civilite: string
  nom: string
  prenom: string
  dateNaissance: string // ISO date (yyyy-mm-dd)
  sexe: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  codePostal?: string
}

export default function PatientForm() {
  const [form, setForm] = useState<PatientFormData>({
    numeroDossier: '',
    civilite: 'M.',
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'Homme',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<PatientFormData & { root?: string }>>({})

  function setField<K extends keyof PatientFormData>(key: K, value: PatientFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate(): boolean {
    const e: Partial<PatientFormData & { root?: string }> = {}
    if (!form.numeroDossier.trim()) e.numeroDossier = 'Numéro de dossier requis'
    if (!form.civilite) e.civilite = 'Civilité requise'
    if (!form.nom.trim()) e.nom = 'Nom requis'
    if (!form.prenom.trim()) e.prenom = 'Prénom requis'
    if (!form.dateNaissance) e.dateNaissance = 'Date de naissance requise'
    if (!form.sexe) e.sexe = 'Sexe requis'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email invalide'
    if (form.telephone && !/^\+?[0-9\s.-]{6,}$/.test(form.telephone)) e.telephone = 'Téléphone invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setSuccess(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // transformer dateNaissance string (yyyy-mm-dd) en ISO si l’API l’attend
          dateNaissance: form.dateNaissance,
        })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors((p) => ({ ...p, root: json?.error || 'Échec de l’enregistrement du patient.' }))
        return
      }
      setSuccess('Patient enregistré avec succès.')
      setErrors({})
      // Option: reset
      setForm({
        numeroDossier: '', civilite: 'M.', nom: '', prenom: '', dateNaissance: '', sexe: 'Homme',
        email: '', telephone: '', adresse: '', ville: '', codePostal: ''
      })
    } catch (err) {
      setErrors((p) => ({ ...p, root: 'Erreur réseau/serveur.' }))
    } finally {
      setSubmitting(false)
    }
  }

  function inputClass(hasError?: boolean) {
    return `mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition
      ${hasError ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`
  }

  return (
    <form onSubmit={onSubmit} className="max-w-7xl">
      <div className="p-4 m-4 ml-64 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-400 to-indigo-500">
          <h2 className="text-lg md:text-xl font-semibold text-white">Enregistrer un patient</h2>
          <p className="mt-1 text-sm text-white">Saisissez les informations du patient. Les champs marqués d’un astérisque sont obligatoires.</p>
        </div>

        {/* Alerts */}
        {(errors.root || success) && (
          <div className="px-6 pt-4">
            {errors.root && (
              <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">{errors.root}</div>
            )}
            {success && (
              <div className="mb-3 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2 border border-green-200">{success}</div>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6 space-y-8">
          {/* Bloc Identité */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 p-4">
            <legend className="px-2 text-sm font-medium text-slate-700">Identité</legend>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Numéro de dossier */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Numéro de dossier <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(!!errors.numeroDossier)}
                  value={form.numeroDossier}
                  onChange={(e) => setField('numeroDossier', e.target.value)}
                  placeholder="PAT-2025-0001"
                  aria-invalid={!!errors.numeroDossier}
                />
                {errors.numeroDossier && <p className="text-xs text-red-600 mt-1">{errors.numeroDossier}</p>}
              </div>

              {/* Civilité */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Civilité <span className="text-red-500">*</span></label>
                <select
                  className={inputClass(!!errors.civilite)}
                  value={form.civilite}
                  onChange={(e) => setField('civilite', e.target.value)}
                  aria-invalid={!!errors.civilite}
                >
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
                {errors.civilite && <p className="text-xs text-red-600 mt-1">{errors.civilite}</p>}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Nom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(!!errors.nom)}
                  value={form.nom}
                  onChange={(e) => setField('nom', e.target.value)}
                  placeholder="Ex: name"
                  aria-invalid={!!errors.nom}
                />
                {errors.nom && <p className="text-xs text-red-600 mt-1">{errors.nom}</p>}
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Prénom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(!!errors.prenom)}
                  value={form.prenom}
                  onChange={(e) => setField('prenom', e.target.value)}
                  placeholder="Ex: rename"
                  aria-invalid={!!errors.prenom}
                />
                {errors.prenom && <p className="text-xs text-red-600 mt-1">{errors.prenom}</p>}
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Date de naissance <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={inputClass(!!errors.dateNaissance)}
                  value={form.dateNaissance}
                  onChange={(e) => setField('dateNaissance', e.target.value)}
                  aria-invalid={!!errors.dateNaissance}
                />
                {errors.dateNaissance && <p className="text-xs text-red-600 mt-1">{errors.dateNaissance}</p>}
              </div>

              {/* Sexe */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Sexe <span className="text-red-500">*</span></label>
                <select
                  className={inputClass(!!errors.sexe)}
                  value={form.sexe}
                  onChange={(e) => setField('sexe', e.target.value)}
                  aria-invalid={!!errors.sexe}
                >
                  <option>Homme</option>
                  <option>Femme</option>
                  <option>Autre</option>
                </select>
                {errors.sexe && <p className="text-xs text-red-600 mt-1">{errors.sexe}</p>}
              </div>
            </div>
          </fieldset>

          {/* Bloc Coordonnées */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 p-4">
            <legend className="px-2 text-sm font-medium text-slate-700">Coordonnées</legend>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className={inputClass(!!errors.email)}
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="exemple@domaine.com"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                <input
                  type="tel"
                  className={inputClass(!!errors.telephone)}
                  value={form.telephone}
                  onChange={(e) => setField('telephone', e.target.value)}
                  placeholder="Ex: +212 6 12 34 56 78"
                  aria-invalid={!!errors.telephone}
                />
                {errors.telephone && <p className="text-xs text-red-600 mt-1">{errors.telephone}</p>}
              </div>

              {/* Adresse */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Adresse</label>
                <input
                  type="text"
                  className={inputClass()}
                  value={form.adresse}
                  onChange={(e) => setField('adresse', e.target.value)}
                  placeholder="Rue, quartier..."
                />
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Ville</label>
                <input
                  type="text"
                  className={inputClass()}
                  value={form.ville}
                  onChange={(e) => setField('ville', e.target.value)}
                />
              </div>

              {/* Code postal */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Code postal</label>
                <input
                  type="text"
                  className={inputClass()}
                  value={form.codePostal}
                  onChange={(e) => setField('codePostal', e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Footer actions (collant sur fond) */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-60"
            onClick={() => {
              setForm({
                numeroDossier: '', civilite: 'M.', nom: '', prenom: '', dateNaissance: '', sexe: 'Homme',
                email: '', telephone: '', adresse: '', ville: '', codePostal: ''
              })
              setErrors({})
              setSuccess(null)
            }}
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm"
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  )
}

