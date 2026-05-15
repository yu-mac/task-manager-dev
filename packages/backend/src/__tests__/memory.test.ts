import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../storage/memory.js'

beforeEach(() => store.reset())

describe('store.getAll()', () => {
  it('初期状態で空配列を返す', () => {
    expect(store.getAll()).toEqual([])
  })

  it('high → medium → low の優先度順で返す', () => {
    store.create({ title: '低', deadline: '', priority: 'low' })
    store.create({ title: '高', deadline: '', priority: 'high' })
    store.create({ title: '中', deadline: '', priority: 'medium' })

    const priorities = store.getAll().map(t => t.priority)
    expect(priorities).toEqual(['high', 'medium', 'low'])
  })
})

describe('store.create()', () => {
  it('タスクを追加して id と createdAt を付与して返す', () => {
    const task = store.create({ title: 'テスト', deadline: '2026-06-01', priority: 'medium' })

    expect(task.id).toBeTruthy()
    expect(task.title).toBe('テスト')
    expect(task.deadline).toBe('2026-06-01')
    expect(task.priority).toBe('medium')
    expect(task.createdAt).toBeTruthy()
    expect(store.getAll()).toHaveLength(1)
  })
})

describe('store.findById()', () => {
  it('存在するタスクを返す', () => {
    const task = store.create({ title: '検索対象', deadline: '', priority: 'low' })
    expect(store.findById(task.id)).toMatchObject({ id: task.id })
  })

  it('存在しない id に対して undefined を返す', () => {
    expect(store.findById('nonexistent')).toBeUndefined()
  })
})

describe('store.update()', () => {
  it('指定フィールドを更新して返す', () => {
    const task = store.create({ title: '元のタイトル', deadline: '', priority: 'low' })
    const updated = store.update(task.id, { title: '新タイトル', priority: 'high' })

    expect(updated?.title).toBe('新タイトル')
    expect(updated?.priority).toBe('high')
    expect(updated?.id).toBe(task.id)
  })

  it('存在しない id に対して undefined を返す', () => {
    expect(store.update('nonexistent', { title: '更新' })).toBeUndefined()
  })
})

describe('store.remove()', () => {
  it('タスクを削除して true を返す', () => {
    const task = store.create({ title: '削除対象', deadline: '', priority: 'medium' })
    expect(store.remove(task.id)).toBe(true)
    expect(store.getAll()).toHaveLength(0)
  })

  it('存在しない id に対して false を返す', () => {
    expect(store.remove('nonexistent')).toBe(false)
  })
})
