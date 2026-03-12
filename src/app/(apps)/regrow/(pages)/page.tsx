
import React from 'react'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

export default async function Top() {


 const { session } = await initServerComopnent({ query: {} })

 return <div>Top</div>
}
