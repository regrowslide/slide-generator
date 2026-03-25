import { Metadata } from 'next'
import Admin from '@cm/components/layout/Admin/Admin'

const AppName = 'Regrow'
export const metadata: Metadata = { title: AppName }

export default async function RegrowLayout({ children }) {
  return (
    <Admin
      {...{
        AppName: AppName,

        PagesMethod: 'regrow_PAGES',
      }}
    >
      <div className="min-h-screen bg-slate-50">{children}</div>
    </Admin>
  )
}
