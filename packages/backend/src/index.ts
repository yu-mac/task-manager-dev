import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok' }))

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Backend running on http://localhost:3000')
})
