'use client'

import React, { useEffect } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { useHakobunAnalysis } from '../hooks/useHakobunAnalysis'
import { VoiceAnalyzer } from '../components/VoiceAnalyzer'
import { AnalysisResultView } from '../components/AnalysisResult'
import { FeedbackEditor } from '../components/FeedbackEditor'
import { ProcessLog } from '../components/ProcessLog'
import { BarChart3, RefreshCw, Database, BookOpen, Layers } from 'lucide-react'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import { redirect } from 'next/dist/server/api-utils'
import Redirector from '@cm/components/utils/Redirector'

export default function HakobunAnalysisDashboard() {

  return <Redirector redirectPath="/hakobun/batch" />
  // const {
  //   state,
  //   clients,
  //   editedExtracts,
  //   fetchClients,
  //   selectClient,
  //   setRawText,
  //   analyze,
  //   updateExtractEdit,
  //   submitFeedback,
  //   reset,
  //   clearLogs,
  // } = useHakobunAnalysis()
  // const { getHref } = useMyNavigation()

  // useEffect(() => {
  //   fetchClients()
  // }, [fetchClients])

  // const [activeTab, setActiveTab] = React.useState<'analyze' | 'feedback'>('analyze')

  // return (
  //   <div className="min-h-screen bg-gray-50 p-6">
  //     <C_Stack className="max-w-7xl mx-auto gap-6">
  //       {/* 統計カード */}
  //       <R_Stack className="gap-4 flex-wrap">
  //         <div className="flex-1 min-w-[200px] bg-white rounded-lg shadow-sm p-4">
  //           <R_Stack className="items-center gap-3">
  //             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
  //               <Database className="w-5 h-5 text-blue-600" />
  //             </div>
  //             <div>
  //               <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
  //               <p className="text-sm text-gray-500">登録クライアント</p>
  //             </div>
  //           </R_Stack>
  //         </div>
  //         <div className="flex-1 min-w-[200px] bg-white rounded-lg shadow-sm p-4">
  //           <R_Stack className="items-center gap-3">
  //             <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
  //               <Layers className="w-5 h-5 text-green-600" />
  //             </div>
  //             <div>
  //               <p className="text-2xl font-bold text-gray-900">{state.categories.length}</p>
  //               <p className="text-sm text-gray-500">カテゴリ数</p>
  //             </div>
  //           </R_Stack>
  //         </div>
  //         <div className="flex-1 min-w-[200px] bg-white rounded-lg shadow-sm p-4">
  //           <R_Stack className="items-center gap-3">
  //             <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
  //               <BookOpen className="w-5 h-5 text-purple-600" />
  //             </div>
  //             <div>
  //               <p className="text-2xl font-bold text-gray-900">{state.rules.length}</p>
  //               <p className="text-sm text-gray-500">ルール数</p>
  //             </div>
  //           </R_Stack>
  //         </div>
  //         <div className="flex-1 min-w-[200px] bg-white rounded-lg shadow-sm p-4">
  //           <R_Stack className="items-center gap-3">
  //             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
  //               <BarChart3 className="w-5 h-5 text-orange-600" />
  //             </div>
  //             <div>
  //               <p className="text-2xl font-bold text-gray-900">{state.corrections.length}</p>
  //               <p className="text-sm text-gray-500">修正事例</p>
  //             </div>
  //           </R_Stack>
  //         </div>
  //       </R_Stack>

  //       {/* メインコンテンツ */}
  //       <div className="bg-white rounded-lg shadow-sm">
  //         {/* タブ */}
  //         <div className="border-b border-gray-200">
  //           <R_Stack className="gap-0">
  //             <button
  //               onClick={() => setActiveTab('analyze')}
  //               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analyze'
  //                 ? 'border-blue-600 text-blue-600'
  //                 : 'border-transparent text-gray-500 hover:text-gray-700'
  //                 }`}
  //             >
  //               テキスト分析
  //             </button>
  //             <button
  //               onClick={() => setActiveTab('feedback')}
  //               disabled={!state.analysisResult}
  //               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'feedback'
  //                 ? 'border-blue-600 text-blue-600'
  //                 : 'border-transparent text-gray-500 hover:text-gray-700'
  //                 } ${!state.analysisResult ? 'opacity-50 cursor-not-allowed' : ''}`}
  //             >
  //               フィードバック編集
  //             </button>
  //             {state.analysisResult && (
  //               <div className="ml-auto px-4 py-4">
  //                 <button
  //                   onClick={reset}
  //                   className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
  //                 >
  //                   <RefreshCw className="w-4 h-4" />
  //                   リセット
  //                 </button>
  //               </div>
  //             )}
  //           </R_Stack>
  //         </div>

  //         {/* タブコンテンツ */}
  //         <div className="p-6">
  //           {activeTab === 'analyze' && (
  //             <C_Stack className="gap-6">
  //               {/* 入力フォーム */}
  //               <VoiceAnalyzer
  //                 clients={clients}
  //                 selectedClientId={state.selectedClientId}
  //                 rawText={state.rawText}
  //                 isAnalyzing={state.status === 'analyzing'}
  //                 onTextChange={setRawText}
  //                 onAnalyze={analyze}
  //               />

  //               {/* 処理ログ */}
  //               {state.logs.length > 0 && <ProcessLog logs={state.logs} onClear={clearLogs} />}

  //               {/* 分析結果 */}
  //               {state.analysisResult && (
  //                 <div className="mt-4">
  //                   <h2 className="text-lg font-bold text-gray-800 mb-4">分析結果</h2>
  //                   <AnalysisResultView result={state.analysisResult} />
  //                 </div>
  //               )}
  //             </C_Stack>
  //           )}

  //           {activeTab === 'feedback' && state.analysisResult && (
  //             <FeedbackEditor
  //               result={state.analysisResult}
  //               categories={state.categories}
  //               editedExtracts={editedExtracts}
  //               onUpdateExtract={updateExtractEdit}
  //               onSubmitFeedback={submitFeedback}
  //             />
  //           )}
  //         </div>
  //       </div>
  //     </C_Stack>
  //   </div>
  // )
}
