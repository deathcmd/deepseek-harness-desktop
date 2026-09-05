import { describe, expect, it } from 'vitest'
import { realizeSeedFixture } from './scaffold.ts'

describe('seed fixture realization', () => {
  it.each([
    '/tmp/workspace',
    String.raw`C:\Users\测试\workspace`,
    String.raw`\\server\share\workspace`,
    '/tmp/a "quoted" workspace',
  ])('preserves JSON string escaping for %s', (workspaceCwd) => {
    const text = `${JSON.stringify({ id: '{{sessionId}}', cwd: '{{cwd}}' })}\n`
    const id = 'session"\\id'
    const realized = realizeSeedFixture({ workspaceCwd }, text, id)
    expect(JSON.parse(realized)).toEqual({ id, cwd: workspaceCwd })
    expect(realizeSeedFixture({ workspaceCwd }, realized, id)).toBe(realized)
  })

  it('rewrites escaped recorded paths in the header and event text', () => {
    const recorded = String.raw`C:\recorded\workspace`
    const workspaceCwd = String.raw`D:\new\workspace`
    const text = [
      JSON.stringify({ id: '{{sessionId}}', cwd: recorded }),
      JSON.stringify({ body: `Read ${recorded}\\file.txt` }),
    ].join('\n')
    const realized = realizeSeedFixture({ workspaceCwd }, text, 'session')
    expect(realized.split('\n').map(line => JSON.parse(line) as unknown)).toEqual([
      { id: 'session', cwd: workspaceCwd },
      { body: `Read ${workspaceCwd}\\file.txt` },
    ])
  })

  it('leaves a fixture without a working-directory header intact', () => {
    const text = JSON.stringify({ id: '{{sessionId}}' })
    expect(JSON.parse(realizeSeedFixture({ workspaceCwd: '/tmp/workspace' }, text, 'session')))
      .toEqual({ id: 'session' })
  })
})
