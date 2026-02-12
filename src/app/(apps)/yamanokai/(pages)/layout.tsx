import { PageBuilder } from '@app/(apps)/yamanokai/(builders)/PageBuilders/PageBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const { children } = props

  return (
    <Admin
      {...{
        AppName: '山の会',
        PagesMethod: 'yamanokai_PAGES',
        PageBuilderGetter: { class: PageBuilder, getter: 'getGlobalIdSelector' },
      }}
    >
      <div>
        <div>{children}</div>
      </div>
    </Admin>
  )
}
