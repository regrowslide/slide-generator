/**
 * フローティングCTA表示管理用のカスタムフック
 */

import { useState, useEffect } from 'react'

interface UseFloatingCTAOptions {
  triggerSectionId: string
  hideBeforeSectionId: string
}

export const useFloatingCTA = ({ triggerSectionId, hideBeforeSectionId }: UseFloatingCTAOptions) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const triggerSection = document.getElementById(triggerSectionId)
      const hideBeforeSection = document.getElementById(hideBeforeSectionId)

      if (triggerSection && hideBeforeSection) {
        const triggerRect = triggerSection.getBoundingClientRect()
        const hideBeforeRect = hideBeforeSection.getBoundingClientRect()

        // トリガーセクションに入り、非表示セクションに到達する前まで表示
        const isInTriggerSection = triggerRect.top < window.innerHeight && triggerRect.bottom > 0
        const isBeforeHideSection = hideBeforeRect.top > window.innerHeight

        setIsVisible(isInTriggerSection && isBeforeHideSection)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初期値設定

    return () => window.removeEventListener('scroll', handleScroll)
  }, [triggerSectionId, hideBeforeSectionId])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return {
    isVisible,
    scrollToSection,
  }
}

