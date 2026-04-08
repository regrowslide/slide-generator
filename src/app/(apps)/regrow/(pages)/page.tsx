
import { Absolute } from '@cm/components/styles/common-components/common-components'
import React from 'react'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

export default async function Top() {


 const { session } = await initServerComopnent({ query: {} })

 return <Absolute>
  メニューを選択してください

 </Absolute>
}
