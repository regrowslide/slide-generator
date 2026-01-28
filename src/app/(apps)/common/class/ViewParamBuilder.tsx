'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static store: ViewParamBuilderProps = props => {
    return {
      myTable: {
        pagination: {countPerPage: 50},
      },
    }
  }

  static user: ViewParamBuilderProps = props => {
    return {
      myTable: {
        pagination: {countPerPage: 50},
      },
    }
  }

  static roleMaster: ViewParamBuilderProps = props => {
    return {
      myTable: {
        pagination: {countPerPage: 50},
      },
    }
  }
}
