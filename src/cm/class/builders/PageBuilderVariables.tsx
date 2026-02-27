import { PrismaModelNames } from '@cm/types/prisma-types'
import { DetailPagePropType } from '@cm/types/types'
import { surroundings } from '@cm/components/DataLogic/types/customParams-types'
import { anyObject } from '@cm/types/utility-types'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import TableForm from '@cm/components/DataLogic/TFs/PropAdjustor/components/TableForm'
import { ClientPropsType2 } from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import { Card } from '@cm/shadcn/ui/card'
import RoleAllocationTable from '@cm/components/RoleAllocationTable/RoleAllocationTable'
import { getAllUsers } from '@app/(apps)/regrow/_actions/staff-actions'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
export type { SearchFieldConfig } from '@cm/components/RoleAllocationTable/RoleAllocationTable'

export type PageBuidlerClassType = {
  [key in PrismaModelNames]: surroundings
} & anyObject

export type DataModelBuilder = {
  table?: (props: DetailPagePropType) => React.ReactNode
  top?: (props: DetailPagePropType) => React.ReactNode
  form?: (props: DetailPagePropType) => React.ReactNode
  bottom?: (props: DetailPagePropType) => React.ReactNode
  left?: (props: DetailPagePropType) => React.ReactNode
  right?: (props: DetailPagePropType) => React.ReactNode
}

export const roleMaster: DataModelBuilder = {
  table: props => {
    return <Card className="border">
      <C_Stack>
        <div >
          <h2 className="text-xl font-bold  ">ユーザー権限一覧</h2>
        </div>
        <TableForm {...props as unknown as ClientPropsType2} />

      </C_Stack>
    </Card>

  },

  right: props => {
    return <Card>
      <div >
        <h2 className="text-xl font-bold  ">割当表</h2>
      </div>

      <RoleAllocationTable
        {...{

          searchFields: [
            {
              id: `storeId`,
              label: `店舗`,
              forSelect: {},
            },
            {
              id: `userId`,
              label: `ユーザー`,
              forSelect: { modelName: `user` },

            },
          ],
        }}
      />
    </Card>
  },


}

