import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { attempt, attemptEchoed, capture, run } from './process.ts'

const roots: string[] = []

afterEach(() => {
  vi.restoreAllMocks()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('release command execution', () => {
  it('captures complete output and returns unsuccessful exit codes', () => {
    expect(attempt(process.execPath, ['-e', 'process.stdout.write("out\\n"); process.stderr.write("err\\n"); process.exit(3)']))
      .toEqual({ status: 3, stdout: 'out\n', stderr: 'err\n' })
    expect(capture(process.execPath, ['-e', 'console.log("trimmed")'])).toBe('trimmed')
    expect(() => {
      capture(process.execPath, ['-e', 'process.exit(2)'])
    }).toThrow('exited with 2')
  })

  it('echoes each captured stream once', () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    const result = attemptEchoed(process.execPath, ['-e', 'process.stdout.write("out\\n"); process.stderr.write("err\\n")'])
    expect(result).toEqual({ status: 0, stdout: 'out\n', stderr: 'err\n' })
    expect(stdout).toHaveBeenCalledWith('out\n')
    expect(stderr).toHaveBeenCalledWith('err\n')
  })

  it.each([attempt, attemptEchoed, run])('throws when a process cannot be started in its working directory', (invoke) => {
    const root = mkdtempSync(join(tmpdir(), 'dsh-release-missing-cwd-'))
    roots.push(root)
    expect(() => { invoke(process.execPath, [], { cwd: join(root, 'absent') }) }).toThrow()
  })

  it('runs package-manager-style shims with literal arguments and spaced paths', () => {
    const root = mkdtempSync(join(tmpdir(), 'dsh-release-command-'))
    roots.push(root)
    const directory = join(root, 'command with spaces')
    mkdirSync(directory)
    const script = join(directory, 'args.cjs')
    writeFileSync(script, 'process.stdout.write(JSON.stringify(process.argv.slice(2)))\n')
    const shim = join(directory, process.platform === 'win32' ? 'release-tool.cmd' : 'release-tool')
    writeFileSync(shim, process.platform === 'win32'
      ? `@echo off\r\n"${process.execPath}" "${script}" %*\r\n`
      : `#!/bin/sh\nexec "${process.execPath}" "${script}" "$@"\n`)
    chmodSync(shim, 0o755)
    const args = ['a b', 'value&literal', '(parentheses)', 'snowman-☃']
    expect(JSON.parse(capture(shim, args))).toEqual(args)
    expect(() => { run(shim, []) }).not.toThrow()
  })
})
