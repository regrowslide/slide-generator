
import Admin from '@cm/components/layout/Admin/Admin'
import { PageBuilder } from '@app/(apps)/dental/(builders)/PageBuilders/PageBuilder'



export default async function AppLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <Admin
      AppName='VisitDental Pro'
      PagesMethod='dental_PAGES'
      PageBuilderGetter={{ class: PageBuilder, getter: 'getGlobalIdSelector' }}
    >
      <div>{children}</div>
    </Admin>
  )
}
