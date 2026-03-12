import prisma from 'src/lib/prisma'

// ログインユーザーのクリニックIDを取得（User.dentalClinicId）
export const getUserClinicId = async (userId: string): Promise<number | null> => {
  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {dentalClinicId: true},
  })
  return user?.dentalClinicId ?? null
}
