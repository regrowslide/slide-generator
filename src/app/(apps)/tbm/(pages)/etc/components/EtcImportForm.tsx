'use client'
import React, { useState } from 'react'
import { EtcFileUpload } from './EtcFileUpload'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

interface EtcImportFormProps {
  isLoading: boolean
  importCsvData: (data: {
    tbmVehicleId: number; csvData: string
  }) => Promise<void>
  // onFormChange: (tbmVehicleId: number, month: Date) => void
  selectedTbmVehicleId: number

}


export const EtcImportForm = (props: EtcImportFormProps) => {
  const { isLoading, importCsvData, selectedTbmVehicleId, } = props

  const [csvContent, setCsvContent] = useState<string>('')






  const handleFileLoaded = (content: string) => {
    setCsvContent(content)
  }

  const handleSubmit = () => {
    if (selectedTbmVehicleId && csvContent) {
      importCsvData({
        tbmVehicleId: selectedTbmVehicleId,
        csvData: csvContent,
      })


    }
  }

  return (
    <>

      <C_Stack className="gap-4">
        <EtcFileUpload {...{
          onFileLoaded: handleFileLoaded,
          isLoading: isLoading,
          onSubmit: handleSubmit,
          importAvailable: selectedTbmVehicleId > 0,
        }} />
      </C_Stack>
    </>
  )
}
