import DoctorsOperations from '@/Component/Doctors/Operations_pro'

export const metadata = { title: 'Opérations | Médecin' }

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DoctorsOperations />
    </main>
  )
}
