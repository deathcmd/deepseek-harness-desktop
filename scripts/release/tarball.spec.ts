import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { capture } from './process.ts'
import { PUBLISH_ORDER_FILE, readPublishOrder, tarballFiles } from './tarball.ts'

vi.mock('./process.ts', () => ({ capture: vi.fn() }))

const roots: string[] = []

afterEach(() => {
  vi.resetAllMocks()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('tarball line-oriented metadata', () => {
  it.each(['\n', '\r\n'])('reads tar members without retaining %j line endings', (newline) => {
    vi.mocked(capture).mockReturnValue(['package/src/main.mjs', 'package/a file.txt', ''].join(newline))
    expect(tarballFiles('/packed.tgz')).toEqual(['package/src/main.mjs', 'package/a file.txt'])
  })

  it.each(['\n', '\r\n'])('reads publish order without retaining %j line endings', (newline) => {
    const root = mkdtempSync(join(tmpdir(), 'dsh-publish-order-'))
    roots.push(root)
    writeFileSync(join(root, PUBLISH_ORDER_FILE), ['first.tgz', 'second.tgz', ''].join(newline))
    expect(readPublishOrder(root)).toEqual(['first.tgz', 'second.tgz'])
  })
})
