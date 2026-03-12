import Admin from '@cm/components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: '生産管理システム',
        PagesMethod: 'portal_PAGES',
      }}
    >
      <div>{children}</div>
    </Admin>
  )
}
