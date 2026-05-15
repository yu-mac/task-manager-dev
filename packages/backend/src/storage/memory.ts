import { randomUUID } from 'crypto'
import type { Task, CreateTaskInput, UpdateTaskInput, Priority } from '../types/task.js'

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

let tasks: Task[] = []

export const store = {
  reset: () => {
    tasks = []
  },

  getAll: (): Task[] =>
    [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),

  create: (input: CreateTaskInput): Task => {
    const task: Task = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    }
    tasks.push(task)
    return { ...task }
  },

  findById: (id: string): Task | undefined => {
    const task = tasks.find(t => t.id === id)
    return task ? { ...task } : undefined
  },

  update: (id: string, input: UpdateTaskInput): Task | undefined => {
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1) return undefined
    tasks[idx] = { ...tasks[idx], ...input }
    return { ...tasks[idx] }
  },

  remove: (id: string): boolean => {
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1) return false
    tasks.splice(idx, 1)
    return true
  },
}
