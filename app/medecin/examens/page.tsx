import DoctorsExamens from '@/Component/Doctors/Examens'

export const metadata = { title: 'Examens | Médecin' }

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DoctorsExamens />
    </main>
  )
}
