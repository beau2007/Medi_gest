import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type doit être application/json' }, { status: 415 })
    }

    const body = await request.json()
    const { email, password } = body || {}

    // Validations basiques
    const errors = []
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('email')
    if (!password) errors.push('password')
    if (errors.length) {
      return NextResponse.json({ error: 'Champs invalides', details: errors }, { status: 400 })
    }

    // Recherche utilisateur
    const user = await prisma.personnel.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        nom: true,
        prenom: true,
        role: true,
        statut: true
      }
    })

    if (!user) {
      // Pour éviter l'énumération d'emails, même message pour mauvais mot de passe
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    // Réponse minimale sans mot de passe
    const { passwordHash, ...safeUser } = user
    return NextResponse.json({ message: 'Connexion réussie', user: safeUser }, { status: 200 })
  } catch (err) {
    const isDev = process.env.NODE_ENV !== 'production'
    console.error('Erreur login:', err)
    return NextResponse.json({ error: 'Erreur serveur', details: isDev ? (err?.message || String(err)) : undefined }, { status: 500 })
  }
}
