import 'dotenv/config'
import {PrismaClient} from '@prisma/generated/prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({adapter})

const main = async () => {
  console.log('Seeding dental data...')

  // クリニック作成
  const clinic = await prisma.dentalClinic.create({
    data: {
      name: '〇〇歯科クリニック',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      representative: '院長 山田太郎',
      qualifications: {
        shiensin1: true,
        shiensin2: false,
        zahoshin: true,
        koukukan: true,
        johorenkei: true,
        dx: true,
        baseup: true,
        electronicPrescription: false,
        other: false,
        otherText: '',
      },
    },
  })
  console.log(`  クリニック作成: ${clinic.name}`)

  // 施設作成
  const facilities = await Promise.all([
    prisma.dentalFacility.create({
      data: {dentalClinicId: clinic.id, name: 'ひまわりケアホーム', address: '東京都世田谷区北沢2-1-1', facilityType: 'NURSING_HOME', sortOrder: 1},
    }),
    prisma.dentalFacility.create({
      data: {dentalClinicId: clinic.id, name: 'グループホーム さくら', address: '東京都杉並区高円寺北3-2-5', facilityType: 'GROUP_HOME', sortOrder: 2},
    }),
    prisma.dentalFacility.create({
      data: {dentalClinicId: clinic.id, name: '特別養護老人ホーム 松風', address: '東京都練馬区光が丘1-8-3', facilityType: 'NURSING_HOME', sortOrder: 3},
    }),
  ])
  console.log(`  施設作成: ${facilities.length}件`)

  // デフォルト疾患
  const noDiseases = {
    dementia: false, hypertension: false, cerebrovascular: false, mentalDisorder: false,
    parkinsons: false, heartFailure: false, terminalCancer: false, senility: false,
    femurFracture: false, spinalStenosis: false, als: false, cerebellarDegeneration: false,
    multipleSclerosis: false, disuseSyndrome: false, diabetes: false,
  }

  // デフォルトアセスメント
  const defaultAssessment = {
    height: '', weight: '', bmi: '',
    aspirationPneumoniaHistory: '無し', aspirationPneumoniaDate: '',
    aspirationPneumoniaRepeat: false, aspirationPneumoniaRepeatDate: '',
    seatRetention: '', oralCleaning: '', moistureRetention: '', gargling: '',
    malnutritionRisk: '', choking: '', oralIntake: '', artificialNutrition: '無し',
    moisture: '', mainDish: '', sideDish: '', swallowing: '', medicationSwallowing: '',
    medications: [{name: ''}, {name: ''}, {name: ''}], medicationImages: [],
    hasInfoShareFee: false, infoShareFeeLastDate: '',
    hasComprehensiveManagement: false, comprehensiveManagementLastDate: '',
  }

  // 患者データ
  const patientsData = [
    {
      dentalFacilityId: facilities[0].id, lastName: '山田', firstName: '太郎',
      lastNameKana: 'ヤマダ', firstNameKana: 'タロウ', gender: 'male',
      birthDate: new Date('1943-05-15'), careLevel: '要介護3',
      building: '本館', floor: '2F', room: '201',
      notes: '嚥下機能低下気味。義歯調整要。',
      diseases: {...noDiseases, hypertension: true},
      teethCount: 18, hasDenture: true, hasOralHypofunction: true,
      assessment: {
        ...defaultAssessment, height: '165', weight: '58', bmi: '21.3',
        seatRetention: 'やや不良', oralCleaning: '声がけのみ必要',
        moistureRetention: '困難', gargling: '困難', malnutritionRisk: '少しあり',
        choking: '液体で時々', oralIntake: '全て経口摂取', moisture: 'トロミあり',
        mainDish: 'お粥', sideDish: '刻み食', swallowing: '時々むせることがある',
        medicationSwallowing: '問題なし',
      },
    },
    {
      dentalFacilityId: facilities[0].id, lastName: '鈴木', firstName: '花子',
      lastNameKana: 'スズキ', firstNameKana: 'ハナコ', gender: 'female',
      birthDate: new Date('1940-11-20'), careLevel: '要介護4',
      building: '本館', floor: '2F', room: '202',
      notes: '認知症あり。拒否時は無理せず。',
      diseases: {...noDiseases, dementia: true, hypertension: true},
      teethCount: 12, hasDenture: true, hasOralHypofunction: true,
      assessment: {
        ...defaultAssessment, height: '150', weight: '45', bmi: '20.0',
        seatRetention: '不良', oralCleaning: '全介助が必要',
        moistureRetention: '不可能(むせる)', gargling: '不可能（むせる）',
        malnutritionRisk: 'リスク高め', choking: '頻繁にある',
        oralIntake: '一部経口摂取', artificialNutrition: '胃瘻',
        moisture: '経口摂取禁止', mainDish: 'ミキサー食', sideDish: 'ミキサー食',
        swallowing: '頻繁にむせてしまう', medicationSwallowing: '上手く飲み込めない',
      },
    },
    {
      dentalFacilityId: facilities[0].id, lastName: '高橋', firstName: '健一',
      lastNameKana: 'タカハシ', firstNameKana: 'ケンイチ', gender: 'male',
      birthDate: new Date('1948-03-10'), careLevel: '要介護2',
      building: '本館', floor: '2F', room: '203', notes: '',
      diseases: {...noDiseases, heartFailure: true},
      teethCount: 24, hasDenture: false, hasOralHypofunction: false,
      assessment: defaultAssessment,
    },
    {
      dentalFacilityId: facilities[0].id, lastName: '田中', firstName: '幸子',
      lastNameKana: 'タナカ', firstNameKana: 'サチコ', gender: 'female',
      birthDate: new Date('1945-07-22'), careLevel: '要介護2',
      building: '本館', floor: '2F', room: '205', notes: '家族立ち会い希望あり',
      diseases: {...noDiseases, cerebrovascular: true},
      teethCount: 20, hasDenture: false, hasOralHypofunction: false,
      assessment: defaultAssessment,
    },
    {
      dentalFacilityId: facilities[0].id, lastName: '伊藤', firstName: '博文',
      lastNameKana: 'イトウ', firstNameKana: 'ヒロフミ', gender: 'male',
      birthDate: new Date('1938-01-05'), careLevel: '要介護5',
      building: '本館', floor: '3F', room: '301', notes: '入れ歯紛失注意',
      diseases: {...noDiseases, hypertension: true, parkinsons: true, senility: true, disuseSyndrome: true},
      teethCount: 8, hasDenture: true, hasOralHypofunction: true,
      assessment: {
        ...defaultAssessment, height: '160', weight: '50', bmi: '19.5',
        aspirationPneumoniaHistory: 'あり', aspirationPneumoniaDate: '2025-06-15',
        seatRetention: '不良', oralCleaning: '全介助が必要',
        moistureRetention: '不可能(むせる)', gargling: '不可能（むせる）',
        malnutritionRisk: 'リスク高め', choking: '頻繁にある',
        oralIntake: '一部経口摂取', moisture: 'トロミあり',
        mainDish: 'ミキサー食', sideDish: 'ミキサー食',
        swallowing: '頻繁にむせてしまう', medicationSwallowing: '上手く飲み込めない',
      },
    },
    {
      dentalFacilityId: facilities[1].id, lastName: '佐藤', firstName: '美咲',
      lastNameKana: 'サトウ', firstNameKana: 'ミサキ', gender: 'female',
      birthDate: new Date('1950-09-12'), careLevel: '要介護1',
      building: 'A棟', floor: '1F', room: '101', notes: '',
      diseases: noDiseases,
      teethCount: 22, hasDenture: false, hasOralHypofunction: false,
      assessment: defaultAssessment,
    },
    {
      dentalFacilityId: facilities[1].id, lastName: '渡辺', firstName: '次郎',
      lastNameKana: 'ワタナベ', firstNameKana: 'ジロウ', gender: 'male',
      birthDate: new Date('1942-12-01'), careLevel: '要介護3',
      building: 'A棟', floor: '1F', room: '102', notes: '車椅子使用',
      diseases: {...noDiseases, hypertension: true, heartFailure: true},
      teethCount: 15, hasDenture: true, hasOralHypofunction: true,
      assessment: {
        ...defaultAssessment, height: '170', weight: '62', bmi: '21.5',
        seatRetention: 'やや不良', oralCleaning: '一部お手伝いが必要',
        moistureRetention: '困難', gargling: '困難', malnutritionRisk: '少しあり',
        choking: '液体で時々', oralIntake: '全て経口摂取', moisture: 'トロミなし',
        mainDish: '常食', sideDish: 'ひと口大', swallowing: '時々むせることがある',
        medicationSwallowing: '苦手',
      },
    },
    {
      dentalFacilityId: facilities[0].id, lastName: '木村', firstName: '糖子',
      lastNameKana: 'キムラ', firstNameKana: 'トウコ', gender: 'female',
      birthDate: new Date('1944-04-10'), careLevel: '要介護3',
      building: '本館', floor: '3F', room: '305', notes: '糖尿病管理中。血糖値チェック要。',
      diseases: {...noDiseases, hypertension: true, diabetes: true},
      teethCount: 16, hasDenture: true, hasOralHypofunction: true,
      assessment: {
        ...defaultAssessment, height: '155', weight: '52', bmi: '21.6',
        seatRetention: 'やや不良', oralCleaning: '声がけのみ必要',
        moistureRetention: '困難', gargling: '困難', malnutritionRisk: '少しあり',
        choking: '液体で時々', oralIntake: '全て経口摂取', moisture: 'トロミあり',
        mainDish: 'お粥', sideDish: '刻み食', swallowing: '時々むせることがある',
        medicationSwallowing: '苦手',
      },
    },
    {
      dentalFacilityId: facilities[2].id, lastName: '中島', firstName: '一人',
      lastNameKana: 'ナカジマ', firstNameKana: 'カズト', gender: 'male',
      birthDate: new Date('1946-08-20'), careLevel: '要介護2',
      building: 'A棟', floor: '1F', room: '103', notes: '',
      diseases: {...noDiseases, dementia: true},
      teethCount: 25, hasDenture: false, hasOralHypofunction: false,
      assessment: defaultAssessment,
    },
    {
      dentalFacilityId: facilities[2].id, lastName: '松本', firstName: '花子',
      lastNameKana: 'マツモト', firstNameKana: 'ハナコ', gender: 'female',
      birthDate: new Date('1936-02-14'), careLevel: '要介護4',
      building: 'A棟', floor: '1F', room: '104', notes: '歯数5本。義歯使用中。',
      diseases: {...noDiseases, senility: true},
      teethCount: 5, hasDenture: true, hasOralHypofunction: true,
      assessment: defaultAssessment,
    },
  ]

  const patients = await Promise.all(
    patientsData.map((data, i) =>
      prisma.dentalPatient.create({data: {...data, sortOrder: i + 1}})
    )
  )
  console.log(`  患者作成: ${patients.length}名`)

  // スタッフ用ユーザー作成（既存ユーザーがいない場合のみ）
  const staffUsers = await Promise.all([
    prisma.user.upsert({where: {email: 'tanaka-dr@dental.test'}, update: {}, create: {name: '田中 医師', email: 'tanaka-dr@dental.test', role: 'user', app: 'dental'}}),
    prisma.user.upsert({where: {email: 'yamamoto-dr@dental.test'}, update: {}, create: {name: '山本 医師', email: 'yamamoto-dr@dental.test', role: 'user', app: 'dental'}}),
    prisma.user.upsert({where: {email: 'sasaki-dh@dental.test'}, update: {}, create: {name: '佐々木 衛生士', email: 'sasaki-dh@dental.test', role: 'user', app: 'dental'}}),
    prisma.user.upsert({where: {email: 'nakamura-dh@dental.test'}, update: {}, create: {name: '中村 衛生士', email: 'nakamura-dh@dental.test', role: 'user', app: 'dental'}}),
  ])
  console.log(`  スタッフ用ユーザー作成: ${staffUsers.length}名`)

  // スタッフ作成（Userモデルと紐づけ）
  const staff = await Promise.all([
    prisma.dentalStaff.create({data: {dentalClinicId: clinic.id, userId: staffUsers[0].id, role: 'doctor', sortOrder: 1}}),
    prisma.dentalStaff.create({data: {dentalClinicId: clinic.id, userId: staffUsers[1].id, role: 'doctor', sortOrder: 2}}),
    prisma.dentalStaff.create({data: {dentalClinicId: clinic.id, userId: staffUsers[2].id, role: 'hygienist', sortOrder: 3}}),
    prisma.dentalStaff.create({data: {dentalClinicId: clinic.id, userId: staffUsers[3].id, role: 'hygienist', sortOrder: 4}}),
  ])
  console.log(`  スタッフ作成: ${staff.length}名`)

  // 訪問計画作成
  const visitPlans = await Promise.all([
    prisma.dentalVisitPlan.create({
      data: {dentalClinicId: clinic.id, dentalFacilityId: facilities[0].id, visitDate: new Date('2026-01-18'), status: 'scheduled', sortOrder: 1},
    }),
    prisma.dentalVisitPlan.create({
      data: {dentalClinicId: clinic.id, dentalFacilityId: facilities[0].id, visitDate: new Date('2026-01-25'), status: 'scheduled', sortOrder: 2},
    }),
    prisma.dentalVisitPlan.create({
      data: {dentalClinicId: clinic.id, dentalFacilityId: facilities[1].id, visitDate: new Date('2026-01-20'), status: 'scheduled', sortOrder: 3},
    }),
    prisma.dentalVisitPlan.create({
      data: {dentalClinicId: clinic.id, dentalFacilityId: facilities[2].id, visitDate: new Date('2026-01-22'), status: 'scheduled', sortOrder: 4},
    }),
  ])
  console.log(`  訪問計画作成: ${visitPlans.length}件`)

  // 診察データの共通デフォルト
  const examDefaults = {
    status: 'waiting',
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
    treatmentPerformed: [],
    oralFunctionRecord: null,
  }

  // 診察作成（施設1: 5人、施設2: 2人、施設3: 1人）
  const examinations = await Promise.all([
    // 施設1の診察（5人）
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[0].id, dentalPatientId: patients[0].id,
        doctorId: staff[0].id, hygienistId: staff[2].id,
        vitalBefore: {bloodPressure: '130/85', spo2: '97'},
        sortOrder: 1,
      },
    }),
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[0].id, dentalPatientId: patients[1].id,
        doctorId: staff[0].id, hygienistId: staff[2].id,
        vitalBefore: {bloodPressure: '120/80', spo2: '98'},
        sortOrder: 2,
      },
    }),
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[0].id, dentalPatientId: patients[2].id,
        doctorId: staff[0].id, hygienistId: null,
        sortOrder: 3,
      },
    }),
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[0].id, dentalPatientId: patients[3].id,
        doctorId: staff[0].id, hygienistId: null,
        sortOrder: 4,
      },
    }),
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[0].id, dentalPatientId: patients[7].id,
        doctorId: staff[0].id, hygienistId: staff[2].id,
        sortOrder: 5,
      },
    }),
    // 施設2の診察（2人）
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[2].id, dentalPatientId: patients[5].id,
        doctorId: staff[0].id, hygienistId: null,
        sortOrder: 1,
      },
    }),
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[2].id, dentalPatientId: patients[6].id,
        doctorId: staff[0].id, hygienistId: staff[2].id,
        sortOrder: 2,
      },
    }),
    // 施設3の診察（1人）
    prisma.dentalExamination.create({
      data: {
        ...examDefaults,
        dentalVisitPlanId: visitPlans[3].id, dentalPatientId: patients[8].id,
        doctorId: staff[0].id, hygienistId: null,
        sortOrder: 1,
      },
    }),
  ])
  console.log(`  診察作成: ${examinations.length}件`)

  // 算定履歴作成
  const scoringHistories = await Promise.all([
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[0].id, procedureId: 'shizaikan', lastScoredAt: new Date('2025-12-05'), points: 340}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[0].id, procedureId: 'zetsuatsu', lastScoredAt: new Date('2025-10-01'), points: 140}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[0].id, procedureId: 'fkyoku', lastScoredAt: new Date('2025-11-02'), points: 80}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[0].id, procedureId: 'spt', lastScoredAt: new Date('2025-12-05'), points: 350}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[1].id, procedureId: 'shizaikan', lastScoredAt: new Date('2026-01-10'), points: 340}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[1].id, procedureId: 'houeishi', lastScoredAt: new Date('2026-01-10'), points: 362}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[1].id, procedureId: 'zetsuatsu', lastScoredAt: new Date('2025-08-15'), points: 140}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[2].id, procedureId: 'shizaikan', lastScoredAt: new Date('2025-11-20'), points: 340}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[4].id, procedureId: 'shizaikan', lastScoredAt: new Date('2025-12-10'), points: 340}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[4].id, procedureId: 'fkyoku', lastScoredAt: new Date('2025-09-10'), points: 80}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[4].id, procedureId: 'shiriha3', lastScoredAt: new Date('2025-12-10'), points: 110}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[6].id, procedureId: 'shizaikan', lastScoredAt: new Date('2025-12-20'), points: 340}}),
    prisma.dentalScoringHistory.create({data: {dentalPatientId: patients[6].id, procedureId: 'spt', lastScoredAt: new Date('2025-10-20'), points: 350}}),
  ])
  console.log(`  算定履歴作成: ${scoringHistories.length}件`)

  // 保存済み文書作成
  const savedDocs = await Promise.all([
    prisma.dentalSavedDocument.create({
      data: {
        dentalClinicId: clinic.id, dentalPatientId: patients[0].id,
        dentalExaminationId: examinations[0].id,
        templateId: 'doc_kanrikeikaku', templateName: '管理計画書', version: 1,
      },
    }),
    prisma.dentalSavedDocument.create({
      data: {
        dentalClinicId: clinic.id, dentalPatientId: patients[1].id,
        dentalExaminationId: examinations[1].id,
        templateId: 'doc_houeishi', templateName: '訪問歯科衛生指導説明書', version: 1,
      },
    }),
    prisma.dentalSavedDocument.create({
      data: {
        dentalClinicId: clinic.id, dentalPatientId: patients[1].id,
        dentalExaminationId: examinations[1].id,
        templateId: 'doc_kanrikeikaku', templateName: '管理計画書', version: 1,
      },
    }),
  ])
  console.log(`  保存済み文書作成: ${savedDocs.length}件`)

  console.log('Dental seeding completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
