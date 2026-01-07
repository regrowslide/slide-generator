'use client'

import React from 'react'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'
import { MODAL_SIZES } from '../../../constants/worksConstants'

interface WorkDetailModalProps {
  work: any | null
  isOpen: boolean
  onClose: () => void
}

/**
 * 実績詳細モーダルコンポーネント
 */
export const WorkDetailModal: React.FC<WorkDetailModalProps> = ({ work, isOpen, onClose }) => {
  if (!work) return null

  return (
    <ShadModal
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onClose()
      }}
      title="実績詳細"
      className="p-0"
      style={{
        maxWidth: MODAL_SIZES.MAX_WIDTH,
        width: '100%',
        maxHeight: MODAL_SIZES.MAX_HEIGHT,
      }}
      childrenProps={{
        className: `p-6 max-h-[${MODAL_SIZES.CONTENT_MAX_HEIGHT}] overflow-y-auto`,
      }}
    >
      <WorkCard work={work} />
    </ShadModal>
  )
}

