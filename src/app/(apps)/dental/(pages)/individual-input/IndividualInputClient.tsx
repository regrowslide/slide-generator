

// 'use client'

// import {useState, useMemo} from 'react'
// import {useRouter} from 'next/navigation'
// import {HREF} from '@cm/lib/methods/urls'
// import useGlobal from '@cm/hooks/globalHooks/useGlobal'
// import {createDentalVisitPlan} from '@app/(apps)/dental/_actions/visit-plan-actions'
// import {createDentalExamination} from '@app/(apps)/dental/_actions/examination-actions'
// import {STAFF_ROLES, EXAMINATION_STATUS} from '@app/(apps)/dental/lib/constants'
// import {getPatientName, formatDate} from '@app/(apps)/dental/lib/helpers'
// import type {Facility, Patient, Staff} from '@app/(apps)/dental/lib/types'

// type Props = {
//   facilities: Facility[]
//   patients: Patient[]
//   staff: Staff[]
//   clinicId: number
// }

// const IndividualInputClient = ({facilities, patients, staff, clinicId}: Props) => {
//   const router = useRouter()
//   const {query} = useGlobal()
//   const [selectedFacilityId, setSelectedFacilityId] = useState('')
//   const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
//   const [selectedDoctorId, setSelectedDoctorId] = useState('')
//   const [selectedHygienistId, setSelectedHygienistId] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const facilityPatients = useMemo(() => {
//     if (!selectedFacilityId) return []
//     return patients.filter(p => p.facilityId === Number(selectedFacilityId))
//   }, [patients, selectedFacilityId])

//   // 建物×フロアでグルーピング
//   const groupedPatients = useMemo(() => {
//     const groups: Record<string, Patient[]> = {}
//     facilityPatients.forEach(p => {
//       const key = `${p.building} ${p.floor}`
//       if (!groups[key]) groups[key] = []
//       groups[key].push(p)
//     })
//     return groups
//   }, [facilityPatients])

//   const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR)
//   const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST)

//   const handleStart = async () => {
//     if (!selectedPatientId || !selectedFacilityId || isSubmitting) return
//     setIsSubmitting(true)

//     // アドホック訪問計画を作成
//     const visitPlan = await createDentalVisitPlan({
//       dentalClinicId: clinicId,
//       dentalFacilityId: Number(selectedFacilityId),
//       visitDate: formatDate(new Date()),
//       status: 'in_progress',
//     })

//     // 診察を作成
//     const exam = await createDentalExamination({
//       dentalVisitPlanId: visitPlan.id,
//       dentalPatientId: selectedPatientId,
//       doctorId: selectedDoctorId ? Number(selectedDoctorId) : null,
//       hygienistId: selectedHygienistId ? Number(selectedHygienistId) : null,
//       status: EXAMINATION_STATUS.WAITING,
//       sortOrder: 1,
//     })

//     const mode = selectedDoctorId ? 'doctor' : 'dh'
//     router.push(HREF(`/dental/consultation`, {examinationId: exam.id, mode}, query))
//   }

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">個別入力</h2>
//       <p className="text-sm text-gray-500 mb-4">スケジュールを経由せず、患者を直接選択して診療入力を開始します。</p>

//       {/* 施設選択 */}
//       <div className="bg-white rounded-lg border border-gray-200 mb-4 p-4">
//         <label className="block text-sm font-medium text-gray-700 mb-1">施設選択</label>
//         <select
//           value={selectedFacilityId}
//           onChange={e => { setSelectedFacilityId(e.target.value); setSelectedPatientId(null) }}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//         >
//           <option value="">施設を選択してください</option>
//           {facilities.map(f => (
//             <option key={f.id} value={f.id}>{f.name}</option>
//           ))}
//         </select>
//       </div>

//       {/* 患者選択 */}
//       {selectedFacilityId && (
//         <div className="bg-white rounded-lg border border-gray-200 mb-4">
//           <div className="p-3 border-b border-gray-200 bg-gray-50">
//             <span className="text-sm font-medium text-gray-700">患者を選択</span>
//           </div>
//           {Object.entries(groupedPatients).length === 0 ? (
//             <div className="p-8 text-center text-sm text-gray-500">この施設に登録された患者はいません</div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {Object.entries(groupedPatients).map(([group, pts]) => (
//                 <div key={group}>
//                   <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">{group}</div>
//                   {pts.map(p => (
//                     <button
//                       key={p.id}
//                       onClick={() => setSelectedPatientId(p.id)}
//                       className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
//                         selectedPatientId === p.id ? 'bg-slate-100 border-l-4 border-slate-600' : 'hover:bg-gray-50'
//                       }`}
//                     >
//                       <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
//                         selectedPatientId === p.id ? 'border-slate-600 bg-slate-600 text-white' : 'border-gray-300'
//                       }`}>
//                         {selectedPatientId === p.id && 'v'}
//                       </span>
//                       <span className="text-sm font-medium text-gray-900">{getPatientName(p)}</span>
//                       <span className="text-xs text-gray-500">({p.room})</span>
//                     </button>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* 担当選択・開始 */}
//       {selectedPatientId && (
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">担当Dr</label>
//               <select
//                 value={selectedDoctorId}
//                 onChange={e => setSelectedDoctorId(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//               >
//                 <option value="">選択なし</option>
//                 {doctors.map(d => (
//                   <option key={d.id} value={d.id}>{d.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">担当DH</label>
//               <select
//                 value={selectedHygienistId}
//                 onChange={e => setSelectedHygienistId(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//               >
//                 <option value="">選択なし</option>
//                 {hygienists.map(h => (
//                   <option key={h.id} value={h.id}>{h.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <button
//             onClick={handleStart}
//             disabled={isSubmitting}
//             className="w-full px-4 py-3 bg-slate-700 text-white rounded-md text-sm hover:bg-slate-800 disabled:opacity-50"
//           >
//             {isSubmitting ? '作成中...' : '診察を開始する'}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default IndividualInputClient
