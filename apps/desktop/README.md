# DeepSeek Harness Desktop

English | [中文](README.zh.md)

This package is a Windows, macOS, and Linux desktop shell around the official `dsh web` application. Electron starts the published CLI entry on a random loopback port and loads the unchanged Web client in an isolated window, so sessions, model settings, MCP, skills, workspaces, file selection, plugins, and terminal behavior remain owned by the official Harness packages.

## Runtime

[`apps/desktop-runtime`](../desktop-runtime) declares the production dependency closure. `prepare-runtime` deploys that closure with a hoisted Node.js layout, which contains no pnpm links to the source checkout and remains valid after an installer moves it to another directory. Electron runs the CLI with its bundled Node.js runtime, while native modules and child-process resources stay outside `app.asar`.

The application stores `DSH_HOME` and its npm cache under Electron's per-user `userData` directory. Set `DSH_DESKTOP_WORKSPACE` before a development launch to select its initial workspace; installed builds start in the current user's home directory and retain the official directory picker.

Closing Electron terminates the complete `dsh web` process tree and waits for it to exit before the application closes.

## Development

Build the official packages before launching the desktop shell from the repository root:

```sh
pnpm install
pnpm run build
pnpm --dir apps/desktop exec electron .
```

## Packaging

The Windows command produces the interactive NSIS installer. The installer uses a faster normal compression profile, omits debug symbols and source maps from the deployed runtime, prevents the application from starting until all packaged files are present, and creates Desktop and Start menu shortcuts with the product icon. Build from a short checkout path, such as `C:\src\deepseek-harness`, because the Windows NSIS toolchain is subject to legacy path-length limits.

```sh
pnpm --dir apps/desktop run package:win
```

The macOS command produces DMG and ZIP targets and must run on macOS. Public releases require platform-appropriate code signing and notarization; unsigned local Windows builds may trigger Microsoft Defender SmartScreen.

```sh
pnpm --dir apps/desktop run package:mac
```
