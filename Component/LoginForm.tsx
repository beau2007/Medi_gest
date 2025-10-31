"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HiMail, HiLockClosed } from "react-icons/hi"
import Image from "next/image"

type LoginState = {
  email: string
  password: string
  remember: boolean
}


const ECG_CONFIG = {
  speed: 0.2,           // animation speed
  periodRatio: 0.18,     // spike frequency relative to width
  amplitudeFactor: 3.2,  // global amplitude scale (>1 = taller overall)
  preRise: 0.5,          // small rise before spike
  spikeHeight: 2.6,      // main spike height
  postDip: 0.8,          // dip below baseline after spike
}

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState<LoginState>({ email: "", password: "", remember: true })
  const [errors, setErrors] = useState<Partial<LoginState & { root?: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function validate(): boolean {
    const e: Partial<LoginState & { root?: string }> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide"
    if (!form.password) e.password = "Mot de passe obligatoire"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrors((p) => ({ ...p, root: json?.error || 'Identifiants incorrects.' }))
        return
      }
      // Stocker l'utilisateur courant pour le header/accueil
      const user = json.user
      try {
        if (form.remember) localStorage.setItem('currentUser', JSON.stringify(user))
        else sessionStorage.setItem('currentUser', JSON.stringify(user))
      } catch {}
      // Rediriger
      router.push('/accueil')
    } catch (err) {
      setErrors((p) => ({ ...p, root: "Identifiants incorrects." }))
    } finally {
      setSubmitting(false)
    }
  }

  const bgRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = bgRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    // Narrow to non-null locals for inner functions
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

      // Background gradient
      const grad = ctx2.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#0b1830')
      grad.addColorStop(1, '#0a1222')
      ctx2.fillStyle = grad
      ctx2.fillRect(0, 0, w, h)

      // Subtle grid
      ctx2.strokeStyle = 'rgba(56, 189, 248, 0.08)'
      ctx2.lineWidth = 1
      const grid = 32
      for (let x = 0; x < w; x += grid) {
        ctx2.beginPath(); ctx2.moveTo(x, 0); ctx2.lineTo(x, h); ctx2.stroke()
      }
      for (let y = 0; y < h; y += grid) {
        ctx2.beginPath(); ctx2.moveTo(0, y); ctx2.lineTo(w, y); ctx2.stroke()
      }

      // Animated ECG-like line
      const baseY = Math.round(h * 0.45)
      const speed = ECG_CONFIG.speed
      const phase = t * speed
      ctx2.save()
      ctx2.beginPath()
      ctx2.moveTo(0, baseY)
      const amplitude = Math.max(8, Math.min(18, h * 0.02)) * ECG_CONFIG.amplitudeFactor
      const period = Math.max(120, Math.min(220, w * ECG_CONFIG.periodRatio))
      for (let x = 0; x <= w; x += 4) {
        const local = (x + phase) % period
        let y = baseY
        if (local > period * 0.20 && local < period * 0.275) {
          // pre-rise before spike
          y -= amplitude * ECG_CONFIG.preRise
        } else if (local >= period * 0.275 && local < period * 0.295) {
          // main spike (taller)
          y -= amplitude * ECG_CONFIG.spikeHeight
        } else if (local >= period * 0.295 && local < period * 0.34) {
          // post dip
          y += amplitude * ECG_CONFIG.postDip
        } else {
          // baseline subtle wobble
          y += Math.sin((x + phase) * 0.02) * 1.2
        }
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

    function onResize() {
      resize()
    }
    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.12),transparent_30%)]" />
      <div className="relative z-10 flex items-center justify-center px-4 py-10 min-h-screen">
        <div className="w-full max-w-md rounded-2xl bg-blue-500 backdrop-blur-md shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6 animate-bounce">
            <Image className="rounded-full w-25 h-25" src="/images/image.png" alt="Logo" width={100} height={100} />
          </div>
          <form onSubmit={onSubmit} className="w-full space-y-5">
            <div className="text-center space-y-1">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">Se connecter</h1>
              <p className="text-sm text-gray-900">Accédez à votre espace MediGest.</p>
            </div>

            {errors.root && (
              <div role="alert" aria-live="assertive" className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">{errors.root}</div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-800">Email</label>
              <div className="relative">
                <HiMail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="nom@clinique.ma"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-800">Mot de passe</label>
                <Link href="#" className="text-sm text-blue-700 hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <HiLockClosed className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-16 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto rounded px-2 text-xs text-slate-600 hover:text-slate-800"
                >{showPwd ? "Masquer" : "Afficher"}</button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Se souvenir de moi
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-white text-sm font-medium shadow-sm transition-colors hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Nouveau sur MediGest ? <Link href="/register" className="text-blue-700 hover:underline">Créer un compte</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}


