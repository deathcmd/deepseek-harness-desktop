const { pathToFileURL } = require('node:url')

const runtimeEntry = process.env.DSH_DESKTOP_RUNTIME_ENTRY
if (!runtimeEntry) {
  throw new Error('DeepSeek Harness runtime entry was not provided')
}

// Electron treats an ASAR passed as argv[1] as an application package. Keep
// this small bridge outside the archive, then import the actual CLI normally.
process.argv = [process.execPath, runtimeEntry, ...process.argv.slice(2)]
void import(pathToFileURL(runtimeEntry).href).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
