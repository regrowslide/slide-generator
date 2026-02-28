import { Metadata } from 'next'
import Admin from '@cm/components/layout/Admin/Admin'
import { PageBuilder } from '@app/(apps)/regrow/(builders)/PageBuilders/PageBuilder'

const AppName = 'Regrow'
export const metadata: Metadata = { title: AppName }

export default async function RegrowLayout({ children }) {
  return (
    <Admin
      {...{
        AppName: AppName,

        PagesMethod: 'regrow_PAGES',
        PageBuilderGetter: { class: PageBuilder, getter: 'getGlobalIdSelector' }
      }}
    >
      <div className="min-h-screen bg-slate-50">{children}</div>
    </Admin>
  )
}
