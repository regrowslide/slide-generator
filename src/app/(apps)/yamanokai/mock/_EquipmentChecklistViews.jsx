import {useState, useMemo} from 'react'
import {CHECKLIST_CATEGORIES, REQUIREMENT_LEVELS} from './_constants'
import {Badge, Button, Modal} from './_ui'

// =============================================================================
// 管理者向けコンポーネント
// =============================================================================

/**
 * 装備表品目マスタ管理（統合ページ）
 */
export const AdminEquipmentChecklistManagement = ({checklistItems, onCreate, onUpdate, onDelete}) => {
  const [activeTab, setActiveTab] = useState('list')
  const [editingItem, setEditingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = item => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const handleSave = data => {
    if (editingItem) {
      onUpdate(editingItem.id, data)
    }
    handleCloseModal()
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">装備表品目マスタ管理</h1>

      {/* タブナビゲーション */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          品目一覧
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'new' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          新規登録
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'list' && (
        <AdminEquipmentChecklistList checklistItems={checklistItems} onEdit={handleEdit} onDelete={onDelete} />
      )}
      {activeTab === 'new' && <AdminEquipmentChecklistForm onSubmit={onCreate} />}

      {/* 編集モーダル */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="品目編集">
          <AdminEquipmentChecklistForm initialData={editingItem} onSubmit={handleSave} />
        </Modal>
      )}
    </div>
  )
}

/**
 * 装備表品目一覧テーブル
 */
const AdminEquipmentChecklistList = ({checklistItems, onEdit, onDelete}) => {
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return checklistItems
    return checklistItems.filter(item => item.category === categoryFilter)
  }, [checklistItems, categoryFilter])

  return (
    <div>
      {/* カテゴリフィルター */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`rounded px-3 py-1 text-sm ${
            categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          すべて
        </button>
        {Object.values(CHECKLIST_CATEGORIES).map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`rounded px-3 py-1 text-sm ${
              categoryFilter === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* 品目テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">品名</th>
              <th className="border border-gray-300 px-4 py-2 text-left">カテゴリ</th>
              <th className="border border-gray-300 px-4 py-2 text-left">デフォルト必要度</th>
              <th className="border border-gray-300 px-4 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => {
              const category = CHECKLIST_CATEGORIES[item.category]
              const reqLevel = REQUIREMENT_LEVELS[item.defaultRequirementLevel]
              return (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{item.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {category.icon} {category.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <Badge color={reqLevel.color} bgColor={reqLevel.bgColor}>
                      {reqLevel.label || reqLevel.name}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => onEdit(item)}
                      className="mr-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`「${item.name}」を削除しますか？`)) onDelete(item.id)
                      }}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <div className="mt-4 rounded bg-gray-100 p-8 text-center text-gray-600">
          該当する品目がありません
        </div>
      )}
    </div>
  )
}

/**
 * 装備表品目フォーム（新規登録・編集）
 */
const AdminEquipmentChecklistForm = ({initialData, onSubmit}) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      category: 'personal',
      defaultRequirementLevel: 'required',
      sortOrder: 0,
    },
  )

  const handleChange = e => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('品名を入力してください')
      return
    }
    onSubmit(formData)
    // 新規登録の場合のみフォームをリセット
    if (!initialData) {
      setFormData({name: '', category: 'personal', defaultRequirementLevel: 'required', sortOrder: 0})
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">品名 *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">カテゴリ *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          {Object.values(CHECKLIST_CATEGORIES).map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">デフォルト必要度 *</label>
        <select
          name="defaultRequirementLevel"
          value={formData.defaultRequirementLevel}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          {Object.values(REQUIREMENT_LEVELS).map(level => (
            <option key={level.id} value={level.id}>
              {level.label} {level.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ソート順</label>
        <input
          type="number"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        {initialData ? '更新' : '登録'}
      </button>
    </form>
  )
}

/**
 * 例会装備表編集（管理者用）
 */
export const EventEquipmentChecklistEditor = ({eventId, checklistItems, eventEquipmentItems, onSave}) => {
  // 選択状態と必要度レベルを管理
  const [selectedItems, setSelectedItems] = useState(() => {
    const map = new Map()
    eventEquipmentItems.forEach(item => {
      map.set(item.checklistItemId, item.requirementLevel)
    })
    return map
  })

  const handleToggle = itemId => {
    setSelectedItems(prev => {
      const newMap = new Map(prev)
      if (newMap.has(itemId)) {
        newMap.delete(itemId)
      } else {
        const item = checklistItems.find(i => i.id === itemId)
        newMap.set(itemId, item?.defaultRequirementLevel || 'required')
      }
      return newMap
    })
  }

  const handleRequirementChange = (itemId, level) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev)
      newMap.set(itemId, level)
      return newMap
    })
  }

  const handleSave = () => {
    const items = Array.from(selectedItems.entries()).map(([checklistItemId, requirementLevel]) => ({
      checklistItemId,
      requirementLevel,
    }))
    onSave(items)
    alert('装備表を保存しました')
  }

  // カテゴリ別にグルーピング
  const personalItems = checklistItems.filter(item => item.category === 'personal')
  const sharedItems = checklistItems.filter(item => item.category === 'shared')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">装備表設定</h3>
        <button onClick={handleSave} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          保存
        </button>
      </div>

      {/* 個人装備テーブル */}
      <div>
        <h4 className="mb-2 text-md font-bold">🎒 個人装備</h4>
        <EquipmentTable
          items={personalItems}
          selectedItems={selectedItems}
          onToggle={handleToggle}
          onRequirementChange={handleRequirementChange}
        />
      </div>

      {/* 共同装備テーブル */}
      <div>
        <h4 className="mb-2 text-md font-bold">🏕️ 共同装備</h4>
        <EquipmentTable
          items={sharedItems}
          selectedItems={selectedItems}
          onToggle={handleToggle}
          onRequirementChange={handleRequirementChange}
        />
      </div>

      {/* 保存ボタン（下部にも配置） */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          保存
        </button>
      </div>
    </div>
  )
}

/**
 * 装備テーブル（編集用）
 */
const EquipmentTable = ({items, selectedItems, onToggle, onRequirementChange}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-3 py-2 text-left" style={{width: '60px'}}>
              選択
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">品名</th>
            <th className="border border-gray-300 px-3 py-2 text-left" style={{width: '150px'}}>
              必要度
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const isSelected = selectedItems.has(item.id)
            const requirementLevel = selectedItems.get(item.id) || item.defaultRequirementLevel
            return (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(item.id)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </td>
                <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                <td className="border border-gray-300 px-3 py-2">
                  {isSelected ? (
                    <select
                      value={requirementLevel}
                      onChange={e => onRequirementChange(item.id, e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {Object.values(REQUIREMENT_LEVELS).map(level => (
                        <option key={level.id} value={level.id}>
                          {level.label} {level.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// 一般会員向けコンポーネント
// =============================================================================

/**
 * 例会装備表閲覧（一般会員用）
 */
export const EventEquipmentChecklistView = ({eventId, checklistItems, eventEquipmentItems}) => {
  // 選択された装備をマップ化
  const selectedMap = useMemo(() => {
    const map = new Map()
    eventEquipmentItems.forEach(item => {
      map.set(item.checklistItemId, item.requirementLevel)
    })
    return map
  }, [eventEquipmentItems])

  // カテゴリ別にフィルタ
  const personalItems = checklistItems.filter(
    item => item.category === 'personal' && selectedMap.has(item.id),
  )
  const sharedItems = checklistItems.filter(item => item.category === 'shared' && selectedMap.has(item.id))

  if (eventEquipmentItems.length === 0) {
    return (
      <div className="rounded bg-gray-100 p-8 text-center text-gray-600">
        この例会の装備表は未設定です
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 個人装備テーブル */}
      {personalItems.length > 0 && (
        <div>
          <h4 className="mb-2 text-md font-bold">🎒 個人装備</h4>
          <EquipmentViewTable items={personalItems} selectedMap={selectedMap} />
        </div>
      )}

      {/* 共同装備テーブル */}
      {sharedItems.length > 0 && (
        <div>
          <h4 className="mb-2 text-md font-bold">🏕️ 共同装備</h4>
          <EquipmentViewTable items={sharedItems} selectedMap={selectedMap} />
        </div>
      )}
    </div>
  )
}

/**
 * 装備テーブル（閲覧用）
 */
const EquipmentViewTable = ({items, selectedMap}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-3 py-2 text-center" style={{width: '80px'}}>
              必要度
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">品名</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const requirementLevel = selectedMap.get(item.id)
            const reqLevel = REQUIREMENT_LEVELS[requirementLevel]
            return (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <Badge color={reqLevel.color} bgColor={reqLevel.bgColor}>
                    {reqLevel.label || reqLevel.name}
                  </Badge>
                </td>
                <td className="border border-gray-300 px-3 py-2">{item.name}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
