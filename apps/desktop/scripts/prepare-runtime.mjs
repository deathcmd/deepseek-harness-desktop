import { spawn } from 'node:child_process'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(desktopRoot, '../..')
const runtimeRoot = join(desktopRoot, 'runtime')

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
  '--config.nodeLinker=hoisted',
  '--config.confirmModulesPurge=false',
  '--config.strictDepBuilds=false',
  '--filter', '@deepseek-ai/dsh-desktop-runtime', 'deploy', '--prod', runtimeRoot,
])

const runtimePackage = join(runtimeRoot, 'package.json')
const packageData = JSON.parse(await readFile(runtimePackage, 'utf8'))
packageData.private = true
await writeFile(runtimePackage, `${JSON.stringify(packageData, null, 2)}\n`)

console.log(`Desktop runtime prepared at ${runtimeRoot}`)
