'use client'

import { WorkCard } from '@app/(apps)/KM/(public)/top/WorkCard'



interface WorkPreviewProps {
  work: any
  onClose: () => void
  className?: string
}

export const WorkPreview = ({ work, onClose, className }: WorkPreviewProps) => {
  // const StarRating = ({ rating, label }: { rating: number; label: string }) => (
  //   <div className="text-center">
  //     <div className="text-sm text-gray-500">{label}</div>
  //     <div className="flex items-center justify-center gap-1 mt-1">
  //       <span className="text-2xl font-bold text-amber-600">{rating || '-'}</span>
  //       {rating && (
  //         <div className="flex">
  //           {Array.from({ length: 5 }, (_, i) => (
  //             <Star
  //               key={i}
  //               className={`h-5 w-5 ${i < Math.ceil(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
  //             />
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // )

  // // 定量成果の最初の行を取得
  // const mainResult = work.quantitativeResult?.split('\n')[0] || work.description?.substring(0, 50)



  return (
    <div ><WorkCard
      className={className}
      work={work} /></div>
  )
}
