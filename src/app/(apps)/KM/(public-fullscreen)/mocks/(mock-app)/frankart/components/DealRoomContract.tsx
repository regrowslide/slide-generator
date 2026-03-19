'use client'

import React, { useState } from 'react'
import { FileText, Shield, Printer } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import { CONTRACT_STATUS_CONFIG, CONTRACT_STATUSES } from './constants'
import type { ContractStatus } from './types'

type Props = { dealId: string }
type SubTab = 'contract' | 'nda'

const DealRoomContract: React.FC<Props> = ({ dealId }) => {
  const { deals, updateDeal, companies } = useFrankartMockData()
  const [subTab, setSubTab] = useState<SubTab>('contract')
  const [showContractPreview, setShowContractPreview] = useState(false)
  const [showNdaPreview, setShowNdaPreview] = useState(false)

  const deal = deals.find((d) => d.id === dealId)
  if (!deal) return null

  // 取引先担当者名を解決
  const getContactNames = () => {
    const company = companies.find(c => c.id === deal.companyId)
    if (!company) return []
    return deal.contactIds
      .map(id => company.contacts.find(ct => ct.id === id)?.name)
      .filter(Boolean) as string[]
  }

  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

  const updateStatus = (field: 'contractStatus' | 'ndaStatus', status: ContractStatus) => {
    updateDeal(dealId, { [field]: status, updatedAt: today })
  }

  // ステータスバッジ行
  const StatusRow = ({ field, currentStatus }: { field: 'contractStatus' | 'ndaStatus'; currentStatus: ContractStatus }) => {
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-stone-500">ステータス:</span>
        {CONTRACT_STATUSES.map((s) => {
          const c = CONTRACT_STATUS_CONFIG[s]
          return (
            <button
              key={s}
              onClick={() => updateStatus(field, s)}
              className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                currentStatus === s
                  ? `${c.bg} ${c.color} border-current font-medium`
                  : 'border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* サブタブ */}
      <div className="flex gap-1">
        <button
          onClick={() => setSubTab('contract')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'contract'
              ? 'bg-slate-700 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          業務委託契約書
        </button>
        <button
          onClick={() => setSubTab('nda')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'nda'
              ? 'bg-slate-700 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          秘密保持契約書
        </button>
      </div>

      {/* 契約書タブ */}
      {subTab === 'contract' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <StatusRow field="contractStatus" currentStatus={deal.contractStatus} />

          {!showContractPreview ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-500 mb-4">案件情報から業務委託契約書を自動生成します</p>
              <button
                onClick={() => setShowContractPreview(true)}
                className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
              >
                テンプレートから作成
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  印刷
                </button>
              </div>
              {/* 帳票プレビュー */}
              <div className="print-target border border-stone-300 rounded-lg p-8 bg-white max-w-2xl mx-auto shadow-inner" style={{ fontFamily: 'serif' }}>
                <h2 className="text-xl font-bold text-center mb-8 tracking-widest">業 務 委 託 契 約 書</h2>
                <p className="text-sm leading-relaxed mb-6">
                  株式会社フランクアート（以下「甲」という）と{deal.companyName}（以下「乙」という）は、以下の条件にて業務委託契約を締結する。
                </p>

                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h3 className="font-bold mb-1">第1条（委託業務の内容）</h3>
                    <p className="pl-4">甲は、乙に対し以下の業務を委託し、乙はこれを受託する。</p>
                    <p className="pl-8 mt-1">業務名称: {deal.title}</p>
                    <p className="pl-8">業務概要: {deal.description}</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第2条（契約期間）</h3>
                    <p className="pl-4">本契約の有効期間は、{todayFormatted}から{deal.contractRenewalDate ? new Date(deal.contractRenewalDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : '別途定める日'}までとする。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第3条（委託料）</h3>
                    <p className="pl-4">甲は乙に対し、本業務の対価として金{deal.amount.toLocaleString()}円（税別）を支払うものとする。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第4条（支払条件）</h3>
                    <p className="pl-4">甲は、乙の請求に基づき、請求書受領月の翌月末日までに乙の指定する銀行口座に振り込む方法により支払う。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第5条（秘密保持）</h3>
                    <p className="pl-4">甲および乙は、本契約に関連して知り得た相手方の秘密情報を第三者に開示または漏洩してはならない。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第6条（知的財産権）</h3>
                    <p className="pl-4">本業務により生じた成果物に関する知的財産権は、委託料の完済をもって甲に帰属するものとする。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第7条（解除）</h3>
                    <p className="pl-4">甲または乙は、相手方が本契約に違反した場合、書面による催告の上、本契約を解除することができる。</p>
                  </div>
                </div>

                <div className="mt-10 text-sm">
                  <p className="text-center mb-8">上記契約の成立を証するため、本書2通を作成し、甲乙記名押印の上、各1通を保有する。</p>
                  <p className="text-right mb-6">{todayFormatted}</p>
                  <div className="grid grid-cols-2 gap-8 mt-6">
                    <div>
                      <p className="font-bold mb-2">【甲】</p>
                      <p>株式会社フランクアート</p>
                      <p>代表取締役 井上</p>
                      <div className="mt-4 border-b border-stone-300 w-32">
                        <span className="text-xs text-stone-400">印</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold mb-2">【乙】</p>
                      <p>{deal.companyName}</p>
                      <p>{getContactNames().join('、') || '—'}</p>
                      <div className="mt-4 border-b border-stone-300 w-32">
                        <span className="text-xs text-stone-400">印</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NDAタブ */}
      {subTab === 'nda' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <StatusRow field="ndaStatus" currentStatus={deal.ndaStatus} />

          {!showNdaPreview ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-500 mb-4">案件情報から秘密保持契約書を自動生成します</p>
              <button
                onClick={() => setShowNdaPreview(true)}
                className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
              >
                テンプレートから作成
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  印刷
                </button>
              </div>
              {/* NDAプレビュー */}
              <div className="print-target border border-stone-300 rounded-lg p-8 bg-white max-w-2xl mx-auto shadow-inner" style={{ fontFamily: 'serif' }}>
                <h2 className="text-xl font-bold text-center mb-8 tracking-widest">秘 密 保 持 契 約 書</h2>
                <p className="text-sm leading-relaxed mb-6">
                  株式会社フランクアート（以下「甲」という）と{deal.companyName}（以下「乙」という）は、{deal.title}に関連する取引の検討にあたり、以下のとおり秘密保持契約を締結する。
                </p>

                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h3 className="font-bold mb-1">第1条（秘密情報の定義）</h3>
                    <p className="pl-4">本契約における秘密情報とは、開示当事者が受領当事者に対し、書面、電磁的記録その他の媒体により開示する技術上または営業上の一切の情報をいう。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第2条（秘密保持義務）</h3>
                    <p className="pl-4">受領当事者は、秘密情報を善良な管理者の注意をもって管理し、開示当事者の事前の書面による承諾なく、第三者に開示または漏洩してはならない。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第3条（目的外使用の禁止）</h3>
                    <p className="pl-4">受領当事者は、秘密情報を本取引の検討・遂行の目的以外に使用してはならない。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第4条（例外）</h3>
                    <p className="pl-4">次の各号に該当する情報は、秘密情報から除外する。</p>
                    <p className="pl-8">(1) 開示の時点で既に公知であった情報</p>
                    <p className="pl-8">(2) 開示後、受領当事者の責めによらず公知となった情報</p>
                    <p className="pl-8">(3) 開示の時点で受領当事者が既に保有していた情報</p>
                    <p className="pl-8">(4) 正当な権限を有する第三者から秘密保持義務を負うことなく取得した情報</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第5条（有効期間）</h3>
                    <p className="pl-4">本契約の有効期間は、本契約締結日から2年間とする。ただし、秘密保持義務は本契約終了後もなお3年間存続するものとする。</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-1">第6条（返還・廃棄）</h3>
                    <p className="pl-4">受領当事者は、開示当事者の要求があった場合、秘密情報を含む一切の資料を速やかに返還または廃棄するものとする。</p>
                  </div>
                </div>

                <div className="mt-10 text-sm">
                  <p className="text-center mb-8">上記契約の成立を証するため、本書2通を作成し、甲乙記名押印の上、各1通を保有する。</p>
                  <p className="text-right mb-6">{todayFormatted}</p>
                  <div className="grid grid-cols-2 gap-8 mt-6">
                    <div>
                      <p className="font-bold mb-2">【甲】</p>
                      <p>株式会社フランクアート</p>
                      <p>代表取締役 井上</p>
                      <div className="mt-4 border-b border-stone-300 w-32">
                        <span className="text-xs text-stone-400">印</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold mb-2">【乙】</p>
                      <p>{deal.companyName}</p>
                      <p>{getContactNames().join('、') || '—'}</p>
                      <div className="mt-4 border-b border-stone-300 w-32">
                        <span className="text-xs text-stone-400">印</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DealRoomContract
