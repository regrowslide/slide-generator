'use server'

import prisma from 'src/lib/prisma'
import {requireAuth} from '../lib/auth'

export async function getTennisMembers() {
  await requireAuth()
  return prisma.user.findMany({
    where: {
      active: true,
      lineUserId: {not: null},
    },
    select: {id: true, name: true, avatar: true},
    orderBy: {name: 'asc'},
  })
}
