// types.ts

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

/** スタッフ */
export type Staff = {
  id: number
  name: string
  role: string
  sortOrder: number
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
  doctorId: number | null
  hygienistId: number | null
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
  evaluate: (ctx: EvalContext) => boolean
}

/** 実施項目マスタ */
export type ProcedureItemMaster = {
  id: string
  name: string
  fullName: string
  selectionMode: 'single' | 'multiple'
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
  baseup: boolean
  electronicPrescription: boolean
  other: boolean
  otherText: string
  [key: string]: boolean | string
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

/** 文書要件判定結果 */
export type DocumentRequirement = DocumentTemplate & {
  required: boolean
  reason: string
  dhMinutes?: number
}

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
