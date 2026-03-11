'use server'

import prisma from 'src/lib/prisma'

/** 全セッション一覧取得 */
export async function getGyoseiSessions() {
  const sessions = await prisma.gyoseiSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      GyoseiFile: { select: { id: true } },
    },
  })

  return sessions.map((s) => {
    const analysisResult = s.analysisResult as { tasks?: unknown[] } | null
    return {
      id: s.id,
      uuid: s.uuid,
      createdAt: s.createdAt.toISOString(),
      status: s.status,
      grantStatus: s.grantStatus,
      email: s.email,
      fileCount: s.GyoseiFile.length,
      taskCount: analysisResult?.tasks?.length ?? 0,
    }
  })
}

/** セッション詳細取得 */
export async function getGyoseiSessionDetail(uuid: string) {
  const session = await prisma.gyoseiSession.findUnique({
    where: { uuid },
    include: { GyoseiFile: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!session) return null

  return {
    id: session.id,
    uuid: session.uuid,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt?.toISOString() ?? null,
    status: session.status,
    grantStatus: session.grantStatus,
    adoptionDate: session.adoptionDate,
    grantDecisionDate: session.grantDecisionDate,
    email: session.email,
    analysisResult: session.analysisResult as {
      tasks?: { category: string; task: string; deadline: string; responsible: string; priority: string; notes: string }[]
      reportGuide?: string
    } | null,
    files: session.GyoseiFile.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      blobUrl: f.blobUrl,
      fileType: f.fileType,
      createdAt: f.createdAt.toISOString(),
    })),
  }
}
