import { app, BrowserWindow, dialog, shell } from 'electron'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isPackaged = app.isPackaged
const runtimeRoot = isPackaged
  ? join(process.resourcesPath, 'runtime')
  : join(__dirname, '..', '..')
const dshEntry = isPackaged
  ? join(runtimeRoot, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
  : join(runtimeRoot, 'apps', 'cli', 'lib', 'bin.js')
const applicationIconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
const applicationIcon = isPackaged
  ? join(process.resourcesPath, applicationIconName)
  : join(__dirname, '..', 'resources', applicationIconName)
const defaultWorkspace = process.env.DSH_DESKTOP_WORKSPACE || app.getPath('home')

let mainWindow
let dshProcess
let shuttingDown = false
let shutdownComplete = false

if (process.platform === 'win32') app.setAppUserModelId('ai.deepseek.harness')

/** Return whether the current Windows installer still owns its launch lock. */
function installerIsRunning() {
  const lockPath = join(app.getPath('temp'), 'ai.deepseek.harness.installing')
  let contents
  try {
    contents = readFileSync(lockPath, 'utf8')
  } catch {
    return false
  }
  const installerPid = Number.parseInt(contents.trim(), 10)
  if (!Number.isSafeInteger(installerPid) || installerPid <= 0) return false
  try {
    process.kill(installerPid, 0)
    return true
  } catch {
    return false
  }
}

/** Reserve an available loopback port before starting the official Web host. */
function reservePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen({ host: '127.0.0.1', port: 0 }, () => {
      const address = server.address()
      if (address === null || typeof address === 'string') {
        server.close()
        reject(new Error('Unable to determine the reserved desktop port'))
        return
      }
      const port = address.port
      server.close((error) => error ? reject(error) : resolve(port))
    })
  })
}

/** Wait until the official Web server returns a successful response. */
async function waitForServer(url, child) {
  const deadline = Date.now() + 90_000
  let lastError
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`The official dsh web process exited with code ${child.exitCode}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) return
      lastError = new Error(`dsh web returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || 'unknown error'}`)
}

async function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null) return true
  return new Promise((resolve) => {
    const finish = (exited) => {
      clearTimeout(timer)
      child.off('exit', onExit)
      child.off('error', onError)
      resolve(exited)
    }
    const onExit = () => finish(true)
    const onError = () => finish(true)
    const timer = setTimeout(() => finish(false), timeoutMs)
    child.once('exit', onExit)
    child.once('error', onError)
  })
}

function waitForTaskkill(killer, fallback) {
  return new Promise((resolve) => {
    killer.once('exit', resolve)
    killer.once('error', () => {
      fallback?.()
      resolve()
    })
  })
}

/** Stop the official Harness process tree and wait for it to exit. */
async function stopDsh() {
  const child = dshProcess
  if (!child || child.exitCode !== null) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      windowsHide: true,
      stdio: 'ignore',
    })
    await waitForTaskkill(killer, () => child.kill())
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      child.kill('SIGTERM')
    }
  }
  if (await waitForExit(child, 10_000)) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      windowsHide: true,
      stdio: 'ignore',
    })
    await waitForTaskkill(killer)
  } else {
    try {
      process.kill(-child.pid, 'SIGKILL')
    } catch {
      child.kill('SIGKILL')
    }
  }
  await waitForExit(child, 3_000)
}

/** Spawn the official CLI and attach the unchanged Web application. */
async function startHarness() {
  if (!existsSync(dshEntry)) {
    throw new Error(`The built official Harness entry was not found: ${dshEntry}`)
  }

  const port = await reservePort()
  const dataRoot = join(app.getPath('userData'), 'dsh-home')
  const cacheRoot = join(app.getPath('userData'), 'npm-cache')
  mkdirSync(dataRoot, { recursive: true })
  mkdirSync(cacheRoot, { recursive: true })

  const environment = {
    ...process.env,
    DSH_HOME: dataRoot,
    DSH_DESKTOP: '1',
    npm_config_cache: cacheRoot,
  }
  const args = [dshEntry, 'web', '--host', '127.0.0.1', '--port', String(port)]
  dshProcess = spawn(process.execPath, args, {
    cwd: defaultWorkspace,
    detached: process.platform !== 'win32',
    env: {
      ...environment,
      ELECTRON_RUN_AS_NODE: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  dshProcess.stdout?.on('data', (chunk) => process.stdout.write(`[dsh] ${chunk}`))
  dshProcess.stderr?.on('data', (chunk) => process.stderr.write(`[dsh] ${chunk}`))
  dshProcess.once('error', (error) => {
    if (!shuttingDown) dialog.showErrorBox('DeepSeek Harness failed to start', error.message)
  })

  const url = `http://127.0.0.1:${port}`
  await waitForServer(url, dshProcess)
  return url
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    title: 'DeepSeek Harness',
    icon: applicationIcon,
    autoHideMenuBar: process.platform !== 'darwin',
    backgroundColor: '#0f1115',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  const url = await startHarness()
  await mainWindow.loadURL(url)
}

app.whenReady().then(async () => {
  if (process.platform === 'win32' && isPackaged && installerIsRunning()) {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'DeepSeek Harness is installing',
      message: 'DeepSeek Harness is still being installed.',
      detail: 'Wait for the installer to finish, then open the application again.',
    })
    app.quit()
    return
  }
  try {
    await createMainWindow()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    dialog.showErrorBox('DeepSeek Harness failed to start', message)
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createMainWindow()
})

app.on('before-quit', (event) => {
  if (shutdownComplete) return
  event.preventDefault()
  if (shuttingDown) return
  shuttingDown = true
  void stopDsh().finally(() => {
    shutdownComplete = true
    app.quit()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
