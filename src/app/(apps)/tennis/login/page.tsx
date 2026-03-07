'use client'

import { signIn } from 'next-auth/react'
import { CircleDot } from 'lucide-react'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import Redirector from '@cm/components/utils/Redirector'

export default function TennisLoginPage() {
  const { session, query } = useGlobal()
  const allowLineLogin = process.env.NEXT_PUBLIC_ALLOW_LINE_LOGIN === 'true'
  if (session?.lineUserId) {
    return <Redirector {...{ redirectPath: '/tennis' }} />
  }



  const handleLineLogin = async () => {
    await signIn('line', { redirect: HREF('/tennis/login', {}, query) as any })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CircleDot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">テニスカレンダー</h1>
          <p className="text-sm text-slate-500 mt-1">サークルの予定管理をもっとカンタンに</p>
        </div>

        {/* LINEログインボタン */}
        {allowLineLogin ? (
          <button
            onClick={handleLineLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#06C755] text-white font-bold rounded-xl px-4 py-3.5 shadow-md hover:bg-[#05b64d] active:bg-[#04a344] transition-colors"
          >
            <LineIcon />
            LINEでログイン
          </button>
        ) : (
          <div className="text-center">
            <div className="w-full flex items-center justify-center gap-3 bg-slate-200 text-slate-400 font-bold rounded-xl px-4 py-3.5 cursor-not-allowed">
              <LineIcon />
              LINEログインは現在利用できません
            </div>
            <p className="text-xs text-slate-400 mt-3">環境変数 NEXT_PUBLIC_ALLOW_LINE_LOGIN が設定されていません</p>
          </div>
        )}
      </div>
    </div>
  )
}

const LineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
)
