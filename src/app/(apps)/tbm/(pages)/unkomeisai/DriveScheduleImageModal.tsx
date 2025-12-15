'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { TbmDriveScheduleImage } from '@prisma/generated/prisma/client'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import ContentPlayer from '@cm/components/utils/ContentPlayer'

interface DriveScheduleImageModalProps {
  images: TbmDriveScheduleImage[]
  date?: Date | null
  routeGroupName?: string | null
}

export default function DriveScheduleImageModal({ images, date, routeGroupName }: DriveScheduleImageModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <ImageIcon className="w-16 h-16 mb-4" />
        <p>登録された画像がありません</p>
      </div>
    )
  }

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  return (
    <div className="p-4">
      {/* ヘッダー情報 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">登録画像一覧</h2>
        <div className="text-sm text-gray-600">
          {date && <span className="mr-4">日付: {formatDate(date, 'short')}</span>}
          {routeGroupName && <span>便名: {routeGroupName}</span>}
        </div>
        <div className="text-sm text-gray-500 mt-1">{images.length} 件の画像</div>
      </div>

      {/* サムネイルグリッド */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
          // onClick={() => setSelectedIndex(index)}
          >
            <ContentPlayer
              src={image.imageUrl}
              alt={`画像 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <img
              src={image.imageUrl}
              alt={`画像 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
              {formatDate(image.createdAt, 'short')}
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}
