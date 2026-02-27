import { Metadata } from 'next'
import Admin from '@cm/components/layout/Admin/Admin'
import { RegrowDataProvider } from './(pages)/context/RegrowDataContext'
import { PageBuilder } from '@app/(apps)/regrow/(builders)/PageBuilders/PageBuilder'

const AppName = 'Regrow'
export const metadata: Metadata = { title: AppName }

export default async function RegrowLayout({ children }) {
  return (
    <Admin
      {...{
        AppName: AppName,
        Logo: '🌿',
        PagesMethod: 'regrow_PAGES',
        PageBuilderGetter: { class: PageBuilder, getter: 'getGlobalIdSelector' }
      }}
    >
      <RegrowDataProvider>
        <div className="min-h-screen bg-slate-50">{children}</div>
      </RegrowDataProvider>
    </Admin>
  )
}
