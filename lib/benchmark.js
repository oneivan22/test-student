// core logic for the benchmark
// Exports runBenchmark
// uses simulated async tasks (setTimeout wrapped promises)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const makeTask =
  ({ id, durationMs }) =>
  async () => {
    const start = Date.now()
    // simulate some async work
    await wait(durationMs)
    const end = Date.now()
    return { id, durationMs, start, end, elapsed: end - start }
  }

// run tasks in parallel (Promise.all)
const runParallel = async (taskFns) => {
  const start = Date.now()
  const results = await Promise.all(taskFns.map((fn) => fn()))
  const end = Date.now()
  return { mode: 'parallel', start, end, elapsed: end - start, results }
}

// run tasks serially (one after another)
const runSerial = async (taskFns) => {
  const start = Date.now()
  const results = []
  for (const fn of taskFns) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fn()
    results.push(r)
  }
  const end = Date.now()
  return { mode: 'serial', start, end, elapsed: end - start, results }
}

// run tasks with Promise.race-ish behaviour: resolve when first finishes
const runRace = async (taskFns) => {
  const start = Date.now()
  const racePromise = Promise.race(taskFns.map((fn) => fn()))
  const first = await racePromise
  const end = Date.now()
  return { mode: 'race', start, end, elapsed: end - start, first }
}

// limited concurrency runner
const runWithConcurrency = async (taskFns, concurrency = 2) => {
  const start = Date.now()
  const results = []
  let idx = 0

  const workers = new Array(Math.min(concurrency, taskFns.length))
    .fill(null)
    .map(async () => {
      while (true) {
        const i = idx++
        if (i >= taskFns.length) return
        // eslint-disable-next-line no-await-in-loop
        const r = await taskFns[i]()
        results[i] = r
      }
    })

  await Promise.all(workers)
  const end = Date.now()
  return {
    mode: `concurrency-${concurrency}`,
    start,
    end,
    elapsed: end - start,
    results,
  }
}

const runBenchmark = async ({
  mode = 'parallel',
  tasks = [],
  concurrency = tasks.length,
}) => {
  const taskFns = tasks.map((t) => makeTask(t))

  if (mode === 'parallel') return runParallel(taskFns)
  if (mode === 'serial') return runSerial(taskFns)
  if (mode === 'race') return runRace(taskFns)
  if (mode === 'concurrency') return runWithConcurrency(taskFns, concurrency)

  throw new Error('Unknown mode: ' + mode)
}

module.exports = { runBenchmark, makeTask, wait }
