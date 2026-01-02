import { Metadata } from 'next'


import { isDev } from '@cm/lib/methods/common'
import Admin from '@cm/components/layout/Admin/Admin'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import Image from 'next/image'

// const font = Zen_Old_Mincho({
//   weight: ['400', '500', '600', '700', '900'],
//   style: 'normal',
//   subsets: ['latin', 'latin-ext'],
// })

const AppName = <div className={` bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 bg-clip-text text-transparent`}>合同会社改善マニア</div>
const Logo = <R_Stack className={`gap-0.5`}>
  {/* <Image className={``} src={'/image/KM/logoText.png'} width={200} height={200} alt="" /> */}
  <div ><Image className={`rounded-full`} src={'/image/KM/logo.png'} width={60} height={60} alt="" /></div>
</R_Stack>

export const metadata: Metadata = { title: '合同会社改善マニア' }

export default async function AppLayout({ children }) {
  if (process.env.NEXT_PUBLIC_ROOTPATH !== 'KM' && !isDev) {
    return <div>このページへはアクセスできません。</div>
  }

  const { session, scopes } = await initServerComopnent({ query: {} })

  return (
    <div >
      {/* <GreetingLayer> */}
      <Admin {...{
        AppName: AppName,
        Logo,
        PagesMethod: 'KM_PAGES'
      }}>
        <div className={` text-sub-main `}>
          <div>{children}</div>
        </div>
      </Admin>
      {/*
        <footer className={`  fixed bottom-0  w-full  px-2 text-right `}>
          <div>&copy; 2024 改善マニア All rights reserved.</div>
        </footer> */}
      {/* </GreetingLayer> */}
    </div>
  )
}
