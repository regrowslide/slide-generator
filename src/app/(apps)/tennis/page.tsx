import {redirect} from 'next/navigation'
import {getServerSession} from 'next-auth'
import {authOptions} from '@app/api/auth/[...nextauth]/constants/authOptions'

export default async function TennisTopPage() {
  const session = (await getServerSession(authOptions)) as any

  if (!session) {
    redirect('/tennis/login')
  }

  // TODO: 基本CRUD実装後にメインページを作成
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-800">テニスカレンダー</h1>
        <p className="text-sm text-slate-500 mt-2">ようこそ、{session.user?.name ?? 'ユーザー'}さん</p>
        <p className="text-xs text-slate-400 mt-4">メインページは準備中です</p>
      </div>
    </div>
  )
}
