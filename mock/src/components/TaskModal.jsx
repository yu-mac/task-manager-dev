import { useState, useEffect } from 'react'

const PRIORITIES = [
  { value: 'high',   label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low',    label: '低' },
]

export default function TaskModal({ isOpen, task, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title ?? '')
      setDeadline(task?.deadline ?? '')
      setPriority(task?.priority ?? 'medium')
    }
  }, [isOpen, task])

  if (!isOpen) return null

  const canSave = title.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({ title: title.trim(), deadline, priority })
  }

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="overlay" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">{task ? 'タスクを編集' : '新規タスク'}</h2>
          <button className="btn-close" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        <div className="field">
          <label className="field-label">タイトル</label>
          <input
            className="field-input"
            type="text"
            placeholder="タスクのタイトルを入力"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label">期限</label>
          <input
            className="field-input"
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">優先度</label>
          <div className="p-picker">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                className={`p-btn${priority === p.value ? ` sel-${p.value}` : ''}`}
                onClick={() => setPriority(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="btn-save" onClick={handleSave} disabled={!canSave}>
            {task ? '保存する' : '作成する'}
          </button>
        </div>
      </div>
    </div>
  )
}
