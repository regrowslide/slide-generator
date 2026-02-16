'use client'

/**
 * 訪問歯科アプリ モックアップ
 *
 * こちらはモックであり、単一ファイルに収まるよう構築されています。
 * このページは最終的に削除するため、本番プロジェクトでは、
 * プロジェクトの設計やルールに従ってページやコンポーネントを分割してください。
 */

import {useState, useMemo, useCallback} from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

// =============================================================================
// 定数・サンプルデータ
// =============================================================================

/** 施設タイプ */
const FACILITY_TYPES = {
  NURSING_HOME: '特別養護老人ホーム',
  GROUP_HOME: 'グループホーム',
  RESIDENTIAL: '居宅',
}

/** スタッフの役割 */
const STAFF_ROLES = {
  DOCTOR: 'doctor',
  HYGIENIST: 'hygienist',
}

/** 診察ステータス */
const EXAMINATION_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

/** 初期施設データ */
const INITIAL_FACILITIES = [
  {id: 1, name: 'ひまわりケアホーム', address: '東京都世田谷区北沢2-1-1', facilityType: 'NURSING_HOME'},
  {id: 2, name: 'グループホーム さくら', address: '東京都杉並区高円寺北3-2-5', facilityType: 'GROUP_HOME'},
  {id: 3, name: '特別養護老人ホーム 松風', address: '東京都練馬区光が丘1-8-3', facilityType: 'NURSING_HOME'},
]

/** デフォルトアセスメントデータ */
const DEFAULT_ASSESSMENT = {
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

/** 患者名ヘルパー関数 */
const getPatientName = p => `${p.lastName} ${p.firstName}`
const getPatientNameKana = p => `${p.lastNameKana} ${p.firstNameKana}`

/** 初期利用者データ（疾患・歯数・口腔機能情報・アセスメントを含む） */
const INITIAL_PATIENTS = [
  {
    id: 1,
    facilityId: 1,
    lastName: '山田',
    firstName: '太郎',
    lastNameKana: 'ヤマダ',
    firstNameKana: 'タロウ',
    gender: 'male',
    birthDate: '1943-05-15',
    age: 82,
    careLevel: '要介護3',
    building: '本館',
    floor: '2F',
    room: '201',
    notes: '嚥下機能低下気味。義歯調整要。',
    diseases: {
      dementia: false,
      hypertension: true,
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
    },
    teethCount: 18,
    hasDenture: true,
    hasOralHypofunction: true,
    assessment: {
      ...DEFAULT_ASSESSMENT,
      height: '165',
      weight: '58',
      bmi: '21.3',
      seatRetention: 'やや不良',
      oralCleaning: '声がけのみ必要',
      moistureRetention: '困難',
      gargling: '困難',
      malnutritionRisk: '少しあり',
      choking: '液体で時々',
      oralIntake: '全て経口摂取',
      moisture: 'トロミあり',
      mainDish: 'お粥',
      sideDish: '刻み食',
      swallowing: '時々むせることがある',
      medicationSwallowing: '問題なし',
    },
  },
  {
    id: 2,
    facilityId: 1,
    lastName: '鈴木',
    firstName: '花子',
    lastNameKana: 'スズキ',
    firstNameKana: 'ハナコ',
    gender: 'female',
    birthDate: '1940-11-20',
    age: 85,
    careLevel: '要介護4',
    building: '本館',
    floor: '2F',
    room: '202',
    notes: '認知症あり。拒否時は無理せず。',
    diseases: {
      dementia: true,
      hypertension: true,
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
    },
    teethCount: 12,
    hasDenture: true,
    hasOralHypofunction: true,
    assessment: {
      ...DEFAULT_ASSESSMENT,
      height: '150',
      weight: '45',
      bmi: '20.0',
      seatRetention: '不良',
      oralCleaning: '全介助が必要',
      moistureRetention: '不可能(むせる)',
      gargling: '不可能（むせる）',
      malnutritionRisk: 'リスク高め',
      choking: '頻繁にある',
      oralIntake: '一部経口摂取',
      artificialNutrition: '胃瘻',
      moisture: '経口摂取禁止',
      mainDish: 'ミキサー食',
      sideDish: 'ミキサー食',
      swallowing: '頻繁にむせてしまう',
      medicationSwallowing: '上手く飲み込めない',
    },
  },
  {
    id: 3,
    facilityId: 1,
    lastName: '高橋',
    firstName: '健一',
    lastNameKana: 'タカハシ',
    firstNameKana: 'ケンイチ',
    gender: 'male',
    birthDate: '1948-03-10',
    age: 77,
    careLevel: '要介護2',
    building: '本館',
    floor: '2F',
    room: '203',
    notes: '',
    diseases: {
      dementia: false,
      hypertension: false,
      cerebrovascular: false,
      mentalDisorder: false,
      parkinsons: false,
      heartFailure: true,
      terminalCancer: false,
      senility: false,
      femurFracture: false,
      spinalStenosis: false,
      als: false,
      cerebellarDegeneration: false,
      multipleSclerosis: false,
      disuseSyndrome: false,
    },
    teethCount: 24,
    hasDenture: false,
    hasOralHypofunction: false,
    assessment: {...DEFAULT_ASSESSMENT},
  },
  {
    id: 4,
    facilityId: 1,
    lastName: '田中',
    firstName: '幸子',
    lastNameKana: 'タナカ',
    firstNameKana: 'サチコ',
    gender: 'female',
    birthDate: '1945-07-22',
    age: 80,
    careLevel: '要介護2',
    building: '本館',
    floor: '2F',
    room: '205',
    notes: '家族立ち会い希望あり',
    diseases: {
      dementia: false,
      hypertension: false,
      cerebrovascular: true,
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
    },
    teethCount: 20,
    hasDenture: false,
    hasOralHypofunction: false,
    assessment: {...DEFAULT_ASSESSMENT},
  },
  {
    id: 5,
    facilityId: 1,
    lastName: '伊藤',
    firstName: '博文',
    lastNameKana: 'イトウ',
    firstNameKana: 'ヒロフミ',
    gender: 'male',
    birthDate: '1938-01-05',
    age: 88,
    careLevel: '要介護5',
    building: '本館',
    floor: '3F',
    room: '301',
    notes: '入れ歯紛失注意',
    diseases: {
      dementia: false,
      hypertension: true,
      cerebrovascular: false,
      mentalDisorder: false,
      parkinsons: true,
      heartFailure: false,
      terminalCancer: false,
      senility: true,
      femurFracture: false,
      spinalStenosis: false,
      als: false,
      cerebellarDegeneration: false,
      multipleSclerosis: false,
      disuseSyndrome: true,
    },
    teethCount: 8,
    hasDenture: true,
    hasOralHypofunction: true,
    assessment: {
      ...DEFAULT_ASSESSMENT,
      height: '160',
      weight: '50',
      bmi: '19.5',
      aspirationPneumoniaHistory: 'あり',
      aspirationPneumoniaDate: '2025-06-15',
      seatRetention: '不良',
      oralCleaning: '全介助が必要',
      moistureRetention: '不可能(むせる)',
      gargling: '不可能（むせる）',
      malnutritionRisk: 'リスク高め',
      choking: '頻繁にある',
      oralIntake: '一部経口摂取',
      moisture: 'トロミあり',
      mainDish: 'ミキサー食',
      sideDish: 'ミキサー食',
      swallowing: '頻繁にむせてしまう',
      medicationSwallowing: '上手く飲み込めない',
    },
  },
  {
    id: 6,
    facilityId: 2,
    lastName: '佐藤',
    firstName: '美咲',
    lastNameKana: 'サトウ',
    firstNameKana: 'ミサキ',
    gender: 'female',
    birthDate: '1950-09-12',
    age: 75,
    careLevel: '要介護1',
    building: 'A棟',
    floor: '1F',
    room: '101',
    notes: '',
    diseases: {
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
    },
    teethCount: 22,
    hasDenture: false,
    hasOralHypofunction: false,
    assessment: {...DEFAULT_ASSESSMENT},
  },
  {
    id: 7,
    facilityId: 2,
    lastName: '渡辺',
    firstName: '次郎',
    lastNameKana: 'ワタナベ',
    firstNameKana: 'ジロウ',
    gender: 'male',
    birthDate: '1942-12-01',
    age: 83,
    careLevel: '要介護3',
    building: 'A棟',
    floor: '1F',
    room: '102',
    notes: '車椅子使用',
    diseases: {
      dementia: false,
      hypertension: true,
      cerebrovascular: false,
      mentalDisorder: false,
      parkinsons: false,
      heartFailure: true,
      terminalCancer: false,
      senility: false,
      femurFracture: false,
      spinalStenosis: false,
      als: false,
      cerebellarDegeneration: false,
      multipleSclerosis: false,
      disuseSyndrome: false,
    },
    teethCount: 15,
    hasDenture: true,
    hasOralHypofunction: true,
    assessment: {
      ...DEFAULT_ASSESSMENT,
      height: '170',
      weight: '62',
      bmi: '21.5',
      seatRetention: 'やや不良',
      oralCleaning: '一部お手伝いが必要',
      moistureRetention: '困難',
      gargling: '困難',
      malnutritionRisk: '少しあり',
      choking: '液体で時々',
      oralIntake: '全て経口摂取',
      moisture: 'トロミなし',
      mainDish: '常食',
      sideDish: 'ひと口大',
      swallowing: '時々むせることがある',
      medicationSwallowing: '苦手',
    },
  },
]

/** 初期スタッフデータ */
const INITIAL_STAFF = [
  {id: 1, name: '田中 医師', role: STAFF_ROLES.DOCTOR, sortOrder: 1},
  {id: 2, name: '山本 医師', role: STAFF_ROLES.DOCTOR, sortOrder: 2},
  {id: 3, name: '佐々木 衛生士', role: STAFF_ROLES.HYGIENIST, sortOrder: 1},
  {id: 4, name: '中村 衛生士', role: STAFF_ROLES.HYGIENIST, sortOrder: 2},
]

/** 初期訪問計画データ */
const INITIAL_VISIT_PLANS = [
  {id: 1, facilityId: 1, visitDate: '2026-01-18', status: 'scheduled'},
  {id: 2, facilityId: 1, visitDate: '2026-01-25', status: 'scheduled'},
  {id: 3, facilityId: 2, visitDate: '2026-01-20', status: 'scheduled'},
]

/** 初期診察データ */
const INITIAL_EXAMINATIONS = [
  {
    id: 1,
    visitPlanId: 1,
    patientId: 2,
    doctorId: 1,
    hygienistId: 3,
    status: EXAMINATION_STATUS.WAITING,
    sortOrder: 1,
    vitalBefore: {bloodPressure: '120/80', spo2: '98'},
    vitalAfter: null,
    treatmentItems: [],
    procedureItems: {}, // オブジェクト形式: { itemId: { categoryId: string } }
    visitCondition: '',
    oralFindings: '',
    treatment: '',
    nextPlan: '',
    drStartTime: null,
    drEndTime: null,
    dhStartTime: null,
    dhEndTime: null,
  },
  {
    id: 2,
    visitPlanId: 1,
    patientId: 1,
    doctorId: 1,
    hygienistId: null,
    status: EXAMINATION_STATUS.WAITING,
    sortOrder: 2,
    vitalBefore: null,
    vitalAfter: null,
    treatmentItems: [],
    procedureItems: {}, // オブジェクト形式: { itemId: { categoryId: string } }
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

/** 実施項目マスタ（一旦廃止 - MTG 0206決定） */
// const TREATMENT_ITEMS_MASTER = [
//   {id: 'zaitakukan', name: '在宅管', fullName: '在宅管（管理）', category: '管理'},
//   {id: 'houeishi', name: '訪衛指', fullName: '訪衛指（指導）', category: '指導'},
//   {id: 'koukuu', name: '口腔機能', fullName: '口腔機能（検査/訓練）', category: '検査'},
//   {id: 'shisetsu', name: '施設系', fullName: '施設系（会議等）', category: 'その他'},
// ]

/** 医院資格マスタ（届出・施設基準） */
const CLINIC_QUALIFICATIONS = [
  {id: 'shiensin1', name: '①歯援診1', description: '在宅療養支援歯科診療所1'},
  {id: 'shiensin2', name: '①歯援診2', description: '在宅療養支援歯科診療所2'},
  {id: 'shiensin2', name: '①歯援診（その他）', description: '在宅療養支援歯科診療所2'},
  {id: 'zahoshin', name: '②在歯管', description: '在宅歯科疾患診療管理料'},
  {id: 'koukukan', name: '③口管強', description: '（歯科口腔リハビリテーション料2の注6に規定する施設基準）'},
  {id: 'baseup', name: '④ベースアップ加算', description: ''},
  {id: 'dx', name: '⑤DX加算', description: ''},
  {id: 'johorenkei', name: '⑥在宅歯科医療情報連携加算', description: 'ICTで他職種と情報共有した月に算定'},
  // {id: 'other', name: 'その他', description: '', hasTextInput: true},
]

/** 初期医院データ */
const INITIAL_CLINIC = {
  id: 1,
  name: '〇〇歯科クリニック',
  address: '東京都千代田区丸の内1-1-1',
  phone: '03-1234-5678',
  representative: '院長 山田太郎',
  qualifications: {
    shiensin1: true,
    shiensin2: true,
    zahoshin: true,
    koukukan: false,
    johorenkei: true,
    dx: true,
    baseup: false,
    other: false,
    otherText: '',
  },
}

/** 患者疾患マスタ（基礎疾患チェックリスト） */
const PATIENT_DISEASES = [
  {id: 'dementia', name: '認知症'},
  {id: 'hypertension', name: '高血圧症'},
  {id: 'cerebrovascular', name: '脳血管障害'},
  {id: 'mentalDisorder', name: '精神疾患'},
  {id: 'parkinsons', name: 'パーキンソン病'},
  {id: 'heartFailure', name: '心不全'},
  {id: 'terminalCancer', name: '末期がん'},
  {id: 'senility', name: '老衰'},
  {id: 'femurFracture', name: '大腿骨頸部骨折'},
  {id: 'spinalStenosis', name: '脊柱管狭窄症'},
  {id: 'als', name: '筋萎縮性側索硬化症（ALS）'},
  {id: 'cerebellarDegeneration', name: '腎臓小脳変性症'},
  {id: 'multipleSclerosis', name: '多発性硬化症'},
  {id: 'disuseSyndrome', name: '廃用症候群'},
]

/** アセスメント選択肢マスタ */
const ASSESSMENT_OPTIONS = {
  seatRetention: ['良好', 'やや不良', '不良'],
  oralCleaning: ['自主的に行える', '声がけのみ必要', '一部お手伝いが必要', '全介助が必要'],
  moistureRetention: ['無理なく可能', '困難', '不可能(むせる)', '飲んでしまう', '口から出てしまう'],
  gargling: ['可能', '困難', '不可能（むせる）', '飲んでしまう', '口から出てしまう'],
  malnutritionRisk: ['なし', '少しあり', 'リスク高め', '不明'],
  choking: ['なし', '液体で時々', '頻繁にある'],
  oralIntake: ['全て経口摂取', '一部経口摂取', '経口摂取なし'],
  artificialNutrition: ['無し', '胃瘻', '経鼻', '抹消静脈', '中心静脈', 'その他'],
  moisture: ['トロミなし', 'トロミあり', '経口摂取禁止'],
  mainDish: ['常食', '柔らかめ', 'お粥', 'ミキサー食', 'その他'],
  sideDish: ['常食', 'ひと口大', '刻み食', 'ミキサー食', 'その他'],
  swallowing: ['問題なし', '時々むせることがある', '頻繁にむせてしまう'],
  medicationSwallowing: ['問題なく飲める', '苦手', '上手く飲み込めない'],
}

/** 実施項目マスタ（加算用） - Excel「算定項目」シートに基づく完全版 */
const PROCEDURE_ITEMS_MASTER = [
  // === 歯科訪問診療料（歯訪） ===
  {
    id: 'shihou',
    name: '歯訪',
    fullName: '歯科訪問診療料',
    infoUrl: '/dental/docs/shihou.pdf',
    infoText: 'Drの診療ありの場合に算定。タイマー時間（20分以上/未満）と同一建物内の患者数で区分が自動判定されます。',
    requiredRole: 'doctor',
    requiredQualification: 'shihoujin',
    categories: [
      {id: '1-20over', name: '20分以上（1人）', points: 1100, condition: {time: '20over', count: '1'}},
      {id: '2-20over', name: '20分以上（2～3人）', points: 410, condition: {time: '20over', count: '2-3'}},
      {id: '3-20over', name: '20分以上（4～9人）', points: 310, condition: {time: '20over', count: '4-9'}},
      {id: '4-20over', name: '20分以上（10～19人）', points: 160, condition: {time: '20over', count: '10-19'}},
      {id: '5-20over', name: '20分以上（20人以上）', points: 95, condition: {time: '20over', count: '20+'}},
      {id: '1-20under', name: '20分未満（1人）', points: 1100, condition: {time: '20under', count: '1'}},
      {id: '2-20under', name: '20分未満（2～3人）', points: 287, condition: {time: '20under', count: '2-3'}},
      {id: '3-20under', name: '20分未満（4～9人）', points: 217, condition: {time: '20under', count: '4-9'}},
      {id: '4-20under', name: '20分未満（10～19人）', points: 96, condition: {time: '20under', count: '10-19'}},
      {id: '5-20under', name: '20分未満（20人以上）', points: 57, condition: {time: '20under', count: '20+'}},
    ],
    documents: [],
    autoJudgeCondition: 'timeAndPatientCount',
    note: 'Drの診療ありの場合のみ。タイマー時間と同一建物患者数で自動判定',
  },
  // === 歯科訪問診療補助加算（訪補助） ===
  {
    id: 'houhojo',
    name: '訪補助',
    fullName: '歯科訪問診療補助加算',
    infoUrl: '/dental/docs/houhojo.pdf',
    infoText: 'DHがDrに同行した場合に算定。カルテに同行衛生士名の記載が必要です。同一建物1名のみ/2名以上で点数が異なります。',
    requiredRole: 'doctor',
    requiredQualification: 'shihoujin',
    categories: [
      {id: 'single', name: '同一建物1名のみ', points: 115},
      {id: 'multi-koukankyou', name: '2名以上（口管強）', points: 50, requiredClinicQualification: 'koukukan'},
      {id: 'multi-normal', name: '2名以上（通常）', points: 30},
    ],
    documents: [],
    autoJudgeCondition: 'patientCount',
    note: 'DHがDrに同行した場合。カルテに同行衛生士名の記載が必要',
  },
  // === 歯科疾患在宅療養管理料（歯在管） ===
  {
    id: 'shizaikan',
    name: '歯在管',
    fullName: '歯科疾患在宅療養管理料',
    infoUrl: '/dental/docs/shizaikan.pdf',
    infoText: '月1回算定。Drの診療時に算定を提案。歯援診の届出区分により点数が異なります。管理計画書の提供が必要。',
    requiredRole: 'doctor',
    monthlyLimit: 1,
    categories: [
      {id: 'shiensin1', name: '歯援診１', points: 340, requiredClinicQualification: 'shiensin1'},
      {id: 'shiensin2', name: '歯援診２', points: 230, requiredClinicQualification: 'shiensin2'},
      {id: 'other', name: 'それ以外', points: 200},
    ],
    documents: [{id: 'doc_kanrikeikaku', name: '管理計画書'}],
    autoJudgeCondition: 'clinicQualification',
    note: '月に1度算定。Drの診療があった時に算定を提案',
  },
  // === 歯在管文書提供加算 ===
  {
    id: 'shizaikan_bunsho',
    name: '歯在管文書',
    fullName: '文書提供加算（在宅・訪問関連）',
    infoUrl: '/dental/docs/shizaikan_bunsho.pdf',
    infoText: '歯在管を請求した時に合わせて算定。管理計画書等の文書提供が必須です。10点。',
    monthlyLimit: 1,
    defaultPoints: 10,
    categories: [],
    documents: [{id: 'doc_kanrikeikaku', name: '管理計画書'}],
    note: '歯在管を請求した時に算定するかどうかを提案。文書提供必須',
  },
  // === 画像診断（P画像） ===
  {
    id: 'p_gazou',
    name: 'P画像',
    fullName: '歯周病患者画像活用指導料',
    infoUrl: '/dental/docs/p_gazou.pdf',
    infoText: '1枚につき10点。口腔内写真を撮影し患者に見せながら指導した場合に算定できます。',
    categories: [{id: '1-5', name: '1～5枚', points: 10, unit: 'per_sheet'}],
    documents: [],
    note: '1枚につき10点。算定可能なタイミングを確認',
  },
  // === 在宅患者歯科治療総合医療管理料（在歯管） ===
  {
    id: 'zaishikan',
    name: '在歯管',
    fullName: '在宅患者歯科治療総合医療管理料',
    infoUrl: '/dental/docs/zaishikan.pdf',
    infoText: '患者マスターに疾患登録があり、かつDrが該当治療を実施した場合に算定可能。45点。',
    requiredRole: 'doctor',
    requiredQualification: 'zaishikan',
    defaultPoints: 45,
    categories: [],
    documents: [],
    autoJudgeCondition: 'patientDiseaseAndTreatment',
    note: '疾患登録+治療の2条件が必要。患者マスターの疾患☑+Drの該当治療実施時に算定可能',
  },
  // === 訪問歯科衛生指導料（訪衛指） ===
  {
    id: 'houeishi',
    name: '訪衛指',
    fullName: '訪問歯科衛生指導料',
    infoUrl: '/dental/docs/houeishi.pdf',
    infoText: 'DHが20分以上の施術を行った場合に算定。月4回まで。タイマーで20分以上を確認してください。',
    requiredRole: 'hygienist',
    monthlyLimit: 4,
    timeRequirement: 20,
    categories: [
      {id: 'single', name: '1名のみ', points: 362},
      {id: '2-9', name: '2～9名', points: 326},
      {id: '10+', name: '10名以上', points: 295},
    ],
    documents: [{id: 'doc_houeishi', name: '訪問歯科衛生指導説明書'}],
    autoJudgeCondition: 'patientCount',
    note: 'DHが20分以上の施術を行った場合。月4回まで。タイマーで20分以上で自動算定を提案',
  },
  // === 在宅等療養患者専門的口腔衛生処置（在口衛） ===
  {
    id: 'zaikouei',
    name: '在口衛',
    fullName: '在宅等療養患者専門的口腔衛生処置',
    infoUrl: '/dental/docs/zaikouei.pdf',
    infoText: '専門的な口腔衛生処置を実施した場合にマニュアルで判定。130点。',
    defaultPoints: 130,
    categories: [],
    documents: [],
    note: 'マニュアル判定',
  },
  // === 在宅歯科栄養サポートチーム等連携指導料（NST2） ===
  {
    id: 'nst2',
    name: 'NST2',
    fullName: '在宅歯科栄養サポートチーム等連携指導料',
    infoUrl: '/dental/docs/nst2.pdf',
    infoText: '栄養サポートチームとの連携指導を行った場合にマニュアル判定。100点。',
    defaultPoints: 100,
    categories: [],
    documents: [],
    note: 'マニュアル判定',
  },
  // === 口腔機能低下症（病名登録用） ===
  {
    id: 'koukuu_kinou',
    name: '口腔機能低下症',
    fullName: '口腔機能低下症（病名/管理対象）',
    infoUrl: '/dental/docs/koukuu_kinou.pdf',
    infoText: '病名登録用。歯リハ3の算定条件として必要。チェックを入れると歯リハ3が算定可能になります。',
    defaultPoints: 0,
    categories: [],
    documents: [],
    note: '病名登録用。歯リハ3の算定条件',
  },
  // === 舌圧検査 ===
  {
    id: 'zetsuatsu',
    name: '舌圧',
    fullName: '舌圧検査（口腔機能検査の一部）',
    infoUrl: '/dental/docs/zetsuatsu.pdf',
    infoText: '口腔機能検査の一部。3ヶ月に1回算定可能。140点。',
    defaultPoints: 140,
    intervalMonths: 3,
    categories: [],
    documents: [],
    note: '3ヶ月毎に算定可能',
  },
  // === 咬合圧検査 ===
  {
    id: 'kougouatsu1',
    name: '咬合圧1',
    fullName: '咬合圧検査１',
    infoUrl: '/dental/docs/kougouatsu.pdf',
    infoText: '咬合圧を測定し口腔機能の評価を行う検査。130点。',
    defaultPoints: 130,
    categories: [],
    documents: [],
  },
  // === 口腔細菌定量検査 ===
  {
    id: 'koukinkensa1',
    name: '口菌検1',
    fullName: '口腔細菌定量検査1',
    infoUrl: '/dental/docs/koukinkensa.pdf',
    infoText: '口腔内の細菌量を測定する検査。点数は要確認。',
    defaultPoints: 0,
    categories: [],
    documents: [],
    note: '点数は要確認',
  },
  // === 咀嚼能力検査 ===
  {
    id: 'soshaku1',
    name: '咀嚼1',
    fullName: '咀嚼能力検査１',
    infoUrl: '/dental/docs/soshaku.pdf',
    infoText: '咀嚼能力を測定する検査。3ヶ月に1回算定可能。140点。',
    defaultPoints: 140,
    intervalMonths: 3,
    categories: [],
    documents: [],
    note: '3ヶ月に1回算定可能',
  },
  // === 歯科口腔リハビリテーション料３（歯リハ3） ===
  {
    id: 'shiriha3',
    name: '歯リハ3',
    fullName: '歯科口腔リハビリテーション料３',
    infoUrl: '/dental/docs/shiriha.pdf',
    infoText: '口腔機能低下症の患者に対するリハビリ。月2回まで。口管強加算の届出で点数UP。',
    requiredRole: 'doctor',
    monthlyLimit: 2,
    categories: [
      {id: 'normal', name: '通常', points: 60},
      {id: 'koukankyou', name: '口管強加算', points: 110, requiredClinicQualification: 'koukukan'},
    ],
    documents: [],
    autoJudgeCondition: 'oralHypofunction',
    note: '口腔機能低下症にチェックが入っている場合。月2回まで。Drの診療時に提示',
  },
  // === 歯科口腔リハビリテーション料１（歯リハ1） ===
  {
    id: 'shiriha1',
    name: '歯リハ1',
    fullName: '歯科口腔リハビリテーション料１',
    infoUrl: '/dental/docs/shiriha.pdf',
    infoText: '義歯の登録がある患者に対するリハビリ。通常104点/複雑124点。',
    categories: [
      {id: 'normal', name: '通常', points: 104},
      {id: 'complex', name: '複雑', points: 124},
    ],
    documents: [],
    note: '利用者マスターに義歯の登録がある場合',
  },
  // === ベースアップ加算 ===
  {
    id: 'baseup',
    name: 'ベースアップ',
    fullName: '在宅ベースアップ評価料',
    infoUrl: '/dental/docs/baseup.pdf',
    infoText: '届出が必要。訪問の都度算定可能。点数は届出区分により異なります。',
    requiredQualification: 'baseup',
    defaultPoints: 0,
    categories: [],
    documents: [],
    note: '届出必要。訪問の都度算定可能。点数は届出区分により異なる',
  },
  // === 在宅医療DX推進体制整備加算（在DX） ===
  {
    id: 'dx',
    name: '在DX',
    fullName: '在宅医療DX推進体制整備加算',
    infoUrl: '/dental/docs/dx.pdf',
    infoText: '施設基準と届出が必要。月1回算定。電子処方箋の有無で点数が異なります。',
    requiredQualification: 'dx',
    monthlyLimit: 1,
    categories: [
      {id: 'with-prescription', name: '電子処方箋有', points: 11},
      {id: 'without-prescription', name: '電子処方箋無', points: 8},
    ],
    documents: [],
    autoJudgeCondition: 'clinicDxSetting',
    note: '施設基準と届出が必要。月1回算定',
  },
  // === 診療情報等連携共有料（情共１） ===
  {
    id: 'joukyo1',
    name: '情共1',
    fullName: '診療情報等連携共有料',
    infoUrl: '/dental/docs/joukyo.pdf',
    infoText: '患者マスターに疾患が登録されている場合に算定可能。医科への情報提供が必要。120点。',
    defaultPoints: 120,
    categories: [],
    documents: [],
    autoJudgeCondition: 'patientDisease',
    note: '患者マスターに疾患が登録されている場合に「医科に情共１を出しますか？」を表示',
  },
  // === 総合医療管理加算（総医） ===
  {
    id: 'soui',
    name: '総医',
    fullName: '総合医療管理加算',
    infoUrl: '/dental/docs/soui.pdf',
    infoText: '歯在管の算定と同時に加算。患者マスターに疾患登録が必要。50点。',
    defaultPoints: 50,
    categories: [],
    documents: [],
    autoJudgeCondition: 'patientDiseaseKJ3',
    note: '歯在管の算定と同時に加算。患者マスターの疾患登録確認',
  },
  // === フッ化物歯面塗布処置（F局） ===
  {
    id: 'fkyoku',
    name: 'F局（根C）',
    fullName: 'フッ化物歯面塗布処置',
    infoUrl: '/dental/docs/fkyoku.pdf',
    infoText: '3ヶ月に1回のみ算定可能。前回のF塗布から3ヶ月目に算定を提案します。80点。',
    defaultPoints: 80,
    intervalMonths: 3,
    categories: [],
    documents: [],
    note: '3ヶ月に1回のみ算定可能。前回のF塗布から3ヶ月目に提案',
  },
  // === 根面齲蝕管理料（根C管） ===
  {
    id: 'konc_kan',
    name: '根C管',
    fullName: '根面齲蝕管理料',
    infoUrl: '/dental/docs/konc.pdf',
    infoText: '毎月初回の診療時に提案。カルテに管理計画を記載が必要。口管強加算の届出で点数UP。',
    categories: [
      {id: 'normal', name: '通常', points: 30},
      {id: 'koukankyou', name: '口管強加算', points: 78, requiredClinicQualification: 'koukukan'},
    ],
    documents: [],
    autoJudgeCondition: 'clinicKoukankyou',
    note: '毎月初回の診療時に提案。カルテに管理計画を記載',
  },
  // === う蝕薬物塗布処置（サホ塗布） ===
  {
    id: 'saho',
    name: 'サホ塗布',
    fullName: 'う蝕薬物塗布処置',
    infoUrl: '/dental/docs/saho.pdf',
    infoText: 'う蝕薬物塗布処置。3歯まで46点、4歯以上56点。在歯管算定可能条件の1つ。',
    categories: [
      {id: '1-3', name: '～3歯まで', points: 46},
      {id: '4+', name: '4歯以上', points: 56},
    ],
    documents: [],
    note: '処置時にチェック。在歯管算定可能条件の1つ',
  },
  // === 歯周精密検査（P精検） ===
  {
    id: 'p_seiken',
    name: 'P精検',
    fullName: '歯周精密検査',
    infoUrl: '/dental/docs/p_seiken.pdf',
    infoText: '歯周精密検査。患者の歯数で点数が決まります。検査後はSC/SRP/SPT等の処置につながります。',
    categories: [
      {id: '20+', name: '20歯以上', points: 400},
      {id: '10-19', name: '10～19歯', points: 220},
      {id: '1-9', name: '1～9歯', points: 100},
    ],
    documents: [],
    autoJudgeCondition: 'patientTeethCount',
    note: '患者マスターの歯数で点数を提案。検査後はSC/SRP/SPT等の処置が来る',
  },
  // === 歯周基本検査（P基検） ===
  {
    id: 'p_kiken',
    name: 'P基検',
    fullName: '歯周基本検査',
    infoUrl: '/dental/docs/p_kiken.pdf',
    infoText: '歯周基本検査。歯数で点数が変わります（20歯以上200点/10-19歯110点/1-9歯50点）。',
    categories: [
      {id: '20+', name: '20歯以上', points: 200},
      {id: '10-19', name: '10～19歯', points: 110},
      {id: '1-9', name: '1～9歯', points: 50},
    ],
    documents: [],
    autoJudgeCondition: 'patientTeethCount',
  },
  // === 歯周安定期治療（SPT） ===
  {
    id: 'spt',
    name: 'SPT',
    fullName: '歯周安定期治療',
    infoUrl: '/dental/docs/spt.pdf',
    infoText: '歯周安定期治療。口管強なしの場合は最初の算定から3ヶ月以降に表示。350点。',
    defaultPoints: 350,
    categories: [],
    documents: [],
    autoJudgeCondition: 'sptTiming',
    note: '口管強がない時は最初の算定から3ヶ月以降に表示。患者マスターの歯数で反映',
  },
  // === 口管強加算（SPT用） ===
  {
    id: 'koukan_kasan',
    name: '口管強加算',
    fullName: '口管強加算（SPT同時）',
    infoUrl: '/dental/docs/koukan.pdf',
    infoText: 'SPTと同時算定。口管強の届出がある場合に自動表示されます。120点。',
    requiredQualification: 'koukukan',
    defaultPoints: 120,
    categories: [],
    documents: [],
    autoJudgeCondition: 'clinicKoukankyou',
    note: 'SPTと同時算定。口管強の届出がある場合に自動表示',
  },
  // === 糖尿病加算（SPT用） ===
  {
    id: 'tounyou',
    name: '糖尿病加算',
    fullName: '糖尿病加算（SPT同時）',
    infoUrl: '/dental/docs/tounyou.pdf',
    infoText: 'SPTと同時算定。患者マスターに糖尿病登録がある場合に提案されます。80点。',
    defaultPoints: 80,
    categories: [],
    documents: [],
    autoJudgeCondition: 'patientDiabetes',
    note: 'SPTと同時算定。患者マスターで糖尿病の登録がある場合に提案',
  },
  // === 歯周重症化予防治療（P重防） ===
  {
    id: 'p_juubou',
    name: 'P重防',
    fullName: '歯周重症化予防治療',
    infoUrl: '/dental/docs/p_juubou.pdf',
    infoText: 'SPTとセットの関係。歯周重症化の予防治療。300点。',
    defaultPoints: 300,
    categories: [],
    documents: [],
    note: 'SPTとセットのような関係。患者マスターの歯数で反映',
  },
  // === 歯科訪問診療移行加算（訪移行） ===
  {
    id: 'houikou',
    name: '訪移行',
    fullName: '歯科訪問診療移行加算',
    infoUrl: '/dental/docs/houikou.pdf',
    infoText: '歯科訪問診療への移行時に算定。100点。',
    defaultPoints: 100,
    categories: [],
    documents: [],
  },
  // === 訪問口腔リハビリテーション ===
  {
    id: 'houmon_koukuu_riha',
    name: '訪問口腔リハ',
    fullName: '訪問口腔リハビリテーション',
    infoUrl: '/dental/docs/houmon_riha.pdf',
    infoText: '訪問口腔リハビリテーション。600点。バージョンアップ時に詳細掲載予定。',
    defaultPoints: 600,
    categories: [],
    documents: [],
    note: 'バージョンアップ時に掲載予定',
  },
  // === 訪問口腔リハビリテーション加算 ===
  {
    id: 'houmon_koukuu_riha_kasan',
    name: '訪問口腔リハ加算',
    fullName: '訪問口腔リハビリテーション加算',
    infoUrl: '/dental/docs/houmon_riha_kasan.pdf',
    infoText: '訪問口腔リハの加算。歯援診の区分と口管強の届出により点数が変わります。',
    categories: [
      {id: 'shiensin1', name: '歯援診1', points: 145},
      {id: 'shiensin2', name: '歯援診2', points: 80},
      {id: 'koukankyou', name: '口管強', points: 75, requiredClinicQualification: 'koukukan'},
    ],
    documents: [],
    autoJudgeCondition: 'clinicQualification',
    note: 'バージョンアップ時に掲載予定',
  },
  // === 在宅歯科医療情報連携加算 ===
  {
    id: 'johorenkei',
    name: '情報連携',
    fullName: '在宅歯科医療情報連携加算',
    infoUrl: '/dental/docs/johorenkei.pdf',
    infoText: 'ICTで他職種と情報共有した月に算定。月1回。100点。届出が必要です。',
    requiredQualification: 'johorenkei',
    monthlyLimit: 1,
    defaultPoints: 100,
    categories: [],
    documents: [],
    note: 'ICTで他職種と情報共有した月に算定。月1回',
  },
]

// =============================================================================
// 提供文書テンプレート
// =============================================================================

/** 提供文書テンプレート定義 */
const DOCUMENT_TEMPLATES = {
  doc_kanrikeikaku: {
    id: 'doc_kanrikeikaku',
    name: '管理計画書',
    fullName: '歯科疾患在宅療養管理計画書',
    relatedProcedure: 'shizaikan', // 歯在管
    monthlyLimit: 1,
    // 流し込み項目定義
    fields: {
      auto: [
        'clinicName',
        'clinicAddress',
        'clinicPhone',
        'representative',
        'facilityName',
        'facilityAddress',
        'patientName',
        'patientNameKana',
        'patientBuilding',
        'patientRoom',
        'teethCount',
        'hasDenture',
        'hasOralHypofunction',
        'visitCondition',
        'oralFindings',
        'treatment',
        'nextPlan',
        'createdAt',
      ],
      manual: ['managementPlan', 'oralHygieneGoal'],
    },
  },
  doc_houeishi: {
    id: 'doc_houeishi',
    name: '訪問歯科衛生指導説明書',
    fullName: '訪問歯科衛生指導説明書',
    relatedProcedure: 'houeishi', // 訪衛指
    monthlyLimit: 4,
    dhMinutesRequired: 20, // DH20分以上が条件
    // 流し込み項目定義
    fields: {
      auto: ['clinicName', 'patientName', 'patientNameKana', 'dhMinutes', 'visitCondition', 'oralFindings', 'createdAt'],
      manual: ['guidanceContent', 'homeCareMethod', 'nextGuidancePlan'],
    },
  },
}

/** 算定項目カテゴリ分類（算定項目・点数一覧ページ用） */
const SCORING_SECTIONS = [
  {id: 'shihou', label: '歯訪系', items: ['shihou', 'houhojo', 'shizaikan', 'shizaikan_bunsho', 'p_gazou']},
  {id: 'zaitaku', label: '在宅管系', items: ['zaishikan', 'joukyo1', 'soui', 'konc_kan', 'saho']},
  {id: 'houeishi', label: '訪衛指系', items: ['houeishi', 'zaikouei', 'nst2']},
  {id: 'riha', label: 'リハ系', items: ['shiriha3', 'shiriha1', 'houmon_koukuu_riha', 'houmon_koukuu_riha_kasan']},
  {id: 'kensa', label: '検査系', items: ['koukuu_kinou', 'zetsuatsu', 'kougouatsu1', 'koukinkensa1', 'soshaku1']},
  {id: 'shishu', label: '歯周系', items: ['p_seiken', 'p_kiken', 'spt', 'koukan_kasan', 'tounyou', 'p_juubou']},
  {id: 'other', label: 'その他', items: ['fkyoku', 'houikou', 'baseup', 'dx', 'johorenkei']},
]

/** 算定履歴モックデータ（算定対象台帳用） */
const INITIAL_SCORING_HISTORY = [
  {id: 1, patientId: 1, procedureId: 'shizaikan', lastScoredAt: '2025-12-05', points: 340},
  {id: 2, patientId: 1, procedureId: 'zetsuatsu', lastScoredAt: '2025-10-01', points: 140},
  {id: 3, patientId: 1, procedureId: 'fkyoku', lastScoredAt: '2025-11-02', points: 80},
  {id: 4, patientId: 1, procedureId: 'spt', lastScoredAt: '2025-12-05', points: 350},
  {id: 5, patientId: 2, procedureId: 'shizaikan', lastScoredAt: '2026-01-10', points: 340},
  {id: 6, patientId: 2, procedureId: 'houeishi', lastScoredAt: '2026-01-10', points: 362},
  {id: 7, patientId: 2, procedureId: 'zetsuatsu', lastScoredAt: '2025-08-15', points: 140},
  {id: 8, patientId: 3, procedureId: 'shizaikan', lastScoredAt: '2025-11-20', points: 340},
  {id: 9, patientId: 5, procedureId: 'shizaikan', lastScoredAt: '2025-12-10', points: 340},
  {id: 10, patientId: 5, procedureId: 'fkyoku', lastScoredAt: '2025-09-10', points: 80},
  {id: 11, patientId: 5, procedureId: 'shiriha3', lastScoredAt: '2025-12-10', points: 110},
  {id: 12, patientId: 7, procedureId: 'shizaikan', lastScoredAt: '2025-12-20', points: 340},
  {id: 13, patientId: 7, procedureId: 'spt', lastScoredAt: '2025-10-20', points: 350},
]

/** 保存済み文書モックデータ（提供文書一覧用） */
const INITIAL_SAVED_DOCUMENTS = [
  {
    id: 1,
    patientId: 1,
    examinationId: 1,
    templateId: 'doc_kanrikeikaku',
    templateName: '管理計画書',
    createdAt: '2025-12-05',
    version: 1,
  },
  {
    id: 2,
    patientId: 2,
    examinationId: 2,
    templateId: 'doc_houeishi',
    templateName: '訪問歯科衛生指導説明書',
    createdAt: '2026-01-10',
    version: 1,
  },
  {
    id: 3,
    patientId: 2,
    examinationId: 2,
    templateId: 'doc_kanrikeikaku',
    templateName: '管理計画書',
    createdAt: '2026-01-10',
    version: 1,
  },
]

/**
 * 文書算定ロジック
 * 診察の実施項目とDH時間から、必要な提供文書を判定する
 * @param {Object} params
 * @param {Object} params.procedureItems - 選択された実施項目 { itemId: { categoryId } }
 * @param {number} params.dhSeconds - DH施術時間（秒）
 * @returns {Object} 各文書の必要性と状態
 */
const calculateDocumentRequirements = ({procedureItems, dhSeconds}) => {
  const dhMinutes = Math.floor(dhSeconds / 60)
  const result = {}

  // 管理計画書: 歯在管（shizaikan）がONの場合に必要
  const shizaikanSelected = !!procedureItems?.shizaikan
  result.doc_kanrikeikaku = {
    ...DOCUMENT_TEMPLATES.doc_kanrikeikaku,
    required: shizaikanSelected,
    reason: shizaikanSelected ? '歯在管が選択されています' : '歯在管が選択されていません',
  }

  // 訪問歯科衛生指導説明書: 訪衛指（houeishi）がON かつ DH20分以上の場合に必要
  const houeishiSelected = !!procedureItems?.houeishi
  const isDh20MinOver = dhMinutes >= 20
  const houeishiRequired = houeishiSelected && isDh20MinOver
  result.doc_houeishi = {
    ...DOCUMENT_TEMPLATES.doc_houeishi,
    required: houeishiRequired,
    dhMinutes,
    reason: !houeishiSelected
      ? '訪衛指が選択されていません'
      : !isDh20MinOver
        ? `DH施術時間が${dhMinutes}分です（20分以上必要）`
        : '訪衛指選択 + DH20分以上',
  }

  return result
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
const formatDate = date => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 時刻をHH:MM:SS形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
const formatTime = date => {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * 秒数をMM:SS形式にフォーマット
 * @param {number} seconds
 * @returns {string}
 */
const formatDuration = seconds => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

/**
 * カレンダーの日付配列を生成
 * @param {number} year
 * @param {number} month
 * @returns {Array<{date: Date, isCurrentMonth: boolean}>}
 */
const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const days = []

  // 前月の日付
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({date, isCurrentMonth: false})
  }

  // 当月の日付
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({date, isCurrentMonth: true})
  }

  // 次月の日付（6週間分に揃える）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({date, isCurrentMonth: false})
  }

  return days
}

// =============================================================================
// カスタムフック
// =============================================================================

/**
 * 施設管理用カスタムフック
 */
const useFacilityManager = () => {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES)
  const [isLoading, setIsLoading] = useState(false)

  const addFacility = useCallback(facility => {
    setIsLoading(true)
    setTimeout(() => {
      setFacilities(prev => [...prev, {...facility, id: Math.max(...prev.map(f => f.id)) + 1}])
      setIsLoading(false)
    }, 300)
  }, [])

  const updateFacility = useCallback((id, data) => {
    setFacilities(prev => prev.map(f => (f.id === id ? {...f, ...data} : f)))
  }, [])

  const deleteFacility = useCallback(id => {
    setFacilities(prev => prev.filter(f => f.id !== id))
  }, [])

  return {facilities, isLoading, addFacility, updateFacility, deleteFacility}
}

/**
 * 利用者管理用カスタムフック
 */
const usePatientManager = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS)

  const getPatientsByFacility = useCallback(facilityId => patients.filter(p => p.facilityId === facilityId), [patients])

  const addPatient = useCallback(patient => {
    setPatients(prev => [...prev, {...patient, id: Math.max(...prev.map(p => p.id)) + 1}])
  }, [])

  const updatePatient = useCallback((id, data) => {
    setPatients(prev => prev.map(p => (p.id === id ? {...p, ...data} : p)))
  }, [])

  const deletePatient = useCallback(id => {
    setPatients(prev => prev.filter(p => p.id !== id))
  }, [])

  return {patients, getPatientsByFacility, addPatient, updatePatient, deletePatient}
}

/**
 * 訪問計画管理用カスタムフック
 */
const useVisitPlanManager = () => {
  const [visitPlans, setVisitPlans] = useState(INITIAL_VISIT_PLANS)

  const addVisitPlan = useCallback(plan => {
    setVisitPlans(prev => [...prev, {...plan, id: Math.max(0, ...prev.map(p => p.id)) + 1, status: 'scheduled'}])
  }, [])

  const deleteVisitPlan = useCallback(id => {
    setVisitPlans(prev => prev.filter(p => p.id !== id))
  }, [])

  return {visitPlans, addVisitPlan, deleteVisitPlan}
}

/**
 * クリニック管理用カスタムフック
 */
const useClinicManager = () => {
  const [clinic, setClinic] = useState(INITIAL_CLINIC)

  const updateClinic = useCallback(data => {
    setClinic(prev => ({...prev, ...data}))
  }, [])

  const updateQualification = useCallback((qualificationId, value) => {
    setClinic(prev => ({
      ...prev,
      qualifications: {...prev.qualifications, [qualificationId]: value},
    }))
  }, [])

  // 資格の有無をチェック
  const hasQualification = useCallback(
    qualificationId => {
      return !!clinic.qualifications[qualificationId]
    },
    [clinic.qualifications]
  )

  return {clinic, updateClinic, updateQualification, hasQualification}
}

/**
 * 診察管理用カスタムフック
 */
const useExaminationManager = () => {
  const [examinations, setExaminations] = useState(INITIAL_EXAMINATIONS)

  const getExaminationsByVisitPlan = useCallback(
    visitPlanId => examinations.filter(e => e.visitPlanId === visitPlanId).sort((a, b) => a.sortOrder - b.sortOrder),
    [examinations]
  )

  const addExamination = useCallback(examination => {
    setExaminations(prev => {
      const maxId = Math.max(0, ...prev.map(e => e.id))
      const maxSortOrder = Math.max(0, ...prev.filter(e => e.visitPlanId === examination.visitPlanId).map(e => e.sortOrder))
      return [
        ...prev,
        {
          ...examination,
          id: maxId + 1,
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

  const updateExamination = useCallback((id, data) => {
    setExaminations(prev => prev.map(e => (e.id === id ? {...e, ...data} : e)))
  }, [])

  const removeExamination = useCallback(id => {
    setExaminations(prev => prev.filter(e => e.id !== id))
  }, [])

  const reorderExaminations = useCallback((visitPlanId, orderedIds) => {
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
const useStaffManager = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF)

  const addStaff = useCallback(staffData => {
    setStaff(prev => [
      ...prev,
      {
        ...staffData,
        id: Math.max(0, ...prev.map(s => s.id)) + 1,
        sortOrder: prev.filter(s => s.role === staffData.role).length + 1,
      },
    ])
  }, [])

  const updateStaff = useCallback((id, data) => {
    setStaff(prev => prev.map(s => (s.id === id ? {...s, ...data} : s)))
  }, [])

  const deleteStaff = useCallback(id => {
    setStaff(prev => prev.filter(s => s.id !== id))
  }, [])

  const reorderStaff = useCallback((id, direction) => {
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
const useScoringHistoryManager = () => {
  const [scoringHistory, setScoringHistory] = useState(INITIAL_SCORING_HISTORY)

  const addScoringRecord = useCallback(record => {
    setScoringHistory(prev => [...prev, {...record, id: Math.max(0, ...prev.map(h => h.id)) + 1}])
  }, [])

  const getHistoryByPatient = useCallback(patientId => scoringHistory.filter(h => h.patientId === patientId), [scoringHistory])

  return {scoringHistory, addScoringRecord, getHistoryByPatient}
}

/**
 * 文書管理用カスタムフック
 */
const useDocumentManager = () => {
  const [documents, setDocuments] = useState(INITIAL_SAVED_DOCUMENTS)

  const addDocument = useCallback(doc => {
    setDocuments(prev => [
      ...prev,
      {...doc, id: Math.max(0, ...prev.map(d => d.id)) + 1, createdAt: formatDate(new Date(2026, 0, 18))},
    ])
  }, [])

  const getDocumentsByPatient = useCallback(patientId => documents.filter(d => d.patientId === patientId), [documents])

  return {documents, addDocument, getDocumentsByPatient}
}

// =============================================================================
// 共通UIコンポーネント
// =============================================================================

/**
 * ボタンコンポーネント
 */
const Button = ({children, onClick, variant = 'primary', size = 'md', disabled = false, className = ''}) => {
  const baseStyle =
    'font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const variants = {
    primary: 'bg-slate-800 text-white hover:bg-slate-700 focus-visible:ring-slate-500',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  }
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * バッジコンポーネント
 */
const Badge = ({children, variant = 'default', className = ''}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

/**
 * カードコンポーネント
 */
const Card = ({children, className = '', ...props}) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

/**
 * 入力フィールドコンポーネント
 */
const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  className = '',
  name = '',
  autoComplete = '',
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      name={name || undefined}
      autoComplete={autoComplete || undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
    />
  </div>
)

/**
 * セレクトコンポーネント
 */
const Select = ({label, value, onChange, options, placeholder = '選択してください', className = '', name = ''}) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      name={name || undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)

/**
 * テキストエリアコンポーネント
 */
const TextArea = ({label, value, onChange, placeholder = '', rows = 3, className = '', name = ''}) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      name={name || undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 resize-none"
    />
  </div>
)

/**
 * ローディングスピナー
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
  </div>
)

/**
 * 空状態表示
 */
const EmptyState = ({message = 'データがありません'}) => (
  <div className="text-center py-8 text-gray-500">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <p className="mt-2 text-sm">{message}</p>
  </div>
)

// =============================================================================
// アイコンコンポーネント
// =============================================================================

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const IconChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const IconChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const IconMic = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
)

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const IconBuilding = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
)

// =============================================================================
// 画面コンポーネント
// =============================================================================

/**
 * サイドバーナビゲーション
 */
const Sidebar = ({currentPage, onNavigate}) => {
  const navSections = [
    {label: null, items: [{id: 'dashboard', label: 'トップ', icon: '🏠'}]},
    {label: '予定・訪問', items: [{id: 'schedule', label: '訪問計画スケジュール', icon: '📅'}]},
    {
      label: '患者',
      items: [{id: 'individual-input', label: '個別入力', icon: '✏️'}],
    },
    {
      label: 'マスタデータ管理',
      items: [
        {id: 'admin-clinic', label: 'クリニック設定', icon: '🏥'},
        {id: 'admin-facilities', label: '施設マスタ', icon: '🏢'},
        {id: 'admin-patients', label: '利用者マスタ', icon: '👥'},
        {id: 'admin-staff', label: 'スタッフマスタ', icon: '👨‍⚕️'},
        {id: 'admin-templates', label: 'テンプレート登録', icon: '📋'},
      ],
    },
    {
      label: 'レポート・参照',
      items: [
        {id: 'scoring-reference', label: '算定項目・点数一覧', icon: '📊'},
        {id: 'scoring-ledger', label: '算定対象台帳', icon: '📒'},
        {id: 'document-list', label: '提供文書一覧', icon: '📄'},
        {id: 'summary', label: '日次報告', icon: '📈'},
        {id: 'batch-print', label: '履歴・一括印刷', icon: '🖨️'},
      ],
    },
  ]

  const isActive = id => currentPage === id || currentPage.startsWith(id)

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen overflow-y-auto">
      <div className="p-3">
        <h1
          className="text-lg font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <span>🦷</span>
          <span>VisitDental Pro</span>
        </h1>
      </div>
      <nav className="mt-1 pb-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.label}</div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500 ${
                  isActive(item.id)
                    ? 'bg-slate-100 text-slate-900 border-r-2 border-slate-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

/**
 * 施設フォーム（モーダル用）
 */
const FacilityForm = ({facility, onSubmit, onClose}) => {
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    address: facility?.address || '',
    facilityType: facility?.facilityType || '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.address) return
    onSubmit(formData)
  }

  return (
    <div className="space-y-3">
      <Input label="施設名" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
      <Input label="住所" value={formData.address} onChange={v => setFormData({...formData, address: v})} required />
      <Select
        label="施設区分"
        value={formData.facilityType}
        onChange={v => setFormData({...formData, facilityType: v})}
        options={Object.entries(FACILITY_TYPES).map(([value, label]) => ({value, label}))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{facility ? '更新' : '追加'}</Button>
      </div>
    </div>
  )
}

/**
 * 施設マスタ画面
 */
const FacilityMasterPage = ({facilities, onAdd, onUpdate, onDelete, onReorder}) => {
  const facilityModal = useModal()
  const [portalSettings, setPortalSettings] = useState(
    facilities.reduce((acc, f) => {
      acc[f.id] = {
        enabled: false,
        loginId: `facility_${f.id}`,
        password: '',
        portalUrl: `https://visitdental.example.com/portal/${f.id}`,
      }
      return acc
    }, {})
  )

  const handleOpenAdd = () => {
    facilityModal.handleOpen({facility: null})
  }

  const handleOpenEdit = facility => {
    facilityModal.handleOpen({facility})
  }

  const handleSubmit = formData => {
    if (facilityModal.open?.facility) {
      onUpdate(facilityModal.open.facility.id, formData)
    } else {
      onAdd(formData)
    }
    facilityModal.handleClose()
  }

  const togglePortal = facilityId => {
    setPortalSettings(prev => {
      const current = prev[facilityId] || {}
      return {
        ...prev,
        [facilityId]: {
          ...current,
          enabled: !current.enabled,
          password: !current.enabled ? `pass_${Math.random().toString(36).slice(2, 8)}` : '',
        },
      }
    })
  }

  const regeneratePassword = facilityId => {
    setPortalSettings(prev => ({
      ...prev,
      [facilityId]: {...prev[facilityId], password: `pass_${Math.random().toString(36).slice(2, 8)}`},
    }))
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">登録施設一覧</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            施設追加
          </span>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">順序</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設区分</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ポータル</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facilities.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="施設が登録されていません" />
                  </td>
                </tr>
              ) : (
                facilities.map((facility, idx) => {
                  const portal = portalSettings[facility.id] || {}
                  return (
                    <tr key={facility.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-0.5">
                          <button
                            onClick={() => onReorder?.(facility.id, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded text-xs"
                            aria-label="上へ"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => onReorder?.(facility.id, 'down')}
                            disabled={idx === facilities.length - 1}
                            className="p-0.5 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded text-xs"
                            aria-label="下へ"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{facility.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{FACILITY_TYPES[facility.facilityType] || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => togglePortal(facility.id)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${portal.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${portal.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                            />
                          </button>
                          <span className="text-xs text-gray-500">{portal.enabled ? '有効' : '無効'}</span>
                          {portal.enabled && (
                            <div className="text-xs text-left mt-1 space-y-0.5">
                              <div className="text-gray-500">
                                ID: <span className="font-mono">{portal.loginId}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">PW:</span>
                                <span className="font-mono text-gray-700">{portal.password}</span>
                                <button
                                  onClick={() => regeneratePassword(facility.id)}
                                  className="text-blue-500 hover:text-blue-700 text-[10px]"
                                >
                                  再生成
                                </button>
                              </div>
                              <div className="text-blue-600 break-all text-[10px]">{portal.portalUrl}</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(facility)}
                            className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                            aria-label="編集"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`「${facility.name}」を削除しますか？`)) {
                                onDelete(facility.id)
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                            aria-label="削除"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <facilityModal.Modal title={facilityModal.open?.facility ? '施設を編集' : '施設を追加'}>
        <FacilityForm facility={facilityModal.open?.facility} onSubmit={handleSubmit} onClose={facilityModal.handleClose} />
      </facilityModal.Modal>
    </div>
  )
}

/**
 * 利用者フォーム（モーダル用）
 */
const PatientForm = ({patient, onSubmit, onClose}) => {
  const [formData, setFormData] = useState({
    lastName: patient?.lastName || '',
    firstName: patient?.firstName || '',
    lastNameKana: patient?.lastNameKana || '',
    firstNameKana: patient?.firstNameKana || '',
    building: patient?.building || '',
    floor: patient?.floor || '',
    room: patient?.room || '',
    notes: patient?.notes || '',
  })

  const handleSubmit = () => {
    if (!formData.lastName || !formData.firstName || !formData.lastNameKana || !formData.firstNameKana) return
    onSubmit(formData)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="姓" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} required />
        <Input label="名" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="セイ" value={formData.lastNameKana} onChange={v => setFormData({...formData, lastNameKana: v})} required />
        <Input
          label="メイ"
          value={formData.firstNameKana}
          onChange={v => setFormData({...formData, firstNameKana: v})}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="建物"
          value={formData.building}
          onChange={v => setFormData({...formData, building: v})}
          placeholder="本館"
        />
        <Input label="フロア" value={formData.floor} onChange={v => setFormData({...formData, floor: v})} placeholder="2F" />
        <Input label="部屋番号" value={formData.room} onChange={v => setFormData({...formData, room: v})} placeholder="201" />
      </div>
      <TextArea
        label="申し送り"
        value={formData.notes}
        onChange={v => setFormData({...formData, notes: v})}
        placeholder="特記事項があれば入力"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{patient ? '更新' : '追加'}</Button>
      </div>
    </div>
  )
}

/**
 * 利用者マスタ画面
 */
const PatientMasterPage = ({facilities, patients, onAdd, onUpdate, onDelete, onSelectPatient, onEditPatient}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('')
  const patientModal = useModal()

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const fullName = getPatientName(p)
      const fullNameKana = getPatientNameKana(p)
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery) ||
        fullNameKana.includes(searchQuery) ||
        p.lastName.includes(searchQuery) ||
        p.firstName.includes(searchQuery) ||
        p.lastNameKana.includes(searchQuery) ||
        p.firstNameKana.includes(searchQuery)
      const matchesFacility = !facilityFilter || p.facilityId === Number(facilityFilter)
      return matchesSearch && matchesFacility
    })
  }, [patients, searchQuery, facilityFilter])

  const handleOpenAdd = () => {
    patientModal.handleOpen({patient: null})
  }

  const handleSubmit = formData => {
    if (patientModal.open?.patient) {
      onUpdate(patientModal.open.patient.id, formData)
    } else {
      const targetFacilityId = facilityFilter ? Number(facilityFilter) : facilities[0]?.id
      onAdd({...formData, facilityId: targetFacilityId})
    }
    patientModal.handleClose()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">利用者マスタ</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            利用者を追加
          </span>
        </Button>
      </div>

      {/* フィルター行 */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input label="" value={searchQuery} onChange={setSearchQuery} placeholder="🔍 氏名・カナで検索" />
        </div>
        <div className="w-48">
          <Select
            label=""
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={[{value: '', label: '全施設'}, ...facilities.map(f => ({value: String(f.id), label: f.name}))]}
          />
        </div>
      </div>

      {/* 統合テーブル */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">利用者マスタ ({filteredPatients.length}名)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">氏名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ふりがな</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">施設</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">居場所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">年齢</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">申し送り</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="該当する利用者がいません" />
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, idx) => {
                  const facility = facilities.find(f => f.id === p.facilityId)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{getPatientName(p)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getPatientNameKana(p)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.building && <Badge variant="primary">{p.building}</Badge>} {p.floor}-{p.room}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.age || '-'}歳</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">{p.notes || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" onClick={() => onSelectPatient?.(p.id)}>
                            詳細
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onEditPatient?.(p.id)}>
                            ✏️
                          </Button>
                          <button
                            onClick={() => {
                              if (window.confirm(`「${getPatientName(p)}」を削除しますか？`)) {
                                onDelete(p.id)
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                            aria-label="削除"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <patientModal.Modal title={patientModal.open?.patient ? '利用者を編集' : '利用者を追加'}>
        <PatientForm patient={patientModal.open?.patient} onSubmit={handleSubmit} onClose={patientModal.handleClose} />
      </patientModal.Modal>
    </div>
  )
}

/**
 * スタッフフォーム（モーダル用）
 */
const StaffForm = ({staffMember, onSubmit, onClose}) => {
  const [formData, setFormData] = useState({
    name: staffMember?.name || '',
    role: staffMember?.role || '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.role) return
    onSubmit(formData)
  }

  return (
    <div className="space-y-3">
      <Input label="氏名" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
      <Select
        label="役割"
        value={formData.role}
        onChange={v => setFormData({...formData, role: v})}
        options={[
          {value: STAFF_ROLES.DOCTOR, label: '歯科医師'},
          {value: STAFF_ROLES.HYGIENIST, label: '歯科衛生士'},
        ]}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{staffMember ? '更新' : '追加'}</Button>
      </div>
    </div>
  )
}

/**
 * スタッフマスタ画面
 */
const StaffMasterPage = ({staff, onAdd, onUpdate, onDelete, onReorder}) => {
  const staffModal = useModal()

  const handleOpenAdd = () => {
    staffModal.handleOpen({staffMember: null})
  }

  const handleOpenEdit = s => {
    staffModal.handleOpen({staffMember: s})
  }

  const handleSubmit = formData => {
    if (staffModal.open?.staffMember) {
      onUpdate(staffModal.open.staffMember.id, formData)
    } else {
      onAdd(formData)
    }
    staffModal.handleClose()
  }

  const handleDelete = id => {
    onDelete(id)
  }

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const renderStaffList = (members, roleLabel) => (
    <Card>
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">
          {roleLabel} ({members.length}名)
        </span>
      </div>
      <ul className="divide-y divide-gray-200">
        {members.map((s, idx) => (
          <li key={s.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-900">{s.name}</span>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => onReorder(s.id, 'up')}
                disabled={idx === 0}
                className="p-1 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded"
                aria-label="上へ"
              >
                ▲
              </button>
              <button
                onClick={() => onReorder(s.id, 'down')}
                disabled={idx === members.length - 1}
                className="p-1 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded"
                aria-label="下へ"
              >
                ▼
              </button>
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                aria-label="編集"
              >
                <IconEdit />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`「${s.name}」を削除しますか？`)) handleDelete(s.id)
                }}
                className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                aria-label="削除"
              >
                <IconTrash />
              </button>
            </div>
          </li>
        ))}
        {members.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">登録なし</li>}
      </ul>
    </Card>
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">スタッフマスタ</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            スタッフ追加
          </span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {renderStaffList(doctors, '歯科医師')}
        {renderStaffList(hygienists, '歯科衛生士')}
      </div>

      <staffModal.Modal title={staffModal.open?.staffMember ? 'スタッフを編集' : 'スタッフを追加'}>
        <StaffForm staffMember={staffModal.open?.staffMember} onSubmit={handleSubmit} onClose={staffModal.handleClose} />
      </staffModal.Modal>
    </div>
  )
}

/**
 * クリニック設定画面
 */
const ClinicSettingsPage = ({clinic, onUpdateClinic, onUpdateQualification}) => {
  const [formData, setFormData] = useState({
    name: clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    representative: clinic.representative,
  })

  const handleSaveBasicInfo = () => {
    onUpdateClinic(formData)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">クリニック設定</h2>

      {/* 注意事項 */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <div className="p-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">⚠</span>
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">前提条件について</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>このアプリは歯訪診の施設基準の登録が済んでいる前提です</li>
                <li>歯科訪問診療料の注15も登録済みである前提の点数表示になっています</li>
                <li>院内感染対策の届出も提出済である前提としてあります</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* 基本情報 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">基本情報</span>
        </div>
        <div className="p-4 space-y-4">
          <Input label="クリニック名" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
          <Input label="住所" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="電話番号" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
            <Input
              label="代表者名"
              value={formData.representative}
              onChange={v => setFormData({...formData, representative: v})}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveBasicInfo}>基本情報を保存</Button>
          </div>
        </div>
      </Card>

      {/* 届出・施設基準 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-blue-600">
          <span className="text-sm font-medium text-white">届出・施設基準</span>
        </div>
        <div className="p-4 space-y-2">
          {CLINIC_QUALIFICATIONS.map(qual => {
            const currentValue = clinic.qualifications[qual.id]
            return (
              <div key={qual.id} className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!currentValue}
                    onChange={() => onUpdateQualification(qual.id, !currentValue)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{qual.name}</span>
                </label>
                {qual.hasTextInput && <span className="text-sm text-gray-700">（</span>}
                {qual.hasTextInput && (
                  <input
                    type="text"
                    value={clinic.qualifications.otherText || ''}
                    onChange={e => onUpdateQualification('otherText', e.target.value)}
                    className="border-b border-gray-400 text-sm px-1 py-0.5 w-40 outline-none"
                  />
                )}
                {qual.hasTextInput && <span className="text-sm text-gray-700">）</span>}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/**
 * 訪問計画フォーム（モーダル用）
 */
const VisitPlanForm = ({facilities, onSubmit, onClose}) => {
  const [formData, setFormData] = useState({
    visitDate: '',
    facilityId: '',
  })

  const handleSubmit = () => {
    if (!formData.visitDate || !formData.facilityId) return
    onSubmit({visitDate: formData.visitDate, facilityId: Number(formData.facilityId)})
  }

  return (
    <div className="space-y-3">
      <Input
        label="訪問日"
        type="date"
        value={formData.visitDate}
        onChange={v => setFormData({...formData, visitDate: v})}
        required
      />
      <Select
        label="施設"
        value={formData.facilityId}
        onChange={v => setFormData({...formData, facilityId: v})}
        options={facilities.map(f => ({value: f.id, label: f.name}))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>作成</Button>
      </div>
    </div>
  )
}

/**
 * 訪問計画スケジュール（カレンダー）画面
 */
const SchedulePage = ({facilities, visitPlans, onAddPlan, onSelectPlan}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const visitPlanModal = useModal()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month])

  const filteredPlans = useMemo(() => {
    if (!selectedFacilityId) return visitPlans
    return visitPlans.filter(p => p.facilityId === Number(selectedFacilityId))
  }, [visitPlans, selectedFacilityId])

  const getPlansByDate = useCallback(
    date => {
      const dateStr = formatDate(date)
      return filteredPlans.filter(p => p.visitDate === dateStr)
    },
    [filteredPlans]
  )

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleAddPlan = formData => {
    onAddPlan(formData)
    visitPlanModal.handleClose()
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPlan(null)}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-gray-900">訪問計画スケジュール</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
            options={facilities.map(f => ({value: f.id, label: f.name}))}
            placeholder="全ての施設"
          />
          <Button onClick={() => visitPlanModal.handleOpen()}>
            <span className="flex items-center gap-1">
              <IconPlus />
              新規作成
            </span>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="前月"
          >
            <IconChevronLeft />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {year}年 {month + 1}月
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="翌月"
          >
            <IconChevronRight />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {calendarDays.map((dayInfo, index) => {
            const plans = getPlansByDate(dayInfo.date)
            const dayOfWeek = dayInfo.date.getDay()
            return (
              <div key={index} className={`bg-white min-h-[80px] p-1 ${!dayInfo.isCurrentMonth ? 'bg-gray-50' : ''}`}>
                <div
                  className={`text-xs font-medium mb-1 ${
                    !dayInfo.isCurrentMonth
                      ? 'text-gray-400'
                      : dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                          ? 'text-blue-500'
                          : 'text-gray-900'
                  }`}
                >
                  {dayInfo.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {plans.map(plan => {
                    const facility = facilities.find(f => f.id === plan.facilityId)
                    return (
                      <button
                        key={plan.id}
                        onClick={() => onSelectPlan(plan)}
                        className="w-full text-left px-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded truncate hover:bg-slate-200"
                      >
                        {facility?.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <visitPlanModal.Modal title="新規訪問計画">
        <VisitPlanForm facilities={facilities} onSubmit={handleAddPlan} onClose={visitPlanModal.handleClose} />
      </visitPlanModal.Modal>
    </div>
  )
}

/**
 * ドラッグハンドルアイコン
 */
const IconDragHandle = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
  </svg>
)

/**
 * 訪問計画詳細（並び替え・診察前設定）画面
 */
const VisitPlanDetailPage = ({
  visitPlan,
  facility,
  patients,
  examinations,
  staff,
  onBack,
  onAddExamination,
  onUpdateExamination,
  onRemoveExamination,
  onReorderExaminations,
  onStartConsultation,
}) => {
  const [draggedPatientId, setDraggedPatientId] = useState(null)
  const [draggedExamId, setDraggedExamId] = useState(null)
  const [dragOverExamId, setDragOverExamId] = useState(null)
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false)

  // 施設の利用者を取得
  const facilityPatients = useMemo(() => patients.filter(p => p.facilityId === facility.id), [patients, facility.id])

  // 既に診察リストに追加済みの患者ID
  const addedPatientIds = useMemo(() => examinations.map(e => e.patientId), [examinations])

  // 建物×フロアでグループ化
  const groupedPatients = useMemo(() => {
    const groups = {}
    facilityPatients.forEach(p => {
      const key = `${p.building} - ${p.floor}`
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [facilityPatients])

  // 患者ドラッグ開始（左カラムから）
  const handlePatientDragStart = (e, patientId) => {
    setDraggedPatientId(patientId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // 診察リストへのドロップ（新規追加）
  const handleDropToList = e => {
    e.preventDefault()
    setIsDragOverDropZone(false)
    if (draggedPatientId && !addedPatientIds.includes(draggedPatientId)) {
      onAddExamination({visitPlanId: visitPlan.id, patientId: draggedPatientId})
    }
    setDraggedPatientId(null)
  }

  // 診察項目のドラッグ開始（並び替え用）
  const handleExamDragStart = (e, examId) => {
    setDraggedExamId(examId)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 診察項目へのドラッグオーバー
  const handleExamDragOver = (e, examId) => {
    e.preventDefault()
    if (draggedExamId && draggedExamId !== examId) {
      setDragOverExamId(examId)
    }
  }

  // 診察項目へのドロップ（並び替え）
  const handleExamDrop = (e, targetExamId) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedExamId && draggedExamId !== targetExamId) {
      // 現在の順序を取得
      const currentOrder = examinations.map(ex => ex.id)
      const draggedIndex = currentOrder.indexOf(draggedExamId)
      const targetIndex = currentOrder.indexOf(targetExamId)

      // 順序を入れ替え
      const newOrder = [...currentOrder]
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedExamId)

      onReorderExaminations(visitPlan.id, newOrder)
    }

    setDraggedExamId(null)
    setDragOverExamId(null)
  }

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedPatientId(null)
    setDraggedExamId(null)
    setDragOverExamId(null)
    setIsDragOverDropZone(false)
  }

  const handleAddPatient = patientId => {
    if (!addedPatientIds.includes(patientId)) {
      onAddExamination({visitPlanId: visitPlan.id, patientId})
    }
  }

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR)
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST)

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <div>
            <div className="text-xs text-gray-500">{visitPlan.visitDate}</div>
            <h2 className="text-xl font-bold text-gray-900">{facility.name}</h2>
          </div>
        </div>
        <Button variant="success">
          <span className="flex items-center gap-1">
            <IconCheck />
            訪問全体を終了する
          </span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 左カラム: 施設登録患者リスト */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconUsers />
              <span className="text-sm font-medium text-gray-700">施設登録患者リスト</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">右のリストへドラッグ&ドロップして計画を作成</p>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {Object.entries(groupedPatients).map(([groupKey, groupPatients]) => (
              <div key={groupKey} className="mb-3">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded">{groupKey}</div>
                <ul className="mt-1 space-y-1">
                  {groupPatients.map(patient => {
                    const isAdded = addedPatientIds.includes(patient.id)
                    return (
                      <li
                        key={patient.id}
                        draggable={!isAdded}
                        onDragStart={e => handlePatientDragStart(e, patient.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2 py-2 rounded border transition-all ${
                          isAdded
                            ? 'bg-emerald-50 border-emerald-200'
                            : draggedPatientId === patient.id
                              ? 'bg-slate-100 border-slate-400 opacity-50'
                              : 'bg-white border-gray-200 cursor-grab hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getPatientName(patient)}</div>
                          <div className="text-xs text-gray-500">{patient.room}号室</div>
                        </div>
                        {isAdded ? (
                          <span className="text-emerald-600">
                            <IconCheck />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddPatient(patient.id)}
                            className="text-gray-400 hover:text-slate-600 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                            aria-label={`${getPatientName(patient)}を追加`}
                          >
                            <IconPlus />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* 右カラム: 本日の訪問・診察リスト */}
        <Card
          onDragOver={e => {
            e.preventDefault()
            if (draggedPatientId) setIsDragOverDropZone(true)
          }}
          onDragLeave={() => setIsDragOverDropZone(false)}
          onDrop={handleDropToList}
          className={`transition-all ${isDragOverDropZone ? 'ring-2 ring-slate-400 bg-slate-50' : ''}`}
        >
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconBuilding />
              <span className="text-sm font-medium text-gray-700">本日の訪問・診察リスト ({examinations.length}名)</span>
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {examinations.length === 0 ? (
              <div
                className={`text-center py-8 border-2 border-dashed rounded-lg ${
                  isDragOverDropZone ? 'border-slate-400 bg-slate-50' : 'border-gray-300'
                }`}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">患者をドラッグ&ドロップで追加</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {examinations.map((exam, index) => {
                  const patient = patients.find(p => p.id === exam.patientId)
                  if (!patient) return null
                  const isDragging = draggedExamId === exam.id
                  const isDragOver = dragOverExamId === exam.id

                  return (
                    <li
                      key={exam.id}
                      draggable
                      onDragStart={e => handleExamDragStart(e, exam.id)}
                      onDragOver={e => handleExamDragOver(e, exam.id)}
                      onDrop={e => handleExamDrop(e, exam.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 border rounded-lg transition-all ${
                        isDragging
                          ? 'border-slate-400 bg-slate-50 opacity-50'
                          : isDragOver
                            ? 'border-slate-500 bg-slate-100 shadow-lg transform scale-[1.02]'
                            : 'border-gray-200 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {/* ドラッグハンドル */}
                          <span className="cursor-grab text-gray-400 hover:text-gray-600">
                            <IconDragHandle />
                          </span>
                          <Badge variant="primary">{patient.building}</Badge>
                          <span className="text-xs text-gray-600">
                            {patient.floor} - {patient.room}
                          </span>
                          <Badge variant="default">未診察</Badge>
                        </div>
                        <button onClick={() => onRemoveExamination(exam.id)} className="text-gray-400 hover:text-red-600">
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{getPatientName(patient)}</div>
                      {patient.notes && <div className="text-xs text-orange-600 mb-2">⚠ {patient.notes}</div>}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当医:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.doctorId || ''}
                              onChange={e =>
                                onUpdateExamination(exam.id, {
                                  doctorId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {doctors.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, 'doctor')}
                              disabled={!exam.doctorId}
                            >
                              診察(医)
                            </Button>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当DH:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.hygienistId || ''}
                              onChange={e =>
                                onUpdateExamination(exam.id, {
                                  hygienistId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {hygienists.map(h => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, 'dh')}
                              disabled={!exam.hygienistId}
                            >
                              指導(衛)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

/** バイタルデータの初期値 */
const INITIAL_VITAL = {
  bloodPressureHigh: '',
  bloodPressureLow: '',
  pulse: '',
  spo2: '',
  temperature: '',
  measuredAt: '',
}

/**
 * バイタル入力フォーム（モーダル用）
 */
const VitalForm = ({vital, type, onSubmit, onClose}) => {
  const [formData, setFormData] = useState({
    bloodPressureHigh: vital?.bloodPressureHigh || '',
    bloodPressureLow: vital?.bloodPressureLow || '',
    pulse: vital?.pulse || '',
    spo2: vital?.spo2 || '',
    temperature: vital?.temperature || '',
    measuredAt: vital?.measuredAt || new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <div className="space-y-4">
      {/* 血圧と脈拍 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">血圧 (上/下)</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={formData.bloodPressureHigh}
              onChange={e => setFormData({...formData, bloodPressureHigh: e.target.value})}
              placeholder="120"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              value={formData.bloodPressureLow}
              onChange={e => setFormData({...formData, bloodPressureLow: e.target.value})}
              placeholder="80"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">脈拍 (bpm)</label>
          <input
            type="number"
            value={formData.pulse}
            onChange={e => setFormData({...formData, pulse: e.target.value})}
            placeholder="72"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* SpO2と体温 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
          <input
            type="number"
            value={formData.spo2}
            onChange={e => setFormData({...formData, spo2: e.target.value})}
            placeholder="98"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">体温 (°C)</label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={e => setFormData({...formData, temperature: e.target.value})}
            placeholder="36.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* 測定時刻 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">測定時刻</label>
        <input
          type="time"
          value={formData.measuredAt}
          onChange={e => setFormData({...formData, measuredAt: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>記録する</Button>
      </div>
    </div>
  )
}

/**
 * バイタル表示コンポーネント
 */
const VitalDisplay = ({vital, label, onEdit}) => {
  const hasData = vital && (vital.bloodPressureHigh || vital.spo2 || vital.temperature)

  return (
    <div
      onClick={onEdit}
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {hasData ? (
        <div className="space-y-1 text-sm">
          {vital.bloodPressureHigh && (
            <div>
              血圧: {vital.bloodPressureHigh}/{vital.bloodPressureLow} mmHg
            </div>
          )}
          {vital.pulse && <div>脈拍: {vital.pulse} bpm</div>}
          {vital.spo2 && <div>SpO2: {vital.spo2}%</div>}
          {vital.temperature && <div>体温: {vital.temperature}°C</div>}
          {vital.measuredAt && <div className="text-gray-400 text-xs">測定: {vital.measuredAt}</div>}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">未記録 (タップで入力)</div>
      )}
    </div>
  )
}

/**
 * 診療画面
 */
const ConsultationPage = ({
  examination,
  patient,
  staff,
  clinic,
  hasQualification,
  onBack,
  onUpdate,
  onOpenDocument,
  consultationMode,
}) => {
  // DHモード制限: DHログイン時は訪衛指と在口衛のみ操作可能（MTG 0206決定）
  const DH_ALLOWED_ITEMS = ['houeishi', 'zaikouei']
  const isDhMode = consultationMode === 'dh'
  const [drSeconds, setDrSeconds] = useState(0)
  const [dhSeconds, setDhSeconds] = useState(0)
  const [drRunning, setDrRunning] = useState(false)
  const [dhRunning, setDhRunning] = useState(false)
  const [vitalBefore, setVitalBefore] = useState(examination.vitalBefore || INITIAL_VITAL)
  const [vitalAfter, setVitalAfter] = useState(examination.vitalAfter || INITIAL_VITAL)
  // 実施項目は一旦廃止（MTG 0206決定）
  // const [treatmentItems, setTreatmentItems] = useState(examination.treatmentItems || [])
  // procedureItems: { [itemId]: { categoryId: string | null } }
  const [procedureItems, setProcedureItems] = useState(examination.procedureItems || {})
  // 実施記録・所見の4項目
  const [visitCondition, setVisitCondition] = useState(examination.visitCondition || '')
  const [oralFindings, setOralFindings] = useState(examination.oralFindings || '')
  const [treatment, setTreatment] = useState(examination.treatment || '')
  const [nextPlan, setNextPlan] = useState(examination.nextPlan || '')
  const [customTreatment, setCustomTreatment] = useState('')
  const [customTreatments, setCustomTreatments] = useState([])
  // 解説テキストポップアップ（MTG 0206決定: PDFリンク→テキストポップアップ）
  const infoModal = useModal()

  const vitalBeforeModal = useModal()
  const vitalAfterModal = useModal()

  const doctor = staff.find(s => s.id === examination.doctorId)

  // 実施項目は一旦廃止（MTG 0206決定）
  // const handleToggleTreatment = itemId => {
  //   setTreatmentItems(prev => (prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]))
  // }

  // 実施項目のON/OFF切り替え
  const handleToggleProcedure = itemId => {
    setProcedureItems(prev => {
      if (prev[itemId]) {
        // 選択解除
        const {[itemId]: _, ...rest} = prev
        return rest
      } else {
        // 選択（初期値はカテゴリなし、自動判定で設定）
        const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
        const defaultCategoryId = item?.categories?.[0]?.id || null
        return {...prev, [itemId]: {categoryId: defaultCategoryId}}
      }
    })
  }

  // 該当区分の変更
  const handleSetProcedureCategory = (itemId, categoryId) => {
    setProcedureItems(prev => ({
      ...prev,
      [itemId]: {...prev[itemId], categoryId},
    }))
  }

  // 患者の歯数から歯周検査の点数区分を判定
  const getTeethCountCategory = teethCount => {
    if (teethCount >= 20) return '20+'
    if (teethCount >= 10) return '10-19'
    return '1-9'
  }

  // 患者に登録された疾患があるかチェック
  const hasAnyDisease = () => {
    if (!patient.diseases) return false
    return Object.values(patient.diseases).some(v => v === true)
  }

  // 患者が糖尿病かチェック
  const hasDiabetes = () => {
    return patient.diseases?.diabetes === true
  }

  // 項目が算定可能かチェック（資格要件）
  const canClaimItem = item => {
    if (!item.requiredQualification) return true
    return hasQualification(item.requiredQualification)
  }

  // 合計点数の計算（資格連携対応版）
  const calculateTotalPoints = () => {
    let total = 0
    Object.entries(procedureItems).forEach(([itemId, data]) => {
      const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
      if (!item) return

      // 資格要件をチェック
      if (!canClaimItem(item)) return

      if (item.categories?.length > 0 && data.categoryId) {
        const category = item.categories.find(c => c.id === data.categoryId)
        // カテゴリに資格要件がある場合はチェック
        if (category?.requiredClinicQualification) {
          if (!hasQualification(category.requiredClinicQualification)) {
            // 資格がない場合は通常点数のカテゴリを探す
            const normalCat = item.categories.find(c => !c.requiredClinicQualification)
            total += normalCat?.points || 0
            return
          }
        }
        total += category?.points || 0
      } else {
        total += item.defaultPoints || 0
      }
    })
    return total
  }

  // 選択された項目の点数を取得（資格連携対応版）
  const getItemPoints = itemId => {
    const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
    const data = procedureItems[itemId]
    if (!item || !data) return 0

    // 資格要件をチェック
    if (!canClaimItem(item)) return 0

    if (item.categories?.length > 0 && data.categoryId) {
      const category = item.categories.find(c => c.id === data.categoryId)
      // カテゴリに資格要件がある場合はチェック
      if (category?.requiredClinicQualification) {
        if (!hasQualification(category.requiredClinicQualification)) {
          // 資格がない場合は通常点数のカテゴリを探す
          const normalCat = item.categories.find(c => !c.requiredClinicQualification)
          return normalCat?.points || 0
        }
      }
      return category?.points || 0
    }
    return item.defaultPoints || 0
  }

  // 自動判定で資格に基づくカテゴリを選択
  const autoSelectCategoryByQualification = item => {
    if (!item.categories?.length) return null

    // 口腔管加算の自動判定
    if (item.autoJudgeCondition === 'clinicKoukankyou') {
      if (hasQualification('koukukan')) {
        const koukanCat = item.categories.find(c => c.requiredClinicQualification === 'koukukan')
        return koukanCat?.id || item.categories[0].id
      }
      return item.categories.find(c => !c.requiredClinicQualification)?.id || item.categories[0].id
    }

    // 歯援診の自動判定
    if (item.autoJudgeCondition === 'clinicQualification') {
      if (hasQualification('shiensin1')) {
        const cat = item.categories.find(c => c.id === 'shiensin1')
        return cat?.id || item.categories[0].id
      }
      if (hasQualification('shiensin2')) {
        const cat = item.categories.find(c => c.id === 'shiensin2')
        return cat?.id || item.categories[0].id
      }
      return item.categories.find(c => c.id === 'other')?.id || item.categories[0].id
    }

    // DX加算の自動判定
    if (item.autoJudgeCondition === 'clinicDxSetting') {
      if (hasQualification('dx')) {
        return item.categories.find(c => c.id === 'with-prescription' || c.id === 'without-prescription')?.id
      }
      return null
    }

    // 患者の歯数による自動判定
    if (item.autoJudgeCondition === 'patientTeethCount' && patient.teethCount) {
      const teethCat = getTeethCountCategory(patient.teethCount)
      return item.categories.find(c => c.id === teethCat)?.id || item.categories[0].id
    }

    return item.categories[0].id
  }

  // 自動判定ハンドラー（改良版：資格・患者情報を考慮）
  const handleAutoJudge = itemId => {
    const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
    if (!item || !item.categories?.length) return

    let categoryId = item.categories[0].id

    // 資格に基づく自動判定
    if (['clinicKoukankyou', 'clinicQualification', 'clinicDxSetting', 'patientTeethCount'].includes(item.autoJudgeCondition)) {
      const autoCat = autoSelectCategoryByQualification(item)
      if (autoCat) categoryId = autoCat
    }
    // 施設タイプに基づく判定（同一建物患者数）
    else if (item.autoJudgeCondition === 'facilityType' || item.autoJudgeCondition === 'patientCount') {
      // 仮: 施設なら2-9人カテゴリを選択
      categoryId = item.categories.length > 1 ? item.categories[1].id : item.categories[0].id
    }
    // 患者の居住状況に基づく判定
    else if (item.autoJudgeCondition === 'patientResidence') {
      // 仮: 施設入居なら2番目のカテゴリ
      categoryId = item.categories.length > 1 ? item.categories[1].id : item.categories[0].id
    }
    // 時間と患者数による判定（歯訪用）
    else if (item.autoJudgeCondition === 'timeAndPatientCount') {
      const is20MinOver = drSeconds >= 1200
      const timePrefix = is20MinOver ? '20over' : '20under'
      // 仮: 施設なら2-3人カテゴリを選択
      categoryId = item.categories.find(c => c.id === `2-${timePrefix}`)?.id || item.categories[0].id
    }
    // 口腔機能低下症チェック
    else if (item.autoJudgeCondition === 'oralHypofunction') {
      if (patient.hasOralHypofunction && hasQualification('koukukan')) {
        categoryId = item.categories.find(c => c.requiredClinicQualification === 'koukukan')?.id || item.categories[0].id
      }
    }
    // 患者疾患チェック
    else if (item.autoJudgeCondition === 'patientDisease' || item.autoJudgeCondition === 'patientDiseaseKJ3') {
      // 疾患がある場合のみ算定可能を確認
      if (!hasAnyDisease()) {
        // 注意喚起のみ（実際にはUIで表示）
        console.log('この患者には該当する疾患が登録されていません')
      }
    }
    // 糖尿病チェック
    else if (item.autoJudgeCondition === 'patientDiabetes') {
      if (!hasDiabetes()) {
        // 注意喚起のみ
        console.log('この患者には糖尿病が登録されていません')
      }
    }

    handleSetProcedureCategory(itemId, categoryId)
  }

  const handleAddCustomTreatment = () => {
    if (!customTreatment.trim()) return
    setCustomTreatments(prev => [...prev, customTreatment.trim()])
    setCustomTreatment('')
  }

  const handleRemoveCustomTreatment = index => {
    setCustomTreatments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onUpdate(examination.id, {
      vitalBefore,
      vitalAfter,
      // treatmentItems は一旦廃止（MTG 0206決定）
      procedureItems,
      visitCondition,
      oralFindings,
      treatment,
      nextPlan,
      status: EXAMINATION_STATUS.DONE,
    })
    onBack()
  }

  const is20MinOver = drSeconds >= 1200 || dhSeconds >= 1200

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{patient.building}</Badge>
              <span className="text-xs text-gray-600">
                {patient.floor}-{patient.room}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{getPatientName(patient)} 様</h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">
            担当: <span className="font-medium text-gray-900">{doctor?.name || '-'}</span>
          </div>
          <div className="text-gray-500">
            モード:{' '}
            <span className={`font-medium ${isDhMode ? 'text-amber-600' : 'text-slate-700'}`}>
              {isDhMode ? '歯科衛生士（DH）' : '歯科医師'}
            </span>
          </div>
        </div>
      </div>

      {/* タイマーセクション */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={drRunning ? 'success' : 'default'}>DR</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDuration(drSeconds)}
            </span>
            <Button size="sm" variant={drRunning ? 'danger' : 'success'} onClick={() => setDrRunning(!drRunning)}>
              {drRunning ? '終了' : '開始'}
            </Button>
            {drRunning && drSeconds > 0 && <span className="text-xs text-gray-500">計測中 {formatTime(new Date())}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={dhRunning ? 'success' : 'default'}>DH</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDuration(dhSeconds)}
            </span>
            <Button size="sm" variant={dhRunning ? 'danger' : 'success'} onClick={() => setDhRunning(!dhRunning)}>
              {dhRunning ? '終了' : '開始'}
            </Button>
          </div>
        </div>
        {is20MinOver && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ⚠ 20分を超過しています
          </div>
        )}
      </Card>

      {/* バイタル測定 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-red-500">♥</span>
          <span className="text-sm font-medium text-gray-700">バイタル測定</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <VitalDisplay vital={vitalBefore} label="処置前" onEdit={() => vitalBeforeModal.handleOpen()} />
          <VitalDisplay vital={vitalAfter} label="処置後" onEdit={() => vitalAfterModal.handleOpen()} />
        </div>
      </Card>

      {/* バイタル入力モーダル */}
      <vitalBeforeModal.Modal title="処置前バイタル入力">
        <VitalForm
          vital={vitalBefore}
          type="before"
          onSubmit={data => {
            setVitalBefore(data)
            vitalBeforeModal.handleClose()
          }}
          onClose={vitalBeforeModal.handleClose}
        />
      </vitalBeforeModal.Modal>

      <vitalAfterModal.Modal title="処置後バイタル入力">
        <VitalForm
          vital={vitalAfter}
          type="after"
          onSubmit={data => {
            setVitalAfter(data)
            vitalAfterModal.handleClose()
          }}
          onClose={vitalAfterModal.handleClose}
        />
      </vitalAfterModal.Modal>

      {/* 実施記録・所見 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-slate-600">📋</span>
          <span className="text-sm font-medium text-gray-700">実施記録・所見</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">1. 訪問時の様子</div>
            <TextArea value={visitCondition} onChange={setVisitCondition} placeholder="例: ベッド上臥位、覚醒良好..." rows={2} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">2. 口腔内所見</div>
            <TextArea value={oralFindings} onChange={setOralFindings} placeholder="例: 右下残根部発赤あり、PCR 40%..." rows={2} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">3. 処置</div>
            <TextArea value={treatment} onChange={setTreatment} placeholder="例: 義歯調整、口腔ケア、TBI..." rows={2} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">4. 次回予定</div>
            <TextArea value={nextPlan} onChange={setNextPlan} placeholder="例: 1週間後、義歯経過観察..." rows={2} />
          </div>
        </div>
      </Card>

      {/* DHモード注意バナー */}
      {isDhMode && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2">
          <span className="text-amber-600 text-lg">⚠</span>
          <div>
            <div className="text-sm font-medium text-amber-800">DHモードで操作中</div>
            <div className="text-xs text-amber-600">操作可能な項目: 訪衛指・在口衛のみ</div>
          </div>
        </div>
      )}

      <R_Stack className={`mb-2`}>
        口腔機能精密検査
        <Button>計画書を入力</Button>
        <Button>記録用紙を入力</Button>
      </R_Stack>

      {/* 実施項目の選択（加算） */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm font-medium text-gray-700">実施項目の選択（加算）</span>
          </div>
          <div className="text-sm font-bold text-slate-700">合計: {calculateTotalPoints().toLocaleString()} 点</div>
        </div>

        <div className="p-4 space-y-2">
          {(isDhMode ? PROCEDURE_ITEMS_MASTER.filter(i => DH_ALLOWED_ITEMS.includes(i.id)) : PROCEDURE_ITEMS_MASTER).map(item => {
            const isSelected = !!procedureItems[item.id]
            const itemData = procedureItems[item.id]
            const points = getItemPoints(item.id)

            return (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                {/* ON/OFFボタン + 項目名 + インフォマーク */}
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-50 border-slate-300' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleProcedure(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        isSelected ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isSelected ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-slate-800' : 'text-gray-700'}`}>{item.name}</span>
                    {/* インフォマーク（テキストポップアップ） */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        infoModal.handleOpen({name: item.fullName, text: item.infoText || item.note || ''})
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-slate-300 hover:text-slate-700 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                      aria-label={`${item.name}の解説を表示`}
                    >
                      i
                    </button>
                  </div>
                  {isSelected && points > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">+{points}点</span>
                  )}
                </div>

                {/* 選択時のみ表示: 該当区分・自動判定・提供文書 */}
                {isSelected && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
                    {/* 該当区分（カテゴリがある場合のみ） */}
                    {item.categories?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-2 flex items-center justify-between">
                          <span>該当区分</span>
                          <Button size="sm" variant="outline" onClick={() => handleAutoJudge(item.id)}>
                            自動判定
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.categories.map(cat => (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer transition-colors ${
                                itemData?.categoryId === cat.id
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-300 bg-white hover:border-gray-400'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`category-${item.id}`}
                                checked={itemData?.categoryId === cat.id}
                                onChange={() => handleSetProcedureCategory(item.id, cat.id)}
                                className="w-4 h-4 text-emerald-600 accent-emerald-600"
                              />
                              <span className="text-sm">{cat.name}</span>
                              <span className="text-xs text-gray-500">({cat.points}点)</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 必要な提供文書 */}
                    {item.documents?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-2">必要な提供文書</div>
                        <div className="flex flex-wrap gap-2">
                          {item.documents.map(doc => (
                            <Button
                              key={doc.id}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // 提供文書ページへ遷移（利用者ID_診察ID_テンプレートID）
                                const url = `/dental/documents/${patient.id}_${examination.id}_${doc.id}`
                                window.open(url, '_blank')
                              }}
                            >
                              📄 {doc.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* 提供文書セクション */}
      <DocumentSection
        procedureItems={procedureItems}
        dhSeconds={dhSeconds}
        onOpenDocument={docType => {
          // 親コンポーネントに文書作成ページへの遷移を通知
          if (typeof onOpenDocument === 'function') {
            onOpenDocument(docType, {
              patient,
              clinic,
              examination,
              dhSeconds,
              visitCondition,
              oralFindings,
              treatment,
              nextPlan,
            })
          }
        }}
      />

      {/* 解説テキストポップアップ */}
      <infoModal.Modal title={infoModal.open?.name || '解説'}>
        <p className="text-sm text-gray-700 leading-relaxed">{infoModal.open?.text}</p>
        <div className="flex justify-end mt-4">
          <Button size="sm" variant="secondary" onClick={infoModal.handleClose}>
            閉じる
          </Button>
        </div>
      </infoModal.Modal>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          キャンセル
        </Button>
        <Button variant="success" onClick={handleSave}>
          診察完了・保存
        </Button>
      </div>
    </div>
  )
}

/**
 * 提供文書セクションコンポーネント
 */
const DocumentSection = ({procedureItems, dhSeconds, onOpenDocument}) => {
  const docRequirements = calculateDocumentRequirements({procedureItems, dhSeconds})

  return (
    <Card className="mb-4">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <span className="text-blue-500">📄</span>
        <span className="text-sm font-medium text-gray-700">提供文書</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          {Object.entries(docRequirements).map(([docId, doc]) => {
            const isRequired = doc.required
            return (
              <button
                key={docId}
                onClick={() => onOpenDocument(docId)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 ${
                  isRequired
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {isRequired && <span className="text-emerald-600">★</span>}
                <span className="font-medium">{doc.name}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          {Object.entries(docRequirements).map(([docId, doc]) => (
            <div key={docId} className={doc.required ? 'text-emerald-600' : ''}>
              • {doc.name}: {doc.reason}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/**
 * 文書作成ページコンポーネント
 */
const DocumentCreatePage = ({documentType, documentData, onBack, onSave}) => {
  const template = DOCUMENT_TEMPLATES[documentType]
  const {patient, clinic, dhSeconds, visitCondition, oralFindings, treatment, nextPlan, facility} = documentData || {}

  // 手動入力項目の状態
  const [formData, setFormData] = useState(() => {
    if (documentType === 'doc_kanrikeikaku') {
      return {
        managementPlan: '',
        oralHygieneGoal: '',
      }
    } else if (documentType === 'doc_houeishi') {
      return {
        guidanceContent: '',
        homeCareMethod: '',
        nextGuidancePlan: '',
      }
    }
    return {}
  })

  const handleFormChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  // 文書データの集約
  const getDocumentContent = () => {
    const dhMinutes = Math.floor((dhSeconds || 0) / 60)
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

    return {
      // 医院情報
      clinicName: clinic?.name || '',
      clinicAddress: clinic?.address || '',
      clinicPhone: clinic?.phone || '',
      representative: clinic?.representative || '',
      // 施設情報
      facilityName: facility?.name || '',
      facilityAddress: facility?.address || '',
      // 患者情報
      patientName: patient ? getPatientName(patient) : '',
      patientNameKana: patient ? getPatientNameKana(patient) : '',
      patientBuilding: patient?.building || '',
      patientFloor: patient?.floor || '',
      patientRoom: patient?.room || '',
      teethCount: patient?.teethCount || 0,
      hasDenture: patient?.hasDenture ? 'あり' : 'なし',
      hasOralHypofunction: patient?.hasOralHypofunction ? 'あり' : 'なし',
      // 診察情報
      visitCondition: visitCondition || '',
      oralFindings: oralFindings || '',
      treatment: treatment || '',
      nextPlan: nextPlan || '',
      dhMinutes,
      // 日付
      createdAt: dateStr,
      // 手動入力項目
      ...formData,
    }
  }

  const content = getDocumentContent()

  // PDFダウンロード（簡易版: HTML→印刷）
  const handlePrint = () => {
    window.print()
  }

  // 保存処理
  const handleSaveDocument = () => {
    if (onSave) {
      onSave({
        documentType,
        content,
        createdAt: new Date().toISOString(),
      })
    }
    onBack()
  }

  if (!template) {
    return (
      <div className="p-4">
        <div className="text-red-500">文書テンプレートが見つかりません: {documentType}</div>
        <Button onClick={onBack} className="mt-4">
          戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{template.fullName}</h1>
            <p className="text-sm text-gray-500">患者: {patient ? getPatientName(patient) : '-'} 様</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            印刷 / PDF保存
          </Button>
          <Button variant="success" onClick={handleSaveDocument}>
            保存して閉じる
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex gap-4 p-4 print:p-0 print:block">
        {/* 左側: 入力フォーム */}
        <div className="w-1/3 space-y-4 print:hidden">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">自動流し込み項目</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">医療機関名:</span>
                <span className="ml-2 text-gray-900">{content.clinicName}</span>
              </div>
              <div>
                <span className="text-gray-500">患者氏名:</span>
                <span className="ml-2 text-gray-900">{content.patientName}</span>
              </div>
              <div>
                <span className="text-gray-500">ふりがな:</span>
                <span className="ml-2 text-gray-900">{content.patientNameKana}</span>
              </div>
              {documentType === 'doc_kanrikeikaku' && (
                <>
                  <div>
                    <span className="text-gray-500">歯数:</span>
                    <span className="ml-2 text-gray-900">{content.teethCount}歯</span>
                  </div>
                  <div>
                    <span className="text-gray-500">義歯:</span>
                    <span className="ml-2 text-gray-900">{content.hasDenture}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">口腔機能低下症:</span>
                    <span className="ml-2 text-gray-900">{content.hasOralHypofunction}</span>
                  </div>
                </>
              )}
              {documentType === 'doc_houeishi' && (
                <div>
                  <span className="text-gray-500">DH施術時間:</span>
                  <span className="ml-2 text-gray-900">{content.dhMinutes}分</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">作成日:</span>
                <span className="ml-2 text-gray-900">{content.createdAt}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">診察記録からの流し込み</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block">訪問時の様子:</span>
                <span className="text-gray-900 text-xs">{content.visitCondition || '（未入力）'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">口腔内所見:</span>
                <span className="text-gray-900 text-xs">{content.oralFindings || '（未入力）'}</span>
              </div>
              {documentType === 'doc_kanrikeikaku' && (
                <>
                  <div>
                    <span className="text-gray-500 block">処置:</span>
                    <span className="text-gray-900 text-xs">{content.treatment || '（未入力）'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">次回予定:</span>
                    <span className="text-gray-900 text-xs">{content.nextPlan || '（未入力）'}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">手動入力項目</h3>
            <div className="space-y-4">
              {documentType === 'doc_kanrikeikaku' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">管理計画（今後の方針）</label>
                    <TextArea
                      value={formData.managementPlan}
                      onChange={v => handleFormChange('managementPlan', v)}
                      placeholder="例: 義歯の安定を図り、口腔機能の維持・向上を目指す..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">口腔衛生目標</label>
                    <TextArea
                      value={formData.oralHygieneGoal}
                      onChange={v => handleFormChange('oralHygieneGoal', v)}
                      placeholder="例: PCR 30%以下を維持..."
                      rows={2}
                    />
                  </div>
                </>
              )}
              {documentType === 'doc_houeishi' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">指導内容</label>
                    <TextArea
                      value={formData.guidanceContent}
                      onChange={v => handleFormChange('guidanceContent', v)}
                      placeholder="例: 口腔清掃指導、義歯の取り扱い説明..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">家庭でのケア方法</label>
                    <TextArea
                      value={formData.homeCareMethod}
                      onChange={v => handleFormChange('homeCareMethod', v)}
                      placeholder="例: 食後の歯磨き、義歯の毎日洗浄..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">次回指導予定</label>
                    <TextArea
                      value={formData.nextGuidancePlan}
                      onChange={v => handleFormChange('nextGuidancePlan', v)}
                      placeholder="例: 1週間後、継続して口腔ケア指導..."
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* 右側: プレビュー */}
        <div className="flex-1 print:w-full">
          {documentType === 'doc_kanrikeikaku' ? (
            <KanriKeikakuPreview content={content} />
          ) : (
            <HoueishiPreview content={content} />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 管理計画書プレビューコンポーネント
 */
const KanriKeikakuPreview = ({content}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">歯科疾患在宅療養管理計画書</h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>

      {/* 医療機関情報 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">医療機関情報</div>
        <div className="p-3 text-sm space-y-1">
          <div className="flex">
            <span className="w-24 text-gray-600">医療機関名:</span>
            <span>{content.clinicName}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-600">住所:</span>
            <span>{content.clinicAddress}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-600">電話番号:</span>
            <span>{content.clinicPhone}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-600">管理者:</span>
            <span>{content.representative}</span>
          </div>
        </div>
      </div>

      {/* 患者情報 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">患者情報</div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">氏名</td>
              <td className="px-3 py-2">{content.patientName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">ふりがな</td>
              <td className="px-3 py-2">{content.patientNameKana}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 bg-gray-50 text-gray-600">建物</td>
              <td className="px-3 py-2">{content.patientBuilding}</td>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">部屋</td>
              <td className="px-3 py-2">
                {content.patientFloor}-{content.patientRoom}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">歯数</td>
              <td className="px-3 py-2">{content.teethCount}歯</td>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">義歯</td>
              <td className="px-3 py-2">{content.hasDenture}</td>
            </tr>
          </tbody>
        </table>
        <div className="px-3 py-2 border-t border-gray-300 text-sm">
          <span className="text-gray-600">口腔機能低下症: </span>
          <span className={content.hasOralHypofunction === 'あり' ? 'font-medium text-red-600' : ''}>
            {content.hasOralHypofunction}
          </span>
        </div>
      </div>

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内所見</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>

      {/* 処置内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">処置内容</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.treatment || '（記載なし）'}</div>
      </div>

      {/* 管理計画 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">管理計画（今後の方針）</div>
        <div className="p-3 text-sm min-h-[80px] whitespace-pre-wrap">{content.managementPlan || '（入力してください）'}</div>
      </div>

      {/* 口腔衛生目標 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔衛生目標</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralHygieneGoal || '（入力してください）'}</div>
      </div>

      {/* 次回予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">次回診療予定</div>
        <div className="p-3 text-sm whitespace-pre-wrap">{content.nextPlan || '（記載なし）'}</div>
      </div>
    </div>
  )
}

/**
 * 訪問歯科衛生指導説明書プレビューコンポーネント
 */
const HoueishiPreview = ({content}) => {
  return (
    <div
      className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
      style={{width: '210mm', minHeight: '297mm', padding: '15mm'}}
    >
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">訪問歯科衛生指導説明書</h1>
        <p className="text-sm text-gray-600 mt-2">指導日: {content.createdAt}</p>
      </div>

      {/* 医療機関・患者情報 */}
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>
                {content.clinicName}
              </td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 bg-gray-50 text-gray-600">患者氏名</td>
              <td className="px-3 py-2">{content.patientName}</td>
              <td className="px-3 py-2 w-24 bg-gray-50 text-gray-600">ふりがな</td>
              <td className="px-3 py-2">{content.patientNameKana}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 bg-gray-50 text-gray-600">指導時間</td>
              <td className="px-3 py-2" colSpan={3}>
                <span className="font-medium">{content.dhMinutes}分</span>
                {content.dhMinutes >= 20 && <span className="ml-2 text-xs text-emerald-600">（20分以上）</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 訪問時の様子 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">訪問時の様子</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.visitCondition || '（記載なし）'}</div>
      </div>

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">口腔内所見</div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">{content.oralFindings || '（記載なし）'}</div>
      </div>

      {/* 指導内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">指導内容</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">{content.guidanceContent || '（入力してください）'}</div>
      </div>

      {/* 家庭でのケア方法 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">ご家庭でのケア方法</div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">{content.homeCareMethod || '（入力してください）'}</div>
      </div>

      {/* 次回指導予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">次回指導予定</div>
        <div className="p-3 text-sm whitespace-pre-wrap">{content.nextGuidancePlan || '（入力してください）'}</div>
      </div>

      {/* フッター */}
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <p className="mt-1">{content.clinicName}</p>
      </div>
    </div>
  )
}

// =============================================================================
// 追加画面コンポーネント（PDF画面遷移図対応）
// =============================================================================

/**
 * ダッシュボード（トップ画面）
 */
const DashboardPage = ({onNavigate, visitPlans, examinations}) => {
  const today = formatDate(new Date(2026, 0, 18))
  const todayPlans = visitPlans.filter(p => p.visitDate === today)
  const completedExams = examinations.filter(e => e.status === EXAMINATION_STATUS.DONE)

  const cards = [
    {
      id: 'schedule',
      icon: '📅',
      title: 'Schedule / Visits',
      sub: '訪問計画スケジュール',
      desc: '月間カレンダーで訪問計画を管理',
      stat: `本日の予定: ${todayPlans.length}件`,
    },
    {
      id: 'admin-patients',
      icon: '👥',
      title: 'Patient Master',
      sub: '利用者マスタ',
      desc: '利用者の検索・登録・編集・削除を行います',
    },
    {id: 'individual-input', icon: '✏️', title: 'Individual Input', sub: '個別入力', desc: '個人を選択して直接入力する場合'},
    {
      id: 'admin-clinic',
      icon: '⚙️',
      title: 'Master Data Management',
      sub: 'マスタデータ管理',
      desc: 'クリニック設定、施設、スタッフ、テンプレートの管理',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <p className="text-sm text-gray-500 mt-1">訪問歯科診療サポートアプリ</p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-xs text-gray-500">本日の訪問予定</div>
          <div className="text-2xl font-bold text-slate-700">{todayPlans.length} 件</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500">診察完了</div>
          <div className="text-2xl font-bold text-emerald-600">{completedExams.length} 名</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500">今日の日付</div>
          <div className="text-lg font-bold text-slate-700">2026/01/18</div>
        </Card>
      </div>

      {/* メインナビゲーションカード */}
      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="text-left p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-slate-400 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-base font-bold text-gray-900">{card.title}</div>
            <div className="text-sm font-medium text-slate-600 mt-0.5">{card.sub}</div>
            <div className="text-xs text-gray-500 mt-2">{card.desc}</div>
            {card.stat && <div className="text-xs text-emerald-600 font-medium mt-2">{card.stat}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * 患者情報入力・編集画面
 */
const PatientEditPage = ({patient, onSave, onBack}) => {
  const [form, setForm] = useState({
    lastName: patient.lastName,
    firstName: patient.firstName,
    lastNameKana: patient.lastNameKana,
    firstNameKana: patient.firstNameKana,
    birthDate: patient.birthDate,
    gender: patient.gender,
    careLevel: patient.careLevel || '',
    diseases: {...patient.diseases},
    assessment: {...DEFAULT_ASSESSMENT, ...patient.assessment},
    notes: patient.notes || '',
  })

  const calcAge = birthDate => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const calcBmi = (h, w) => {
    const hm = parseFloat(h) / 100
    const wk = parseFloat(w)
    if (!hm || !wk || hm <= 0) return ''
    return (wk / (hm * hm)).toFixed(1)
  }

  const updateField = (field, value) => setForm(p => ({...p, [field]: value}))
  const updateDisease = (id, val) => setForm(p => ({...p, diseases: {...p.diseases, [id]: val}}))
  const updateAssessment = (field, value) => {
    setForm(p => {
      const newA = {...p.assessment, [field]: value}
      if (field === 'height' || field === 'weight') {
        newA.bmi = calcBmi(field === 'height' ? value : newA.height, field === 'weight' ? value : newA.weight)
      }
      return {...p, assessment: newA}
    })
  }
  // お薬手帳の画像保存（MTG 0206決定: テキスト入力→画像保存に変更）
  const addMedicationImage = () => {
    // モック: ダミー画像URLを追加
    const dummyUrl = `/dental/mock-images/medication_${Date.now()}.jpg`
    setForm(p => ({
      ...p,
      assessment: {
        ...p.assessment,
        medicationImages: [...(p.assessment.medicationImages || []), {url: dummyUrl, addedAt: new Date().toISOString()}],
      },
    }))
  }
  const removeMedicationImage = idx => {
    setForm(p => ({
      ...p,
      assessment: {
        ...p.assessment,
        medicationImages: (p.assessment.medicationImages || []).filter((_, i) => i !== idx),
      },
    }))
  }

  const handleSave = () => {
    if (!form.lastNameKana || !form.firstNameKana) return
    onSave({
      ...patient,
      lastName: form.lastName,
      firstName: form.firstName,
      lastNameKana: form.lastNameKana,
      firstNameKana: form.firstNameKana,
      birthDate: form.birthDate,
      gender: form.gender,
      age: calcAge(form.birthDate),
      careLevel: form.careLevel,
      diseases: form.diseases,
      assessment: form.assessment,
      notes: form.notes,
    })
  }

  // ラジオボタングループ
  const RadioGroup = ({label, options, value, onChange, code}) => (
    <div className="mb-3">
      <div className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {code && <span className="text-xs text-gray-400 ml-1">({code})</span>}:
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name={label} checked={value === opt} onChange={() => onChange(opt)} className="w-3.5 h-3.5" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-blue-600 text-sm">
            ← 戻る
          </button>
          <h2 className="text-xl font-bold text-gray-900">患者情報入力</h2>
        </div>
        <Button onClick={handleSave}>保存</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左パネル: 患者情報入力 */}
        <div>
          <Card className="mb-4">
            <div className="p-3 border-b border-gray-200 bg-blue-600">
              <span className="text-sm font-medium text-white">患者情報入力</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input label="患者ID" value={String(patient.id)} onChange={() => {}} disabled />
                <Input label="姓" value={form.lastName} onChange={v => updateField('lastName', v)} required />
                <Input label="名" value={form.firstName} onChange={v => updateField('firstName', v)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="セイ（必須）" value={form.lastNameKana} onChange={v => updateField('lastNameKana', v)} required />
                <Input label="メイ（必須）" value={form.firstNameKana} onChange={v => updateField('firstNameKana', v)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="生年月日" value={form.birthDate} onChange={v => updateField('birthDate', v)} type="date" />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">年齢</label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm">
                    {calcAge(form.birthDate)}歳　<span className="text-xs text-gray-400">月日から自動算出</span>
                  </div>
                </div>
              </div>

              {/* 基礎疾患 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">基礎疾患</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {PATIENT_DISEASES.map(d => (
                    <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.diseases[d.id]}
                        onChange={() => updateDisease(d.id, !form.diseases[d.id])}
                        className="w-3.5 h-3.5"
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* お薬情報（お薬手帳画像の保存） */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">お薬情報</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.assessment.medicationImages || []).map((img, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 border border-gray-300 rounded bg-gray-100 flex items-center justify-center group"
                    >
                      <span className="text-2xl">💊</span>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center py-0.5 rounded-b">
                        {i + 1}枚目
                      </div>
                      <button
                        onClick={() => removeMedicationImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMedicationImage}
                  className="px-3 py-1.5 border border-dashed border-gray-400 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                >
                  📷 お薬手帳の画像を追加
                </button>
                <p className="text-xs text-gray-400 mt-1">※ お薬手帳の写真を撮影・アップロードして保存できます</p>
              </div>

              {/* 加算チェック */}
              <div className="space-y-2 pt-2 border-t">
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.assessment.hasInfoShareFee}
                      onChange={() => updateAssessment('hasInfoShareFee', !form.assessment.hasInfoShareFee)}
                      className="w-3.5 h-3.5"
                    />
                    診療情報等連携共有料（情共1）
                  </label>
                  {form.assessment.hasInfoShareFee && (
                    <div className="ml-6 mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">最終取得日:</span>
                      <input
                        type="date"
                        value={form.assessment.infoShareFeeLastDate || ''}
                        onChange={e => updateAssessment('infoShareFeeLastDate', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.assessment.hasComprehensiveManagement}
                      onChange={() => updateAssessment('hasComprehensiveManagement', !form.assessment.hasComprehensiveManagement)}
                      className="w-3.5 h-3.5"
                    />
                    総合医療管理加算（総医）
                  </label>
                  {form.assessment.hasComprehensiveManagement && (
                    <div className="ml-6 mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">最終取得日:</span>
                      <input
                        type="date"
                        value={form.assessment.comprehensiveManagementLastDate || ''}
                        onChange={e => updateAssessment('comprehensiveManagementLastDate', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 右パネル: 患者状態・アセスメント */}
        <div>
          <Card>
            <div className="p-3 border-b border-gray-200 bg-blue-600">
              <span className="text-sm font-medium text-white">← 患者状態・アセスメント</span>
            </div>
            <div className="p-4">
              {/* 基本情報 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">基本情報</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500">身長</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={form.assessment.height}
                      onChange={e => updateAssessment('height', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm">cm</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">体重</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={form.assessment.weight}
                      onChange={e => updateAssessment('weight', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm">Kg</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">BMI</label>
                  <div className="px-2 py-1 bg-gray-100 rounded text-sm">{form.assessment.bmi || '—'}</div>
                </div>
              </div>

              {/* 誤嚥性肺炎の既往 */}
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">誤嚥性肺炎の既往:</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {['無し', 'あり'].map(opt => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="aspirationPneumonia"
                        checked={form.assessment.aspirationPneumoniaHistory === opt}
                        onChange={() => updateAssessment('aspirationPneumoniaHistory', opt)}
                        className="w-3.5 h-3.5"
                      />
                      {opt}
                    </label>
                  ))}
                  {form.assessment.aspirationPneumoniaHistory === 'あり' && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      いつ頃:{' '}
                      <input
                        type="date"
                        value={form.assessment.aspirationPneumoniaDate || ''}
                        onChange={e => updateAssessment('aspirationPneumoniaDate', e.target.value)}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                      />
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-1 text-sm mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.assessment.aspirationPneumoniaRepeat}
                    onChange={() => updateAssessment('aspirationPneumoniaRepeat', !form.assessment.aspirationPneumoniaRepeat)}
                    className="w-3.5 h-3.5"
                  />
                  繰り返しあり
                  {form.assessment.aspirationPneumoniaRepeat && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                      最近:{' '}
                      <input
                        type="date"
                        value={form.assessment.aspirationPneumoniaRepeatDate || ''}
                        onChange={e => updateAssessment('aspirationPneumoniaRepeatDate', e.target.value)}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                      />
                    </span>
                  )}
                </label>
              </div>

              {/* 身体・口腔状況 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">身体・口腔状況</div>
              <RadioGroup
                label="座位保持"
                code="JZ3-1"
                options={ASSESSMENT_OPTIONS.seatRetention}
                value={form.assessment.seatRetention}
                onChange={v => updateAssessment('seatRetention', v)}
              />
              <RadioGroup
                label="口腔清掃の状況"
                options={ASSESSMENT_OPTIONS.oralCleaning}
                value={form.assessment.oralCleaning}
                onChange={v => updateAssessment('oralCleaning', v)}
              />
              <RadioGroup
                label="お口の中の水分保持"
                options={ASSESSMENT_OPTIONS.moistureRetention}
                value={form.assessment.moistureRetention}
                onChange={v => updateAssessment('moistureRetention', v)}
              />
              <RadioGroup
                label="うがい"
                options={ASSESSMENT_OPTIONS.gargling}
                value={form.assessment.gargling}
                onChange={v => updateAssessment('gargling', v)}
              />

              {/* リスク・摂取 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1 mt-4">リスク・摂取</div>
              <RadioGroup
                label="低栄養リスク"
                options={ASSESSMENT_OPTIONS.malnutritionRisk}
                value={form.assessment.malnutritionRisk}
                onChange={v => updateAssessment('malnutritionRisk', v)}
              />
              <RadioGroup
                label="むせ"
                options={ASSESSMENT_OPTIONS.choking}
                value={form.assessment.choking}
                onChange={v => updateAssessment('choking', v)}
              />
              <RadioGroup
                label="経口摂取の有無"
                options={ASSESSMENT_OPTIONS.oralIntake}
                value={form.assessment.oralIntake}
                onChange={v => updateAssessment('oralIntake', v)}
              />

              {/* 栄養・水分 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1 mt-4">栄養・水分</div>
              <RadioGroup
                label="人工栄養法"
                options={ASSESSMENT_OPTIONS.artificialNutrition}
                value={form.assessment.artificialNutrition}
                onChange={v => updateAssessment('artificialNutrition', v)}
              />
              <RadioGroup
                label="水分"
                options={ASSESSMENT_OPTIONS.moisture}
                value={form.assessment.moisture}
                onChange={v => updateAssessment('moisture', v)}
              />

              {/* 食事・服薬 */}
              <div className="text-sm font-bold text-gray-900 mb-2 border-b pb-1 mt-4">食事・服薬</div>
              <div className="text-xs text-gray-500 mb-1">食形態</div>
              <RadioGroup
                label="主食"
                code="JZ12-1/JZ12-2/JZ12-3"
                options={ASSESSMENT_OPTIONS.mainDish}
                value={form.assessment.mainDish}
                onChange={v => updateAssessment('mainDish', v)}
              />
              <RadioGroup
                label="おかず"
                code="JZ12-4/JZ12-5"
                options={ASSESSMENT_OPTIONS.sideDish}
                value={form.assessment.sideDish}
                onChange={v => updateAssessment('sideDish', v)}
              />
              <RadioGroup
                label="飲み込み"
                options={ASSESSMENT_OPTIONS.swallowing}
                value={form.assessment.swallowing}
                onChange={v => updateAssessment('swallowing', v)}
              />
              <RadioGroup
                label="薬の服用(カプセル・錠剤)"
                options={ASSESSMENT_OPTIONS.medicationSwallowing}
                value={form.assessment.medicationSwallowing}
                onChange={v => updateAssessment('medicationSwallowing', v)}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  )
}

/**
 * 個人情報の詳細（患者プロフィール）画面
 */
const PatientDetailPage = ({patient, facility, examinations, scoringHistory, documents, onBack, onEdit}) => {
  if (!patient) return null

  const patientExams = examinations.filter(e => e.patientId === patient.id)
  const patientHistory = scoringHistory.filter(h => h.patientId === patient.id)
  const patientDocs = documents.filter(d => d.patientId === patient.id)
  const activeDiseases = PATIENT_DISEASES.filter(d => patient.diseases?.[d.id])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          ← 患者管理に戻る
        </button>
        {onEdit && <Button onClick={onEdit}>✏️ 編集</Button>}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">患者認識・アセスメント</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* 基本情報 */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">基本情報</span>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">氏名:</span> <span className="font-medium">{getPatientName(patient)}</span>
              </div>
              <div>
                <span className="text-gray-500">カナ:</span> {getPatientNameKana(patient)}
              </div>
              <div>
                <span className="text-gray-500">性別:</span>{' '}
                {patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : '-'}
              </div>
              <div>
                <span className="text-gray-500">年齢:</span> {patient.age || '-'}歳
              </div>
              <div>
                <span className="text-gray-500">生年月日:</span> {patient.birthDate || '-'}
              </div>
              <div>
                <span className="text-gray-500">介護度:</span> {patient.careLevel || '-'}
              </div>
            </div>
          </div>
        </Card>

        {/* 訪問先情報 */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">訪問先情報</span>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div>
              <span className="text-gray-500">施設:</span> <span className="font-medium">{facility?.name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">居室:</span> {patient.building} {patient.floor} {patient.room}号室
            </div>
            <div>
              <span className="text-gray-500">申し送り:</span> <span className="text-amber-700">{patient.notes || 'なし'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 既往歴・疾患 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">既往歴・疾患</span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {PATIENT_DISEASES.map(d => (
              <span
                key={d.id}
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                  patient.diseases?.[d.id] ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {patient.diseases?.[d.id] ? '☑' : '☐'} {d.name}
              </span>
            ))}
          </div>
          {activeDiseases.length === 0 && <p className="text-sm text-gray-400 mt-2">登録されている疾患はありません</p>}
        </div>
      </Card>

      {/* 口腔状態 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">口腔状態</span>
        </div>
        <div className="p-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">残存歯数:</span>{' '}
            <span className="font-bold text-lg">{patient.teethCount ?? '-'}</span>本
          </div>
          <div>
            <span className="text-gray-500">義歯:</span>{' '}
            <Badge variant={patient.hasDenture ? 'info' : 'default'}>{patient.hasDenture ? 'あり' : 'なし'}</Badge>
          </div>
          <div>
            <span className="text-gray-500">口腔機能低下:</span>{' '}
            <Badge variant={patient.hasOralHypofunction ? 'warning' : 'default'}>
              {patient.hasOralHypofunction ? 'あり' : 'なし'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 算定履歴 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">算定履歴</span>
        </div>
        {patientHistory.length === 0 ? (
          <EmptyState message="算定履歴はありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">算定項目</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">最終算定日</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">点数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patientHistory.map(h => {
                  const proc = PROCEDURE_ITEMS_MASTER.find(p => p.id === h.procedureId)
                  return (
                    <tr key={h.id}>
                      <td className="px-4 py-2 text-sm">{proc?.name || h.procedureId}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{h.lastScoredAt}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">{h.points}点</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 提供文書一覧 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">提供文書</span>
        </div>
        {patientDocs.length === 0 ? (
          <EmptyState message="提供文書はありません" />
        ) : (
          <ul className="divide-y divide-gray-200">
            {patientDocs.map(d => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{d.templateName}</span>
                  <span className="text-xs text-gray-500 ml-2">{d.createdAt}</span>
                </div>
                <Badge variant="success">作成済み</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 経過記録 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">経過記録</span>
        </div>
        {patientExams.length === 0 ? (
          <EmptyState message="診療記録はありません" />
        ) : (
          <ul className="divide-y divide-gray-200">
            {patientExams.map(e => (
              <li key={e.id} className="px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">
                  診察ID: {e.id} / ステータス: {e.status}
                </div>
                {e.visitCondition && (
                  <div className="text-sm">
                    <span className="text-gray-500">様子:</span> {e.visitCondition}
                  </div>
                )}
                {e.oralFindings && (
                  <div className="text-sm">
                    <span className="text-gray-500">所見:</span> {e.oralFindings}
                  </div>
                )}
                {e.treatment && (
                  <div className="text-sm">
                    <span className="text-gray-500">処置:</span> {e.treatment}
                  </div>
                )}
                {e.nextPlan && (
                  <div className="text-sm">
                    <span className="text-gray-500">次回:</span> {e.nextPlan}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

/**
 * 個別入力画面
 */
const IndividualInputPage = ({facilities, patients, staff, onStartConsultation}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedHygienistId, setSelectedHygienistId] = useState('')

  const facilityPatients = useMemo(() => {
    if (!selectedFacilityId) return []
    return patients.filter(p => p.facilityId === Number(selectedFacilityId))
  }, [patients, selectedFacilityId])

  // 建物×フロアでグルーピング
  const groupedPatients = useMemo(() => {
    const groups = {}
    facilityPatients.forEach(p => {
      const key = `${p.building} ${p.floor}`
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [facilityPatients])

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR)
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST)

  const handleStart = () => {
    if (!selectedPatientId || !selectedFacilityId) return
    onStartConsultation({
      patientId: selectedPatientId,
      facilityId: Number(selectedFacilityId),
      doctorId: selectedDoctorId ? Number(selectedDoctorId) : null,
      hygienistId: selectedHygienistId ? Number(selectedHygienistId) : null,
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">個別入力</h2>
      <p className="text-sm text-gray-500 mb-4">スケジュールを経由せず、患者を直接選択して診療入力を開始します。</p>

      {/* 施設選択 */}
      <Card className="mb-4 p-4">
        <Select
          label="施設選択"
          value={selectedFacilityId}
          onChange={v => {
            setSelectedFacilityId(v)
            setSelectedPatientId(null)
          }}
          options={[{value: '', label: '施設を選択してください'}, ...facilities.map(f => ({value: String(f.id), label: f.name}))]}
        />
      </Card>

      {/* 患者選択 */}
      {selectedFacilityId && (
        <Card className="mb-4">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">患者を選択</span>
          </div>
          {Object.entries(groupedPatients).length === 0 ? (
            <EmptyState message="この施設に登録された患者はいません" />
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedPatients).map(([group, pts]) => (
                <div key={group}>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">{group}</div>
                  {pts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selectedPatientId === p.id ? 'bg-slate-100 border-l-4 border-slate-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                          selectedPatientId === p.id ? 'border-slate-600 bg-slate-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {selectedPatientId === p.id && '✓'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{getPatientName(p)}</span>
                      <span className="text-xs text-gray-500">({p.room})</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 担当選択・開始 */}
      {selectedPatientId && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Select
              label="担当Dr"
              value={selectedDoctorId}
              onChange={setSelectedDoctorId}
              options={[{value: '', label: '選択なし'}, ...doctors.map(d => ({value: String(d.id), label: d.name}))]}
            />
            <Select
              label="担当DH"
              value={selectedHygienistId}
              onChange={setSelectedHygienistId}
              options={[{value: '', label: '選択なし'}, ...hygienists.map(h => ({value: String(h.id), label: h.name}))]}
            />
          </div>
          <Button size="lg" className="w-full" onClick={handleStart}>
            診察を開始する
          </Button>
        </Card>
      )}
    </div>
  )
}

/**
 * 最終提示画面
 */
const FinalReviewPage = ({examination, patient, facility, staff, clinic, onBack, onBackToSchedule}) => {
  if (!examination || !patient) return null

  // 算定点数の計算
  const totalPoints = useMemo(() => {
    let total = 0
    Object.entries(examination.procedureItems || {}).forEach(([itemId, selection]) => {
      const proc = PROCEDURE_ITEMS_MASTER.find(p => p.id === itemId)
      if (!proc) return
      if (selection.categoryId) {
        const cat = proc.categories?.find(c => c.id === selection.categoryId)
        if (cat) total += cat.points
      } else if (proc.defaultPoints) {
        total += proc.defaultPoints
      }
    })
    return total
  }, [examination])

  const drDuration =
    examination.drStartTime && examination.drEndTime
      ? Math.floor((new Date(examination.drEndTime) - new Date(examination.drStartTime)) / 1000)
      : null
  const dhDuration =
    examination.dhStartTime && examination.dhEndTime
      ? Math.floor((new Date(examination.dhEndTime) - new Date(examination.dhStartTime)) / 1000)
      : null

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        ← 戻る
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-1">最終提示画面</h2>
      <p className="text-sm text-gray-500 mb-4">
        {getPatientName(patient)} 様 | {facility?.name || '-'} | 2026/01/18
      </p>

      {/* 診療情報 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">診療情報</span>
        </div>
        <div className="p-4 space-y-2 text-sm">
          {drDuration !== null && (
            <div>
              DR時間: {examination.drStartTime ? formatTime(new Date(examination.drStartTime)) : '--'} -{' '}
              {examination.drEndTime ? formatTime(new Date(examination.drEndTime)) : '--'} ({formatDuration(drDuration)})
            </div>
          )}
          {dhDuration !== null && (
            <div>
              DH時間: {examination.dhStartTime ? formatTime(new Date(examination.dhStartTime)) : '--'} -{' '}
              {examination.dhEndTime ? formatTime(new Date(examination.dhEndTime)) : '--'} ({formatDuration(dhDuration)})
            </div>
          )}
          {examination.vitalBefore && (
            <div>
              バイタル(前): BP {examination.vitalBefore.bloodPressure || '-'}, SpO2 {examination.vitalBefore.spo2 || '-'}
            </div>
          )}
          {examination.vitalAfter && (
            <div>
              バイタル(後): BP {examination.vitalAfter.bloodPressure || '-'}, SpO2 {examination.vitalAfter.spo2 || '-'}
            </div>
          )}
        </div>
      </Card>

      {/* 実施記録 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">実施記録</span>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div>
            <span className="text-gray-500">訪問時の様子:</span> {examination.visitCondition || '（未入力）'}
          </div>
          <div>
            <span className="text-gray-500">口腔内所見:</span> {examination.oralFindings || '（未入力）'}
          </div>
          <div>
            <span className="text-gray-500">処置:</span> {examination.treatment || '（未入力）'}
          </div>
          <div>
            <span className="text-gray-500">次回予定:</span> {examination.nextPlan || '（未入力）'}
          </div>
        </div>
      </Card>

      {/* 算定項目 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">算定項目</span>
          <span className="text-sm font-bold text-slate-700">合計: {totalPoints}点</span>
        </div>
        <ul className="divide-y divide-gray-200">
          {Object.entries(examination.procedureItems || {}).map(([itemId, selection]) => {
            const proc = PROCEDURE_ITEMS_MASTER.find(p => p.id === itemId)
            if (!proc) return null
            const cat = proc.categories?.find(c => c.id === selection.categoryId)
            const points = cat?.points || proc.defaultPoints || 0
            return (
              <li key={itemId} className="px-4 py-2 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{proc.name}</span>
                  {cat && <span className="text-gray-500 ml-2">({cat.name})</span>}
                </div>
                <span className="font-medium">{points}点</span>
              </li>
            )
          })}
          {Object.keys(examination.procedureItems || {}).length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">算定項目なし</li>
          )}
        </ul>
      </Card>

      {/* 操作ボタン */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          診療画面に戻る
        </Button>
        <Button variant="success" onClick={onBackToSchedule} className="flex-1">
          訪問計画に戻る
        </Button>
      </div>
    </div>
  )
}

/**
 * 算定項目・点数一覧ページ
 */
const ScoringReferencePage = () => {
  const [expandedSection, setExpandedSection] = useState(null)

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">算定項目・点数一覧</h2>

      <div className="space-y-3">
        {SCORING_SECTIONS.map(section => {
          const sectionItems = section.items.map(id => PROCEDURE_ITEMS_MASTER.find(p => p.id === id)).filter(Boolean)
          const isExpanded = expandedSection === section.id

          return (
            <Card key={section.id}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-sm font-bold text-gray-800">
                  {section.label} ({sectionItems.length}項目)
                </span>
                <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
              </button>
              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {sectionItems.map(item => (
                    <div key={item.id} className="px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-500">{item.fullName}</span>
                          </div>
                          {item.note && <div className="text-xs text-gray-500 mt-1">{item.note}</div>}
                          {item.intervalMonths && (
                            <div className="text-xs text-amber-600 mt-0.5">{item.intervalMonths}ヶ月毎に算定可能</div>
                          )}
                          {item.monthlyLimit && <div className="text-xs text-blue-600 mt-0.5">月{item.monthlyLimit}回まで</div>}
                        </div>
                        <div className="text-right ml-4">
                          {item.categories && item.categories.length > 0 ? (
                            <div className="space-y-1">
                              {item.categories.map(cat => (
                                <div key={cat.id} className="text-xs">
                                  <span className="text-gray-600">{cat.name}: </span>
                                  <span className="font-bold text-slate-700">{cat.points}点</span>
                                  {cat.requiredClinicQualification && <span className="text-amber-600 ml-1">★</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            item.defaultPoints != null && (
                              <span className="text-sm font-bold text-slate-700">{item.defaultPoints}点</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 在宅患者の算定対象台帳
 */
const ScoringLedgerPage = ({patients, facilities, scoringHistory}) => {
  const today = new Date(2026, 0, 18)

  // 月次算定項目と3ヶ月インターバル算定項目
  const trackingItems = [
    {id: 'shizaikan', name: '歯在管', type: 'monthly'},
    {id: 'houeishi', name: '訪衛指', type: 'monthly'},
    {id: 'zetsuatsu', name: '舌圧', type: 'interval', months: 3},
    {id: 'fkyoku', name: 'F局', type: 'interval', months: 3},
    {id: 'spt', name: 'SPT', type: 'interval', months: 3},
    {id: 'shiriha3', name: '歯リハ3', type: 'monthly'},
  ]

  const getStatus = (patientId, item) => {
    const history = scoringHistory.find(h => h.patientId === patientId && h.procedureId === item.id)
    if (!history) return {status: 'none', label: '未算定', alert: true}

    const lastDate = new Date(history.lastScoredAt)
    if (item.type === 'monthly') {
      const sameMonth = lastDate.getMonth() === today.getMonth() && lastDate.getFullYear() === today.getFullYear()
      return sameMonth
        ? {status: 'done', label: `${history.lastScoredAt}`, alert: false}
        : {status: 'due', label: `前回: ${history.lastScoredAt}`, alert: true}
    }
    // interval
    const diffMs = today - lastDate
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30)
    const isOverdue = diffMonths >= item.months
    return isOverdue
      ? {status: 'overdue', label: `${item.months}M超過 (前回: ${history.lastScoredAt})`, alert: true}
      : {status: 'ok', label: `前回: ${history.lastScoredAt}`, alert: false}
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-2">在宅患者の算定対象台帳</h2>
      <p className="text-sm text-gray-500 mb-4">前回の算定日を参考に提案をします</p>

      {/* 凡例 */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-100 border border-red-300 rounded inline-block"></span> 要算定/超過
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block"></span> 算定済/未到来
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-100 border border-gray-300 rounded inline-block"></span> 未算定
        </span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-50">患者</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">施設</th>
                {trackingItems.map(item => (
                  <th key={item.id} className="px-3 py-2 text-center text-xs font-medium text-gray-500 min-w-[100px]">
                    {item.name}
                    <div className="text-xs font-normal text-gray-400">
                      {item.type === 'monthly' ? '月次' : `${item.months}M毎`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map(p => {
                const facility = facilities.find(f => f.id === p.facilityId)
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 sticky left-0 bg-white">{getPatientName(p)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{facility?.name || '-'}</td>
                    {trackingItems.map(item => {
                      const result = getStatus(p.id, item)
                      return (
                        <td key={item.id} className="px-3 py-2 text-center">
                          <div
                            className={`text-xs px-1 py-0.5 rounded ${
                              result.alert ? 'bg-red-50 text-red-700 font-medium' : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {result.alert && '★ '}
                            {result.label}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/**
 * 提供文書一覧画面
 */
const DocumentListPage = ({documents, patients}) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">提供文書一覧</h2>

      <Card>
        {documents.length === 0 ? (
          <EmptyState message="保存された文書はありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">作成日</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">患者</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">文書種別</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">バージョン</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map(doc => {
                  const patient = patients.find(p => p.id === doc.patientId)
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{doc.createdAt}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient ? getPatientName(patient) : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{doc.templateName}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">v{doc.version}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success">作成済み</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * テンプレート登録画面
 */
const TemplateMasterPage = () => {
  const templates = Object.values(DOCUMENT_TEMPLATES)

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">テンプレート登録</h2>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">テンプレート名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">正式名称</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">関連算定項目</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">自動項目</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">手動項目</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map(t => {
                const relatedProc = PROCEDURE_ITEMS_MASTER.find(p => p.id === t.relatedProcedure)
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.fullName}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="info">{relatedProc?.name || t.relatedProcedure}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{t.fields?.auto?.length || 0}項目</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{t.fields?.manual?.length || 0}項目</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800">
          <span className="font-medium">※</span> テンプレートの追加・編集機能は今後のバージョンで実装予定です。
        </div>
      </div>
    </div>
  )
}

/**
 * 施設ポータル画面（施設側モック）
 */
const FacilityPortalPage = ({facility, patients, onUpdatePatient}) => {
  const facilityPatients = patients.filter(p => p.facilityId === facility?.id)
  const [editingPatientId, setEditingPatientId] = useState(null)
  const [assessmentData, setAssessmentData] = useState({})

  const getEditData = patientId => {
    const patient = facilityPatients.find(p => p.id === patientId)
    return {
      ...patient?.assessment,
      careLevel: patient?.careLevel || '',
      notes: patient?.notes || '',
      diseases: {...patient?.diseases},
      teethCount: patient?.teethCount || 0,
      hasDenture: patient?.hasDenture || false,
      hasOralHypofunction: patient?.hasOralHypofunction || false,
      ...(assessmentData[patientId] || {}),
    }
  }

  const updateEditData = (patientId, field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [patientId]: {...(prev[patientId] || {}), [field]: value},
    }))
  }

  const calcBmi = (h, w) => {
    const hm = parseFloat(h) / 100
    const wk = parseFloat(w)
    if (!hm || !wk || hm <= 0) return ''
    return (wk / (hm * hm)).toFixed(1)
  }

  const handleSaveAssessment = patientId => {
    const data = getEditData(patientId)
    const patient = facilityPatients.find(p => p.id === patientId)
    if (patient && onUpdatePatient) {
      const bmi = calcBmi(data.height, data.weight)
      onUpdatePatient(patientId, {
        careLevel: data.careLevel,
        notes: data.notes,
        diseases: data.diseases,
        teethCount: data.teethCount,
        hasDenture: data.hasDenture,
        hasOralHypofunction: data.hasOralHypofunction,
        assessment: {
          ...patient.assessment,
          height: data.height,
          weight: data.weight,
          bmi,
          aspirationPneumoniaHistory: data.aspirationPneumoniaHistory,
          seatRetention: data.seatRetention,
          oralCleaning: data.oralCleaning,
          moistureRetention: data.moistureRetention,
          gargling: data.gargling,
          malnutritionRisk: data.malnutritionRisk,
          choking: data.choking,
          oralIntake: data.oralIntake,
          artificialNutrition: data.artificialNutrition,
          moisture: data.moisture,
          mainDish: data.mainDish,
          sideDish: data.sideDish,
          swallowing: data.swallowing,
          medicationSwallowing: data.medicationSwallowing,
        },
      })
    }
    setEditingPatientId(null)
  }

  // ラジオボタングループ（ポータル用）
  const PortalRadioGroup = ({label, options, value, onChange}) => (
    <div className="mb-2">
      <div className="text-xs font-medium text-gray-600 mb-1">{label}:</div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-1 cursor-pointer text-xs">
            <input type="radio" name={label} checked={value === opt} onChange={() => onChange(opt)} className="w-3 h-3" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🏢</span>
          <h2 className="text-xl font-bold text-gray-900">{facility?.name || '施設名'} ポータル</h2>
        </div>
        <p className="text-sm text-gray-500">利用者のアセスメント情報を入力・更新できます。</p>
      </div>

      <Card>
        <div className="p-3 border-b border-gray-200 bg-blue-600">
          <span className="text-sm font-medium text-white">利用者一覧</span>
        </div>
        {facilityPatients.length === 0 ? (
          <EmptyState message="この施設に登録された利用者はいません" />
        ) : (
          <div className="divide-y divide-gray-200">
            {facilityPatients.map(patient => {
              const data = getEditData(patient.id)
              return (
                <div key={patient.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">👤</span>
                      <div>
                        <div className="font-medium text-gray-900">{getPatientName(patient)}</div>
                        <div className="text-xs text-gray-500">
                          {patient.building} {patient.floor}-{patient.room}
                        </div>
                      </div>
                    </div>
                    {editingPatientId === patient.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditingPatientId(null)}>
                          キャンセル
                        </Button>
                        <Button size="sm" onClick={() => handleSaveAssessment(patient.id)}>
                          保存
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditingPatientId(patient.id)}>
                        アセスメント入力
                      </Button>
                    )}
                  </div>

                  {editingPatientId === patient.id && (
                    <div className="mt-3 p-4 bg-gray-50 rounded space-y-4">
                      {/* 基本情報 */}
                      <div className="text-sm font-bold text-gray-900 border-b pb-1">基本情報</div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">身長(cm)</label>
                          <input
                            type="number"
                            value={data.height || ''}
                            onChange={e => updateEditData(patient.id, 'height', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">体重(kg)</label>
                          <input
                            type="number"
                            value={data.weight || ''}
                            onChange={e => updateEditData(patient.id, 'weight', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">BMI</label>
                          <div className="px-2 py-1 bg-gray-100 rounded text-sm">{calcBmi(data.height, data.weight) || '—'}</div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">介護度</label>
                          <select
                            value={data.careLevel || ''}
                            onChange={e => updateEditData(patient.id, 'careLevel', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">選択</option>
                            {['要支援1', '要支援2', '要介護1', '要介護2', '要介護3', '要介護4', '要介護5'].map(v => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 誤嚥性肺炎 */}
                      <PortalRadioGroup
                        label="誤嚥性肺炎の既往"
                        options={['無し', 'あり']}
                        value={data.aspirationPneumoniaHistory || '無し'}
                        onChange={v => updateEditData(patient.id, 'aspirationPneumoniaHistory', v)}
                      />

                      {/* 身体・口腔状況 */}
                      <div className="text-sm font-bold text-gray-900 border-b pb-1">身体・口腔状況</div>
                      <PortalRadioGroup
                        label="座位保持"
                        options={ASSESSMENT_OPTIONS.seatRetention}
                        value={data.seatRetention || ''}
                        onChange={v => updateEditData(patient.id, 'seatRetention', v)}
                      />
                      <PortalRadioGroup
                        label="口腔清掃の状況"
                        options={ASSESSMENT_OPTIONS.oralCleaning}
                        value={data.oralCleaning || ''}
                        onChange={v => updateEditData(patient.id, 'oralCleaning', v)}
                      />
                      <PortalRadioGroup
                        label="口腔内水分保持"
                        options={ASSESSMENT_OPTIONS.moistureRetention}
                        value={data.moistureRetention || ''}
                        onChange={v => updateEditData(patient.id, 'moistureRetention', v)}
                      />
                      <PortalRadioGroup
                        label="うがい"
                        options={ASSESSMENT_OPTIONS.gargling}
                        value={data.gargling || ''}
                        onChange={v => updateEditData(patient.id, 'gargling', v)}
                      />

                      {/* リスク・摂取 */}
                      <div className="text-sm font-bold text-gray-900 border-b pb-1">リスク・摂取</div>
                      <PortalRadioGroup
                        label="低栄養リスク"
                        options={ASSESSMENT_OPTIONS.malnutritionRisk}
                        value={data.malnutritionRisk || ''}
                        onChange={v => updateEditData(patient.id, 'malnutritionRisk', v)}
                      />
                      <PortalRadioGroup
                        label="むせ"
                        options={ASSESSMENT_OPTIONS.choking}
                        value={data.choking || ''}
                        onChange={v => updateEditData(patient.id, 'choking', v)}
                      />
                      <PortalRadioGroup
                        label="経口摂取の有無"
                        options={ASSESSMENT_OPTIONS.oralIntake}
                        value={data.oralIntake || ''}
                        onChange={v => updateEditData(patient.id, 'oralIntake', v)}
                      />
                      <PortalRadioGroup
                        label="人工栄養法"
                        options={ASSESSMENT_OPTIONS.artificialNutrition}
                        value={data.artificialNutrition || ''}
                        onChange={v => updateEditData(patient.id, 'artificialNutrition', v)}
                      />

                      {/* 食事・服薬 */}
                      <div className="text-sm font-bold text-gray-900 border-b pb-1">食事・服薬</div>
                      <PortalRadioGroup
                        label="水分"
                        options={ASSESSMENT_OPTIONS.moisture}
                        value={data.moisture || ''}
                        onChange={v => updateEditData(patient.id, 'moisture', v)}
                      />
                      <PortalRadioGroup
                        label="主食"
                        options={ASSESSMENT_OPTIONS.mainDish}
                        value={data.mainDish || ''}
                        onChange={v => updateEditData(patient.id, 'mainDish', v)}
                      />
                      <PortalRadioGroup
                        label="おかず"
                        options={ASSESSMENT_OPTIONS.sideDish}
                        value={data.sideDish || ''}
                        onChange={v => updateEditData(patient.id, 'sideDish', v)}
                      />
                      <PortalRadioGroup
                        label="飲み込み"
                        options={ASSESSMENT_OPTIONS.swallowing}
                        value={data.swallowing || ''}
                        onChange={v => updateEditData(patient.id, 'swallowing', v)}
                      />
                      <PortalRadioGroup
                        label="薬の服用"
                        options={ASSESSMENT_OPTIONS.medicationSwallowing}
                        value={data.medicationSwallowing || ''}
                        onChange={v => updateEditData(patient.id, 'medicationSwallowing', v)}
                      />

                      {/* 基礎疾患 */}
                      <div className="text-sm font-bold text-gray-900 border-b pb-1">基礎疾患</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {PATIENT_DISEASES.map(d => (
                          <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!(data.diseases || {})[d.id]}
                              onChange={() => {
                                const newDiseases = {...(data.diseases || {}), [d.id]: !(data.diseases || {})[d.id]}
                                updateEditData(patient.id, 'diseases', newDiseases)
                              }}
                              className="w-3 h-3"
                            />
                            {d.name}
                          </label>
                        ))}
                      </div>

                      {/* 歯科情報 */}
                      <div className="text-sm font-bold text-gray-900 border-b pb-1">歯科情報</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">残歯数</label>
                          <input
                            type="number"
                            value={data.teethCount || 0}
                            onChange={e => updateEditData(patient.id, 'teethCount', Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs cursor-pointer pt-4">
                          <input
                            type="checkbox"
                            checked={!!data.hasDenture}
                            onChange={() => updateEditData(patient.id, 'hasDenture', !data.hasDenture)}
                            className="w-3 h-3"
                          />
                          義歯あり
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer pt-4">
                          <input
                            type="checkbox"
                            checked={!!data.hasOralHypofunction}
                            onChange={() => updateEditData(patient.id, 'hasOralHypofunction', !data.hasOralHypofunction)}
                            className="w-3 h-3"
                          />
                          口腔機能低下症
                        </label>
                      </div>

                      {/* 備考 */}
                      <div>
                        <label className="text-xs text-gray-500">備考・申し送り</label>
                        <textarea
                          value={data.notes || ''}
                          onChange={e => updateEditData(patient.id, 'notes', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          rows={2}
                          placeholder="気になる点や伝達事項があれば入力してください"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * 履歴・一括印刷画面
 */
const BatchPrintPage = ({facilities, examinations, patients, visitPlans, documents}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2026-01')

  // フィルタリング
  const filteredExams = useMemo(() => {
    return examinations.filter(exam => {
      if (exam.status !== EXAMINATION_STATUS.DONE) return false
      const plan = visitPlans.find(p => p.id === exam.visitPlanId)
      if (!plan) return false
      if (selectedFacilityId && plan.facilityId !== Number(selectedFacilityId)) return false
      if (selectedMonth && plan.visitDate && !plan.visitDate.startsWith(selectedMonth)) return false
      return true
    })
  }, [examinations, visitPlans, selectedFacilityId, selectedMonth])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">履歴・一括印刷</h2>

      {/* フィルタ */}
      <Card className="mb-4 p-4">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">施設</label>
            <select
              value={selectedFacilityId}
              onChange={e => setSelectedFacilityId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="">すべての施設</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">対象月</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => {
              // モック: PDF一括出力のシミュレーション
              console.log('一括PDF出力:', {facility: selectedFacilityId, month: selectedMonth, count: filteredExams.length})
            }}
          >
            🖨️ 一括PDF出力
          </Button>
        </div>
      </Card>

      {/* 統計サマリー */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">対象患者数</div>
          <div className="text-2xl font-bold text-gray-900">{filteredExams.length} 名</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">合計算定点数</div>
          <div className="text-2xl font-bold text-slate-700">
            {filteredExams
              .reduce((sum, e) => {
                let pts = 0
                if (e.procedureItems) {
                  Object.entries(e.procedureItems).forEach(([itemId, data]) => {
                    const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
                    if (!item) return
                    if (item.categories?.length > 0 && data.categoryId) {
                      const cat = item.categories.find(c => c.id === data.categoryId)
                      pts += cat?.points || 0
                    } else {
                      pts += item.defaultPoints || 0
                    }
                  })
                }
                return sum + pts
              }, 0)
              .toLocaleString()}{' '}
            点
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">文書作成済み</div>
          <div className="text-2xl font-bold text-emerald-600">
            {documents?.filter(d => filteredExams.some(e => e.id === d.examinationId)).length || 0} 件
          </div>
        </Card>
      </div>

      {/* 一覧テーブル */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">診療履歴一覧</span>
        </div>
        {filteredExams.length === 0 ? (
          <EmptyState message="該当する診療記録はありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">日付</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">患者名</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">施設</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">実施項目</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">点数</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">文書</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExams.map(exam => {
                  const patient = patients.find(p => p.id === exam.patientId)
                  const plan = visitPlans.find(p => p.id === exam.visitPlanId)
                  const facility = facilities.find(f => f.id === plan?.facilityId)
                  let pts = 0
                  if (exam.procedureItems) {
                    Object.entries(exam.procedureItems).forEach(([itemId, data]) => {
                      const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
                      if (!item) return
                      if (item.categories?.length > 0 && data.categoryId) {
                        const cat = item.categories.find(c => c.id === data.categoryId)
                        pts += cat?.points || 0
                      } else {
                        pts += item.defaultPoints || 0
                      }
                    })
                  }
                  const hasDoc = documents?.some(d => d.examinationId === exam.id)
                  return (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{plan?.visitDate || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient ? getPatientName(patient) : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {exam.procedureItems && Object.keys(exam.procedureItems).length > 0
                          ? Object.keys(exam.procedureItems)
                              .map(id => PROCEDURE_ITEMS_MASTER.find(p => p.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-700">
                        {pts > 0 ? `${pts.toLocaleString()}点` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasDoc ? <Badge variant="success">済</Badge> : <span className="text-xs text-gray-400">-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * 診察の合計点数を計算するヘルパー関数
 */
const calculateExamPoints = exam => {
  if (!exam.procedureItems) return 0
  let total = 0
  Object.entries(exam.procedureItems).forEach(([itemId, data]) => {
    const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
    if (!item) return
    if (item.categories?.length > 0 && data.categoryId) {
      const category = item.categories.find(c => c.id === data.categoryId)
      total += category?.points || 0
    } else {
      total += item.defaultPoints || 0
    }
  })
  return total
}

/**
 * 文書作成状況を取得するヘルパー関数
 */
const getDocumentStatus = (exam, documents) => {
  if (!exam.procedureItems) return {required: 0, completed: 0}
  let required = 0
  let completed = 0
  Object.keys(exam.procedureItems).forEach(itemId => {
    const item = PROCEDURE_ITEMS_MASTER.find(i => i.id === itemId)
    if (item?.documents?.length > 0) {
      required += item.documents.length
      // 関連する文書が作成済みかチェック
      item.documents.forEach(doc => {
        const found = documents?.find(d => d.examinationId === exam.id && d.templateId === doc.id)
        if (found) completed++
      })
    }
  })
  return {required, completed}
}

/**
 * 日次報告（Summary）画面
 */
const SummaryPage = ({visitPlans, examinations, patients, facilities, documents}) => {
  const today = formatDate(new Date(2026, 0, 18))
  const todayPlans = visitPlans.filter(p => p.visitDate === today)

  const completedExams = examinations.filter(e => e.status === EXAMINATION_STATUS.DONE)

  // 合計点数の計算
  const totalPoints = completedExams.reduce((sum, exam) => sum + calculateExamPoints(exam), 0)

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">日次報告</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-500">本日の訪問施設</div>
          <div className="text-2xl font-bold text-gray-900">{todayPlans.length} 件</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">診察完了患者数</div>
          <div className="text-2xl font-bold text-emerald-600">{completedExams.length} 名</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">合計算定点数</div>
          <div className="text-2xl font-bold text-slate-700">{totalPoints.toLocaleString()} 点</div>
        </Card>
      </div>

      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">本日の診療一覧</span>
        </div>
        {completedExams.length === 0 ? (
          <EmptyState message="本日の診療記録はありません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">実施項目</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">合計点数</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">文書状況</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedExams.map(exam => {
                  const patient = patients.find(p => p.id === exam.patientId)
                  const plan = visitPlans.find(p => p.id === exam.visitPlanId)
                  const facility = facilities.find(f => f.id === plan?.facilityId)
                  const examPoints = calculateExamPoints(exam)
                  const docStatus = getDocumentStatus(exam, documents)
                  return (
                    <tr key={exam.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient ? getPatientName(patient) : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {exam.procedureItems && Object.keys(exam.procedureItems).length > 0
                          ? Object.keys(exam.procedureItems)
                              .map(id => PROCEDURE_ITEMS_MASTER.find(p => p.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-700">
                        {examPoints > 0 ? `${examPoints.toLocaleString()}点` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {docStatus.required === 0 ? (
                          <span className="text-xs text-gray-400">-</span>
                        ) : docStatus.completed >= docStatus.required ? (
                          <Badge variant="success">済</Badge>
                        ) : (
                          <Badge variant="warning">
                            未 ({docStatus.completed}/{docStatus.required})
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">完了</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// =============================================================================
// メインアプリケーション
// =============================================================================

/**
 * 訪問歯科アプリ メインコンポーネント
 */
export default function DentalAppMock() {
  // ページ状態
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedVisitPlan, setSelectedVisitPlan] = useState(null)
  const [selectedExamination, setSelectedExamination] = useState(null)
  const [consultationMode, setConsultationMode] = useState(null)
  // 文書作成ページ用の状態
  const [documentType, setDocumentType] = useState(null)
  const [documentData, setDocumentData] = useState(null)
  // 追加: 患者詳細用
  const [selectedPatientId, setSelectedPatientId] = useState(null)

  // データ管理
  const {clinic, updateClinic, updateQualification, hasQualification} = useClinicManager()
  const {facilities, addFacility, updateFacility, deleteFacility} = useFacilityManager()
  const {patients, addPatient, updatePatient, deletePatient} = usePatientManager()
  const {visitPlans, addVisitPlan, deleteVisitPlan} = useVisitPlanManager()
  const {examinations, getExaminationsByVisitPlan, addExamination, updateExamination, removeExamination, reorderExaminations} =
    useExaminationManager()
  const {staff, addStaff, updateStaff, deleteStaff, reorderStaff} = useStaffManager()
  const {scoringHistory} = useScoringHistoryManager()
  const {documents, addDocument} = useDocumentManager()

  // ナビゲーション
  const handleNavigate = page => {
    setCurrentPage(page)
    setSelectedVisitPlan(null)
    setSelectedExamination(null)
    setSelectedPatientId(null)
  }

  const handleSelectVisitPlan = plan => {
    setSelectedVisitPlan(plan)
    setCurrentPage('visit-detail')
  }

  const handleStartConsultation = (examinationId, mode) => {
    const exam = examinations.find(e => e.id === examinationId)
    setSelectedExamination(exam)
    setConsultationMode(mode)
    setCurrentPage('consultation')
  }

  const handleBackFromConsultation = () => {
    setSelectedExamination(null)
    setConsultationMode(null)
    setCurrentPage('visit-detail')
  }

  // 文書作成ページへの遷移
  const handleOpenDocument = (docType, data) => {
    setDocumentType(docType)
    setDocumentData({
      ...data,
      facility: currentFacility,
    })
    setCurrentPage('document-create')
  }

  // 文書作成ページからの戻り
  const handleBackFromDocument = () => {
    setDocumentType(null)
    setDocumentData(null)
    setCurrentPage('consultation')
  }

  // 患者詳細ページへの遷移
  const handleSelectPatient = patientId => {
    setSelectedPatientId(patientId)
    setCurrentPage('patient-detail')
  }

  // 患者編集ページへの遷移
  const handleEditPatient = patientId => {
    setSelectedPatientId(patientId)
    setCurrentPage('patient-edit')
  }

  // 患者情報の保存
  const handleSavePatient = updatedPatient => {
    updatePatient(updatedPatient.id, updatedPatient)
    setCurrentPage('patient-detail')
  }

  // 個別入力からの診察開始
  const handleIndividualStart = ({patientId, facilityId, doctorId, hygienistId}) => {
    // アドホックなvisitPlanを作成
    const adhocPlan = {
      facilityId,
      visitDate: formatDate(new Date(2026, 0, 18)),
      status: 'in_progress',
    }
    addVisitPlan(adhocPlan)

    // 新しいvisitPlanのIDを推測（最大ID+1）
    const newPlanId = Math.max(0, ...visitPlans.map(p => p.id)) + 1
    setSelectedVisitPlan({...adhocPlan, id: newPlanId})

    // examinationを追加
    const newExam = {
      visitPlanId: newPlanId,
      patientId,
      doctorId,
      hygienistId,
    }
    addExamination(newExam)

    // 新しいexaminationのIDを推測
    const newExamId = Math.max(0, ...examinations.map(e => e.id)) + 1
    const exam = {
      ...newExam,
      id: newExamId,
      sortOrder: 1,
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
    }
    setSelectedExamination(exam)
    setConsultationMode(doctorId ? 'doctor' : 'dh')
    setCurrentPage('consultation')
  }

  // 最終提示画面への遷移
  const handleShowFinalReview = () => {
    setCurrentPage('final-review')
  }

  // 施設の並び替え
  const handleReorderFacility = useCallback(
    (id, direction) => {
      const idx = facilities.findIndex(f => f.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= facilities.length) return
      // swap by updating both
      const swapFacility = facilities[swapIdx]
      updateFacility(id, {sortOrder: swapIdx})
      updateFacility(swapFacility.id, {sortOrder: idx})
    },
    [facilities, updateFacility]
  )

  // 現在の訪問計画に紐づく診察一覧
  const currentExaminations = selectedVisitPlan ? getExaminationsByVisitPlan(selectedVisitPlan.id) : []

  // 現在の施設
  const currentFacility = selectedVisitPlan ? facilities.find(f => f.id === selectedVisitPlan.facilityId) : null

  // 現在の患者
  const currentPatient = selectedExamination ? patients.find(p => p.id === selectedExamination.patientId) : null

  // 患者詳細用
  const detailPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null
  const detailFacility = detailPatient ? facilities.find(f => f.id === detailPatient.facilityId) : null

  // ページコンテンツのレンダリング
  const renderContent = () => {
    // 文書作成画面
    if (currentPage === 'document-create' && documentType && documentData) {
      return (
        <DocumentCreatePage
          documentType={documentType}
          documentData={documentData}
          onBack={handleBackFromDocument}
          onSave={savedDoc => {
            addDocument({
              patientId: savedDoc.patientId || currentPatient?.id,
              examinationId: savedDoc.examinationId || selectedExamination?.id,
              templateId: documentType,
              templateName: DOCUMENT_TEMPLATES[documentType]?.name || documentType,
              version: 1,
            })
          }}
        />
      )
    }

    // 最終提示画面
    if (currentPage === 'final-review' && selectedExamination) {
      return (
        <FinalReviewPage
          examination={selectedExamination}
          patient={currentPatient}
          facility={currentFacility}
          staff={staff}
          clinic={clinic}
          onBack={() => setCurrentPage('consultation')}
          onBackToSchedule={() => handleNavigate('schedule')}
        />
      )
    }

    // 診療画面
    if (currentPage === 'consultation' && selectedExamination && currentPatient) {
      return (
        <ConsultationPage
          examination={selectedExamination}
          patient={currentPatient}
          staff={staff}
          clinic={clinic}
          hasQualification={hasQualification}
          consultationMode={consultationMode}
          onBack={handleBackFromConsultation}
          onUpdate={updateExamination}
          onOpenDocument={handleOpenDocument}
          onShowFinalReview={handleShowFinalReview}
        />
      )
    }

    // 訪問計画詳細画面
    if (currentPage === 'visit-detail' && selectedVisitPlan && currentFacility) {
      return (
        <VisitPlanDetailPage
          visitPlan={selectedVisitPlan}
          facility={currentFacility}
          patients={patients}
          examinations={currentExaminations}
          staff={staff}
          onBack={() => handleNavigate('schedule')}
          onAddExamination={addExamination}
          onUpdateExamination={updateExamination}
          onRemoveExamination={removeExamination}
          onReorderExaminations={reorderExaminations}
          onStartConsultation={handleStartConsultation}
        />
      )
    }

    // 患者編集画面
    if (currentPage === 'patient-edit' && detailPatient) {
      return (
        <PatientEditPage patient={detailPatient} onSave={handleSavePatient} onBack={() => setCurrentPage('patient-detail')} />
      )
    }

    // 患者詳細画面
    if (currentPage === 'patient-detail' && detailPatient) {
      return (
        <PatientDetailPage
          patient={detailPatient}
          facility={detailFacility}
          examinations={examinations}
          scoringHistory={scoringHistory}
          documents={documents}
          onBack={() => handleNavigate('admin-patients')}
          onEdit={() => handleEditPatient(detailPatient.id)}
        />
      )
    }

    // その他のページ
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} visitPlans={visitPlans} examinations={examinations} />
      case 'schedule':
        return (
          <SchedulePage
            facilities={facilities}
            visitPlans={visitPlans}
            onAddPlan={addVisitPlan}
            onSelectPlan={handleSelectVisitPlan}
          />
        )
      case 'individual-input':
        return (
          <IndividualInputPage
            facilities={facilities}
            patients={patients}
            staff={staff}
            onStartConsultation={handleIndividualStart}
          />
        )
      case 'admin-clinic':
        return <ClinicSettingsPage clinic={clinic} onUpdateClinic={updateClinic} onUpdateQualification={updateQualification} />
      case 'admin-facilities':
        return (
          <FacilityMasterPage
            facilities={facilities}
            onAdd={addFacility}
            onUpdate={updateFacility}
            onDelete={deleteFacility}
            onReorder={handleReorderFacility}
          />
        )
      case 'admin-patients':
        return (
          <PatientMasterPage
            facilities={facilities}
            patients={patients}
            onAdd={addPatient}
            onUpdate={updatePatient}
            onDelete={deletePatient}
            onSelectPatient={handleSelectPatient}
            onEditPatient={handleEditPatient}
          />
        )
      case 'admin-staff':
        return (
          <StaffMasterPage
            staff={staff}
            onAdd={addStaff}
            onUpdate={updateStaff}
            onDelete={deleteStaff}
            onReorder={reorderStaff}
          />
        )
      case 'admin-templates':
        return <TemplateMasterPage />
      case 'facility-portal':
        return <FacilityPortalPage facility={facilities[0]} patients={patients} onUpdatePatient={updatePatient} />
      case 'scoring-reference':
        return <ScoringReferencePage />
      case 'scoring-ledger':
        return <ScoringLedgerPage patients={patients} facilities={facilities} scoringHistory={scoringHistory} />
      case 'document-list':
        return <DocumentListPage documents={documents} patients={patients} />
      case 'batch-print':
        return (
          <BatchPrintPage
            facilities={facilities}
            examinations={examinations}
            patients={patients}
            visitPlans={visitPlans}
            documents={documents}
          />
        )
      case 'summary':
        return (
          <SummaryPage
            visitPlans={visitPlans}
            examinations={examinations}
            patients={patients}
            facilities={facilities}
            documents={documents}
          />
        )
      default:
        return <DashboardPage onNavigate={handleNavigate} visitPlans={visitPlans} examinations={examinations} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
