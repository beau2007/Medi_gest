import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/patients -> liste des patients (simple, tri par createdAt desc)
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numeroDossier: true,
        civilite: true,
        nom: true,
        prenom: true,
        dateNaissance: true,
        sexe: true,
        email: true,
        telephone: true,
        ville: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ patients }, { status: 200 })
  } catch (err) {
    const isDev = process.env.NODE_ENV !== 'production'
    console.error('GET /api/patients error:', err)
    return NextResponse.json({ error: 'Erreur serveur', details: isDev ? (err?.message || String(err)) : undefined }, { status: 500 })
  }
}

// POST /api/patients -> créer un patient
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type doit être application/json' }, { status: 415 })
    }

    const body = await request.json()
    const {
      numeroDossier,
      civilite,
      nom,
      prenom,
      dateNaissance,
      sexe,
      email,
      telephone,
      adresse,
      ville,
      codePostal,
    } = body || {}

    const missing = []
    if (!numeroDossier) missing.push('numeroDossier')
    if (!civilite) missing.push('civilite')
    if (!nom) missing.push('nom')
    if (!prenom) missing.push('prenom')
    if (!dateNaissance) missing.push('dateNaissance')
    if (!sexe) missing.push('sexe')
    if (missing.length) {
      return NextResponse.json({ error: 'Champs manquants', details: missing }, { status: 400 })
    }

    // Validation basique
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Parsing de la date (accepte déjà ISO yyyy-mm-dd)
    const dob = new Date(dateNaissance)
    if (isNaN(dob.getTime())) {
      return NextResponse.json({ error: 'dateNaissance invalide' }, { status: 400 })
    }

    // Création
    const created = await prisma.patient.create({
      data: {
        numeroDossier,
        civilite,
        nom,
        prenom,
        dateNaissance: dob,
        sexe,
        email: email || null,
        telephone: telephone || null,
        adresse: adresse || null,
        ville: ville || null,
        codePostal: codePostal || null,
      },
      select: {
        id: true,
        numeroDossier: true,
        civilite: true,
        nom: true,
        prenom: true,
        dateNaissance: true,
        sexe: true,
        email: true,
        telephone: true,
        adresse: true,
        ville: true,
        codePostal: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ message: 'Patient créé', patient: created }, { status: 201 })
  } catch (err) {
    console.error('POST /api/patients error:', err)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'numeroDossier déjà utilisé' }, { status: 409 })
      }
    }
    const isDev = process.env.NODE_ENV !== 'production'
    return NextResponse.json({ error: 'Erreur serveur', details: isDev ? (err?.message || String(err)) : undefined }, { status: 500 })
  }
}
