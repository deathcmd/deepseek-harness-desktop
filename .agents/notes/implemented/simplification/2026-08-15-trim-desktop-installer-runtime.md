# Agent Note: Trim desktop installer runtime

Status: implemented

English | [中文](2026-08-15-trim-desktop-installer-runtime.zh.md)

## Problem

The Windows desktop installer deployed debug symbols, TypeScript sources, and source maps beside the built official Harness runtime. Those files are not loaded by the production Electron process, but they made the runtime about 261 MB across more than 32,000 files. The build also produced an unpublished extra executable and used the highest compression profile. Installation therefore spent unnecessary time copying and decompressing data, while the Windows shortcut could retain Electron's default icon in the shell cache.

## Decision

`apps/desktop/scripts/prepare-runtime.mjs` removes `.cts`, `.map`, `.mts`, `.pdb`, and `.ts` files after `pnpm deploy` creates the production dependency closure, then packs the remaining JavaScript closure into `runtime.asar` while keeping required native files in `runtime.asar.unpacked`. The Windows package script builds only the interactive NSIS installer. Its payload is an uncompressed ZIP written directly to the target directory, which avoids both LZMA decompression and the default temporary 7z extraction followed by a second file copy. Windows packaging and the running desktop window use the tracked multi-size `resources/icon.ico`; the installer broadcasts an association-change notification after installation without forcing a global icon-cache rebuild.

## Alternatives considered

**Keep the complete deployed dependency tree.** Retaining sources, source maps, and native PDB files would preserve local post-install debugging, but a released desktop application does not use them at runtime and the installation delay outweighed that benefit.

**Use compressed installer payloads.** A compressed 7z payload produces a smaller download, but it costs CPU time and first expands into a temporary directory before copying the files to the installation directory. The Windows release instead accepts a larger download in exchange for direct ZIP installation speed.

**Exclude files only in Electron Builder.** Builder filters would leave the local runtime different from the shipped one, making direct runtime checks less representative. Pruning the deployed runtime makes the tested and packaged trees identical.

## Consequences

The shipped Windows runtime is smaller and contains fewer installation files: one runtime archive plus the limited set of native files Electron cannot load from an ASAR. Runtime stack traces no longer resolve through source maps and native PDB debugging requires a development build. The pruning list is intentionally limited to source and debug extensions; package metadata, licenses, executable resources, and built JavaScript remain in place. The packaged runtime is checked through Electron's bundled Node.js and an HTTP Web-root probe before the installer is built. The direct-install tradeoff is a substantially larger download.
