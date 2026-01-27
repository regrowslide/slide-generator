'use client'

import { Kaizen } from '@app/(apps)/KM/class/Kaizen'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { T_LINK } from '@cm/components/styles/common-components/links'
import Image from 'next/image'

export const Developer = () => {
  return (
    <>
      <R_Stack className={`  mx-auto w-full gap-8  font-normal  justify-start `}>
        <T_LINK target={'_blank'} href={Kaizen.const.coconara.myPage}>
          <div className={`bg-white h-[80px] flex items-center px-4`}><Image src={Kaizen.const.coconara.icon} width={200} height={60} alt="" /></div>
        </T_LINK>

        <T_LINK target={'_blank'} href={Kaizen.const.lancers.myPage}>
          <div className={`bg-white h-[80px] flex items-center px-4`}><Image src={Kaizen.const.lancers.icon} width={200} height={60} alt="" /></div>
          {/* <ImageLabel
            {...{
              src: Kaizen.const.lancers.icon,
              label: '改善マニア@Lancers',
            }}
          /> */}
        </T_LINK>
      </R_Stack>
    </>
  )
}
