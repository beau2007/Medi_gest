"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormState = {
  matricule: string
  civilite: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  specialite?: string
  role: string
  password: string
  confirm: string
}

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    matricule: "",
    civilite: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    specialite: "",
    role: "",
    password: "",
    confirm: "",
  })
  const [errors, setErrors] = useState<Partial<FormState & { root?: string }>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const e: Partial<FormState & { root?: string }> = {}
    if (!form.matricule.trim()) e.matricule = "Matricule obligatoire"
    if (!form.civilite) e.civilite = "Civilité obligatoire"
    if (!form.nom.trim()) e.nom = "Nom obligatoire"
    if (!form.prenom.trim()) e.prenom = "Prénom obligatoire"
    if (!/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(form.email)) e.email = "Email invalide"
    if (!form.role) e.role = "Rôle obligatoire"
    if (form.password.length < 6) e.password = "Mot de passe min. 6 caractères"
    if (form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        // Map server-side field errors if any
        if (json?.errors) setErrors(json.errors as any)
        else setErrors((p) => ({ ...p, root: json?.message || 'Erreur lors de la création' }))
        return
      }
      // Success → rediriger vers la page de connexion
      router.push('/login')
    } catch (err: any) {
    } finally {
      setSubmitting(false)
    }
  }

  // Canvas ECG background (consistent with LoginForm)
  const bgRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = bgRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const canvasEl: HTMLCanvasElement = c
    const ctx2: CanvasRenderingContext2D = ctx

    let raf = 0
    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const { clientWidth, clientHeight } = canvasEl
      canvasEl.width = Math.floor(clientWidth * dpr)
      canvasEl.height = Math.floor(clientHeight * dpr)
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(t: number) {
      const w = canvasEl.clientWidth
      const h = canvasEl.clientHeight
      ctx2.clearRect(0, 0, w, h)

      const grad = ctx2.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#0b1830')
      grad.addColorStop(1, '#0a1222')
      ctx2.fillStyle = grad
      ctx2.fillRect(0, 0, w, h)

      ctx2.strokeStyle = 'rgba(56, 189, 248, 0.08)'
      ctx2.lineWidth = 1
      const grid = 32
      for (let x = 0; x < w; x += grid) { ctx2.beginPath(); ctx2.moveTo(x, 0); ctx2.lineTo(x, h); ctx2.stroke() }
      for (let y = 0; y < h; y += grid) { ctx2.beginPath(); ctx2.moveTo(0, y); ctx2.lineTo(w, y); ctx2.stroke() }

      const baseY = Math.round(h * 0.45)
      const speed = 0.05
      const phase = t * speed
      ctx2.save()
      ctx2.beginPath()
      ctx2.moveTo(0, baseY)
      const amplitude = Math.max(8, Math.min(18, h * 0.02)) * 1.2
      const period = Math.max(120, Math.min(220, w * 0.18))
      for (let x = 0; x <= w; x += 4) {
        const local = (x + phase) % period
        let y = baseY
        if (local > period * 0.20 && local < period * 0.275) y -= amplitude * 0.9
        else if (local >= period * 0.275 && local < period * 0.295) y -= amplitude * 2.4
        else if (local >= period * 0.295 && local < period * 0.34) y += amplitude * 0.8
        else y += Math.sin((x + phase) * 0.02) * 1.2
        ctx2.lineTo(x, y)
      }
      ctx2.strokeStyle = 'rgba(56, 189, 248, 0.9)'
      ctx2.lineWidth = 2
      ctx2.shadowColor = 'rgba(56, 189, 248, 0.35)'
      ctx2.shadowBlur = 8
      ctx2.stroke()
      ctx2.restore()

      raf = requestAnimationFrame(draw)
    }

    function onResize() { resize() }
    resize(); raf = requestAnimationFrame(draw)
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.12),transparent_30%)]" />
      <div className="relative z-10 flex items-center justify-center px-4 py-10 min-h-screen">
        <div className="w-full max-w-3xl rounded-2xl bg-white/80 backdrop-blur-md shadow-xl ring-1 ring-black/5 p-6 sm:p-10">
          <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Inscription du personnel</h1>
              <p className="text-sm text-slate-600">Renseignez les informations professionnelles.</p>
            </div>

            {errors.root && (
              <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">{errors.root}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1 md:col-span-1">
          <label htmlFor="matricule" className="text-sm font-medium text-slate-800">Matricule</label>
          <input
            id="matricule"
            value={form.matricule}
            onChange={(e) => setForm({ ...form, matricule: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: M-2025-001"
          />
          {errors.matricule && <p className="text-xs text-red-600">{errors.matricule}</p>}
        </div>
        <div className="space-y-1 md:col-span-1">
          <label htmlFor="civilite" className="text-sm font-medium text-slate-800">Civilité</label>
          <select
            id="civilite"
            value={form.civilite}
            onChange={(e) => setForm({ ...form, civilite: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner...</option>
            <option value="M.">Masculin</option>
            <option value="Mme">Femme</option>
          </select>
          {errors.civilite && <p className="text-xs text-red-600">{errors.civilite}</p>}
        </div>
        <div className="space-y-1 md:col-span-1">
          <label htmlFor="role" className="text-sm font-medium text-slate-800">Rôle</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner...</option>
            <option value="MEDECIN">Médecin</option>
            <option value="INFIRMIER">Infirmier/ère</option>
            <option value="SECRETAIRES">Secrétaire</option>
            <option value="PHARMACIEN">Pharmacien</option>
            <option value="TECHNICIEN_IMAGERIE">Technicien Imagerie</option>
            <option value="TECHNICIEN_LABORATOIRE">Technicien Laboratoire</option>
            <option value="ADMINISTRATIF">Administratif</option>
          </select>
          {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-800">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="confirm" className="text-sm font-medium text-slate-800">Confirmer</label>
          <input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.confirm && <p className="text-xs text-red-600">{errors.confirm}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="nom" className="text-sm font-medium text-slate-800">Nom</label>
          <input
            id="nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Martin"
          />
          {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="prenom" className="text-sm font-medium text-slate-800">Prénom</label>
          <input
            id="prenom"
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Jean"
          />
          {errors.prenom && <p className="text-xs text-red-600">{errors.prenom}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="nom@clinique.ma"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="telephone" className="text-sm font-medium text-slate-800">Téléphone</label>
          <input
            id="telephone"
            value={form.telephone || ""}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: +212 6 12 34 56 78"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="specialite" className="text-sm font-medium text-slate-800">Spécialité (optionnel)</label>
        <input
          id="specialite"
          value={form.specialite || ""}
          onChange={(e) => setForm({ ...form, specialite: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Cardiologie"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full md:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-white text-sm font-medium shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Création..." : "Créer le compte"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Déjà inscrit ? <Link href="/login" className="text-blue-700 hover:underline">Se connecter</Link>
      </p>
          </form>
        </div>
      </div>
    </div>
  )
}

