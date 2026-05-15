import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../components/TaskCard'
import type { Task } from '../types/task'

const TODAY = new Date().toISOString().split('T')[0]
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0]

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'id',
  title: 'テストタスク',
  deadline: '2026-12-31',
  priority: 'medium',
  createdAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
})

describe('TaskCard', () => {
  it('タイトルを表示する', () => {
    render(<TaskCard task={makeTask({ title: 'やること' })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText('やること')).toBeInTheDocument()
  })

  it('優先度バッジを表示する（高）', () => {
    render(<TaskCard task={makeTask({ priority: 'high' })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText('高')).toBeInTheDocument()
  })

  it('優先度バッジを表示する（中）', () => {
    render(<TaskCard task={makeTask({ priority: 'medium' })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText('中')).toBeInTheDocument()
  })

  it('期限を MM/DD 形式で表示する', () => {
    render(<TaskCard task={makeTask({ deadline: '2026-12-31' })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText(/12\/31/)).toBeInTheDocument()
  })

  it('deadline が空のとき「期限なし」を表示する', () => {
    render(<TaskCard task={makeTask({ deadline: '' })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText('期限なし')).toBeInTheDocument()
  })

  it('期限が過去のとき「期限超過」テキストが表示される', () => {
    render(<TaskCard task={makeTask({ deadline: YESTERDAY })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText(/期限超過/)).toBeInTheDocument()
  })

  it('期限が今日のとき「今日まで」テキストが表示される', () => {
    render(<TaskCard task={makeTask({ deadline: TODAY })} onEdit={vi.fn()} onComplete={vi.fn()} />)
    expect(screen.getByText(/今日まで/)).toBeInTheDocument()
  })

  it('編集ボタンクリックで onEdit が呼ばれる', async () => {
    const onEdit = vi.fn()
    render(<TaskCard task={makeTask()} onEdit={onEdit} onComplete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: '編集' }))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('完了ボタンクリックで onComplete が呼ばれる', async () => {
    const onComplete = vi.fn()
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: '完了' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
