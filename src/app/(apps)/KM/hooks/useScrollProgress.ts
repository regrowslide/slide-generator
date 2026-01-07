/**
 * スクロール進捗管理用のカスタムフック
 */

import { useState, useEffect } from 'react'

interface UseScrollProgressOptions {
  startSectionId: string
  endSectionId: string
}

export const useScrollProgress = ({ startSectionId, endSectionId }: UseScrollProgressOptions) => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const startSection = document.getElementById(startSectionId)
      const endSection = document.getElementById(endSectionId)

      if (startSection && endSection) {
        const startTop = startSection.offsetTop
        const endTop = endSection.offsetTop
        const windowHeight = window.innerHeight
        const scrollY = window.scrollY

        // 開始セクションから終了セクションまでの進捗を計算
        const totalDistance = endTop - startTop
        const scrolledDistance = scrollY + windowHeight - startTop
        const progress = Math.min(Math.max(scrolledDistance / totalDistance, 0), 1)

        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初期値設定

    return () => window.removeEventListener('scroll', handleScroll)
  }, [startSectionId, endSectionId])

  return scrollProgress
}

