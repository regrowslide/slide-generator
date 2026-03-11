import { Metadata } from 'next'
import Admin from '@cm/components/layout/Admin/Admin'

const AppName = 'できたよ！'
export const metadata: Metadata = { title: AppName }

export default async function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Admin
      {...{
        AppName: AppName,
        PagesMethod: 'kids_PAGES',
      }}
    >
      {children}
    </Admin>
  )
}
