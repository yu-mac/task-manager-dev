import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTasks } from '../hooks/useTasks'
import type { Task } from '../types/task'

vi.mock('../api/taskApi', () => ({
  taskApi: {
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}))

const STORAGE_KEY = 'taskflow:tasks'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-id',
  title: 'テストタスク',
  deadline: '2026-06-01',
  priority: 'medium',
  createdAt: '2026-05-01T00:00:00.000Z',
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('useTasks', () => {
  it('localStorage が空のとき tasks は [] で初期化される', () => {
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toEqual([])
  })

  it('localStorage に保存済みデータがあれば、それで初期化される', () => {
    const stored = [makeTask({ id: 'a', title: '保存済みタスク' })]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('保存済みタスク')
  })

  it('addTask を呼ぶと tasks に追加され localStorage に保存される', () => {
    const { result } = renderHook(() => useTasks())

    act(() => {
      result.current.addTask({ title: '新タスク', deadline: '', priority: 'low' })
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('新タスク')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored).toHaveLength(1)
  })

  it('updateTask を呼ぶと対象タスクが更新され localStorage に保存される', () => {
    const task = makeTask({ id: 'abc' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify([task]))

    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.updateTask('abc', { title: '更新後' })
    })

    expect(result.current.tasks[0].title).toBe('更新後')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored[0].title).toBe('更新後')
  })

  it('completeTask を呼ぶと対象タスクが削除され localStorage に保存される', () => {
    const task = makeTask({ id: 'abc' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify([task]))

    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.completeTask('abc')
    })

    expect(result.current.tasks).toHaveLength(0)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored).toHaveLength(0)
  })

  it('tasks は high → medium → low の優先度順にソートされて返る', () => {
    const tasks = [
      makeTask({ id: '1', priority: 'low' }),
      makeTask({ id: '2', priority: 'high' }),
      makeTask({ id: '3', priority: 'medium' }),
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))

    const { result } = renderHook(() => useTasks())
    const priorities = result.current.tasks.map(t => t.priority)
    expect(priorities).toEqual(['high', 'medium', 'low'])
  })

  it('addTask は taskApi.create を呼び出す', async () => {
    const { taskApi } = await import('../api/taskApi')
    const { result } = renderHook(() => useTasks())

    act(() => {
      result.current.addTask({ title: 'API呼び出しテスト', deadline: '', priority: 'medium' })
    })

    expect(taskApi.create).toHaveBeenCalledWith({
      title: 'API呼び出しテスト',
      deadline: '',
      priority: 'medium',
    })
  })

  it('updateTask は taskApi.update を呼び出す', async () => {
    const { taskApi } = await import('../api/taskApi')
    const task = makeTask({ id: 'xyz' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify([task]))

    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.updateTask('xyz', { title: '変更後' })
    })

    expect(taskApi.update).toHaveBeenCalledWith('xyz', { title: '変更後' })
  })

  it('completeTask は taskApi.remove を呼び出す', async () => {
    const { taskApi } = await import('../api/taskApi')
    const task = makeTask({ id: 'del' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify([task]))

    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.completeTask('del')
    })

    expect(taskApi.remove).toHaveBeenCalledWith('del')
  })
})
