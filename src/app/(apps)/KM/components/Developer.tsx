'use client'

import { Kaizen } from '@app/(apps)/KM/class/Kaizen'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { T_LINK } from '@cm/components/styles/common-components/links'
import Image from 'next/image'

export const Developer = () => {
  return (
    <C_Stack>
      <R_Stack className={` justify-center mx-auto w-fit gap-8  font-normal`}>
        <T_LINK target={'_blank'} href={Kaizen.const.coconara.myPage}>
          <Image src={Kaizen.const.coconara.icon} width={200} height={60} alt="" />
        </T_LINK>

        <T_LINK target={'_blank'} href={Kaizen.const.lancers.myPage}>
          <Image src={Kaizen.const.lancers.icon} width={200} height={60} alt="" />
          {/* <ImageLabel
            {...{
              src: Kaizen.const.lancers.icon,
              label: '改善マニア@Lancers',
            }}
          /> */}
        </T_LINK>
      </R_Stack>
    </C_Stack>
  )
}
