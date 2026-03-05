'use client'

import React, { useState, useEffect } from 'react'
import {
  Mountain,
  CalendarDays,
  ClipboardList,
  Users,
  Backpack,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Megaphone,
  LucideIcon,
} from 'lucide-react'
import {
  SplashScreen,
  InfoSidebar,
  Modal,
  GuidanceOverlay,
  GuidanceStartButton,
  ResetButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  usePersistedState,
  generateId,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'

// ==========================================
// 型定義
// ==========================================

type TabId = 'dashboard' | 'event-plan' | 'event-guide' | 'plan' | 'record' | 'member' | 'equipment'

interface Department {
  id: string
  name: string
  color: string
  bgColor: string
}

interface Member {
  id: number
  name: string
  nameKana: string
  gender: string
  birthDate: string
  phone: string
  email: string
  address: string
  bloodType: string
  insuranceKuchi: number
  emergencyContact: string
  emergencyPhone: string
  emergencyRelation: string
  joinedAt: string
  completedCourses: string[]
  medicalCondition: string
  kokohelId: string
  role: string
}

interface EventPlan {
  id: number
  date: string
  department: string
  title: string
  clId: number | null
  status: 'draft' | 'confirmed'
}

interface EventGuide {
  id: number
  eventPlanId: number | null
  startDate: string
  endDate: string
  mountainName: string
  altitude: number | null
  gradeStamina: string | null
  gradeSkill: string | null
  rockCategory: string | null
  department: string
  clId: number | null
  slId: number | null
  meetingPlace: string
  meetingTime: string
  course: string
  deadline: string
  notes: string
  requiredInsurance: number
  applicantIds: number[]
}

interface PlanParticipant {
  memberId: number
  role: string
}

interface ItineraryItem {
  date: string
  description: string
}

interface MountainPlan {
  id: number
  eventGuideId: number | null
  submittedAt: string
  mountainArea: string
  mountainName: string
  purpose: string
  formationType: string
  mapReference: string
  meetingPlace: string
  transport: string
  policeNotification: string
  itinerary: ItineraryItem[]
  escapeRoute: string
  specialNotes: string
  participants: PlanParticipant[]
  lastReportTime: string
  status: 'draft' | 'submitted' | 'approved' | 'completed'
}

interface RecordParticipant {
  memberId: number
  role: string
}

interface MountainRecord {
  id: number
  planId: number | null
  title: string
  date: string
  weather: string
  participants: RecordParticipant[]
  access: string
  courseTime: string
  body: string
  courseCondition: string
  specialNote: string
  status: 'draft' | 'submitted' | 'published'
}

interface Equipment {
  id: number
  name: string
  category: string
  condition: string
  status: 'available' | 'rented' | 'maintenance'
  rentedBy: number | null
  rentedAt: string | null
  returnDue: string | null
}

// ==========================================
// 定数
// ==========================================

const DEPARTMENTS: Record<string, Department> = {
  hiking: { id: 'hiking', name: 'ハイキング部', color: '#22c55e', bgColor: '#dcfce7' },
  sanko: { id: 'sanko', name: '山行部', color: '#3b82f6', bgColor: '#dbeafe' },
  education: { id: 'education', name: '教育部', color: '#a855f7', bgColor: '#f3e8ff' },
  nature: { id: 'nature', name: '自然保護部', color: '#eab308', bgColor: '#fef9c3' },
  organization: { id: 'organization', name: '組織部', color: '#6b7280', bgColor: '#f3f4f6' },
}

const EQUIPMENT_CATEGORIES: Record<string, string> = {
  tent: 'テント',
  rope: 'ロープ',
  radio: '無線機',
  climbing: '登攀具',
  cooking: '調理器具',
  other: 'その他',
}

const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  available: '貸出可',
  rented: '貸出中',
  maintenance: 'メンテナンス中',
}

const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  submitted: '提出済',
  approved: '承認済',
  completed: '完了',
}

const RECORD_STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  submitted: '提出済',
  published: '掲載済',
}

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: CalendarDays },
  { id: 'event-plan', label: '例会企画', icon: ClipboardList },
  { id: 'event-guide', label: '例会案内', icon: Megaphone },
  { id: 'plan', label: '計画書', icon: FileText },
  { id: 'record', label: '記録', icon: BookOpen },
  { id: 'member', label: '会員', icon: Users },
  { id: 'equipment', label: '装備', icon: Backpack },
]

// ==========================================
// 初期データ
// ==========================================

const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: '会員 A', nameKana: 'カイイン エー', gender: '男', birthDate: '1965-04-15', phone: '090-0001-0001', email: 'member-a@example.com', address: '○○市中央区1-1-1', bloodType: 'A', insuranceKuchi: 8, emergencyContact: '家族 A1', emergencyPhone: '000-0001-0001', emergencyRelation: '配偶者', joinedAt: '2010-04-01', completedCourses: ['初級登山教室', '岩登り講座A', '沢登り入門'], medicalCondition: '特になし', kokohelId: '100001', role: '自然保護部長' },
  { id: 2, name: '会員 B', nameKana: 'カイイン ビー', gender: '男', birthDate: '1970-08-22', phone: '090-0002-0002', email: 'member-b@example.com', address: '○○市北区2-2-2', bloodType: 'O', insuranceKuchi: 8, emergencyContact: '家族 B1', emergencyPhone: '000-0002-0002', emergencyRelation: '配偶者', joinedAt: '2008-06-15', completedCourses: ['中級登山教室', '岩登り講座B', '雪山ハイキング講座'], medicalCondition: '特になし', kokohelId: '100002', role: '山行部員' },
  { id: 3, name: '会員 C', nameKana: 'カイイン シー', gender: '女', birthDate: '1975-03-10', phone: '090-0003-0003', email: 'member-c@example.com', address: '○○市東区3-3-3', bloodType: 'B', insuranceKuchi: 4, emergencyContact: '家族 C1', emergencyPhone: '000-0003-0003', emergencyRelation: '配偶者', joinedAt: '2015-09-01', completedCourses: ['初級登山教室'], medicalCondition: '花粉症', kokohelId: '100003', role: 'ハイキング部員' },
  { id: 4, name: '会員 D', nameKana: 'カイイン ディー', gender: '男', birthDate: '1968-11-05', phone: '090-0004-0004', email: 'member-d@example.com', address: '○○市南区4-4-4', bloodType: 'AB', insuranceKuchi: 8, emergencyContact: '家族 D1', emergencyPhone: '000-0004-0004', emergencyRelation: '配偶者', joinedAt: '2005-04-01', completedCourses: ['中級登山教室', '岩登り講座C', '雪山講座'], medicalCondition: '特になし', kokohelId: '100004', role: '教育部長' },
  { id: 5, name: '会員 E', nameKana: 'カイイン イー', gender: '男', birthDate: '1960-07-20', phone: '090-0005-0005', email: 'member-e@example.com', address: '○○市西区5-5-5', bloodType: 'A', insuranceKuchi: 8, emergencyContact: '家族 E1', emergencyPhone: '000-0005-0005', emergencyRelation: '配偶者', joinedAt: '2000-04-01', completedCourses: ['中級登山教室', '岩登り講座C', 'アルパイン講座'], medicalCondition: '持病あり（服薬中）', kokohelId: '100005', role: '山行部員' },
  { id: 6, name: '会員 F', nameKana: 'カイイン エフ', gender: '女', birthDate: '1980-12-03', phone: '090-0006-0006', email: 'member-f@example.com', address: '○○市港区6-6-6', bloodType: 'O', insuranceKuchi: 4, emergencyContact: '家族 F1', emergencyPhone: '000-0006-0006', emergencyRelation: '配偶者', joinedAt: '2018-10-01', completedCourses: ['初級登山教室'], medicalCondition: '特になし', kokohelId: '100006', role: '自然保護部員' },
  { id: 7, name: '会員 G', nameKana: 'カイイン ジー', gender: '男', birthDate: '1972-05-18', phone: '090-0007-0007', email: 'member-g@example.com', address: '○○市山手区7-7-7', bloodType: 'B', insuranceKuchi: 8, emergencyContact: '家族 G1', emergencyPhone: '000-0007-0007', emergencyRelation: '配偶者', joinedAt: '2012-04-01', completedCourses: ['中級登山教室', '岩登り講座B', '海外登山'], medicalCondition: '特になし', kokohelId: '100007', role: '山行部員' },
  { id: 8, name: '会員 H', nameKana: 'カイイン エイチ', gender: '女', birthDate: '1985-09-25', phone: '090-0008-0008', email: 'member-h@example.com', address: '○○市緑区8-8-8', bloodType: 'A', insuranceKuchi: 4, emergencyContact: '家族 H1', emergencyPhone: '000-0008-0008', emergencyRelation: '親', joinedAt: '2020-04-01', completedCourses: ['初級登山教室', '岩登り講座A'], medicalCondition: '特になし', kokohelId: '100008', role: '山行部員' },
]

const INITIAL_EVENT_PLANS: EventPlan[] = [
  { id: 1, date: '2026-04-01', department: 'nature', title: '森守ボランティア', clId: 1, status: 'confirmed' },
  { id: 2, date: '2026-04-02', department: 'education', title: 'ステップアップ講座座学①', clId: 4, status: 'confirmed' },
  { id: 3, date: '2026-04-04', department: 'hiking', title: 'お試しハイク・太陽と緑の道②', clId: 3, status: 'confirmed' },
  { id: 4, date: '2026-04-04', department: 'sanko', title: '六甲山系', clId: 2, status: 'confirmed' },
  { id: 5, date: '2026-04-05', department: 'nature', title: 'クリーンハイク・新人歓迎会', clId: 6, status: 'confirmed' },
  { id: 6, date: '2026-04-11', department: 'hiking', title: '1日気象講座', clId: null, status: 'draft' },
  { id: 7, date: '2026-04-18', department: 'education', title: 'ステップアップ講座実技①', clId: 4, status: 'confirmed' },
  { id: 8, date: '2026-04-19', department: 'hiking', title: 'お試しハイク・1日登山教室', clId: null, status: 'draft' },
  { id: 9, date: '2026-05-03', department: 'nature', title: 'クリーンハイク', clId: 6, status: 'confirmed' },
  { id: 10, date: '2026-05-14', department: 'education', title: '夏山登山教室座学①', clId: 4, status: 'confirmed' },
  { id: 11, date: '2026-06-07', department: 'nature', title: 'クリーンハイク', clId: 6, status: 'confirmed' },
  { id: 12, date: '2026-06-21', department: 'organization', title: '総会', clId: null, status: 'confirmed' },
]

const INITIAL_EVENT_GUIDES: EventGuide[] = [
  { id: 1, eventPlanId: 1, startDate: '2026-04-01', endDate: '2026-04-01', mountainName: '○○山周辺', altitude: null, gradeStamina: 'O(-)', gradeSkill: null, rockCategory: null, department: 'nature', clId: 1, slId: null, meetingPlace: '○○駅', meetingTime: '09:00', course: '○○駅→登山口→山頂広場→登山口→○○駅 6km 6時間', deadline: '2026-03-20', notes: '雨天中止', requiredInsurance: 3, applicantIds: [3, 6] },
  { id: 2, eventPlanId: 5, startDate: '2026-04-05', endDate: '2026-04-05', mountainName: '△△山系', altitude: null, gradeStamina: 'O', gradeSkill: null, rockCategory: null, department: 'nature', clId: 6, slId: 1, meetingPlace: '○○駅 1階', meetingTime: '08:50', course: '○○駅→登山口→展望広場→植物園→桜谷→△△山→下山口→最寄り駅', deadline: '2026-04-05', notes: 'お試し参加可 ゴミ袋・ゴミばさみ持参 雨天決行', requiredInsurance: 3, applicantIds: [1, 2, 3, 6, 8] },
  { id: 3, eventPlanId: null, startDate: '2026-04-12', endDate: '2026-04-14', mountainName: '□□岳', altitude: 2908, gradeStamina: 'OOO', gradeSkill: '☆☆☆', rockCategory: null, department: 'sanko', clId: 2, slId: 5, meetingPlace: '○○駅北側カフェ前', meetingTime: '20:30', course: '○○駅→道の駅（前泊）→登山口→ロープウェイ→山小屋（幕営）→□□岳→下山', deadline: '2026-03-29', notes: '山行部アイゼントレ＆保険8口以上 車の提供希望', requiredInsurance: 8, applicantIds: [2, 5, 7] },
  { id: 4, eventPlanId: null, startDate: '2026-12-20', endDate: '2027-01-04', mountainName: '海外トレッキング・高所展望台', altitude: 5560, gradeStamina: 'OOOO', gradeSkill: null, rockCategory: null, department: 'sanko', clId: 7, slId: null, meetingPlace: '空港国際線ターミナル（または現地集合可）', meetingTime: '未定', course: '空港→現地空港→トレッキング起点→高所展望台5,560m→帰国', deadline: '2026-03-31', notes: 'トレッキング中はロッジ泊。シュラフ持参。高山病リスクあり。飛行機代約22万〜30万円。CL含め4名まで。', requiredInsurance: 8, applicantIds: [7] },
]

const INITIAL_PLANS: MountainPlan[] = [
  { id: 1, eventGuideId: 3, submittedAt: '2026-03-25', mountainArea: '○○山系', mountainName: '□□岳', purpose: '後期登山教室コラボ', formationType: '自主', mapReference: '登山地図「○○山系」', meetingPlace: '○○駅北側カフェ前', transport: 'マイカー', policeNotification: '登山届アプリ', itinerary: [{ date: '2026-04-12', description: '○○駅カフェ前→道の駅(前泊)' }, { date: '2026-04-13', description: '道の駅→登山口→ロープウェイ→山頂駅→山小屋(幕営) 5k3h' }, { date: '2026-04-14', description: '山小屋→独標→□□岳→山小屋→ロープウェイ→帰着21時頃 11k8h' }], escapeRoute: '引き返す', specialNotes: '山行部アイゼントレ＆保険8口以上', participants: [{ memberId: 2, role: 'CL' }, { memberId: 5, role: 'SL' }, { memberId: 7, role: '記録' }], lastReportTime: '2026-04-14 21:00', status: 'submitted' },
]

const INITIAL_RECORDS: MountainRecord[] = [
  { id: 1, planId: null, title: '岩登りA・○○岩場 岩登りを楽しもう', date: '2024-07-24', weather: '晴れ', participants: [{ memberId: 5, role: 'CL・記録' }, { memberId: 8, role: 'SL' }], access: '○○駅改札口9:00⇒9:20岩場', courseTime: '岩場9:20〜14:30クライミング、15:00ロープワーク→15:45最寄り駅', body: '平日は岩場までのバスが通っていないので、最寄り駅改札口に集合してタクシーで岩場入口まで行く。平日なので予想通り誰もいない。今日は全員が岩B経験者なので、自分で登れそうなルートをリードで登ることにする。', courseCondition: '平日なので貸し切り状態。', specialNote: 'ヒヤリハットなし。', status: 'published' },
  { id: 2, planId: null, title: '○○山系の沢登り・△△谷', date: '2024-07-27', weather: '曇り時々晴れ', participants: [{ memberId: 1, role: 'CL' }], access: '7/26 ○○市⇒△△SAで仮眠、7/27 △△SA⇒登山口バス停⇒山麓駅', courseTime: '山麓駅6:30→8:20沢入口→12:30登山道合流→14:15山頂駅', body: '標高1662mの山麓駅、水に入るのが少しためらわれるくらいの涼しさの中、歩き始める。次から次へと小滝、中滝、大滝があらわれ、ひたすら登り続けた。', courseCondition: '危険箇所なし。', specialNote: '山麓駅までのバスには、登山口バス停から路線バスに乗るのがお勧め。', status: 'published' },
]

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: 1, name: 'テント（2人用）#1', category: 'tent', condition: '良好', status: 'available', rentedBy: null, rentedAt: null, returnDue: null },
  { id: 2, name: 'テント（2人用）#2', category: 'tent', condition: '良好', status: 'rented', rentedBy: 2, rentedAt: '2026-04-10', returnDue: '2026-04-15' },
  { id: 3, name: 'テント（4人用）#1', category: 'tent', condition: '良好', status: 'available', rentedBy: null, rentedAt: null, returnDue: null },
  { id: 4, name: 'ロープ 50m #1', category: 'rope', condition: '良好', status: 'available', rentedBy: null, rentedAt: null, returnDue: null },
  { id: 5, name: 'ロープ 50m #2', category: 'rope', condition: '良好', status: 'rented', rentedBy: 5, rentedAt: '2026-04-08', returnDue: '2026-04-12' },
  { id: 6, name: 'ロープ 30m #1', category: 'rope', condition: '要点検', status: 'maintenance', rentedBy: null, rentedAt: null, returnDue: null },
  { id: 7, name: '無線機 #1', category: 'radio', condition: '良好', status: 'available', rentedBy: null, rentedAt: null, returnDue: null },
  { id: 8, name: '無線機 #2', category: 'radio', condition: '良好', status: 'available', rentedBy: null, rentedAt: null, returnDue: null },
  { id: 9, name: '無線機 #3', category: 'radio', condition: '良好', status: 'rented', rentedBy: 7, rentedAt: '2026-04-05', returnDue: '2026-04-20' },
  { id: 10, name: 'ガスコンロセット #1', category: 'cooking', condition: '良好', status: 'available', rentedBy: null, rentedAt: null, returnDue: null },
]

// ==========================================
// localStorage キー
// ==========================================

const STORAGE_KEYS = {
  members: 'yamanokai-members',
  eventPlans: 'yamanokai-eventPlans',
  eventGuides: 'yamanokai-eventGuides',
  plans: 'yamanokai-plans',
  records: 'yamanokai-records',
  equipment: 'yamanokai-equipment',
}

// ==========================================
// ユーティリティ
// ==========================================

const formatDate = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDateShort = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const m = d.getMonth() + 1
  const day = d.getDate()
  const weekday = weekdays[d.getDay()]
  return `${m}/${day}(${weekday})`
}

const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const days: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  }
  return days
}

const getNextId = <T extends { id: number }>(items: T[]): number => Math.max(0, ...items.map((i) => i.id)) + 1

const getMemberById = (members: Member[], id: number | null): Member | undefined => members.find((m) => m.id === id)

// ==========================================
// InfoSidebar データ
// ==========================================

const FEATURES: Feature[] = [
  { icon: CalendarDays, title: '例会企画・カレンダー管理', description: '月次の例会企画をカレンダー形式で管理。参加予定者の集計と装備リストの自動生成を行います。', benefit: '企画立案時間を60%短縮' },
  { icon: ClipboardList, title: '計画書管理', description: '登山計画書の作成・提出を一元管理。緊急連絡先やルート情報を含む計画書を自動生成します。', benefit: '計画書作成時間を80%短縮' },
  { icon: Users, title: '会員管理', description: '会員の基本情報・体力ランク・保険情報を一元管理。緊急連絡先も即座に確認できます。', benefit: '会員情報の検索時間を90%削減' },
  { icon: Backpack, title: '装備管理', description: '共有装備の貸出・返却を管理。装備の使用状況と次回点検日も追跡します。', benefit: '装備紛失ゼロを実現' },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '例会企画の作成', before: '1時間', after: '15分', saved: '45分/件' },
  { task: '計画書の作成', before: '2時間', after: '20分', saved: '100分/件' },
  { task: '会員情報の確認', before: '10分', after: '即時表示', saved: '10分/回' },
  { task: '装備の在庫確認', before: '30分', after: '即時表示', saved: '30分/回' },
]

const CHALLENGES = [
  '例会の企画・案内がメールやLINEでバラバラ',
  '計画書が紙やExcelで管理されていて探しにくい',
  '会員の体力ランクや保険情報が把握しきれない',
  '共有装備の貸出状況が分からない',
  '例会記録が残らず活動の振り返りができない',
]

const OVERVIEW: OverviewInfo = {
  description: '山岳会の活動全体をデジタル管理するシステムです。例会の企画から案内、計画書作成、記録、会員・装備管理まで一気通貫で運用できます。',
  automationPoints: ['例会企画のカレンダー管理と参加者集計', '計画書テンプレートによる自動生成', '会員の体力ランク・保険情報の一元管理', '共有装備の貸出・返却追跡'],
  userBenefits: ['紙やExcelでの管理から脱却し情報を一元化', '安全管理の強化（緊急連絡先・保険情報の即時確認）', '活動記録の蓄積で山岳会の知見を共有'],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: 'ダッシュボードを確認', detail: '直近の例会予定・参加状況・アラートを一目で把握' },
  { step: 2, action: '例会企画を作成', detail: '山行の日程・ルート・難易度・集合場所を登録' },
  { step: 3, action: '例会案内を配信', detail: '企画から案内を自動生成し、参加募集を開始' },
  { step: 4, action: '計画書を作成', detail: '参加者・ルート・装備リストから計画書を自動生成' },
  { step: 5, action: '例会記録を残す', detail: '活動の写真・ルートGPS・振り返りを記録' },
]

// ==========================================
// ガイダンスステップ
// ==========================================

const getGuidanceSteps = (setActiveTab: (tab: TabId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="dashboard-tab"]', title: 'ダッシュボード', description: '直近の例会予定・会員数・装備貸出状況・アラートを一目で確認できます。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="event-plan-tab"]', title: '例会企画', description: '月間カレンダーで例会の企画を管理します。部ごとに色分けして表示。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="add-plan-button"]', title: '企画の追加', description: '「企画追加」ボタンで新しい例会企画を登録します。日付・担当部・タイトルを入力。', position: 'bottom', action: () => setActiveTab('event-plan') },
  { targetSelector: '[data-guidance="event-guide-tab"]', title: '例会案内', description: '例会案内の一覧表示と参加申込ができます。難易度・集合場所・申込期限を確認。', position: 'bottom', action: () => setActiveTab('event-plan') },
  { targetSelector: '[data-guidance="guide-card"]', title: '案内の詳細', description: 'カードをクリックすると案内の詳細（コース・参加者・備考）を確認できます。', position: 'bottom', action: () => setActiveTab('event-guide') },
  { targetSelector: '[data-guidance="plan-tab"]', title: '計画書', description: '登山計画書の作成・管理を行います。ステータスで進捗を管理。', position: 'bottom', action: () => setActiveTab('event-guide') },
  { targetSelector: '[data-guidance="add-mountain-plan-button"]', title: '計画書の作成', description: '「新規作成」ボタンで登山計画書を作成します。山域・集合場所・参加者を入力。', position: 'bottom', action: () => setActiveTab('plan') },
  { targetSelector: '[data-guidance="record-tab"]', title: '例会記録', description: '例会の活動記録を残して知見を共有します。', position: 'bottom', action: () => setActiveTab('plan') },
  { targetSelector: '[data-guidance="add-record-button"]', title: '記録の作成', description: '「新規作成」ボタンで例会記録を作成します。タイトル・日程・天候・本文を入力。', position: 'bottom', action: () => setActiveTab('record') },
  { targetSelector: '[data-guidance="member-tab"]', title: '会員管理', description: '会員の基本情報・保険口数・受講歴を管理します。', position: 'bottom', action: () => setActiveTab('record') },
  { targetSelector: '[data-guidance="add-member-button"]', title: '会員の追加', description: '「会員追加」ボタンで新しい会員を登録します。氏名・連絡先・保険口数を入力。', position: 'bottom', action: () => setActiveTab('member') },
  { targetSelector: '[data-guidance="equipment-tab"]', title: '装備管理', description: '共有装備の貸出・返却と在庫を管理します。カテゴリで絞り込み可能。', position: 'bottom', action: () => setActiveTab('member') },
  { targetSelector: '[data-guidance="rent-button"]', title: '装備の貸出', description: '「貸出」ボタンで装備を会員に貸し出します。返却予定日を設定。', position: 'top', action: () => setActiveTab('equipment') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要・操作手順・時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'top', action: () => setActiveTab('equipment') },
]

// ==========================================
// メインコンポーネント
// ==========================================

const YamanokaiMock = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)

  // データ（usePersistedState）
  const [members, setMembers] = usePersistedState<Member[]>(STORAGE_KEYS.members, INITIAL_MEMBERS)
  const [eventPlans, setEventPlans] = usePersistedState<EventPlan[]>(STORAGE_KEYS.eventPlans, INITIAL_EVENT_PLANS)
  const [eventGuides, setEventGuides] = usePersistedState<EventGuide[]>(STORAGE_KEYS.eventGuides, INITIAL_EVENT_GUIDES)
  const [plans, setPlans] = usePersistedState<MountainPlan[]>(STORAGE_KEYS.plans, INITIAL_PLANS)
  const [records, setRecords] = usePersistedState<MountainRecord[]>(STORAGE_KEYS.records, INITIAL_RECORDS)
  const [equipment, setEquipment] = usePersistedState<Equipment[]>(STORAGE_KEYS.equipment, INITIAL_EQUIPMENT)

  // モーダル系
  const [modalType, setModalType] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<EventGuide | MountainPlan | MountainRecord | Member | null>(null)

  // カレンダー
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 3, 1))

  // フィルタ
  const [guideDeptFilter, setGuideDeptFilter] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [equipCatFilter, setEquipCatFilter] = useState('')

  // フォーム
  const [newEventPlan, setNewEventPlan] = useState({ date: '', department: '', title: '', clId: '' })
  const [newPlan, setNewPlan] = useState({ mountainArea: '', mountainName: '', purpose: '', formationType: '自主', meetingPlace: '', transport: '' })
  const [newRecord, setNewRecord] = useState({ title: '', date: '', weather: '', access: '', courseTime: '', body: '', courseCondition: '', specialNote: '' })
  const [newMember, setNewMember] = useState({ name: '', nameKana: '', gender: '男', phone: '', email: '', insuranceKuchi: 3 })
  const [rentForm, setRentForm] = useState({ memberId: '', returnDue: '' })
  const [rentTarget, setRentTarget] = useState<Equipment | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // ==========================================
  // ダッシュボード
  // ==========================================

  const renderDashboard = () => {
    const today = new Date()
    const upcomingEvents = eventGuides
      .filter((g) => new Date(g.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
    const rentedEquip = equipment.filter((e) => e.status === 'rented')
    const overdueEquip = rentedEquip.filter((e) => e.returnDue && new Date(e.returnDue) < today)

    return (
      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">会員数</div>
            <div className="text-2xl font-bold">{members.length}名</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">今月の例会</div>
            <div className="text-2xl font-bold">{eventGuides.filter((g) => { const d = new Date(g.startDate); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() }).length}件</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">貸出中装備</div>
            <div className="text-2xl font-bold">{rentedEquip.length}点</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">返却期限超過</div>
            <div className={`text-2xl font-bold ${overdueEquip.length > 0 ? 'text-red-600' : ''}`}>{overdueEquip.length}点</div>
          </div>
        </div>

        {/* 直近の例会案内 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">直近の例会案内</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">予定されている例会はありません</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const dept = DEPARTMENTS[event.department]
                const cl = getMemberById(members, event.clId)
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept?.color }} />
                      <div>
                        <div className="font-medium">{formatDateShort(event.startDate)}{event.endDate !== event.startDate && ` 〜 ${formatDateShort(event.endDate)}`}</div>
                        <div className="text-sm text-gray-600">{event.mountainName} {event.altitude && `${event.altitude}m`}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: dept?.bgColor, color: dept?.color }}>{dept?.name}</span>
                      <div className="text-sm text-gray-500 mt-1">CL: {cl?.name || '未定'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 返却期限超過アラート */}
        {overdueEquip.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-red-900 mb-3">返却期限超過の装備</h2>
            <div className="space-y-2">
              {overdueEquip.map((eq) => {
                const renter = getMemberById(members, eq.rentedBy)
                return (
                  <div key={eq.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium">{eq.name} <span className="text-sm text-gray-500">（{renter?.name}）</span></span>
                    <span className="text-sm text-red-600">期限: {formatDateShort(eq.returnDue!)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================================
  // 例会企画（カレンダー）
  // ==========================================

  const renderEventPlan = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const days = generateCalendarDays(year, month)

    const getPlansForDate = (date: Date) => {
      const dateStr = formatDate(date)
      return eventPlans.filter((p) => p.date === dateStr)
    }

    const handleAddEventPlan = () => {
      if (newEventPlan.date && newEventPlan.department && newEventPlan.title) {
        setEventPlans((prev) => [...prev, { id: getNextId(prev), date: newEventPlan.date, department: newEventPlan.department, title: newEventPlan.title, clId: newEventPlan.clId ? parseInt(newEventPlan.clId) : null, status: 'draft' }])
        setNewEventPlan({ date: '', department: '', title: '', clId: '' })
        setModalType(null)
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">例会企画</h2>
          <button data-guidance="add-plan-button" onClick={() => setModalType('addEventPlan')} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> 企画追加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {/* カレンダーヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold">{year}年 {month + 1}月</h3>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* 凡例 */}
          <div className="flex flex-wrap gap-3 mb-4 text-sm">
            {Object.values(DEPARTMENTS).map((dept) => (
              <div key={dept.id} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <span>{dept.name}</span>
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
              <div key={d} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600">{d}</div>
            ))}
            {days.map((dayInfo, index) => {
              const plansForDay = getPlansForDate(dayInfo.date)
              const isToday = formatDate(dayInfo.date) === formatDate(new Date())
              return (
                <div key={index} className={`bg-white min-h-24 p-1 ${!dayInfo.isCurrentMonth ? 'opacity-50' : ''} ${isToday ? 'ring-2 ring-emerald-500' : ''}`}>
                  <div className={`text-sm ${dayInfo.date.getDay() === 0 ? 'text-red-500' : dayInfo.date.getDay() === 6 ? 'text-blue-500' : ''}`}>{dayInfo.date.getDate()}</div>
                  <div className="space-y-1 mt-1">
                    {plansForDay.map((plan) => {
                      const dept = DEPARTMENTS[plan.department]
                      return (
                        <div key={plan.id} className="text-xs p-1 rounded truncate" style={{ backgroundColor: dept?.bgColor, color: dept?.color }} title={plan.title}>{plan.title}</div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 企画追加モーダル */}
        <Modal isOpen={modalType === 'addEventPlan'} onClose={() => setModalType(null)} title="例会企画を追加">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">日付 <span className="text-red-500">*</span></label><input type="date" value={newEventPlan.date} onChange={(e) => setNewEventPlan({ ...newEventPlan, date: e.target.value })} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">担当部 <span className="text-red-500">*</span></label><select value={newEventPlan.department} onChange={(e) => setNewEventPlan({ ...newEventPlan, department: e.target.value })} className="w-full px-3 py-2 border rounded-md"><option value="">選択してください</option>{Object.values(DEPARTMENTS).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label><input value={newEventPlan.title} onChange={(e) => setNewEventPlan({ ...newEventPlan, title: e.target.value })} placeholder="例: クリーンハイク" className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CL</label><select value={newEventPlan.clId} onChange={(e) => setNewEventPlan({ ...newEventPlan, clId: e.target.value })} className="w-full px-3 py-2 border rounded-md"><option value="">未定</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={handleAddEventPlan} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">追加</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ==========================================
  // 例会案内
  // ==========================================

  const renderEventGuide = () => {
    const currentMemberId = 3
    const filteredGuides = eventGuides
      .filter((g) => !guideDeptFilter || g.department === guideDeptFilter)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    const handleApply = (guideId: number) => {
      setEventGuides((prev) => prev.map((g) => g.id === guideId && !g.applicantIds.includes(currentMemberId) ? { ...g, applicantIds: [...g.applicantIds, currentMemberId] } : g))
    }

    const handleCancel = (guideId: number) => {
      setEventGuides((prev) => prev.map((g) => g.id === guideId ? { ...g, applicantIds: g.applicantIds.filter((id) => id !== currentMemberId) } : g))
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">例会案内</h2>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">担当部</label>
          <select value={guideDeptFilter} onChange={(e) => setGuideDeptFilter(e.target.value)} className="w-48 px-3 py-2 border rounded-md">
            <option value="">すべて</option>
            {Object.values(DEPARTMENTS).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {filteredGuides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">該当する例会案内はありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuides.map((guide, idx) => {
              const dept = DEPARTMENTS[guide.department]
              const cl = getMemberById(members, guide.clId)
              const sl = getMemberById(members, guide.slId)
              const isApplied = guide.applicantIds.includes(currentMemberId)
              const isDeadlinePassed = new Date(guide.deadline) < new Date()

              return (
                <div key={guide.id} {...(idx === 0 ? { 'data-guidance': 'guide-card' } : {})} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedItem(guide); setModalType('guideDetail') }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: dept?.bgColor, color: dept?.color }}>{dept?.name}</span>
                    <span className="text-sm text-gray-500">申込: {guide.applicantIds.length}名</span>
                  </div>
                  <h3 className="font-semibold mb-1">{guide.mountainName} {guide.altitude && `${guide.altitude}m`}</h3>
                  <div className="text-sm text-gray-600 mb-2">{formatDateShort(guide.startDate)}{guide.endDate !== guide.startDate && ` 〜 ${formatDateShort(guide.endDate)}`}</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {guide.gradeStamina && <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{guide.gradeStamina}</span>}
                    {guide.gradeSkill && <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">{guide.gradeSkill}</span>}
                    {guide.rockCategory && <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">岩{guide.rockCategory}</span>}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    <div>CL: {cl?.name || '未定'} {sl && `/ SL: ${sl.name}`}</div>
                    <div>集合: {guide.meetingPlace} {guide.meetingTime}</div>
                    <div>申込期限: {formatDateShort(guide.deadline)}</div>
                  </div>
                  <div className="flex justify-end">
                    {isApplied ? (
                      <button onClick={(e) => { e.stopPropagation(); handleCancel(guide.id) }} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300">申込取消</button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleApply(guide.id) }} disabled={isDeadlinePassed} className={`px-3 py-1 text-sm rounded ${isDeadlinePassed ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>{isDeadlinePassed ? '締切済' : '申込む'}</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 案内詳細モーダル */}
        <Modal isOpen={modalType === 'guideDetail' && !!selectedItem} onClose={() => { setModalType(null); setSelectedItem(null) }} title="例会案内詳細" maxWidth="max-w-2xl">
          {selectedItem && 'mountainName' in selectedItem && 'applicantIds' in selectedItem && (() => {
            const guide = selectedItem as EventGuide
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: DEPARTMENTS[guide.department]?.bgColor, color: DEPARTMENTS[guide.department]?.color }}>{DEPARTMENTS[guide.department]?.name}</span>
                  {guide.gradeStamina && <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{guide.gradeStamina}</span>}
                  {guide.gradeSkill && <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">{guide.gradeSkill}</span>}
                </div>
                <h2 className="text-xl font-bold">{guide.mountainName} {guide.altitude && `${guide.altitude}m`}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">日程:</span> {formatDateShort(guide.startDate)}{guide.endDate !== guide.startDate && ` 〜 ${formatDateShort(guide.endDate)}`}</div>
                  <div><span className="text-gray-500">CL:</span> {getMemberById(members, guide.clId)?.name || '未定'}</div>
                  <div><span className="text-gray-500">集合場所:</span> {guide.meetingPlace}</div>
                  <div><span className="text-gray-500">集合時間:</span> {guide.meetingTime}</div>
                  <div><span className="text-gray-500">必要保険口数:</span> {guide.requiredInsurance}口以上</div>
                  <div><span className="text-gray-500">申込期限:</span> {formatDateShort(guide.deadline)}</div>
                </div>
                <div><span className="text-gray-500">コース:</span><p className="mt-1">{guide.course}</p></div>
                {guide.notes && <div><span className="text-gray-500">備考:</span><p className="mt-1">{guide.notes}</p></div>}
                <div>
                  <span className="text-gray-500">参加者 ({guide.applicantIds.length}名):</span>
                  <div className="flex flex-wrap gap-2 mt-2">{guide.applicantIds.map((id) => <span key={id} className="px-2 py-0.5 rounded text-xs bg-gray-100">{getMemberById(members, id)?.name}</span>)}</div>
                </div>
              </div>
            )
          })()}
        </Modal>
      </div>
    )
  }

  // ==========================================
  // 計画書
  // ==========================================

  const renderPlanList = () => {
    const handleAddPlan = () => {
      if (newPlan.mountainName && newPlan.meetingPlace) {
        setPlans((prev) => [...prev, { id: getNextId(prev), eventGuideId: null, submittedAt: formatDate(new Date()), mountainArea: newPlan.mountainArea, mountainName: newPlan.mountainName, purpose: newPlan.purpose, formationType: newPlan.formationType, mapReference: '', meetingPlace: newPlan.meetingPlace, transport: newPlan.transport, policeNotification: 'コンパス', itinerary: [], escapeRoute: '', specialNotes: '', participants: [], lastReportTime: '', status: 'draft' }])
        setNewPlan({ mountainArea: '', mountainName: '', purpose: '', formationType: '自主', meetingPlace: '', transport: '' })
        setModalType(null)
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">計画書</h2>
          <button data-guidance="add-mountain-plan-button" onClick={() => setModalType('addPlan')} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> 新規作成
          </button>
        </div>

        {plans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">計画書はありません</p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const cl = plan.participants.find((p) => p.role === 'CL')
              const clMember = cl ? getMemberById(members, cl.memberId) : undefined
              const statusColor = plan.status === 'approved' ? 'bg-green-100 text-green-800' : plan.status === 'submitted' ? 'bg-blue-100 text-blue-800' : plan.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
              return (
                <div key={plan.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedItem(plan as unknown as MountainPlan); setModalType('planDetail') }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{PLAN_STATUS_LABELS[plan.status]}</span>
                        <span className="text-sm text-gray-500">{formatDateShort(plan.submittedAt)}</span>
                      </div>
                      <h3 className="font-semibold">{plan.mountainArea && `${plan.mountainArea}・`}{plan.mountainName}</h3>
                      <div className="text-sm text-gray-600 mt-1">CL: {clMember?.name || '未定'} / 参加者: {plan.participants.length}名</div>
                    </div>
                    <div className="text-sm text-gray-500">{plan.purpose}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 計画書詳細モーダル */}
        <Modal isOpen={modalType === 'planDetail' && !!selectedItem} onClose={() => { setModalType(null); setSelectedItem(null) }} title="計画書詳細" maxWidth="max-w-2xl">
          {selectedItem && 'itinerary' in selectedItem && (() => {
            const plan = selectedItem as unknown as MountainPlan
            return (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">山域・山名:</span> <span className="font-medium">{plan.mountainArea && `${plan.mountainArea}・`}{plan.mountainName}</span></div>
                  <div><span className="text-gray-500">目的:</span> {plan.purpose}</div>
                  <div><span className="text-gray-500">山行形態:</span> {plan.formationType}</div>
                  <div><span className="text-gray-500">届出:</span> {plan.policeNotification}</div>
                </div>
                <div><span className="text-gray-500">集合:</span> {plan.meetingPlace}</div>
                {plan.itinerary.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">行程</h4>
                    <div className="space-y-2">{plan.itinerary.map((item, i) => <div key={i} className="text-sm p-2 bg-gray-50 rounded"><span className="font-medium">{formatDateShort(item.date)}</span> {item.description}</div>)}</div>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">参加者</h4>
                  <div className="flex flex-wrap gap-2">{plan.participants.map((p) => <span key={p.memberId} className="px-2 py-0.5 rounded text-xs bg-gray-100">{p.role}: {getMemberById(members, p.memberId)?.name}</span>)}</div>
                </div>
                {plan.escapeRoute && <div><span className="text-gray-500">エスケープルート:</span> {plan.escapeRoute}</div>}
                {plan.specialNotes && <div><span className="text-gray-500">特記事項:</span> {plan.specialNotes}</div>}
              </div>
            )
          })()}
        </Modal>

        {/* 新規作成モーダル */}
        <Modal isOpen={modalType === 'addPlan'} onClose={() => setModalType(null)} title="計画書を作成" maxWidth="max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">山域</label><input value={newPlan.mountainArea} onChange={(e) => setNewPlan({ ...newPlan, mountainArea: e.target.value })} placeholder="例: 北アルプス" className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">山名 <span className="text-red-500">*</span></label><input value={newPlan.mountainName} onChange={(e) => setNewPlan({ ...newPlan, mountainName: e.target.value })} placeholder="例: 槍ヶ岳" className="w-full px-3 py-2 border rounded-md" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">目的</label><input value={newPlan.purpose} onChange={(e) => setNewPlan({ ...newPlan, purpose: e.target.value })} placeholder="例: ハイキング" className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">山行形態</label><select value={newPlan.formationType} onChange={(e) => setNewPlan({ ...newPlan, formationType: e.target.value })} className="w-full px-3 py-2 border rounded-md"><option value="自主">自主</option><option value="例会">例会</option><option value="講座">講座</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">集合場所・時間 <span className="text-red-500">*</span></label><input value={newPlan.meetingPlace} onChange={(e) => setNewPlan({ ...newPlan, meetingPlace: e.target.value })} placeholder="例: JR三ノ宮駅 8:00" className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">交通機関</label><input value={newPlan.transport} onChange={(e) => setNewPlan({ ...newPlan, transport: e.target.value })} placeholder="例: マイカー" className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={handleAddPlan} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">作成</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ==========================================
  // 例会記録
  // ==========================================

  const renderRecordList = () => {
    const handleAddRecord = () => {
      if (newRecord.title && newRecord.date) {
        setRecords((prev) => [...prev, { id: getNextId(prev), planId: null, title: newRecord.title, date: newRecord.date, weather: newRecord.weather, participants: [], access: newRecord.access, courseTime: newRecord.courseTime, body: newRecord.body, courseCondition: newRecord.courseCondition, specialNote: newRecord.specialNote, status: 'draft' }])
        setNewRecord({ title: '', date: '', weather: '', access: '', courseTime: '', body: '', courseCondition: '', specialNote: '' })
        setModalType(null)
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">例会記録</h2>
          <button data-guidance="add-record-button" onClick={() => setModalType('addRecord')} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> 新規作成
          </button>
        </div>

        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">例会記録はありません</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const cl = record.participants.find((p) => p.role.includes('CL'))
              const clMember = cl ? getMemberById(members, cl.memberId) : undefined
              const statusColor = record.status === 'published' ? 'bg-green-100 text-green-800' : record.status === 'submitted' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              return (
                <div key={record.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedItem(record as unknown as MountainRecord); setModalType('recordDetail') }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{RECORD_STATUS_LABELS[record.status]}</span>
                    <span className="text-sm text-gray-500">{formatDateShort(record.date)}</span>
                    <span className="text-sm text-gray-500">{record.weather}</span>
                  </div>
                  <h3 className="font-semibold">{record.title}</h3>
                  <div className="text-sm text-gray-600 mt-1">{clMember && `CL: ${clMember.name} / `}参加者: {record.participants.length}名</div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{record.body}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* 記録詳細モーダル */}
        <Modal isOpen={modalType === 'recordDetail' && !!selectedItem} onClose={() => { setModalType(null); setSelectedItem(null) }} title="例会記録詳細" maxWidth="max-w-2xl">
          {selectedItem && 'body' in selectedItem && 'courseTime' in selectedItem && (() => {
            const rec = selectedItem as unknown as MountainRecord
            return (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h2 className="text-xl font-bold">{rec.title}</h2>
                <div className="flex items-center gap-4 text-sm"><span>{formatDateShort(rec.date)}</span><span>天候: {rec.weather}</span></div>
                <div><span className="text-gray-500">アクセス:</span> {rec.access}</div>
                <div><span className="text-gray-500">コースタイム:</span> {rec.courseTime}</div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">参加者</h4>
                  <div className="flex flex-wrap gap-2">{rec.participants.map((p) => <span key={p.memberId} className="px-2 py-0.5 rounded text-xs bg-gray-100">{p.role}: {getMemberById(members, p.memberId)?.name}</span>)}</div>
                </div>
                <div><h4 className="font-medium text-gray-700 mb-2">本文</h4><div className="whitespace-pre-wrap text-sm">{rec.body}</div></div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">コース状況:</span> {rec.courseCondition}</div>
                  <div><span className="text-gray-500">特記事項:</span> {rec.specialNote}</div>
                </div>
              </div>
            )
          })()}
        </Modal>

        {/* 新規作成モーダル */}
        <Modal isOpen={modalType === 'addRecord'} onClose={() => setModalType(null)} title="例会記録を作成" maxWidth="max-w-2xl">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label><input value={newRecord.title} onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })} placeholder="例: 岩登りA・蓬莱峡" className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">日程 <span className="text-red-500">*</span></label><input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">天候</label><input value={newRecord.weather} onChange={(e) => setNewRecord({ ...newRecord, weather: e.target.value })} placeholder="例: 晴れ" className="w-full px-3 py-2 border rounded-md" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">アクセス</label><input value={newRecord.access} onChange={(e) => setNewRecord({ ...newRecord, access: e.target.value })} placeholder="例: 阪急宝塚駅9:00⇒蓬莱峡9:20" className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">コースタイム</label><input value={newRecord.courseTime} onChange={(e) => setNewRecord({ ...newRecord, courseTime: e.target.value })} placeholder="例: 蓬莱峡9:20〜14:30クライミング" className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">本文</label><textarea value={newRecord.body} onChange={(e) => setNewRecord({ ...newRecord, body: e.target.value })} rows={6} placeholder="山行記録の本文を入力..." className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">コース状況</label><input value={newRecord.courseCondition} onChange={(e) => setNewRecord({ ...newRecord, courseCondition: e.target.value })} placeholder="例: 危険箇所なし" className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">特記事項</label><input value={newRecord.specialNote} onChange={(e) => setNewRecord({ ...newRecord, specialNote: e.target.value })} placeholder="例: ヒヤリハットなし" className="w-full px-3 py-2 border rounded-md" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={handleAddRecord} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">作成</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ==========================================
  // 会員管理
  // ==========================================

  const renderMemberManagement = () => {
    const filteredMembers = members.filter((m) => {
      if (!memberSearch) return true
      const q = memberSearch.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.nameKana.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    })

    const handleAddMember = () => {
      if (newMember.name && newMember.email) {
        setMembers((prev) => [...prev, { id: getNextId(prev), name: newMember.name, nameKana: newMember.nameKana, gender: newMember.gender, birthDate: '', phone: newMember.phone, email: newMember.email, address: '', bloodType: '', insuranceKuchi: newMember.insuranceKuchi, emergencyContact: '', emergencyPhone: '', emergencyRelation: '', joinedAt: formatDate(new Date()), completedCourses: [], medicalCondition: '', kokohelId: '', role: '' }])
        setNewMember({ name: '', nameKana: '', gender: '男', phone: '', email: '', insuranceKuchi: 3 })
        setModalType(null)
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">会員管理</h2>
          <button data-guidance="add-member-button" onClick={() => setModalType('addMember')} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            <Plus className="w-4 h-4" /> 会員追加
          </button>
        </div>

        {/* 検索 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="名前・メールアドレスで検索..." className="w-full pl-10 pr-3 py-2 border rounded-md" />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">該当する会員はいません</p>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedItem(member); setModalType('memberDetail') }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-medium">{member.name.charAt(0)}</div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.nameKana}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${member.insuranceKuchi >= 8 ? 'bg-green-100 text-green-800' : member.insuranceKuchi >= 4 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>保険{member.insuranceKuchi}口</span>
                      {member.role && <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">{member.role}</span>}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{member.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 会員詳細モーダル */}
        <Modal isOpen={modalType === 'memberDetail' && !!selectedItem} onClose={() => { setModalType(null); setSelectedItem(null) }} title="会員詳細" maxWidth="max-w-2xl">
          {selectedItem && 'nameKana' in selectedItem && 'insuranceKuchi' in selectedItem && (() => {
            const m = selectedItem as Member
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-medium">{m.name.charAt(0)}</div>
                  <div><h2 className="text-xl font-bold">{m.name}</h2><div className="text-gray-500">{m.nameKana}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">性別:</span> {m.gender}</div>
                  <div><span className="text-gray-500">生年月日:</span> {m.birthDate || '未登録'}</div>
                  <div><span className="text-gray-500">電話:</span> {m.phone}</div>
                  <div><span className="text-gray-500">メール:</span> {m.email}</div>
                  <div><span className="text-gray-500">血液型:</span> {m.bloodType || '未登録'}</div>
                  <div><span className="text-gray-500">労山基金:</span> {m.insuranceKuchi}口</div>
                  <div><span className="text-gray-500">入会日:</span> {formatDateShort(m.joinedAt)}</div>
                  <div><span className="text-gray-500">ココヘリID:</span> {m.kokohelId || '未登録'}</div>
                </div>
                <div><span className="text-gray-500">住所:</span> {m.address || '未登録'}</div>
                <div><span className="text-gray-500">緊急連絡先:</span> {m.emergencyContact ? `${m.emergencyContact}（${m.emergencyRelation}）${m.emergencyPhone}` : '未登録'}</div>
                <div>
                  <span className="text-gray-500">受講済講座:</span>
                  <div className="flex flex-wrap gap-2 mt-1">{m.completedCourses.length > 0 ? m.completedCourses.map((c, i) => <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100">{c}</span>) : <span className="text-gray-400">なし</span>}</div>
                </div>
                {m.medicalCondition && <div><span className="text-gray-500">持病:</span> {m.medicalCondition}</div>}
              </div>
            )
          })()}
        </Modal>

        {/* 会員追加モーダル */}
        <Modal isOpen={modalType === 'addMember'} onClose={() => setModalType(null)} title="会員を追加">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label><input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="例: 山田 太郎" className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label><input value={newMember.nameKana} onChange={(e) => setNewMember({ ...newMember, nameKana: e.target.value })} placeholder="例: ヤマダ タロウ" className="w-full px-3 py-2 border rounded-md" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">性別</label><select value={newMember.gender} onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })} className="w-full px-3 py-2 border rounded-md"><option value="男">男</option><option value="女">女</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">労山基金口数</label><select value={newMember.insuranceKuchi} onChange={(e) => setNewMember({ ...newMember, insuranceKuchi: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-md"><option value={3}>3口</option><option value={4}>4口</option><option value={8}>8口</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label><input value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} placeholder="例: 090-1234-5678" className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label><input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} placeholder="例: yamada@example.com" className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={handleAddMember} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">追加</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ==========================================
  // 装備管理
  // ==========================================

  const renderEquipmentManagement = () => {
    const filteredEquip = equipCatFilter ? equipment.filter((e) => e.category === equipCatFilter) : equipment

    const handleRent = () => {
      if (rentTarget && rentForm.memberId && rentForm.returnDue) {
        setEquipment((prev) => prev.map((e) => e.id === rentTarget.id ? { ...e, status: 'rented' as const, rentedBy: parseInt(rentForm.memberId), rentedAt: formatDate(new Date()), returnDue: rentForm.returnDue } : e))
        setRentForm({ memberId: '', returnDue: '' })
        setRentTarget(null)
        setModalType(null)
      }
    }

    const handleReturn = (id: number) => {
      setEquipment((prev) => prev.map((e) => e.id === id ? { ...e, status: 'available' as const, rentedBy: null, rentedAt: null, returnDue: null } : e))
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">装備管理</h2>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <select value={equipCatFilter} onChange={(e) => setEquipCatFilter(e.target.value)} className="w-48 px-3 py-2 border rounded-md">
            <option value="">すべて</option>
            {Object.entries(EQUIPMENT_CATEGORIES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>

        {filteredEquip.length === 0 ? (
          <p className="text-gray-500 text-center py-8">該当する装備はありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquip.map((eq, idx) => {
              const renter = eq.rentedBy ? getMemberById(members, eq.rentedBy) : undefined
              const isOverdue = eq.returnDue && new Date(eq.returnDue) < new Date()
              const statusColor = eq.status === 'available' ? 'bg-green-100 text-green-800' : eq.status === 'rented' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'

              return (
                <div key={eq.id} className={`bg-white rounded-lg shadow p-4 ${isOverdue ? 'border border-red-300 bg-red-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${eq.category === 'tent' ? 'bg-green-100 text-green-800' : eq.category === 'rope' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{EQUIPMENT_CATEGORIES[eq.category]}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{EQUIPMENT_STATUS_LABELS[eq.status]}</span>
                  </div>
                  <h3 className="font-medium mb-1">{eq.name}</h3>
                  <div className="text-sm text-gray-500 mb-3">状態: {eq.condition}</div>
                  {eq.status === 'rented' && renter && (
                    <div className="text-sm mb-3">
                      <div>貸出先: {renter.name}</div>
                      <div className={isOverdue ? 'text-red-600 font-medium' : ''}>返却期限: {formatDateShort(eq.returnDue!)}{isOverdue && ' ⚠ 超過'}</div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    {eq.status === 'available' ? (
                      <button {...(idx === 0 || (idx > 0 && filteredEquip.slice(0, idx).every(e => e.status !== 'available')) ? { 'data-guidance': 'rent-button' } : {})} onClick={() => { setRentTarget(eq); setModalType('rentEquipment') }} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">貸出</button>
                    ) : eq.status === 'rented' ? (
                      <button onClick={() => handleReturn(eq.id)} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300">返却</button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 貸出モーダル */}
        <Modal isOpen={modalType === 'rentEquipment' && !!rentTarget} onClose={() => { setModalType(null); setRentTarget(null) }} title="装備を貸出">
          <div className="space-y-4">
            {rentTarget && (
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{rentTarget.name}</div>
                <div className="text-sm text-gray-500">{EQUIPMENT_CATEGORIES[rentTarget.category]}</div>
              </div>
            )}
            <div><label className="block text-sm font-medium text-gray-700 mb-1">貸出先会員 <span className="text-red-500">*</span></label><select value={rentForm.memberId} onChange={(e) => setRentForm({ ...rentForm, memberId: e.target.value })} className="w-full px-3 py-2 border rounded-md"><option value="">選択してください</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">返却予定日 <span className="text-red-500">*</span></label><input type="date" value={rentForm.returnDue} onChange={(e) => setRentForm({ ...rentForm, returnDue: e.target.value })} className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => { setModalType(null); setRentTarget(null) }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={handleRent} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">貸出する</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ==========================================
  // タブコンテンツ切り替え
  // ==========================================

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'event-plan': return renderEventPlan()
      case 'event-guide': return renderEventGuide()
      case 'plan': return renderPlanList()
      case 'record': return renderRecordList()
      case 'member': return renderMemberManagement()
      case 'equipment': return renderEquipmentManagement()
      default: return null
    }
  }

  // ==========================================
  // レンダリング
  // ==========================================

  if (showSplash) {
    return <SplashScreen theme="emerald" systemName="山岳会管理システム" subtitle="Alpine Club Manager" />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <MockHeader>
        <MockHeaderTitle icon={Mountain} title="Alpine Club Manager" subtitle="山岳会管理システム" theme="emerald" />

        <div className="flex items-center gap-2">
          <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="emerald" />
          <ResetButton storageKeys={STORAGE_KEYS} theme="emerald" />

          {TABS.map((tab) => (
            <MockHeaderTab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              theme="emerald"
              data-guidance={`${tab.id}-tab`}
            />
          ))}

          <MockHeaderInfoButton onClick={() => setShowInfoSidebar(true)} theme="emerald" />
        </div>
      </MockHeader>

      {/* メインコンテンツ */}
      <main className="p-4 md:p-6">
        {renderContent()}
      </main>

      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="emerald"
        systemIcon={Mountain}
        systemName="山岳会管理システム"
        systemDescription="山岳会の活動全体をデジタル管理するシステムです。例会の企画から案内、計画書、記録、会員・装備管理まで一気通貫で運用できます。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
        overview={OVERVIEW}
        operationSteps={OPERATION_STEPS}
      />

      <GuidanceOverlay
        steps={getGuidanceSteps(setActiveTab)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="emerald"
      />
    </div>
  )
}

export default YamanokaiMock
