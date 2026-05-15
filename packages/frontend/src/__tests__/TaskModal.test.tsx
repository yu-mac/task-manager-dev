import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from '../components/TaskModal'
import type { Task } from '../types/task'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'id',
  title: '既存タスク',
  deadline: '2026-06-01',
  priority: 'high',
  createdAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
})

describe('TaskModal', () => {
  it('isOpen=false のとき何も表示しない', () => {
    render(<TaskModal isOpen={false} task={null} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('新規タスク')).not.toBeInTheDocument()
  })

  it('task=null のとき「新規タスク」と表示する', () => {
    render(<TaskModal isOpen={true} task={null} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText('新規タスク')).toBeInTheDocument()
  })

  it('task があるとき「タスクを編集」と表示し、既存値が入力欄に入る', () => {
    const task = makeTask({ title: '編集対象', deadline: '2026-07-15', priority: 'low' })
    render(<TaskModal isOpen={true} task={task} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText('タスクを編集')).toBeInTheDocument()
    expect(screen.getByDisplayValue('編集対象')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-07-15')).toBeInTheDocument()
  })

  it('タイトルが空のとき保存ボタンが disabled', () => {
    render(<TaskModal isOpen={true} task={null} onClose={vi.fn()} onSave={vi.fn()} />)
    const saveBtn = screen.getByRole('button', { name: '作成する' })
    expect(saveBtn).toBeDisabled()
  })

  it('タイトルを入力して保存ボタンを押すと onSave が呼ばれる', async () => {
    const onSave = vi.fn()
    render(<TaskModal isOpen={true} task={null} onClose={vi.fn()} onSave={onSave} />)
    await userEvent.type(screen.getByPlaceholderText('タスクのタイトルを入力'), '新しいタスク')
    await userEvent.click(screen.getByRole('button', { name: '作成する' }))
    expect(onSave).toHaveBeenCalledWith({
      title: '新しいタスク',
      deadline: '',
      priority: 'medium',
    })
  })

  it('キャンセルボタンで onClose が呼ばれる', async () => {
    const onClose = vi.fn()
    render(<TaskModal isOpen={true} task={null} onClose={onClose} onSave={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('オーバーレイクリックで onClose が呼ばれる', async () => {
    const onClose = vi.fn()
    render(<TaskModal isOpen={true} task={null} onClose={onClose} onSave={vi.fn()} />)
    const overlay = screen.getByTestId('modal-overlay')
    await userEvent.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Enter キー押下で保存される', async () => {
    const onSave = vi.fn()
    render(<TaskModal isOpen={true} task={null} onClose={vi.fn()} onSave={onSave} />)
    const input = screen.getByPlaceholderText('タスクのタイトルを入力')
    await userEvent.type(input, 'Enterで保存{Enter}')
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Enterで保存' }),
    )
  })

  it('新規作成時は「作成する」、編集時は「保存する」ボタン', () => {
    const { rerender } = render(
      <TaskModal isOpen={true} task={null} onClose={vi.fn()} onSave={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: '作成する' })).toBeInTheDocument()

    rerender(
      <TaskModal isOpen={true} task={makeTask()} onClose={vi.fn()} onSave={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument()
  })
})
