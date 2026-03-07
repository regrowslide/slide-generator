'use server'

import prisma from 'src/lib/prisma'
import type {AttendanceStatus} from '../lib/types'
import {requireAuth} from '../lib/auth'

export async function upsertAttendance(eventId: number, userId: number, status: AttendanceStatus) {
  await requireAuth()
  return prisma.tennisAttendance.upsert({
    where: {tennisEventId_userId: {tennisEventId: eventId, userId}},
    create: {tennisEventId: eventId, userId, status},
    update: {status},
  })
}

export async function updateAttendanceComment(eventId: number, userId: number, comment: string) {
  await requireAuth()
  return prisma.tennisAttendance.update({
    where: {tennisEventId_userId: {tennisEventId: eventId, userId}},
    data: {comment},
  })
}

export async function removeAttendance(eventId: number, userId: number) {
  await requireAuth()
  return prisma.tennisAttendance.delete({
    where: {tennisEventId_userId: {tennisEventId: eventId, userId}},
  })
}
