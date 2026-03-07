'use server'

import prisma from 'src/lib/prisma'
import type {CourtFormData} from '../lib/types'
import {requireAuth} from '../lib/auth'

export async function getCourts() {
  await requireAuth()
  return prisma.tennisCourt.findMany({
    where: {isDeleted: false},
    orderBy: {sortOrder: 'asc'},
  })
}

export async function createCourt(data: CourtFormData) {
  await requireAuth()
  return prisma.tennisCourt.create({
    data: {
      name: data.name,
      address: data.address || null,
      googleMapsUrl: data.googleMapsUrl || null,
      courtNumbers: data.courtNumbers,
      schedulePageKey: data.schedulePageKey || null,
    },
  })
}

export async function updateCourt(id: number, data: CourtFormData) {
  await requireAuth()
  return prisma.tennisCourt.update({
    where: {id},
    data: {
      name: data.name,
      address: data.address || null,
      googleMapsUrl: data.googleMapsUrl || null,
      courtNumbers: data.courtNumbers,
      schedulePageKey: data.schedulePageKey || null,
    },
  })
}

export async function deleteCourt(id: number) {
  await requireAuth()
  return prisma.tennisCourt.update({
    where: {id},
    data: {isDeleted: true},
  })
}

const SEED_COURTS = [
  {
    name: '県営コート',
    address: '岡山県岡山市北区いずみ町2-1',
    googleMapsUrl: 'https://maps.app.goo.gl/RJ5phkgyTeokPrXc6',
    courtNumbers: ['南1', '南2', '南3', '南4', '南5', '南6', '南7', '南8', '南9', '南10', '北11', '北12', '北13', '北14'],
  },
  {
    name: 'ハチヤ',
    address: '岡山県岡山市北区富原1297',
    googleMapsUrl: 'https://maps.app.goo.gl/wNSdjp45PRAF8tiz9',
    courtNumbers: ['1', '2', '3', '4', '5'],
  },
]

export async function seedCourts() {
  await requireAuth()
  const results = await Promise.all(
    SEED_COURTS.map((court) =>
      prisma.tennisCourt.create({data: court})
    )
  )
  return results
}
