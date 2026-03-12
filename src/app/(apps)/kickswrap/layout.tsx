import Admin from '@cm/components/layout/Admin/Admin'
import {MyContainer} from '@cm/components/styles/common-components/common-components'

import Image from 'next/image'

export default async function AppLayout(props) {
  const {children} = props
  return (
    <MyContainer className={`relative mx-auto max-w-sm`}>
      <Image
        src="https://kickswrap.com/cdn/shop/files/360_275.jpg?v=1663144696&width=500"
        alt="Vercel Logo"
        width={100}
        height={100}
      />
      {children}
    </MyContainer>
  )
  return (
    <Admin
      {...{
        AppName: 'テストアプリ',
        PagesMethod: 'Advantage_PAGES',
      }}
    >
      <div>
        {/* <Tasks /> */}
        <div>{children}</div>
      </div>
    </Admin>
  )
}
