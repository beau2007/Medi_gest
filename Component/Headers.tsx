'use client'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  FcBullish, 
  FcBusinessman, 
  FcCalendar, 
  FcConferenceCall, 
  FcDocument, 
  FcExpand, 
  FcFolder, 
  FcHome, 
  FcPortraitMode, 
  FcPositiveDynamic, 
  FcPlus,
  FcBiotech,
  FcSurvey,
  FcDislike,
  FcEngineering,
  FcAddressBook
} from "react-icons/fc";

export default function Header() {
  // --- Current user (temporary): read from storage if present
  type Role =
    | 'MEDECIN'
    | 'INFIRMIER'
    | 'TECHNICIEN_IMAGERIE'
    | 'TECHNICIEN_LABORATOIRE'
    | 'SECRETAIRES'
    | 'PHARMACIEN'
    | 'ADMINISTRATIF'

  type CurrentUser = {
    nom?: string
    prenom?: string
    civilite?: 'M.' | 'Mme' | 'Dr' | string
    role?: Role
  }

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Lecture initiale et à chaque changement de route (ex: après login)
    try {
      const raw = window.localStorage.getItem('currentUser') || window.sessionStorage.getItem('currentUser')
      if (raw) {
        const parsed = JSON.parse(raw)
        setCurrentUser(parsed)
      } else {
        setCurrentUser(null)
      }
    } catch {}
  }, [pathname])

  const role: Role | null = (currentUser?.role as Role) || null

  function profileDisplayName() {
    if (!currentUser) return ''
    const nom = currentUser.nom || 'Utilisateur'
    const prenom = currentUser.prenom ? ` ${currentUser.prenom}` : ''
    if (role === 'MEDECIN') return `Dr. ${nom}${prenom}`
    // sinon M. / Mme selon la civilité, défaut M.
    const civ = currentUser.civilite === 'Mme' ? 'Mme' : 'M.'
    return `${civ} ${nom}${prenom}`
  }
  
  // ---------------- Navigation par rôle ----------------
  type NavLink = { href: string; label: string; icon: ReactNode; roles: Role[] }
  const navLinks: NavLink[] = [
    // Visible par tous
    { href: '/accueil', label: 'Accueil', icon: <FcHome size={18} />, roles: ['MEDECIN','INFIRMIER','TECHNICIEN_IMAGERIE','TECHNICIEN_LABORATOIRE','SECRETAIRES','PHARMACIEN','ADMINISTRATIF'] },

    // Médecin
    { href: '/medecin/patients', label: 'Patients', icon: <FcConferenceCall size={26} />, roles: ['MEDECIN'] },
    { href: '/archives', label: 'Archives', icon: <FcFolder size={26} />, roles: ['MEDECIN'] },
    { href: '/medecin/hospitalisations', label: 'Hospitalisations', icon: <FcCalendar size={26}/>, roles: ['MEDECIN'] },
    { href: '/medecin/operations', label: 'Opérations', icon: <FcCalendar size={26} />, roles: ['MEDECIN'] },
    { href: '/dossiers', label: 'Dossiers Médicaux', icon: <FcDocument size={26} />, roles: ['MEDECIN'] },
    { href: '/consultations', label: 'Consultations', icon: <FcAddressBook size={26} />, roles: ['MEDECIN'] },

    // Administration
    { href: '/dashboard', label: 'Tableau de bord', icon: <FcBullish size={26} />, roles: ['ADMINISTRATIF'] },
    { href: '/medecin/hospitalisations', label: 'Hospitalisations', icon: <FcCalendar size={26}/>, roles: ['ADMINISTRATIF'] },
    { href: '/medecin/operations', label: 'Opérations', icon: <FcCalendar size={26} />, roles: ['ADMINISTRATIF'] },
    { href: '/rapports', label: 'Rapports', icon: <FcPositiveDynamic size={26} />, roles: ['ADMINISTRATIF'] },

    // Examens (Labo & Imagerie)
    { href: '/medecin/examens', label: 'Examens', icon: <FcBiotech size={26} />, roles: ['TECHNICIEN_LABORATOIRE','TECHNICIEN_IMAGERIE'] },

    // Soins (infirmier)
    { href: '/soins', label: 'Soins', icon: <FcDislike size={26} />, roles: ['INFIRMIER'] },

    // Ordonnances (pharmacien) — à adapter à votre route réelle
    { href: '/pharmacie/ordonnances', label: 'Ordonnances', icon: <FcDocument size={26} />, roles: ['PHARMACIEN'] },
  ]

  const navigationLinks: NavLink[] = navLinks.filter(l => {
    if (l.label === 'Accueil') return true
    if (!role) return false
    return l.roles.includes(role as Role)
  })

  // Sous-menu Personnel (utilisé côté admin)
  const personnelLinks: { href: string; label: string; icon: ReactNode }[] = [
    { href: '/personnel/medecins', label: 'Médecins', icon: <FcBusinessman size={16} /> },
    { href: '/personnel/infirmiers', label: 'Infirmier/ères', icon: <FcDislike size={16} /> },
    { href: '/personnel/pharmaciens', label: 'Pharmaciens', icon: <FcBiotech size={16} /> },
    { href: '/personnel/techniciens-lab', label: 'Techniciens Labo', icon: <FcSurvey size={16} /> },
    { href: '/personnel/techniciens-imagerie', label: 'Techniciens Imagerie', icon: <FcPlus size={16} /> },
  ]
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPersonnelOpen, setIsPersonnelOpen] = useState(false)
  const [isPatientsOpen, setIsPatientsOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const personnelRef = useRef<HTMLDivElement>(null)
  const patientsRef = useRef<HTMLDivElement>(null)
  const [patientsPos, setPatientsPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })
  const [personnelPos, setPersonnelPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 'light')

  // Initialize theme from storage or system preference
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('theme') as 'light' | 'dark' | null
      let initial: 'light' | 'dark' = 'light'
      if (stored === 'light' || stored === 'dark') initial = stored
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) initial = 'dark'
      setTheme(initial)
      document.documentElement.setAttribute('data-theme', initial)
    } catch {}
  }, [])

  function toggleTheme() {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try { window.localStorage.setItem('theme', next) } catch {}
    document.documentElement.setAttribute('data-theme', next)
  }
  

  // Fermer les dropdowns en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (personnelRef.current && !personnelRef.current.contains(event.target as Node)) {
        setIsPersonnelOpen(false)
      }
      if (patientsRef.current && !patientsRef.current.contains(event.target as Node)) {
        setIsPatientsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculer la position des menus quand ils s'ouvrent
  useEffect(() => {
    if (isPatientsOpen && patientsRef.current) {
      const rect = patientsRef.current.getBoundingClientRect()
      setPatientsPos({ top: rect.bottom, left: rect.left, width: rect.width })
    }
  }, [isPatientsOpen])

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-900 shadow-lg">
      {/* Première ligne - Logo et Actions */}
      <div className="flex items-center justify-between h-22 px-4 border-b border-blue-700">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <Image 
              src="/images/image.png" 
              alt="Logo" 
              width={100} 
              height={100}
              className='rounded-full w-full h-full object-cover border border-blue-500' 
            />
          </div>
          <h1 className="text-lg font-bold text-white hidden md:block">MediGest Apk</h1>
        </div>

        {/* Actions droite */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors ring-1 ring-white/20"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {/* Bouton Ajouter Patient (visible uniquement pour SECRETAIRES) */}
          {role === 'SECRETAIRES' && (
            <Link
              href="/addpatient"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FcPlus size={20} />
              <span className="hidden sm:inline">Nouveau Patient</span>
            </Link>
          )}

          {/* Bouton Connexion (visible seulement si déconnecté) */}
          {!currentUser && (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors ring-1 ring-white/20"
            >
              Connexion
            </Link>
          )}

          {/* Profile Dropdown (uniquement si connecté) */}
          {currentUser && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-white hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <FcPortraitMode size={24} className="text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">{profileDisplayName()}</span>
                <FcExpand size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FcPortraitMode size={16} />
                    Mon Profil
                  </Link>
                  <Link
                    href="/parametres"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FcEngineering size={16} />
                    Paramètres
                  </Link>
                  <div className="border-t my-1"></div>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      try {
                        window.localStorage.removeItem('currentUser')
                        window.sessionStorage.removeItem('currentUser')
                      } catch {}
                      setCurrentUser(null)
                      setIsProfileOpen(false)
                      router.push('/login')
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deuxième ligne - Navigation horizontale */}
      <nav className="bg-blue-800/50 backdrop-blur-sm overflow-visible">
        <div className="flex items-center px-4 overflow-x-auto overflow-y-visible scrollbar-hide">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  transition-all duration-200 border-b-2
                  ${
                    isActive
                      ? 'text-white border-white bg-white/10'
                      : 'text-blue-100 border-transparent hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}

          {/* Menu déroulant Personnel (ADMINISTRATIF uniquement) */}
          {role === 'ADMINISTRATIF' && (
            <div className="relative" ref={personnelRef}>
              <button
                onClick={() => setIsPersonnelOpen(!isPersonnelOpen)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  transition-all duration-200 border-b-2
                  ${
                    isPersonnelOpen
                      ? 'text-white border-white bg-white/10'
                      : 'text-blue-100 border-transparent hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <FcBusinessman size={26} />
                <span className="hidden sm:inline">Personnel</span>
                <FcExpand size={14} className={`transition-transform ${isPersonnelOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Personnel via Portal */}
              {isPersonnelOpen && typeof window !== 'undefined' && createPortal(
                <div
                  className="fixed bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-[9999]"
                  style={{ top: personnelPos.top + 8, left: personnelPos.left, minWidth: Math.max(224, personnelPos.width) }}
                >
                  {personnelLinks.map((personnelLink) => {
                    const isPersonnelActive = pathname === personnelLink.href;
                    return (
                      <Link
                        key={personnelLink.href}
                        href={personnelLink.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 text-sm transition-colors
                          ${isPersonnelActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                        onClick={() => setIsPersonnelOpen(false)}
                      >
                        {personnelLink.icon}
                        <span>{personnelLink.label}</span>
                      </Link>
                    );
                  })}
                </div>,
                document.body
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}