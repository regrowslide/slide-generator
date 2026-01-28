'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static user: ViewParamBuilderProps = props => {
    return {
      myTable: {
        create: true,
        update: true,
        delete: true,
        style: {margin: 'auto', maxWidth: '95vw', maxHeight: '80vh'},
      },
      myForm: {
        alignMode: 'console',
      },
    }
  }
}













