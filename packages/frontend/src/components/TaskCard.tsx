import type { Task, Priority } from '../types/task'

const PRIORITY_LABEL: Record<Priority, string> = { high: '高', medium: '中', low: '低' }

function formatDate(dateStr: string): string {
  if (!dateStr) return '期限なし'
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

function getDateStatus(dateStr: string): 'overdue' | 'today' | null {
  if (!dateStr) return null
  const today = new Date().toISOString().split('T')[0]
  if (dateStr < today) return 'overdue'
  if (dateStr === today) return 'today'
  return null
}

interface Props {
  task: Task
  onEdit: () => void
  onComplete: () => void
}

export function TaskCard({ task, onEdit, onComplete }: Props) {
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
