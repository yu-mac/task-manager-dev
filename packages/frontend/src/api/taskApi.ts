import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'

const BASE = '/api'

export const taskApi = {
  getAll: (): Promise<Task[]> =>
    fetch(`${BASE}/tasks`).then(r => r.json()),

  create: (input: CreateTaskInput): Promise<Task> =>
    fetch(`${BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then(r => r.json()),

  update: (id: string, input: UpdateTaskInput): Promise<Task> =>
    fetch(`${BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then(r => r.json()),

  remove: (id: string): Promise<void> =>
    fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' }).then(() => {}),
}
