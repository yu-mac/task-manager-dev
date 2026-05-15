import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { tasksRouter } from '../routes/tasks.js'
import { store } from '../storage/memory.js'

const app = new Hono()
app.route('/api/tasks', tasksRouter)

beforeEach(() => store.reset())

const json = (res: Response) => res.json()

describe('GET /api/tasks', () => {
  it('空のとき [] を返す（200）', async () => {
    const res = await app.request('/api/tasks')
    expect(res.status).toBe(200)
    expect(await json(res)).toEqual([])
  })

  it('追加済みタスクを優先度順で返す（200）', async () => {
    store.create({ title: '低', deadline: '', priority: 'low' })
    store.create({ title: '高', deadline: '', priority: 'high' })

    const res = await app.request('/api/tasks')
    const tasks = await json(res)
    expect(tasks[0].priority).toBe('high')
    expect(tasks[1].priority).toBe('low')
  })
})

describe('POST /api/tasks', () => {
  it('有効な入力でタスクを作成して返す（201）', async () => {
    const res = await app.request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '新タスク', deadline: '2026-06-01', priority: 'high' }),
    })
    expect(res.status).toBe(201)
    const task = await json(res)
    expect(task.id).toBeTruthy()
    expect(task.title).toBe('新タスク')
    expect(task.priority).toBe('high')
  })

  it('title が空文字のとき 400 を返す', async () => {
    const res = await app.request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  ', deadline: '', priority: 'medium' }),
    })
    expect(res.status).toBe(400)
  })

  it('priority が不正値のとき 400 を返す', async () => {
    const res = await app.request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'タスク', deadline: '', priority: 'urgent' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/tasks/:id', () => {
  it('存在するタスクを更新して返す（200）', async () => {
    const task = store.create({ title: '元タイトル', deadline: '', priority: 'low' })
    const res = await app.request(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '更新後', priority: 'high' }),
    })
    expect(res.status).toBe(200)
    const updated = await json(res)
    expect(updated.title).toBe('更新後')
    expect(updated.priority).toBe('high')
  })

  it('存在しない id のとき 404 を返す', async () => {
    const res = await app.request('/api/tasks/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '更新' }),
    })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('存在するタスクを削除して 204 を返す', async () => {
    const task = store.create({ title: '削除対象', deadline: '', priority: 'medium' })
    const res = await app.request(`/api/tasks/${task.id}`, { method: 'DELETE' })
    expect(res.status).toBe(204)
    expect(store.getAll()).toHaveLength(0)
  })

  it('存在しない id のとき 404 を返す', async () => {
    const res = await app.request('/api/tasks/nonexistent', { method: 'DELETE' })
    expect(res.status).toBe(404)
  })
})
