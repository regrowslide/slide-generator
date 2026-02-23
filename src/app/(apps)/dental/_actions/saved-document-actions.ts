'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 保存済み文書一覧取得
export const getDentalSavedDocuments = async (params?: {
  where?: Prisma.DentalSavedDocumentWhereInput
  orderBy?: Prisma.DentalSavedDocumentOrderByWithRelationInput
}) => {
  const {where, orderBy} = params ?? {}
  return await prisma.dentalSavedDocument.findMany({
    where,
    orderBy: orderBy ?? {createdAt: 'desc'},
    include: {
      DentalPatient: true,
      DentalExamination: {include: {DentalVisitPlan: {include: {DentalFacility: true}}}},
    },
  })
}

// 保存済み文書取得
export const getDentalSavedDocument = async (id: number) => {
  return await prisma.dentalSavedDocument.findUnique({
    where: {id},
    include: {
      DentalPatient: true,
      DentalExamination: true,
    },
  })
}

// 保存済み文書作成
export const createDentalSavedDocument = async (data: {
  dentalClinicId?: number
  dentalPatientId: number
  dentalExaminationId: number
  templateId: string
  templateName: string
  pdfUrl?: string
  version?: number
}) => {
  return await prisma.dentalSavedDocument.create({data})
}

// 保存済み文書更新
export const updateDentalSavedDocument = async (
  id: number,
  data: {pdfUrl?: string; version?: number}
) => {
  return await prisma.dentalSavedDocument.update({where: {id}, data})
}

// 保存済み文書削除
export const deleteDentalSavedDocument = async (id: number) => {
  return await prisma.dentalSavedDocument.delete({where: {id}})
}
