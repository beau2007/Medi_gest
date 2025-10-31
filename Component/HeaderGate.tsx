"use client"
import { usePathname } from 'next/navigation'
import Header from '@/Component/Headers'

const HIDDEN_ON = new Set<string>([
  '/login',
  '/register',
])

export default function HeaderGate() {
  const pathname = usePathname()
  // Hide header on exact auth routes; extend as needed
  if (pathname && HIDDEN_ON.has(pathname)) return null
  return <Header />
}
