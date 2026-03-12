'use server'

import prisma from 'src/lib/prisma'

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

  // 2. スタッフ（User）作成
  const doctor1 = await prisma.user.create({
    data: {
      name: '山田太郎',
      email: 'yamada@example.com',
      type: 'doctor',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 1,
    },
  })

  const doctor2 = await prisma.user.create({
    data: {
      name: '佐藤健一',
      email: 'sato@example.com',
      type: 'doctor',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 2,
    },
  })

  const hygienist1 = await prisma.user.create({
    data: {
      name: '鈴木花子',
      email: 'suzuki@example.com',
      type: 'hygienist',
      apps: ['dental'],
      dentalClinicId: clinic.id,
      sortOrder: 3,
    },
  })

  const hygienist2 = await prisma.user.create({
    data: {
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

  // 5. 訪問計画 + 診察データ作成（直近3ヶ月分）
  const now = new Date()
  let examCount = 0

  for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
    const visitMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)

    // 施設1: 月2回訪問（第1・第3水曜日想定）
    for (const weekOffset of [0, 2]) {
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

      // 施設1の全患者の診察を作成
      for (const patient of patients.filter(p => p.dentalFacilityId === facility1.id)) {
        await prisma.dentalExamination.create({
          data: {
            dentalVisitPlanId: plan1.id,
            dentalPatientId: patient.id,
            doctorId: doctor1.id,
            hygienistId: hygienist1.id,
            status: 'done',
            sortOrder: patient.sortOrder,
            vitalBefore: randomVital(),
            vitalAfter: randomVital(),
            drStartTime: '09:30',
            drEndTime: '09:55',
            dhStartTime: '09:30',
            dhEndTime: '10:00',
            visitCondition: 'ベッド上臥位、覚醒良好。バイタル安定。',
            oralFindings: '口腔内全体的に乾燥傾向。舌苔の付着あり。',
            treatment: '口腔ケア（ブラッシング・粘膜清掃・保湿）実施。',
            nextPlan: '2週間後、口腔ケア継続予定。',
            procedureItems: {
              shihou: {selectedSubItems: ['shihou-3-20over'], isAutoSet: true},
              shizaikan: {selectedSubItems: ['shizaikan-shiensin1', 'shizaikan-bunsho-main'], isAutoSet: true},
              houeishi: {selectedSubItems: ['houeishi-2-9'], isAutoSet: true},
            },
          },
        })
        examCount++
      }
    }

    // 施設2: 月2回訪問
    for (const weekOffset of [1, 3]) {
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

      for (const patient of patients.filter(p => p.dentalFacilityId === facility2.id)) {
        await prisma.dentalExamination.create({
          data: {
            dentalVisitPlanId: plan2.id,
            dentalPatientId: patient.id,
            doctorId: doctor2.id,
            hygienistId: hygienist2.id,
            status: 'done',
            sortOrder: patient.sortOrder,
            vitalBefore: randomVital(),
            vitalAfter: randomVital(),
            drStartTime: '14:00',
            drEndTime: '14:25',
            dhStartTime: '14:00',
            dhEndTime: '14:30',
            visitCondition: '車椅子座位、意思疎通良好。体調変わりなし。',
            oralFindings: '残存歯に歯石沈着あり。歯肉発赤・腫脹を認める。',
            treatment: 'スケーリング・歯面清掃実施。TBI実施。',
            nextPlan: '2週間後、経過観察予定。',
            procedureItems: {
              shihou: {selectedSubItems: ['shihou-2-20over'], isAutoSet: true},
              houeishi: {selectedSubItems: ['houeishi-2-9'], isAutoSet: true},
            },
          },
        })
        examCount++
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
      await prisma.dentalExamination.create({
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
          visitCondition: 'ベッド上臥位、傾眠傾向あり。声掛けにて開口可能。',
          oralFindings: '義歯の適合概ね良好。粘膜に発赤・潰瘍なし。',
          treatment: '義歯調整（内面・咬合面の削合）実施。',
          nextPlan: '1ヶ月後、定期管理予定。',
          procedureItems: {
            shihou: {selectedSubItems: ['shihou-1-20over'], isAutoSet: true},
            shizaikan: {selectedSubItems: ['shizaikan-shiensin1', 'shizaikan-bunsho-main'], isAutoSet: true},
            zaishikan: {selectedSubItems: ['zaishikan-main'], isAutoSet: true},
            houeishi: {selectedSubItems: ['houeishi-1'], isAutoSet: true},
          },
          treatmentPerformed: ['義歯調整（入れ歯が当たって痛い箇所の削合）'],
        },
      })
      examCount++
    }
  }

  // 6. 未来の訪問計画（来週分）
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  await prisma.dentalVisitPlan.create({
    data: {
      visitDate: nextWeek,
      status: 'scheduled',
      dentalClinicId: clinic.id,
      dentalFacilityId: facility1.id,
    },
  })

  return {
    message: `シードデータを投入しました: クリニック1件、スタッフ4名、施設3件、患者${patients.length}名、診察${examCount}件`,
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
  // dentalClinicId を持つ User のクリニック紐づけを解除
  await prisma.user.updateMany({
    where: {dentalClinicId: {not: null}},
    data: {dentalClinicId: null},
  })
  await prisma.dentalClinic.deleteMany()

  return {message: 'Dentalデータをすべてリセットしました'}
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
