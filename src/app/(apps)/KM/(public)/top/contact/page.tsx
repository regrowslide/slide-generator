import { Contact } from '@app/(apps)/KM/components/Contact'
import { EnhancedContact } from '@app/(apps)/KM/components/enhanced/EnhancedContact'
import { Padding } from '@cm/components/styles/common-components/common-components'

const Page = async () => {
  return (
    <div>
      <Padding>
        <EnhancedContact />
      </Padding>
    </div>
  )
}

export default Page
