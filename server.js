// Node.js 12, CommonJS
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { runBenchmark } = require('./lib/benchmark')

const app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.post('/api/run', async (req, res) => {
  // body: { mode: 'parallel'|'serial'|'race', tasks: [{id, durationMs}], concurrency?: number }
  try {
    const {
      mode = 'parallel',
      tasks = [],
      concurrency = tasks.length,
    } = req.body
    const result = await runBenchmark({ mode, tasks, concurrency })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Async benchmark server listening on http://localhost:${PORT}`)
})
