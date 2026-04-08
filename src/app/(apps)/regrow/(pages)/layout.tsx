import { Metadata } from 'next'
import Admin from '@cm/components/layout/Admin/Admin'
import Image from 'next/image'

const AppName = 'Regrow'
export const metadata: Metadata = { title: AppName }

export default async function RegrowLayout({ children }) {
  return (
    <Admin
      {...{
        AppName: AppName,
        Logo: <Image src="/logo.jpg" alt="logo" width={60} height={60} />,
        PagesMethod: 'regrow_PAGES',
      }}
    >
      <div className="min-h-screen bg-slate-50">{children}</div>
    </Admin>
  )
}
