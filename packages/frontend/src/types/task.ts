export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  deadline: string
  priority: Priority
  createdAt: string
}

export type CreateTaskInput = Pick<Task, 'title' | 'deadline' | 'priority'>
export type UpdateTaskInput = Partial<CreateTaskInput>
