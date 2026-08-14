# Agent Note: Self-contained desktop distribution

Status: implemented

English | [中文](2026-08-14-self-contained-desktop-distribution.zh.md)

## Problem

DeepSeek Harness exposes its complete graphical application through `dsh web`, but desktop users need an installable application that does not require a separate Node.js or pnpm installation. A desktop release must preserve the official Web composition instead of developing a second UI whose sessions, model configuration, MCP, skills, workspace behavior, plugins, and terminal integration can drift.

The monorepo packages rely on workspace relationships, peer dependencies, native modules, and child-process resources. A pnpm deploy tree can also contain links whose Windows junction targets include the build checkout path, which makes an installer work on the build machine and fail after relocation.

## Decision

[`apps/desktop`](../../../../apps/desktop/README.md) is an Electron shell that starts the published `@deepseek-ai/dsh` CLI entry with Electron's bundled Node.js runtime, binds `dsh web` to a random loopback port, waits for a successful HTTP response, and loads the unchanged Web application in a sandboxed renderer. This distribution deliberately reuses the Web carrier described by the [GUI layering decision](../architecture/2026-07-19-gui-layering-and-rpc-protocol.md); the shell does not add an IPC client or reassemble Harness plugins.

`apps/desktop-runtime` declares the production dependency closure required by the official CLI. The preparation script uses pnpm's hoisted deployment layout and packages the resulting real directories outside `app.asar`; no runtime link refers to the source checkout. Installed state and the NPM cache live under Electron's per-user data directory, while the initial workspace remains the user's home directory unless `DSH_DESKTOP_WORKSPACE` overrides it.

Application shutdown terminates the complete official CLI process tree and waits for exit before Electron closes. Windows uses `taskkill /T`; macOS and Linux use a dedicated process group with a bounded graceful shutdown followed by forced termination.

Electron Builder defines an interactive Windows NSIS installer, a Windows portable executable, and macOS DMG and ZIP targets with an explicit product icon. The Windows installer records its process in a temporary launch lock before it replaces application files; a packaged desktop process refuses to start while that installer remains alive, so an executable written early in extraction cannot lock the remaining files. Completing installation removes the lock and refreshes the Windows icon cache. Platform signing and notarization remain release-pipeline responsibilities.

## Verification

- The deployed runtime contains no symbolic links or Windows junctions, starts the official CLI directly, and serves the Web root over loopback HTTP.
- The unpacked Windows application and the portable executable start their packaged CLI after the temporary build-drive mapping is removed; closing the window leaves no Harness process tree.
- A packaged application launched during installation exits before starting the CLI, and the installed executable, application window, and shortcuts use the product icon.
- macOS packaging and runtime verification run on macOS before a signed public release; a Windows host cannot validate the native macOS artifact.

## Alternatives considered

**Reimplement the graphical client for Electron.** This duplicates product behavior and creates a second compatibility obligation for every official Web feature, so the desktop shell embeds the existing application instead.

**Package the default pnpm deploy layout.** Its Windows junctions can encode the checkout's absolute path after Electron Builder copies them. Rebuilding junctions during every application launch adds mutation and failure modes to installed files; a hoisted link-free deployment avoids that runtime repair.

**Build an in-process or IPC carrier first.** The protocol supports another carrier, but a separate desktop assembly would not provide the shortest path to identical official behavior. An IPC carrier remains appropriate when a native integration requires it and owns verification against the Web composition.

**Require users to install the CLI separately.** This reduces artifact size but makes desktop startup depend on a compatible external Node.js, pnpm, package version, and environment. The installer instead owns one tested runtime.

## Consequences

The desktop application follows the official Web and CLI packages without copying their product code, and installation is independent of the source checkout and developer toolchain. The cost is a several-hundred-megabyte artifact because Electron, the full CLI dependency closure, native modules, and Web assets ship together. The loopback server exists only for the lifetime of the desktop application and listens on `127.0.0.1`; desktop-native IPC and native dialog integrations are deferred until they justify a separate carrier. Unsigned development artifacts may produce operating-system trust warnings, and each public platform build requires its own signing and native verification.
