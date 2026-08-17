/**
 * Resolve desktop profile plugins without changing the user's installation.
 *
 * Electron exposes the shipped runtime through an ASAR virtual filesystem.
 * Node's normal ESM package resolver cannot walk from that virtual filesystem
 * into the external profile node_modules directory (and the reverse is also
 * true for profile plugins importing shipped packages).  The resolver keeps
 * Node's normal rules first, then retries from the two legitimate package
 * roots used by the desktop runtime:
 *
 *   1. the active user's profile, where third-party plugins are installed;
 *   2. the packaged runtime, where official Harness packages live.
 *
 * No files are copied, removed, or rewritten by this hook.
 */

import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const runtimeEntry = process.env.DSH_DESKTOP_RUNTIME_ENTRY
const dshHome = process.env.DSH_HOME
const profileName = process.env.DSH_DESKTOP_PROFILE || 'web'

/** A package specifier has neither a relative path nor a URL scheme. */
function isBarePackage(specifier) {
  return !specifier.startsWith('.')
    && !specifier.startsWith('/')
    && !specifier.includes(':')
}

/** Return a stable file URL that makes Node search one package root. */
function rootAnchor(root) {
  if (!root) return undefined
  // The file need not be read; its directory is what controls package lookup.
  return pathToFileURL(join(root, 'package.json')).href
}

const profileAnchor = dshHome === undefined
  ? undefined
  : rootAnchor(join(dshHome, 'profiles', profileName))

const runtimeAnchor = runtimeEntry === undefined
  ? undefined
  : pathToFileURL(runtimeEntry).href

/**
 * Keep the original error when all fallback roots reject a request. This
 * preserves Node's normal diagnostics, including the importing module URL.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (originalError) {
    if (!isBarePackage(specifier)) throw originalError

    // Third-party profile packages are intentionally resolved before the
    // packaged runtime, so a user's installed version always wins.
    if (profileAnchor !== undefined) {
      try {
        return await nextResolve(specifier, { ...context, parentURL: profileAnchor })
      } catch {
        // The package may be an official dependency instead.
      }
    }

    if (runtimeAnchor !== undefined) {
      try {
        return await nextResolve(specifier, { ...context, parentURL: runtimeAnchor })
      } catch {
        // Fall through to Node's original, more useful error below.
      }
    }

    throw originalError
  }
}
