import { useState } from 'react'
import { useTasks } from './hooks/useTasks'
import { StatsPanel } from './components/StatsPanel'
import { TaskCard } from './components/TaskCard'
import { TaskModal } from './components/TaskModal'
import type { Task, CreateTaskInput } from './types/task'
import './App.css'

export default function App() {
  const { tasks, addTask, updateTask, completeTask } = useTasks()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const openCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const handleSave = (input: CreateTaskInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input)
    } else {
      addTask(input)
    }
    closeModal()
  }

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
          <StatsPanel tasks={tasks} />

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
                {tasks.map(task => (
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
        onSave={handleSave}
      />
    </div>
  )
}
