import Link from 'next/link'
import { Calendar, Building2, Package } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card'

const masterItems = [
  {
    title: '献立マスター',
    description: '日別の献立データを管理します',
    href: '/curious/kaigoshokuManagement/master/menu',
    icon: Calendar,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: '施設マスター',
    description: '取引先施設の情報を管理します',
    href: '/curious/kaigoshokuManagement/master/facility',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '原材料マスター',
    description: '食材の単価・栄養素を管理します',
    href: '/curious/kaigoshokuManagement/master/ingredient',
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]

export default function MasterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">マスター管理</h2>
        <p className="text-slate-500 text-sm">各種マスターデータの管理</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {masterItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-2`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
