// 実績サンプルデータの型定義
export interface WorkSampleData {
  id: number
  date: string
  title: string
  subtitle: string
  status: '完了' | '進行中' | '公開中'

  // 顧客情報
  clientName: string
  organization: string
  companyScale: '1-10名' | '11-50名' | '51-100名' | '100名以上'
  allowShowClient: boolean

  // カテゴリ・タグ
  jobCategory: string
  systemCategory: string
  collaborationTool: string

  // 課題と成果
  beforeChallenge: string
  description: string
  quantitativeResult: string

  // 技術・工夫
  points: string

  // 顧客評価
  customerVoice: string
  reply: string
  dealPoint: number
  toolPoint: number

  // プロジェクト情報
  projectDuration: string

  // 画像
  images: string[]
}

// サンプルデータ
export const sampleWorks: WorkSampleData[] = [
  {
    id: 1,
    date: '2024-11-01',
    title: '中古車修理プロセス可視化WEBシステム',
    subtitle: 'QRコード × 工程管理 × 受注管理',
    status: '公開中',
    clientName: '自動車ディーラー様',
    organization: '中古車部門',
    companyScale: '100名以上',
    allowShowClient: false,
    jobCategory: '自動車',
    systemCategory: 'Webアプリ',
    collaborationTool: 'QRコード,社内システム連携',
    beforeChallenge:
      '中古車の下取り後の商品化プロセス（修理、磨き、エーミング、検査等）が可視化されておらず、各工程の進捗や滞留状況が把握できない。工程間の連携が取れず、納期遅延や作業の重複が発生していた。',
    description:
      '社内の査定システムと連携し、中古車一台ごとに個別のQRコードを発行。作業員用のスマホ専用画面とバックオフィス用の管理画面など、約20種類の業務機能を実装。車両別の現工程、完了予測、プロセス別の滞留状況などを可視化。後に「受注販売管理機能」「メーカーの生産予測システムとの連動」「板金修理業務の受付管理機能」「拠点間車両輸送指示機能」へ拡張。',
    quantitativeResult:
      '工程可視化により納期遅延を大幅削減\n業務機能約20ページを実装\n開発エンジニア4名・業務責任者6名のチームマネジメント\n受注管理・メーカー連携など継続的に機能拡張中',
    points:
      'QRコードによる車両別のプロセス管理で、リアルタイムな進捗把握を実現。業界・業務理解から関係者折衝、エンジニアチームのマネジメントまで、プロジェクトリーダーとして推進。外部関係者（自動車メーカー、オークション業者）との連携も担当。',
    customerVoice: '',
    reply: '',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '継続中',
    images: [],
  },
  {
    id: 2,
    date: '2024-09-15',
    title: '現地調査アプリ',
    subtitle: 'オフライン対応 × PWA × 調査効率化',
    status: '完了',
    clientName: 'アルファエレワークス株式会社',
    organization: '',
    companyScale: '11-50名',
    allowShowClient: true,
    jobCategory: '電気設備',
    systemCategory: 'Webアプリ',
    collaborationTool: 'IndexedDB,PWA',
    beforeChallenge:
      'LED電球などを病院等の大型施設に提供する際の事前調査を紙で実施。電波が通じない山奥や建物内部での調査時にデータ入力ができない。紙からの転記作業に膨大な時間がかかり、人的ミスも発生。',
    description:
      'オンラインとオフラインの両方で利用できるオーダーメイドの調査入力アプリを構築。オフライン時はIndexedDB（端末上のDB）にデータを保存し、オンライン復帰時に自動でサーバーへアップロード。電球の種類や形状などのマスターデータを事前にダウンロードする機能も実装。',
    quantitativeResult:
      '現地調査時間: 半分以下に削減\n紙からの転記作業: 完全廃止\nテンプレート・過去パターン流用で入力効率大幅向上\n人員削減にも貢献',
    points:
      'オフラインモードとオンラインモードの切り替え機能を実装。並び替え、検索、同じパターンの部屋のコピー機能など、現地調査時の入力効率を高めるUI/UXを設計。クライアント様のシステム人材へのプログラミングレクチャーも実施。',
    customerVoice:
      '電波の届かない現場でも問題なく使えるのが素晴らしい。紙の転記作業がなくなり、調査報告書の作成が格段に早くなりました。',
    reply: 'オフライン対応は現場作業の効率化に大きく貢献しますね。今後のマスターデータ拡充もお気軽にご相談ください！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '2ヶ月',
    images: [],
  },
  {
    id: 3,
    date: '2024-07-20',
    title: 'レシピ管理 / 棚卸しWEBシステム',
    subtitle: 'レシピ電子化 × 原価計算 × 棚卸し自動集計',
    status: '完了',
    clientName: 'はなまるフードサービス株式会社',
    organization: '',
    companyScale: '51-100名',
    allowShowClient: true,
    jobCategory: '飲食業',
    systemCategory: 'Webアプリ',
    collaborationTool: 'タブレット最適化',
    beforeChallenge:
      '30店舗へのレシピ（手順、材料、画像等）を紙で作成・配布。変更があるたびに全店舗への配布作業が発生し、膨大な時間がかかっていた。食材の棚卸しも手作業で集計していた。',
    description:
      'お惣菜販売会社様の社内システムを構築。レシピデータの作成と配布機能を中心に業務機能を実装。タブレット端末への最適化と特定端末でしか利用できない認証機能を搭載。後に食材棚卸しおよび自動集計機能を追加。',
    quantitativeResult:
      '30店舗へのレシピ変更・配布作業を大幅効率化\nレシピ別の原価率・利益を自動計算\n棚卸し集計を自動化\n材料の仕入れ補助業務にも活用',
    points:
      '材料マスタと連動させることでレシピ別の原価率や利益を自動計算し、経営戦略にも活用可能に。タブレット専用UIで現場での使いやすさを追求。',
    customerVoice:
      'レシピの変更が即座に全店舗に反映されるようになり、本部の負担が大幅に減りました。原価計算機能は経営判断にも役立っています。',
    reply: '飲食業界では原価管理が重要ですね。棚卸し機能との連携で、より精度の高い経営分析が可能になりました！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '1.5ヶ月',
    images: [],
  },
  {
    id: 4,
    date: '2024-05-10',
    title: '老人健診システム',
    subtitle: 'React × GAS × 補助金申請自動化',
    status: '完了',
    clientName: '堀尾医院',
    organization: '',
    companyScale: '1-10名',
    allowShowClient: true,
    jobCategory: '医療・福祉',
    systemCategory: 'Webアプリ',
    collaborationTool: 'スプレッドシート,GAS',
    beforeChallenge:
      '老人検診の問診をGoogleFormで実施したいとのご要望だったが、看護師が扱いやすいUIや社内データベースとの連動が難しい。問診後のバックオフィス業務（社内資料作成、自治体への補助金申請書類作成）に多大な時間がかかっていた。',
    description:
      '病院における「老人検診」のデジタル化プロジェクトを担当。社内データベース（スプレッドシート）に連動する問診用のフロントエンドをReactで開発。スプレッドシートとGAS・GWSを用いた後続業務の自動化プログラムを構築。',
    quantitativeResult:
      'バックオフィス業務の約80%を自動化\n社内用資料作成を自動化\n自治体向け補助金申請書式の作成を自動化\n地域の病院組合での汎用化を協議中',
    points:
      'GoogleFormでは実現できない、看護師が扱いやすいUIと社内DBとの連動を実現するため、フロント部分のみReactで構築することを提案。問診結果に基づく各種書類の自動生成で大幅な業務効率化を達成。',
    customerVoice: '看護師からも「使いやすい」と好評です。補助金申請の書類作成が自動化されて、事務作業の負担が激減しました。',
    reply:
      '医療現場のデジタル化は慎重な設計が必要ですが、現場の声を反映したUIが好評で嬉しいです。他の医療機関への展開も応援しています！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '1ヶ月',
    images: [],
  },
  {
    id: 5,
    date: '2024-03-15',
    title: '学習支援アプリ「Grouping / Colabo」',
    subtitle: 'リアルタイム通信 × 心理尺度分析 × 班自動生成',
    status: '進行中',
    clientName: '共立女子大学',
    organization: '',
    companyScale: '100名以上',
    allowShowClient: true,
    jobCategory: '教育',
    systemCategory: 'Webアプリ',
    collaborationTool: 'Socket.io,リアルタイム通信',
    beforeChallenge:
      '授業中の生徒の状況把握が難しく、要支援生徒の特定ができない。学習班の編成も教員の勘や経験に頼っており、最適な班構成ができているか不明。心理学研究の知見を授業運営に活かしたいとのニーズ。',
    description:
      '教師と生徒が授業中に用いる学習支援アプリをアイデア出しから設計、開発、運用まで担当。心理学研究の知見に基づいたリアルタイムアンケートと、その結果に基づく「要支援生徒の特定」「学習班の自動生成」ロジックを企画・構築。現在は進化版「Colabo」アプリを開発中。',
    quantitativeResult:
      '共立女子大学・東京都の協力校で実際の授業に導入\n学会での発表補助を実施\nリアルタイム通信で授業中のスムーズな利用を実現\n進化版「Colabo」を開発中',
    points:
      'Socket.ioを用いたリアルタイム通信により、授業中のスムーズなアンケート収集と結果表示を実現。心理尺度に基づく生徒の状況分析と、教員への関わり方の指示・示唆を提供。',
    customerVoice:
      'リアルタイムで生徒の状況が把握できるようになり、授業運営が大きく変わりました。班編成の自動化も教員の負担軽減につながっています。',
    reply: '教育現場でのテクノロジー活用は可能性が大きいですね。「Colabo」のさらなる進化にご期待ください！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '継続中',
    images: [],
  },
  {
    id: 6,
    date: '2024-01-20',
    title: '運行管理基幹WEBシステム',
    subtitle: '配車計画 × 自動配布 × 請求自動化',
    status: '公開中',
    clientName: '西日本運送有限会社',
    organization: '',
    companyScale: '51-100名',
    allowShowClient: true,
    jobCategory: '物流・運送',
    systemCategory: 'Webアプリ',
    collaborationTool: 'モバイル対応',
    beforeChallenge:
      'アナログのボードで配車計画を管理。「先月データの引用」や「テンプレートパターン」との照合ができず、誤配車や設定忘れが発生。営業所ごとにExcelで9種類のレポートを手動作成し、請求書作成やドライバ別運賃計算にも膨大な時間がかかっていた。',
    description:
      '運送会社の基幹システムを構築。営業所長による配車計画の立案と、ドライバへのスケジュール自動配布を起点に、運行関連業務が全般的に実施できるWEBアプリを開発。認証、権限管理、モバイル版UIを提供。社内独自の文化や業務オペレーションを設計・データ構造に反映。',
    quantitativeResult:
      '配車計画のデジタル化で「自動化」と「誤配車検知」を実現\nExcelレポート9種類を完全自動化\n取引先への請求書作成を自動化\nドライバ別運賃計算を自動化\n社内基幹システムとして運用中',
    points:
      '「先月データの引用」や「テンプレートパターン」との照合で異常値や設定忘れを通知する機能を実装。運用後も一括登録機能、入力の簡素化、UI改善など随時機能更新を継続。',
    customerVoice:
      '手書きのボードから解放され、配車ミスが激減しました。Excelで作っていた9種類のレポートが自動で出るようになり、月末の残業がなくなりました。',
    reply:
      '運送業界は独自のオペレーションが多いですが、丁寧にヒアリングして設計に落とし込めたことが成功の鍵でした。引き続き機能拡張をサポートします！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '3ヶ月',
    images: [],
  },
  {
    id: 7,
    date: '2023-10-01',
    title: '現場管理アプリ',
    subtitle: '建設業向け現場進捗管理',
    status: '完了',
    clientName: '株式会社聡建',
    organization: '',
    companyScale: '11-50名',
    allowShowClient: true,
    jobCategory: '建設業',
    systemCategory: 'Webアプリ',
    collaborationTool: 'モバイル対応',
    beforeChallenge:
      '複数の建設現場の進捗管理が煩雑で、現場ごとの状況把握に時間がかかっていた。紙ベースの報告では情報共有にタイムラグが発生。',
    description:
      '建設現場の進捗をリアルタイムで管理できるWEBアプリを構築。商談、ヒアリング、要件定義、設計、開発、テスト、運用・保守の全てを1人で実施。',
    quantitativeResult: '複数現場の一元管理を実現\n現場報告のリアルタイム化\n情報共有のタイムラグを解消',
    points: '現場作業員がスマホから簡単に入力できるUIを設計。管理者はPC画面で全現場の状況を一覧把握可能。',
    customerVoice: '現場の状況がリアルタイムで分かるようになり、段取りが格段に良くなりました。',
    reply: '建設業界のDX化のお手伝いができて嬉しいです！',
    dealPoint: 5,
    toolPoint: 4.5,
    projectDuration: '1ヶ月',
    images: [],
  },
  {
    id: 8,
    date: '2023-08-15',
    title: '勤怠アプリ',
    subtitle: '建設業向け勤怠管理',
    status: '完了',
    clientName: '株式会社吉成建築',
    organization: '',
    companyScale: '11-50名',
    allowShowClient: true,
    jobCategory: '建設業',
    systemCategory: 'Webアプリ',
    collaborationTool: 'スマホ対応',
    beforeChallenge: '紙のタイムカードで勤怠管理を実施。集計作業に時間がかかり、給与計算の負担が大きかった。',
    description:
      '建設会社向けの勤怠管理アプリを構築。スマホからの打刻、現場ごとの勤務時間集計、給与計算連携などを実装。商談から運用・保守まで1人で実施。',
    quantitativeResult: '勤怠集計作業を大幅削減\n給与計算との連携で転記作業廃止\nペーパーレス化を実現',
    points: '現場直行直帰の多い建設業に合わせ、GPSを活用した打刻機能も検討・実装。',
    customerVoice: '月末の集計作業がほぼなくなり、給与計算がスムーズになりました。',
    reply: '建設業の働き方に合わせた設計が重要ですね！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '3週間',
    images: [],
  },
  {
    id: 9,
    date: '2023-06-01',
    title: '日報アプリ',
    subtitle: 'レンタカー業向け日報管理',
    status: '完了',
    clientName: 'トヨタレンタリース様',
    organization: '',
    companyScale: '100名以上',
    allowShowClient: true,
    jobCategory: 'サービス業',
    systemCategory: 'Webアプリ',
    collaborationTool: 'スマホ対応',
    beforeChallenge: '紙の日報を毎日提出し、事務員が手作業で集計。転記ミスや集計漏れが発生していた。',
    description:
      'レンタカー業務の日報をデジタル化。スマホからの入力、自動集計、レポート出力機能を実装。商談から運用・保守まで1人で実施。',
    quantitativeResult: '日報処理時間を大幅削減\n転記ミス・集計漏れを解消\nペーパーレス化を実現',
    points: '現場スタッフが使いやすいシンプルなUIを設計。管理者向けの集計レポート機能も充実。',
    customerVoice: '紙の日報から解放され、スタッフからも好評です。集計も自動で楽になりました。',
    reply: 'シンプルで使いやすいUIが定着のポイントですね！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '1ヶ月',
    images: [],
  },
  {
    id: 10,
    date: '2023-04-01',
    title: 'WEB予約システム',
    subtitle: '旅館向け予約管理',
    status: '完了',
    clientName: '和遊館 丸豊',
    organization: '',
    companyScale: '1-10名',
    allowShowClient: true,
    jobCategory: '宿泊業',
    systemCategory: 'Webアプリ',
    collaborationTool: 'カレンダー連携',
    beforeChallenge: '電話予約のみで、営業時間外の予約を取りこぼし。予約台帳の管理が煩雑でダブルブッキングのリスクも。',
    description:
      '旅館向けのWEB予約システムを構築。24時間予約受付、空き状況のリアルタイム表示、予約管理機能を実装。商談から運用・保守まで1人で実施。',
    quantitativeResult: '24時間予約受付を実現\n電話対応の負担を軽減\nダブルブッキングを防止',
    points: '旅館の雰囲気に合わせた和風デザインのUIを採用。シニア層にも使いやすい大きめのボタン設計。',
    customerVoice: '夜中や定休日にも予約が入るようになり、売上アップにつながりました。',
    reply: '宿泊業界のオンライン予約対応は必須ですね。さらなる機能追加もご相談ください！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '3週間',
    images: [],
  },
  {
    id: 11,
    date: '2023-02-01',
    title: '製造業品質レビューサイト',
    subtitle: '金型製造業向け品質管理',
    status: '完了',
    clientName: '松野金型製作所',
    organization: '',
    companyScale: '11-50名',
    allowShowClient: true,
    jobCategory: '製造業',
    systemCategory: 'Webアプリ',
    collaborationTool: '画像アップロード',
    beforeChallenge: '品質レビューを紙で管理。過去の品質データの検索や分析ができず、品質改善のPDCAが回しにくかった。',
    description:
      '金型製造業向けの品質レビューシステムを構築。製品画像のアップロード、レビュー記録、過去データの検索・分析機能を実装。商談から運用・保守まで1人で実施。',
    quantitativeResult: '品質データのデジタル化\n過去データの検索・分析が可能に\n品質改善PDCAの高速化',
    points: '製造現場での使いやすさを重視したUI設計。画像を活用した視覚的な品質記録が可能。',
    customerVoice: '過去の品質データがすぐに検索できるようになり、品質改善のスピードが上がりました。',
    reply: '製造業の品質管理は蓄積されたデータが財産になりますね！',
    dealPoint: 5,
    toolPoint: 4.5,
    projectDuration: '1ヶ月',
    images: [],
  },
  {
    id: 12,
    date: '2022-12-01',
    title: '求人管理システム',
    subtitle: '人材業向け応募者管理',
    status: '完了',
    clientName: 'MASTER key株式会社',
    organization: '',
    companyScale: '1-10名',
    allowShowClient: true,
    jobCategory: '人材業',
    systemCategory: 'Webアプリ',
    collaborationTool: 'メール連携',
    beforeChallenge: '複数の求人媒体からの応募者情報を手動で集約。進捗管理がExcelで煩雑になり、対応漏れが発生していた。',
    description:
      '人材会社向けの求人管理システムを構築。応募者情報の一元管理、進捗ステータス管理、メール送信機能を実装。商談から運用・保守まで1人で実施。',
    quantitativeResult: '応募者情報の一元管理を実現\n対応漏れを防止\n進捗状況の可視化',
    points: 'ステータス管理をカンバン形式で視覚化。対応期限のアラート機能で漏れを防止。',
    customerVoice: '応募者の進捗が一目で分かるようになり、対応漏れがなくなりました。',
    reply: '人材業界はスピード勝負ですね。効率的な管理で機会損失を防ぎましょう！',
    dealPoint: 5,
    toolPoint: 5,
    projectDuration: '1ヶ月',
    images: [],
  },
]

// フィルター用のユニークな値を取得するヘルパー
export const getUniqueValues = (key: keyof WorkSampleData): string[] => {
  const values = sampleWorks.map(work => work[key]).filter(Boolean)
  return [...new Set(values.map(v => String(v)))]
}

// 業種カテゴリ一覧
export const jobCategories = getUniqueValues('jobCategory')

// システムカテゴリ一覧
export const systemCategories = getUniqueValues('systemCategory')

// 企業規模一覧
export const companyScales = ['1-10名', '11-50名', '51-100名', '100名以上']

// プロジェクト期間一覧
export const projectDurations = ['1週間', '2週間', '3週間', '1ヶ月', '1.5ヶ月', '2ヶ月', '3ヶ月', '継続中']
