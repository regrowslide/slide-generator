import type {
  EvalContext,
  ProcedureItemMaster,
  DocumentTemplate,
  ScoringSection,
  ProcedureRevision,
  TreatmentCategory,
  ClinicQualificationMaster,
  PatientDiseaseMaster,
  AssessmentOptions,
  Assessment,
  Vital,
} from './types'

/** 施設タイプ */
export const FACILITY_TYPES = {
  NURSING_HOME: '特別養護老人ホーム',
  GROUP_HOME: 'グループホーム',
  RESIDENTIAL: '居宅',
} as const

/** スタッフの役割 */
export const STAFF_ROLES = {
  DOCTOR: 'doctor',
  HYGIENIST: 'hygienist',
} as const

/** 診察ステータス */
export const EXAMINATION_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const

/** デフォルトアセスメントデータ */
export const DEFAULT_ASSESSMENT: Assessment = {
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

/** 在歯管算定対象治療リスト */
export const ZAISHIKAN_TARGET_TREATMENTS: TreatmentCategory[] = [
  {
    category: 'う蝕治療',
    items: [
      'う蝕処置（むし歯を削る、薬を詰める・サホライド塗布）',
      '充填処置（レジン、アイオノマー充填）',
      '知覚過敏処置',
      '根管治療',
      '補綴物セット',
    ],
  },
  {category: '歯周治療', items: ['スケーリング', '歯周ポケットへの薬剤注入', '歯周病検査', 'SPT', 'P重防']},
  {
    category: '義歯関係',
    items: [
      '義歯調整（入れ歯が当たって痛い箇所の削合）',
      '義歯床裏装（合わなくなった入れ歯の裏打ち・リライニング）',
      '義歯修理（割れた入れ歯や外れたクラスプの修理）',
      '新製（新しい入れ歯の型取り、噛み合わせ、試適）',
      '義歯指導（着脱の練習や清掃の実施）',
    ],
  },
  {
    category: 'その他主なもの',
    items: [
      '抜歯',
      '抜歯後の処置（消毒、抜糸）',
      '口内炎の治療（軟膏塗布、レーザー照射など）',
      '口腔カンジダ症の治療（抗真菌薬の投与・清拭）',
    ],
  },
]

/** 医院資格マスタ（届出・施設基準） */
export const CLINIC_QUALIFICATIONS: ClinicQualificationMaster[] = [
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

/** 患者疾患マスタ（基礎疾患チェックリスト） */
export const PATIENT_DISEASES: PatientDiseaseMaster[] = [
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
  {id: 'diabetes', name: '糖尿病'},
]

/** アセスメント選択肢マスタ */
export const ASSESSMENT_OPTIONS: AssessmentOptions = {
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

/** 実施項目マスタ（加算用） - CSV「算定一覧基準表」に基づく新構造版 */
export const PROCEDURE_ITEMS_MASTER: ProcedureItemMaster[] = [
  // === 歯科訪問診療料（歯訪） ===
  {
    id: 'shihou',
    name: '歯訪',
    fullName: '歯科訪問診療料',
    selectionMode: 'single',
    infoText: 'Drの診療ありの場合に算定。タイマー時間（20分以上/未満）と同一建物内の患者数で区分が自動判定されます。',
    subItems: [
      {
        id: 'shihou-1-20over',
        name: '歯訪 1(20分以上)',
        points: 1100,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で1人のみ診療',
        infoText: '「同一日かつ同一施設」の中で1人のみ診療した場合の点数。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.drSeconds >= 1200 && ctx.sameDayCount === 1,
      },
      {
        id: 'shihou-2-20over',
        name: '歯訪 2(20分以上)',
        points: 410,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で2～3人を診療',
        infoText: '「同一日かつ同一施設」の中で2～3人を診療した場合の点数。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.drSeconds >= 1200 && ctx.sameDayCount >= 2 && ctx.sameDayCount <= 3,
      },
      {
        id: 'shihou-3-20over',
        name: '歯訪 3(20分以上)',
        points: 310,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で4～9人を診療',
        infoText: '「同一日かつ同一施設」の中で4~9人のみ診療した場合の点数。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.drSeconds >= 1200 && ctx.sameDayCount >= 4 && ctx.sameDayCount <= 9,
      },
      {
        id: 'shihou-4-20over',
        name: '歯訪 4(20分以上)',
        points: 160,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で10～19人を診療',
        infoText: '「同一日かつ同一施設」の中で10~19人を診療した場合の点数。',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.drSeconds >= 1200 && ctx.sameDayCount >= 10 && ctx.sameDayCount <= 19,
      },
      {
        id: 'shihou-5-20over',
        name: '歯訪 5(20分以上)',
        points: 95,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で20人以上を診療',
        infoText: '「同一日かつ同一施設」の中で20人以上を診療した場合の点数。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.drSeconds >= 1200 && ctx.sameDayCount >= 20,
      },
      {
        id: 'shihou-1-20under',
        name: '歯訪 1(20分未満)',
        points: 1100,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で1人のみ診療',
        infoText: '「同一日かつ同一施設」の中で1人のみ診療した場合の点数。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.drSeconds > 0 && ctx.drSeconds < 1200 && ctx.sameDayCount === 1,
      },
      {
        id: 'shihou-2-20under',
        name: '歯訪 2(20分未満)',
        points: 287,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で2～3人を診療',
        infoText: '「同一日かつ同一施設」の中で2～3人を診療した場合の点数。',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.drSeconds > 0 && ctx.drSeconds < 1200 && ctx.sameDayCount >= 2 && ctx.sameDayCount <= 3,
      },
      {
        id: 'shihou-3-20under',
        name: '歯訪 3(20分未満)',
        points: 217,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で4～9人を診療',
        infoText: '「同一日かつ同一施設」の中で4~9人のみ診療した場合の点数。',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.drSeconds > 0 && ctx.drSeconds < 1200 && ctx.sameDayCount >= 4 && ctx.sameDayCount <= 9,
      },
      {
        id: 'shihou-4-20under',
        name: '歯訪 4(20分未満)',
        points: 96,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で10～19人を診療',
        infoText: '「同一日かつ同一施設」の中で10~19人を診療した場合の点数。',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.drSeconds > 0 && ctx.drSeconds < 1200 && ctx.sameDayCount >= 10 && ctx.sameDayCount <= 19,
      },
      {
        id: 'shihou-5-20under',
        name: '歯訪 5(20分未満)',
        points: 57,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で20人以上を診療',
        infoText: '「同一日かつ同一施設」の中で20人以上を診療した場合の点数。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.drSeconds > 0 && ctx.drSeconds < 1200 && ctx.sameDayCount >= 20,
      },
    ],
  },
  // === ベースアップ加算 ===
  {
    id: 'baseup',
    name: 'ベースアップ加算',
    fullName: 'ベースアップ評価料',
    selectionMode: 'single',
    infoText: '医院マスターで「ベースアップ評価料」にチェックが入っている場合に算定可能。',
    subItems: [
      {
        id: 'baseup-1',
        name: '1人',
        points: 41,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: 'baseup',
        conditionLabel: 'ベースアップ届出あり＋同一日同一施設1人',
        infoText: '',
        evaluate: (ctx: EvalContext) => ctx.clinic.qualifications.baseup && ctx.sameDayCount === 1,
      },
      {
        id: 'baseup-2plus',
        name: '2人以上',
        points: 10,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: 'baseup',
        conditionLabel: 'ベースアップ届出あり＋同一日同一施設2人以上',
        infoText: '',
        evaluate: (ctx: EvalContext) => ctx.clinic.qualifications.baseup && ctx.sameDayCount >= 2,
      },
    ],
  },
  // === 歯科訪問診療補助加算（訪補助） ===
  {
    id: 'houhojo',
    name: '訪補助',
    fullName: '歯科訪問診療補助加算',
    selectionMode: 'single',
    infoText: 'DR・DH両方の参加が必要。カルテに同行衛生士名の記載が必要です。',
    subItems: [
      {
        id: 'houhojo-1',
        name: '1人',
        points: 115,
        isManualOnly: false,
        requiredRole: 'both',
        requiredQualification: null,
        conditionLabel: '同一日かつ同一施設で1人のみ診療',
        infoText: '',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.hasHygienist && ctx.sameDayCount === 1,
      },
      {
        id: 'houhojo-multi-koukan',
        name: '2人以上 / 口管強あり',
        points: 50,
        isManualOnly: false,
        requiredRole: 'both',
        requiredQualification: 'koukukan',
        conditionLabel: '口管強の届出あり＋2人以上',
        infoText: '',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.hasHygienist && ctx.sameDayCount >= 2 && ctx.clinic.qualifications.koukukan,
      },
      {
        id: 'houhojo-multi-normal',
        name: '2人以上 / 口管強なし',
        points: 30,
        isManualOnly: false,
        requiredRole: 'both',
        requiredQualification: null,
        conditionLabel: '口管強の届出なし＋2人以上',
        infoText: '',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.hasHygienist && ctx.sameDayCount >= 2 && !ctx.clinic.qualifications.koukukan,
      },
    ],
  },
  // === 歯科疾患在宅療養管理料（歯在管） ===
  {
    id: 'shizaikan',
    name: '歯在管',
    fullName: '歯科疾患在宅療養管理料',
    selectionMode: 'single',
    infoText: '月1回算定。Drの診療時に算定を提案。歯援診の届出区分により点数が異なります。管理計画はカルテに記入する。',
    subItems: [
      {
        id: 'shizaikan-shiensin1',
        name: '歯援診1',
        points: 340,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: 'shiensin1',
        conditionLabel: '歯援診1の届出あり＋月初回',
        infoText: '管理計画はカルテに記入する',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && ctx.clinic.qualifications.shiensin1,
      },
      {
        id: 'shizaikan-shiensin2',
        name: '歯援診2',
        points: 230,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: 'shiensin2',
        conditionLabel: '歯援診2の届出あり＋月初回',
        infoText: '',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && ctx.clinic.qualifications.shiensin2 && !ctx.clinic.qualifications.shiensin1,
      },
      {
        id: 'shizaikan-other',
        name: '歯援診なし / その他',
        points: 200,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '歯援診の届出なし＋月初回',
        infoText: '',
        evaluate: (ctx: EvalContext) =>
          ctx.hasDoctor && !ctx.clinic.qualifications.shiensin1 && !ctx.clinic.qualifications.shiensin2,
      },
    ],
  },
  // === 歯在管文書提供加算 ===
  {
    id: 'shizaikan_bunsho',
    name: '歯在管文書提供加算',
    fullName: '文書提供加算（在宅・訪問関連）',
    selectionMode: 'single',
    infoText:
      '歯在管を算定して、患者さんや家族へ、管理計画の内容を文章にして提供した場合に算定できる点数。文章提供するかしないかは医院によって違うので、歯在管を算定するから必ず算定するものではない。算定した場合は管理計画書を作成して施設からご家族さんに渡してもらう。',
    subItems: [
      {
        id: 'shizaikan-bunsho-main',
        name: '文',
        points: 10,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: '歯在管とセットで算定＋月初回',
        infoText: '歯在管を算定して、患者さんや家族へ、管理計画の内容を文章にして提供した場合に算定できる点数。',
        evaluate: (ctx: EvalContext) => !!ctx.currentItems?.shizaikan,
      },
    ],
  },
  // === 在宅患者歯科治療総合医療管理料（在歯管） ===
  {
    id: 'zaishikan',
    name: '在歯管',
    fullName: '在宅患者歯科治療総合医療管理料',
    selectionMode: 'single',
    infoText:
      '以下の3条件に全て当てはまるときに算定可能。\n1. 医院マスターに在歯管の届出にチェックが入っている。\n2. 患者さんマスターの中で、基礎疾患に一個でもチェックが入っている。\n3. その日にDrの診療があり、該当する診療を行った場合。',
    note: '算定項目の入力欄の横に「対象の治療」ボタンを表示。条件1と2が揃っている時にはボタンをハイライト。',
    subItems: [
      {
        id: 'zaishikan-main',
        name: '在歯管',
        points: 45,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: 'zahoshin',
        conditionLabel: '医院届出+患者疾患+該当治療の3条件',
        infoText: '「対象の治療」ボタンから、在歯管の算定対象治療を選択してください。',
        evaluate: (ctx: EvalContext) => {
          const hasClinicRegistration = ctx.clinic.qualifications.zahoshin
          const hasDisease = Object.values(ctx.patient.diseases || {}).some(v => v)
          const hasTreatment = (ctx.treatmentPerformed || []).length > 0
          return hasClinicRegistration && hasDisease && hasTreatment
        },
      },
    ],
  },
  // === 訪問歯科衛生指導料（訪衛指） ===
  {
    id: 'houeishi',
    name: '訪衛指',
    fullName: '訪問歯科衛生指導料',
    selectionMode: 'single',
    infoText:
      'DHがDrと一緒、または単独で、その利用者さんに対して20分以上の診療を行った場合に算定。その施設で、1月に何人見たかで点数が変わる。',
    note: '20分未満で算定しようとしたときは「在口衛の算定をしますか？」のコメントを表示。',
    subItems: [
      {
        id: 'houeishi-1',
        name: '同月内1人',
        points: 362,
        isManualOnly: false,
        requiredRole: 'hygienist',
        requiredQualification: null,
        conditionLabel: 'DH20分以上＋同月その施設で1人',
        infoText: '',
        evaluate: (ctx: EvalContext) => ctx.hasHygienist && ctx.dhSeconds >= 1200 && ctx.sameMonthCount === 1,
      },
      {
        id: 'houeishi-2-9',
        name: '同月内2〜9人',
        points: 326,
        isManualOnly: false,
        requiredRole: 'hygienist',
        requiredQualification: null,
        conditionLabel: 'DH20分以上＋同月その施設で2～9人',
        infoText: '20分未満で算定しようとしたときは、在口衛の算定をしますか？のコメント',
        evaluate: (ctx: EvalContext) =>
          ctx.hasHygienist && ctx.dhSeconds >= 1200 && ctx.sameMonthCount >= 2 && ctx.sameMonthCount <= 9,
      },
      {
        id: 'houeishi-10plus',
        name: '同月内10人以上',
        points: 295,
        isManualOnly: false,
        requiredRole: 'hygienist',
        requiredQualification: null,
        conditionLabel: 'DH20分以上＋同月その施設で10人以上',
        infoText: '',
        evaluate: (ctx: EvalContext) => ctx.hasHygienist && ctx.dhSeconds >= 1200 && ctx.sameMonthCount >= 10,
      },
    ],
  },
  // === 在宅等療養患者専門的口腔衛生処置（在口衛） ===
  {
    id: 'zaikouei',
    name: '在口衛',
    fullName: '在宅等療養患者専門的口腔衛生処置',
    selectionMode: 'single',
    infoText: '月1回のみ算定可能。Dr同席必須。訪衛指とっている場合はNG。SPT、P重防、訪問口腔リハを算定した日以降は算定できない。',
    subItems: [
      {
        id: 'zaikouei-main',
        name: '在口衛',
        points: 130,
        isManualOnly: true,
        requiredRole: 'both',
        requiredQualification: null,
        conditionLabel: '手動入力のみ',
        infoText: '',
        evaluate: () => false,
      },
    ],
  },
  // === 在宅歯科栄養サポートチーム等連携指導料（NST2） ===
  {
    id: 'nst2',
    name: 'NST2',
    fullName: '在宅歯科栄養サポートチーム等連携指導料',
    selectionMode: 'single',
    infoText:
      '一度入力したら毎月算定するもの。Drの月初めの診療の時に標準でチェックが入ると良い。2か月に1度は多職種会議に参加する事。口腔機能低下などにかかわることに対して、訪問している利用者さん全員分のコメントを行う事。',
    subItems: [
      {
        id: 'nst2-main',
        name: 'NST2',
        points: 100,
        isManualOnly: false,
        requiredRole: null,
        requiredQualification: null,
        conditionLabel: '手動入力のみ（過去実績あれば初期チェック）',
        infoText: '同一患者で過去に入力がある場合、月初めの診療時に自動チェック。',
        evaluate: (ctx: EvalContext) => ctx.pastClaims.some(p => p.claimedItems.includes('nst2')),
      },
    ],
  },
  // === 口腔機能低下症（検査） ===
  {
    id: 'koukuu_kensa',
    name: '口腔機能低下症（検査）',
    fullName: '口腔機能低下症に係る検査',
    selectionMode: 'multiple',
    infoText: '3ヶ月毎に1回算定可能。口腔機能管理計画書を立てて、カルテに保存する必要がある。管理計画見直しは半年に1回は必要。',
    note: '一度算定したら「次回の算定はMM月になります」とメッセージを表示。',
    subItems: [
      {
        id: 'koukuu_kensa_zetsuatsu',
        name: '舌圧',
        points: 140,
        isManualOnly: true,
        requiredRole: null,
        requiredQualification: null,
        conditionLabel: '3ヶ月毎に1回',
        infoText: '一度算定したら「次回の算定はMM月になります」とメッセージを表示。',
        evaluate: () => false,
      },
      {
        id: 'koukuu_kensa_kougouatsu',
        name: '咬合圧 1',
        points: 130,
        isManualOnly: true,
        requiredRole: null,
        requiredQualification: null,
        conditionLabel: '3ヶ月毎に1回・届出必要',
        infoText: '一度算定したら「次回の算定はMM月になります」とメッセージを表示。',
        evaluate: () => false,
      },
      {
        id: 'koukuu_kensa_koukin',
        name: '口菌検2',
        points: 65,
        isManualOnly: true,
        requiredRole: null,
        requiredQualification: null,
        conditionLabel: '3ヶ月毎に1回・届出必要',
        infoText:
          '口腔機能低下症の判定のための口菌検は2番の方。1番：130点は口腔バイオフィルム感染症の診断をするときの点数。一度算定したら「次回の算定はMM月になります」とメッセージを表示。',
        evaluate: () => false,
      },
      {
        id: 'koukuu_kensa_soshaku',
        name: '咀嚼 1',
        points: 140,
        isManualOnly: true,
        requiredRole: null,
        requiredQualification: null,
        conditionLabel: '3ヶ月毎に1回・届出必要',
        infoText: '一度算定したら「次回の算定はMM月になります」とメッセージを表示。',
        evaluate: () => false,
      },
    ],
  },
  // === 歯科口腔リハビリテーション料３（歯リハ3） ===
  {
    id: 'shiriha3',
    name: '歯リハ3',
    fullName: '歯科口腔リハビリテーション料３',
    selectionMode: 'multiple',
    infoText: 'Drの診療必須。月に2回まで算定可能。口腔機能精密検査記録用紙に記入があった場合に算定。訪衛指のみでは算定不可。',
    note: 'Drの診療があった場合、月に2回まで算定可能なため、1度算定したらその後は「1/2回目算定しますか？」「2/2回目算定しますか？」とコメント。',
    monthlyLimit: 2,
    subItems: [
      {
        id: 'shiriha3-main',
        name: '歯リハ3',
        points: 60,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: null,
        conditionLabel: 'Dr診療あり＋記録用紙記入あり＋月2回まで',
        infoText:
          'Drの診療があった場合、月に2回まで算定可能なため、1度算定したらその後は「1/2回目算定しますか？」「2/2回目算定しますか？」とコメント。',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && !!ctx.oralFunctionRecord,
      },
      {
        id: 'shiriha3-koukan',
        name: '口管強届出あり',
        points: 50,
        isManualOnly: false,
        requiredRole: 'doctor',
        requiredQualification: 'koukukan',
        conditionLabel: '口管強の届出があれば＋50点',
        infoText: '',
        evaluate: (ctx: EvalContext) => ctx.hasDoctor && !!ctx.oralFunctionRecord && ctx.clinic.qualifications.koukukan,
      },
    ],
  },
]

/** 提供文書テンプレート定義 */
export const DOCUMENT_TEMPLATES: Record<string, DocumentTemplate> = {
  doc_houmon_chiryou: {
    id: 'doc_houmon_chiryou',
    name: '訪問歯科診療治療内容説明書',
    fullName: '訪問歯科診療治療内容説明書',
    relatedProcedure: 'shihou',
    monthlyLimit: 0,
    fields: {
      auto: ['clinicName', 'clinicAddress', 'clinicPhone', 'doctorName', 'patientName', 'visitDate', 'drStartTime', 'drEndTime'],
      manual: ['treatmentChecks', 'contactNotes', 'careNotes'],
    },
  },
  doc_kanrikeikaku: {
    id: 'doc_kanrikeikaku',
    name: '歯在管管理計画書',
    fullName: '歯在管管理計画書',
    relatedProcedure: 'shizaikan',
    monthlyLimit: 1,
    referenceUrl: 'https://www.houmonshika.org/dental/labo9/',
    fields: {
      auto: [
        'clinicName',
        'doctorName',
        'patientName',
        'patientNameKana',
        'diseases',
        'medications',
        'assessment',
        'oralFindings',
        'oralFunctionRecord',
      ],
      manual: ['cleaningStatus', 'oralDryness', 'periodontalStatus', 'dentureStatus', 'oralFunctionStatus', 'managementPolicy'],
    },
  },
  doc_houeishi: {
    id: 'doc_houeishi',
    name: '訪問歯科衛生指導説明書',
    fullName: '訪問歯科衛生指導説明書',
    relatedProcedure: 'houeishi',
    monthlyLimit: 4,
    dhMinutesRequired: 20,
    referenceUrl: 'https://gerodontology.dental-plaza.com/guide_02-5/',
    fields: {
      auto: ['clinicName', 'clinicAddress', 'clinicPhone', 'patientName', 'facilityName', 'dhStartTime', 'dhEndTime'],
      manual: ['oralCondition', 'cleaningGuidance', 'dentureGuidance', 'careNotes'],
    },
  },
  doc_seimitsu_kensa: {
    id: 'doc_seimitsu_kensa',
    name: '口腔機能精密検査表',
    fullName: '口腔機能精密検査表',
    relatedProcedure: 'koukuu_kensa',
    monthlyLimit: 0,
    fields: {
      auto: ['clinicName', 'patientName', 'patientNameKana', 'birthDate', 'age', 'gender', 'oralFunctionRecord'],
      manual: ['measureDate'],
    },
  },
  doc_kouei_kanri: {
    id: 'doc_kouei_kanri',
    name: '口腔衛生管理加算',
    fullName: '口腔衛生管理加算',
    relatedProcedure: '',
    monthlyLimit: 0,
    fields: {
      auto: ['patientName', 'patientNameKana', 'birthDate', 'gender', 'careLevel', 'diseases', 'assessment'],
      manual: ['oralHealthAssessment', 'managementContent', 'implementationRecords'],
    },
  },
  doc_koukuu_kanri: {
    id: 'doc_koukuu_kanri',
    name: '口腔機能管理計画書',
    fullName: '口腔機能管理計画書',
    relatedProcedure: 'koukuu_kensa',
    monthlyLimit: 0,
    fields: {
      auto: [
        'clinicName',
        'patientName',
        'patientNameKana',
        'age',
        'gender',
        'diseases',
        'medications',
        'assessment',
        'oralFunctionRecord',
      ],
      manual: ['bodyCondition', 'oralFunctionPlan', 'managementGoal', 'reevaluation'],
    },
  },
}

/** 算定項目カテゴリ分類（算定項目・点数一覧ページ用） */
export const SCORING_SECTIONS: ScoringSection[] = [
  {id: 'shihou', label: '歯訪系', items: ['shihou', 'baseup', 'houhojo']},
  {id: 'kanri', label: '管理系', items: ['shizaikan', 'shizaikan_bunsho', 'zaishikan']},
  {id: 'houeishi', label: '訪衛指系', items: ['houeishi', 'zaikouei', 'nst2']},
  {id: 'kensa', label: '口腔機能検査系', items: ['koukuu_kensa', 'shiriha3']},
]

/** 改定版マスタ（期間別） - 診察日に応じて適用する算定基準を切り替え可能にする */
export const PROCEDURE_REVISIONS: ProcedureRevision[] = [
  {
    id: 'rev-2026',
    name: '令和8年改定',
    from: '2026-01-01',
    to: null,
    master: PROCEDURE_ITEMS_MASTER,
    scoringSections: SCORING_SECTIONS,
  },
]

/** 診察日に対応する改定版を取得 */
export const getRevisionForDate = (dateStr: string): ProcedureRevision => {
  return (
    PROCEDURE_REVISIONS.find(rev => {
      if (dateStr < rev.from) return false
      if (rev.to && dateStr > rev.to) return false
      return true
    }) || PROCEDURE_REVISIONS[PROCEDURE_REVISIONS.length - 1]
  )
}

/** 診察日に対応するマスター配列を取得 */
export const getProcedureMaster = (dateStr: string): ProcedureItemMaster[] => getRevisionForDate(dateStr).master

/** 診察日に対応するSCORING_SECTIONSを取得 */
export const getScoringSections = (dateStr: string): ScoringSection[] => getRevisionForDate(dateStr).scoringSections

/** マスターからIDで項目を検索 */
export const findMasterById = (master: ProcedureItemMaster[], masterId: string): ProcedureItemMaster | undefined =>
  master.find(i => i.id === masterId)

/** バイタルデータの初期値 */
export const INITIAL_VITAL: Vital = {
  bloodPressureHigh: '',
  bloodPressureLow: '',
  pulse: '',
  spo2: '',
  temperature: '',
  measuredAt: '',
}
