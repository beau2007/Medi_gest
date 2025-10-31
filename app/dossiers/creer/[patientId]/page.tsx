import prisma from '@/lib/prisma'
import DossierMedicalForm from '../../../../Component/Secretaire/DossierMedicalForm'

export const dynamic = 'force-dynamic'

export default async function CreerDossierPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, nom: true, prenom: true, numeroDossier: true }
  })

  if (!patient) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Patient introuvable</h1>
        <p className="text-slate-600">Impossible de créer un dossier médical pour un patient inexistant.</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-emerald-400 to-teal-500">
          <h1 className="text-lg md:text-xl font-semibold text-white">Créer un dossier médical</h1>
          <p className="mt-1 text-sm text-white">{patient.nom} {patient.prenom ?? ''} • Dossier #{patient.numeroDossier}</p>
        </div>
        <div className="px-6 py-6">
          <DossierMedicalForm patientId={patient.id} />
        </div>
      </div>
    </main>
  )
}
