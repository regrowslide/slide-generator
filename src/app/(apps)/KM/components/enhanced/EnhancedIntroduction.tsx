'use client'

import { useEffect, useState } from 'react'
import BackGroundImage from '@cm/components/utils/BackGroundImage'
import { IntroductionMessage } from './IntroductionMessage'

export const EnhancedIntroduction = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const bgUrl = '/image/KM/intro-bg.png'

  return (
    <header id="introduction" className="relative min-h-screen overflow-hidden" role="banner">
      {/* オーバーレイ */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/50" />
      <BackGroundImage {...{ url: bgUrl, alt: '改善マニア システム開発・業務改善のプロフェッショナル' }} />
      <IntroductionMessage isVisible={isVisible} />
    </header>
  )
}
