
import Admin from '@cm/components/layout/Admin/Admin'



export default async function AppLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <Admin
      AppName='VisitDental Pro'
      PagesMethod='dental_PAGES'
    >
      <div>{children}</div>
    </Admin>
  )
}
