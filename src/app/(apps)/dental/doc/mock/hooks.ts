import {useState, useCallback} from 'react'

import {
  INITIAL_FACILITIES,
  INITIAL_PATIENTS,
  INITIAL_STAFF,
  INITIAL_VISIT_PLANS,
  INITIAL_EXAMINATIONS,
  INITIAL_CLINIC,
  INITIAL_SCORING_HISTORY,
  INITIAL_SAVED_DOCUMENTS,
} from './mock-data'
import {EXAMINATION_STATUS} from './constants'
import {nextId, formatDate} from './helpers'
import type {
  Facility,
  Patient,
  VisitPlan,
  Clinic,
  ClinicQualifications,
  Examination,
  Staff,
  ScoringHistoryItem,
  SavedDocument,
} from './types'

/**
 * 施設管理用カスタムフック
 */
export const useFacilityManager = () => {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES)
  const [isLoading, setIsLoading] = useState(false)

  const addFacility = useCallback((facility: Omit<Facility, 'id'>) => {
    setIsLoading(true)
    setTimeout(() => {
      setFacilities(prev => [...prev, {...facility, id: nextId(prev)}])
      setIsLoading(false)
    }, 300)
  }, [])

  const updateFacility = useCallback((id: number, data: Partial<Facility>) => {
    setFacilities(prev => prev.map(f => (f.id === id ? {...f, ...data} : f)))
  }, [])

  const deleteFacility = useCallback((id: number) => {
    setFacilities(prev => prev.filter(f => f.id !== id))
  }, [])

  return {facilities, isLoading, addFacility, updateFacility, deleteFacility}
}

/**
 * 利用者管理用カスタムフック
 */
export const usePatientManager = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS)

  const getPatientsByFacility = useCallback((facilityId: number) => patients.filter(p => p.facilityId === facilityId), [patients])

  const addPatient = useCallback((patient: Omit<Patient, 'id'>) => {
    setPatients(prev => [...prev, {...patient, id: nextId(prev)}])
  }, [])

  const updatePatient = useCallback((id: number, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => (p.id === id ? {...p, ...data} : p)))
  }, [])

  const deletePatient = useCallback((id: number) => {
    setPatients(prev => prev.filter(p => p.id !== id))
  }, [])

  return {patients, getPatientsByFacility, addPatient, updatePatient, deletePatient}
}

/**
 * 訪問計画管理用カスタムフック
 */
export const useVisitPlanManager = () => {
  const [visitPlans, setVisitPlans] = useState(INITIAL_VISIT_PLANS)

  const addVisitPlan = useCallback((plan: Omit<VisitPlan, 'id' | 'status'>) => {
    setVisitPlans(prev => [...prev, {...plan, id: nextId(prev), status: 'scheduled'}])
  }, [])

  const deleteVisitPlan = useCallback((id: number) => {
    setVisitPlans(prev => prev.filter(p => p.id !== id))
  }, [])

  return {visitPlans, addVisitPlan, deleteVisitPlan}
}

/**
 * クリニック管理用カスタムフック
 */
export const useClinicManager = () => {
  const [clinic, setClinic] = useState(INITIAL_CLINIC)

  const updateClinic = useCallback((data: Partial<Clinic>) => {
    setClinic(prev => ({...prev, ...data}))
  }, [])

  const updateQualification = useCallback((qualificationId: string, value: boolean | string) => {
    setClinic(prev => ({
      ...prev,
      qualifications: {...prev.qualifications, [qualificationId]: value},
    }))
  }, [])

  // 資格の有無をチェック
  const hasQualification = useCallback(
    (qualificationId: string) => {
      return !!clinic.qualifications[qualificationId as keyof ClinicQualifications]
    },
    [clinic.qualifications]
  )

  return {clinic, updateClinic, updateQualification, hasQualification}
}

/**
 * 診察管理用カスタムフック
 */
export const useExaminationManager = () => {
  const [examinations, setExaminations] = useState(INITIAL_EXAMINATIONS)

  const getExaminationsByVisitPlan = useCallback(
    (visitPlanId: number) => examinations.filter(e => e.visitPlanId === visitPlanId).sort((a, b) => a.sortOrder - b.sortOrder),
    [examinations]
  )

  const addExamination = useCallback((examination: Pick<Examination, 'visitPlanId' | 'patientId' | 'doctorId' | 'hygienistId'>) => {
    setExaminations(prev => {
      const maxSortOrder = Math.max(0, ...prev.filter(e => e.visitPlanId === examination.visitPlanId).map(e => e.sortOrder))
      return [
        ...prev,
        {
          ...examination,
          id: nextId(prev),
          sortOrder: maxSortOrder + 1,
          status: EXAMINATION_STATUS.WAITING,
          vitalBefore: null,
          vitalAfter: null,
          treatmentItems: [],
          procedureItems: {},
          visitCondition: '',
          oralFindings: '',
          treatment: '',
          nextPlan: '',
          drStartTime: null,
          drEndTime: null,
          dhStartTime: null,
          dhEndTime: null,
        },
      ]
    })
  }, [])

  const updateExamination = useCallback((id: number, data: Partial<Examination>) => {
    setExaminations(prev => prev.map(e => (e.id === id ? {...e, ...data} : e)))
  }, [])

  const removeExamination = useCallback((id: number) => {
    setExaminations(prev => prev.filter(e => e.id !== id))
  }, [])

  const reorderExaminations = useCallback((visitPlanId: number, orderedIds: number[]) => {
    setExaminations(prev =>
      prev.map(e => {
        if (e.visitPlanId !== visitPlanId) return e
        const newOrder = orderedIds.indexOf(e.id)
        return newOrder >= 0 ? {...e, sortOrder: newOrder + 1} : e
      })
    )
  }, [])

  return {
    examinations,
    getExaminationsByVisitPlan,
    addExamination,
    updateExamination,
    removeExamination,
    reorderExaminations,
  }
}

/**
 * スタッフ管理用カスタムフック
 */
export const useStaffManager = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF)

  const addStaff = useCallback((staffData: Omit<Staff, 'id' | 'sortOrder'>) => {
    setStaff(prev => [
      ...prev,
      {
        ...staffData,
        id: nextId(prev),
        sortOrder: prev.filter(s => s.role === staffData.role).length + 1,
      },
    ])
  }, [])

  const updateStaff = useCallback((id: number, data: Partial<Staff>) => {
    setStaff(prev => prev.map(s => (s.id === id ? {...s, ...data} : s)))
  }, [])

  const deleteStaff = useCallback((id: number) => {
    setStaff(prev => prev.filter(s => s.id !== id))
  }, [])

  const reorderStaff = useCallback((id: number, direction: 'up' | 'down') => {
    setStaff(prev => {
      const item = prev.find(s => s.id === id)
      if (!item) return prev
      const sameRole = prev.filter(s => s.role === item.role).sort((a, b) => a.sortOrder - b.sortOrder)
      const idx = sameRole.findIndex(s => s.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sameRole.length) return prev
      const swapItem = sameRole[swapIdx]
      return prev.map(s => {
        if (s.id === id) return {...s, sortOrder: swapItem.sortOrder}
        if (s.id === swapItem.id) return {...s, sortOrder: item.sortOrder}
        return s
      })
    })
  }, [])

  return {staff, addStaff, updateStaff, deleteStaff, reorderStaff}
}

/**
 * 算定履歴管理用カスタムフック
 */
export const useScoringHistoryManager = () => {
  const [scoringHistory, setScoringHistory] = useState(INITIAL_SCORING_HISTORY)

  const addScoringRecord = useCallback((record: Omit<ScoringHistoryItem, 'id'>) => {
    setScoringHistory(prev => [...prev, {...record, id: nextId(prev)}])
  }, [])

  const getHistoryByPatient = useCallback((patientId: number) => scoringHistory.filter(h => h.patientId === patientId), [scoringHistory])

  return {scoringHistory, addScoringRecord, getHistoryByPatient}
}

/**
 * 文書管理用カスタムフック
 */
export const useDocumentManager = () => {
  const [documents, setDocuments] = useState(INITIAL_SAVED_DOCUMENTS)

  const addDocument = useCallback((doc: Omit<SavedDocument, 'id' | 'createdAt'>) => {
    setDocuments(prev => [
      ...prev,
      {...doc, id: nextId(prev), createdAt: formatDate(new Date(2026, 0, 18))},
    ])
  }, [])

  const getDocumentsByPatient = useCallback((patientId: number) => documents.filter(d => d.patientId === patientId), [documents])

  /** 複数のPDF URLを結合して1つのPDFとしてダウンロード */
  const mergePdfsAndDownload = useCallback(async (pdfUrls: string[], fileName: string) => {
    const {PDFDocument} = await import('pdf-lib')
    const mergedPdf = await PDFDocument.create()

    for (const url of pdfUrls) {
      try {
        const response = await fetch(url)
        const pdfBytes = await response.arrayBuffer()
        const pdf = await PDFDocument.load(pdfBytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      } catch (e) {
        console.error(`PDF読み込み失敗: ${url}`, e)
      }
    }

    const mergedBytes = await mergedPdf.save()
    const blob = new Blob([mergedBytes], {type: 'application/pdf'})
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }, [])

  return {documents, addDocument, getDocumentsByPatient, mergePdfsAndDownload}
}
