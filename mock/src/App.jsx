import { useState } from 'react'
import TaskModal from './components/TaskModal'
import './App.css'

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const INITIAL_TASKS = [
  { id: 1, title: 'デザインレビューの準備資料まとめ', deadline: '2026-05-13', priority: 'high' },
  { id: 2, title: 'Q2レポートの作成と提出', deadline: '2026-05-15', priority: 'high' },
  { id: 3, title: 'チームミーティングのアジェンダ作成', deadline: '2026-05-17', priority: 'medium' },
  { id: 4, title: 'クライアントへのメール返信', deadline: '2026-05-19', priority: 'medium' },
  { id: 5, title: '技術書の読書・まとめ', deadline: '2026-05-31', priority: 'low' },
]

function formatDate(dateStr) {
  if (!dateStr) return '期限なし'
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

function getDateStatus(dateStr) {
  if (!dateStr) return null
  const today = new Date().toISOString().split('T')[0]
  if (dateStr < today) return 'overdue'
  if (dateStr === today) return 'today'
  return null
}

function TaskCard({ task, onEdit, onComplete }) {
  const status = getDateStatus(task.deadline)

  return (
    <div className="task-card">
      <div className={`pbar pbar-${task.priority}`} />
      <div className="task-body">
        <div className="task-info">
          <h3 className="task-title">{task.title}</h3>
          <div className="task-meta">
            <span className={`badge badge-${task.priority}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            <span className={`due${status ? ` due-${status}` : ''}`}>
              {formatDate(task.deadline)}
              {status === 'overdue' && ' · 期限超過'}
              {status === 'today' && ' · 今日まで'}
            </span>
          </div>
        </div>
        <div className="task-actions">
          <button className="btn-edit" onClick={onEdit}>編集</button>
          <button className="btn-done" onClick={onComplete}>完了</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const openCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const saveTask = (data) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t))
    } else {
      setTasks(prev => [...prev, { id: Date.now(), ...data }])
    }
    closeModal()
  }

  const completeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const today = new Date().toISOString().split('T')[0]
  const overdueCount = tasks.filter(t => t.deadline && t.deadline < today).length
  const highCount = tasks.filter(t => t.priority === 'high').length
  const sorted = [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">✓</div>
            <span className="logo-name">TaskFlow</span>
          </div>
          <button className="btn-primary" onClick={openCreate}>+ 新規作成</button>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="stats">
            <div className="stat">
              <span className="stat-num">{tasks.length}</span>
              <span className="stat-label">タスク合計</span>
            </div>
            <div className="stat">
              <span className={`stat-num${overdueCount > 0 ? ' danger' : ''}`}>{overdueCount}</span>
              <span className="stat-label">期限超過</span>
            </div>
            <div className="stat">
              <span className={`stat-num${highCount > 0 ? ' danger' : ''}`}>{highCount}</span>
              <span className="stat-label">高優先度</span>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">🎉</span>
              <p className="empty-title">すべて完了しました！</p>
              <p className="empty-sub">新しいタスクを追加しましょう</p>
              <button className="btn-primary" onClick={openCreate}>タスクを作成</button>
            </div>
          ) : (
            <>
              <div className="section-head">
                <span className="section-title">タスク一覧 ({tasks.length})</span>
              </div>
              <div className="task-list">
                {sorted.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => openEdit(task)}
                    onComplete={() => completeTask(task.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onClose={closeModal}
        onSave={saveTask}
      />
    </div>
  )
}
