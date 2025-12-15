import prisma from 'src/lib/prisma'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { WorksAdminCC } from './WorksAdminCC'

export default async function WorksAdminPage() {
  const { session, scopes } = await initServerComopnent({ query: {} })

  // クライアント一覧を取得（sortOrderでソート）
  const clients = await prisma.kaizenClient.findMany({
    orderBy: [{ sortOrder: 'asc' }, { public: 'desc' }, { name: 'asc' }],
  })

  // 実績一覧を取得（クライアント情報と画像を含む、sortOrderでソート）
  const works = await prisma.kaizenWork.findMany({
    include: {
      KaizenClient: true,
      KaizenWorkImage: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
  })

  return (
    <div className=" bg-gray-100">
      <WorksAdminCC clients={clients} works={works} />
    </div>
  )
}
