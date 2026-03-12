'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

// 種目マスタ一覧取得（ユーザー別）
export async function getExerciseMasters(userId: string) {
  return await doStandardPrisma('exerciseMaster', 'findMany', {
    where: {userId},
    orderBy: [{part: 'asc'}, {name: 'asc'}],
  })
}

// 種目マスタ作成
export async function createExerciseMaster(userId: string, data: any) {
  return await doStandardPrisma('exerciseMaster', 'create', {
    data: {
      ...data,
      userId,
    },
  })
}

// 種目マスタ更新
export async function updateExerciseMaster(userId: string, id: number, data: any) {
  return await doStandardPrisma('exerciseMaster', 'update', {
    where: {id, userId}, // ユーザーIDも条件に含める
    data,
  })
}

// 種目マスタ削除
export async function deleteExerciseMaster(userId: string, id: number) {
  return await doStandardPrisma('exerciseMaster', 'delete', {
    where: {id, userId}, // ユーザーIDも条件に含める
  })
}
