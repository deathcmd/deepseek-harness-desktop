import { ChildProcess } from 'node:child_process'
import { createServer } from 'node:http'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { hasChildExited, resolveRuntimePaths, waitForServer } from '../src/runtime.mjs'

function childProcess() {
  return new ChildProcess()
}

describe('desktop runtime', () => {
  it('resolves the CLI from the repository root in a source launch', () => {
    const root = resolve('checkout with spaces')
    const paths = resolveRuntimePaths({ isPackaged: false, sourceDirectory: join(root, 'apps', 'desktop', 'src'), platform: 'win32' })
    expect(paths.dshEntry).toBe(join(root, 'apps', 'cli', 'lib', 'bin.js'))
    expect(paths.runtimeLauncher).toBe(join(root, 'apps', 'desktop', 'resources', 'runtime-launcher.cjs'))
  })

  it('keeps installed resources independent of the checkout', () => {
    const resourcesPath = resolve('installed resources')
    const paths = resolveRuntimePaths({ isPackaged: true, resourcesPath, platform: 'darwin' })
    expect(paths.dshEntry).toBe(join(resourcesPath, 'runtime.asar', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'))
    expect(paths.runtimeResolver).toBe(join(resourcesPath, 'runtime-resolver.mjs'))
    expect(paths.applicationIcon).toBe(join(resourcesPath, 'icon.png'))
  })

  it('recognizes signal termination without a numeric exit code', async () => {
    const child = Object.assign(childProcess(), { signalCode: 'SIGTERM' })
    expect(hasChildExited(child)).toBe(true)
    await expect(waitForServer('http://127.0.0.1:1', child)).rejects.toThrow('SIGTERM')
    expect(child.listenerCount('error')).toBe(0)
  })

  it('recognizes successful process exit', () => {
    expect(hasChildExited(Object.assign(childProcess(), { exitCode: 0 }))).toBe(true)
    expect(hasChildExited(childProcess())).toBe(false)
  })

  it.each([true, false])('bounds HTTP readiness when the server responds: %s', async (respond) => {
    const server = createServer((_request, response) => { if (respond) response.end('ready') })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Expected TCP listener')
    const child = childProcess()
    try {
      const result = waitForServer(`http://127.0.0.1:${address.port}`, child, { timeoutMs: 500, requestTimeoutMs: 100, retryDelayMs: 10 })
      if (respond) await result
      else await expect(result).rejects.toThrow('Timed out waiting')
      expect(child.listenerCount('error')).toBe(0)
    } finally {
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => server.close((error) => {
        if (error) reject(error)
        else resolve()
      }))
    }
  })

  it('reports a spawn failure and removes its listener', async () => {
    const child = childProcess()
    const result = waitForServer('http://127.0.0.1:1', child, { retryDelayMs: 1 })
    child.emit('error', new Error('spawn unavailable'))
    await expect(result).rejects.toThrow('spawn unavailable')
    expect(child.listenerCount('error')).toBe(0)
  })
})
