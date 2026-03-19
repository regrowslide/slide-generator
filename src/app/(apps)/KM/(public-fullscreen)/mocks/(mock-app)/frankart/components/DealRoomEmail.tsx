'use client'

import React, { useState } from 'react'
import { Mail, Copy, Check, ChevronDown } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'

type Props = { dealId: string }

type EmailScene = 'entry' | 'thanks' | 'followup' | 'estimate' | 'lost-followup' | 'advisor-report'

const SCENES: { id: EmailScene; label: string; description: string }[] = [
  { id: 'entry', label: 'エントリー応募', description: 'マッチングサービスへの案件応募メール' },
  { id: 'thanks', label: '商談後お礼', description: '商談翌営業日までに送信するお礼メール' },
  { id: 'followup', label: 'フォローアップ', description: '回答がない場合のリマインドメール' },
  { id: 'estimate', label: '見積送付', description: '見積書を添付して送信するメール' },
  { id: 'lost-followup', label: '失注/保留後フォロー', description: '数ヶ月後の状況確認メール' },
  { id: 'advisor-report', label: '顧問への報告', description: '営業顧問への案件結果報告メール' },
]

const DealRoomEmail: React.FC<Props> = ({ dealId }) => {
  const { deals, companies, staff } = useFrankartMockData()
  const [selectedScene, setSelectedScene] = useState<EmailScene | null>(null)
  const [emailText, setEmailText] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [copied, setCopied] = useState(false)

  const deal = deals.find((d) => d.id === dealId)
  if (!deal) return null

  // 取引先担当者名を解決
  const contactNames = (() => {
    const company = companies.find(c => c.id === deal.companyId)
    if (!company) return ''
    return deal.contactIds
      .map(id => company.contacts.find(ct => ct.id === id)?.name)
      .filter(Boolean)
      .join('、')
  })()

  // 自社担当者名を解決
  const assigneeNames = deal.assigneeIds
    .map(id => staff.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join('、')

  // メール署名用の最初の担当者名
  const primaryAssigneeName = (() => {
    const first = deal.assigneeIds[0]
    return first ? staff.find(s => s.id === first)?.name || '' : ''
  })()

  const generateEmail = (scene: EmailScene) => {
    setSelectedScene(scene)
    setCopied(false)

    let subject = ''
    let body = ''

    switch (scene) {
      case 'entry':
        subject = `【エントリー】${deal.title}の件`
        body = `ご担当者様

お世話になっております。
株式会社フランクアートの${primaryAssigneeName}でございます。

${deal.matchingService ? `${deal.matchingService}にて掲載されております` : '貴サービスにて掲載されております'}「${deal.title}」の案件につきまして、エントリーさせていただきたくご連絡いたしました。

■ 弊社概要
・社名: 株式会社フランクアート
・事業内容: システム開発（上流設計〜開発・運用）
・得意領域: Web系システム開発、業務改善システム

■ 本案件への対応について
${deal.description}

上記案件につきまして、弊社にて対応可能と考えております。
つきましては、詳細なヒアリングのお時間をいただけますと幸いです。

下記日程にてご都合のよい日時がございましたら、ご連絡いただけますでしょうか。

・候補日1: （日程を記入）
・候補日2: （日程を記入）
・候補日3: （日程を記入）

ご検討のほど、何卒よろしくお願い申し上げます。

━━━━━━━━━━━━━
株式会社フランクアート
${primaryAssigneeName}
TEL: 03-XXXX-XXXX
Email: ${primaryAssigneeName.toLowerCase()}@frankart.co.jp
━━━━━━━━━━━━━`
        break

      case 'thanks':
        subject = `【お礼】本日のお打ち合わせについて（${deal.title}）`
        body = `${deal.companyName}
${contactNames} 様

お世話になっております。
株式会社フランクアートの${primaryAssigneeName}でございます。

本日はお忙しい中、お時間をいただき誠にありがとうございました。

${deal.title}につきまして、貴社の課題やご要望を詳しくお聞かせいただき、大変参考になりました。

本日のお打ち合わせ内容を踏まえ、弊社にて提案内容を整理の上、改めてご連絡させていただきます。

ご不明な点やご質問等ございましたら、お気軽にお申し付けください。

引き続き何卒よろしくお願い申し上げます。

━━━━━━━━━━━━━
株式会社フランクアート
${primaryAssigneeName}
TEL: 03-XXXX-XXXX
Email: ${primaryAssigneeName.toLowerCase()}@frankart.co.jp
━━━━━━━━━━━━━`
        break

      case 'followup':
        subject = `【ご確認】${deal.title}の件について`
        body = `${deal.companyName}
${contactNames} 様

お世話になっております。
株式会社フランクアートの${primaryAssigneeName}でございます。

先日は${deal.title}の件でお打ち合わせいただき、ありがとうございました。

その後、ご検討状況はいかがでしょうか。

ご質問やご不明な点、追加でご確認されたい事項等ございましたら、お気軽にお申し付けください。
必要に応じて、追加のお打ち合わせや資料のご用意も可能でございます。

ご多忙のところ恐縮ですが、ご検討状況をお聞かせいただけますと幸いです。

何卒よろしくお願い申し上げます。

━━━━━━━━━━━━━
株式会社フランクアート
${primaryAssigneeName}
TEL: 03-XXXX-XXXX
Email: ${primaryAssigneeName.toLowerCase()}@frankart.co.jp
━━━━━━━━━━━━━`
        break

      case 'estimate':
        subject = `【見積書送付】${deal.title}のお見積りについて`
        body = `${deal.companyName}
${contactNames} 様

お世話になっております。
株式会社フランクアートの${primaryAssigneeName}でございます。

先日お打ち合わせいただきました${deal.title}につきまして、お見積書を作成いたしましたので、添付にてお送りいたします。

■ お見積り概要
・件名: ${deal.title}
・金額: ${deal.amount.toLocaleString()}円（税別）
・有効期限: 発行日より30日間

お見積り内容につきましてご不明な点やご質問がございましたら、お気軽にお問い合わせください。

ご検討のほど、何卒よろしくお願い申し上げます。

━━━━━━━━━━━━━
株式会社フランクアート
${primaryAssigneeName}
TEL: 03-XXXX-XXXX
Email: ${primaryAssigneeName.toLowerCase()}@frankart.co.jp
━━━━━━━━━━━━━`
        break

      case 'lost-followup':
        subject = `【ご挨拶】その後のご状況について`
        body = `${deal.companyName}
${contactNames} 様

ご無沙汰しております。
株式会社フランクアートの${primaryAssigneeName}でございます。

以前ご相談いただいておりました${deal.title}の件につきまして、その後のご状況はいかがでしょうか。

弊社でも引き続き新しい技術やソリューションの知見を蓄積しておりますので、改めてお役に立てることがあるかもしれません。

もしお時間が許すようでしたら、近況のご共有も兼ねて、お打ち合わせのお時間をいただけますと幸いです。

貴社のご発展を心よりお祈りしております。
今後とも何卒よろしくお願い申し上げます。

━━━━━━━━━━━━━
株式会社フランクアート
${primaryAssigneeName}
TEL: 03-XXXX-XXXX
Email: ${primaryAssigneeName.toLowerCase()}@frankart.co.jp
━━━━━━━━━━━━━`
        break

      case 'advisor-report':
        subject = `【案件報告】${deal.companyName}様 ${deal.title}の件`
        body = `${deal.referralAdvisor || '顧問'} 先生

いつもお世話になっております。
株式会社フランクアートの${primaryAssigneeName}でございます。

${deal.referralAdvisor ? `先生にご紹介いただきました` : ''}${deal.companyName}様の${deal.title}の件につきまして、進捗をご報告申し上げます。

■ 案件概要
・企業名: ${deal.companyName}
・案件名: ${deal.title}
・先方担当: ${contactNames} 様

■ 現在の状況
（ここに進捗を記載）

■ 今後の予定
・次回フォロー予定: ${deal.nextFollowUp || '未定'}

引き続きご支援のほど、何卒よろしくお願い申し上げます。

━━━━━━━━━━━━━
株式会社フランクアート
${primaryAssigneeName}
TEL: 03-XXXX-XXXX
Email: ${primaryAssigneeName.toLowerCase()}@frankart.co.jp
━━━━━━━━━━━━━`
        break
    }

    setEmailSubject(subject)
    setEmailText(body)
  }

  const handleCopy = async () => {
    const fullText = `件名: ${emailSubject}\n\n${emailText}`
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* シーン選択 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-600" />
          メールシーンを選択
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => generateEmail(scene.id)}
              className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                selectedScene === scene.id
                  ? 'border-slate-600 bg-slate-50 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <p className={`text-sm font-medium ${selectedScene === scene.id ? 'text-slate-800' : 'text-stone-700'}`}>
                {scene.label}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">{scene.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* メールプレビュー */}
      {selectedScene && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-700">
              {SCENES.find((s) => s.id === selectedScene)?.label}メール
            </h3>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>

          {/* 件名 */}
          <div className="mb-3">
            <label className="text-xs text-stone-500 block mb-1">件名</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 font-medium"
            />
          </div>

          {/* 本文 */}
          <div>
            <label className="text-xs text-stone-500 block mb-1">本文</label>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={18}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 resize-none leading-relaxed font-mono"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DealRoomEmail
