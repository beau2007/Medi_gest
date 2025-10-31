import prisma from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DossierPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params
  // Charger patient + dossier
  const [patient, dossier] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, nom: true, prenom: true, numeroDossier: true, dateNaissance: true, sexe: true },
    }),
    prisma.dossierMedical.findUnique({
      where: { patientId },
      select: {
        id: true,
        groupeSanguin: true,
        poids: true,
        taille: true,
        allergies: true,
        antecedents: true,
        traitementsEnCours: true,
        vaccinations: true,
        notes: true,
      },
    }),
  ])

  if (!patient) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Patient introuvable</h1>
        <p className="text-slate-600">Aucun patient avec l'identifiant fourni.</p>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-emerald-400 to-teal-500">
          <h1 className="text-lg md:text-xl font-semibold text-white">Dossier médical</h1>
          <p className="mt-1 text-sm text-white">{patient.nom} {patient.prenom ?? ''} • Dossier #{patient.numeroDossier}</p>
        </div>

        {!dossier ? (
          <div className="px-6 py-6">
            <div className="rounded-md bg-yellow-50 text-yellow-800 text-sm px-3 py-3 border border-yellow-200">
              Aucun dossier médical n'a été créé pour ce patient.
            </div>
            <div className="mt-4">
              <Link href={`/dossiers/creer/${patient.id}`} className="text-emerald-700 hover:text-emerald-800">
                Créer un dossier médical pour ce patient →
              </Link>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info label="Groupe sanguin" value={dossier.groupeSanguin || '—'} />
              <Info label="Poids (kg)" value={dossier.poids != null ? String(dossier.poids) : '—'} />
              <Info label="Taille (cm)" value={dossier.taille != null ? String(dossier.taille) : '—'} />
            </div>

            <Block label="Allergies">
              {Array.isArray(dossier.allergies) && dossier.allergies.length > 0 ? (
                <ul className="list-disc list-inside text-slate-700 text-sm">
                  {dossier.allergies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              ) : (
                <span className="text-slate-500 text-sm">Aucune</span>
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
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{dossier.notes || '—'}</p>
            </Block>
          </div>
        )}
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string, value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-slate-800 text-sm">{value}</div>
    </div>
  )
}

function Block({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-slate-700 mb-2">{label}</h2>
      <div className="rounded-lg bg-white ring-1 ring-slate-200 p-4">{children}</div>
    </section>
  )
}

function PreJson({ value }: { value: any }) {
  if (!value) return <span className="text-slate-500 text-sm">—</span>
  return (
    <pre className="text-xs text-slate-700 overflow-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}
