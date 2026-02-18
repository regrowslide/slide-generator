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
// テンプレートマップ
// =============================================================================

export const PDF_TEMPLATE_MAP: Record<string, React.FC<{content: PdfDocumentContent}>> = {
  doc_kanrikeikaku: KanriKeikakuPdf,
  doc_houeishi: HoueishiPdf,
  doc_houmon_jisseki: HoumonJissekiPdf,
  doc_shizaikan_bunsho: ShizaikanBunshoPdf,
  doc_zaishikan: ZaishikanPdf,
}
