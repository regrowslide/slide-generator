'use client'

import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@shadcn/ui/card'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn/ui/table'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@shadcn/ui/switch'
import {
  createFacility,
  updateFacility,
  deleteFacility,
  checkFacilityCodeExists,
} from '../../../_actions/facility-actions'
import type { KgFacilityMaster, KgFacilityFormData } from '../../../types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'
import { Button } from '@cm/shadcn/ui/button'
import { Badge } from '@cm/shadcn/ui/badge'

type Props = {
  initialFacilities: KgFacilityMaster[]
}

const defaultFormData: KgFacilityFormData = {
  code: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  isActive: true,
}

export const FacilityMasterClient = ({ initialFacilities }: Props) => {
  const { toggleLoad } = useGlobal()
  const [facilities, setFacilities] = useState(initialFacilities)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<KgFacilityFormData>(defaultFormData)
  const [formError, setFormError] = useState<string | null>(null)

  // 編集モーダル
  const formModal = useModal()

  // フォームを開く（新規）
  const handleOpenNew = useCallback(() => {
    setEditingId(null)
    setFormData(defaultFormData)
    setFormError(null)
    formModal.handleOpen()
  }, [formModal])

  // フォームを開く（編集）
  const handleOpenEdit = useCallback(
    (facility: KgFacilityMaster) => {
      setEditingId(facility.id)
      setFormData({
        code: facility.code,
        name: facility.name,
        address: facility.address ?? '',
        phone: facility.phone ?? '',
        email: facility.email ?? '',
        isActive: facility.isActive,
      })
      setFormError(null)
      formModal.handleOpen()
    },
    [formModal]
  )

  // フォーム保存
  const handleSave = useCallback(async () => {
    if (!formData.code || !formData.name) {
      setFormError('コードと施設名は必須です')
      return
    }

    // コード重複チェック
    const codeExists = await checkFacilityCodeExists(formData.code, editingId ?? undefined)
    if (codeExists) {
      setFormError('このコードは既に使用されています')
      return
    }

    toggleLoad(async () => {
      if (editingId) {
        const updated = await updateFacility(editingId, formData)
        setFacilities((prev) => prev.map((f) => (f.id === editingId ? updated : f)))
      } else {
        const created = await createFacility(formData)
        setFacilities((prev) => [...prev, created])
      }
      formModal.handleClose()
    })
  }, [editingId, formData, toggleLoad, formModal])

  // 削除
  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('この施設を非アクティブにしますか？')) return

      toggleLoad(async () => {
        await deleteFacility(id)
        setFacilities((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isActive: false } : f))
        )
      })
    },
    [toggleLoad]
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/curious/kaigoshokuManagement/master">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">施設マスター</h2>
            <p className="text-slate-500 text-sm">取引先施設の管理</p>
          </div>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" />
          新規追加
        </Button>
      </div>

      {/* テーブル */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コード</TableHead>
                <TableHead>施設名</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                    施設が登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                facilities.map((facility) => (
                  <TableRow key={facility.id} className={!facility.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-mono">{facility.code}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {facility.name}
                      </div>
                    </TableCell>
                    <TableCell>{facility.phone ?? '-'}</TableCell>
                    <TableCell>
                      <Badge color={facility.isActive ? 'green' : 'gray'}>
                        {facility.isActive ? '有効' : '無効'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button

                          variant="ghost"
                          onClick={() => handleOpenEdit(facility)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {facility.isActive && (
                          <Button

                            variant="ghost"
                            onClick={() => handleDelete(facility.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 編集モーダル */}
      <formModal.Modal title={editingId ? '施設を編集' : '施設を追加'}>
        <div className="space-y-4">
          {formError && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">コード *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="F001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">施設名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="〇〇介護施設"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={!!formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">有効</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => formModal.handleClose()}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>{editingId ? '更新' : '追加'}</Button>
        </div>
      </formModal.Modal>
    </div>
  )
}
