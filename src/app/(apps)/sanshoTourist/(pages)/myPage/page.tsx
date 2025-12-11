import prisma from 'src/lib/prisma'
import { MyPageCC } from './MyPageCC'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

// データ取得
const getInitialData = async () => {
 // 車両一覧
 const vehicles = await prisma.stVehicle.findMany({
  where: { active: true },
  orderBy: { sortOrder: 'asc' },
 })

 return {
  vehicles,
 }
}

export default async function MyPagePage(props) {
 const query = await props.searchParams

 // セッションとスコープを取得
 const { session } = await initServerComopnent({ query })
 const userId = session?.id

 if (!userId) {
  return (
   <div className="p-4 text-center">
    <p className="text-gray-500">ログインしてください。</p>
   </div>
  )
 }

 // ユーザーがsanshoTouristアプリを持っているか確認
 const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
   id: true,
   name: true,
   apps: true,
  },
 })

 if (!user || !user.apps?.includes('sanshoTourist')) {
  return (
   <div className="p-4 text-center">
    <p className="text-gray-500">このアプリへのアクセス権限がありません。</p>
    <p className="text-sm text-gray-400 mt-2">管理者に連絡してください。</p>
   </div>
  )
 }

 const { vehicles } = await getInitialData()

 return (
  <div>
   <MyPageCC userId={userId} userName={user.name || '不明'} vehicles={vehicles} />
  </div>
 )
}
