'use client'

import {Card, CardContent} from '@shadcn/ui/card'
import RoleAllocationTable from '@cm/components/RoleAllocationTable/RoleAllocationTable'

const RoleMasterTab = () => {
  return (
    <div className="w-fit">
      <Card>
        <CardContent className="pt-4">
          <RoleAllocationTable />
        </CardContent>
      </Card>
    </div>
  )
}

export default RoleMasterTab
