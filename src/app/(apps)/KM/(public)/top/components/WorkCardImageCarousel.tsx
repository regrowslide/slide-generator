'use client'

import BasicCarousel from '@cm/components/utils/Carousel/BasicCarousel'

interface WorkCardImageCarouselProps {
  images?: Array<{ url: string }>
}

export const WorkCardImageCarousel = ({ images }: WorkCardImageCarouselProps) => {
  if (!images || images.length === 0) return null

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white p-2 sm:p-4">
      <BasicCarousel
        {...{
          imgStyle: {},
          Images: images.map(obj => ({ imageUrl: obj.url })),
        }}
      />
    </div>
  )
}
