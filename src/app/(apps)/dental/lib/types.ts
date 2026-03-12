// types.ts

import type {
  DentalPatient,
  DentalFacility,
  DentalExamination,
  DentalVisitPlan,
  DentalClinic,
  DentalScoringHistory,
  DentalSavedDocument,
  User,
} from '@prisma/generated/prisma/client'

// =============================================================================
// 年齢計算
// =============================================================================

export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

// =============================================================================
// デフォルト値
// =============================================================================

export const DEFAULT_DISEASES: PatientDiseases = {
  dementia: false,
  hypertension: false,
  cerebrovascular: false,
  mentalDisorder: false,
  parkinsons: false,
  heartFailure: false,
  terminalCancer: false,
  senility: false,
  femurFracture: false,
  spinalStenosis: false,
  als: false,
  cerebellarDegeneration: false,
  multipleSclerosis: false,
  disuseSyndrome: false,
  diabetes: false,
}

export const DEFAULT_ASSESSMENT_VALUE: Assessment = {
  height: '',
  weight: '',
  bmi: '',
  aspirationPneumoniaHistory: '無し',
  aspirationPneumoniaDate: '',
  aspirationPneumoniaRepeat: false,
  aspirationPneumoniaRepeatDate: '',
  seatRetention: '',
  oralCleaning: '',
  moistureRetention: '',
  gargling: '',
  malnutritionRisk: '',
  choking: '',
  oralIntake: '',
  artificialNutrition: '無し',
  moisture: '',
  mainDish: '',
  sideDish: '',
  swallowing: '',
  medicationSwallowing: '',
  medications: [{name: ''}, {name: ''}, {name: ''}],
  medicationImages: [],
  hasInfoShareFee: false,
  infoShareFeeLastDate: '',
  hasComprehensiveManagement: false,
  comprehensiveManagementLastDate: '',
}

// =============================================================================
// Prisma型 → アプリ型 変換ヘルパー
// =============================================================================

/** Prisma DentalFacility → アプリ Facility */
export const toFacility = (f: DentalFacility): Facility => ({
  id: f.id,
  name: f.name,
  address: f.address || '',
  facilityType: f.facilityType,
  sortOrder: f.sortOrder,
})

/** Prisma DentalPatient → アプリ Patient */
export const toPatient = (p: DentalPatient): Patient => ({
  id: p.id,
  facilityId: p.dentalFacilityId,
  lastName: p.lastName,
  firstName: p.firstName,
  lastNameKana: p.lastNameKana || '',
  firstNameKana: p.firstNameKana || '',
  gender: p.gender || 'male',
  birthDate: p.birthDate ? p.birthDate.toISOString().split('T')[0] : '',
  age: p.birthDate ? calculateAge(p.birthDate) : 0,
  careLevel: p.careLevel || '',
  building: p.building || '',
  floor: p.floor || '',
  room: p.room || '',
  notes: p.notes || '',
  diseases: (p.diseases as unknown as PatientDiseases) || DEFAULT_DISEASES,
  teethCount: p.teethCount,
  hasDenture: p.hasDenture,
  hasOralHypofunction: p.hasOralHypofunction,
  assessment: (p.assessment as unknown as Assessment) || DEFAULT_ASSESSMENT_VALUE,
})

/** Prisma User → アプリ Staff */
export const toStaff = (u: User): Staff => ({
  id: u.id,
  name: u.name,
  role: u.type || '',
  sortOrder: u.sortOrder,
  email: u.email,
})

/** Prisma DentalExamination → アプリ Examination */
export const toExamination = (e: DentalExamination): Examination => ({
  id: e.id,
  visitPlanId: e.dentalVisitPlanId,
  patientId: e.dentalPatientId,
  doctorId: e.doctorId,
  hygienistId: e.hygienistId,
  status: e.status,
  sortOrder: e.sortOrder,
  vitalBefore: (e.vitalBefore as unknown as Vital) || null,
  vitalAfter: (e.vitalAfter as unknown as Vital) || null,
  treatmentItems: (e.treatmentItems as unknown as string[]) || [],
  procedureItems: (e.procedureItems as unknown as Record<string, ProcedureItemSelection>) || {},
  visitCondition: e.visitCondition || '',
  oralFindings: e.oralFindings || '',
  treatment: e.treatment || '',
  nextPlan: e.nextPlan || '',
  drStartTime: e.drStartTime || null,
  drEndTime: e.drEndTime || null,
  dhStartTime: e.dhStartTime || null,
  dhEndTime: e.dhEndTime || null,
  treatmentPerformed: (e.treatmentPerformed as unknown as string[]) || [],
  oralFunctionRecord: (e.oralFunctionRecord as unknown as OralFunctionRecord) || null,
})

/** Prisma DentalVisitPlan → アプリ VisitPlan */
export const toVisitPlan = (v: DentalVisitPlan): VisitPlan => ({
  id: v.id,
  facilityId: v.dentalFacilityId,
  visitDate: v.visitDate.toISOString().split('T')[0],
  status: v.status,
})

/** Prisma DentalClinic → アプリ Clinic */
export const toClinic = (c: DentalClinic): Clinic => ({
  id: c.id,
  name: c.name,
  address: c.address || '',
  phone: c.phone || '',
  representative: c.representative || '',
  qualifications: (c.qualifications as unknown as ClinicQualifications) || {
    shiensin1: false,
    shiensin2: false,
    zahoshin: false,
    koukukan: false,
    johorenkei: false,
    dx: false,

    electronicPrescription: false,
    other: false,
    otherText: '',
  },
})

/** Prisma DentalScoringHistory → アプリ ScoringHistoryItem */
export const toScoringHistory = (s: DentalScoringHistory): ScoringHistoryItem => ({
  id: s.id,
  patientId: s.dentalPatientId,
  procedureId: s.procedureId,
  lastScoredAt: s.lastScoredAt.toISOString().split('T')[0],
  points: s.points,
})

/** Prisma DentalSavedDocument → アプリ SavedDocument */
export const toSavedDocument = (d: DentalSavedDocument): SavedDocument => ({
  id: d.id,
  patientId: d.dentalPatientId,
  examinationId: d.dentalExaminationId,
  templateId: d.templateId,
  templateName: d.templateName,
  createdAt: d.createdAt.toISOString().split('T')[0],
  version: d.version,
})

// =============================================================================
// アプリ型定義
// =============================================================================

/** 施設 */
export type Facility = {
  id: number
  name: string
  address: string
  facilityType: string
  sortOrder?: number
}

/** 患者の疾患情報 */
export type PatientDiseases = {
  dementia: boolean
  hypertension: boolean
  cerebrovascular: boolean
  mentalDisorder: boolean
  parkinsons: boolean
  heartFailure: boolean
  terminalCancer: boolean
  senility: boolean
  femurFracture: boolean
  spinalStenosis: boolean
  als: boolean
  cerebellarDegeneration: boolean
  multipleSclerosis: boolean
  disuseSyndrome: boolean
  diabetes: boolean
}

/** アセスメントデータ */
export type Assessment = {
  height: string
  weight: string
  bmi: string
  aspirationPneumoniaHistory: string
  aspirationPneumoniaDate: string
  aspirationPneumoniaRepeat: boolean
  aspirationPneumoniaRepeatDate: string
  seatRetention: string
  oralCleaning: string
  moistureRetention: string
  gargling: string
  malnutritionRisk: string
  choking: string
  oralIntake: string
  artificialNutrition: string
  moisture: string
  mainDish: string
  sideDish: string
  swallowing: string
  medicationSwallowing: string
  medications: Array<{name: string}>
  medicationImages: Array<{url: string; addedAt: string}>
  hasInfoShareFee: boolean
  infoShareFeeLastDate: string
  hasComprehensiveManagement: boolean
  comprehensiveManagementLastDate: string
}

/** 患者 */
export type Patient = {
  id: number
  facilityId: number
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  gender: string
  birthDate: string
  age: number
  careLevel: string
  building: string
  floor: string
  room: string
  notes: string
  diseases: PatientDiseases
  teethCount: number
  hasDenture: boolean
  hasOralHypofunction: boolean
  assessment: Assessment
}

/** スタッフ（User.typeで医師/衛生士を区別） */
export type Staff = {
  id: string
  name: string
  role: string
  sortOrder: number
  email?: string | null
}

/** 訪問計画 */
export type VisitPlan = {
  id: number
  facilityId: number
  visitDate: string
  status: string
}

/** バイタルデータ */
export type Vital = {
  bloodPressure?: string
  bloodPressureHigh?: string
  bloodPressureLow?: string
  pulse?: string
  spo2?: string
  temperature?: string
  measuredAt?: string
}

/** 口腔機能精密検査記録データ */
export type OralFunctionRecord = {
  measureDate?: string
  tongueCoatingPercent: string
  tongueCoatingApplicable: boolean
  oralMoistureValue: string
  salivaAmount: string
  oralDrynessApplicable: boolean
  biteForceN: string
  remainingTeeth: string
  biteForceApplicable: boolean
  oralDiadochoPa: string
  oralDiadochoTa: string
  oralDiadochoKa: string
  oralMotorApplicable: boolean
  tonguePressureKPa: string
  tonguePressureApplicable: boolean
  masticatoryAbilityMgDl: string
  masticatoryScoreMethod?: string
  masticatoryApplicable: boolean
  swallowingEAT10Score: string
  swallowingQuestionnaireA?: string
  swallowingApplicable: boolean
  doctorName?: string
  hygienistName?: string
}

/** 診察 */
export type Examination = {
  id: number
  visitPlanId: number
  patientId: number
  doctorId: string | null
  hygienistId: string | null
  status: string
  sortOrder: number
  vitalBefore: Vital | null
  vitalAfter: Vital | null
  treatmentItems: string[]
  procedureItems: Record<string, ProcedureItemSelection>
  visitCondition: string
  oralFindings: string
  treatment: string
  nextPlan: string
  drStartTime: string | null
  drEndTime: string | null
  dhStartTime: string | null
  dhEndTime: string | null
  treatmentPerformed?: string[]
  oralFunctionRecord?: OralFunctionRecord | null
}

/** 実施項目選択状態 */
export type ProcedureItemSelection = {
  selectedSubItems: string[]
  isAutoSet: boolean
}

/** evaluate関数のコンテキスト */
export type EvalContext = {
  drSeconds: number
  dhSeconds: number
  sameDayCount: number
  sameMonthCount: number
  hasDoctor: boolean
  hasHygienist: boolean
  clinic: Clinic
  patient: Patient
  pastClaims: PastExamination[]
  currentMonth: string
  oralFunctionRecord: OralFunctionRecord | null
  currentItems: Record<string, ProcedureItemSelection>
  treatmentPerformed: string[]
}

/** サブアイテム */
export type SubItem = {
  id: string
  name: string
  points: number
  isManualOnly: boolean
  requiredRole: string | null
  requiredQualification: string | null
  conditionLabel: string
  infoText: string
  exclusiveGroup?: string
  evaluate: (ctx: EvalContext) => boolean
}

/** 実施項目マスタ */
export type ProcedureItemMaster = {
  id: string
  name: string
  fullName: string
  selectionMode: 'single' | 'multiple' | 'mixed'
  infoText: string
  subItems: SubItem[]
  note?: string
  intervalMonths?: number
  monthlyLimit?: number
  defaultPoints?: number
  categories?: Array<{id: string; name: string; points: number}>
  documents?: Array<{id: string}>
}

/** 文書テンプレート */
export type DocumentTemplate = {
  id: string
  name: string
  fullName: string
  relatedProcedure: string
  monthlyLimit: number
  dhMinutesRequired?: number
  referenceUrl?: string
  fields: {
    auto: string[]
    manual: string[]
  }
}

/** 算定セクション */
export type ScoringSection = {
  id: string
  label: string
  items: string[]
}

/** 改定版マスタ */
export type ProcedureRevision = {
  id: string
  name: string
  from: string
  to: string | null
  master: ProcedureItemMaster[]
  scoringSections: ScoringSection[]
}

/** 算定履歴 */
export type ScoringHistoryItem = {
  id: number
  patientId: number
  procedureId: string
  lastScoredAt: string
  points: number
}

/** 保存済み文書 */
export type SavedDocument = {
  id: number
  patientId: number
  examinationId: number
  templateId: string
  templateName: string
  createdAt: string
  version: number
}

/** クリニック資格 */
export type ClinicQualifications = {
  shiensin1: boolean
  shiensin2: boolean
  zahoshin: boolean
  koukukan: boolean
  johorenkei: boolean
  dx: boolean

  electronicPrescription: boolean
  other: boolean
  otherText: string
  [key: string]: boolean | string | undefined
}

/** クリニック */
export type Clinic = {
  id: number
  name: string
  address: string
  phone: string
  representative: string
  qualifications: ClinicQualifications
}

/** 過去診察実績 */
export type PastExamination = {
  patientId: number
  month: string
  claimedItems: string[]
}

/** カレンダー日付 */
export type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

/** 在歯管算定対象治療カテゴリ */
export type TreatmentCategory = {
  category: string
  items: string[]
}

/** 医院資格マスタ項目 */
export type ClinicQualificationMaster = {
  id: string
  name: string
  description: string
  hasTextInput?: boolean
}

/** 患者疾患マスタ項目 */
export type PatientDiseaseMaster = {
  id: string
  name: string
}

/** セレクトオプション */
export type SelectOption = {
  value: string | number
  label: string
}

/** タイマー変更履歴 */
export type TimerHistory = {
  id: number
  timerType: 'dr' | 'dh'
  actionType: 'start' | 'stop' | 'manual_edit'
  previousValue: string | null
  newValue: string
  createdAt: string
}

/** 文書要件判定結果 */
export type DocumentRequirement = DocumentTemplate & {
  required: boolean
  reason: string
  dhMinutes?: number
}

/** 保存済み文書（PDF URL付き） */
export type SavedDocumentEntry = {
  id: string
  clinicId: number
  facilityId: number
  facilityName: string
  patientId: number
  patientName: string
  examinationId: number
  documentType: string
  documentName: string
  pdfUrl: string
  createdAt: string
  visitDate: string
}

// =============================================================================
// 文書データ型（PDFテンプレート準拠）
// =============================================================================

/** A. 訪問歯科診療治療内容説明書データ */
export type TreatmentContentData = {
  documentNo: string
  patientName: string
  visitDate: string
  startTime: string
  endTime: string
  // 治療内容チェック
  anesthesia: boolean
  anesthesiaPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  gumTreatment: boolean
  gumPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  gumExam: boolean
  gumScaling: boolean
  rootTreatment: boolean
  rootPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  extraction: boolean
  extractionPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  extractionSuture: boolean
  extractionRemoval: boolean
  smallCavity: boolean
  smallCavityPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  crownBridge: boolean
  crownPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  crownMold: boolean
  crownAttach: boolean
  newDenture: boolean
  newDenturePositions: {all: boolean; upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  newDentureMold: boolean
  newDentureBite: boolean
  newDentureTrial: boolean
  newDentureAttach: boolean
  dentureRepair: boolean
  dentureRepairPositions: {all: boolean; upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  dentureReline: boolean
  dentureRepairFix: boolean
  dentureAdjust: boolean
  dentureAdjustPositions: {upper: boolean; lower: boolean; front: boolean; right: boolean; left: boolean}
  oralStretch: boolean
  xray: boolean
  medication: boolean
  otherTreatment: boolean
  otherTreatmentText: string
  // 連絡事項・療養上の注意点
  contactNotes: string
  careNotes: string
  // フッター
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  doctorName: string
}

/** B. 歯在管管理計画書データ（PDF02準拠） */
export type KanriKeikakuData = {
  documentNo: string
  patientName: string
  date: string
  // 全身の状態
  hasDiseases: boolean
  diseaseNames: string
  hasMedication: boolean
  medicationNames: string
  pneumoniaHistory: 'none' | 'once' | 'repeat'
  malnutritionRisk: 'none' | 'mild' | 'unknown'
  dietCategory: 'normal' | 'care' | 'nonOral'
  dietType: string
  dietSubType: string
  isNonOral: boolean
  // 経管栄養
  tubeFeeding: 'none' | 'gastric' | 'nasal' | 'other'
  // 歯と口の状態
  cleaningStatus: 'good' | 'poor' | 'veryPoor'
  oralDryness: 'none' | 'mild' | 'severe'
  hasCavity: boolean
  cavityUrgency: boolean
  hasPeriodontal: boolean
  periodontalInflammation: boolean
  periodontalMobility: boolean
  periodontalMobilityUrgency: boolean
  periodontalUrgency: boolean
  hasSoftTissueDisease: boolean
  softTissueDiseaseUrgency: boolean
  softTissueUrgency: boolean
  dentureUpperUsed: boolean
  dentureUpperNotUsed: boolean
  dentureLowerUsed: boolean
  dentureLowerNotUsed: boolean
  biteStability: boolean
  biteStabilitySide: 'unilateral' | 'bilateral'
  dentureNeeded: boolean
  // 特記事項（歯牙図用: 将来的にSVG）
  specialNotes: string
  // 口腔機能の状態
  masticationStatus: 'good' | 'slightlyPoor' | 'poor'
  swallowingStatus: 'good' | 'slightlyPoor' | 'poor'
  pronunciationStatus: 'good' | 'slightlyPoor' | 'poor'
  tongueMovement: 'good' | 'slightlyPoor' | 'poor'
  // 治療と口腔ケアの難しさ
  cleaningSelf: 'independent' | 'partial' | 'full'
  seatRetention: 'good' | 'slightlyPoor' | 'poor'
  mouthOpening: 'possible' | 'difficult' | 'impossible'
  gargling: 'possible' | 'difficult' | 'impossibleSwallow'
  // 管理方針・治療方針
  managementPolicy: string
  // フッター
  clinicName: string
  doctorName: string
}

/** C. 訪問歯科衛生指導説明書データ（PDF03準拠） */
export type HygieneGuidanceData = {
  documentNo: string
  patientName: string
  date: string
  // 訪問先
  visitType: 'home' | 'facility'
  facilityName: string
  // 口腔の状況テーブル
  oralCondition: {
    plaque: boolean
    calculus: boolean
    foodDebris: boolean
    tongueCoating: boolean
    oralBleeding: boolean
    erosionUlcer: boolean
    oralDryness: boolean
    halitosis: boolean
    dentureCleanGood: boolean
    dentureCleanNeedsImprovement: boolean
    dentureFitGood: boolean
    dentureFitNeedsImprovement: boolean
    dentureStorageGood: boolean
    dentureStorageNeedsImprovement: boolean
  }
  otherCondition: string
  // 口腔の清掃について
  cleaningImportance: boolean
  garglingBrushing: boolean
  brushingMethod: {fones: boolean; scrubbing: boolean; bass: boolean; toothpick: boolean}
  instruments: {brush: boolean; sponge: boolean; tongue: boolean; electric: boolean}
  salivaryMassage: boolean
  // 有床義歯清掃指導
  dentureCleaningGuidance: boolean
  dentureCleaningDetails: {clasp: boolean; mucosa: boolean; posterior: boolean; artificial: boolean}
  residualTeethBrushing: boolean
  dentureRemovalGuidance: boolean
  dentureSleepHandling: boolean
  dentureSleepOptions: {waterStorage: boolean; cleanserStorage: boolean; wearing: boolean}
  // 注意事項
  careNotes: string
  // 介護職員への技術的助言等の内容
  technicalAdvice: {
    riskBasedCleaning: boolean
    cleaningKnowledge: boolean
    oralFunctionImprovement: boolean
    dietConfirmation: boolean
    continueCurrent: boolean
    other: boolean
    otherText: string
  }
  // フッター
  hygienistName: string
  startTime: string
  endTime: string
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  doctorName: string
}

/** D. 口腔機能精密検査記録用紙データ（PDF04準拠） */
export type OralExamRecordData = {
  documentNo: string
  clinicName: string
  patientNameKana: string
  patientName: string
  birthDate: string
  age: number
  gender: string
  measureDate: string
  // 検査値（既存OralFunctionRecordを拡張して使う）
  oralFunctionRecord: OralFunctionRecord
  applicableCount: number
}

/** E. 口腔機能管理計画書データ（PDF101準拠） */
export type OralFunctionPlanData = {
  documentNo: string
  clinicName: string
  patientNameKana: string
  patientName: string
  age: number
  gender: string
  provideDate: string
  // 全身の状態（7項目）
  bodyCondition: {
    diseases: string[]
    medicationStatus: 'none' | 'yes'
    medicationNames: string
    pneumoniaHistory: 'none' | 'once' | 'repeat'
    nutritionWeight: string
    nutritionHeight: string
    nutritionBMI: string
    nutritionStatus: 'normal' | 'underweight' | 'obese'
    weightChange: 'none' | 'yes'
    weightChangeDetail: string
    dietType: string
    appetite: 'yes' | 'no'
    appetiteReason: string
  }
  // 口腔機能の状態（11項目、精密検査表から引用）
  oralFunctionStatus: Array<{
    label: string
    testName: string
    value: string
    reference: string
    status: 'normal' | 'decreased'
  }>
  // 歯・歯肉の状態
  toothGumStatus: {
    plaque: boolean
    gumInflammation: boolean
    toothMobility: boolean
  }
  // 口腔内・義歯の状態（記述欄）
  oralDentureNote: string
  // 口腔機能管理計画（9機能領域）
  oralFunctionPlan: Array<{
    label: string
    plan: 'noIssue' | 'maintain' | 'improve'
  }>
  // 管理方針・目標・治療予定
  managementGoal: string
  // 再評価の時期・治療期間
  reevaluationMonths: string
  treatmentPeriod: string
}

/** F. 口腔衛生管理加算 様式データ（PDF50準拠） */
export type OralHygieneManagementData = {
  documentNo: string
  evaluationDate: string
  // 患者基本情報
  patientName: string
  patientNameKana: string
  birthDate: string
  gender: string
  careLevel: string
  diseaseName: string
  dailyIndependencePhysical: string
  dailyIndependenceDementia: string
  // 歯科受診
  hasFamilyDentist: boolean
  hasRecentDentalVisit: boolean
  // 義歯・栄養
  dentureUse: 'yes_partial' | 'yes_full' | 'none'
  nutritionMethod: 'oral' | 'partialOral' | 'tube' | 'iv'
  dietForm: string
  // 誤嚥性肺炎・訪問歯科衛生指導
  aspirationPneumoniaHistory: boolean
  hasHygieneGuidanceSameMonth: boolean
  // 口腔の健康状態の評価
  oralHealthAssessment: {
    oralHygiene: boolean
    oralFunction: {
      biteIssue: boolean
      foodSpill: boolean
      choking: boolean
      oralDryness: boolean
      gurglingDifficulty: boolean
      brushingAfterMealDifficulty: boolean
      tongueMovement: boolean
    }
    teethCount: number
    toothIssues: {decay: boolean; fracture: boolean; restoration: boolean; residualRoot: boolean; other: boolean; otherText: string}
    dentureIssues: {mismatch: boolean; broken: boolean; needed: boolean; notUsed: boolean; other: boolean; otherText: string}
    periodontalDisease: boolean
    mucosalDisease: boolean
  }
  // 口腔衛生の管理内容
  managementContent: {
    recorder: string
    directingDoctorName: string
    recordDate: string
    goals: {
      dentalDisease: boolean
      oralHygiene: boolean
      caregiverSkill: boolean
      oralFunction: boolean
      dietForm: boolean
      nutritionStatus: boolean
      aspirationPrevention: boolean
      other: boolean
      otherText: string
    }
    implementations: {
      oralCleaning: boolean
      oralCleaningGuidance: boolean
      dentureCleaning: boolean
      dentureCleaningGuidance: boolean
      oralFunctionGuidance: boolean
      aspirationPrevention: boolean
      other: boolean
      otherText: string
    }
    frequency: string
  }
  // 実施記録（複数回分）
  implementationRecords: Array<{
    date: string
    recorder: string
    oralManagement: {
      oralCleaning: boolean
      oralCleaningGuidance: boolean
      dentureCleaning: boolean
      dentureCleaningGuidance: boolean
      oralFunctionGuidance: boolean
      aspirationPrevention: boolean
      other: boolean
      otherText: string
    }
    technicalAdvice: {
      riskBasedCleaning: boolean
      cleaningKnowledge: boolean
      oralFunctionImprovement: boolean
      dietConfirmation: boolean
      continueCurrent: boolean
      other: boolean
      otherText: string
    }
  }>
  // その他
  otherNotes: string
  clinicName: string
}

/** 文書コンテンツのユニオン型 */
export type DocumentContentData =
  | {type: 'doc_houmon_chiryou'; data: TreatmentContentData}
  | {type: 'doc_kanrikeikaku'; data: KanriKeikakuData}
  | {type: 'doc_houeishi'; data: HygieneGuidanceData}
  | {type: 'doc_seimitsu_kensa'; data: OralExamRecordData}
  | {type: 'doc_koukuu_kanri'; data: OralFunctionPlanData}
  | {type: 'doc_kouei_kanri'; data: OralHygieneManagementData}

/** アセスメント選択肢 */
export type AssessmentOptions = {
  seatRetention: string[]
  oralCleaning: string[]
  moistureRetention: string[]
  gargling: string[]
  malnutritionRisk: string[]
  choking: string[]
  oralIntake: string[]
  artificialNutrition: string[]
  moisture: string[]
  mainDish: string[]
  sideDish: string[]
  swallowing: string[]
  medicationSwallowing: string[]
}
