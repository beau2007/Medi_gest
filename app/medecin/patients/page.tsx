import DoctorsPatients from '@/Component/Doctors/Patients'

export const metadata = { title: 'Mes patients | Médecin' }

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DoctorsPatients />
    </main>
  )
}
