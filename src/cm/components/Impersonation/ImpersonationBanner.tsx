'use client'

import {authClient} from 'src/lib/auth-client'

type Props = {
  userName: string
}

const ImpersonationBanner = ({userName}: Props) => {
  const handleStop = async () => {
    await authClient.admin.stopImpersonating()
    window.location.reload()
  }

  return (
    <div className="bg-amber-500 text-white text-center py-1 px-4 text-sm font-bold flex items-center justify-center gap-3"
      style={{position: 'sticky', top: 0, zIndex: 9999}}
    >
      <span>「{userName}」としてログイン中</span>
      <button
        onClick={handleStop}
        className="bg-white text-amber-600 px-3 py-0.5 rounded text-xs font-bold hover:bg-amber-50 transition-colors"
      >
        解除
      </button>
    </div>
  )
}

export default ImpersonationBanner
