import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

/**
 * Resolve shipped resources or the source checkout from the desktop src directory.
 * @param {{ isPackaged: true, resourcesPath: string, sourceDirectory?: string, platform: NodeJS.Platform } | { isPackaged: false, resourcesPath?: string, sourceDirectory: string, platform: NodeJS.Platform }} options Desktop installation paths and target platform.
 * @returns {{ runtimeRoot: string, runtimeLauncher: string, runtimeResolver: string, dshEntry: string, applicationIcon: string }} Absolute paths used to start the Harness runtime.
 */
export function resolveRuntimePaths({ isPackaged, resourcesPath, sourceDirectory, platform }) {
  const runtimeRoot = isPackaged
    ? join(resourcesPath, 'runtime.asar')
    : join(sourceDirectory, '..', '..', '..')
  const resourceRoot = isPackaged ? resourcesPath : join(sourceDirectory, '..', 'resources')
  return {
    runtimeRoot,
    runtimeLauncher: join(resourceRoot, 'runtime-launcher.cjs'),
    runtimeResolver: join(resourceRoot, 'runtime-resolver.mjs'),
    dshEntry: isPackaged
      ? join(runtimeRoot, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
      : join(runtimeRoot, 'apps', 'cli', 'lib', 'bin.js'),
    applicationIcon: join(resourceRoot, platform === 'win32' ? 'icon.ico' : 'icon.png'),
  }
}

/**
 * Check both ways a Node child process can finish.
 * @param {import('node:child_process').ChildProcess} child The owned runtime process.
 * @returns {boolean} Whether an exit code or terminating signal has been recorded.
 */
export function hasChildExited(child) {
  return child.exitCode !== null || child.signalCode !== null
}

/**
 * Wait for HTTP readiness without outliving a stalled probe or failed child.
 * @param {string} url The loopback Web application URL.
 * @param {import('node:child_process').ChildProcess} child The owned runtime process.
 * @param {{ timeoutMs?: number, requestTimeoutMs?: number, retryDelayMs?: number }} options Probe deadline, request timeout, and retry interval in milliseconds.
 * @returns {Promise<void>} Resolves on HTTP success; rejects on exit or deadline.
 */
export async function waitForServer(url, child, {
  timeoutMs = 90_000, requestTimeoutMs = 1_000, retryDelayMs = 250,
} = {}) {
  const deadline = Date.now() + timeoutMs
  let lastError
  let spawnError
  const onError = error => { spawnError = error }
  child.on('error', onError)
  try {
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError
      if (hasChildExited(child)) {
        throw new Error(`The official dsh web process exited with ${child.signalCode ?? `code ${child.exitCode}`}`)
      }
      try {
        const remaining = Math.max(1, deadline - Date.now())
        const response = await fetch(url, {
          signal: AbortSignal.timeout(Math.min(requestTimeoutMs, remaining)),
        })
        await response.body?.cancel()
        if (response.ok) return
        lastError = new Error(`dsh web returned HTTP ${response.status}`)
      } catch (error) {
        lastError = error
      }
      await delay(Math.max(0, Math.min(retryDelayMs, deadline - Date.now())))
    }
    throw new Error(`Timed out waiting for ${url}: ${lastError?.message || 'unknown error'}`)
  } finally {
    child.off('error', onError)
  }
}
