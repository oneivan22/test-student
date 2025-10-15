// Jest tests for runBenchmark
const { runBenchmark } = require('../lib/benchmark')

describe('benchmark runner', () => {
  jest.setTimeout(10000)

  test('parallel should be faster than serial for multi tasks', async () => {
    const tasks = [
      { id: 'a', durationMs: 200 },
      { id: 'b', durationMs: 200 },
      { id: 'c', durationMs: 200 },
    ]

    const p = await runBenchmark({ mode: 'parallel', tasks })
    const s = await runBenchmark({ mode: 'serial', tasks })

    // parallel elapsed should be less than serial elapsed
    expect(p.elapsed).toBeLessThan(s.elapsed)
  })

  test('race returns first finished', async () => {
    const tasks = [
      { id: 'slow', durationMs: 300 },
      { id: 'fast', durationMs: 50 },
      { id: 'mid', durationMs: 150 },
    ]

    const r = await runBenchmark({ mode: 'race', tasks })
    expect(r.first).toBeDefined()
    expect(r.first.id).toBe('fast')
    expect(r.elapsed).toBeGreaterThanOrEqual(r.first.elapsed - 5)
  })

  test('concurrency respects limit', async () => {
    const tasks = [
      { id: 't1', durationMs: 200 },
      { id: 't2', durationMs: 200 },
      { id: 't3', durationMs: 200 },
      { id: 't4', durationMs: 200 },
    ]
    const c2 = await runBenchmark({
      mode: 'concurrency',
      tasks,
      concurrency: 2,
    })
    const c4 = await runBenchmark({
      mode: 'concurrency',
      tasks,
      concurrency: 4,
    })

    expect(c2.elapsed).toBeGreaterThanOrEqual(c4.elapsed)
  })
})
