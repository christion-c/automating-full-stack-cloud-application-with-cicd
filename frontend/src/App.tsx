import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

type SampleRow = {
  id: number
  name: string
}

const apiUrl = import.meta.env.VITE_API_URL

function App() {
  const [message, setMessage] = useState('Loading...')
  const [rows, setRows] = useState<SampleRow[]>([])
  const [health, setHealth] = useState('checking')

useEffect(() => {
    const load = async () => {
      try {
        const [msgRes, dataRes, healthRes] = await Promise.all([
          axios.get(`${apiUrl}/message`),
          axios.get(`${apiUrl}/data`),
          axios.get(`${apiUrl}/health`),
        ])

        setMessage(msgRes.data.text)
        setRows(dataRes.data)
        setHealth(healthRes.data.status)
      } catch (error) {
        console.error(error)
        setMessage('Could not reach backend')
        setHealth('DOWN')
      }
    }

    load()
  }, [])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Cloud Computing Final Project</h1>
      <p><strong>Backend message:</strong> {message}</p>
      <p><strong>Health:</strong> {health}</p>

      <h2>Database rows</h2>
      <ul>
        {rows.map((row) => (
          <li key={row.id}>{row.id} - {row.name}</li>
        ))}
      </ul>
    </main>
    )
}

export default App