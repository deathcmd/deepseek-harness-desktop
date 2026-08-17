import { spawn } from 'node:child_process'
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPackageWithOptions } from '@electron/asar'

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(desktopRoot, '../..')
const runtimeRoot = join(desktopRoot, 'runtime')
const runtimeArchive = join(desktopRoot, 'runtime.asar')
const runtimeUnpacked = join(desktopRoot, 'runtime.asar.unpacked')

const disposableExtensions = new Set(['.cts', '.map', '.mts', '.pdb', '.ts'])

/** Remove debug/source files that are never loaded by the built production runtime. */
async function pruneRuntime(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      await pruneRuntime(entryPath)
      return
    }
    if (disposableExtensions.has(extname(entry.name).toLowerCase())) {
      await rm(entryPath, { force: true })
    }
  }))
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        CI: 'true',
        npm_config_local_prefix: repositoryRoot,
      },
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolvePromise()
      else reject(new Error(`${command} exited with ${signal || code}`))
    })
  })
}

await rm(runtimeRoot, { recursive: true, force: true })
await run(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', [
  '--config.node-linker=hoisted',
  '--config.confirm-modules-purge=false',
  '--config.strict-dep-builds=false',
  '--config.inject-workspace-packages=true',
  '--config.link-workspace-packages=true',
  '--filter', '@deepseek-ai/dsh-desktop-runtime', 'deploy', '--prod', runtimeRoot,
])

const runtimePackage = join(runtimeRoot, 'package.json')
const packageData = JSON.parse(await readFile(runtimePackage, 'utf8'))
packageData.private = true
await writeFile(runtimePackage, `${JSON.stringify(packageData, null, 2)}\n`)
await run(process.execPath, [
  join(runtimeRoot, 'node_modules', '@deepseek-ai', 'dsh-subprocess-local', 'scripts', 'ensure-spawn-helper.mjs'),
])
await rm(join(runtimeRoot, 'pnpm-lock.yaml'), { force: true })
await pruneRuntime(runtimeRoot)
await run(process.execPath, [
  join(runtimeRoot, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'),
  '--help',
])

await rm(runtimeArchive, { force: true })
await rm(runtimeUnpacked, { recursive: true, force: true })
await createPackageWithOptions(runtimeRoot, runtimeArchive, {
  // Native addons and subprocess helpers must be real files beside the ASAR.
  unpack: '**/{*.node,*.dll,*.exe,*.so,*.dylib,spawn-helper}',
})
await rm(runtimeRoot, { recursive: true, force: true })

console.log(`Desktop runtime archive prepared at ${runtimeArchive}`)
