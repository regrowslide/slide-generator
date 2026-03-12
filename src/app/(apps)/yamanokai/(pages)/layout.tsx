import Admin from '@cm/components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const { children } = props

  return (
    <Admin
      {...{
        AppName: '山の会',
        PagesMethod: 'yamanokai_PAGES',
      }}
    >
      <div>
        <div>{children}</div>
      </div>
    </Admin>
  )
}
