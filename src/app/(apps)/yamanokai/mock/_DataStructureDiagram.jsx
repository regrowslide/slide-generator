import {useState} from 'react'
import {Card} from './_ui'

export function DataStructureDiagram() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredTable, setHoveredTable] = useState(null)

  // テーブル定義
  const tables = {
    // マスターデータ
    YamanokaiDepartment: {
      category: 'master',
      label: '部署',
      color: '#22c55e',
      fields: ['id', 'code', 'name', 'color', 'bgColor'],
      x: 50,
      y: 50,
    },
    YamanokaiRole: {
      category: 'master',
      label: '役職',
      color: '#3b82f6',
      fields: ['id', 'code', 'name', 'level', 'permissions[]'],
      x: 250,
      y: 50,
    },
    YamanokaiCourse: {
      category: 'master',
      label: '講座',
      color: '#a855f7',
      fields: ['id', 'name', 'description', 'prerequisiteIds[]', 'departmentId'],
      x: 450,
      y: 50,
    },
    YamanokaiEquipment: {
      category: 'master',
      label: '装備',
      color: '#eab308',
      fields: ['id', 'name', 'category', 'totalQuantity'],
      x: 650,
      y: 50,
    },
    YamanokaiInsuranceGrade: {
      category: 'master',
      label: '保険口数',
      color: '#6b7280',
      fields: ['id', 'kuchi', 'name', 'eligibleActivities[]'],
      x: 850,
      y: 50,
    },

    // 会員データ
    YamanokaiMember: {
      category: 'member',
      label: '会員',
      color: '#ef4444',
      fields: ['id', 'name', 'email', 'phone', 'insuranceKuchi', 'departmentId', 'roleId', 'isAdmin', 'isActive'],
      x: 150,
      y: 220,
    },
    YamanokaiMemberRole: {
      category: 'member',
      label: '役職履歴',
      color: '#f97316',
      fields: ['id', 'memberId', 'roleId', 'departmentId', 'startAt', 'endAt'],
      x: 400,
      y: 220,
    },
    YamanokaiCourseCompletion: {
      category: 'member',
      label: '受講履歴',
      color: '#84cc16',
      fields: ['id', 'memberId', 'courseId', 'eventId', 'completedAt'],
      x: 650,
      y: 220,
    },

    // 例会データ
    YamanokaiEvent: {
      category: 'event',
      label: '例会',
      color: '#0ea5e9',
      fields: [
        'id',
        'title',
        'mountainName',
        'departmentId',
        'clId',
        'slId',
        'startAt',
        'endAt',
        'staminaGrade',
        'skillGrade',
        'status',
      ],
      x: 150,
      y: 400,
    },
    YamanokaiEventPlan: {
      category: 'event',
      label: '計画書',
      color: '#06b6d4',
      fields: ['id', 'eventId', 'detailedCourse', 'escapeRoute', 'status', 'approvedBy'],
      x: 400,
      y: 400,
    },
    YamanokaiEventPlanParticipant: {
      category: 'event',
      label: '計画書参加者',
      color: '#14b8a6',
      fields: ['id', 'eventPlanId', 'memberId', 'role', 'name(snapshot)', 'phone(snapshot)'],
      x: 650,
      y: 400,
    },

    // 参加申し込み・記録データ
    YamanokaiApplication: {
      category: 'application',
      label: '参加申し込み',
      color: '#8b5cf6',
      fields: ['id', 'eventId', 'memberId', 'comment', 'approvalStatus', 'rejectionReason', 'approvedBy', 'actualAttended'],
      x: 150,
      y: 570,
    },
    YamanokaiRecord: {
      category: 'record',
      label: '例会記録',
      color: '#ec4899',
      fields: ['id', 'eventId', 'title', 'recordedAt', 'weather', 'authorId', 'status'],
      x: 400,
      y: 570,
    },
    YamanokaiRecordFile: {
      category: 'record',
      label: '記録ファイル',
      color: '#f43f5e',
      fields: ['id', 'recordId', 'fileUrl', 'fileName', 'fileType', 'description'],
      x: 650,
      y: 570,
    },

    // 装備貸出
    YamanokaiEquipmentLoan: {
      category: 'equipment',
      label: '装備貸出',
      color: '#d97706',
      fields: ['id', 'equipmentId', 'memberId', 'eventId', 'quantity', 'loanAt', 'returnedAt', 'status'],
      x: 850,
      y: 400,
    },
  }

  // リレーション定義
  const relations = [
    // 部署との関係
    {from: 'YamanokaiDepartment', to: 'YamanokaiMember', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiDepartment', to: 'YamanokaiEvent', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiDepartment', to: 'YamanokaiCourse', label: '1:N', type: 'one-to-many'},

    // 役職との関係
    {from: 'YamanokaiRole', to: 'YamanokaiMember', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiRole', to: 'YamanokaiMemberRole', label: '1:N', type: 'one-to-many'},

    // 会員との関係
    {from: 'YamanokaiMember', to: 'YamanokaiMemberRole', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiApplication', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiRecord', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiMember', to: 'YamanokaiEventPlanParticipant', label: '1:N', type: 'one-to-many'},

    // 講座との関係
    {from: 'YamanokaiCourse', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},

    // 例会との関係
    {from: 'YamanokaiEvent', to: 'YamanokaiApplication', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiEvent', to: 'YamanokaiEventPlan', label: '1:1', type: 'one-to-one'},
    {from: 'YamanokaiEvent', to: 'YamanokaiRecord', label: '1:1', type: 'one-to-one'},
    {from: 'YamanokaiEvent', to: 'YamanokaiCourseCompletion', label: '1:N', type: 'one-to-many'},
    {from: 'YamanokaiEvent', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},

    // 計画書との関係
    {from: 'YamanokaiEventPlan', to: 'YamanokaiEventPlanParticipant', label: '1:N', type: 'one-to-many'},

    // 記録との関係
    {from: 'YamanokaiRecord', to: 'YamanokaiRecordFile', label: '1:N', type: 'one-to-many'},

    // 装備との関係
    {from: 'YamanokaiEquipment', to: 'YamanokaiEquipmentLoan', label: '1:N', type: 'one-to-many'},
  ]

  // カテゴリ定義
  const categories = [
    {id: 'all', label: 'すべて', color: '#6b7280'},
    {id: 'master', label: 'マスターデータ', color: '#22c55e'},
    {id: 'member', label: '会員データ', color: '#ef4444'},
    {id: 'event', label: '例会データ', color: '#0ea5e9'},
    {id: 'application', label: '申し込みデータ', color: '#8b5cf6'},
    {id: 'record', label: '記録データ', color: '#ec4899'},
    {id: 'equipment', label: '装備データ', color: '#d97706'},
  ]

  // フィルタリング
  const filteredTables =
    selectedCategory === 'all'
      ? Object.entries(tables)
      : Object.entries(tables).filter(([, t]) => t.category === selectedCategory)

  const filteredRelations =
    selectedCategory === 'all'
      ? relations
      : relations.filter(r => {
          const fromTable = tables[r.from]
          const toTable = tables[r.to]
          return fromTable?.category === selectedCategory || toTable?.category === selectedCategory
        })

  // テーブルの幅と高さを計算
  const getTableDimensions = fields => {
    const width = 160
    const height = 30 + fields.length * 18 + 10
    return {width, height}
  }

  // SVGパスを計算（テーブル間の線）
  const calculatePath = (from, to) => {
    const fromTable = tables[from]
    const toTable = tables[to]
    if (!fromTable || !toTable) return ''

    const fromDim = getTableDimensions(fromTable.fields)
    const toDim = getTableDimensions(toTable.fields)

    const fromCenterX = fromTable.x + fromDim.width / 2
    const fromCenterY = fromTable.y + fromDim.height / 2
    const toCenterX = toTable.x + toDim.width / 2
    const toCenterY = toTable.y + toDim.height / 2

    // 接続点を計算
    let fromX, fromY, toX, toY

    // 水平方向の接続
    if (Math.abs(fromCenterX - toCenterX) > Math.abs(fromCenterY - toCenterY)) {
      if (fromCenterX < toCenterX) {
        fromX = fromTable.x + fromDim.width
        toX = toTable.x
      } else {
        fromX = fromTable.x
        toX = toTable.x + toDim.width
      }
      fromY = fromCenterY
      toY = toCenterY
    } else {
      // 垂直方向の接続
      if (fromCenterY < toCenterY) {
        fromY = fromTable.y + fromDim.height
        toY = toTable.y
      } else {
        fromY = fromTable.y
        toY = toTable.y + toDim.height
      }
      fromX = fromCenterX
      toX = toCenterX
    }

    // ベジェ曲線で滑らかに接続
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    return `M ${fromX} ${fromY} Q ${midX} ${fromY}, ${midX} ${midY} Q ${midX} ${toY}, ${toX} ${toY}`
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-bold mb-3">山の会（KCAC）データ構造図</h3>
        <p className="text-sm text-gray-600 mb-4">Prismaスキーマで定義されたテーブル間の関係性を図示しています。</p>

        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategory === cat.id ? {backgroundColor: cat.color} : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ER図本体 */}
      <Card className="p-4 overflow-auto">
        <div className="min-w-[1100px] min-h-[700px] relative">
          <svg width="1100" height="700" className="absolute inset-0">
            {/* リレーション線 */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>

            {filteredRelations.map((rel, idx) => {
              const path = calculatePath(rel.from, rel.to)
              const isHighlighted = hoveredTable === rel.from || hoveredTable === rel.to
              return (
                <g key={idx}>
                  <path
                    d={path}
                    fill="none"
                    stroke={isHighlighted ? '#3b82f6' : '#d1d5db'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    markerEnd={rel.type === 'one-to-many' ? 'url(#arrowhead)' : ''}
                    className="transition-all duration-200"
                  />
                </g>
              )
            })}
          </svg>

          {/* テーブルボックス */}
          {filteredTables.map(([name, table]) => {
            const dim = getTableDimensions(table.fields)
            const isHovered = hoveredTable === name
            const isRelated =
              hoveredTable &&
              relations.some(r => (r.from === hoveredTable && r.to === name) || (r.to === hoveredTable && r.from === name))

            return (
              <div
                key={name}
                className={`absolute bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${
                  isHovered ? 'shadow-lg z-10' : isRelated ? 'shadow-md z-5' : ''
                }`}
                style={{
                  left: table.x,
                  top: table.y,
                  width: dim.width,
                  borderColor: isHovered || isRelated ? table.color : '#e5e7eb',
                }}
                onMouseEnter={() => setHoveredTable(name)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                {/* テーブルヘッダー */}
                <div className="px-2 py-1 text-white text-xs font-bold" style={{backgroundColor: table.color}}>
                  {table.label}
                </div>

                {/* フィールド一覧 */}
                <div className="px-2 py-1">
                  {table.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className={`text-xs py-0.5 ${field === 'id' ? 'font-bold text-gray-800' : 'text-gray-600'} ${
                        field.endsWith('Id') || field.endsWith('Id[]') ? 'text-blue-600' : ''
                      }`}
                    >
                      {field === 'id' ? '🔑 ' : field.endsWith('Id') ? '🔗 ' : ''}
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 凡例 */}
      <Card className="p-4">
        <h4 className="font-bold text-sm mb-3">凡例</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs">🔑</span>
            <span>主キー (id)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">🔗</span>
            <span className="text-blue-600">外部キー (*Id)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="40" height="20">
              <line x1="0" y1="10" x2="30" y2="10" stroke="#9ca3af" strokeWidth="2" />
              <polygon points="30 5, 40 10, 30 15" fill="#9ca3af" />
            </svg>
            <span>1:N 関係</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="40" height="20">
              <line x1="0" y1="10" x2="40" y2="10" stroke="#9ca3af" strokeWidth="2" />
            </svg>
            <span>1:1 関係</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h5 className="font-medium text-sm mb-2">リレーション一覧</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {relations.map((rel, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 p-1 rounded ${
                  hoveredTable === rel.from || hoveredTable === rel.to ? 'bg-blue-50' : ''
                }`}
              >
                <span className="font-medium" style={{color: tables[rel.from]?.color}}>
                  {tables[rel.from]?.label}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-medium" style={{color: tables[rel.to]?.color}}>
                  {tables[rel.to]?.label}
                </span>
                <span className="text-gray-400 ml-1">({rel.label})</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
