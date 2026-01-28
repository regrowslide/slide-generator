
import Admin from '@cm/components/layout/Admin/Admin'

export default async function NewCarLayout(props) {
  const { children } = props

  return (
    <Admin
      {...{
        AppName: '共通',
        PagesMethod: 'common_PAGES',

      }}
    >
      <div>{children}</div>
    </Admin>
  )
}
