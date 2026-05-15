import { useState } from 'react'
import { taskApi } from '../api/taskApi'
import type { Task, CreateTaskInput, UpdateTaskInput, Priority } from '../types/task'

const STORAGE_KEY = 'taskflow:tasks'
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

function loadFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadFromStorage)

  const sync = (next: Task[]) => {
    setTasks(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const sorted = [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  )

  const addTask = (input: CreateTaskInput) => {
    const task: Task = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    }
    sync([...tasks, task])
    taskApi.create(input).catch(() => {})
  }

  const updateTask = (id: string, input: UpdateTaskInput) => {
    const next = tasks.map(t => (t.id === id ? { ...t, ...input } : t))
    sync(next)
    taskApi.update(id, input).catch(() => {})
  }

  const completeTask = (id: string) => {
    sync(tasks.filter(t => t.id !== id))
    taskApi.remove(id).catch(() => {})
  }

  return { tasks: sorted, addTask, updateTask, completeTask }
}
