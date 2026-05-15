import { Hono } from 'hono'
import { store } from '../storage/memory.js'
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.js'

export const tasksRouter = new Hono()

tasksRouter.get('/', (c) => c.json(store.getAll()))

tasksRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const { title, deadline, priority } = (body ?? {}) as Record<string, unknown>

  if (typeof title !== 'string' || title.trim().length === 0)
    return c.json({ error: 'title is required' }, 400)
  if (!['high', 'medium', 'low'].includes(priority as string))
    return c.json({ error: 'invalid priority' }, 400)

  const input: CreateTaskInput = {
    title: title.trim(),
    deadline: typeof deadline === 'string' ? deadline : '',
    priority: priority as CreateTaskInput['priority'],
  }
  return c.json(store.create(input), 201)
})

tasksRouter.put('/:id', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const input: UpdateTaskInput = {}

  if (typeof body.title === 'string') input.title = body.title.trim()
  if (['high', 'medium', 'low'].includes(body.priority)) input.priority = body.priority
  if (typeof body.deadline === 'string') input.deadline = body.deadline

  const updated = store.update(c.req.param('id'), input)
  if (!updated) return c.json({ error: 'not found' }, 404)
  return c.json(updated)
})

tasksRouter.delete('/:id', (c) => {
  const removed = store.remove(c.req.param('id'))
  if (!removed) return c.json({ error: 'not found' }, 404)
  return new Response(null, { status: 204 })
})
