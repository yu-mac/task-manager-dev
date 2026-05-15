import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { tasksRouter } from './routes/tasks.js'

const app = new Hono()

app.use('/api/*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/tasks', tasksRouter)

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Backend running on http://localhost:3000')
})
