'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 保存済み文書一覧取得
export const getDentalSavedDocuments = async (params?: {
  where?: Prisma.DentalSavedDocumentWhereInput
  orderBy?: Prisma.DentalSavedDocumentOrderByWithRelationInput
  dentalClinicId?: number
}) => {
  const {where, orderBy, dentalClinicId} = params ?? {}
  return await prisma.dentalSavedDocument.findMany({
    where: {...where, ...(dentalClinicId ? {dentalClinicId} : {})},
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
  templateData?: Record<string, unknown>
  pdfUrl?: string
  version?: number
}) => {
  return await prisma.dentalSavedDocument.create({
    data: {
      ...data,
      templateData: data.templateData as Prisma.InputJsonValue,
    },
  })
}

// 保存済み文書更新
export const updateDentalSavedDocument = async (
  id: number,
  data: {templateData?: Record<string, unknown>; pdfUrl?: string; version?: number; downloadedAt?: Date | null}
) => {
  return await prisma.dentalSavedDocument.update({
    where: {id},
    data: {
      ...data,
      templateData: data.templateData ? (data.templateData as Prisma.InputJsonValue) : undefined,
    },
  })
}

// 保存済み文書削除
export const deleteDentalSavedDocument = async (id: number) => {
  return await prisma.dentalSavedDocument.delete({where: {id}})
}

// 診察に紐づく保存済みテンプレートの状態を取得
export type SavedTemplateStatus = {
  templateId: string
  pdfUrl: string | null
  downloadedAt: string | null
}

export const getSavedTemplateStatuses = async (examinationId: number): Promise<SavedTemplateStatus[]> => {
  const docs = await prisma.dentalSavedDocument.findMany({
    where: {dentalExaminationId: examinationId},
    select: {templateId: true, pdfUrl: true, downloadedAt: true},
  })
  // templateIdごとに1件のみ返す（重複排除）
  const map = new Map<string, SavedTemplateStatus>()
  for (const d of docs) {
    map.set(d.templateId, {
      templateId: d.templateId,
      pdfUrl: d.pdfUrl,
      downloadedAt: d.downloadedAt?.toISOString() ?? null,
    })
  }
  return [...map.values()]
}

// 文書のダウンロード済みフラグを一括記録
export const markDocumentsDownloaded = async (ids: number[]): Promise<void> => {
  await prisma.dentalSavedDocument.updateMany({
    where: {id: {in: ids}, downloadedAt: null},
    data: {downloadedAt: new Date()},
  })
}
