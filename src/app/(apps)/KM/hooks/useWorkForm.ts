/**
 * WorkEditForm用のカスタムフック
 */

import { useState, useCallback } from 'react'
import { COMPANY_SCALE_OPTIONS, PROJECT_DURATION_OPTIONS } from '../constants/workFormConstants'
import type { WorkFormData } from '../types/works'


interface UseWorkFormOptions {
  initialWork?: any | null
}

export const useWorkForm = ({ initialWork }: UseWorkFormOptions = {}) => {
  const [formData, setFormData] = useState<WorkFormData>({
    id: initialWork?.id || undefined,
    title: initialWork?.title || '',
    subtitle: initialWork?.subtitle || '',
    date: initialWork?.date ? new Date(initialWork.date).toISOString().split('T')[0] : '',
    status: initialWork?.status || '',
    kaizenClientId: initialWork?.kaizenClientId || '',
    allowShowClient: initialWork?.allowShowClient || false,
    isPublic: initialWork?.isPublic || false,
    jobCategory: initialWork?.jobCategory || '',
    systemCategory: initialWork?.systemCategory || '',
    collaborationTool: initialWork?.collaborationTool || '',
    companyScale: initialWork?.companyScale || '',
    projectDuration: initialWork?.projectDuration || '',
    beforeChallenge: initialWork?.beforeChallenge || '',
    description: initialWork?.description || '',
    quantitativeResult: initialWork?.quantitativeResult || '',
    points: initialWork?.points || '',
    impression: initialWork?.impression || '',
    reply: initialWork?.reply || '',
    dealPoint: initialWork?.dealPoint || '',
    toolPoint: initialWork?.toolPoint || '',
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      id: undefined,
      title: '',
      subtitle: '',
      date: '',
      status: '',
      kaizenClientId: '',
      allowShowClient: false,
      isPublic: false,
      jobCategory: '',
      systemCategory: '',
      collaborationTool: '',
      companyScale: '',
      projectDuration: '',
      beforeChallenge: '',
      description: '',
      quantitativeResult: '',
      points: '',
      impression: '',
      reply: '',
      dealPoint: '',
      toolPoint: '',
    })
  }, [])

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
    companyScaleOptions: COMPANY_SCALE_OPTIONS,
    projectDurationOptions: PROJECT_DURATION_OPTIONS,
  }
}

