'use client'

import { useState } from 'react'
import type { RoleMaster } from '@prisma/generated/prisma/client'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@cm/components/styles/common-components/Button'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

type RoleFormData = { name: string; description: string; color: string }
const emptyForm: RoleFormData = { name: '', description: '', color: '' }

type RoleMasterCrudSectionProps = {
  roles: RoleMaster[]
  appFilter?: string
  onRolesChanged: () => Promise<void>
  onUsersChanged: () => Promise<void>
  minWidthClassName?: string
}

const RoleMasterCrudSection = ({
  roles,
  appFilter,
  onRolesChanged,
  onUsersChanged,
  minWidthClassName,
}: RoleMasterCrudSectionProps) => {
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<RoleFormData>(emptyForm)
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState<RoleFormData>(emptyForm)

  const handleAddRole = async () => {
    if (!addForm.name.trim()) return
    // 末尾に追加（既存の最大sortOrder + 1）
    const maxSortOrder = roles.length > 0 ? Math.max(...roles.map(r => r.sortOrder)) : 0
    await doStandardPrisma('roleMaster', 'create', {
      data: {
        name: addForm.name.trim(),
        description: addForm.description.trim() || null,
        color: addForm.color.trim() || null,
        apps: appFilter ? [appFilter] : [],
        sortOrder: maxSortOrder + 1,
      },
    })
    setAddForm(emptyForm)
    setIsAdding(false)
    await onRolesChanged()
  }

  const handleStartEdit = (role: RoleMaster) => {
    setEditingRoleId(role.id)
    setEditForm({
      name: role.name,
      description: role.description || '',
      color: role.color || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || editingRoleId === null) return
    await doStandardPrisma('roleMaster', 'update', {
      where: { id: editingRoleId },
      data: {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        color: editForm.color.trim() || null,
      },
    })
    setEditingRoleId(null)
    await onRolesChanged()
  }

  /** 並び替え: 対象ロールを上または下に移動 */
  const handleMoveRole = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= roles.length) return

    // 現在の表示順を配列として複製し、隣接要素を入れ替え
    const reordered = [...roles]
    ;[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]]

    // インデックスベースで連番を振り直す（同一sortOrder問題を回避）
    await Promise.all(
      reordered.map((role, i) =>
        doStandardPrisma('roleMaster', 'update', {
          where: { id: role.id },
          data: { sortOrder: i },
        })
      )
    )
    await onRolesChanged()
  }

  const handleDeleteRole = async (role: RoleMaster) => {
    if (!confirm(`「${role.description || role.name}」を削除しますか？割り当て済みのユーザーからも解除されます。`)) return
    await doStandardPrisma('userRole', 'deleteMany', {
      where: { roleMasterId: role.id },
    })
    await doStandardPrisma('roleMaster', 'delete', {
      where: { id: role.id },
    })
    await onRolesChanged()
    await onUsersChanged()
  }

  /** 入力フィールド3つの共通レンダリング */
  const renderFormFields = (
    form: RoleFormData,
    setForm: (updater: (prev: RoleFormData) => RoleFormData) => void,
    size: 'sm' | 'md'
  ) => {
    const py = size === 'sm' ? 'py-0.5' : 'py-1'
    return (
      <>
        <input
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="権限名（英語キー）"
          className={`border rounded px-2 ${py} text-xs w-32`}
        />
        <input
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="表示名"
          className={`border rounded px-2 ${py} text-xs w-32`}
        />
        <input
          value={form.color}
          onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
          placeholder="色"
          className={`border rounded px-2 ${py} text-xs w-20`}
        />
      </>
    )
  }

  return (
    <section className="flex justify-end w-full">
      <ShadModal
        title="権限マスタ設定"
        description="権限マスタを管理します。"
        className="p-4"
        Trigger={<Button color="primary">権限マスタ管理</Button>}
      >
        <div className="space-y-2 border rounded-lg border-gray-200 bg-gray-50 p-2">
          <div className="flex items-center justify-between">

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-3.5 w-3.5" />
                追加
              </button>
            )}
          </div>

          {/* 新規追加フォーム */}
          {isAdding && (
            <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-200">
              {renderFormFields(addForm, setAddForm, 'md')}
              <button onClick={handleAddRole} className="text-green-600 hover:text-green-800">
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setAddForm(emptyForm)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 既存ロール一覧 */}
          <table className="min-w-full text-xs bg-white rounded border border-gray-100">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-center font-medium text-gray-500 w-14">順序</th>
                <th className="px-2 py-1 text-left font-medium text-gray-500 w-32">名称</th>
                <th className="px-2 py-1 text-left font-medium text-gray-500 w-32">説明</th>
                <th className="px-2 py-1 text-left font-medium text-gray-500 w-12">色</th>
                <th className="px-2 py-1 text-right font-medium text-gray-500 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr key={role.id} className="border-t border-gray-100">
                  {editingRoleId === role.id ? (
                    <>
                      <td colSpan={5} className="px-2 py-1 bg-gray-50">
                        <div className="flex items-center gap-2">
                          {renderFormFields(editForm, setEditForm, 'sm')}
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingRoleId(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1 w-14">
                        <div className="flex justify-center items-center gap-0.5">
                          <button
                            onClick={() => handleMoveRole(index, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveRole(index, 'down')}
                            disabled={index === roles.length - 1}
                            className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-gray-500 w-32 truncate">{role.name}</td>
                      <td className="px-2 py-1 text-gray-700 w-32 truncate">{role.description || '-'}</td>
                      <td className="px-2 py-1 w-12">
                        {role.color && (
                          <span
                            className="inline-block w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: role.color }}
                          />
                        )}
                      </td>
                      <td className="px-2 py-1 w-20">
                        <div className="flex justify-end items-center gap-1">
                          <button onClick={() => handleStartEdit(role)} className="text-gray-400 hover:text-blue-600">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDeleteRole(role)} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShadModal>
    </section>
  )
}

export default RoleMasterCrudSection
