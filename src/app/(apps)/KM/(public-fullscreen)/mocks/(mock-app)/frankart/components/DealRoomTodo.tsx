'use client'

import React, { useState } from 'react'
import { Plus, CheckSquare, Square, Trash2, User, Calendar } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'

type Props = { dealId: string }

const DealRoomTodo: React.FC<Props> = ({ dealId }) => {
  const { todos, addTodo, toggleTodoComplete, deleteTodo, staff } = useFrankartMockData()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState(staff[0]?.id || '')
  const [dueDate, setDueDate] = useState('')

  const dealTodos = todos.filter((t) => t.dealId === dealId).sort((a, b) => {
    // 未完了を上に、完了を下に。それぞれの中で期日順
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return a.dueDate.localeCompare(b.dueDate)
  })

  const handleAdd = () => {
    if (!title.trim()) return
    const assignee = staff.find((s) => s.id === assigneeId)
    addTodo({
      id: `todo-${Date.now()}`,
      dealId,
      title: title.trim(),
      assigneeId,
      assigneeName: assignee?.name || '',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    })
    setTitle('')
    setDueDate('')
    setShowForm(false)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-600">
          {dealTodos.filter((t) => !t.completed).length}件の未完了タスク
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {/* 追加フォーム */}
      {showForm && (
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50 space-y-3">
          <input
            type="text"
            placeholder="タスク名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
          <div className="flex gap-3">
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              追加する
            </button>
          </div>
        </div>
      )}

      {/* リスト */}
      <div className="divide-y divide-stone-100">
        {dealTodos.length === 0 ? (
          <div className="px-5 py-8 text-center text-stone-400 text-sm">タスクはありません</div>
        ) : (
          dealTodos.map((todo) => (
            <div key={todo.id} className="px-5 py-3 flex items-center gap-3 group">
              <button onClick={() => toggleTodoComplete(todo.id)} className="shrink-0">
                {todo.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Square className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${todo.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                  {todo.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <User className="w-3 h-3" />
                    {todo.assigneeName}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <Calendar className="w-3 h-3" />
                    {todo.dueDate}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1.5 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DealRoomTodo
