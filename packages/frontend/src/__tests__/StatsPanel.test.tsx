import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsPanel } from '../components/StatsPanel'
import type { Task } from '../types/task'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'id',
  title: 'タスク',
  deadline: '',
  priority: 'medium',
  createdAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
})

const TODAY = new Date().toISOString().split('T')[0]
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0]

describe('StatsPanel', () => {
  it('tasks.length をタスク合計として表示する', () => {
    const tasks = [makeTask(), makeTask({ id: 'b' })]
    render(<StatsPanel tasks={tasks} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('タスク合計')).toBeInTheDocument()
  })

  it('期限が過去のタスク数を期限超過として表示する', () => {
    const tasks = [
      makeTask({ deadline: YESTERDAY }),
      makeTask({ id: 'b', deadline: TOMORROW }),
    ]
    render(<StatsPanel tasks={tasks} />)
    expect(screen.getByText('期限超過')).toBeInTheDocument()
    const nums = screen.getAllByText('1')
    expect(nums.length).toBeGreaterThanOrEqual(1)
  })

  it('priority high のタスク数を表示する', () => {
    const tasks = [
      makeTask({ priority: 'high' }),
      makeTask({ id: 'b', priority: 'low' }),
    ]
    render(<StatsPanel tasks={tasks} />)
    expect(screen.getByText('高優先度')).toBeInTheDocument()
  })

  it('期限超過 > 0 のとき danger クラスが付く', () => {
    const tasks = [makeTask({ deadline: YESTERDAY })]
    render(<StatsPanel tasks={tasks} />)
    const overdueEl = screen.getByTestId('overdue-count')
    expect(overdueEl.className).toContain('danger')
  })

  it('高優先度 > 0 のとき danger クラスが付く', () => {
    const tasks = [makeTask({ priority: 'high' })]
    render(<StatsPanel tasks={tasks} />)
    const highEl = screen.getByTestId('high-count')
    expect(highEl.className).toContain('danger')
  })

  it('期限超過 = 0 のとき danger クラスが付かない', () => {
    const tasks = [makeTask({ deadline: TOMORROW })]
    render(<StatsPanel tasks={tasks} />)
    const overdueEl = screen.getByTestId('overdue-count')
    expect(overdueEl.className).not.toContain('danger')
  })
})
