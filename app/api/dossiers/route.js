import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/dossiers?patientId=... -> retourner le dossier médical d'un patient
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const createdByEmail = searchParams.get('createdByEmail')
    if (patientId) {
      const dossier = await prisma.dossierMedical.findUnique({
        where: { patientId },
      })
      if (!dossier) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
      return NextResponse.json({ dossier }, { status: 200 })
    }
    if (createdByEmail) {
      const dossiers = await prisma.dossierMedical.findMany({
        where: { createdByEmail },
        select: { id: true, patientId: true }
      })
      return NextResponse.json({ dossiers }, { status: 200 })
    }
    return NextResponse.json({ error: 'Paramètre requis: patientId ou createdByEmail' }, { status: 400 })
  } catch (err) {
    const isDev = process.env.NODE_ENV !== 'production'
    console.error('GET /api/dossiers error:', err)
    return NextResponse.json({ error: 'Erreur serveur', details: isDev ? (err?.message || String(err)) : undefined }, { status: 500 })
  }
}

// POST /api/dossiers -> créer un dossier médical pour un patient donné (unique par patient)
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type doit être application/json' }, { status: 415 })
    }
    const body = await request.json()
    const {
      patientId,
      groupeSanguin,
      poids,
      taille,
      allergies,
      antecedents,
      traitementsEnCours,
      vaccinations,
      notes,
      createdByEmail,
    } = body || {}

    if (!patientId) {
      return NextResponse.json({ error: 'patientId requis' }, { status: 400 })
    }

    // Vérifier si un dossier existe déjà
    const existing = await prisma.dossierMedical.findUnique({ where: { patientId } })
    if (existing) {
      return NextResponse.json({ error: 'Un dossier médical existe déjà pour ce patient' }, { status: 409 })
    }

    const created = await prisma.dossierMedical.create({
      data: {
        patientId,
        groupeSanguin: groupeSanguin || null,
        poids: typeof poids === 'number' ? poids : null,
        taille: typeof taille === 'number' ? taille : null,
        allergies: Array.isArray(allergies) ? allergies : [],
        antecedents: Array.isArray(antecedents) || typeof antecedents === 'object' ? antecedents : null,
        traitementsEnCours: Array.isArray(traitementsEnCours) || typeof traitementsEnCours === 'object' ? traitementsEnCours : null,
        vaccinations: Array.isArray(vaccinations) || typeof vaccinations === 'object' ? vaccinations : null,
        notes: notes || null,
        createdByEmail: createdByEmail || null,
      }
    })

    return NextResponse.json({ message: 'Dossier créé', dossier: created }, { status: 201 })
  } catch (err) {
    const isDev = process.env.NODE_ENV !== 'production'
    console.error('POST /api/dossiers error:', err)
    return NextResponse.json({ error: 'Erreur serveur', details: isDev ? (err?.message || String(err)) : undefined }, { status: 500 })
  }
}
