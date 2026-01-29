import { AppHeader } from '../components/AppHeader'

export default function KaigoshokuManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
