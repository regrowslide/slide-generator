import { Absolute, CenterScreen } from '@cm/components/styles/common-components/common-components'
import Link from 'next/link'
import React from 'react'

export default function TopPage() {
 return (
  <CenterScreen>

   <div className="flex flex-col gap-8 mt-16 items-center justify-center">
    <Link
     href="/curious/recipeCalculator"
     className="group w-80 rounded-xl border shadow-md hover:shadow-lg p-8 bg-gradient-to-br from-blue-50 to-white transition-all hover:from-blue-100 hover:scale-105 text-center"
    >
     <div className="text-2xl font-bold mb-2 text-blue-700 group-hover:text-blue-800 transition-colors">
      原価計算
     </div>
     <div className="text-gray-500">
      食品製造の原価計算アプリ
     </div>
    </Link>
    <Link
     href="/curious/kaigoshokuManagement"
     className="group w-80 rounded-xl border shadow-md hover:shadow-lg p-8 bg-gradient-to-br from-teal-50 to-white transition-all hover:from-teal-100 hover:scale-105 text-center"
    >
     <div className="text-2xl font-bold mb-2 text-teal-700 group-hover:text-teal-800 transition-colors">
      介護食管理
     </div>
     <div className="text-gray-500">
      介護施設向け献立・発注管理
     </div>
    </Link>
   </div>

  </CenterScreen>
 )
}
