import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { pool } from './db'

const app = express()
const port = Number(process.env.PORT || 5000)
const corsOrigin = process.env.CORS_ORIGIN || '*'

app.use(pinoHttp())
app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'OK' })
  } catch {
    res.status(500).json({ status: 'DB_ERROR' })
  }
})

app.get('/api/message', (_req, res) => {
  res.json({ text: 'Hello from the backend!' })
})

app.get('/api/data', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM sample_data ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database query failed' })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on ${port}`)
})