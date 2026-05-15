import type { Task } from '../types/task'

interface Props {
  tasks: Task[]
}

export function StatsPanel({ tasks }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const overdueCount = tasks.filter(t => t.deadline && t.deadline < today).length
  const highCount = tasks.filter(t => t.priority === 'high').length

  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-num">{tasks.length}</span>
        <span className="stat-label">タスク合計</span>
      </div>
      <div className="stat">
        <span
          data-testid="overdue-count"
          className={`stat-num${overdueCount > 0 ? ' danger' : ''}`}
        >
          {overdueCount}
        </span>
        <span className="stat-label">期限超過</span>
      </div>
      <div className="stat">
        <span
          data-testid="high-count"
          className={`stat-num${highCount > 0 ? ' danger' : ''}`}
        >
          {highCount}
        </span>
        <span className="stat-label">高優先度</span>
      </div>
    </div>
  )
}
