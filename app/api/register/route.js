import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type doit être application/json' }, { status: 415 })
    }

    const body = await request.json()

    const {
      matricule,
      civilite,
      nom,
      prenom,
      email,
      password,
      telephone,
      specialite,
      role,
      statut
    } = body || {}

    // Champs requis
    const missing = []
    if (!matricule) missing.push('matricule')
    if (!civilite) missing.push('civilite')
    if (!nom) missing.push('nom')
    if (!prenom) missing.push('prenom')
    if (!email) missing.push('email')
    if (!password) missing.push('password')
    if (!role) missing.push('role')

    if (missing.length) {
      return NextResponse.json({ error: 'Champs manquants', details: missing }, { status: 400 })
    }

    // Validation du role (enum Prisma)
    const allowedRoles = new Set([
      'MEDECIN',
      'INFIRMIER',
      'TECHNICIEN_IMAGERIE',
      'ADMINISTRATIF',
      'TECHNICIEN_LABORATOIRE',
      'SECRETAIRES',
      'PHARMACIEN'
    ])
    const roleUpper = String(role).toUpperCase()
    if (!allowedRoles.has(roleUpper)) {
      return NextResponse.json({ error: 'Role invalide', expected: Array.from(allowedRoles) }, { status: 400 })
    }

    // Vérifier doublons (email ou matricule)
    const existing = await prisma.personnel.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { matricule }]
      },
      select: { id: true, email: true, matricule: true }
    })

    if (existing) {
      const conflict = existing.email === email.toLowerCase() ? 'email' : 'matricule'
      return NextResponse.json({ error: `Conflit sur ${conflict} déjà utilisé` }, { status: 409 })
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Création
    const created = await prisma.personnel.create({
      data: {
        matricule,
        civilite,
        nom,
        prenom,
        email: email.toLowerCase(),
        passwordHash,
        telephone: telephone || null,
        specialite: specialite || null,
        role: roleUpper,
        statut: statut || undefined // Prisma appliquera la valeur par défaut
      },
      select: {
        id: true,
        matricule: true,
        civilite: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        specialite: true,
        role: true,
        statut: true,
        createdAt: true
      }
    })

    return NextResponse.json({ message: 'Employé créé avec succès', personnel: created }, { status: 201 })
  } catch (err) {
    console.error('Erreur inscription personnel:', err)
    // Gestion erreurs Prisma (doublons unique)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Conflit de contrainte unique (email ou matricule déjà utilisé)' }, { status: 409 })
      }
    }
    const isDev = process.env.NODE_ENV !== 'production'
    return NextResponse.json({ error: 'Erreur serveur', details: isDev ? (err?.message || String(err)) : undefined }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
