import React from 'react'
import {Document, Page, Text, View, StyleSheet, Font} from '@react-pdf/renderer'

// フォント登録
Font.register({
  family: 'Nasu-Regular',
  src: '/fonts/Nasu-Regular.ttf',
  fontWeight: 'normal',
})
Font.register({
  family: 'Nasu-Bold',
  src: '/fonts/Nasu-Bold.ttf',
  fontWeight: 'bold',
})

// =============================================================================
// 共通スタイル
// =============================================================================

const s = StyleSheet.create({
  page: {
    fontFamily: 'Nasu-Regular',
    fontSize: 10,
    padding: 40,
    color: '#000',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nasu-Bold',
    textAlign: 'center',
    marginBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Nasu-Bold',
    backgroundColor: '#f0f0f0',
    padding: '4 8',
    borderWidth: 1,
    borderColor: '#999',
    borderBottomWidth: 0,
  },
  sectionBody: {
    padding: '8',
    borderWidth: 1,
    borderColor: '#999',
    minHeight: 40,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#999',
    borderTopWidth: 0,
  },
  label: {
    width: '25%',
    backgroundColor: '#f5f5f5',
    padding: '4 8',
    borderRightWidth: 1,
    borderRightColor: '#999',
    fontSize: 9,
    color: '#666',
  },
  value: {
    flex: 1,
    padding: '4 8',
    fontSize: 9,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#999',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#999',
    borderTopWidth: 0,
  },
  tableCell: {
    padding: '4 6',
    borderRightWidth: 1,
    borderRightColor: '#999',
    fontSize: 9,
  },
  footer: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  badge: {
    fontSize: 8,
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '2 6',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  listItem: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 8,
  },
})

// =============================================================================
// 共通コンポーネント
// =============================================================================

const InfoTable = ({rows}: {rows: Array<{label: string; value: string}>}) => (
  <View style={{marginBottom: 8}}>
    {rows.map((r, i) => (
      <View key={i} style={{...s.row, ...(i === 0 ? {borderTopWidth: 1} : {})}}>
        <Text style={s.label}>{r.label}</Text>
        <Text style={s.value}>{r.value}</Text>
      </View>
    ))}
  </View>
)

const Section = ({title, children, minHeight}: {title: string; children: React.ReactNode; minHeight?: number}) => (
  <View style={{marginBottom: 8}}>
    <Text style={s.sectionHeader}>{title}</Text>
    <View style={{...s.sectionBody, minHeight: minHeight || 40}}>{children}</View>
  </View>
)

// =============================================================================
// 共通Props型
// =============================================================================

type PdfDocumentContent = {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  representative: string
  facilityName: string
  facilityAddress: string
  patientName: string
  patientNameKana: string
  patientBuilding: string
  patientFloor: string
  patientRoom: string
  teethCount: number
  hasDenture: string
  hasOralHypofunction: string
  visitCondition: string
  oralFindings: string
  treatment: string
  nextPlan: string
  dhMinutes: number
  createdAt: string
  doctorName?: string
  diseases?: string[]
  treatmentPerformed?: string[]
  managementPlan?: string
  oralHygieneGoal?: string
  guidanceContent?: string
  homeCareMethod?: string
  nextGuidancePlan?: string
  familyExplanation?: string
  managementPolicy?: string
}

// =============================================================================
// 1. 管理計画書PDF
// =============================================================================

export const KanriKeikakuPdf = ({content}: {content: PdfDocumentContent}) => (
  <Document>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>歯科疾患在宅療養管理計画書</Text>
      <Text style={s.subtitle}>作成日: {content.createdAt}</Text>

      <InfoTable
        rows={[
          {label: '医療機関名', value: content.clinicName},
          {label: '住所', value: content.clinicAddress},
          {label: '電話番号', value: content.clinicPhone},
          {label: '管理者', value: content.representative},
        ]}
      />

      <InfoTable
        rows={[
          {label: '患者氏名', value: content.patientName},
          {label: 'ふりがな', value: content.patientNameKana},
          {label: '建物・部屋', value: `${content.patientBuilding} ${content.patientFloor}-${content.patientRoom}`},
          {label: '歯数', value: `${content.teethCount}歯`},
          {label: '義歯', value: content.hasDenture},
          {label: '口腔機能低下症', value: content.hasOralHypofunction},
        ]}
      />

      <Section title="口腔内所見">
        <Text style={{fontSize: 9}}>{content.oralFindings || '（記載なし）'}</Text>
      </Section>

      <Section title="処置内容">
        <Text style={{fontSize: 9}}>{content.treatment || '（記載なし）'}</Text>
      </Section>

      <Section title="管理計画（今後の方針）" minHeight={60}>
        <Text style={{fontSize: 9}}>{content.managementPlan || '（未入力）'}</Text>
      </Section>

      <Section title="口腔衛生目標">
        <Text style={{fontSize: 9}}>{content.oralHygieneGoal || '（未入力）'}</Text>
      </Section>

      <Section title="次回診療予定">
        <Text style={{fontSize: 9}}>{content.nextPlan || '（記載なし）'}</Text>
      </Section>
    </Page>
  </Document>
)

// =============================================================================
// 2. 訪問歯科衛生指導説明書PDF
// =============================================================================

export const HoueishiPdf = ({content}: {content: PdfDocumentContent}) => (
  <Document>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>訪問歯科衛生指導説明書</Text>
      <Text style={s.subtitle}>指導日: {content.createdAt}</Text>

      <InfoTable
        rows={[
          {label: '医療機関名', value: content.clinicName},
          {label: '患者氏名', value: content.patientName},
          {label: 'ふりがな', value: content.patientNameKana},
          {label: '指導時間', value: `${content.dhMinutes}分${content.dhMinutes >= 20 ? '（20分以上）' : ''}`},
        ]}
      />

      <Section title="訪問時の様子">
        <Text style={{fontSize: 9}}>{content.visitCondition || '（記載なし）'}</Text>
      </Section>

      <Section title="口腔内所見">
        <Text style={{fontSize: 9}}>{content.oralFindings || '（記載なし）'}</Text>
      </Section>

      <Section title="指導内容" minHeight={60}>
        <Text style={{fontSize: 9}}>{content.guidanceContent || '（未入力）'}</Text>
      </Section>

      <Section title="ご家庭でのケア方法" minHeight={60}>
        <Text style={{fontSize: 9}}>{content.homeCareMethod || '（未入力）'}</Text>
      </Section>

      <Section title="次回指導予定">
        <Text style={{fontSize: 9}}>{content.nextGuidancePlan || '（未入力）'}</Text>
      </Section>

      <Text style={s.footer}>ご不明な点がございましたら、お気軽にお問い合わせください。</Text>
      <Text style={s.footer}>{content.clinicName}</Text>
    </Page>
  </Document>
)

// =============================================================================
// 3. 歯科訪問診療実績表PDF
// =============================================================================

export const HoumonJissekiPdf = ({content}: {content: PdfDocumentContent}) => (
  <Document>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>歯科訪問診療実績表</Text>
      <Text style={s.subtitle}>作成日: {content.createdAt}</Text>

      <InfoTable
        rows={[
          {label: '医療機関名', value: content.clinicName},
          {label: '施設名', value: content.facilityName},
          {label: '施設住所', value: content.facilityAddress},
          {label: '歯科医師名', value: content.doctorName || '（未設定）'},
        ]}
      />

      {/* テーブルヘッダー */}
      <View style={s.tableHeader}>
        <Text style={{...s.tableCell, width: 30}}>No.</Text>
        <Text style={{...s.tableCell, flex: 1}}>患者氏名</Text>
        <Text style={{...s.tableCell, width: 80}}>訪問日時</Text>
        <Text style={{...s.tableCell, width: 60}}>診療時間</Text>
        <Text style={{...s.tableCell, flex: 1, borderRightWidth: 0}}>処置概要</Text>
      </View>

      {/* 1行目: 現在の患者 */}
      <View style={s.tableRow}>
        <Text style={{...s.tableCell, width: 30, textAlign: 'center'}}>1</Text>
        <Text style={{...s.tableCell, flex: 1}}>{content.patientName}</Text>
        <Text style={{...s.tableCell, width: 80}}>{content.createdAt}</Text>
        <Text style={{...s.tableCell, width: 60}}>-</Text>
        <Text style={{...s.tableCell, flex: 1, borderRightWidth: 0}}>{content.treatment || '-'}</Text>
      </View>

      {/* 空行 */}
      {[2, 3, 4, 5].map(n => (
        <View key={n} style={s.tableRow}>
          <Text style={{...s.tableCell, width: 30, textAlign: 'center', color: '#999'}}>{n}</Text>
          <Text style={{...s.tableCell, flex: 1}}> </Text>
          <Text style={{...s.tableCell, width: 80}}> </Text>
          <Text style={{...s.tableCell, width: 60}}> </Text>
          <Text style={{...s.tableCell, flex: 1, borderRightWidth: 0}}> </Text>
        </View>
      ))}

      <Section title="備考">
        <Text style={{fontSize: 9}}> </Text>
      </Section>
    </Page>
  </Document>
)

// =============================================================================
// 4. 管理計画説明文書PDF
// =============================================================================

export const ShizaikanBunshoPdf = ({content}: {content: PdfDocumentContent}) => (
  <Document>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>歯科疾患在宅療養管理計画 説明文書</Text>
      <Text style={s.subtitle}>作成日: {content.createdAt}</Text>

      <InfoTable
        rows={[
          {label: '医療機関名', value: content.clinicName},
          {label: '患者氏名', value: content.patientName},
          {label: 'ふりがな', value: content.patientNameKana},
        ]}
      />

      <Section title="口腔内の状態">
        <Text style={{fontSize: 9}}>{content.oralFindings || '（記載なし）'}</Text>
      </Section>

      <Section title="本日の処置内容">
        <Text style={{fontSize: 9}}>{content.treatment || '（記載なし）'}</Text>
      </Section>

      <Section title="今後の管理計画" minHeight={60}>
        <Text style={{fontSize: 9}}>{content.managementPlan || '（記載なし）'}</Text>
      </Section>

      <Section title="患者様・ご家族への説明内容" minHeight={60}>
        <Text style={{fontSize: 9}}>{content.familyExplanation || '（未入力）'}</Text>
      </Section>

      <Section title="次回診療予定">
        <Text style={{fontSize: 9}}>{content.nextPlan || '（記載なし）'}</Text>
      </Section>

      <Text style={s.footer}>ご不明な点がございましたら、お気軽にお問い合わせください。</Text>
      <Text style={s.footer}>{content.clinicName}</Text>
    </Page>
  </Document>
)

// =============================================================================
// 5. 在歯管報告書PDF
// =============================================================================

export const ZaishikanPdf = ({content}: {content: PdfDocumentContent}) => (
  <Document>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>在宅患者歯科治療総合医療管理報告書</Text>
      <Text style={s.subtitle}>作成日: {content.createdAt}</Text>

      <InfoTable
        rows={[
          {label: '医療機関名', value: content.clinicName},
          {label: '患者氏名', value: content.patientName},
          {label: 'ふりがな', value: content.patientNameKana},
        ]}
      />

      <Section title="基礎疾患">
        {content.diseases?.length ? (
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {content.diseases.map((d, i) => (
              <Text key={i} style={s.badge}>
                {d}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={{fontSize: 9, color: '#999'}}>（基礎疾患の登録なし）</Text>
        )}
      </Section>

      <Section title="実施した治療">
        {content.treatmentPerformed?.length ? (
          <View>
            {content.treatmentPerformed.map((t, i) => (
              <Text key={i} style={s.listItem}>
                ・{t}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={{fontSize: 9, color: '#999'}}>（実施治療の登録なし）</Text>
        )}
      </Section>

      <Section title="口腔内所見">
        <Text style={{fontSize: 9}}>{content.oralFindings || '（記載なし）'}</Text>
      </Section>

      <Section title="管理方針" minHeight={60}>
        <Text style={{fontSize: 9}}>{content.managementPolicy || '（未入力）'}</Text>
      </Section>

      <Text style={s.footer}>{content.clinicName}</Text>
    </Page>
  </Document>
)

// =============================================================================
// 6. 訪問歯科診療治療内容説明書PDF（新）
// =============================================================================

const chk = (v: boolean) => (v ? '☑' : '☐')

const HoumonChiryouPdf = ({content}: {content: Record<string, unknown>}) => {
  const c = content as Record<string, unknown>
  const posStr = (pos: Record<string, boolean> | undefined) => {
    if (!pos) return ''
    return ['upper', 'lower', 'front', 'right', 'left']
      .filter(k => pos[k])
      .map(k => ({upper: '上', lower: '下', front: '前', right: '右', left: '左'})[k])
      .join(' ')
  }
  const treatments: Array<{key: string; label: string; posKey?: string}> = [
    {key: 'anesthesia', label: '麻酔をしました', posKey: 'anesthesiaPositions'},
    {key: 'gumTreatment', label: '歯ぐきの治療をしました', posKey: 'gumPositions'},
    {key: 'rootTreatment', label: '根の治療をしました', posKey: 'rootPositions'},
    {key: 'extraction', label: '歯を抜きました', posKey: 'extractionPositions'},
    {key: 'smallCavity', label: '小さな虫歯の治療をしました', posKey: 'smallCavityPositions'},
    {key: 'crownBridge', label: '冠・ブリッジを作ります', posKey: 'crownPositions'},
    {key: 'newDenture', label: '新しい入れ歯を作ります', posKey: 'newDenturePositions'},
    {key: 'dentureRepair', label: 'お持ちの入れ歯を修理します', posKey: 'dentureRepairPositions'},
    {key: 'dentureAdjust', label: '入れ歯の調整をしました', posKey: 'dentureAdjustPositions'},
    {key: 'oralStretch', label: '口腔周囲筋ストレッチをしました'},
    {key: 'xray', label: 'レントゲンを撮影しました'},
    {key: 'medication', label: 'お薬をだしました'},
  ]
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>訪問歯科診療治療内容説明書</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
          <Text style={{fontSize: 10}}>{String(c.patientName || '')} 様</Text>
          <Text style={{fontSize: 8}}>No. {String(c.documentNo || '')}</Text>
        </View>
        <Text style={{fontSize: 9, marginBottom: 8}}>実施日: {String(c.visitDate || '')}　開始 {String(c.startTime || '')} ～ 終了 {String(c.endTime || '')}</Text>

        <Text style={{...s.sectionHeader, marginBottom: 0}}>本日の治療内容</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 8, marginBottom: 8}}>
          {treatments.map(t => {
            if (!c[t.key]) return null
            const pos = t.posKey ? posStr(c[t.posKey] as Record<string, boolean>) : ''
            return (
              <Text key={t.key} style={{fontSize: 9, marginBottom: 2}}>
                ☑ {t.label}{pos ? `（${pos}）` : ''}
              </Text>
            )
          })}
          {c.otherTreatment ? <Text style={{fontSize: 9, marginBottom: 2}}>☑ その他: {String(c.otherTreatmentText || '')}</Text> : null}
        </View>

        <Section title="連絡事項">
          <Text style={{fontSize: 9}}>{String(c.contactNotes || '')}</Text>
        </Section>
        <Section title="療養上の注意点">
          <Text style={{fontSize: 9}}>{String(c.careNotes || '')}</Text>
        </Section>

        <View style={{borderWidth: 1, borderColor: '#999', padding: 8, marginTop: 8}}>
          <Text style={{fontSize: 9}}>{String(c.clinicName || '')}</Text>
          <Text style={{fontSize: 9}}>{String(c.clinicAddress || '')}</Text>
          <Text style={{fontSize: 9}}>TEL　{String(c.clinicPhone || '')}</Text>
          <Text style={{fontSize: 9}}>歯科医師　{String(c.doctorName || '')}</Text>
        </View>
      </Page>
    </Document>
  )
}

// =============================================================================
// 7. 歯在管管理計画書PDF（新版 - KanriKeikakuData対応）
// =============================================================================

const KanriKeikakuNewPdf = ({content}: {content: Record<string, unknown>}) => {
  const c = content as Record<string, unknown>
  const statusLabel = (v: string) => ({good: '良好', poor: '不良', veryPoor: '著しく不良', slightlyPoor: 'やや不調', none: 'なし', mild: '軽度', severe: '重度'})[v] || v
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={{fontSize: 7, marginBottom: 2}}>歯科疾患在宅療養管理・退院時共同指導</Text>
        <Text style={{...s.title, fontSize: 14}}>歯と口・口腔機能の治療管理</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
          <Text style={{fontSize: 10}}>お名前 {String(c.patientName || '')} 様</Text>
          <Text style={{fontSize: 9}}>{String(c.date || '')}</Text>
        </View>

        <Text style={{...s.sectionHeader, fontSize: 9}}>全身の状態</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>治療中の疾患: {c.hasDiseases ? `あり（${String(c.diseaseNames || '')}）` : 'なし'}</Text>
          <Text style={{fontSize: 8}}>服薬: {c.hasMedication ? `あり（${String(c.medicationNames || '')}）` : 'なし'}</Text>
          <Text style={{fontSize: 8}}>肺炎の既往: {statusLabel(String(c.pneumoniaHistory || 'none'))}</Text>
          <Text style={{fontSize: 8}}>食事形態: {String(c.dietType || '')}</Text>
        </View>

        <Text style={{...s.sectionHeader, fontSize: 9}}>歯と口の状態</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>清掃の状況: {statusLabel(String(c.cleaningStatus || ''))}</Text>
          <Text style={{fontSize: 8}}>口腔乾燥: {statusLabel(String(c.oralDryness || ''))}</Text>
          <Text style={{fontSize: 8}}>むし歯: {c.hasCavity ? 'あり' : 'なし'}　歯周疾患: {c.hasPeriodontal ? 'あり' : 'なし'}</Text>
        </View>

        <Text style={{...s.sectionHeader, fontSize: 9}}>口腔機能の状態</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>咀嚼機能: {statusLabel(String(c.masticationStatus || ''))}　摂食嚥下: {statusLabel(String(c.swallowingStatus || ''))}</Text>
          <Text style={{fontSize: 8}}>発音機能: {statusLabel(String(c.pronunciationStatus || ''))}　舌の動き: {statusLabel(String(c.tongueMovement || ''))}</Text>
        </View>

        <Section title="管理方針・治療方針" minHeight={50}>
          <Text style={{fontSize: 9}}>{String(c.managementPolicy || '')}</Text>
        </Section>

        <View style={{alignItems: 'flex-end', marginTop: 8}}>
          <Text style={{fontSize: 9}}>医療機関名　{String(c.clinicName || '')}</Text>
          <Text style={{fontSize: 9}}>担当歯科医　{String(c.doctorName || '')}</Text>
        </View>
      </Page>
    </Document>
  )
}

// =============================================================================
// 8. 訪問歯科衛生指導説明書PDF（新版 - HygieneGuidanceData対応）
// =============================================================================

const HoueishiNewPdf = ({content}: {content: Record<string, unknown>}) => {
  const c = content as Record<string, unknown>
  const oc = (c.oralCondition || {}) as Record<string, boolean>
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>訪問歯科衛生指導説明書</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
          <Text style={{fontSize: 10}}>{String(c.patientName || '')} 様</Text>
          <Text style={{fontSize: 9}}>{String(c.date || '')}</Text>
        </View>
        <Text style={{fontSize: 9, marginBottom: 8}}>訪問先: {c.visitType === 'home' ? '居宅' : '施設'}（{String(c.facilityName || '')}）</Text>

        <Text style={{...s.sectionHeader, fontSize: 9}}>口腔の状況</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>歯垢: {chk(oc.plaque)}　歯石: {chk(oc.calculus)}　食物残渣: {chk(oc.foodDebris)}　舌苔: {chk(oc.tongueCoating)}</Text>
          <Text style={{fontSize: 8}}>口腔内出血: {chk(oc.oralBleeding)}　口腔乾燥: {chk(oc.oralDryness)}　口臭: {chk(oc.halitosis)}</Text>
        </View>

        <Text style={{...s.sectionHeader, fontSize: 9}}>口腔の清掃について</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>{chk(!!c.cleaningImportance)} 口腔清掃の重要性　{chk(!!c.garglingBrushing)} ブラッシング・歯肉マッサージ励行</Text>
          <Text style={{fontSize: 8}}>{chk(!!c.salivaryMassage)} 唾液腺マッサージ・摂食嚥下指導</Text>
        </View>

        <Section title="注意事項（食生活の改善等）">
          <Text style={{fontSize: 9}}>{String(c.careNotes || '')}</Text>
        </Section>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}>
          <Text style={{fontSize: 9}}>歯科衛生士　{String(c.hygienistName || '')}</Text>
          <Text style={{fontSize: 9}}>時間　{String(c.startTime || '')} ～ {String(c.endTime || '')}</Text>
        </View>
        <View style={{borderWidth: 1, borderColor: '#999', padding: 6, marginTop: 4}}>
          <Text style={{fontSize: 8}}>{String(c.clinicName || '')}</Text>
          <Text style={{fontSize: 8}}>{String(c.clinicAddress || '')}　TEL {String(c.clinicPhone || '')}</Text>
          <Text style={{fontSize: 8}}>歯科医師　{String(c.doctorName || '')}</Text>
        </View>
      </Page>
    </Document>
  )
}

// =============================================================================
// 9. 口腔機能精密検査記録用紙PDF
// =============================================================================

const SeimitsuKensaPdf = ({content}: {content: Record<string, unknown>}) => {
  const c = content as Record<string, unknown>
  const r = (c.oralFunctionRecord || {}) as Record<string, unknown>
  const tests = [
    {cat: '① 口腔衛生状態不良', test: '舌苔付着程度', ref: '50%以上', val: r.tongueCoatingPercent ? `${r.tongueCoatingPercent}%` : '', app: !!r.tongueCoatingApplicable},
    {cat: '② 口腔乾燥', test: '口腔粘膜湿潤度', ref: '27未満', val: String(r.oralMoistureValue || ''), app: !!r.oralDrynessApplicable},
    {cat: '③ 咬合力低下', test: '残存歯数', ref: '20本未満', val: r.remainingTeeth ? `${r.remainingTeeth}本` : '', app: !!r.biteForceApplicable},
    {cat: '④ 舌口唇運動機能低下', test: 'ディアドコキネシス', ref: '6回/秒未満', val: `pa:${r.oralDiadochoPa || '_'} ta:${r.oralDiadochoTa || '_'} ka:${r.oralDiadochoKa || '_'}`, app: !!r.oralMotorApplicable},
    {cat: '⑤ 低舌圧', test: '舌圧検査', ref: '30kPa未満', val: r.tonguePressureKPa ? `${r.tonguePressureKPa}kPa` : '', app: !!r.tonguePressureApplicable},
    {cat: '⑥ 咀嚼機能低下', test: '咀嚼能力検査', ref: '100mg/dL未満', val: r.masticatoryAbilityMgDl ? `${r.masticatoryAbilityMgDl}mg/dL` : '', app: !!r.masticatoryApplicable},
    {cat: '⑦ 嚥下機能低下', test: 'EAT-10', ref: '3点以上', val: r.swallowingEAT10Score ? `${r.swallowingEAT10Score}点` : '', app: !!r.swallowingApplicable},
  ]
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>口腔機能精密検査　記録用紙</Text>
        <Text style={{fontSize: 9, textAlign: 'right', marginBottom: 4}}>{String(c.clinicName || '')}</Text>
        <InfoTable rows={[
          {label: '患者氏名', value: String(c.patientName || '')},
          {label: '生年月日', value: `${String(c.birthDate || '')}（${c.age}歳）${c.gender === 'male' ? '男' : '女'}`},
        ]} />
        <Text style={{fontSize: 9, marginBottom: 8}}>計測日　{String(r.measureDate || '')}</Text>

        <View style={s.tableHeader}>
          <Text style={{...s.tableCell, width: 100}}>下位症状</Text>
          <Text style={{...s.tableCell, flex: 1}}>検査項目</Text>
          <Text style={{...s.tableCell, width: 70}}>該当基準</Text>
          <Text style={{...s.tableCell, width: 80}}>検査値</Text>
          <Text style={{...s.tableCell, width: 30, borderRightWidth: 0, textAlign: 'center'}}>該当</Text>
        </View>
        {tests.map((t, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={{...s.tableCell, width: 100, fontSize: 7}}>{t.cat}</Text>
            <Text style={{...s.tableCell, flex: 1, fontSize: 8}}>{t.test}</Text>
            <Text style={{...s.tableCell, width: 70, fontSize: 7, textAlign: 'center'}}>{t.ref}</Text>
            <Text style={{...s.tableCell, width: 80, fontSize: 8, textAlign: 'center'}}>{t.val}</Text>
            <Text style={{...s.tableCell, width: 30, borderRightWidth: 0, textAlign: 'center', fontSize: 9}}>{t.app ? '☑' : '☐'}</Text>
          </View>
        ))}

        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
          <Text style={{fontSize: 9}}>該当項目が3項目以上で「口腔機能低下症」と診断する。</Text>
          <Text style={{fontSize: 14, fontFamily: 'Nasu-Bold', color: Number(c.applicableCount) >= 3 ? '#dc2626' : '#000'}}>
            該当項目数：{String(c.applicableCount)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// =============================================================================
// 10. 口腔機能管理計画書PDF
// =============================================================================

const KoukuuKanriPdf = ({content}: {content: Record<string, unknown>}) => {
  const c = content as Record<string, unknown>
  const statusItems = (c.oralFunctionStatus || []) as Array<{label: string; testName: string; value: string; reference: string; status: string}>
  const planItems = (c.oralFunctionPlan || []) as Array<{label: string; plan: string}>
  const planLabel = (p: string) => ({noIssue: '問題なし', maintain: '機能維持', improve: '機能向上'})[p] || p
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>管理計画書</Text>
        <Text style={{fontSize: 9, textAlign: 'right', marginBottom: 4}}>{String(c.clinicName || '')}</Text>
        <InfoTable rows={[
          {label: '患者氏名', value: String(c.patientName || '')},
          {label: '年齢・性別', value: `${c.age}歳　${c.gender === 'male' ? '男' : '女'}`},
          {label: '提供日', value: String(c.provideDate || '')},
        ]} />

        <Text style={{...s.sectionHeader, fontSize: 9}}>口腔機能の状態</Text>
        <View style={s.tableHeader}>
          <Text style={{...s.tableCell, width: 20}}>#</Text>
          <Text style={{...s.tableCell, width: 80}}>項目</Text>
          <Text style={{...s.tableCell, flex: 1}}>検査名</Text>
          <Text style={{...s.tableCell, width: 60}}>検査値</Text>
          <Text style={{...s.tableCell, width: 50, borderRightWidth: 0, textAlign: 'center'}}>判定</Text>
        </View>
        {statusItems.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={{...s.tableCell, width: 20, textAlign: 'center'}}>{i + 1}</Text>
            <Text style={{...s.tableCell, width: 80, fontSize: 7}}>{item.label}</Text>
            <Text style={{...s.tableCell, flex: 1, fontSize: 7}}>{item.testName}</Text>
            <Text style={{...s.tableCell, width: 60, fontSize: 8, textAlign: 'center'}}>{item.value}</Text>
            <Text style={{...s.tableCell, width: 50, borderRightWidth: 0, textAlign: 'center', fontSize: 8}}>{item.status === 'decreased' ? '低下' : '正常'}</Text>
          </View>
        ))}

        <Text style={{...s.sectionHeader, fontSize: 9, marginTop: 8}}>口腔機能管理計画</Text>
        <View style={s.tableHeader}>
          <Text style={{...s.tableCell, width: 20}}>#</Text>
          <Text style={{...s.tableCell, flex: 1}}>項目</Text>
          <Text style={{...s.tableCell, width: 80, borderRightWidth: 0, textAlign: 'center'}}>計画</Text>
        </View>
        {planItems.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={{...s.tableCell, width: 20, textAlign: 'center'}}>{i + 1}</Text>
            <Text style={{...s.tableCell, flex: 1, fontSize: 8}}>{item.label}</Text>
            <Text style={{...s.tableCell, width: 80, borderRightWidth: 0, textAlign: 'center', fontSize: 8}}>{planLabel(item.plan)}</Text>
          </View>
        ))}

        <Section title="管理方針・目標・治療予定等" minHeight={40}>
          <Text style={{fontSize: 9}}>{String(c.managementGoal || '')}</Text>
        </Section>

        <Text style={{fontSize: 9, marginTop: 4}}>再評価: 約{String(c.reevaluationMonths || '__')}か月後　治療期間: {String(c.treatmentPeriod || '')}</Text>
      </Page>
    </Document>
  )
}

// =============================================================================
// 11. 口腔衛生管理加算 様式PDF
// =============================================================================

const KoueiKanriPdf = ({content}: {content: Record<string, unknown>}) => {
  const c = content as Record<string, unknown>
  const mc = (c.managementContent || {}) as Record<string, unknown>
  const goals = (mc.goals || {}) as Record<string, boolean>
  const impls = (mc.implementations || {}) as Record<string, boolean>
  const goalLabels: Record<string, string> = {
    dentalDisease: '歯科疾患', oralHygiene: '口腔衛生', oralFunction: '口腔機能',
    dietForm: '食事形態', nutritionStatus: '栄養状態', aspirationPrevention: '誤嚥性肺炎予防',
  }
  const implLabels: Record<string, string> = {
    oralCleaning: '口腔清掃', oralCleaningGuidance: '清掃指導', dentureCleaning: '義歯清掃',
    dentureCleaningGuidance: '義歯清掃指導', oralFunctionGuidance: '口腔機能指導', aspirationPrevention: '誤嚥予防指導',
  }
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={{...s.title, fontSize: 13}}>口腔衛生管理加算　様式（実施計画）</Text>
        <Text style={{fontSize: 9, textAlign: 'right', marginBottom: 8}}>評価日: {String(c.evaluationDate || '')}</Text>

        <InfoTable rows={[
          {label: '氏名', value: `${String(c.patientName || '')}（${String(c.patientNameKana || '')}）`},
          {label: '生年月日・性別', value: `${String(c.birthDate || '')}　${c.gender === 'male' ? '男' : '女'}`},
          {label: '要介護度・病名', value: `${String(c.careLevel || '')}　${String(c.diseaseName || '')}`},
        ]} />

        <Text style={{...s.sectionHeader, fontSize: 9}}>実施目標</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>
            {Object.entries(goalLabels).map(([k, v]) => `${chk(goals[k])} ${v}`).join('　')}
          </Text>
        </View>

        <Text style={{...s.sectionHeader, fontSize: 9}}>実施内容</Text>
        <View style={{borderWidth: 1, borderColor: '#999', borderTopWidth: 0, padding: 6, marginBottom: 6}}>
          <Text style={{fontSize: 8}}>
            {Object.entries(implLabels).map(([k, v]) => `${chk(impls[k])} ${v}`).join('　')}
          </Text>
        </View>

        <Text style={{fontSize: 9}}>実施頻度: {String(mc.frequency || '')}</Text>

        <Text style={{fontSize: 9, textAlign: 'right', marginTop: 12}}>{String(c.clinicName || '')}</Text>
      </Page>
    </Document>
  )
}

// =============================================================================
// テンプレートマップ
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PDF_TEMPLATE_MAP: Record<string, React.FC<{content: any}>> = {
  // 新しい文書テンプレート
  doc_houmon_chiryou: HoumonChiryouPdf,
  doc_kanrikeikaku: KanriKeikakuNewPdf,
  doc_houeishi: HoueishiNewPdf,
  doc_seimitsu_kensa: SeimitsuKensaPdf,
  doc_koukuu_kanri: KoukuuKanriPdf,
  doc_kouei_kanri: KoueiKanriPdf,
  // 旧文書テンプレート（そのまま維持）
  doc_houmon_jisseki: HoumonJissekiPdf,
  doc_shizaikan_bunsho: ShizaikanBunshoPdf,
  doc_zaishikan: ZaishikanPdf,
}
