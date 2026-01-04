'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import usePdfGenerator from '@cm/hooks/usePdfGenerator'
import { MeisaiData } from '@app/(apps)/tbm/(server-actions)/getMeisaiData'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

interface MeisaiViewerProps {
  meisaiData: MeisaiData
}

// フォントを登録
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

// PDFドキュメントのスタイル
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Nasu-Regular',
    fontSize: 10,
    padding: 30,
    color: '#000',
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Nasu-Bold',
  },
  companyInfo: {
    fontSize: 9,
    marginBottom: 3,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontFamily: 'Nasu-Bold',
  },
  tableCell: {
    padding: 6,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#000',
    display: 'flex',
    alignItems: 'center',
  },
  dateCell: {
    width: '8%',
  },
  routeNameCell: {
    width: '20%',
  },
  serviceNameCell: {
    width: '24%',
  },
  vehicleCell: {
    width: '13%',
  },
  driverCell: {
    width: '13%',
  },
  fareCell: {
    width: '11%',
    textAlign: 'right',
  },
  futaiFeeCell: {
    width: '11%',
    textAlign: 'right',
  },
  // remarkCell: {
  //   width: '12%',
  // },
})

// PDFドキュメントコンポーネント
const MeisaiDocument = ({ meisaiData }: { meisaiData: MeisaiData }) => {
  const yearMonthStr = formatDate(meisaiData.yearMonth, 'YYYY年MM月')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>令和{new Date(meisaiData.yearMonth).getFullYear() - 2018}年{formatDate(meisaiData.yearMonth, 'M')}月度 運行明細</Text>
          <Text style={styles.companyInfo}>西日本運送有限会社</Text>
        </View>

        {/* テーブル */}
        <View style={styles.table}>
          {/* ヘッダー行 */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.dateCell]}>
              <Text>運行日</Text>
            </View>
            <View style={[styles.tableCell, styles.routeNameCell]}>
              <Text>路線名</Text>
            </View>
            <View style={[styles.tableCell, styles.serviceNameCell]}>
              <Text>便名</Text>
            </View>
            <View style={[styles.tableCell, styles.vehicleCell]}>
              <Text>車番</Text>
            </View>
            <View style={[styles.tableCell, styles.driverCell]}>
              <Text>運転手</Text>
            </View>
            <View style={[styles.tableCell, styles.fareCell]}>
              <Text>運賃</Text>
            </View>
            <View style={[styles.tableCell, styles.futaiFeeCell]}>
              <Text>付帯費用</Text>
            </View>
            {/* <View style={[styles.tableCell, styles.remarkCell]}>
              <Text>備考</Text>
            </View> */}
          </View>

          {/* データ行 */}
          {meisaiData.rows.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.dateCell]}>
                <Text>{formatDate(row.date, 'M月D日')}</Text>
              </View>
              <View style={[styles.tableCell, styles.routeNameCell]}>
                <Text>{row.routeName || '-'}</Text>
              </View>
              <View style={[styles.tableCell, styles.serviceNameCell]}>
                <Text>{row.serviceName}</Text>
              </View>
              <View style={[styles.tableCell, styles.vehicleCell]}>
                <Text>{row.vehicleNumber || '-'}</Text>
              </View>
              <View style={[styles.tableCell, styles.driverCell]}>
                <Text>{row.driver || '-'}</Text>
              </View>
              <View style={[styles.tableCell, styles.fareCell]}>
                <Text>¥{row.fare.toLocaleString()}</Text>
              </View>
              <View style={[styles.tableCell, styles.futaiFeeCell]}>
                <Text>¥{row.futaiFee.toLocaleString()}</Text>
              </View>
              {/* <View style={[styles.tableCell, styles.remarkCell]}>
                <Text>

                </Text>
              </View> */}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export default function MeisaiViewer({ meisaiData }: MeisaiViewerProps) {
  const yearMonthStr = formatDate(meisaiData.yearMonth, 'YYYY年MM月')
  const fileName = `運行明細_${yearMonthStr}.pdf`

  const { DownLoadLink, PdfDisplay } = usePdfGenerator({
    Document: <MeisaiDocument meisaiData={meisaiData} />,
    fileName,
  })

  return (
    <div className="space-y-4">
      {/* 操作ボタン */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <DownLoadLink />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>対象期間:</span>
          <span className="font-semibold">{yearMonthStr}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>顧客名:</span>
          <span className="font-semibold">{meisaiData.customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>件数:</span>
          <span className="font-semibold">{meisaiData.rows.length}件</span>
        </div>
      </div>

      {/* PDFプレビュー */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <PdfDisplay />
      </div>
    </div>
  )
}

