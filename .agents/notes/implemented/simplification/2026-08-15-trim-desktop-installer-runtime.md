# Agent Note: Trim desktop installer runtime

Status: implemented

English | [中文](2026-08-15-trim-desktop-installer-runtime.zh.md)

## Problem

The Windows desktop installer deployed debug symbols, TypeScript sources, and source maps beside the built official Harness runtime. Those files are not loaded by the production Electron process, but they made the runtime about 261 MB across more than 32,000 files. The installer also built an unpublished portable executable and used the highest compression profile. Installation therefore spent unnecessary time copying and decompressing data, while the Windows shortcut could retain Electron's default icon in the shell cache.

## Decision

`apps/desktop/scripts/prepare-runtime.mjs` removes `.cts`, `.map`, `.mts`, `.pdb`, and `.ts` files after `pnpm deploy` creates the production dependency closure. The Windows package script builds only the interactive NSIS installer, and Electron Builder uses its normal compression profile. Windows packaging and the running desktop window use the tracked multi-size `resources/icon.ico`; the installer clears the shell icon cache and broadcasts an association-change notification after installation.

## Alternatives considered

**Keep the complete deployed dependency tree.** Retaining sources, source maps, and native PDB files would preserve local post-install debugging, but a released desktop application does not use them at runtime and the installation delay outweighed that benefit.

**Use uncompressed installer payloads.** Store compression would minimize extraction CPU time but would increase the download substantially. Normal compression keeps the installer practical to distribute while avoiding the slowest compression setting.

**Exclude files only in Electron Builder.** Builder filters would leave the local runtime different from the shipped one, making direct runtime checks less representative. Pruning the deployed runtime makes the tested and packaged trees identical.

## Consequences

The shipped Windows runtime is smaller and contains fewer files to install. Runtime stack traces no longer resolve through source maps and native PDB debugging requires a development build. The pruning list is intentionally limited to source and debug extensions; package metadata, licenses, executable resources, and built JavaScript remain in place. The packaged runtime is checked with the official `dsh --help` entry point before the installer is built.
