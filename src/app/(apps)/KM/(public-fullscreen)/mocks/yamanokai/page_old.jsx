"use client";

/**
 * 山岳会システム モックアップ
 *
 * こちらはモックであり、単一ファイルに収まるよう構築されています。
 * このページは最終的に削除するため、本番プロジェクトでは、
 * プロジェクトの設計やルールに従ってページやコンポーネントを分割してください。
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  SplashScreen,
  InfoSidebar,
  GuidanceOverlay,
  GuidanceStartButton,
} from "../_components";
import {
  Mountain,
  CalendarDays,
  ClipboardList,
  Megaphone,
  FileText,
  BookOpen,
  Users,
  Backpack,
  PanelRightOpen,
} from "lucide-react";

// =============================================================================
// 定数・サンプルデータ
// =============================================================================

/** 部署 */
const DEPARTMENTS = {
  hiking: { id: "hiking", name: "ハイキング部", color: "#22c55e", bgColor: "#dcfce7" },
  sanko: { id: "sanko", name: "山行部", color: "#3b82f6", bgColor: "#dbeafe" },
  education: { id: "education", name: "教育部", color: "#a855f7", bgColor: "#f3e8ff" },
  nature: { id: "nature", name: "自然保護部", color: "#eab308", bgColor: "#fef9c3" },
  organization: { id: "organization", name: "組織部", color: "#6b7280", bgColor: "#f3f4f6" },
};

/** 体力度グレード */
const STAMINA_GRADES = ["(^^)", "O(-)", "O", "O(+)", "OO", "OOO", "OOOO"];

/** 技術度グレード */
const SKILL_GRADES = ["☆", "☆☆", "☆☆☆"];

/** 岩登り区分 */
const ROCK_CATEGORIES = ["A", "B", "C"];

/** 労山基金口数条件 */
const INSURANCE_REQUIREMENTS = {
  hiking: { kuchi: 3, label: "ハイキング" },
  rockA: { kuchi: 4, label: "岩A・沢入門" },
  alpine: { kuchi: 8, label: "アルパイン・雪山・岩BC・沢" },
};

/** 装備カテゴリ */
const EQUIPMENT_CATEGORIES = {
  tent: "テント",
  rope: "ロープ",
  radio: "無線機",
  climbing: "登攀具",
  cooking: "調理器具",
  other: "その他",
};

/** 装備状態 */
const EQUIPMENT_STATUS = {
  available: "貸出可",
  rented: "貸出中",
  maintenance: "メンテナンス中",
};

/** 計画書ステータス */
const PLAN_STATUS = {
  draft: "下書き",
  submitted: "提出済",
  approved: "承認済",
  completed: "完了",
};

/** 記録ステータス */
const RECORD_STATUS = {
  draft: "下書き",
  submitted: "提出済",
  published: "掲載済",
};

/** 初期会員データ */
const INITIAL_MEMBERS = [
  {
    id: 1,
    name: "会員 A",
    nameKana: "カイイン エー",
    gender: "男",
    birthDate: "1965-04-15",
    phone: "090-0001-0001",
    email: "member-a@example.com",
    address: "○○市中央区1-1-1",
    bloodType: "A",
    insuranceKuchi: 8,
    emergencyContact: "家族 A1",
    emergencyPhone: "000-0001-0001",
    emergencyRelation: "配偶者",
    joinedAt: "2010-04-01",
    completedCourses: ["初級登山教室", "岩登り講座A", "沢登り入門"],
    medicalCondition: "特になし",
    kokohelId: "100001",
    role: "自然保護部長",
  },
  {
    id: 2,
    name: "会員 B",
    nameKana: "カイイン ビー",
    gender: "男",
    birthDate: "1970-08-22",
    phone: "090-0002-0002",
    email: "member-b@example.com",
    address: "○○市北区2-2-2",
    bloodType: "O",
    insuranceKuchi: 8,
    emergencyContact: "家族 B1",
    emergencyPhone: "000-0002-0002",
    emergencyRelation: "配偶者",
    joinedAt: "2008-06-15",
    completedCourses: ["中級登山教室", "岩登り講座B", "雪山ハイキング講座"],
    medicalCondition: "特になし",
    kokohelId: "100002",
    role: "山行部員",
  },
  {
    id: 3,
    name: "会員 C",
    nameKana: "カイイン シー",
    gender: "女",
    birthDate: "1975-03-10",
    phone: "090-0003-0003",
    email: "member-c@example.com",
    address: "○○市東区3-3-3",
    bloodType: "B",
    insuranceKuchi: 4,
    emergencyContact: "家族 C1",
    emergencyPhone: "000-0003-0003",
    emergencyRelation: "配偶者",
    joinedAt: "2015-09-01",
    completedCourses: ["初級登山教室"],
    medicalCondition: "花粉症",
    kokohelId: "100003",
    role: "ハイキング部員",
  },
  {
    id: 4,
    name: "会員 D",
    nameKana: "カイイン ディー",
    gender: "男",
    birthDate: "1968-11-05",
    phone: "090-0004-0004",
    email: "member-d@example.com",
    address: "○○市南区4-4-4",
    bloodType: "AB",
    insuranceKuchi: 8,
    emergencyContact: "家族 D1",
    emergencyPhone: "000-0004-0004",
    emergencyRelation: "配偶者",
    joinedAt: "2005-04-01",
    completedCourses: ["中級登山教室", "岩登り講座C", "雪山講座"],
    medicalCondition: "特になし",
    kokohelId: "100004",
    role: "教育部長",
  },
  {
    id: 5,
    name: "会員 E",
    nameKana: "カイイン イー",
    gender: "男",
    birthDate: "1960-07-20",
    phone: "090-0005-0005",
    email: "member-e@example.com",
    address: "○○市西区5-5-5",
    bloodType: "A",
    insuranceKuchi: 8,
    emergencyContact: "家族 E1",
    emergencyPhone: "000-0005-0005",
    emergencyRelation: "配偶者",
    joinedAt: "2000-04-01",
    completedCourses: ["中級登山教室", "岩登り講座C", "アルパイン講座"],
    medicalCondition: "持病あり（服薬中）",
    kokohelId: "100005",
    role: "山行部員",
  },
  {
    id: 6,
    name: "会員 F",
    nameKana: "カイイン エフ",
    gender: "女",
    birthDate: "1980-12-03",
    phone: "090-0006-0006",
    email: "member-f@example.com",
    address: "○○市港区6-6-6",
    bloodType: "O",
    insuranceKuchi: 4,
    emergencyContact: "家族 F1",
    emergencyPhone: "000-0006-0006",
    emergencyRelation: "配偶者",
    joinedAt: "2018-10-01",
    completedCourses: ["初級登山教室"],
    medicalCondition: "特になし",
    kokohelId: "100006",
    role: "自然保護部員",
  },
  {
    id: 7,
    name: "会員 G",
    nameKana: "カイイン ジー",
    gender: "男",
    birthDate: "1972-05-18",
    phone: "090-0007-0007",
    email: "member-g@example.com",
    address: "○○市山手区7-7-7",
    bloodType: "B",
    insuranceKuchi: 8,
    emergencyContact: "家族 G1",
    emergencyPhone: "000-0007-0007",
    emergencyRelation: "配偶者",
    joinedAt: "2012-04-01",
    completedCourses: ["中級登山教室", "岩登り講座B", "海外登山"],
    medicalCondition: "特になし",
    kokohelId: "100007",
    role: "山行部員",
  },
  {
    id: 8,
    name: "会員 H",
    nameKana: "カイイン エイチ",
    gender: "女",
    birthDate: "1985-09-25",
    phone: "090-0008-0008",
    email: "member-h@example.com",
    address: "○○市緑区8-8-8",
    bloodType: "A",
    insuranceKuchi: 4,
    emergencyContact: "家族 H1",
    emergencyPhone: "000-0008-0008",
    emergencyRelation: "親",
    joinedAt: "2020-04-01",
    completedCourses: ["初級登山教室", "岩登り講座A"],
    medicalCondition: "特になし",
    kokohelId: "100008",
    role: "山行部員",
  },
];

/** 初期例会企画データ（2026年4月〜6月） */
const INITIAL_EVENT_PLANS = [
  { id: 1, date: "2026-04-01", department: "nature", title: "森守ボランティア", clId: 1, status: "confirmed" },
  { id: 2, date: "2026-04-02", department: "education", title: "ステップアップ講座座学①", clId: 4, status: "confirmed" },
  { id: 3, date: "2026-04-04", department: "hiking", title: "お試しハイク・太陽と緑の道②", clId: 3, status: "confirmed" },
  { id: 4, date: "2026-04-04", department: "sanko", title: "六甲山系", clId: 2, status: "confirmed" },
  { id: 5, date: "2026-04-05", department: "nature", title: "クリーンハイク・新人歓迎会", clId: 6, status: "confirmed" },
  { id: 6, date: "2026-04-11", department: "hiking", title: "1日気象講座", clId: null, status: "draft" },
  { id: 7, date: "2026-04-18", department: "education", title: "ステップアップ講座実技①", clId: 4, status: "confirmed" },
  { id: 8, date: "2026-04-19", department: "hiking", title: "お試しハイク・1日登山教室", clId: null, status: "draft" },
  { id: 9, date: "2026-05-03", department: "nature", title: "クリーンハイク", clId: 6, status: "confirmed" },
  { id: 10, date: "2026-05-14", department: "education", title: "夏山登山教室座学①", clId: 4, status: "confirmed" },
  { id: 11, date: "2026-06-07", department: "nature", title: "クリーンハイク", clId: 6, status: "confirmed" },
  { id: 12, date: "2026-06-21", department: "organization", title: "総会", clId: null, status: "confirmed" },
];

/** 初期例会案内データ */
const INITIAL_EVENT_GUIDES = [
  {
    id: 1,
    eventPlanId: 1,
    startDate: "2026-04-01",
    endDate: "2026-04-01",
    mountainName: "○○山周辺",
    altitude: null,
    gradeStamina: "O(-)",
    gradeSkill: null,
    rockCategory: null,
    department: "nature",
    clId: 1,
    slId: null,
    meetingPlace: "○○駅",
    meetingTime: "09:00",
    course: "○○駅→登山口→山頂広場→登山口→○○駅 6km 6時間",
    deadline: "2026-03-20",
    notes: "雨天中止",
    requiredInsurance: 3,
    applicantIds: [3, 6],
  },
  {
    id: 2,
    eventPlanId: 5,
    startDate: "2026-04-05",
    endDate: "2026-04-05",
    mountainName: "△△山系",
    altitude: null,
    gradeStamina: "O",
    gradeSkill: null,
    rockCategory: null,
    department: "nature",
    clId: 6,
    slId: 1,
    meetingPlace: "○○駅 1階",
    meetingTime: "08:50",
    course: "○○駅→登山口→展望広場→植物園→桜谷→△△山→下山口→最寄り駅",
    deadline: "2026-04-05",
    notes: "お試し参加可 ゴミ袋・ゴミばさみ持参 雨天決行",
    requiredInsurance: 3,
    applicantIds: [1, 2, 3, 6, 8],
  },
  {
    id: 3,
    eventPlanId: null,
    startDate: "2026-04-12",
    endDate: "2026-04-14",
    mountainName: "□□岳",
    altitude: 2908,
    gradeStamina: "OOO",
    gradeSkill: "☆☆☆",
    rockCategory: null,
    department: "sanko",
    clId: 2,
    slId: 5,
    meetingPlace: "○○駅北側カフェ前",
    meetingTime: "20:30",
    course: "○○駅→道の駅（前泊）→登山口→ロープウェイ→山小屋（幕営）→□□岳→下山",
    deadline: "2026-03-29",
    notes: "山行部アイゼントレ＆保険8口以上 車の提供希望",
    requiredInsurance: 8,
    applicantIds: [2, 5, 7],
  },
  {
    id: 4,
    eventPlanId: null,
    startDate: "2026-12-20",
    endDate: "2027-01-04",
    mountainName: "海外トレッキング・高所展望台",
    altitude: 5560,
    gradeStamina: "OOOO",
    gradeSkill: null,
    rockCategory: null,
    department: "sanko",
    clId: 7,
    slId: null,
    meetingPlace: "空港国際線ターミナル（または現地集合可）",
    meetingTime: "未定",
    course: "空港→現地空港→トレッキング起点→高所展望台5,560m→帰国",
    deadline: "2026-03-31",
    notes: "トレッキング中はロッジ泊。シュラフ持参。高山病リスクあり。飛行機代約22万〜30万円。CL含め4名まで。",
    requiredInsurance: 8,
    applicantIds: [7],
  },
];

/** 初期計画書データ */
const INITIAL_PLANS = [
  {
    id: 1,
    eventGuideId: 3,
    submittedAt: "2026-03-25",
    mountainArea: "○○山系",
    mountainName: "□□岳",
    purpose: "後期登山教室コラボ",
    formationType: "自主",
    mapReference: "登山地図「○○山系」",
    meetingPlace: "○○駅北側カフェ前",
    transport: "マイカー",
    policeNotification: "登山届アプリ",
    itinerary: [
      { date: "2026-04-12", description: "○○駅カフェ前→道の駅(前泊)" },
      { date: "2026-04-13", description: "道の駅→登山口→ロープウェイ→山頂駅→山小屋(幕営) 5k3h" },
      { date: "2026-04-14", description: "山小屋→独標→□□岳→山小屋→ロープウェイ→帰着21時頃 11k8h" },
    ],
    escapeRoute: "引き返す",
    specialNotes: "山行部アイゼントレ＆保険8口以上",
    participants: [
      { memberId: 2, role: "CL" },
      { memberId: 5, role: "SL" },
      { memberId: 7, role: "記録" },
    ],
    lastReportTime: "2026-04-14 21:00",
    status: "submitted",
  },
];

/** 初期例会記録データ */
const INITIAL_RECORDS = [
  {
    id: 1,
    planId: null,
    title: "岩登りA・○○岩場 岩登りを楽しもう",
    date: "2024-07-24",
    weather: "晴れ",
    participants: [
      { memberId: 5, role: "CL・記録" },
      { memberId: 8, role: "SL" },
    ],
    access: "○○駅改札口9:00⇒9:20岩場",
    courseTime: "岩場9:20〜14:30クライミング、15:00ロープワーク→15:45最寄り駅",
    body: `平日は岩場までのバスが通っていないので、最寄り駅改札口に集合してタクシーで岩場入口まで行く。（タクシー代2100円）平日なので予想通り誰もいない。今日は全員が岩B経験者なので、自分で登れそうなルートをリードで登ることにする。

リードで登ればリードする人の気持ちが判るし、ビレーの時もリードの気持ちが判り、ビレーに集中するようになる。リードはリスクがありますが、難しいと思えば降りてくるのも経験です。会員Hは初めてのリードだと思いますが危なげなく登っていました。10月から岩登りＡのＣＬなので、経験しておくことは大事だと思っています。

フィギュアエイト・オンア・バイト（8の字結び）、インラインエイトノット、ボーラインノット（もやい結び）を練習する。8の字結びは１回で綺麗に結ぶのは結構難しいです。`,
    courseCondition: "平日なので貸し切り状態。",
    specialNote: "ヒヤリハットなし。",
    status: "published",
  },
  {
    id: 2,
    planId: null,
    title: "○○山系の沢登り・△△谷",
    date: "2024-07-27",
    weather: "曇り時々晴れ",
    participants: [
      { memberId: 1, role: "CL" },
    ],
    access: "7/26 ○○市⇒△△SAで仮眠、7/27 △△SA⇒登山口バス停⇒山麓駅",
    courseTime: "山麓駅6:30→8:20沢入口→12:30登山道合流→14:15山頂駅",
    body: `標高1662mの山麓駅、水に入るのが少しためらわれるくらいの涼しさの中、歩き始める。最終地点との標高差が約1000mの沢登りは、次から次へと小滝、中滝、大滝があらわれ、ひたすら登り続けた。概ね登りやすく、ロープを出してもらったのは、高度感のある沢出合の滝だけであった。

沢の両側には高山植物が咲き乱れ、高度を上がるにつれ、花の種類が変わる。振りかえると、周囲の山々の稜線が広がる絶景。花と景色に励まされて登り続けた。`,
    courseCondition: "危険箇所なし。",
    specialNote: "山麓駅までのバスには、登山口バス停から路線バスに乗るのがお勧め。",
    status: "published",
  },
];

/** 初期装備データ */
const INITIAL_EQUIPMENT = [
  { id: 1, name: "テント（2人用）#1", category: "tent", condition: "良好", status: "available", rentedBy: null, rentedAt: null, returnDue: null },
  { id: 2, name: "テント（2人用）#2", category: "tent", condition: "良好", status: "rented", rentedBy: 2, rentedAt: "2026-04-10", returnDue: "2026-04-15" },
  { id: 3, name: "テント（4人用）#1", category: "tent", condition: "良好", status: "available", rentedBy: null, rentedAt: null, returnDue: null },
  { id: 4, name: "ロープ 50m #1", category: "rope", condition: "良好", status: "available", rentedBy: null, rentedAt: null, returnDue: null },
  { id: 5, name: "ロープ 50m #2", category: "rope", condition: "良好", status: "rented", rentedBy: 5, rentedAt: "2026-04-08", returnDue: "2026-04-12" },
  { id: 6, name: "ロープ 30m #1", category: "rope", condition: "要点検", status: "maintenance", rentedBy: null, rentedAt: null, returnDue: null },
  { id: 7, name: "無線機 #1", category: "radio", condition: "良好", status: "available", rentedBy: null, rentedAt: null, returnDue: null },
  { id: 8, name: "無線機 #2", category: "radio", condition: "良好", status: "available", rentedBy: null, rentedAt: null, returnDue: null },
  { id: 9, name: "無線機 #3", category: "radio", condition: "良好", status: "rented", rentedBy: 7, rentedAt: "2026-04-05", returnDue: "2026-04-20" },
  { id: 10, name: "ガスコンロセット #1", category: "cooking", condition: "良好", status: "available", rentedBy: null, rentedAt: null, returnDue: null },
];

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * 日付をMM/DD(曜日)形式にフォーマット
 */
const formatDateShort = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  return `${m}/${day}(${weekday})`;
};

/**
 * カレンダーの日付配列を生成
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

/**
 * IDで次のIDを生成
 */
const getNextId = (items) => {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
};

// =============================================================================
// カスタムフック
// =============================================================================

/**
 * 会員管理用カスタムフック
 */
const useMemberManager = () => {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [isLoading, setIsLoading] = useState(false);

  const addMember = useCallback((member) => {
    setIsLoading(true);
    setTimeout(() => {
      setMembers((prev) => [...prev, { ...member, id: getNextId(prev) }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateMember = useCallback((id, updates) => {
    setIsLoading(true);
    setTimeout(() => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
      setIsLoading(false);
    }, 300);
  }, []);

  const deleteMember = useCallback((id) => {
    setIsLoading(true);
    setTimeout(() => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setIsLoading(false);
    }, 300);
  }, []);

  const searchMembers = useCallback(
    (query) => {
      if (!query) return members;
      const lowerQuery = query.toLowerCase();
      return members.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.nameKana.toLowerCase().includes(lowerQuery) ||
          m.email.toLowerCase().includes(lowerQuery)
      );
    },
    [members]
  );

  const getMemberById = useCallback(
    (id) => {
      return members.find((m) => m.id === id);
    },
    [members]
  );

  return { members, isLoading, addMember, updateMember, deleteMember, searchMembers, getMemberById };
};

/**
 * 例会企画管理用カスタムフック
 */
const useEventPlanManager = () => {
  const [eventPlans, setEventPlans] = useState(INITIAL_EVENT_PLANS);
  const [isLoading, setIsLoading] = useState(false);

  const addEventPlan = useCallback((plan) => {
    setIsLoading(true);
    setTimeout(() => {
      setEventPlans((prev) => [...prev, { ...plan, id: getNextId(prev) }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateEventPlan = useCallback((id, updates) => {
    setIsLoading(true);
    setTimeout(() => {
      setEventPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      setIsLoading(false);
    }, 300);
  }, []);

  const deleteEventPlan = useCallback((id) => {
    setIsLoading(true);
    setTimeout(() => {
      setEventPlans((prev) => prev.filter((p) => p.id !== id));
      setIsLoading(false);
    }, 300);
  }, []);

  const getEventPlansByMonth = useCallback(
    (year, month) => {
      return eventPlans.filter((p) => {
        const d = new Date(p.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    },
    [eventPlans]
  );

  return { eventPlans, isLoading, addEventPlan, updateEventPlan, deleteEventPlan, getEventPlansByMonth };
};

/**
 * 例会案内管理用カスタムフック
 */
const useEventGuideManager = () => {
  const [eventGuides, setEventGuides] = useState(INITIAL_EVENT_GUIDES);
  const [isLoading, setIsLoading] = useState(false);

  const addEventGuide = useCallback((guide) => {
    setIsLoading(true);
    setTimeout(() => {
      setEventGuides((prev) => [...prev, { ...guide, id: getNextId(prev), applicantIds: [] }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateEventGuide = useCallback((id, updates) => {
    setIsLoading(true);
    setTimeout(() => {
      setEventGuides((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
      setIsLoading(false);
    }, 300);
  }, []);

  const deleteEventGuide = useCallback((id) => {
    setIsLoading(true);
    setTimeout(() => {
      setEventGuides((prev) => prev.filter((g) => g.id !== id));
      setIsLoading(false);
    }, 300);
  }, []);

  const applyToEvent = useCallback((guideId, memberId) => {
    setEventGuides((prev) =>
      prev.map((g) => {
        if (g.id === guideId && !g.applicantIds.includes(memberId)) {
          return { ...g, applicantIds: [...g.applicantIds, memberId] };
        }
        return g;
      })
    );
  }, []);

  const cancelApplication = useCallback((guideId, memberId) => {
    setEventGuides((prev) =>
      prev.map((g) => {
        if (g.id === guideId) {
          return { ...g, applicantIds: g.applicantIds.filter((id) => id !== memberId) };
        }
        return g;
      })
    );
  }, []);

  const filterEventGuides = useCallback(
    ({ department, startDate, endDate }) => {
      return eventGuides.filter((g) => {
        if (department && g.department !== department) return false;
        if (startDate && g.startDate < startDate) return false;
        if (endDate && g.endDate > endDate) return false;
        return true;
      });
    },
    [eventGuides]
  );

  return { eventGuides, isLoading, addEventGuide, updateEventGuide, deleteEventGuide, applyToEvent, cancelApplication, filterEventGuides };
};

/**
 * 計画書管理用カスタムフック
 */
const usePlanManager = () => {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [isLoading, setIsLoading] = useState(false);

  const addPlan = useCallback((plan) => {
    setIsLoading(true);
    setTimeout(() => {
      setPlans((prev) => [...prev, { ...plan, id: getNextId(prev) }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updatePlan = useCallback((id, updates) => {
    setIsLoading(true);
    setTimeout(() => {
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      setIsLoading(false);
    }, 300);
  }, []);

  const deletePlan = useCallback((id) => {
    setIsLoading(true);
    setTimeout(() => {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setIsLoading(false);
    }, 300);
  }, []);

  return { plans, isLoading, addPlan, updatePlan, deletePlan };
};

/**
 * 例会記録管理用カスタムフック
 */
const useRecordManager = () => {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [isLoading, setIsLoading] = useState(false);

  const addRecord = useCallback((record) => {
    setIsLoading(true);
    setTimeout(() => {
      setRecords((prev) => [...prev, { ...record, id: getNextId(prev) }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateRecord = useCallback((id, updates) => {
    setIsLoading(true);
    setTimeout(() => {
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
      setIsLoading(false);
    }, 300);
  }, []);

  const deleteRecord = useCallback((id) => {
    setIsLoading(true);
    setTimeout(() => {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setIsLoading(false);
    }, 300);
  }, []);

  return { records, isLoading, addRecord, updateRecord, deleteRecord };
};

/**
 * 装備管理用カスタムフック
 */
const useEquipmentManager = () => {
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [isLoading, setIsLoading] = useState(false);

  const addEquipment = useCallback((item) => {
    setIsLoading(true);
    setTimeout(() => {
      setEquipment((prev) => [...prev, { ...item, id: getNextId(prev) }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateEquipment = useCallback((id, updates) => {
    setIsLoading(true);
    setTimeout(() => {
      setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      setIsLoading(false);
    }, 300);
  }, []);

  const rentEquipment = useCallback((id, memberId, returnDue) => {
    setIsLoading(true);
    setTimeout(() => {
      setEquipment((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: "rented", rentedBy: memberId, rentedAt: formatDate(new Date()), returnDue }
            : e
        )
      );
      setIsLoading(false);
    }, 300);
  }, []);

  const returnEquipment = useCallback((id) => {
    setIsLoading(true);
    setTimeout(() => {
      setEquipment((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "available", rentedBy: null, rentedAt: null, returnDue: null } : e
        )
      );
      setIsLoading(false);
    }, 300);
  }, []);

  const getEquipmentByCategory = useCallback(
    (category) => {
      if (!category) return equipment;
      return equipment.filter((e) => e.category === category);
    },
    [equipment]
  );

  return { equipment, isLoading, addEquipment, updateEquipment, rentEquipment, returnEquipment, getEquipmentByCategory };
};

// =============================================================================
// 共通UIコンポーネント
// =============================================================================

/** ボタンコンポーネント */
const Button = ({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) => {
  const baseStyles = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

/** バッジコンポーネント */
const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

/** カードコンポーネント */
const Card = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/** 入力フィールドコンポーネント */
const Input = ({ label, type = "text", value, onChange, placeholder, required = false, className = "" }) => {
  return (
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

/** セレクトコンポーネント */
const Select = ({ label, value, onChange, options, placeholder, required = false, className = "" }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/** テキストエリアコンポーネント */
const Textarea = ({ label, value, onChange, placeholder, rows = 4, required = false, className = "" }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

/** モーダルコンポーネント */
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className={`relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:w-full ${sizes[size]}`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/** ローディングスピナー */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

/** 空状態表示 */
const EmptyState = ({ message, icon = "📭" }) => (
  <div className="flex flex-col items-center justify-center p-8 text-gray-500">
    <span className="text-4xl mb-2">{icon}</span>
    <p>{message}</p>
  </div>
);

// =============================================================================
// 各画面コンポーネント
// =============================================================================

/** ダッシュボード画面 */
const Dashboard = ({ eventGuides, equipment, members, getMemberById }) => {
  const today = new Date();
  const upcomingEvents = eventGuides
    .filter((g) => new Date(g.startDate) >= today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  const rentedEquipment = equipment.filter((e) => e.status === "rented");
  const overdueEquipment = rentedEquipment.filter((e) => e.returnDue && new Date(e.returnDue) < today);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">会員数</div>
          <div className="text-2xl font-bold text-gray-900">{members.length}名</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">今月の例会</div>
          <div className="text-2xl font-bold text-gray-900">
            {eventGuides.filter((g) => {
              const d = new Date(g.startDate);
              return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
            }).length}件
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">貸出中装備</div>
          <div className="text-2xl font-bold text-gray-900">{rentedEquipment.length}点</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">返却期限超過</div>
          <div className={`text-2xl font-bold ${overdueEquipment.length > 0 ? "text-red-600" : "text-gray-900"}`}>
            {overdueEquipment.length}点
          </div>
        </Card>
      </div>

      {/* 直近の例会案内 */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">直近の例会案内</h2>
        {upcomingEvents.length === 0 ? (
          <EmptyState message="予定されている例会はありません" icon="🏔️" />
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const dept = DEPARTMENTS[event.department];
              const cl = getMemberById(event.clId);
              return (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dept?.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDateShort(event.startDate)}
                        {event.endDate !== event.startDate && ` 〜 ${formatDateShort(event.endDate)}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.mountainName} {event.altitude && `${event.altitude}m`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge color={dept?.id === "sanko" ? "blue" : dept?.id === "hiking" ? "green" : "gray"}>
                      {dept?.name}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">CL: {cl?.name || "未定"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 装備状況 */}
      {overdueEquipment.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900 mb-4">⚠️ 返却期限超過の装備</h2>
          <div className="space-y-2">
            {overdueEquipment.map((eq) => {
              const renter = getMemberById(eq.rentedBy);
              return (
                <div key={eq.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <span className="font-medium">{eq.name}</span>
                    <span className="text-sm text-gray-500 ml-2">（{renter?.name}）</span>
                  </div>
                  <div className="text-sm text-red-600">期限: {formatDateShort(eq.returnDue)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

/** 例会企画（カレンダー）画面 */
const EventPlanCalendar = ({ eventPlans, members, addEventPlan, getMemberById }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // 2026年4月
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ date: "", department: "", title: "", clId: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateCalendarDays(year, month);

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleAddPlan = () => {
    if (newPlan.date && newPlan.department && newPlan.title) {
      addEventPlan({
        ...newPlan,
        clId: newPlan.clId ? parseInt(newPlan.clId) : null,
        status: "draft",
      });
      setNewPlan({ date: "", department: "", title: "", clId: "" });
      setIsModalOpen(false);
    }
  };

  const getPlansForDate = (date) => {
    const dateStr = formatDate(date);
    return eventPlans.filter((p) => p.date === dateStr);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">例会企画</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ 企画追加</Button>
      </div>

      {/* カレンダーヘッダー */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={goToPrevMonth}>← 前月</Button>
          <h2 className="text-xl font-semibold">
            {year}年 {month + 1}月
          </h2>
          <Button variant="ghost" onClick={goToNextMonth}>次月 →</Button>
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
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          {days.map((dayInfo, index) => {
            const plans = getPlansForDate(dayInfo.date);
            const isToday = formatDate(dayInfo.date) === formatDate(new Date());
            return (
              <div
                key={index}
                className={`bg-white min-h-24 p-1 ${!dayInfo.isCurrentMonth ? "opacity-50" : ""} ${isToday ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className={`text-sm ${dayInfo.date.getDay() === 0 ? "text-red-500" : dayInfo.date.getDay() === 6 ? "text-blue-500" : ""}`}>
                  {dayInfo.date.getDate()}
                </div>
                <div className="space-y-1 mt-1">
                  {plans.map((plan) => {
                    const dept = DEPARTMENTS[plan.department];
                    return (
                      <div
                        key={plan.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: dept?.bgColor, color: dept?.color }}
                        title={plan.title}
                      >
                        {plan.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 企画追加モーダル */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="例会企画を追加">
        <div className="space-y-4">
          <Input
            label="日付"
            type="date"
            value={newPlan.date}
            onChange={(v) => setNewPlan({ ...newPlan, date: v })}
            required
          />
          <Select
            label="担当部"
            value={newPlan.department}
            onChange={(v) => setNewPlan({ ...newPlan, department: v })}
            options={Object.values(DEPARTMENTS).map((d) => ({ value: d.id, label: d.name }))}
            placeholder="選択してください"
            required
          />
          <Input
            label="タイトル"
            value={newPlan.title}
            onChange={(v) => setNewPlan({ ...newPlan, title: v })}
            placeholder="例: クリーンハイク"
            required
          />
          <Select
            label="CL"
            value={newPlan.clId}
            onChange={(v) => setNewPlan({ ...newPlan, clId: v })}
            options={members.map((m) => ({ value: m.id.toString(), label: m.name }))}
            placeholder="未定"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddPlan}>追加</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/** 例会案内画面 */
const EventGuideList = ({ eventGuides, members, getMemberById, applyToEvent, cancelApplication }) => {
  const [filterDepartment, setFilterDepartment] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [currentMemberId] = useState(3); // ログイン中の会員ID（モック）

  const filteredGuides = useMemo(() => {
    return eventGuides
      .filter((g) => !filterDepartment || g.department === filterDepartment)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [eventGuides, filterDepartment]);

  const handleApply = (guideId) => {
    applyToEvent(guideId, currentMemberId);
  };

  const handleCancel = (guideId) => {
    cancelApplication(guideId, currentMemberId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">例会案内</h1>
      </div>

      {/* フィルター */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <Select
            label="担当部"
            value={filterDepartment}
            onChange={setFilterDepartment}
            options={Object.values(DEPARTMENTS).map((d) => ({ value: d.id, label: d.name }))}
            placeholder="すべて"
            className="w-48"
          />
        </div>
      </Card>

      {/* 例会一覧 */}
      {filteredGuides.length === 0 ? (
        <EmptyState message="該当する例会案内はありません" icon="🏔️" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => {
            const dept = DEPARTMENTS[guide.department];
            const cl = getMemberById(guide.clId);
            const sl = getMemberById(guide.slId);
            const isApplied = guide.applicantIds.includes(currentMemberId);
            const isDeadlinePassed = new Date(guide.deadline) < new Date();

            return (
              <Card key={guide.id} className="p-4" onClick={() => setSelectedGuide(guide)}>
                <div className="flex items-start justify-between mb-2">
                  <Badge color={dept?.id === "sanko" ? "blue" : dept?.id === "hiking" ? "green" : "gray"}>
                    {dept?.name}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    申込: {guide.applicantIds.length}名
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {guide.mountainName} {guide.altitude && `${guide.altitude}m`}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  {formatDateShort(guide.startDate)}
                  {guide.endDate !== guide.startDate && ` 〜 ${formatDateShort(guide.endDate)}`}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {guide.gradeStamina && <Badge>{guide.gradeStamina}</Badge>}
                  {guide.gradeSkill && <Badge color="purple">{guide.gradeSkill}</Badge>}
                  {guide.rockCategory && <Badge color="red">岩{guide.rockCategory}</Badge>}
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  <div>CL: {cl?.name || "未定"} {sl && `/ SL: ${sl.name}`}</div>
                  <div>集合: {guide.meetingPlace} {guide.meetingTime}</div>
                  <div>申込期限: {formatDateShort(guide.deadline)}</div>
                </div>
                <div className="flex justify-end">
                  {isApplied ? (
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleCancel(guide.id); }}>
                      申込取消
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleApply(guide.id); }}
                      disabled={isDeadlinePassed}
                    >
                      {isDeadlinePassed ? "締切済" : "申込む"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 詳細モーダル */}
      <Modal
        isOpen={!!selectedGuide}
        onClose={() => setSelectedGuide(null)}
        title="例会案内詳細"
        size="lg"
      >
        {selectedGuide && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge color={DEPARTMENTS[selectedGuide.department]?.id === "sanko" ? "blue" : "green"}>
                {DEPARTMENTS[selectedGuide.department]?.name}
              </Badge>
              {selectedGuide.gradeStamina && <Badge>{selectedGuide.gradeStamina}</Badge>}
              {selectedGuide.gradeSkill && <Badge color="purple">{selectedGuide.gradeSkill}</Badge>}
            </div>
            <h2 className="text-xl font-bold">
              {selectedGuide.mountainName} {selectedGuide.altitude && `${selectedGuide.altitude}m`}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">日程:</span>
                <span className="ml-2">
                  {formatDateShort(selectedGuide.startDate)}
                  {selectedGuide.endDate !== selectedGuide.startDate && ` 〜 ${formatDateShort(selectedGuide.endDate)}`}
                </span>
              </div>
              <div>
                <span className="text-gray-500">CL:</span>
                <span className="ml-2">{getMemberById(selectedGuide.clId)?.name || "未定"}</span>
              </div>
              <div>
                <span className="text-gray-500">集合場所:</span>
                <span className="ml-2">{selectedGuide.meetingPlace}</span>
              </div>
              <div>
                <span className="text-gray-500">集合時間:</span>
                <span className="ml-2">{selectedGuide.meetingTime}</span>
              </div>
              <div>
                <span className="text-gray-500">必要保険口数:</span>
                <span className="ml-2">{selectedGuide.requiredInsurance}口以上</span>
              </div>
              <div>
                <span className="text-gray-500">申込期限:</span>
                <span className="ml-2">{formatDateShort(selectedGuide.deadline)}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">コース:</span>
              <p className="mt-1">{selectedGuide.course}</p>
            </div>
            {selectedGuide.notes && (
              <div>
                <span className="text-gray-500">備考:</span>
                <p className="mt-1">{selectedGuide.notes}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">参加者 ({selectedGuide.applicantIds.length}名):</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGuide.applicantIds.map((id) => (
                  <Badge key={id}>{getMemberById(id)?.name}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/** 計画書画面 */
const PlanList = ({ plans, members, eventGuides, addPlan, updatePlan, getMemberById }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({
    mountainArea: "",
    mountainName: "",
    purpose: "",
    formationType: "自主",
    meetingPlace: "",
    transport: "",
    policeNotification: "コンパス",
    participants: [],
    status: "draft",
  });

  const handleAddPlan = () => {
    if (newPlan.mountainName && newPlan.meetingPlace) {
      addPlan({
        ...newPlan,
        submittedAt: formatDate(new Date()),
        itinerary: [],
        escapeRoute: "",
        specialNotes: "",
        lastReportTime: "",
      });
      setNewPlan({
        mountainArea: "",
        mountainName: "",
        purpose: "",
        formationType: "自主",
        meetingPlace: "",
        transport: "",
        policeNotification: "コンパス",
        participants: [],
        status: "draft",
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">計画書</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ 新規作成</Button>
      </div>

      {/* 計画書一覧 */}
      {plans.length === 0 ? (
        <EmptyState message="計画書はありません" icon="📝" />
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const cl = plan.participants.find((p) => p.role === "CL");
            const clMember = cl ? getMemberById(cl.memberId) : null;

            return (
              <Card key={plan.id} className="p-4" onClick={() => setSelectedPlan(plan)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        color={
                          plan.status === "approved" ? "green" :
                          plan.status === "submitted" ? "blue" :
                          plan.status === "completed" ? "gray" : "yellow"
                        }
                      >
                        {PLAN_STATUS[plan.status]}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDateShort(plan.submittedAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {plan.mountainArea && `${plan.mountainArea}・`}{plan.mountainName}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      CL: {clMember?.name || "未定"} / 参加者: {plan.participants.length}名
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.purpose}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 新規作成モーダル */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="計画書を作成" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="山域"
              value={newPlan.mountainArea}
              onChange={(v) => setNewPlan({ ...newPlan, mountainArea: v })}
              placeholder="例: 北アルプス"
            />
            <Input
              label="山名"
              value={newPlan.mountainName}
              onChange={(v) => setNewPlan({ ...newPlan, mountainName: v })}
              placeholder="例: 槍ヶ岳"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="目的"
              value={newPlan.purpose}
              onChange={(v) => setNewPlan({ ...newPlan, purpose: v })}
              placeholder="例: ハイキング"
            />
            <Select
              label="山行形態"
              value={newPlan.formationType}
              onChange={(v) => setNewPlan({ ...newPlan, formationType: v })}
              options={[
                { value: "自主", label: "自主" },
                { value: "例会", label: "例会" },
                { value: "講座", label: "講座" },
              ]}
            />
          </div>
          <Input
            label="集合場所・時間"
            value={newPlan.meetingPlace}
            onChange={(v) => setNewPlan({ ...newPlan, meetingPlace: v })}
            placeholder="例: JR三ノ宮駅 8:00"
            required
          />
          <Input
            label="交通機関"
            value={newPlan.transport}
            onChange={(v) => setNewPlan({ ...newPlan, transport: v })}
            placeholder="例: マイカー"
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddPlan}>作成</Button>
          </div>
        </div>
      </Modal>

      {/* 詳細モーダル */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title="計画書詳細"
        size="xl"
      >
        {selectedPlan && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">山域・山名:</span>
                <span className="ml-2 font-medium">
                  {selectedPlan.mountainArea && `${selectedPlan.mountainArea}・`}{selectedPlan.mountainName}
                </span>
              </div>
              <div>
                <span className="text-gray-500">目的:</span>
                <span className="ml-2">{selectedPlan.purpose}</span>
              </div>
              <div>
                <span className="text-gray-500">山行形態:</span>
                <span className="ml-2">{selectedPlan.formationType}</span>
              </div>
              <div>
                <span className="text-gray-500">届出警察署:</span>
                <span className="ml-2">{selectedPlan.policeNotification}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500">集合:</span>
              <span className="ml-2">{selectedPlan.meetingPlace}</span>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">行程</h4>
              <div className="space-y-2">
                {selectedPlan.itinerary.map((item, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <span className="font-medium">{formatDateShort(item.date)}</span>
                    <span className="ml-2">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">参加者</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.participants.map((p) => (
                  <Badge key={p.memberId}>
                    {p.role}: {getMemberById(p.memberId)?.name}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedPlan.escapeRoute && (
              <div>
                <span className="text-gray-500">エスケープルート:</span>
                <span className="ml-2">{selectedPlan.escapeRoute}</span>
              </div>
            )}

            {selectedPlan.specialNotes && (
              <div>
                <span className="text-gray-500">特記事項:</span>
                <p className="mt-1">{selectedPlan.specialNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

/** 例会記録画面 */
const RecordList = ({ records, members, addRecord, getMemberById }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    title: "",
    date: "",
    weather: "",
    access: "",
    courseTime: "",
    body: "",
    courseCondition: "",
    specialNote: "",
    status: "draft",
  });

  const handleAddRecord = () => {
    if (newRecord.title && newRecord.date) {
      addRecord({
        ...newRecord,
        participants: [],
        planId: null,
      });
      setNewRecord({
        title: "",
        date: "",
        weather: "",
        access: "",
        courseTime: "",
        body: "",
        courseCondition: "",
        specialNote: "",
        status: "draft",
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">例会記録</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ 新規作成</Button>
      </div>

      {/* 記録一覧 */}
      {records.length === 0 ? (
        <EmptyState message="例会記録はありません" icon="📖" />
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const cl = record.participants.find((p) => p.role.includes("CL"));
            const clMember = cl ? getMemberById(cl.memberId) : null;

            return (
              <Card key={record.id} className="p-4" onClick={() => setSelectedRecord(record)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        color={
                          record.status === "published" ? "green" :
                          record.status === "submitted" ? "blue" : "yellow"
                        }
                      >
                        {RECORD_STATUS[record.status]}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDateShort(record.date)}</span>
                      <span className="text-sm text-gray-500">{record.weather}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {clMember && `CL: ${clMember.name} / `}参加者: {record.participants.length}名
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{record.body}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* 新規作成モーダル */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="例会記録を作成" size="lg">
        <div className="space-y-4">
          <Input
            label="タイトル"
            value={newRecord.title}
            onChange={(v) => setNewRecord({ ...newRecord, title: v })}
            placeholder="例: 岩登りA・蓬莱峡 岩登りを楽しもう"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="日程"
              type="date"
              value={newRecord.date}
              onChange={(v) => setNewRecord({ ...newRecord, date: v })}
              required
            />
            <Input
              label="天候"
              value={newRecord.weather}
              onChange={(v) => setNewRecord({ ...newRecord, weather: v })}
              placeholder="例: 晴れ"
            />
          </div>
          <Input
            label="アクセス"
            value={newRecord.access}
            onChange={(v) => setNewRecord({ ...newRecord, access: v })}
            placeholder="例: 阪急宝塚駅9:00⇒蓬莱峡9:20"
          />
          <Input
            label="コースタイム"
            value={newRecord.courseTime}
            onChange={(v) => setNewRecord({ ...newRecord, courseTime: v })}
            placeholder="例: 蓬莱峡9:20〜14:30クライミング"
          />
          <Textarea
            label="本文"
            value={newRecord.body}
            onChange={(v) => setNewRecord({ ...newRecord, body: v })}
            placeholder="山行記録の本文を入力..."
            rows={6}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="コース状況"
              value={newRecord.courseCondition}
              onChange={(v) => setNewRecord({ ...newRecord, courseCondition: v })}
              placeholder="例: 危険箇所なし"
            />
            <Input
              label="特記事項"
              value={newRecord.specialNote}
              onChange={(v) => setNewRecord({ ...newRecord, specialNote: v })}
              placeholder="例: ヒヤリハットなし"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddRecord}>作成</Button>
          </div>
        </div>
      </Modal>

      {/* 詳細モーダル */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="例会記録詳細"
        size="xl"
      >
        {selectedRecord && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold">{selectedRecord.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span>{formatDateShort(selectedRecord.date)}</span>
              <span>天候: {selectedRecord.weather}</span>
            </div>
            <div>
              <span className="text-gray-500">アクセス:</span>
              <span className="ml-2">{selectedRecord.access}</span>
            </div>
            <div>
              <span className="text-gray-500">コースタイム:</span>
              <span className="ml-2">{selectedRecord.courseTime}</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">参加者</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRecord.participants.map((p) => (
                  <Badge key={p.memberId}>
                    {p.role}: {getMemberById(p.memberId)?.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">本文</h4>
              <div className="whitespace-pre-wrap text-sm">{selectedRecord.body}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">コース状況:</span>
                <span className="ml-2">{selectedRecord.courseCondition}</span>
              </div>
              <div>
                <span className="text-gray-500">特記事項:</span>
                <span className="ml-2">{selectedRecord.specialNote}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/** 会員管理画面 */
const MemberManagement = ({ members, addMember, updateMember, deleteMember, searchMembers }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: "",
    nameKana: "",
    gender: "男",
    phone: "",
    email: "",
    insuranceKuchi: 3,
  });

  const filteredMembers = useMemo(() => {
    return searchMembers(searchQuery);
  }, [searchMembers, searchQuery]);

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      addMember({
        ...newMember,
        birthDate: "",
        address: "",
        bloodType: "",
        emergencyContact: "",
        emergencyPhone: "",
        emergencyRelation: "",
        joinedAt: formatDate(new Date()),
        completedCourses: [],
        medicalCondition: "",
        kokohelId: "",
        role: "",
      });
      setNewMember({
        name: "",
        nameKana: "",
        gender: "男",
        phone: "",
        email: "",
        insuranceKuchi: 3,
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">会員管理</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ 会員追加</Button>
      </div>

      {/* 検索 */}
      <Card className="p-4">
        <Input
          label="会員検索"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="名前・メールアドレスで検索..."
        />
      </Card>

      {/* 会員一覧 */}
      {filteredMembers.length === 0 ? (
        <EmptyState message="該当する会員はいません" icon="👥" />
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-4" onClick={() => setSelectedMember(member)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.nameKana}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge color={member.insuranceKuchi >= 8 ? "green" : member.insuranceKuchi >= 4 ? "blue" : "gray"}>
                      保険{member.insuranceKuchi}口
                    </Badge>
                    {member.role && <Badge color="purple">{member.role}</Badge>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{member.email}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 会員追加モーダル */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="会員を追加">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="氏名"
              value={newMember.name}
              onChange={(v) => setNewMember({ ...newMember, name: v })}
              placeholder="例: 山田 太郎"
              required
            />
            <Input
              label="フリガナ"
              value={newMember.nameKana}
              onChange={(v) => setNewMember({ ...newMember, nameKana: v })}
              placeholder="例: ヤマダ タロウ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="性別"
              value={newMember.gender}
              onChange={(v) => setNewMember({ ...newMember, gender: v })}
              options={[
                { value: "男", label: "男" },
                { value: "女", label: "女" },
              ]}
            />
            <Select
              label="労山基金口数"
              value={newMember.insuranceKuchi.toString()}
              onChange={(v) => setNewMember({ ...newMember, insuranceKuchi: parseInt(v) })}
              options={[
                { value: "3", label: "3口" },
                { value: "4", label: "4口" },
                { value: "8", label: "8口" },
              ]}
            />
          </div>
          <Input
            label="電話番号"
            value={newMember.phone}
            onChange={(v) => setNewMember({ ...newMember, phone: v })}
            placeholder="例: 090-1234-5678"
          />
          <Input
            label="メールアドレス"
            type="email"
            value={newMember.email}
            onChange={(v) => setNewMember({ ...newMember, email: v })}
            placeholder="例: yamada@example.com"
            required
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddMember}>追加</Button>
          </div>
        </div>
      </Modal>

      {/* 会員詳細モーダル */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="会員詳細"
        size="lg"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-2xl font-medium">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                <div className="text-gray-500">{selectedMember.nameKana}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">性別:</span>
                <span className="ml-2">{selectedMember.gender}</span>
              </div>
              <div>
                <span className="text-gray-500">生年月日:</span>
                <span className="ml-2">{selectedMember.birthDate || "未登録"}</span>
              </div>
              <div>
                <span className="text-gray-500">電話:</span>
                <span className="ml-2">{selectedMember.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">メール:</span>
                <span className="ml-2">{selectedMember.email}</span>
              </div>
              <div>
                <span className="text-gray-500">血液型:</span>
                <span className="ml-2">{selectedMember.bloodType || "未登録"}</span>
              </div>
              <div>
                <span className="text-gray-500">労山基金:</span>
                <span className="ml-2">{selectedMember.insuranceKuchi}口</span>
              </div>
              <div>
                <span className="text-gray-500">入会日:</span>
                <span className="ml-2">{formatDateShort(selectedMember.joinedAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">ココヘリID:</span>
                <span className="ml-2">{selectedMember.kokohelId || "未登録"}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">住所:</span>
              <span className="ml-2">{selectedMember.address || "未登録"}</span>
            </div>
            <div>
              <span className="text-gray-500">緊急連絡先:</span>
              <span className="ml-2">
                {selectedMember.emergencyContact
                  ? `${selectedMember.emergencyContact}（${selectedMember.emergencyRelation}）${selectedMember.emergencyPhone}`
                  : "未登録"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">受講済講座:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedMember.completedCourses.length > 0
                  ? selectedMember.completedCourses.map((course, i) => (
                      <Badge key={i}>{course}</Badge>
                    ))
                  : <span className="text-gray-400">なし</span>}
              </div>
            </div>
            {selectedMember.medicalCondition && (
              <div>
                <span className="text-gray-500">持病:</span>
                <span className="ml-2">{selectedMember.medicalCondition}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

/** 装備管理画面 */
const EquipmentManagement = ({ equipment, members, rentEquipment, returnEquipment, getEquipmentByCategory, getMemberById }) => {
  const [filterCategory, setFilterCategory] = useState("");
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [rentForm, setRentForm] = useState({ memberId: "", returnDue: "" });

  const filteredEquipment = useMemo(() => {
    return getEquipmentByCategory(filterCategory);
  }, [getEquipmentByCategory, filterCategory]);

  const handleRent = () => {
    if (selectedEquipment && rentForm.memberId && rentForm.returnDue) {
      rentEquipment(selectedEquipment.id, parseInt(rentForm.memberId), rentForm.returnDue);
      setRentForm({ memberId: "", returnDue: "" });
      setIsRentModalOpen(false);
      setSelectedEquipment(null);
    }
  };

  const handleReturn = (id) => {
    returnEquipment(id);
  };

  const openRentModal = (eq) => {
    setSelectedEquipment(eq);
    setIsRentModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">装備管理</h1>
      </div>

      {/* フィルター */}
      <Card className="p-4">
        <Select
          label="カテゴリ"
          value={filterCategory}
          onChange={setFilterCategory}
          options={Object.entries(EQUIPMENT_CATEGORIES).map(([key, label]) => ({ value: key, label }))}
          placeholder="すべて"
          className="w-48"
        />
      </Card>

      {/* 装備一覧 */}
      {filteredEquipment.length === 0 ? (
        <EmptyState message="該当する装備はありません" icon="🎒" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((eq) => {
            const renter = eq.rentedBy ? getMemberById(eq.rentedBy) : null;
            const isOverdue = eq.returnDue && new Date(eq.returnDue) < new Date();

            return (
              <Card key={eq.id} className={`p-4 ${isOverdue ? "border-red-300 bg-red-50" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <Badge color={eq.category === "tent" ? "green" : eq.category === "rope" ? "blue" : "gray"}>
                    {EQUIPMENT_CATEGORIES[eq.category]}
                  </Badge>
                  <Badge
                    color={
                      eq.status === "available" ? "green" :
                      eq.status === "rented" ? "yellow" : "red"
                    }
                  >
                    {EQUIPMENT_STATUS[eq.status]}
                  </Badge>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{eq.name}</h3>
                <div className="text-sm text-gray-500 mb-3">状態: {eq.condition}</div>

                {eq.status === "rented" && renter && (
                  <div className="text-sm mb-3">
                    <div>貸出先: {renter.name}</div>
                    <div className={isOverdue ? "text-red-600 font-medium" : ""}>
                      返却期限: {formatDateShort(eq.returnDue)}
                      {isOverdue && " ⚠️ 超過"}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  {eq.status === "available" ? (
                    <Button size="sm" onClick={() => openRentModal(eq)}>貸出</Button>
                  ) : eq.status === "rented" ? (
                    <Button size="sm" variant="secondary" onClick={() => handleReturn(eq.id)}>返却</Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 貸出モーダル */}
      <Modal isOpen={isRentModalOpen} onClose={() => setIsRentModalOpen(false)} title="装備を貸出">
        <div className="space-y-4">
          {selectedEquipment && (
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium">{selectedEquipment.name}</div>
              <div className="text-sm text-gray-500">{EQUIPMENT_CATEGORIES[selectedEquipment.category]}</div>
            </div>
          )}
          <Select
            label="貸出先会員"
            value={rentForm.memberId}
            onChange={(v) => setRentForm({ ...rentForm, memberId: v })}
            options={members.map((m) => ({ value: m.id.toString(), label: m.name }))}
            placeholder="選択してください"
            required
          />
          <Input
            label="返却予定日"
            type="date"
            value={rentForm.returnDue}
            onChange={(v) => setRentForm({ ...rentForm, returnDue: v })}
            required
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsRentModalOpen(false)}>キャンセル</Button>
            <Button onClick={handleRent}>貸出する</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =============================================================================
// InfoSidebar・ガイダンスデータ
// =============================================================================

const YAMANOKAI_FEATURES = [
  {icon: CalendarDays, title: '例会企画・カレンダー管理', description: '月次の例会企画をカレンダー形式で管理。参加予定者の集計と装備リストの自動生成を行います。', benefit: '企画立案時間を60%短縮'},
  {icon: ClipboardList, title: '計画書管理', description: '登山計画書の作成・提出を一元管理。緊急連絡先やルート情報を含む計画書を自動生成します。', benefit: '計画書作成時間を80%短縮'},
  {icon: Users, title: '会員管理', description: '会員の基本情報・体力ランク・保険情報を一元管理。緊急連絡先も即座に確認できます。', benefit: '会員情報の検索時間を90%削減'},
  {icon: Backpack, title: '装備管理', description: '共有装備の貸出・返却を管理。装備の使用状況と次回点検日も追跡します。', benefit: '装備紛失ゼロを実現'},
];

const YAMANOKAI_TIME_EFFICIENCY = [
  {task: '例会企画の作成', before: '1時間', after: '15分', saved: '45分/件'},
  {task: '計画書の作成', before: '2時間', after: '20分', saved: '100分/件'},
  {task: '会員情報の確認', before: '10分', after: '即時表示', saved: '10分/回'},
  {task: '装備の在庫確認', before: '30分', after: '即時表示', saved: '30分/回'},
];

const YAMANOKAI_CHALLENGES = [
  '例会の企画・案内がメールやLINEでバラバラ',
  '計画書が紙やExcelで管理されていて探しにくい',
  '会員の体力ランクや保険情報が把握しきれない',
  '共有装備の貸出状況が分からない',
  '例会記録が残らず活動の振り返りができない',
];

const YAMANOKAI_OVERVIEW = {
  description: '山岳会の活動全体をデジタル管理するシステムです。例会の企画から案内、計画書作成、記録、会員・装備管理まで一気通貫で運用できます。',
  automationPoints: [
    '例会企画のカレンダー管理と参加者集計',
    '計画書テンプレートによる自動生成',
    '会員の体力ランク・保険情報の一元管理',
    '共有装備の貸出・返却追跡',
  ],
  userBenefits: [
    '紙やExcelでの管理から脱却し情報を一元化',
    '安全管理の強化（緊急連絡先・保険情報の即時確認）',
    '活動記録の蓄積で山岳会の知見を共有',
  ],
};

const YAMANOKAI_OPERATION_STEPS = [
  {step: 1, action: 'ダッシュボードを確認', detail: '直近の例会予定・参加状況・アラートを一目で把握'},
  {step: 2, action: '例会企画を作成', detail: '山行の日程・ルート・難易度・集合場所を登録'},
  {step: 3, action: '例会案内を配信', detail: '企画から案内を自動生成し、参加募集を開始'},
  {step: 4, action: '計画書を作成', detail: '参加者・ルート・装備リストから計画書を自動生成'},
  {step: 5, action: '例会記録を残す', detail: '活動の写真・ルートGPS・振り返りを記録'},
];

const YAMANOKAI_GUIDANCE_STEPS = [
  {targetSelector: '[data-guidance="dashboard-menu"]', title: 'ダッシュボード', description: '直近の例会予定と参加状況を一目で確認できます。', position: 'right'},
  {targetSelector: '[data-guidance="event-plan-menu"]', title: '例会企画', description: '月間カレンダーで例会の企画を管理します。', position: 'right'},
  {targetSelector: '[data-guidance="member-menu"]', title: '会員管理', description: '会員の基本情報・体力ランク・保険情報を管理します。', position: 'right'},
  {targetSelector: '[data-guidance="equipment-menu"]', title: '装備管理', description: '共有装備の貸出・返却と在庫を管理します。', position: 'right'},
  {targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要や操作手順、時間削減効果を確認できます。', position: 'top'},
];

// =============================================================================
// メインコンポーネント
// =============================================================================

const YamanokaiMockApp = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // カスタムフックの初期化
  const memberManager = useMemberManager();
  const eventPlanManager = useEventPlanManager();
  const eventGuideManager = useEventGuideManager();
  const planManager = usePlanManager();
  const recordManager = useRecordManager();
  const equipmentManager = useEquipmentManager();

  const menuItems = [
    { id: "dashboard", label: "ダッシュボード", icon: "📅" },
    { id: "event-plan", label: "例会企画", icon: "📋" },
    { id: "event-guide", label: "例会案内", icon: "📢" },
    { id: "plan", label: "計画書", icon: "📝" },
    { id: "record", label: "例会記録", icon: "📖" },
    { id: "member", label: "会員管理", icon: "👥" },
    { id: "equipment", label: "装備管理", icon: "🎒" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            eventGuides={eventGuideManager.eventGuides}
            equipment={equipmentManager.equipment}
            members={memberManager.members}
            getMemberById={memberManager.getMemberById}
          />
        );
      case "event-plan":
        return (
          <EventPlanCalendar
            eventPlans={eventPlanManager.eventPlans}
            members={memberManager.members}
            addEventPlan={eventPlanManager.addEventPlan}
            getMemberById={memberManager.getMemberById}
          />
        );
      case "event-guide":
        return (
          <EventGuideList
            eventGuides={eventGuideManager.eventGuides}
            members={memberManager.members}
            getMemberById={memberManager.getMemberById}
            applyToEvent={eventGuideManager.applyToEvent}
            cancelApplication={eventGuideManager.cancelApplication}
          />
        );
      case "plan":
        return (
          <PlanList
            plans={planManager.plans}
            members={memberManager.members}
            eventGuides={eventGuideManager.eventGuides}
            addPlan={planManager.addPlan}
            updatePlan={planManager.updatePlan}
            getMemberById={memberManager.getMemberById}
          />
        );
      case "record":
        return (
          <RecordList
            records={recordManager.records}
            members={memberManager.members}
            addRecord={recordManager.addRecord}
            getMemberById={memberManager.getMemberById}
          />
        );
      case "member":
        return (
          <MemberManagement
            members={memberManager.members}
            addMember={memberManager.addMember}
            updateMember={memberManager.updateMember}
            deleteMember={memberManager.deleteMember}
            searchMembers={memberManager.searchMembers}
          />
        );
      case "equipment":
        return (
          <EquipmentManagement
            equipment={equipmentManager.equipment}
            members={memberManager.members}
            rentEquipment={equipmentManager.rentEquipment}
            returnEquipment={equipmentManager.returnEquipment}
            getEquipmentByCategory={equipmentManager.getEquipmentByCategory}
            getMemberById={memberManager.getMemberById}
          />
        );
      default:
        return <EmptyState message="ページが見つかりません" icon="❓" />;
    }
  };

  if (showSplash) {
    return <SplashScreen theme="emerald" systemName="山岳会管理システム" subtitle="Alpine Club Manager" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* モバイルヘッダー */}
      <header className="md:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <span className="text-xl">☰</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">サンプル山岳会</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* サイドバー（オーバーレイ） */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">🏔️ サンプル山岳会</h1>
          <p className="text-sm text-gray-500 mt-1">○○勤労者山岳会</p>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              data-guidance={`${item.id}-menu`}
              onClick={() => {
                setCurrentPage(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          <div className="border-t mt-2 pt-2">
            <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="emerald" />
          </div>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-6">{renderPage()}</div>
      </main>

      {/* 機能説明フローティングボタン */}
      <button
        data-guidance="info-button"
        onClick={() => setShowInfoSidebar(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
      >
        <PanelRightOpen className="w-4 h-4" />
        <span className="text-sm font-medium">機能説明</span>
      </button>

      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="emerald"
        systemIcon={Mountain}
        systemName="山岳会管理システム"
        systemDescription="山岳会の活動全体をデジタル管理するシステムです。例会の企画から案内、計画書、記録、会員・装備管理まで一気通貫で運用できます。"
        features={YAMANOKAI_FEATURES}
        timeEfficiency={YAMANOKAI_TIME_EFFICIENCY}
        challenges={YAMANOKAI_CHALLENGES}
        overview={YAMANOKAI_OVERVIEW}
        operationSteps={YAMANOKAI_OPERATION_STEPS}
      />

      <GuidanceOverlay
        steps={YAMANOKAI_GUIDANCE_STEPS}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="emerald"
      />
    </div>
  );
};

export default YamanokaiMockApp;
