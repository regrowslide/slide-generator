'use server'

import type {Prisma, DentalPatient} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import {AuthService} from 'src/lib/services/AuthService'

// ============================================================
// シードデータ投入（既存データをリセットして再投入）
// ============================================================

export const seedDentalData = async (): Promise<{message: string}> => {
  if (process.env.NODE_ENV !== 'development') {
    return {message: '開発環境でのみ実行可能です'}
  }

  // 既存データを削除（依存関係順）
  await resetDentalData()

  // 1. クリニック作成
  const clinic = await prisma.dentalClinic.create({
    data: {
      name: 'さくら訪問歯科クリニック',
      address: '東京都世田谷区成城1-2-3 成城メディカルビル2F',
      phone: '03-1234-5678',
      representative: '山田太郎',
      qualifications: {
        shiensin1: true,
        shiensin2: false,
        shizaikanOther: false,
        zahoshin: true,
        koukukan: true,
        dx: true,
        johorenkei: false,
        electronicPrescription: false,
        other: false,
        otherText: '',
      },
    },
  })

  // 2. スタッフ（User + Account）作成
  const doctor1 = await AuthService.createUserDirect({
    password: '999999',
    prismaData: {
      name: '山田太郎',
      email: 'yamada@example.com',
      type: 'doctor',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 1,
    },
  })

  const doctor2 = await AuthService.createUserDirect({
    password: '999999',
    prismaData: {
      name: '佐藤健一',
      email: 'sato@example.com',
      type: 'doctor',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 2,
    },
  })

  const hygienist1 = await AuthService.createUserDirect({
    password: '999999',
    prismaData: {
      name: '鈴木花子',
      email: 'suzuki@example.com',
      type: 'hygienist',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 3,
    },
  })

  const hygienist2 = await AuthService.createUserDirect({
    password: '999999',
    prismaData: {
      name: '田中美咲',
      email: 'tanaka@example.com',
      type: 'hygienist',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 4,
    },
  })

  // 3. 施設作成
  const facility1 = await prisma.dentalFacility.create({
    data: {
      name: 'グリーンヒル成城',
      address: '東京都世田谷区成城5-10-1',
      facilityType: 'NURSING_HOME',
      dentalClinicId: clinic.id,
      sortOrder: 1,
    },
  })

  const facility2 = await prisma.dentalFacility.create({
    data: {
      name: 'ひだまりの家 世田谷',
      address: '東京都世田谷区砧3-8-15',
      facilityType: 'GROUP_HOME',
      dentalClinicId: clinic.id,
      sortOrder: 2,
    },
  })

  const facility3 = await prisma.dentalFacility.create({
    data: {
      name: '訪問先（居宅）',
      address: '',
      facilityType: 'RESIDENTIAL',
      dentalClinicId: clinic.id,
      sortOrder: 3,
    },
  })

  // 4. 患者作成
  const patients = await Promise.all([
    // 施設1: グリーンヒル成城（特養）の患者
    prisma.dentalPatient.create({
      data: {
        lastName: '高橋', firstName: '和子',
        lastNameKana: 'タカハシ', firstNameKana: 'カズコ',
        gender: 'female', birthDate: new Date('1935-04-15'),
        careLevel: '要介護3', building: 'A棟', floor: '2F', room: '203',
        diseases: {dementia: true, hypertension: true, diabetes: false, cerebrovascular: false, mentalDisorder: false, parkinsons: false, heartFailure: false, terminalCancer: false, senility: false, femurFracture: false, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: false},
        teethCount: 12, hasDenture: true, hasOralHypofunction: true,
        assessment: createAssessment({height: '150', weight: '45', seatRetention: '良好', oralCleaning: '一部お手伝いが必要', gargling: '困難', choking: '液体で時々', mainDish: '柔らかめ', sideDish: '刻み食'}),
        dentalFacilityId: facility1.id, sortOrder: 1,
      },
    }),
    prisma.dentalPatient.create({
      data: {
        lastName: '渡辺', firstName: '正男',
        lastNameKana: 'ワタナベ', firstNameKana: 'マサオ',
        gender: 'male', birthDate: new Date('1940-08-22'),
        careLevel: '要介護4', building: 'A棟', floor: '3F', room: '305',
        diseases: {dementia: true, hypertension: false, diabetes: true, cerebrovascular: true, mentalDisorder: false, parkinsons: false, heartFailure: false, terminalCancer: false, senility: false, femurFracture: false, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: true},
        teethCount: 5, hasDenture: true, hasOralHypofunction: true,
        assessment: createAssessment({height: '165', weight: '55', seatRetention: 'やや不良', oralCleaning: '全介助が必要', gargling: '不可能(むせる)', choking: '頻繁にある', mainDish: 'お粥', sideDish: 'ミキサー食', swallowing: '頻繁にむせてしまう'}),
        dentalFacilityId: facility1.id, sortOrder: 2,
      },
    }),
    prisma.dentalPatient.create({
      data: {
        lastName: '伊藤', firstName: 'ヨシ',
        lastNameKana: 'イトウ', firstNameKana: 'ヨシ',
        gender: 'female', birthDate: new Date('1930-12-03'),
        careLevel: '要介護5', building: 'B棟', floor: '1F', room: '108',
        diseases: {dementia: true, hypertension: true, diabetes: false, cerebrovascular: false, mentalDisorder: false, parkinsons: true, heartFailure: false, terminalCancer: false, senility: true, femurFracture: true, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: true},
        teethCount: 0, hasDenture: true, hasOralHypofunction: true,
        assessment: createAssessment({height: '148', weight: '38', seatRetention: '不良', oralCleaning: '全介助が必要', gargling: '不可能(むせる)', choking: '頻繁にある', oralIntake: '一部経口摂取', mainDish: 'ミキサー食', sideDish: 'ミキサー食', swallowing: '頻繁にむせてしまう', moisture: 'トロミあり'}),
        dentalFacilityId: facility1.id, sortOrder: 3,
      },
    }),
    prisma.dentalPatient.create({
      data: {
        lastName: '中村', firstName: '幸子',
        lastNameKana: 'ナカムラ', firstNameKana: 'サチコ',
        gender: 'female', birthDate: new Date('1938-06-10'),
        careLevel: '要介護2', building: 'A棟', floor: '2F', room: '210',
        diseases: {dementia: false, hypertension: true, diabetes: false, cerebrovascular: false, mentalDisorder: false, parkinsons: false, heartFailure: true, terminalCancer: false, senility: false, femurFracture: false, spinalStenosis: true, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: false},
        teethCount: 20, hasDenture: false, hasOralHypofunction: false,
        assessment: createAssessment({height: '155', weight: '52', seatRetention: '良好', oralCleaning: '声がけのみ必要', gargling: '可能', mainDish: '常食', sideDish: '常食'}),
        dentalFacilityId: facility1.id, sortOrder: 4,
      },
    }),
    // 施設2: ひだまりの家（グループホーム）の患者
    prisma.dentalPatient.create({
      data: {
        lastName: '小林', firstName: '清',
        lastNameKana: 'コバヤシ', firstNameKana: 'キヨシ',
        gender: 'male', birthDate: new Date('1942-03-20'),
        careLevel: '要介護2', room: '2号室',
        diseases: {dementia: true, hypertension: false, diabetes: true, cerebrovascular: false, mentalDisorder: false, parkinsons: false, heartFailure: false, terminalCancer: false, senility: false, femurFracture: false, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: false},
        teethCount: 18, hasDenture: true, hasOralHypofunction: false,
        assessment: createAssessment({height: '170', weight: '60', seatRetention: '良好', oralCleaning: '声がけのみ必要', gargling: '可能', mainDish: '柔らかめ', sideDish: 'ひと口大'}),
        dentalFacilityId: facility2.id, sortOrder: 1,
      },
    }),
    prisma.dentalPatient.create({
      data: {
        lastName: '加藤', firstName: 'ミチ',
        lastNameKana: 'カトウ', firstNameKana: 'ミチ',
        gender: 'female', birthDate: new Date('1937-11-08'),
        careLevel: '要介護3', room: '5号室',
        diseases: {dementia: true, hypertension: true, diabetes: false, cerebrovascular: true, mentalDisorder: false, parkinsons: false, heartFailure: false, terminalCancer: false, senility: false, femurFracture: false, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: false},
        teethCount: 8, hasDenture: true, hasOralHypofunction: true,
        assessment: createAssessment({height: '152', weight: '48', seatRetention: 'やや不良', oralCleaning: '一部お手伝いが必要', gargling: '困難', choking: '液体で時々', mainDish: '柔らかめ', sideDish: '刻み食'}),
        dentalFacilityId: facility2.id, sortOrder: 2,
      },
    }),
    prisma.dentalPatient.create({
      data: {
        lastName: '松本', firstName: '武',
        lastNameKana: 'マツモト', firstNameKana: 'タケシ',
        gender: 'male', birthDate: new Date('1945-01-25'),
        careLevel: '要介護1', room: '8号室',
        diseases: {dementia: true, hypertension: false, diabetes: false, cerebrovascular: false, mentalDisorder: false, parkinsons: false, heartFailure: false, terminalCancer: false, senility: false, femurFracture: false, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: false},
        teethCount: 24, hasDenture: false, hasOralHypofunction: false,
        assessment: createAssessment({height: '168', weight: '65', seatRetention: '良好', oralCleaning: '自主的に行える', gargling: '可能', mainDish: '常食', sideDish: '常食'}),
        dentalFacilityId: facility2.id, sortOrder: 3,
      },
    }),
    // 施設3: 居宅の患者
    prisma.dentalPatient.create({
      data: {
        lastName: '木村', firstName: '春江',
        lastNameKana: 'キムラ', firstNameKana: 'ハルエ',
        gender: 'female', birthDate: new Date('1933-09-14'),
        careLevel: '要介護4', notes: '自宅にて独居。ヘルパー週3回。',
        diseases: {dementia: false, hypertension: true, diabetes: true, cerebrovascular: true, mentalDisorder: false, parkinsons: false, heartFailure: true, terminalCancer: false, senility: false, femurFracture: true, spinalStenosis: false, als: false, cerebellarDegeneration: false, multipleSclerosis: false, disuseSyndrome: true},
        teethCount: 3, hasDenture: true, hasOralHypofunction: true,
        assessment: createAssessment({height: '145', weight: '40', seatRetention: '不良', oralCleaning: '全介助が必要', gargling: '不可能(むせる)', choking: '頻繁にある', oralIntake: '一部経口摂取', mainDish: 'ミキサー食', sideDish: 'ミキサー食', swallowing: '頻繁にむせてしまう', moisture: 'トロミあり', artificialNutrition: '胃瘻'}),
        dentalFacilityId: facility3.id, sortOrder: 1,
      },
    }),
  ])

  // 患者名マップ（文書データ生成用）
  const patientNameMap = new Map(patients.map(p => [p.id, `${p.lastName} ${p.firstName}`]))
  const patientKanaMap = new Map(patients.map(p => [p.id, `${p.lastNameKana ?? ''} ${p.firstNameKana ?? ''}`]))

  // 5. 訪問計画 + 診察データ作成（直近3ヶ月分）
  const now = new Date()
  let examCount = 0
  let docCount = 0
  let scoringCount = 0
  let timerCount = 0

  // 患者ごとの診察バリエーション定義
  const examVariations = createExamVariations()

  for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
    const visitMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    const isFirstMonth = monthOffset === -2
    const isCurrentMonth = monthOffset === 0

    // 施設1: 月2回訪問（第1・第3水曜日想定）
    for (const [visitIdx, weekOffset] of [0, 2].entries()) {
      const visitDate = new Date(visitMonth.getFullYear(), visitMonth.getMonth(), 7 + weekOffset * 7)
      if (visitDate > now) continue

      const plan1 = await prisma.dentalVisitPlan.create({
        data: {
          visitDate,
          status: 'completed',
          dentalClinicId: clinic.id,
          dentalFacilityId: facility1.id,
        },
      })

      const f1Patients = patients.filter(p => p.dentalFacilityId === facility1.id)
      const sameDayCount = f1Patients.length

      for (const patient of f1Patients) {
        const variation = getVariation(examVariations, patient.id, monthOffset, visitIdx)
        const hasOral = patient.hasOralHypofunction && isFirstMonth && visitIdx === 0
        const oralRecord = hasOral ? createOralFunctionRecord(patient, doctor1.name, hygienist1.name) : null

        const exam = await prisma.dentalExamination.create({
          data: {
            dentalVisitPlanId: plan1.id,
            dentalPatientId: patient.id,
            doctorId: doctor1.id,
            hygienistId: hygienist1.id,
            status: 'done',
            sortOrder: patient.sortOrder,
            vitalBefore: randomVital(),
            vitalAfter: randomVital(),
            drStartTime: variation.drStart,
            drEndTime: variation.drEnd,
            dhStartTime: variation.dhStart,
            dhEndTime: variation.dhEnd,
            visitCondition: variation.visitCondition,
            oralFindings: variation.oralFindings,
            treatment: variation.treatment,
            nextPlan: variation.nextPlan,
            treatmentItems: variation.treatmentItems,
            procedureItems: createProcedureItems({
              sameDayCount,
              hasDoctor: true,
              hasHygienist: true,
              isFirstVisit: visitIdx === 0,
              hasOralRecord: !!oralRecord,
              hasTreatmentPerformed: (variation.treatmentPerformed ?? []).length > 0,
            }),
            treatmentPerformed: variation.treatmentPerformed ?? [],
            oralFunctionRecord: oralRecord ?? undefined,
          },
        })
        examCount++

        // タイマー履歴
        timerCount += await createTimerHistories(exam.id, variation)

        // 算定履歴（月の初回訪問のみ）
        if (visitIdx === 0) {
          scoringCount += await createScoringHistories(patient.id, visitDate, variation, oralRecord)
        }

        // 保存済み文書（月の初回訪問 + 歯在管ありの場合に管理計画書を生成）
        if (visitIdx === 0) {
          // 治療内容説明書
          docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_houmon_chiryou', '訪問歯科診療治療内容説明書', {
            patientName: patientNameMap.get(patient.id) ?? '',
            visitDate: formatDate(visitDate),
            startTime: variation.drStart,
            endTime: variation.drEnd,
            clinicName: clinic.name,
            clinicAddress: clinic.address ?? '',
            clinicPhone: clinic.phone ?? '',
            doctorName: doctor1.name,
            dentureAdjust: variation.treatmentItems.includes('義歯調整'),
            oralStretch: variation.treatmentItems.includes('口腔ストレッチ'),
            contactNotes: variation.treatment,
            careNotes: variation.nextPlan,
          })

          // 歯在管 管理計画書（歯在管を算定する患者のみ）
          if (hasDiseaseForShizaikan(patient)) {
            docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_kanrikeikaku', '歯在管管理計画書', {
              patientName: patientNameMap.get(patient.id) ?? '',
              date: formatDate(visitDate),
              hasDiseases: true,
              diseaseNames: getDiseaseNames(patient),
              cleaningStatus: (patient.careLevel ?? '').includes('4') || (patient.careLevel ?? '').includes('5') ? 'veryPoor' : 'poor',
              oralDryness: patient.hasOralHypofunction ? 'severe' : 'mild',
              managementPolicy: `${patientNameMap.get(patient.id)}様：口腔衛生管理および義歯管理の継続。嚥下機能維持のため口腔リハを実施。`,
              clinicName: clinic.name,
              doctorName: doctor1.name,
            })
          }

          // 訪問歯科衛生指導説明書（DH20分以上の場合）
          if (dhMinutes(variation.dhStart, variation.dhEnd) >= 20) {
            docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_houeishi', '訪問歯科衛生指導説明書', {
              patientName: patientNameMap.get(patient.id) ?? '',
              date: formatDate(visitDate),
              visitType: 'facility',
              facilityName: 'グリーンヒル成城',
              oralCondition: {plaque: true, tongueCoating: true, oralDryness: patient.hasOralHypofunction, calculus: false, foodDebris: false, oralBleeding: false, erosionUlcer: false, halitosis: false, dentureCleanGood: patient.hasDenture, dentureCleanNeedsImprovement: false, dentureFitGood: patient.hasDenture, dentureFitNeedsImprovement: false, dentureStorageGood: patient.hasDenture, dentureStorageNeedsImprovement: false},
              cleaningImportance: true,
              garglingBrushing: true,
              careNotes: '食後のブラッシング介助を継続してください。',
              hygienistName: hygienist1.name,
              startTime: variation.dhStart,
              endTime: variation.dhEnd,
              clinicName: clinic.name,
              clinicAddress: clinic.address ?? '',
              clinicPhone: clinic.phone ?? '',
              doctorName: doctor1.name,
            })
          }

          // 口腔機能精密検査表（口腔機能低下症の患者 + 初月のみ）
          if (oralRecord) {
            docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_seimitsu_kensa', '口腔機能精密検査表', {
              patientName: patientNameMap.get(patient.id) ?? '',
              patientNameKana: patientKanaMap.get(patient.id) ?? '',
              birthDate: patient.birthDate ? patient.birthDate.toISOString().split('T')[0] : '',
              age: patient.birthDate ? calculateAge(patient.birthDate) : 0,
              gender: patient.gender ?? '',
              clinicName: clinic.name,
              measureDate: formatDate(visitDate),
              oralFunctionRecord: oralRecord ?? undefined,
              applicableCount: countApplicable(oralRecord),
            })

            // 口腔機能管理計画書
            docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_koukuu_kanri', '口腔機能管理計画書', {
              patientName: patientNameMap.get(patient.id) ?? '',
              patientNameKana: patientKanaMap.get(patient.id) ?? '',
              age: patient.birthDate ? calculateAge(patient.birthDate) : 0,
              gender: patient.gender ?? '',
              clinicName: clinic.name,
              provideDate: formatDate(visitDate),
              managementGoal: '口腔機能の維持・改善。口腔乾燥の改善および嚥下機能の維持を目標とする。',
              reevaluationMonths: '3',
              treatmentPeriod: '6ヶ月',
            })
          }
        }
      }
    }

    // 施設2: 月2回訪問
    for (const [visitIdx, weekOffset] of [1, 3].entries()) {
      const visitDate = new Date(visitMonth.getFullYear(), visitMonth.getMonth(), 7 + weekOffset * 7)
      if (visitDate > now) continue

      const plan2 = await prisma.dentalVisitPlan.create({
        data: {
          visitDate,
          status: 'completed',
          dentalClinicId: clinic.id,
          dentalFacilityId: facility2.id,
        },
      })

      const f2Patients = patients.filter(p => p.dentalFacilityId === facility2.id)
      const sameDayCount = f2Patients.length

      for (const patient of f2Patients) {
        const variation = getVariation(examVariations, patient.id, monthOffset, visitIdx + 10)
        const hasOral = patient.hasOralHypofunction && isFirstMonth && visitIdx === 0
        const oralRecord = hasOral ? createOralFunctionRecord(patient, doctor2.name, hygienist2.name) : null

        const exam = await prisma.dentalExamination.create({
          data: {
            dentalVisitPlanId: plan2.id,
            dentalPatientId: patient.id,
            doctorId: doctor2.id,
            hygienistId: hygienist2.id,
            status: 'done',
            sortOrder: patient.sortOrder,
            vitalBefore: randomVital(),
            vitalAfter: randomVital(),
            drStartTime: variation.drStart,
            drEndTime: variation.drEnd,
            dhStartTime: variation.dhStart,
            dhEndTime: variation.dhEnd,
            visitCondition: variation.visitCondition,
            oralFindings: variation.oralFindings,
            treatment: variation.treatment,
            nextPlan: variation.nextPlan,
            treatmentItems: variation.treatmentItems,
            procedureItems: createProcedureItems({
              sameDayCount,
              hasDoctor: true,
              hasHygienist: true,
              isFirstVisit: visitIdx === 0,
              hasOralRecord: !!oralRecord,
              hasTreatmentPerformed: (variation.treatmentPerformed ?? []).length > 0,
            }),
            treatmentPerformed: variation.treatmentPerformed ?? [],
            oralFunctionRecord: oralRecord ?? undefined,
          },
        })
        examCount++

        timerCount += await createTimerHistories(exam.id, variation)

        if (visitIdx === 0) {
          scoringCount += await createScoringHistories(patient.id, visitDate, variation, oralRecord)

          // 治療内容説明書
          docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_houmon_chiryou', '訪問歯科診療治療内容説明書', {
            patientName: patientNameMap.get(patient.id) ?? '',
            visitDate: formatDate(visitDate),
            startTime: variation.drStart,
            endTime: variation.drEnd,
            clinicName: clinic.name,
            clinicAddress: clinic.address ?? '',
            clinicPhone: clinic.phone ?? '',
            doctorName: doctor2.name,
            contactNotes: variation.treatment,
            careNotes: variation.nextPlan,
          })

          // 衛生指導説明書
          if (dhMinutes(variation.dhStart, variation.dhEnd) >= 20) {
            docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_houeishi', '訪問歯科衛生指導説明書', {
              patientName: patientNameMap.get(patient.id) ?? '',
              date: formatDate(visitDate),
              visitType: 'facility',
              facilityName: 'ひだまりの家 世田谷',
              cleaningImportance: true,
              careNotes: '口腔ケアの継続をお願いします。',
              hygienistName: hygienist2.name,
              startTime: variation.dhStart,
              endTime: variation.dhEnd,
              clinicName: clinic.name,
              clinicAddress: clinic.address ?? '',
              clinicPhone: clinic.phone ?? '',
              doctorName: doctor2.name,
            })
          }

          if (oralRecord) {
            docCount += await createSavedDocument(clinic.id, patient, exam.id, visitDate, 'doc_seimitsu_kensa', '口腔機能精密検査表', {
              patientName: patientNameMap.get(patient.id) ?? '',
              patientNameKana: patientKanaMap.get(patient.id) ?? '',
              birthDate: patient.birthDate ? patient.birthDate.toISOString().split('T')[0] : '',
              age: patient.birthDate ? calculateAge(patient.birthDate) : 0,
              gender: patient.gender ?? '',
              clinicName: clinic.name,
              measureDate: formatDate(visitDate),
              oralFunctionRecord: oralRecord ?? undefined,
              applicableCount: countApplicable(oralRecord),
            })
          }
        }
      }
    }

    // 施設3（居宅）: 月1回訪問
    const visitDate3 = new Date(visitMonth.getFullYear(), visitMonth.getMonth(), 15)
    if (visitDate3 <= now) {
      const plan3 = await prisma.dentalVisitPlan.create({
        data: {
          visitDate: visitDate3,
          status: 'completed',
          dentalClinicId: clinic.id,
          dentalFacilityId: facility3.id,
        },
      })

      const residentialPatient = patients.find(p => p.dentalFacilityId === facility3.id)!
      const variation = getVariation(examVariations, residentialPatient.id, monthOffset, 20)
      const hasOral = residentialPatient.hasOralHypofunction && isFirstMonth
      const oralRecord = hasOral ? createOralFunctionRecord(residentialPatient, doctor1.name, hygienist1.name) : null

      const exam = await prisma.dentalExamination.create({
        data: {
          dentalVisitPlanId: plan3.id,
          dentalPatientId: residentialPatient.id,
          doctorId: doctor1.id,
          hygienistId: hygienist1.id,
          status: 'done',
          sortOrder: 1,
          vitalBefore: randomVital(),
          vitalAfter: randomVital(),
          drStartTime: '15:00',
          drEndTime: '15:30',
          dhStartTime: '15:00',
          dhEndTime: '15:35',
          visitCondition: variation.visitCondition,
          oralFindings: variation.oralFindings,
          treatment: variation.treatment,
          nextPlan: '1ヶ月後、定期管理予定。',
          treatmentItems: variation.treatmentItems,
          procedureItems: {
            shihou: {selectedSubItems: ['shihou-1-20over'], isAutoSet: true},
            houhojo: {selectedSubItems: ['houhojo-1'], isAutoSet: true},
            shizaikan: {selectedSubItems: ['shizaikan-shiensin1', 'shizaikan-bunsho-main'], isAutoSet: true},
            zaishikan: {selectedSubItems: ['zaishikan-main'], isAutoSet: true},
            houeishi: {selectedSubItems: ['houeishi-1'], isAutoSet: true},
            ...(oralRecord ? {
              koukuu_kensa: {selectedSubItems: ['koukuu_kensa_zetsuatsu'], isAutoSet: false},
              shiriha3: {selectedSubItems: ['shiriha3-main', 'shiriha3-koukan'], isAutoSet: true},
            } : {}),
          },
          treatmentPerformed: ['義歯調整（入れ歯が当たって痛い箇所の削合）'],
          oralFunctionRecord: oralRecord ?? undefined,
        },
      })
      examCount++

      // タイマー履歴
      await createTimerHistories(exam.id, {drStart: '15:00', drEnd: '15:30', dhStart: '15:00', dhEnd: '15:35'})
      timerCount += 4

      // 算定履歴
      scoringCount += await createScoringHistories(residentialPatient.id, visitDate3, variation, oralRecord)

      // 治療内容説明書
      docCount += await createSavedDocument(clinic.id, residentialPatient, exam.id, visitDate3, 'doc_houmon_chiryou', '訪問歯科診療治療内容説明書', {
        patientName: patientNameMap.get(residentialPatient.id) ?? '',
        visitDate: formatDate(visitDate3),
        startTime: '15:00',
        endTime: '15:30',
        clinicName: clinic.name,
        clinicAddress: clinic.address ?? '',
        clinicPhone: clinic.phone ?? '',
        doctorName: doctor1.name,
        dentureAdjust: true,
        contactNotes: variation.treatment,
        careNotes: '1ヶ月後、定期管理予定。',
      })

      // 管理計画書
      docCount += await createSavedDocument(clinic.id, residentialPatient, exam.id, visitDate3, 'doc_kanrikeikaku', '歯在管管理計画書', {
        patientName: patientNameMap.get(residentialPatient.id) ?? '',
        date: formatDate(visitDate3),
        hasDiseases: true,
        diseaseNames: getDiseaseNames(residentialPatient),
        cleaningStatus: 'veryPoor',
        oralDryness: 'severe',
        managementPolicy: '口腔衛生管理の継続。義歯適合チェック。経口摂取維持のための嚥下リハビリ。',
        clinicName: clinic.name,
        doctorName: doctor1.name,
      })

      // 衛生指導説明書
      docCount += await createSavedDocument(clinic.id, residentialPatient, exam.id, visitDate3, 'doc_houeishi', '訪問歯科衛生指導説明書', {
        patientName: patientNameMap.get(residentialPatient.id) ?? '',
        date: formatDate(visitDate3),
        visitType: 'home',
        facilityName: '',
        cleaningImportance: true,
        careNotes: 'ヘルパーさんへ: 食後の義歯洗浄と口腔ケアをお願いします。',
        hygienistName: hygienist1.name,
        startTime: '15:00',
        endTime: '15:35',
        clinicName: clinic.name,
        clinicAddress: clinic.address ?? '',
        clinicPhone: clinic.phone ?? '',
        doctorName: doctor1.name,
      })

      // 口腔機能関連文書
      if (oralRecord) {
        docCount += await createSavedDocument(clinic.id, residentialPatient, exam.id, visitDate3, 'doc_seimitsu_kensa', '口腔機能精密検査表', {
          patientName: patientNameMap.get(residentialPatient.id) ?? '',
          patientNameKana: patientKanaMap.get(residentialPatient.id) ?? '',
          birthDate: residentialPatient.birthDate ? residentialPatient.birthDate.toISOString().split('T')[0] : '',
          age: residentialPatient.birthDate ? calculateAge(residentialPatient.birthDate) : 0,
          gender: residentialPatient.gender ?? '',
          clinicName: clinic.name,
          measureDate: formatDate(visitDate3),
          oralFunctionRecord: oralRecord,
          applicableCount: countApplicable(oralRecord),
        })

        docCount += await createSavedDocument(clinic.id, residentialPatient, exam.id, visitDate3, 'doc_koukuu_kanri', '口腔機能管理計画書', {
          patientName: patientNameMap.get(residentialPatient.id) ?? '',
          patientNameKana: patientKanaMap.get(residentialPatient.id) ?? '',
          age: residentialPatient.birthDate ? calculateAge(residentialPatient.birthDate) : 0,
          gender: residentialPatient.gender ?? '',
          clinicName: clinic.name,
          provideDate: formatDate(visitDate3),
          managementGoal: '嚥下機能維持・改善。胃瘻からの経口移行を視野に口腔リハビリを実施。',
          reevaluationMonths: '3',
          treatmentPeriod: '6ヶ月',
        })
      }

      // 口腔衛生管理加算様式（居宅患者）
      docCount += await createSavedDocument(clinic.id, residentialPatient, exam.id, visitDate3, 'doc_kouei_kanri', '口腔衛生管理加算', {
        patientName: patientNameMap.get(residentialPatient.id) ?? '',
        patientNameKana: patientKanaMap.get(residentialPatient.id) ?? '',
        evaluationDate: formatDate(visitDate3),
        birthDate: residentialPatient.birthDate ? residentialPatient.birthDate.toISOString().split('T')[0] : '',
        gender: residentialPatient.gender ?? '',
        careLevel: residentialPatient.careLevel ?? '',
        diseaseName: getDiseaseNames(residentialPatient),
        clinicName: clinic.name,
      })
    }
  }

  // 6. 未来の訪問計画（来週・再来週）
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const futurePlan1 = await prisma.dentalVisitPlan.create({
    data: {
      visitDate: nextWeek,
      status: 'scheduled',
      dentalClinicId: clinic.id,
      dentalFacilityId: facility1.id,
    },
  })

  // 来週の訪問計画に待機中の診察を事前作成
  for (const patient of patients.filter(p => p.dentalFacilityId === facility1.id)) {
    await prisma.dentalExamination.create({
      data: {
        dentalVisitPlanId: futurePlan1.id,
        dentalPatientId: patient.id,
        doctorId: doctor1.id,
        hygienistId: hygienist1.id,
        status: 'waiting',
        sortOrder: patient.sortOrder,
      },
    })
    examCount++
  }

  await prisma.dentalVisitPlan.create({
    data: {
      visitDate: twoWeeksLater,
      status: 'scheduled',
      dentalClinicId: clinic.id,
      dentalFacilityId: facility2.id,
    },
  })

  // 7. 本日の訪問計画（進行中の診察を含む）
  const todayPlan = await prisma.dentalVisitPlan.create({
    data: {
      visitDate: now,
      status: 'scheduled',
      dentalClinicId: clinic.id,
      dentalFacilityId: facility2.id,
    },
  })

  const f2Patients = patients.filter(p => p.dentalFacilityId === facility2.id)
  for (const [i, patient] of f2Patients.entries()) {
    const status = i === 0 ? 'done' : i === 1 ? 'in_progress' : 'waiting'
    await prisma.dentalExamination.create({
      data: {
        dentalVisitPlanId: todayPlan.id,
        dentalPatientId: patient.id,
        doctorId: doctor2.id,
        hygienistId: hygienist2.id,
        status,
        sortOrder: patient.sortOrder,
        ...(status === 'done' ? {
          vitalBefore: randomVital(),
          vitalAfter: randomVital(),
          drStartTime: '14:00',
          drEndTime: '14:25',
          dhStartTime: '14:00',
          dhEndTime: '14:30',
          visitCondition: '車椅子座位、意思疎通良好。体調変わりなし。',
          oralFindings: '歯石沈着中程度。歯肉に軽度発赤あり。',
          treatment: 'スケーリング実施。口腔ケア指導。',
          nextPlan: '2週間後、経過観察予定。',
        } : status === 'in_progress' ? {
          vitalBefore: randomVital(),
          drStartTime: '14:30',
          dhStartTime: '14:30',
          visitCondition: '車椅子座位、やや傾眠傾向。声掛けにて覚醒。',
        } : {}),
      },
    })
    examCount++
  }

  return {
    message: `シードデータを投入しました: クリニック1件、スタッフ4名、施設3件、患者${patients.length}名、診察${examCount}件、文書${docCount}件、算定履歴${scoringCount}件、タイマー履歴${timerCount}件`,
  }
}

// ============================================================
// リセット（全データ削除）
// ============================================================

export const resetDentalData = async (): Promise<{message: string}> => {
  if (process.env.NODE_ENV !== 'development') {
    return {message: '開発環境でのみ実行可能です'}
  }

  // 依存関係順に削除
  await prisma.dentalTimerHistory.deleteMany()
  await prisma.dentalSavedDocument.deleteMany()
  await prisma.dentalScoringHistory.deleteMany()
  await prisma.dentalExamination.deleteMany()
  await prisma.dentalVisitPlan.deleteMany()
  await prisma.dentalPatient.deleteMany()
  await prisma.dentalFacility.deleteMany()

  // dentalシードユーザーを削除（admin以外）
  const seedUsers = await prisma.user.findMany({
    where: {role: {not: 'admin'}, apps: {has: 'dental'}},
    select: {id: true},
  })
  const seedUserIds = seedUsers.map(u => u.id)
  if (seedUserIds.length > 0) {
    await prisma.session.deleteMany({where: {userId: {in: seedUserIds}}})
    await prisma.account.deleteMany({where: {userId: {in: seedUserIds}}})
    await prisma.user.deleteMany({where: {id: {in: seedUserIds}}})
  }

  await prisma.dentalClinic.deleteMany()

  return {message: 'Dentalデータをすべてリセットしました'}
}

// ============================================================
// 診察バリエーション定義
// ============================================================

type ExamVariation = {
  drStart: string
  drEnd: string
  dhStart: string
  dhEnd: string
  visitCondition: string
  oralFindings: string
  treatment: string
  nextPlan: string
  treatmentItems: string[]
  treatmentPerformed?: string[]
}

function createExamVariations(): ExamVariation[] {
  return [
    {
      drStart: '09:30', drEnd: '09:55', dhStart: '09:30', dhEnd: '10:00',
      visitCondition: 'ベッド上臥位、覚醒良好。バイタル安定。',
      oralFindings: '口腔内全体的に乾燥傾向。舌苔の付着あり。残存歯歯頸部にプラーク付着。',
      treatment: '口腔ケア（ブラッシング・粘膜清掃・保湿）実施。舌ブラシによる舌苔除去。',
      nextPlan: '2週間後、口腔ケア継続予定。',
      treatmentItems: ['口腔ケア', 'ブラッシング指導', '保湿処置'],
    },
    {
      drStart: '09:35', drEnd: '10:00', dhStart: '09:35', dhEnd: '10:05',
      visitCondition: 'ベッド上臥位、傾眠傾向あり。声掛けにて開口可能。',
      oralFindings: '上顎義歯の適合やや不良。義歯床粘膜面に発赤あり。下顎残存歯に動揺あり。',
      treatment: '義歯調整（内面・咬合面の削合）実施。粘膜の消毒処置。動揺歯の経過観察。',
      nextPlan: '2週間後、義歯適合確認予定。',
      treatmentItems: ['義歯調整', '粘膜処置'],
      treatmentPerformed: ['義歯調整（入れ歯が当たって痛い箇所の削合）'],
    },
    {
      drStart: '10:00', drEnd: '10:25', dhStart: '10:00', dhEnd: '10:30',
      visitCondition: '車椅子座位、意思疎通良好。体調変わりなし。',
      oralFindings: '残存歯に歯石沈着あり。歯肉発赤・腫脹を認める。P検にてBOP(+)。',
      treatment: 'スケーリング・歯面清掃実施。TBI実施。フッ素塗布。',
      nextPlan: '2週間後、歯周治療継続予定。',
      treatmentItems: ['スケーリング', 'TBI', 'フッ素塗布'],
      treatmentPerformed: ['スケーリング'],
    },
    {
      drStart: '10:05', drEnd: '10:30', dhStart: '10:05', dhEnd: '10:35',
      visitCondition: '車椅子座位、笑顔で迎えてくれる。食事摂取量やや低下との報告あり。',
      oralFindings: '義歯の適合概ね良好。粘膜に発赤・潰瘍なし。口腔乾燥軽度。',
      treatment: '口腔ケア実施。義歯清掃指導。口腔機能訓練（舌体操・唾液腺マッサージ）。',
      nextPlan: '2週間後、口腔機能訓練継続予定。',
      treatmentItems: ['口腔ケア', '義歯清掃指導', '口腔機能訓練'],
    },
    {
      drStart: '10:30', drEnd: '10:55', dhStart: '10:30', dhEnd: '11:00',
      visitCondition: 'ベッド上臥位、覚醒良好。右側頬部に軽度腫脹あり。',
      oralFindings: '右下7番 C3 冷水痛(+)。右下6番 歯周ポケット5mm、排膿(+)。',
      treatment: 'う蝕処置（仮封）。歯周ポケットへの薬剤注入。消炎処置。',
      nextPlan: '1週間後、経過観察。根管治療開始予定。',
      treatmentItems: ['う蝕処置', '歯周治療', '消炎処置'],
      treatmentPerformed: ['う蝕処置（むし歯を削る、薬を詰める・サホライド塗布）', '歯周ポケットへの薬剤注入'],
    },
    {
      drStart: '10:35', drEnd: '11:00', dhStart: '10:35', dhEnd: '11:05',
      visitCondition: '車椅子座位、発語は少ないが指示に従える。',
      oralFindings: '全顎的に歯石沈着著明。歯肉全体に発赤・腫脹。口臭あり。',
      treatment: 'SRP（全顎）実施。口腔ケア（超音波スケーラー使用）。歯周病検査。',
      nextPlan: '2週間後、SRP継続。P検実施予定。',
      treatmentItems: ['SRP', '歯周病検査', '口腔ケア'],
      treatmentPerformed: ['スケーリング', '歯周病検査'],
    },
    {
      drStart: '09:30', drEnd: '09:50', dhStart: '09:30', dhEnd: '09:55',
      visitCondition: 'ベッド上臥位、バイタル安定。嚥下機能低下の訴えあり。',
      oralFindings: '舌苔著明。口腔乾燥著明。嚥下反射の低下を認める。',
      treatment: '口腔ケア（保湿ジェル使用）。嚥下訓練（アイスマッサージ・空嚥下訓練）。',
      nextPlan: '2週間後、嚥下訓練継続。経口摂取状況の確認。',
      treatmentItems: ['口腔ケア', '嚥下訓練', '保湿処置'],
    },
    {
      drStart: '14:00', drEnd: '14:25', dhStart: '14:00', dhEnd: '14:30',
      visitCondition: '車椅子座位、表情良好。施設職員より口臭の相談あり。',
      oralFindings: '上下顎部分義歯にカンジダ様白色斑あり。義歯床裏面に汚染付着。',
      treatment: '義歯洗浄。義歯床裏装実施。口腔内カンジダ対応（抗真菌薬処方）。',
      nextPlan: '1週間後、カンジダ治療経過確認。',
      treatmentItems: ['義歯洗浄', '義歯床裏装', 'カンジダ治療'],
      treatmentPerformed: ['義歯床裏装（合わなくなった入れ歯の裏打ち・リライニング）', '口腔カンジダ症の治療（抗真菌薬の投与・清拭）'],
    },
  ]
}

function getVariation(variations: ExamVariation[], patientId: number, monthOffset: number, visitIdx: number): ExamVariation {
  const idx = (patientId * 3 + (monthOffset + 2) * 5 + visitIdx) % variations.length
  return variations[idx]
}

// ============================================================
// 算定項目生成
// ============================================================

function createProcedureItems(params: {
  sameDayCount: number
  hasDoctor: boolean
  hasHygienist: boolean
  isFirstVisit: boolean
  hasOralRecord: boolean
  hasTreatmentPerformed: boolean
}): Record<string, {selectedSubItems: string[]; isAutoSet: boolean}> {
  const items: Record<string, {selectedSubItems: string[]; isAutoSet: boolean}> = {}

  // 歯訪（同日患者数で区分変更）
  if (params.hasDoctor) {
    let shihouId = 'shihou-3-20over' // デフォルト: 4〜9人
    if (params.sameDayCount === 1) shihouId = 'shihou-1-20over'
    else if (params.sameDayCount <= 3) shihouId = 'shihou-2-20over'
    else if (params.sameDayCount >= 10) shihouId = 'shihou-4-20over'
    items.shihou = {selectedSubItems: [shihouId], isAutoSet: true}
  }

  // 訪補助（Dr+DH両方の場合）
  if (params.hasDoctor && params.hasHygienist && params.sameDayCount >= 2) {
    items.houhojo = {selectedSubItems: ['houhojo-multi-koukan'], isAutoSet: true}
  }

  // 歯在管（月初回のDr診療時）
  if (params.isFirstVisit && params.hasDoctor) {
    items.shizaikan = {selectedSubItems: ['shizaikan-shiensin1', 'shizaikan-bunsho-main'], isAutoSet: true}
  }

  // 在歯管（治療実績ありの場合）
  if (params.hasTreatmentPerformed && params.hasDoctor) {
    items.zaishikan = {selectedSubItems: ['zaishikan-main'], isAutoSet: true}
  }

  // 訪衛指（DH20分以上）
  if (params.hasHygienist) {
    if (params.sameDayCount === 1) {
      items.houeishi = {selectedSubItems: ['houeishi-1'], isAutoSet: true}
    } else if (params.sameDayCount <= 9) {
      items.houeishi = {selectedSubItems: ['houeishi-2-9'], isAutoSet: true}
    } else {
      items.houeishi = {selectedSubItems: ['houeishi-10plus'], isAutoSet: true}
    }
  }

  // 口腔機能検査系
  if (params.hasOralRecord) {
    items.koukuu_kensa = {selectedSubItems: ['koukuu_kensa_zetsuatsu'], isAutoSet: false}
    items.shiriha3 = {selectedSubItems: ['shiriha3-main', 'shiriha3-koukan'], isAutoSet: true}
  }

  return items
}

// ============================================================
// タイマー履歴生成
// ============================================================

async function createTimerHistories(examId: number, variation: {drStart: string; drEnd: string; dhStart: string; dhEnd: string}): Promise<number> {
  const histories = [
    {timerType: 'dr' as const, actionType: 'start' as const, previousValue: null, newValue: variation.drStart},
    {timerType: 'dr' as const, actionType: 'stop' as const, previousValue: variation.drStart, newValue: variation.drEnd},
    {timerType: 'dh' as const, actionType: 'start' as const, previousValue: null, newValue: variation.dhStart},
    {timerType: 'dh' as const, actionType: 'stop' as const, previousValue: variation.dhStart, newValue: variation.dhEnd},
  ]

  await prisma.dentalTimerHistory.createMany({
    data: histories.map(h => ({
      dentalExaminationId: examId,
      ...h,
    })),
  })

  return histories.length
}

// ============================================================
// 算定履歴生成
// ============================================================

async function createScoringHistories(
  patientId: number,
  visitDate: Date,
  variation: ExamVariation,
  oralRecord: ReturnType<typeof createOralFunctionRecord> | null,
): Promise<number> {
  const scoringItems: Array<{procedureId: string; points: number}> = [
    {procedureId: 'shihou', points: 310},
    {procedureId: 'shizaikan', points: 340},
    {procedureId: 'houeishi', points: 326},
  ]

  if ((variation.treatmentPerformed ?? []).length > 0) {
    scoringItems.push({procedureId: 'zaishikan', points: 45})
  }

  if (oralRecord) {
    scoringItems.push({procedureId: 'koukuu_kensa_zetsuatsu', points: 140})
    scoringItems.push({procedureId: 'shiriha3', points: 110})
  }

  for (const item of scoringItems) {
    await prisma.dentalScoringHistory.upsert({
      where: {
        id: 0, // upsertのダミー（createに fallback）
      },
      create: {
        dentalPatientId: patientId,
        procedureId: item.procedureId,
        lastScoredAt: visitDate,
        points: item.points,
      },
      update: {
        lastScoredAt: visitDate,
        points: item.points,
      },
    })
  }

  return scoringItems.length
}

// ============================================================
// 保存済み文書生成
// ============================================================

async function createSavedDocument(
  clinicId: number,
  patient: DentalPatient,
  examId: number,
  visitDate: Date,
  templateId: string,
  templateName: string,
  templateData: Record<string, unknown>,
): Promise<number> {
  await prisma.dentalSavedDocument.create({
    data: {
      dentalClinicId: clinicId,
      dentalPatientId: patient.id,
      dentalExaminationId: examId,
      templateId,
      templateName,
      templateData: templateData as Prisma.InputJsonValue,
      version: 1,
    },
  })
  return 1
}

// ============================================================
// 口腔機能精密検査記録データ生成
// ============================================================

function createOralFunctionRecord(patient: DentalPatient, doctorName: string, hygienistName: string) {
  // 患者状態に応じてリアルなデータを生成
  const careLevel = patient.careLevel ?? ''
  const isSevere = careLevel.includes('4') || careLevel.includes('5')
  const teethCount = patient.teethCount

  return {
    measureDate: '',
    // 舌苔（50%以上で該当）
    tongueCoatingPercent: isSevere ? '70' : '40',
    tongueCoatingApplicable: isSevere,
    // 口腔乾燥（27未満で該当）
    oralMoistureValue: isSevere ? '22' : '28',
    salivaAmount: isSevere ? '1.5' : '2.5',
    oralDrynessApplicable: isSevere,
    // 咬合力低下（残存歯20本未満または200N未満で該当）
    biteForceN: teethCount < 10 ? '120' : '250',
    remainingTeeth: String(teethCount),
    biteForceApplicable: teethCount < 20,
    // 口腔運動（パ・タ・カ各6回/秒未満で該当）
    oralDiadochoPa: isSevere ? '4.5' : '6.2',
    oralDiadochoTa: isSevere ? '4.2' : '6.0',
    oralDiadochoKa: isSevere ? '3.8' : '5.8',
    oralMotorApplicable: isSevere,
    // 舌圧（30kPa未満で該当）
    tonguePressureKPa: isSevere ? '18' : '32',
    tonguePressureApplicable: isSevere,
    // 咀嚼機能（100mg/dL未満で該当）
    masticatoryAbilityMgDl: isSevere ? '60' : '120',
    masticatoryScoreMethod: 'グミ',
    masticatoryApplicable: isSevere,
    // 嚥下機能（EAT-10: 3点以上で該当）
    swallowingEAT10Score: isSevere ? '8' : '2',
    swallowingQuestionnaireA: isSevere ? 'はい' : 'いいえ',
    swallowingApplicable: isSevere,
    doctorName,
    hygienistName,
  }
}

function countApplicable(record: ReturnType<typeof createOralFunctionRecord>): number {
  return [
    record.tongueCoatingApplicable,
    record.oralDrynessApplicable,
    record.biteForceApplicable,
    record.oralMotorApplicable,
    record.tonguePressureApplicable,
    record.masticatoryApplicable,
    record.swallowingApplicable,
  ].filter(Boolean).length
}

// ============================================================
// ヘルパー関数
// ============================================================

/** アセスメントデータ生成ヘルパー */
function createAssessment(overrides: Record<string, string | boolean> = {}) {
  return {
    height: '', weight: '', bmi: '',
    aspirationPneumoniaHistory: '無し', aspirationPneumoniaDate: '',
    aspirationPneumoniaRepeat: false, aspirationPneumoniaRepeatDate: '',
    seatRetention: '', oralCleaning: '', moistureRetention: '',
    gargling: '', malnutritionRisk: '', choking: '',
    oralIntake: '全て経口摂取', artificialNutrition: '無し',
    moisture: 'トロミなし', mainDish: '常食', sideDish: '常食',
    swallowing: '問題なし', medicationSwallowing: '問題なく飲める',
    medications: [{name: ''}, {name: ''}, {name: ''}],
    medicationImages: [],
    hasInfoShareFee: false, infoShareFeeLastDate: '',
    hasComprehensiveManagement: false, comprehensiveManagementLastDate: '',
    ...overrides,
  }
}

/** ランダムバイタルデータ生成 */
function randomVital() {
  const high = 110 + Math.floor(Math.random() * 40)
  const low = 60 + Math.floor(Math.random() * 20)
  return {
    bloodPressureHigh: String(high),
    bloodPressureLow: String(low),
    pulse: String(60 + Math.floor(Math.random() * 20)),
    spo2: String(95 + Math.floor(Math.random() * 4)),
    temperature: (36 + Math.random() * 0.8).toFixed(1),
    measuredAt: '',
  }
}

/** 日付フォーマット（YYYY-MM-DD） */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/** DH施術時間（分） */
function dhMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

/** 歯在管算定条件（疾患あり） */
function hasDiseaseForShizaikan(patient: DentalPatient): boolean {
  const diseases = patient.diseases as Record<string, boolean> | null
  if (!diseases) return false
  return Object.values(diseases).some(v => v)
}

/** 疾患名取得 */
function getDiseaseNames(patient: DentalPatient): string {
  const diseases = patient.diseases as Record<string, boolean> | null
  if (!diseases) return ''
  const nameMap: Record<string, string> = {
    dementia: '認知症', hypertension: '高血圧症', cerebrovascular: '脳血管障害',
    mentalDisorder: '精神疾患', parkinsons: 'パーキンソン病', heartFailure: '心不全',
    terminalCancer: '末期がん', senility: '老衰', femurFracture: '大腿骨頸部骨折',
    spinalStenosis: '脊柱管狭窄症', als: 'ALS', cerebellarDegeneration: '腎臓小脳変性症',
    multipleSclerosis: '多発性硬化症', disuseSyndrome: '廃用症候群', diabetes: '糖尿病',
  }
  return Object.entries(diseases).filter(([, v]) => v).map(([k]) => nameMap[k] ?? k).join('、')
}

/** 年齢計算 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}
