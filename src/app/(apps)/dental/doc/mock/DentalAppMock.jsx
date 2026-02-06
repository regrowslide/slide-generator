"use client";

/**
 * 訪問歯科アプリ モックアップ
 *
 * こちらはモックであり、単一ファイルに収まるよう構築されています。
 * このページは最終的に削除するため、本番プロジェクトでは、
 * プロジェクトの設計やルールに従ってページやコンポーネントを分割してください。
 */

import { useState, useMemo, useCallback } from "react";
import useModal from "@cm/components/utils/modal/useModal";

// =============================================================================
// 定数・サンプルデータ
// =============================================================================

/** 施設タイプ */
const FACILITY_TYPES = {
  NURSING_HOME: "特別養護老人ホーム",
  GROUP_HOME: "グループホーム",
  RESIDENTIAL: "居宅",
};

/** スタッフの役割 */
const STAFF_ROLES = {
  DOCTOR: "doctor",
  HYGIENIST: "hygienist",
};

/** 診察ステータス */
const EXAMINATION_STATUS = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

/** 初期施設データ */
const INITIAL_FACILITIES = [
  { id: 1, name: "ひまわりケアホーム", address: "東京都世田谷区北沢2-1-1", facilityType: "NURSING_HOME" },
  { id: 2, name: "グループホーム さくら", address: "東京都杉並区高円寺北3-2-5", facilityType: "GROUP_HOME" },
  { id: 3, name: "特別養護老人ホーム 松風", address: "東京都練馬区光が丘1-8-3", facilityType: "NURSING_HOME" },
];

/** 初期利用者データ（疾患・歯数・口腔機能情報を追加） */
const INITIAL_PATIENTS = [
  {
    id: 1, facilityId: 1, name: "山田 太郎", nameKana: "ヤマダ タロウ",
    building: "本館", floor: "2F", room: "201", notes: "嚥下機能低下気味。義歯調整要。",
    diseases: { hypertension: true, diabetes: false, heartDisease: false, cerebrovascular: false, respiratory: false, anticoagulant: false, dialysis: false, dementia: false },
    teethCount: 18, hasDenture: true, hasOralHypofunction: true,
  },
  {
    id: 2, facilityId: 1, name: "鈴木 花子", nameKana: "スズキ ハナコ",
    building: "本館", floor: "2F", room: "202", notes: "認知症あり。拒否時は無理せず。",
    diseases: { hypertension: true, diabetes: true, heartDisease: false, cerebrovascular: false, respiratory: false, anticoagulant: false, dialysis: false, dementia: true },
    teethCount: 12, hasDenture: true, hasOralHypofunction: true,
  },
  {
    id: 3, facilityId: 1, name: "高橋 健一", nameKana: "タカハシ ケンイチ",
    building: "本館", floor: "2F", room: "203", notes: "",
    diseases: { hypertension: false, diabetes: false, heartDisease: true, cerebrovascular: false, respiratory: false, anticoagulant: true, dialysis: false, dementia: false },
    teethCount: 24, hasDenture: false, hasOralHypofunction: false,
  },
  {
    id: 4, facilityId: 1, name: "田中 幸子", nameKana: "タナカ サチコ",
    building: "本館", floor: "2F", room: "205", notes: "家族立ち会い希望あり",
    diseases: { hypertension: false, diabetes: true, heartDisease: false, cerebrovascular: true, respiratory: false, anticoagulant: false, dialysis: false, dementia: false },
    teethCount: 20, hasDenture: false, hasOralHypofunction: false,
  },
  {
    id: 5, facilityId: 1, name: "伊藤 博文", nameKana: "イトウ ヒロフミ",
    building: "本館", floor: "3F", room: "301", notes: "入れ歯紛失注意",
    diseases: { hypertension: true, diabetes: false, heartDisease: false, cerebrovascular: false, respiratory: true, anticoagulant: false, dialysis: false, dementia: false },
    teethCount: 8, hasDenture: true, hasOralHypofunction: true,
  },
  {
    id: 6, facilityId: 2, name: "佐藤 美咲", nameKana: "サトウ ミサキ",
    building: "A棟", floor: "1F", room: "101", notes: "",
    diseases: { hypertension: false, diabetes: false, heartDisease: false, cerebrovascular: false, respiratory: false, anticoagulant: false, dialysis: true, dementia: false },
    teethCount: 22, hasDenture: false, hasOralHypofunction: false,
  },
  {
    id: 7, facilityId: 2, name: "渡辺 次郎", nameKana: "ワタナベ ジロウ",
    building: "A棟", floor: "1F", room: "102", notes: "車椅子使用",
    diseases: { hypertension: true, diabetes: true, heartDisease: true, cerebrovascular: false, respiratory: false, anticoagulant: true, dialysis: false, dementia: false },
    teethCount: 15, hasDenture: true, hasOralHypofunction: true,
  },
];

/** 初期スタッフデータ */
const INITIAL_STAFF = [
  { id: 1, name: "田中 医師", role: STAFF_ROLES.DOCTOR },
  { id: 2, name: "山本 医師", role: STAFF_ROLES.DOCTOR },
  { id: 3, name: "佐々木 衛生士", role: STAFF_ROLES.HYGIENIST },
  { id: 4, name: "中村 衛生士", role: STAFF_ROLES.HYGIENIST },
];

/** 初期訪問計画データ */
const INITIAL_VISIT_PLANS = [
  { id: 1, facilityId: 1, visitDate: "2026-01-18", status: "scheduled" },
  { id: 2, facilityId: 1, visitDate: "2026-01-25", status: "scheduled" },
  { id: 3, facilityId: 2, visitDate: "2026-01-20", status: "scheduled" },
];

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
    vitalBefore: { bloodPressure: "120/80", spo2: "98" },
    vitalAfter: null,
    treatmentItems: [],
    procedureItems: {}, // オブジェクト形式: { itemId: { categoryId: string } }
    visitCondition: "",
    oralFindings: "",
    treatment: "",
    nextPlan: "",
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
    visitCondition: "",
    oralFindings: "",
    treatment: "",
    nextPlan: "",
    drStartTime: null,
    drEndTime: null,
    dhStartTime: null,
    dhEndTime: null,
  },
];

/** 実施項目マスタ */
const TREATMENT_ITEMS_MASTER = [
  { id: "zaitakukan", name: "在宅管", fullName: "在宅管（管理）", category: "管理" },
  { id: "houeishi", name: "訪衛指", fullName: "訪衛指（指導）", category: "指導" },
  { id: "koukuu", name: "口腔機能", fullName: "口腔機能（検査/訓練）", category: "検査" },
  { id: "shisetsu", name: "施設系", fullName: "施設系（会議等）", category: "その他" },
];

/** 医院資格マスタ */
const CLINIC_QUALIFICATIONS = [
  { id: "shihoujin", name: "歯訪診", fullName: "歯科訪問診療料の注13に規定する基準", type: "boolean", description: "歯科訪問診療の基本届出" },
  { id: "shiensin", name: "歯援診", fullName: "在宅療養支援歯科診療所", type: "select", options: ["1", "2", "なし"], description: "高齢者の在宅診療を支援する体制が整っている医院" },
  { id: "zaishikan", name: "在歯管", fullName: "在宅患者歯科治療時医療管理料", type: "boolean", description: "全身疾患がある患者への治療時に算定" },
  { id: "koukankyou", name: "口管強", fullName: "歯科口腔リハビリテーション料2の注6に規定する施設基準", type: "boolean", description: "継続的な口腔管理ができる体制（★マーク加算対象）" },
  { id: "baseup", name: "ベースアップ加算", fullName: "在宅ベースアップ評価料", type: "boolean", description: "訪問の都度算定可能" },
  { id: "dx", name: "DX加算", fullName: "在宅医療DX推進体制整備加算", type: "select", options: ["電子処方箋有", "電子処方箋無", "なし"], description: "月1回算定（電子処方箋有:11点/無:8点）" },
  { id: "johorenkei", name: "情報連携加算", fullName: "在宅歯科医療情報連携加算", type: "boolean", description: "ICTで他職種と情報共有した月に算定（月1回100点）" },
];

/** 初期医院データ */
const INITIAL_CLINIC = {
  id: 1,
  name: "〇〇歯科クリニック",
  address: "東京都千代田区丸の内1-1-1",
  phone: "03-1234-5678",
  representative: "院長 山田太郎",
  qualifications: {
    shihoujin: true,
    shiensin: "1",
    zaishikan: true,
    koukankyou: true,
    baseup: false,
    dx: "電子処方箋無",
    johorenkei: false,
  },
};

/** 患者疾患マスタ（在歯管の算定条件判定用） */
const PATIENT_DISEASES = [
  { id: "hypertension", name: "高血圧症", category: "循環器" },
  { id: "heartDisease", name: "心疾患", category: "循環器" },
  { id: "diabetes", name: "糖尿病", category: "代謝" },
  { id: "cerebrovascular", name: "脳血管疾患", category: "脳神経" },
  { id: "respiratory", name: "呼吸器疾患", category: "呼吸器" },
  { id: "anticoagulant", name: "抗凝固薬服用", category: "薬剤" },
  { id: "dialysis", name: "人工透析", category: "腎臓" },
  { id: "dementia", name: "認知症", category: "精神神経" },
];

/** 実施項目マスタ（加算用） - Excel「算定項目」シートに基づく完全版 */
const PROCEDURE_ITEMS_MASTER = [
  // === 歯科訪問診療料（歯訪） ===
  {
    id: "shihou",
    name: "歯訪",
    fullName: "歯科訪問診療料",
    infoUrl: "/dental/docs/shihou.pdf",
    requiredRole: "doctor",
    requiredQualification: "shihoujin",
    categories: [
      { id: "1-20over", name: "20分以上（1人）", points: 1100, condition: { time: "20over", count: "1" } },
      { id: "2-20over", name: "20分以上（2～3人）", points: 410, condition: { time: "20over", count: "2-3" } },
      { id: "3-20over", name: "20分以上（4～9人）", points: 310, condition: { time: "20over", count: "4-9" } },
      { id: "4-20over", name: "20分以上（10～19人）", points: 160, condition: { time: "20over", count: "10-19" } },
      { id: "5-20over", name: "20分以上（20人以上）", points: 95, condition: { time: "20over", count: "20+" } },
      { id: "1-20under", name: "20分未満（1人）", points: 1100, condition: { time: "20under", count: "1" } },
      { id: "2-20under", name: "20分未満（2～3人）", points: 287, condition: { time: "20under", count: "2-3" } },
      { id: "3-20under", name: "20分未満（4～9人）", points: 217, condition: { time: "20under", count: "4-9" } },
      { id: "4-20under", name: "20分未満（10～19人）", points: 96, condition: { time: "20under", count: "10-19" } },
      { id: "5-20under", name: "20分未満（20人以上）", points: 57, condition: { time: "20under", count: "20+" } },
    ],
    documents: [],
    autoJudgeCondition: "timeAndPatientCount",
    note: "Drの診療ありの場合のみ。タイマー時間と同一建物患者数で自動判定",
  },
  // === 歯科訪問診療補助加算（訪補助） ===
  {
    id: "houhojo",
    name: "訪補助",
    fullName: "歯科訪問診療補助加算",
    infoUrl: "/dental/docs/houhojo.pdf",
    requiredRole: "doctor",
    requiredQualification: "shihoujin",
    categories: [
      { id: "single", name: "同一建物1名のみ", points: 115 },
      { id: "multi-koukankyou", name: "2名以上（口管強）", points: 50, requiredClinicQualification: "koukankyou" },
      { id: "multi-normal", name: "2名以上（通常）", points: 30 },
    ],
    documents: [],
    autoJudgeCondition: "patientCount",
    note: "DHがDrに同行した場合。カルテに同行衛生士名の記載が必要",
  },
  // === 歯科疾患在宅療養管理料（歯在管） ===
  {
    id: "shizaikan",
    name: "歯在管",
    fullName: "歯科疾患在宅療養管理料",
    infoUrl: "/dental/docs/shizaikan.pdf",
    requiredRole: "doctor",
    monthlyLimit: 1,
    categories: [
      { id: "shiensin1", name: "歯援診１", points: 340, requiredClinicQualification: "shiensin", qualificationValue: "1" },
      { id: "shiensin2", name: "歯援診２", points: 230, requiredClinicQualification: "shiensin", qualificationValue: "2" },
      { id: "other", name: "それ以外", points: 200 },
    ],
    documents: [{ id: "doc_kanrikeikaku", name: "管理計画書" }],
    autoJudgeCondition: "clinicQualification",
    note: "月に1度算定。Drの診療があった時に算定を提案",
  },
  // === 歯在管文書提供加算 ===
  {
    id: "shizaikan_bunsho",
    name: "歯在管文書",
    fullName: "文書提供加算（在宅・訪問関連）",
    infoUrl: "/dental/docs/shizaikan_bunsho.pdf",
    monthlyLimit: 1,
    defaultPoints: 10,
    categories: [],
    documents: [{ id: "doc_kanrikeikaku", name: "管理計画書" }],
    note: "歯在管を請求した時に算定するかどうかを提案。文書提供必須",
  },
  // === 画像診断（P画像） ===
  {
    id: "p_gazou",
    name: "P画像",
    fullName: "歯周病患者画像活用指導料",
    infoUrl: "/dental/docs/p_gazou.pdf",
    categories: [
      { id: "1-5", name: "1～5枚", points: 10, unit: "per_sheet" },
    ],
    documents: [],
    note: "1枚につき10点。算定可能なタイミングを確認",
  },
  // === 在宅患者歯科治療総合医療管理料（在歯管） ===
  {
    id: "zaishikan",
    name: "在歯管",
    fullName: "在宅患者歯科治療総合医療管理料",
    infoUrl: "/dental/docs/zaishikan.pdf",
    requiredRole: "doctor",
    requiredQualification: "zaishikan",
    defaultPoints: 45,
    categories: [],
    documents: [],
    autoJudgeCondition: "patientDiseaseAndTreatment",
    note: "疾患登録+治療の2条件が必要。患者マスターの疾患☑+Drの該当治療実施時に算定可能",
  },
  // === 訪問歯科衛生指導料（訪衛指） ===
  {
    id: "houeishi",
    name: "訪衛指",
    fullName: "訪問歯科衛生指導料",
    infoUrl: "/dental/docs/houeishi.pdf",
    requiredRole: "hygienist",
    monthlyLimit: 4,
    timeRequirement: 20,
    categories: [
      { id: "single", name: "1名のみ", points: 362 },
      { id: "2-9", name: "2～9名", points: 326 },
      { id: "10+", name: "10名以上", points: 295 },
    ],
    documents: [{ id: "doc_houeishi", name: "訪問歯科衛生指導説明書" }],
    autoJudgeCondition: "patientCount",
    note: "DHが20分以上の施術を行った場合。月4回まで。タイマーで20分以上で自動算定を提案",
  },
  // === 在宅等療養患者専門的口腔衛生処置（在口衛） ===
  {
    id: "zaikouei",
    name: "在口衛",
    fullName: "在宅等療養患者専門的口腔衛生処置",
    infoUrl: "/dental/docs/zaikouei.pdf",
    defaultPoints: 130,
    categories: [],
    documents: [],
    note: "マニュアル判定",
  },
  // === 在宅歯科栄養サポートチーム等連携指導料（NST2） ===
  {
    id: "nst2",
    name: "NST2",
    fullName: "在宅歯科栄養サポートチーム等連携指導料",
    infoUrl: "/dental/docs/nst2.pdf",
    defaultPoints: 100,
    categories: [],
    documents: [],
    note: "マニュアル判定",
  },
  // === 口腔機能低下症（病名登録用） ===
  {
    id: "koukuu_kinou",
    name: "口腔機能低下症",
    fullName: "口腔機能低下症（病名/管理対象）",
    infoUrl: "/dental/docs/koukuu_kinou.pdf",
    defaultPoints: 0,
    categories: [],
    documents: [],
    note: "病名登録用。歯リハ3の算定条件",
  },
  // === 舌圧検査 ===
  {
    id: "zetsuatsu",
    name: "舌圧",
    fullName: "舌圧検査（口腔機能検査の一部）",
    infoUrl: "/dental/docs/zetsuatsu.pdf",
    defaultPoints: 140,
    intervalMonths: 3,
    categories: [],
    documents: [],
    note: "3ヶ月毎に算定可能",
  },
  // === 咬合圧検査 ===
  {
    id: "kougouatsu1",
    name: "咬合圧1",
    fullName: "咬合圧検査１",
    infoUrl: "/dental/docs/kougouatsu.pdf",
    defaultPoints: 130,
    categories: [],
    documents: [],
  },
  // === 口腔細菌定量検査 ===
  {
    id: "koukinkensa1",
    name: "口菌検1",
    fullName: "口腔細菌定量検査1",
    infoUrl: "/dental/docs/koukinkensa.pdf",
    defaultPoints: 0,
    categories: [],
    documents: [],
    note: "点数は要確認",
  },
  // === 咀嚼能力検査 ===
  {
    id: "soshaku1",
    name: "咀嚼1",
    fullName: "咀嚼能力検査１",
    infoUrl: "/dental/docs/soshaku.pdf",
    defaultPoints: 140,
    intervalMonths: 3,
    categories: [],
    documents: [],
    note: "3ヶ月に1回算定可能",
  },
  // === 歯科口腔リハビリテーション料３（歯リハ3） ===
  {
    id: "shiriha3",
    name: "歯リハ3",
    fullName: "歯科口腔リハビリテーション料３",
    infoUrl: "/dental/docs/shiriha.pdf",
    requiredRole: "doctor",
    monthlyLimit: 2,
    categories: [
      { id: "normal", name: "通常", points: 60 },
      { id: "koukankyou", name: "口管強加算", points: 110, requiredClinicQualification: "koukankyou" },
    ],
    documents: [],
    autoJudgeCondition: "oralHypofunction",
    note: "口腔機能低下症にチェックが入っている場合。月2回まで。Drの診療時に提示",
  },
  // === 歯科口腔リハビリテーション料１（歯リハ1） ===
  {
    id: "shiriha1",
    name: "歯リハ1",
    fullName: "歯科口腔リハビリテーション料１",
    infoUrl: "/dental/docs/shiriha.pdf",
    categories: [
      { id: "normal", name: "通常", points: 104 },
      { id: "complex", name: "複雑", points: 124 },
    ],
    documents: [],
    note: "利用者マスターに義歯の登録がある場合",
  },
  // === ベースアップ加算 ===
  {
    id: "baseup",
    name: "ベースアップ",
    fullName: "在宅ベースアップ評価料",
    infoUrl: "/dental/docs/baseup.pdf",
    requiredQualification: "baseup",
    defaultPoints: 0,
    categories: [],
    documents: [],
    note: "届出必要。訪問の都度算定可能。点数は届出区分により異なる",
  },
  // === 在宅医療DX推進体制整備加算（在DX） ===
  {
    id: "dx",
    name: "在DX",
    fullName: "在宅医療DX推進体制整備加算",
    infoUrl: "/dental/docs/dx.pdf",
    requiredQualification: "dx",
    monthlyLimit: 1,
    categories: [
      { id: "with-prescription", name: "電子処方箋有", points: 11 },
      { id: "without-prescription", name: "電子処方箋無", points: 8 },
    ],
    documents: [],
    autoJudgeCondition: "clinicDxSetting",
    note: "施設基準と届出が必要。月1回算定",
  },
  // === 診療情報等連携共有料（情共１） ===
  {
    id: "joukyo1",
    name: "情共1",
    fullName: "診療情報等連携共有料",
    infoUrl: "/dental/docs/joukyo.pdf",
    defaultPoints: 120,
    categories: [],
    documents: [],
    autoJudgeCondition: "patientDisease",
    note: "患者マスターに疾患が登録されている場合に「医科に情共１を出しますか？」を表示",
  },
  // === 総合医療管理加算（総医） ===
  {
    id: "soui",
    name: "総医",
    fullName: "総合医療管理加算",
    infoUrl: "/dental/docs/soui.pdf",
    defaultPoints: 50,
    categories: [],
    documents: [],
    autoJudgeCondition: "patientDiseaseKJ3",
    note: "歯在管の算定と同時に加算。患者マスターの疾患登録確認",
  },
  // === フッ化物歯面塗布処置（F局） ===
  {
    id: "fkyoku",
    name: "F局（根C）",
    fullName: "フッ化物歯面塗布処置",
    infoUrl: "/dental/docs/fkyoku.pdf",
    defaultPoints: 80,
    intervalMonths: 3,
    categories: [],
    documents: [],
    note: "3ヶ月に1回のみ算定可能。前回のF塗布から3ヶ月目に提案",
  },
  // === 根面齲蝕管理料（根C管） ===
  {
    id: "konc_kan",
    name: "根C管",
    fullName: "根面齲蝕管理料",
    infoUrl: "/dental/docs/konc.pdf",
    categories: [
      { id: "normal", name: "通常", points: 30 },
      { id: "koukankyou", name: "口管強加算", points: 78, requiredClinicQualification: "koukankyou" },
    ],
    documents: [],
    autoJudgeCondition: "clinicKoukankyou",
    note: "毎月初回の診療時に提案。カルテに管理計画を記載",
  },
  // === う蝕薬物塗布処置（サホ塗布） ===
  {
    id: "saho",
    name: "サホ塗布",
    fullName: "う蝕薬物塗布処置",
    infoUrl: "/dental/docs/saho.pdf",
    categories: [
      { id: "1-3", name: "～3歯まで", points: 46 },
      { id: "4+", name: "4歯以上", points: 56 },
    ],
    documents: [],
    note: "処置時にチェック。在歯管算定可能条件の1つ",
  },
  // === 歯周精密検査（P精検） ===
  {
    id: "p_seiken",
    name: "P精検",
    fullName: "歯周精密検査",
    infoUrl: "/dental/docs/p_seiken.pdf",
    categories: [
      { id: "20+", name: "20歯以上", points: 400 },
      { id: "10-19", name: "10～19歯", points: 220 },
      { id: "1-9", name: "1～9歯", points: 100 },
    ],
    documents: [],
    autoJudgeCondition: "patientTeethCount",
    note: "患者マスターの歯数で点数を提案。検査後はSC/SRP/SPT等の処置が来る",
  },
  // === 歯周基本検査（P基検） ===
  {
    id: "p_kiken",
    name: "P基検",
    fullName: "歯周基本検査",
    infoUrl: "/dental/docs/p_kiken.pdf",
    categories: [
      { id: "20+", name: "20歯以上", points: 200 },
      { id: "10-19", name: "10～19歯", points: 110 },
      { id: "1-9", name: "1～9歯", points: 50 },
    ],
    documents: [],
    autoJudgeCondition: "patientTeethCount",
  },
  // === 歯周安定期治療（SPT） ===
  {
    id: "spt",
    name: "SPT",
    fullName: "歯周安定期治療",
    infoUrl: "/dental/docs/spt.pdf",
    defaultPoints: 350,
    categories: [],
    documents: [],
    autoJudgeCondition: "sptTiming",
    note: "口管強がない時は最初の算定から3ヶ月以降に表示。患者マスターの歯数で反映",
  },
  // === 口管強加算（SPT用） ===
  {
    id: "koukan_kasan",
    name: "口管強加算",
    fullName: "口管強加算（SPT同時）",
    infoUrl: "/dental/docs/koukan.pdf",
    requiredQualification: "koukankyou",
    defaultPoints: 120,
    categories: [],
    documents: [],
    autoJudgeCondition: "clinicKoukankyou",
    note: "SPTと同時算定。口管強の届出がある場合に自動表示",
  },
  // === 糖尿病加算（SPT用） ===
  {
    id: "tounyou",
    name: "糖尿病加算",
    fullName: "糖尿病加算（SPT同時）",
    infoUrl: "/dental/docs/tounyou.pdf",
    defaultPoints: 80,
    categories: [],
    documents: [],
    autoJudgeCondition: "patientDiabetes",
    note: "SPTと同時算定。患者マスターで糖尿病の登録がある場合に提案",
  },
  // === 歯周重症化予防治療（P重防） ===
  {
    id: "p_juubou",
    name: "P重防",
    fullName: "歯周重症化予防治療",
    infoUrl: "/dental/docs/p_juubou.pdf",
    defaultPoints: 300,
    categories: [],
    documents: [],
    note: "SPTとセットのような関係。患者マスターの歯数で反映",
  },
  // === 歯科訪問診療移行加算（訪移行） ===
  {
    id: "houikou",
    name: "訪移行",
    fullName: "歯科訪問診療移行加算",
    infoUrl: "/dental/docs/houikou.pdf",
    defaultPoints: 100,
    categories: [],
    documents: [],
  },
  // === 訪問口腔リハビリテーション ===
  {
    id: "houmon_koukuu_riha",
    name: "訪問口腔リハ",
    fullName: "訪問口腔リハビリテーション",
    infoUrl: "/dental/docs/houmon_riha.pdf",
    defaultPoints: 600,
    categories: [],
    documents: [],
    note: "バージョンアップ時に掲載予定",
  },
  // === 訪問口腔リハビリテーション加算 ===
  {
    id: "houmon_koukuu_riha_kasan",
    name: "訪問口腔リハ加算",
    fullName: "訪問口腔リハビリテーション加算",
    infoUrl: "/dental/docs/houmon_riha_kasan.pdf",
    categories: [
      { id: "shiensin1", name: "歯援診1", points: 145 },
      { id: "shiensin2", name: "歯援診2", points: 80 },
      { id: "koukankyou", name: "口管強", points: 75, requiredClinicQualification: "koukankyou" },
    ],
    documents: [],
    autoJudgeCondition: "clinicQualification",
    note: "バージョンアップ時に掲載予定",
  },
  // === 在宅歯科医療情報連携加算 ===
  {
    id: "johorenkei",
    name: "情報連携",
    fullName: "在宅歯科医療情報連携加算",
    infoUrl: "/dental/docs/johorenkei.pdf",
    requiredQualification: "johorenkei",
    monthlyLimit: 1,
    defaultPoints: 100,
    categories: [],
    documents: [],
    note: "ICTで他職種と情報共有した月に算定。月1回",
  },
];

// =============================================================================
// 提供文書テンプレート
// =============================================================================

/** 提供文書テンプレート定義 */
const DOCUMENT_TEMPLATES = {
  doc_kanrikeikaku: {
    id: "doc_kanrikeikaku",
    name: "管理計画書",
    fullName: "歯科疾患在宅療養管理計画書",
    relatedProcedure: "shizaikan", // 歯在管
    monthlyLimit: 1,
    // 流し込み項目定義
    fields: {
      auto: ["clinicName", "clinicAddress", "clinicPhone", "representative", "facilityName", "facilityAddress", "patientName", "patientNameKana", "patientBuilding", "patientRoom", "teethCount", "hasDenture", "hasOralHypofunction", "visitCondition", "oralFindings", "treatment", "nextPlan", "createdAt"],
      manual: ["managementPlan", "oralHygieneGoal"],
    },
  },
  doc_houeishi: {
    id: "doc_houeishi",
    name: "訪問歯科衛生指導説明書",
    fullName: "訪問歯科衛生指導説明書",
    relatedProcedure: "houeishi", // 訪衛指
    monthlyLimit: 4,
    dhMinutesRequired: 20, // DH20分以上が条件
    // 流し込み項目定義
    fields: {
      auto: ["clinicName", "patientName", "patientNameKana", "dhMinutes", "visitCondition", "oralFindings", "createdAt"],
      manual: ["guidanceContent", "homeCareMethod", "nextGuidancePlan"],
    },
  },
};

/**
 * 文書算定ロジック
 * 診察の実施項目とDH時間から、必要な提供文書を判定する
 * @param {Object} params
 * @param {Object} params.procedureItems - 選択された実施項目 { itemId: { categoryId } }
 * @param {number} params.dhSeconds - DH施術時間（秒）
 * @returns {Object} 各文書の必要性と状態
 */
const calculateDocumentRequirements = ({ procedureItems, dhSeconds }) => {
  const dhMinutes = Math.floor(dhSeconds / 60);
  const result = {};

  // 管理計画書: 歯在管（shizaikan）がONの場合に必要
  const shizaikanSelected = !!procedureItems?.shizaikan;
  result.doc_kanrikeikaku = {
    ...DOCUMENT_TEMPLATES.doc_kanrikeikaku,
    required: shizaikanSelected,
    reason: shizaikanSelected ? "歯在管が選択されています" : "歯在管が選択されていません",
  };

  // 訪問歯科衛生指導説明書: 訪衛指（houeishi）がON かつ DH20分以上の場合に必要
  const houeishiSelected = !!procedureItems?.houeishi;
  const isDh20MinOver = dhMinutes >= 20;
  const houeishiRequired = houeishiSelected && isDh20MinOver;
  result.doc_houeishi = {
    ...DOCUMENT_TEMPLATES.doc_houeishi,
    required: houeishiRequired,
    dhMinutes,
    reason: !houeishiSelected
      ? "訪衛指が選択されていません"
      : !isDh20MinOver
        ? `DH施術時間が${dhMinutes}分です（20分以上必要）`
        : "訪衛指選択 + DH20分以上",
  };

  return result;
};

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * 時刻をHH:MM:SS形式にフォーマット
 * @param {Date} date
 * @returns {string}
 */
const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

/**
 * 秒数をMM:SS形式にフォーマット
 * @param {number} seconds
 * @returns {string}
 */
const formatDuration = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * カレンダーの日付配列を生成
 * @param {number} year
 * @param {number} month
 * @returns {Array<{date: Date, isCurrentMonth: boolean}>}
 */
const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const days = [];

  // 前月の日付
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false });
  }

  // 当月の日付
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true });
  }

  // 次月の日付（6週間分に揃える）
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false });
  }

  return days;
};

// =============================================================================
// カスタムフック
// =============================================================================

/**
 * 施設管理用カスタムフック
 */
const useFacilityManager = () => {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [isLoading, setIsLoading] = useState(false);

  const addFacility = useCallback((facility) => {
    setIsLoading(true);
    setTimeout(() => {
      setFacilities((prev) => [
        ...prev,
        { ...facility, id: Math.max(...prev.map((f) => f.id)) + 1 },
      ]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateFacility = useCallback((id, data) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f))
    );
  }, []);

  const deleteFacility = useCallback((id) => {
    setFacilities((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { facilities, isLoading, addFacility, updateFacility, deleteFacility };
};

/**
 * 利用者管理用カスタムフック
 */
const usePatientManager = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  const getPatientsByFacility = useCallback(
    (facilityId) => patients.filter((p) => p.facilityId === facilityId),
    [patients]
  );

  const addPatient = useCallback((patient) => {
    setPatients((prev) => [
      ...prev,
      { ...patient, id: Math.max(...prev.map((p) => p.id)) + 1 },
    ]);
  }, []);

  const updatePatient = useCallback((id, data) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const deletePatient = useCallback((id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { patients, getPatientsByFacility, addPatient, updatePatient, deletePatient };
};

/**
 * 訪問計画管理用カスタムフック
 */
const useVisitPlanManager = () => {
  const [visitPlans, setVisitPlans] = useState(INITIAL_VISIT_PLANS);

  const addVisitPlan = useCallback((plan) => {
    setVisitPlans((prev) => [
      ...prev,
      { ...plan, id: Math.max(0, ...prev.map((p) => p.id)) + 1, status: "scheduled" },
    ]);
  }, []);

  const deleteVisitPlan = useCallback((id) => {
    setVisitPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { visitPlans, addVisitPlan, deleteVisitPlan };
};

/**
 * クリニック管理用カスタムフック
 */
const useClinicManager = () => {
  const [clinic, setClinic] = useState(INITIAL_CLINIC);

  const updateClinic = useCallback((data) => {
    setClinic((prev) => ({ ...prev, ...data }));
  }, []);

  const updateQualification = useCallback((qualificationId, value) => {
    setClinic((prev) => ({
      ...prev,
      qualifications: { ...prev.qualifications, [qualificationId]: value },
    }));
  }, []);

  // 資格の有無をチェック
  const hasQualification = useCallback((qualificationId, value = null) => {
    const qual = clinic.qualifications[qualificationId];
    if (value !== null) {
      return qual === value;
    }
    return qual === true || (typeof qual === "string" && qual !== "なし");
  }, [clinic.qualifications]);

  return { clinic, updateClinic, updateQualification, hasQualification };
};

/**
 * 診察管理用カスタムフック
 */
const useExaminationManager = () => {
  const [examinations, setExaminations] = useState(INITIAL_EXAMINATIONS);

  const getExaminationsByVisitPlan = useCallback(
    (visitPlanId) =>
      examinations
        .filter((e) => e.visitPlanId === visitPlanId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [examinations]
  );

  const addExamination = useCallback((examination) => {
    setExaminations((prev) => {
      const maxId = Math.max(0, ...prev.map((e) => e.id));
      const maxSortOrder = Math.max(
        0,
        ...prev.filter((e) => e.visitPlanId === examination.visitPlanId).map((e) => e.sortOrder)
      );
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
          visitCondition: "",
          oralFindings: "",
          treatment: "",
          nextPlan: "",
          drStartTime: null,
          drEndTime: null,
          dhStartTime: null,
          dhEndTime: null,
        },
      ];
    });
  }, []);

  const updateExamination = useCallback((id, data) => {
    setExaminations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
  }, []);

  const removeExamination = useCallback((id) => {
    setExaminations((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const reorderExaminations = useCallback((visitPlanId, orderedIds) => {
    setExaminations((prev) =>
      prev.map((e) => {
        if (e.visitPlanId !== visitPlanId) return e;
        const newOrder = orderedIds.indexOf(e.id);
        return newOrder >= 0 ? { ...e, sortOrder: newOrder + 1 } : e;
      })
    );
  }, []);

  return {
    examinations,
    getExaminationsByVisitPlan,
    addExamination,
    updateExamination,
    removeExamination,
    reorderExaminations,
  };
};

// =============================================================================
// 共通UIコンポーネント
// =============================================================================

/**
 * ボタンコンポーネント
 */
const Button = ({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) => {
  const baseStyle = "font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary: "bg-slate-800 text-white hover:bg-slate-700 focus-visible:ring-slate-500",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
  };
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * バッジコンポーネント
 */
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * カードコンポーネント
 */
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

/**
 * 入力フィールドコンポーネント
 */
const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, className = "", name = "", autoComplete = "" }) => (
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
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      name={name || undefined}
      autoComplete={autoComplete || undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
    />
  </div>
);

/**
 * セレクトコンポーネント
 */
const Select = ({ label, value, onChange, options, placeholder = "選択してください", className = "", name = "" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      name={name || undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * テキストエリアコンポーネント
 */
const TextArea = ({ label, value, onChange, placeholder = "", rows = 3, className = "", name = "" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      name={name || undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 resize-none"
    />
  </div>
);

/**
 * ローディングスピナー
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
  </div>
);

/**
 * 空状態表示
 */
const EmptyState = ({ message = "データがありません" }) => (
  <div className="text-center py-8 text-gray-500">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="mt-2 text-sm">{message}</p>
  </div>
);

// =============================================================================
// アイコンコンポーネント
// =============================================================================

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconMic = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconBuilding = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// =============================================================================
// 画面コンポーネント
// =============================================================================

/**
 * サイドバーナビゲーション
 */
const Sidebar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: "schedule", label: "訪問計画スケジュール", icon: "📅" },
    { id: "admin-clinic", label: "クリニック設定", icon: "🏥" },
    { id: "admin-facilities", label: "施設マスタ", icon: "🏢" },
    { id: "admin-patients", label: "利用者マスタ", icon: "👥" },
    { id: "admin-staff", label: "スタッフマスタ", icon: "👨‍⚕️" },
    { id: "summary", label: "日次報告", icon: "📊" },
  ];

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-3">
        <h1 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          <span>🦷</span>
          <span>VisitDental Pro</span>
        </h1>
      </div>
      <nav className="mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500 ${
              currentPage === item.id || currentPage.startsWith(item.id)
                ? "bg-slate-100 text-slate-900 border-r-2 border-slate-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

/**
 * 施設フォーム（モーダル用）
 */
const FacilityForm = ({ facility, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: facility?.name || "",
    address: facility?.address || "",
    facilityType: facility?.facilityType || "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.address) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      <Input
        label="施設名"
        value={formData.name}
        onChange={(v) => setFormData({ ...formData, name: v })}
        required
      />
      <Input
        label="住所"
        value={formData.address}
        onChange={(v) => setFormData({ ...formData, address: v })}
        required
      />
      <Select
        label="施設区分"
        value={formData.facilityType}
        onChange={(v) => setFormData({ ...formData, facilityType: v })}
        options={Object.entries(FACILITY_TYPES).map(([value, label]) => ({ value, label }))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{facility ? "更新" : "追加"}</Button>
      </div>
    </div>
  );
};

/**
 * 施設マスタ画面
 */
const FacilityMasterPage = ({ facilities, onAdd, onUpdate, onDelete }) => {
  const facilityModal = useModal();

  const handleOpenAdd = () => {
    facilityModal.handleOpen({ facility: null });
  };

  const handleOpenEdit = (facility) => {
    facilityModal.handleOpen({ facility });
  };

  const handleSubmit = (formData) => {
    if (facilityModal.open?.facility) {
      onUpdate(facilityModal.open.facility.id, formData);
    } else {
      onAdd(formData);
    }
    facilityModal.handleClose();
  };

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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設区分</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facilities.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="施設が登録されていません" />
                  </td>
                </tr>
              ) : (
                facilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{facility.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{facility.address}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {FACILITY_TYPES[facility.facilityType] || "-"}
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
                              onDelete(facility.id);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <facilityModal.Modal title={facilityModal.open?.facility ? "施設を編集" : "施設を追加"}>
        <FacilityForm
          facility={facilityModal.open?.facility}
          onSubmit={handleSubmit}
          onClose={facilityModal.handleClose}
        />
      </facilityModal.Modal>
    </div>
  );
};

/**
 * 利用者フォーム（モーダル用）
 */
const PatientForm = ({ patient, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    nameKana: patient?.nameKana || "",
    building: patient?.building || "",
    floor: patient?.floor || "",
    room: patient?.room || "",
    notes: patient?.notes || "",
  });

  const handleSubmit = () => {
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="氏名"
          value={formData.name}
          onChange={(v) => setFormData({ ...formData, name: v })}
          required
        />
        <Input
          label="ふりがな"
          value={formData.nameKana}
          onChange={(v) => setFormData({ ...formData, nameKana: v })}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="建物"
          value={formData.building}
          onChange={(v) => setFormData({ ...formData, building: v })}
          placeholder="本館"
        />
        <Input
          label="フロア"
          value={formData.floor}
          onChange={(v) => setFormData({ ...formData, floor: v })}
          placeholder="2F"
        />
        <Input
          label="部屋番号"
          value={formData.room}
          onChange={(v) => setFormData({ ...formData, room: v })}
          placeholder="201"
        />
      </div>
      <TextArea
        label="申し送り"
        value={formData.notes}
        onChange={(v) => setFormData({ ...formData, notes: v })}
        placeholder="特記事項があれば入力"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{patient ? "更新" : "追加"}</Button>
      </div>
    </div>
  );
};

/**
 * 利用者マスタ画面
 */
const PatientMasterPage = ({ facilities, patients, onAdd, onUpdate, onDelete }) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id || "");
  const patientModal = useModal();

  const filteredPatients = useMemo(
    () => patients.filter((p) => p.facilityId === Number(selectedFacilityId)),
    [patients, selectedFacilityId]
  );

  const handleOpenAdd = () => {
    patientModal.handleOpen({ patient: null });
  };

  const handleOpenEdit = (patient) => {
    patientModal.handleOpen({ patient });
  };

  const handleSubmit = (formData) => {
    if (patientModal.open?.patient) {
      onUpdate(patientModal.open.patient.id, formData);
    } else {
      onAdd({ ...formData, facilityId: Number(selectedFacilityId) });
    }
    patientModal.handleClose();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">利用者マスタ</h2>
          <Select
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
            options={facilities.map((f) => ({ value: f.id, label: f.name }))}
            placeholder="施設を選択"
          />
        </div>
        <Button onClick={handleOpenAdd} disabled={!selectedFacilityId}>
          <span className="flex items-center gap-1">
            <IconPlus />
            利用者追加
          </span>
        </Button>
      </div>

      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            利用者マスタ ({filteredPatients.length}名)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">氏名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">居場所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">申し送り</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="利用者が登録されていません" />
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.nameKana}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="primary">{patient.building}</Badge>
                        <span className="text-sm text-gray-600">{patient.floor}-{patient.room}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {patient.notes || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                          aria-label="編集"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`「${patient.name}」を削除しますか？`)) {
                              onDelete(patient.id);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <patientModal.Modal title={patientModal.open?.patient ? "利用者を編集" : "利用者を追加"}>
        <PatientForm
          patient={patientModal.open?.patient}
          onSubmit={handleSubmit}
          onClose={patientModal.handleClose}
        />
      </patientModal.Modal>
    </div>
  );
};

/**
 * スタッフフォーム（モーダル用）
 */
const StaffForm = ({ staffMember, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: staffMember?.name || "",
    role: staffMember?.role || "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.role) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      <Input
        label="氏名"
        value={formData.name}
        onChange={(v) => setFormData({ ...formData, name: v })}
        required
      />
      <Select
        label="役割"
        value={formData.role}
        onChange={(v) => setFormData({ ...formData, role: v })}
        options={[
          { value: STAFF_ROLES.DOCTOR, label: "歯科医師" },
          { value: STAFF_ROLES.HYGIENIST, label: "歯科衛生士" },
        ]}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{staffMember ? "更新" : "追加"}</Button>
      </div>
    </div>
  );
};

/**
 * スタッフマスタ画面
 */
const StaffMasterPage = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const staffModal = useModal();

  const handleOpenAdd = () => {
    staffModal.handleOpen({ staffMember: null });
  };

  const handleOpenEdit = (s) => {
    staffModal.handleOpen({ staffMember: s });
  };

  const handleSubmit = (formData) => {
    if (staffModal.open?.staffMember) {
      setStaff((prev) =>
        prev.map((s) => (s.id === staffModal.open.staffMember.id ? { ...s, ...formData } : s))
      );
    } else {
      setStaff((prev) => [...prev, { ...formData, id: Math.max(...prev.map((s) => s.id)) + 1 }]);
    }
    staffModal.handleClose();
  };

  const handleDelete = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const doctors = staff.filter((s) => s.role === STAFF_ROLES.DOCTOR);
  const hygienists = staff.filter((s) => s.role === STAFF_ROLES.HYGIENIST);

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
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">歯科医師 ({doctors.length}名)</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {doctors.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(s)} className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded" aria-label="編集">
                    <IconEdit />
                  </button>
                  <button onClick={() => { if (window.confirm(`「${s.name}」を削除しますか？`)) handleDelete(s.id); }} className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded" aria-label="削除">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
            {doctors.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">登録なし</li>}
          </ul>
        </Card>

        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">歯科衛生士 ({hygienists.length}名)</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {hygienists.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(s)} className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded" aria-label="編集">
                    <IconEdit />
                  </button>
                  <button onClick={() => { if (window.confirm(`「${s.name}」を削除しますか？`)) handleDelete(s.id); }} className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded" aria-label="削除">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
            {hygienists.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">登録なし</li>}
          </ul>
        </Card>
      </div>

      <staffModal.Modal title={staffModal.open?.staffMember ? "スタッフを編集" : "スタッフを追加"}>
        <StaffForm
          staffMember={staffModal.open?.staffMember}
          onSubmit={handleSubmit}
          onClose={staffModal.handleClose}
        />
      </staffModal.Modal>
    </div>
  );
};

/**
 * クリニック設定画面
 */
const ClinicSettingsPage = ({ clinic, onUpdateClinic, onUpdateQualification }) => {
  const [formData, setFormData] = useState({
    name: clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    representative: clinic.representative,
  });

  const handleSaveBasicInfo = () => {
    onUpdateClinic(formData);
  };

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
          <Input
            label="クリニック名"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />
          <Input
            label="住所"
            value={formData.address}
            onChange={(v) => setFormData({ ...formData, address: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="電話番号"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
            />
            <Input
              label="代表者名"
              value={formData.representative}
              onChange={(v) => setFormData({ ...formData, representative: v })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveBasicInfo}>基本情報を保存</Button>
          </div>
        </div>
      </Card>

      {/* 届出資格設定 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">届出資格設定</span>
          <p className="text-xs text-gray-500 mt-1">
            チェックされた項目は、条件が揃った時にカルテに表示されます（長押しで詳細説明）
          </p>
        </div>
        <div className="p-4 space-y-4">
          {CLINIC_QUALIFICATIONS.map((qual) => {
            const currentValue = clinic.qualifications[qual.id];

            return (
              <div
                key={qual.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                title={`${qual.fullName}\n\n${qual.description}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{qual.name}</span>
                    <span className="text-xs text-gray-500">（{qual.fullName}）</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{qual.description}</div>
                </div>

                {qual.type === "boolean" ? (
                  // トグルスイッチ
                  <div
                    onClick={() => onUpdateQualification(qual.id, !currentValue)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                      currentValue ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        currentValue ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </div>
                ) : (
                  // セレクト（歯援診、DX加算用）
                  <select
                    value={currentValue || "なし"}
                    onChange={(e) => onUpdateQualification(qual.id, e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  >
                    {qual.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 現在の設定状況サマリー */}
      <Card className="mt-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">現在の届出資格状況</span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {CLINIC_QUALIFICATIONS.map((qual) => {
              const currentValue = clinic.qualifications[qual.id];
              const isActive = currentValue === true || (typeof currentValue === "string" && currentValue !== "なし");
              return (
                <span
                  key={qual.id}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {qual.name}
                  {qual.type === "select" && isActive && `: ${currentValue}`}
                  {isActive ? " ✓" : ""}
                </span>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * 訪問計画フォーム（モーダル用）
 */
const VisitPlanForm = ({ facilities, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    visitDate: "",
    facilityId: "",
  });

  const handleSubmit = () => {
    if (!formData.visitDate || !formData.facilityId) return;
    onSubmit({ visitDate: formData.visitDate, facilityId: Number(formData.facilityId) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="訪問日"
        type="date"
        value={formData.visitDate}
        onChange={(v) => setFormData({ ...formData, visitDate: v })}
        required
      />
      <Select
        label="施設"
        value={formData.facilityId}
        onChange={(v) => setFormData({ ...formData, facilityId: v })}
        options={facilities.map((f) => ({ value: f.id, label: f.name }))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>作成</Button>
      </div>
    </div>
  );
};

/**
 * 訪問計画スケジュール（カレンダー）画面
 */
const SchedulePage = ({ facilities, visitPlans, onAddPlan, onSelectPlan }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const visitPlanModal = useModal();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month]);

  const filteredPlans = useMemo(() => {
    if (!selectedFacilityId) return visitPlans;
    return visitPlans.filter((p) => p.facilityId === Number(selectedFacilityId));
  }, [visitPlans, selectedFacilityId]);

  const getPlansByDate = useCallback(
    (date) => {
      const dateStr = formatDate(date);
      return filteredPlans.filter((p) => p.visitDate === dateStr);
    },
    [filteredPlans]
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddPlan = (formData) => {
    onAddPlan(formData);
    visitPlanModal.handleClose();
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onSelectPlan(null)} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded" aria-label="戻る">
            <IconChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-gray-900">訪問計画スケジュール</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
            options={facilities.map((f) => ({ value: f.id, label: f.name }))}
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
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" aria-label="前月">
            <IconChevronLeft />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {year}年 {month + 1}月
          </h3>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" aria-label="翌月">
            <IconChevronRight />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {calendarDays.map((dayInfo, index) => {
            const plans = getPlansByDate(dayInfo.date);
            const dayOfWeek = dayInfo.date.getDay();
            return (
              <div
                key={index}
                className={`bg-white min-h-[80px] p-1 ${!dayInfo.isCurrentMonth ? "bg-gray-50" : ""}`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    !dayInfo.isCurrentMonth
                      ? "text-gray-400"
                      : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                      ? "text-blue-500"
                      : "text-gray-900"
                  }`}
                >
                  {dayInfo.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {plans.map((plan) => {
                    const facility = facilities.find((f) => f.id === plan.facilityId);
                    return (
                      <button
                        key={plan.id}
                        onClick={() => onSelectPlan(plan)}
                        className="w-full text-left px-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded truncate hover:bg-slate-200"
                      >
                        {facility?.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <visitPlanModal.Modal title="新規訪問計画">
        <VisitPlanForm
          facilities={facilities}
          onSubmit={handleAddPlan}
          onClose={visitPlanModal.handleClose}
        />
      </visitPlanModal.Modal>
    </div>
  );
};

/**
 * ドラッグハンドルアイコン
 */
const IconDragHandle = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
  </svg>
);

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
  const [draggedPatientId, setDraggedPatientId] = useState(null);
  const [draggedExamId, setDraggedExamId] = useState(null);
  const [dragOverExamId, setDragOverExamId] = useState(null);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);

  // 施設の利用者を取得
  const facilityPatients = useMemo(
    () => patients.filter((p) => p.facilityId === facility.id),
    [patients, facility.id]
  );

  // 既に診察リストに追加済みの患者ID
  const addedPatientIds = useMemo(
    () => examinations.map((e) => e.patientId),
    [examinations]
  );

  // 建物×フロアでグループ化
  const groupedPatients = useMemo(() => {
    const groups = {};
    facilityPatients.forEach((p) => {
      const key = `${p.building} - ${p.floor}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [facilityPatients]);

  // 患者ドラッグ開始（左カラムから）
  const handlePatientDragStart = (e, patientId) => {
    setDraggedPatientId(patientId);
    e.dataTransfer.effectAllowed = "copy";
  };

  // 診察リストへのドロップ（新規追加）
  const handleDropToList = (e) => {
    e.preventDefault();
    setIsDragOverDropZone(false);
    if (draggedPatientId && !addedPatientIds.includes(draggedPatientId)) {
      onAddExamination({ visitPlanId: visitPlan.id, patientId: draggedPatientId });
    }
    setDraggedPatientId(null);
  };

  // 診察項目のドラッグ開始（並び替え用）
  const handleExamDragStart = (e, examId) => {
    setDraggedExamId(examId);
    e.dataTransfer.effectAllowed = "move";
  };

  // 診察項目へのドラッグオーバー
  const handleExamDragOver = (e, examId) => {
    e.preventDefault();
    if (draggedExamId && draggedExamId !== examId) {
      setDragOverExamId(examId);
    }
  };

  // 診察項目へのドロップ（並び替え）
  const handleExamDrop = (e, targetExamId) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedExamId && draggedExamId !== targetExamId) {
      // 現在の順序を取得
      const currentOrder = examinations.map((ex) => ex.id);
      const draggedIndex = currentOrder.indexOf(draggedExamId);
      const targetIndex = currentOrder.indexOf(targetExamId);

      // 順序を入れ替え
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedExamId);

      onReorderExaminations(visitPlan.id, newOrder);
    }

    setDraggedExamId(null);
    setDragOverExamId(null);
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedPatientId(null);
    setDraggedExamId(null);
    setDragOverExamId(null);
    setIsDragOverDropZone(false);
  };

  const handleAddPatient = (patientId) => {
    if (!addedPatientIds.includes(patientId)) {
      onAddExamination({ visitPlanId: visitPlan.id, patientId });
    }
  };

  const doctors = staff.filter((s) => s.role === STAFF_ROLES.DOCTOR);
  const hygienists = staff.filter((s) => s.role === STAFF_ROLES.HYGIENIST);

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded" aria-label="戻る">
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
                <div className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded">
                  {groupKey}
                </div>
                <ul className="mt-1 space-y-1">
                  {groupPatients.map((patient) => {
                    const isAdded = addedPatientIds.includes(patient.id);
                    return (
                      <li
                        key={patient.id}
                        draggable={!isAdded}
                        onDragStart={(e) => handlePatientDragStart(e, patient.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2 py-2 rounded border transition-all ${
                          isAdded
                            ? "bg-emerald-50 border-emerald-200"
                            : draggedPatientId === patient.id
                            ? "bg-slate-100 border-slate-400 opacity-50"
                            : "bg-white border-gray-200 cursor-grab hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
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
                            aria-label={`${patient.name}を追加`}
                          >
                            <IconPlus />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* 右カラム: 本日の訪問・診察リスト */}
        <Card
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedPatientId) setIsDragOverDropZone(true);
          }}
          onDragLeave={() => setIsDragOverDropZone(false)}
          onDrop={handleDropToList}
          className={`transition-all ${isDragOverDropZone ? "ring-2 ring-slate-400 bg-slate-50" : ""}`}
        >
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconBuilding />
              <span className="text-sm font-medium text-gray-700">
                本日の訪問・診察リスト ({examinations.length}名)
              </span>
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {examinations.length === 0 ? (
              <div className={`text-center py-8 border-2 border-dashed rounded-lg ${
                isDragOverDropZone ? "border-slate-400 bg-slate-50" : "border-gray-300"
              }`}>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">患者をドラッグ&ドロップで追加</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {examinations.map((exam, index) => {
                  const patient = patients.find((p) => p.id === exam.patientId);
                  if (!patient) return null;
                  const isDragging = draggedExamId === exam.id;
                  const isDragOver = dragOverExamId === exam.id;

                  return (
                    <li
                      key={exam.id}
                      draggable
                      onDragStart={(e) => handleExamDragStart(e, exam.id)}
                      onDragOver={(e) => handleExamDragOver(e, exam.id)}
                      onDrop={(e) => handleExamDrop(e, exam.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 border rounded-lg transition-all ${
                        isDragging
                          ? "border-slate-400 bg-slate-50 opacity-50"
                          : isDragOver
                          ? "border-slate-500 bg-slate-100 shadow-lg transform scale-[1.02]"
                          : "border-gray-200 bg-white hover:shadow-sm"
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
                        <button
                          onClick={() => onRemoveExamination(exam.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{patient.name}</div>
                      {patient.notes && (
                        <div className="text-xs text-orange-600 mb-2">
                          ⚠ {patient.notes}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当医:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.doctorId || ""}
                              onChange={(e) =>
                                onUpdateExamination(exam.id, {
                                  doctorId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, "doctor")}
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
                              value={exam.hygienistId || ""}
                              onChange={(e) =>
                                onUpdateExamination(exam.id, {
                                  hygienistId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {hygienists.map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, "hygienist")}
                              disabled={!exam.hygienistId}
                            >
                              指導(衛)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

/** バイタルデータの初期値 */
const INITIAL_VITAL = {
  bloodPressureHigh: "",
  bloodPressureLow: "",
  pulse: "",
  spo2: "",
  temperature: "",
  measuredAt: "",
};

/**
 * バイタル入力フォーム（モーダル用）
 */
const VitalForm = ({ vital, type, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    bloodPressureHigh: vital?.bloodPressureHigh || "",
    bloodPressureLow: vital?.bloodPressureLow || "",
    pulse: vital?.pulse || "",
    spo2: vital?.spo2 || "",
    temperature: vital?.temperature || "",
    measuredAt: vital?.measuredAt || new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

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
              onChange={(e) => setFormData({ ...formData, bloodPressureHigh: e.target.value })}
              placeholder="120"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm text-center"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              value={formData.bloodPressureLow}
              onChange={(e) => setFormData({ ...formData, bloodPressureLow: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, measuredAt: e.target.value })}
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
  );
};

/**
 * バイタル表示コンポーネント
 */
const VitalDisplay = ({ vital, label, onEdit }) => {
  const hasData = vital && (vital.bloodPressureHigh || vital.spo2 || vital.temperature);

  return (
    <div
      onClick={onEdit}
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {hasData ? (
        <div className="space-y-1 text-sm">
          {vital.bloodPressureHigh && (
            <div>血圧: {vital.bloodPressureHigh}/{vital.bloodPressureLow} mmHg</div>
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
  );
};

/**
 * 診療画面
 */
const ConsultationPage = ({ examination, patient, staff, clinic, hasQualification, onBack, onUpdate, onOpenDocument }) => {
  const [drSeconds, setDrSeconds] = useState(0);
  const [dhSeconds, setDhSeconds] = useState(0);
  const [drRunning, setDrRunning] = useState(false);
  const [dhRunning, setDhRunning] = useState(false);
  const [vitalBefore, setVitalBefore] = useState(examination.vitalBefore || INITIAL_VITAL);
  const [vitalAfter, setVitalAfter] = useState(examination.vitalAfter || INITIAL_VITAL);
  const [treatmentItems, setTreatmentItems] = useState(examination.treatmentItems || []);
  // procedureItems: { [itemId]: { categoryId: string | null } }
  const [procedureItems, setProcedureItems] = useState(examination.procedureItems || {});
  // 実施記録・所見の4項目
  const [visitCondition, setVisitCondition] = useState(examination.visitCondition || "");
  const [oralFindings, setOralFindings] = useState(examination.oralFindings || "");
  const [treatment, setTreatment] = useState(examination.treatment || "");
  const [nextPlan, setNextPlan] = useState(examination.nextPlan || "");
  const [customTreatment, setCustomTreatment] = useState("");
  const [customTreatments, setCustomTreatments] = useState([]);

  const vitalBeforeModal = useModal();
  const vitalAfterModal = useModal();

  const doctor = staff.find((s) => s.id === examination.doctorId);

  const handleToggleTreatment = (itemId) => {
    setTreatmentItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // 実施項目のON/OFF切り替え
  const handleToggleProcedure = (itemId) => {
    setProcedureItems((prev) => {
      if (prev[itemId]) {
        // 選択解除
        const { [itemId]: _, ...rest } = prev;
        return rest;
      } else {
        // 選択（初期値はカテゴリなし、自動判定で設定）
        const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
        const defaultCategoryId = item?.categories?.[0]?.id || null;
        return { ...prev, [itemId]: { categoryId: defaultCategoryId } };
      }
    });
  };

  // 該当区分の変更
  const handleSetProcedureCategory = (itemId, categoryId) => {
    setProcedureItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], categoryId },
    }));
  };

  // 患者の歯数から歯周検査の点数区分を判定
  const getTeethCountCategory = (teethCount) => {
    if (teethCount >= 20) return "20+";
    if (teethCount >= 10) return "10-19";
    return "1-9";
  };

  // 患者に登録された疾患があるかチェック
  const hasAnyDisease = () => {
    if (!patient.diseases) return false;
    return Object.values(patient.diseases).some((v) => v === true);
  };

  // 患者が糖尿病かチェック
  const hasDiabetes = () => {
    return patient.diseases?.diabetes === true;
  };

  // 項目が算定可能かチェック（資格要件）
  const canClaimItem = (item) => {
    if (!item.requiredQualification) return true;
    return hasQualification(item.requiredQualification);
  };

  // 合計点数の計算（資格連携対応版）
  const calculateTotalPoints = () => {
    let total = 0;
    Object.entries(procedureItems).forEach(([itemId, data]) => {
      const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
      if (!item) return;

      // 資格要件をチェック
      if (!canClaimItem(item)) return;

      if (item.categories?.length > 0 && data.categoryId) {
        const category = item.categories.find((c) => c.id === data.categoryId);
        // カテゴリに資格要件がある場合はチェック
        if (category?.requiredClinicQualification) {
          if (!hasQualification(category.requiredClinicQualification)) {
            // 資格がない場合は通常点数のカテゴリを探す
            const normalCat = item.categories.find((c) => !c.requiredClinicQualification);
            total += normalCat?.points || 0;
            return;
          }
        }
        total += category?.points || 0;
      } else {
        total += item.defaultPoints || 0;
      }
    });
    return total;
  };

  // 選択された項目の点数を取得（資格連携対応版）
  const getItemPoints = (itemId) => {
    const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
    const data = procedureItems[itemId];
    if (!item || !data) return 0;

    // 資格要件をチェック
    if (!canClaimItem(item)) return 0;

    if (item.categories?.length > 0 && data.categoryId) {
      const category = item.categories.find((c) => c.id === data.categoryId);
      // カテゴリに資格要件がある場合はチェック
      if (category?.requiredClinicQualification) {
        if (!hasQualification(category.requiredClinicQualification)) {
          // 資格がない場合は通常点数のカテゴリを探す
          const normalCat = item.categories.find((c) => !c.requiredClinicQualification);
          return normalCat?.points || 0;
        }
      }
      return category?.points || 0;
    }
    return item.defaultPoints || 0;
  };

  // 自動判定で資格に基づくカテゴリを選択
  const autoSelectCategoryByQualification = (item) => {
    if (!item.categories?.length) return null;

    // 口管強加算の自動判定
    if (item.autoJudgeCondition === "clinicKoukankyou") {
      if (hasQualification("koukankyou")) {
        const koukanCat = item.categories.find((c) => c.requiredClinicQualification === "koukankyou");
        return koukanCat?.id || item.categories[0].id;
      }
      return item.categories.find((c) => !c.requiredClinicQualification)?.id || item.categories[0].id;
    }

    // 歯援診の自動判定
    if (item.autoJudgeCondition === "clinicQualification") {
      const shiensinValue = clinic.qualifications.shiensin;
      if (shiensinValue === "1") {
        const cat = item.categories.find((c) => c.id === "shiensin1" || c.qualificationValue === "1");
        return cat?.id || item.categories[0].id;
      }
      if (shiensinValue === "2") {
        const cat = item.categories.find((c) => c.id === "shiensin2" || c.qualificationValue === "2");
        return cat?.id || item.categories[0].id;
      }
      return item.categories.find((c) => c.id === "other")?.id || item.categories[0].id;
    }

    // DX加算の自動判定
    if (item.autoJudgeCondition === "clinicDxSetting") {
      const dxValue = clinic.qualifications.dx;
      if (dxValue === "電子処方箋有") {
        return item.categories.find((c) => c.id === "with-prescription")?.id;
      }
      if (dxValue === "電子処方箋無") {
        return item.categories.find((c) => c.id === "without-prescription")?.id;
      }
      return null;
    }

    // 患者の歯数による自動判定
    if (item.autoJudgeCondition === "patientTeethCount" && patient.teethCount) {
      const teethCat = getTeethCountCategory(patient.teethCount);
      return item.categories.find((c) => c.id === teethCat)?.id || item.categories[0].id;
    }

    return item.categories[0].id;
  };

  // 自動判定ハンドラー（改良版：資格・患者情報を考慮）
  const handleAutoJudge = (itemId) => {
    const item = PROCEDURE_ITEMS_MASTER.find((i) => i.id === itemId);
    if (!item || !item.categories?.length) return;

    let categoryId = item.categories[0].id;

    // 資格に基づく自動判定
    if (["clinicKoukankyou", "clinicQualification", "clinicDxSetting", "patientTeethCount"].includes(item.autoJudgeCondition)) {
      const autoCat = autoSelectCategoryByQualification(item);
      if (autoCat) categoryId = autoCat;
    }
    // 施設タイプに基づく判定（同一建物患者数）
    else if (item.autoJudgeCondition === "facilityType" || item.autoJudgeCondition === "patientCount") {
      // 仮: 施設なら2-9人カテゴリを選択
      categoryId = item.categories.length > 1 ? item.categories[1].id : item.categories[0].id;
    }
    // 患者の居住状況に基づく判定
    else if (item.autoJudgeCondition === "patientResidence") {
      // 仮: 施設入居なら2番目のカテゴリ
      categoryId = item.categories.length > 1 ? item.categories[1].id : item.categories[0].id;
    }
    // 時間と患者数による判定（歯訪用）
    else if (item.autoJudgeCondition === "timeAndPatientCount") {
      const is20MinOver = drSeconds >= 1200;
      const timePrefix = is20MinOver ? "20over" : "20under";
      // 仮: 施設なら2-3人カテゴリを選択
      categoryId = item.categories.find((c) => c.id === `2-${timePrefix}`)?.id || item.categories[0].id;
    }
    // 口腔機能低下症チェック
    else if (item.autoJudgeCondition === "oralHypofunction") {
      if (patient.hasOralHypofunction && hasQualification("koukankyou")) {
        categoryId = item.categories.find((c) => c.requiredClinicQualification === "koukankyou")?.id || item.categories[0].id;
      }
    }
    // 患者疾患チェック
    else if (item.autoJudgeCondition === "patientDisease" || item.autoJudgeCondition === "patientDiseaseKJ3") {
      // 疾患がある場合のみ算定可能を確認
      if (!hasAnyDisease()) {
        // 注意喚起のみ（実際にはUIで表示）
        console.log("この患者には該当する疾患が登録されていません");
      }
    }
    // 糖尿病チェック
    else if (item.autoJudgeCondition === "patientDiabetes") {
      if (!hasDiabetes()) {
        // 注意喚起のみ
        console.log("この患者には糖尿病が登録されていません");
      }
    }

    handleSetProcedureCategory(itemId, categoryId);
  };

  const handleAddCustomTreatment = () => {
    if (!customTreatment.trim()) return;
    setCustomTreatments((prev) => [...prev, customTreatment.trim()]);
    setCustomTreatment("");
  };

  const handleRemoveCustomTreatment = (index) => {
    setCustomTreatments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(examination.id, {
      vitalBefore,
      vitalAfter,
      treatmentItems,
      procedureItems,
      visitCondition,
      oralFindings,
      treatment,
      nextPlan,
      status: EXAMINATION_STATUS.DONE,
    });
    onBack();
  };

  const is20MinOver = drSeconds >= 1200 || dhSeconds >= 1200;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded" aria-label="戻る">
            <IconChevronLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{patient.building}</Badge>
              <span className="text-xs text-gray-600">
                {patient.floor}-{patient.room}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{patient.name} 様</h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">
            担当: <span className="font-medium text-gray-900">{doctor?.name || "-"}</span>
          </div>
          <div className="text-gray-500">
            モード: <span className="font-medium text-slate-700">歯科医師</span>
          </div>
        </div>
      </div>

      {/* タイマーセクション */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={drRunning ? "success" : "default"}>DR</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? "text-red-600" : "text-gray-900"}`}>
              {formatDuration(drSeconds)}
            </span>
            <Button
              size="sm"
              variant={drRunning ? "danger" : "success"}
              onClick={() => setDrRunning(!drRunning)}
            >
              {drRunning ? "終了" : "開始"}
            </Button>
            {drRunning && drSeconds > 0 && (
              <span className="text-xs text-gray-500">計測中 {formatTime(new Date())}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={dhRunning ? "success" : "default"}>DH</Badge>
            <span className={`text-2xl font-mono ${is20MinOver ? "text-red-600" : "text-gray-900"}`}>
              {formatDuration(dhSeconds)}
            </span>
            <Button
              size="sm"
              variant={dhRunning ? "danger" : "success"}
              onClick={() => setDhRunning(!dhRunning)}
            >
              {dhRunning ? "終了" : "開始"}
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
          <VitalDisplay
            vital={vitalBefore}
            label="処置前"
            onEdit={() => vitalBeforeModal.handleOpen()}
          />
          <VitalDisplay
            vital={vitalAfter}
            label="処置後"
            onEdit={() => vitalAfterModal.handleOpen()}
          />
        </div>
      </Card>

      {/* バイタル入力モーダル */}
      <vitalBeforeModal.Modal title="処置前バイタル入力">
        <VitalForm
          vital={vitalBefore}
          type="before"
          onSubmit={(data) => {
            setVitalBefore(data);
            vitalBeforeModal.handleClose();
          }}
          onClose={vitalBeforeModal.handleClose}
        />
      </vitalBeforeModal.Modal>

      <vitalAfterModal.Modal title="処置後バイタル入力">
        <VitalForm
          vital={vitalAfter}
          type="after"
          onSubmit={(data) => {
            setVitalAfter(data);
            vitalAfterModal.handleClose();
          }}
          onClose={vitalAfterModal.handleClose}
        />
      </vitalAfterModal.Modal>

      {/* 本日の実施項目 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <IconCheck />
          <span className="text-sm font-medium text-gray-700">本日の実施項目</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TREATMENT_ITEMS_MASTER.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-colors ${
                  treatmentItems.includes(item.id)
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={treatmentItems.includes(item.id)}
                  onChange={() => handleToggleTreatment(item.id)}
                  className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
                />
                <span className="text-sm font-medium text-gray-900">{item.fullName}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="その他の処置を入力..."
              value={customTreatment}
              onChange={setCustomTreatment}
              className="flex-1"
            />
            <Button onClick={handleAddCustomTreatment}>追加</Button>
          </div>
          {customTreatments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customTreatments.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {t}
                  <button
                    onClick={() => handleRemoveCustomTreatment(i)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 実施記録・所見 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span className="text-slate-600">📋</span>
          <span className="text-sm font-medium text-gray-700">実施記録・所見</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">1. 訪問時の様子</div>
            <TextArea
              value={visitCondition}
              onChange={setVisitCondition}
              placeholder="例: ベッド上臥位、覚醒良好..."
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">2. 口腔内所見</div>
            <TextArea
              value={oralFindings}
              onChange={setOralFindings}
              placeholder="例: 右下残根部発赤あり、PCR 40%..."
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">3. 処置</div>
            <TextArea
              value={treatment}
              onChange={setTreatment}
              placeholder="例: 義歯調整、口腔ケア、TBI..."
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">4. 次回予定</div>
            <TextArea
              value={nextPlan}
              onChange={setNextPlan}
              placeholder="例: 1週間後、義歯経過観察..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* 実施項目の選択（加算） */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm font-medium text-gray-700">実施項目の選択（加算）</span>
          </div>
          <div className="text-sm font-bold text-slate-700">
            合計: {calculateTotalPoints().toLocaleString()} 点
          </div>
        </div>
        <div className="p-4 space-y-2">
          {PROCEDURE_ITEMS_MASTER.map((item) => {
            const isSelected = !!procedureItems[item.id];
            const itemData = procedureItems[item.id];
            const points = getItemPoints(item.id);

            return (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                {/* ON/OFFボタン + 項目名 + インフォマーク */}
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-slate-50 border-slate-300" : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleToggleProcedure(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        isSelected ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isSelected ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span className={`font-medium ${isSelected ? "text-slate-800" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                    {/* インフォマーク（PDF解説リンク） */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(item.infoUrl, "_blank");
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-slate-300 hover:text-slate-700 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                      aria-label={`${item.name}の解説を表示`}
                    >
                      i
                    </button>
                  </div>
                  {isSelected && points > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      +{points}点
                    </span>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAutoJudge(item.id)}
                          >
                            自動判定
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.categories.map((cat) => (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer transition-colors ${
                                itemData?.categoryId === cat.id
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-300 bg-white hover:border-gray-400"
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
                          {item.documents.map((doc) => (
                            <Button
                              key={doc.id}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // 提供文書ページへ遷移（利用者ID_診察ID_テンプレートID）
                                const url = `/dental/documents/${patient.id}_${examination.id}_${doc.id}`;
                                window.open(url, "_blank");
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
            );
          })}
        </div>
      </Card>

      {/* 提供文書セクション */}
      <DocumentSection
        procedureItems={procedureItems}
        dhSeconds={dhSeconds}
        onOpenDocument={(docType) => {
          // 親コンポーネントに文書作成ページへの遷移を通知
          if (typeof onOpenDocument === "function") {
            onOpenDocument(docType, {
              patient,
              clinic,
              examination,
              dhSeconds,
              visitCondition,
              oralFindings,
              treatment,
              nextPlan,
            });
          }
        }}
      />

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
  );
};

/**
 * 提供文書セクションコンポーネント
 */
const DocumentSection = ({ procedureItems, dhSeconds, onOpenDocument }) => {
  const docRequirements = calculateDocumentRequirements({ procedureItems, dhSeconds });

  return (
    <Card className="mb-4">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <span className="text-blue-500">📄</span>
        <span className="text-sm font-medium text-gray-700">提供文書</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          {Object.entries(docRequirements).map(([docId, doc]) => {
            const isRequired = doc.required;
            return (
              <button
                key={docId}
                onClick={() => onOpenDocument(docId)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 ${
                  isRequired
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {isRequired && <span className="text-emerald-600">★</span>}
                <span className="font-medium">{doc.name}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          {Object.entries(docRequirements).map(([docId, doc]) => (
            <div key={docId} className={doc.required ? "text-emerald-600" : ""}>
              • {doc.name}: {doc.reason}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/**
 * 文書作成ページコンポーネント
 */
const DocumentCreatePage = ({ documentType, documentData, onBack, onSave }) => {
  const template = DOCUMENT_TEMPLATES[documentType];
  const { patient, clinic, dhSeconds, visitCondition, oralFindings, treatment, nextPlan, facility } = documentData || {};

  // 手動入力項目の状態
  const [formData, setFormData] = useState(() => {
    if (documentType === "doc_kanrikeikaku") {
      return {
        managementPlan: "",
        oralHygieneGoal: "",
      };
    } else if (documentType === "doc_houeishi") {
      return {
        guidanceContent: "",
        homeCareMethod: "",
        nextGuidancePlan: "",
      };
    }
    return {};
  });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 文書データの集約
  const getDocumentContent = () => {
    const dhMinutes = Math.floor((dhSeconds || 0) / 60);
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

    return {
      // 医院情報
      clinicName: clinic?.name || "",
      clinicAddress: clinic?.address || "",
      clinicPhone: clinic?.phone || "",
      representative: clinic?.representative || "",
      // 施設情報
      facilityName: facility?.name || "",
      facilityAddress: facility?.address || "",
      // 患者情報
      patientName: patient?.name || "",
      patientNameKana: patient?.nameKana || "",
      patientBuilding: patient?.building || "",
      patientFloor: patient?.floor || "",
      patientRoom: patient?.room || "",
      teethCount: patient?.teethCount || 0,
      hasDenture: patient?.hasDenture ? "あり" : "なし",
      hasOralHypofunction: patient?.hasOralHypofunction ? "あり" : "なし",
      // 診察情報
      visitCondition: visitCondition || "",
      oralFindings: oralFindings || "",
      treatment: treatment || "",
      nextPlan: nextPlan || "",
      dhMinutes,
      // 日付
      createdAt: dateStr,
      // 手動入力項目
      ...formData,
    };
  };

  const content = getDocumentContent();

  // PDFダウンロード（簡易版: HTML→印刷）
  const handlePrint = () => {
    window.print();
  };

  // 保存処理
  const handleSaveDocument = () => {
    if (onSave) {
      onSave({
        documentType,
        content,
        createdAt: new Date().toISOString(),
      });
    }
    onBack();
  };

  if (!template) {
    return (
      <div className="p-4">
        <div className="text-red-500">文書テンプレートが見つかりません: {documentType}</div>
        <Button onClick={onBack} className="mt-4">戻る</Button>
      </div>
    );
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
            <p className="text-sm text-gray-500">患者: {patient?.name} 様</p>
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
              {documentType === "doc_kanrikeikaku" && (
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
              {documentType === "doc_houeishi" && (
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
                <span className="text-gray-900 text-xs">{content.visitCondition || "（未入力）"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">口腔内所見:</span>
                <span className="text-gray-900 text-xs">{content.oralFindings || "（未入力）"}</span>
              </div>
              {documentType === "doc_kanrikeikaku" && (
                <>
                  <div>
                    <span className="text-gray-500 block">処置:</span>
                    <span className="text-gray-900 text-xs">{content.treatment || "（未入力）"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">次回予定:</span>
                    <span className="text-gray-900 text-xs">{content.nextPlan || "（未入力）"}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">手動入力項目</h3>
            <div className="space-y-4">
              {documentType === "doc_kanrikeikaku" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">管理計画（今後の方針）</label>
                    <TextArea
                      value={formData.managementPlan}
                      onChange={(v) => handleFormChange("managementPlan", v)}
                      placeholder="例: 義歯の安定を図り、口腔機能の維持・向上を目指す..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">口腔衛生目標</label>
                    <TextArea
                      value={formData.oralHygieneGoal}
                      onChange={(v) => handleFormChange("oralHygieneGoal", v)}
                      placeholder="例: PCR 30%以下を維持..."
                      rows={2}
                    />
                  </div>
                </>
              )}
              {documentType === "doc_houeishi" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">指導内容</label>
                    <TextArea
                      value={formData.guidanceContent}
                      onChange={(v) => handleFormChange("guidanceContent", v)}
                      placeholder="例: 口腔清掃指導、義歯の取り扱い説明..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">家庭でのケア方法</label>
                    <TextArea
                      value={formData.homeCareMethod}
                      onChange={(v) => handleFormChange("homeCareMethod", v)}
                      placeholder="例: 食後の歯磨き、義歯の毎日洗浄..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">次回指導予定</label>
                    <TextArea
                      value={formData.nextGuidancePlan}
                      onChange={(v) => handleFormChange("nextGuidancePlan", v)}
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
          {documentType === "doc_kanrikeikaku" ? (
            <KanriKeikakuPreview content={content} />
          ) : (
            <HoueishiPreview content={content} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 管理計画書プレビューコンポーネント
 */
const KanriKeikakuPreview = ({ content }) => {
  return (
    <div className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0" style={{ width: "210mm", minHeight: "297mm", padding: "15mm" }}>
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">
          歯科疾患在宅療養管理計画書
        </h1>
        <p className="text-sm text-gray-600 mt-2">作成日: {content.createdAt}</p>
      </div>

      {/* 医療機関情報 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          医療機関情報
        </div>
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
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          患者情報
        </div>
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
              <td className="px-3 py-2">{content.patientFloor}-{content.patientRoom}</td>
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
          <span className={content.hasOralHypofunction === "あり" ? "font-medium text-red-600" : ""}>{content.hasOralHypofunction}</span>
        </div>
      </div>

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          口腔内所見
        </div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">
          {content.oralFindings || "（記載なし）"}
        </div>
      </div>

      {/* 処置内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          処置内容
        </div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">
          {content.treatment || "（記載なし）"}
        </div>
      </div>

      {/* 管理計画 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          管理計画（今後の方針）
        </div>
        <div className="p-3 text-sm min-h-[80px] whitespace-pre-wrap">
          {content.managementPlan || "（入力してください）"}
        </div>
      </div>

      {/* 口腔衛生目標 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          口腔衛生目標
        </div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">
          {content.oralHygieneGoal || "（入力してください）"}
        </div>
      </div>

      {/* 次回予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          次回診療予定
        </div>
        <div className="p-3 text-sm whitespace-pre-wrap">
          {content.nextPlan || "（記載なし）"}
        </div>
      </div>
    </div>
  );
};

/**
 * 訪問歯科衛生指導説明書プレビューコンポーネント
 */
const HoueishiPreview = ({ content }) => {
  return (
    <div className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0" style={{ width: "210mm", minHeight: "297mm", padding: "15mm" }}>
      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">
          訪問歯科衛生指導説明書
        </h1>
        <p className="text-sm text-gray-600 mt-2">指導日: {content.createdAt}</p>
      </div>

      {/* 医療機関・患者情報 */}
      <div className="border border-gray-400 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-3 py-2 w-28 bg-gray-50 text-gray-600">医療機関名</td>
              <td className="px-3 py-2" colSpan={3}>{content.clinicName}</td>
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
                {content.dhMinutes >= 20 && (
                  <span className="ml-2 text-xs text-emerald-600">（20分以上）</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 訪問時の様子 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          訪問時の様子
        </div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">
          {content.visitCondition || "（記載なし）"}
        </div>
      </div>

      {/* 口腔内所見 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          口腔内所見
        </div>
        <div className="p-3 text-sm min-h-[60px] whitespace-pre-wrap">
          {content.oralFindings || "（記載なし）"}
        </div>
      </div>

      {/* 指導内容 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          指導内容
        </div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">
          {content.guidanceContent || "（入力してください）"}
        </div>
      </div>

      {/* 家庭でのケア方法 */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          ご家庭でのケア方法
        </div>
        <div className="p-3 text-sm min-h-[100px] whitespace-pre-wrap">
          {content.homeCareMethod || "（入力してください）"}
        </div>
      </div>

      {/* 次回指導予定 */}
      <div className="border border-gray-400">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-400 text-sm font-medium">
          次回指導予定
        </div>
        <div className="p-3 text-sm whitespace-pre-wrap">
          {content.nextGuidancePlan || "（入力してください）"}
        </div>
      </div>

      {/* フッター */}
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <p className="mt-1">{content.clinicName}</p>
      </div>
    </div>
  );
};

/**
 * 日次報告（Summary）画面
 */
const SummaryPage = ({ visitPlans, examinations, patients, facilities }) => {
  const today = formatDate(new Date(2026, 0, 18));
  const todayPlans = visitPlans.filter((p) => p.visitDate === today);

  const completedExams = examinations.filter((e) => e.status === EXAMINATION_STATUS.DONE);

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
          <div className="text-sm text-gray-500">概算算定点数</div>
          <div className="text-2xl font-bold text-slate-700">-- 点</div>
          <div className="text-xs text-gray-400">※ 実装予定</div>
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    患者名
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    施設
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    実施項目
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedExams.map((exam) => {
                  const patient = patients.find((p) => p.id === exam.patientId);
                  const plan = visitPlans.find((p) => p.id === exam.visitPlanId);
                  const facility = facilities.find((f) => f.id === plan?.facilityId);
                  return (
                    <tr key={exam.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {patient?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {exam.treatmentItems.length > 0
                          ? exam.treatmentItems
                              .map((id) => TREATMENT_ITEMS_MASTER.find((t) => t.id === id)?.name)
                              .join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">完了</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// =============================================================================
// メインアプリケーション
// =============================================================================

/**
 * 訪問歯科アプリ メインコンポーネント
 */
export default function DentalAppMock() {
  // ページ状態
  const [currentPage, setCurrentPage] = useState("schedule");
  const [selectedVisitPlan, setSelectedVisitPlan] = useState(null);
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [consultationMode, setConsultationMode] = useState(null);
  // 文書作成ページ用の状態
  const [documentType, setDocumentType] = useState(null);
  const [documentData, setDocumentData] = useState(null);

  // データ管理
  const { clinic, updateClinic, updateQualification, hasQualification } = useClinicManager();
  const { facilities, addFacility, updateFacility, deleteFacility } = useFacilityManager();
  const { patients, addPatient, updatePatient, deletePatient } = usePatientManager();
  const { visitPlans, addVisitPlan, deleteVisitPlan } = useVisitPlanManager();
  const {
    examinations,
    getExaminationsByVisitPlan,
    addExamination,
    updateExamination,
    removeExamination,
    reorderExaminations,
  } = useExaminationManager();

  // ナビゲーション
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedVisitPlan(null);
    setSelectedExamination(null);
  };

  const handleSelectVisitPlan = (plan) => {
    setSelectedVisitPlan(plan);
    setCurrentPage("visit-detail");
  };

  const handleStartConsultation = (examinationId, mode) => {
    const exam = examinations.find((e) => e.id === examinationId);
    setSelectedExamination(exam);
    setConsultationMode(mode);
    setCurrentPage("consultation");
  };

  const handleBackFromConsultation = () => {
    setSelectedExamination(null);
    setConsultationMode(null);
    setCurrentPage("visit-detail");
  };

  // 文書作成ページへの遷移
  const handleOpenDocument = (docType, data) => {
    setDocumentType(docType);
    setDocumentData({
      ...data,
      facility: currentFacility,
    });
    setCurrentPage("document-create");
  };

  // 文書作成ページからの戻り
  const handleBackFromDocument = () => {
    setDocumentType(null);
    setDocumentData(null);
    setCurrentPage("consultation");
  };

  // 現在の訪問計画に紐づく診察一覧
  const currentExaminations = selectedVisitPlan
    ? getExaminationsByVisitPlan(selectedVisitPlan.id)
    : [];

  // 現在の施設
  const currentFacility = selectedVisitPlan
    ? facilities.find((f) => f.id === selectedVisitPlan.facilityId)
    : null;

  // 現在の患者
  const currentPatient = selectedExamination
    ? patients.find((p) => p.id === selectedExamination.patientId)
    : null;

  // ページコンテンツのレンダリング
  const renderContent = () => {
    // 文書作成画面
    if (currentPage === "document-create" && documentType && documentData) {
      return (
        <DocumentCreatePage
          documentType={documentType}
          documentData={documentData}
          onBack={handleBackFromDocument}
          onSave={(savedDoc) => {
            // 文書保存処理（モックでは状態のみ更新）
            console.log("文書を保存しました:", savedDoc);
          }}
        />
      );
    }

    // 診療画面
    if (currentPage === "consultation" && selectedExamination && currentPatient) {
      return (
        <ConsultationPage
          examination={selectedExamination}
          patient={currentPatient}
          staff={INITIAL_STAFF}
          clinic={clinic}
          hasQualification={hasQualification}
          onBack={handleBackFromConsultation}
          onUpdate={updateExamination}
          onOpenDocument={handleOpenDocument}
        />
      );
    }

    // 訪問計画詳細画面
    if (currentPage === "visit-detail" && selectedVisitPlan && currentFacility) {
      return (
        <VisitPlanDetailPage
          visitPlan={selectedVisitPlan}
          facility={currentFacility}
          patients={patients}
          examinations={currentExaminations}
          staff={INITIAL_STAFF}
          onBack={() => handleNavigate("schedule")}
          onAddExamination={addExamination}
          onUpdateExamination={updateExamination}
          onRemoveExamination={removeExamination}
          onReorderExaminations={reorderExaminations}
          onStartConsultation={handleStartConsultation}
        />
      );
    }

    // その他のページ
    switch (currentPage) {
      case "schedule":
        return (
          <SchedulePage
            facilities={facilities}
            visitPlans={visitPlans}
            onAddPlan={addVisitPlan}
            onSelectPlan={handleSelectVisitPlan}
          />
        );
      case "admin-clinic":
        return (
          <ClinicSettingsPage
            clinic={clinic}
            onUpdateClinic={updateClinic}
            onUpdateQualification={updateQualification}
          />
        );
      case "admin-facilities":
        return (
          <FacilityMasterPage
            facilities={facilities}
            onAdd={addFacility}
            onUpdate={updateFacility}
            onDelete={deleteFacility}
          />
        );
      case "admin-patients":
        return (
          <PatientMasterPage
            facilities={facilities}
            patients={patients}
            onAdd={addPatient}
            onUpdate={updatePatient}
            onDelete={deletePatient}
          />
        );
      case "admin-staff":
        return <StaffMasterPage />;
      case "summary":
        return (
          <SummaryPage
            visitPlans={visitPlans}
            examinations={examinations}
            patients={patients}
            facilities={facilities}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
