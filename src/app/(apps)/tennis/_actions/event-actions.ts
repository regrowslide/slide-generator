'use server'

import prisma from 'src/lib/prisma'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import type {EventFormData} from '../lib/types'
import {requireAuth} from '../lib/auth'

const EVENT_INCLUDE = {
  Creator: {select: {id: true, name: true, avatar: true}},
  TennisEventCourt: {include: {TennisCourt: true}},
  TennisAttendance: {include: {User: {select: {id: true, name: true, avatar: true}}}},
} as const

export async function getEventsByRange(from: string, to: string) {
  await requireAuth()
  const startDate = toUtc(new Date(from + 'T00:00:00'))
  const endDate = toUtc(new Date(to + 'T00:00:00'))
  // toの日付を含むため1日加算
  endDate.setDate(endDate.getDate() + 1)

  return prisma.tennisEvent.findMany({
    where: {
      isDeleted: false,
      date: {gte: startDate, lt: endDate},
    },
    include: EVENT_INCLUDE,
    orderBy: [{date: 'asc'}, {startTime: 'asc'}],
  })
}

export async function getEventById(id: number) {
  await requireAuth()
  return prisma.tennisEvent.findUnique({
    where: {id, isDeleted: false},
    include: EVENT_INCLUDE,
  })
}

export async function createEvent(data: EventFormData, creatorId: number) {
  await requireAuth()
  const eventDate = toUtc(new Date(data.date + 'T00:00:00'))

  return prisma.tennisEvent.create({
    data: {
      title: data.title,
      date: eventDate,
      startTime: data.startTime,
      endTime: data.endTime,
      memo: data.memo || null,
      creatorId,
      TennisEventCourt: {
        create: data.courts.map(c => ({
          tennisCourtId: c.courtId,
          courtNumber: c.courtNumber,
          status: c.status,
        })),
      },
      TennisAttendance: {
        create: {userId: creatorId, status: 'yes'},
      },
    },
    include: EVENT_INCLUDE,
  })
}

export async function updateEvent(id: number, data: EventFormData) {
  const {userId} = await requireAuth()
  const existing = await prisma.tennisEvent.findUnique({where: {id}, select: {creatorId: true}})
  if (!existing || existing.creatorId !== userId) {
    throw new Error('この予定を編集する権限がありません')
  }

  const eventDate = toUtc(new Date(data.date + 'T00:00:00'))

  return prisma.$transaction(async (tx) => {
    await tx.tennisEventCourt.deleteMany({where: {tennisEventId: id}})
    return tx.tennisEvent.update({
      where: {id},
      data: {
        title: data.title,
        date: eventDate,
        startTime: data.startTime,
        endTime: data.endTime,
        memo: data.memo || null,
        TennisEventCourt: {
          create: data.courts.map(c => ({
            tennisCourtId: c.courtId,
            courtNumber: c.courtNumber,
            status: c.status,
          })),
        },
      },
      include: EVENT_INCLUDE,
    })
  })
}

export async function toggleCourtStatus(eventCourtId: number) {
  await requireAuth()
  const ec = await prisma.tennisEventCourt.findUnique({where: {id: eventCourtId}})
  if (!ec) throw new Error('コートが見つかりません')
  const newStatus = ec.status === 'reserved' ? 'planned' : 'reserved'
  return prisma.tennisEventCourt.update({
    where: {id: eventCourtId},
    data: {status: newStatus},
    include: {TennisCourt: true},
  })
}

export async function deleteEvent(id: number) {
  const {userId} = await requireAuth()
  const existing = await prisma.tennisEvent.findUnique({where: {id}, select: {creatorId: true}})
  if (!existing || existing.creatorId !== userId) {
    throw new Error('この予定を削除する権限がありません')
  }
  return prisma.tennisEvent.update({
    where: {id},
    data: {isDeleted: true},
  })
}
