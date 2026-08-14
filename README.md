# DeepSeek Harness Desktop

English | [中文](README.zh.md)

<p align="center">
  <img src="apps/desktop/resources/icon.png" alt="DeepSeek Harness Desktop icon" width="112">
</p>

> A desktop distribution of the open-source [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It runs the official Harness UI in its own application window instead of opening the system browser.

## Download

The current public release is [DeepSeek Harness Desktop 0.1.0-rc.6](https://github.com/deathcmd/deepseek-harness-desktop/releases/tag/desktop-v0.1.0-rc.6).

| Package | Best for | Download |
| --- | --- | --- |
| Windows x64 installer | Most Windows users. Lets you choose an install folder and creates a desktop shortcut. | [Download installer](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-v0.1.0-rc.6/DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe) |
| Windows x64 portable | Running without installing. Keep the EXE in any folder you control. | [Download portable build](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-v0.1.0-rc.6/DeepSeek-Harness-Portable-0.1.0-rc.6-win-x64.exe) |

Windows builds are currently published as a prerelease. They are self-contained: you do not need to install Node.js, pnpm, or the `dsh` command separately.

## Run

### Install and Start on Windows

1. Download the **Windows x64 installer** above.
2. Double-click `DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe`.
3. Choose the folder where you want the application installed, then let the installer finish completely.
4. Open **DeepSeek Harness** from the desktop shortcut or Start menu.
5. Configure your model provider and credentials inside the application before starting a conversation.

The application opens as a normal desktop window. Its embedded Harness service listens only on a random `127.0.0.1` port and is stopped when you close the application window. It does not launch the system browser by itself.

The installer prevents an early shortcut launch from interrupting file installation. Keep the installer open until it shows that installation is complete.

### Windows SmartScreen

The current Windows binaries are not commercially code-signed. Windows may show an unknown-publisher warning. Before selecting **More info > Run anyway**, make sure the download came from this repository's release page and verify its SHA-256 value below.

```text
E3970FD6C7B905D37EDDCF13DE5A02F56B67A3F59A8946CF3A941247DC1D4D7B  DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe
C9F45D2AEA9EFD3394235886BF349AF4870AA7EAE17014D39C69BBA5A788C306  DeepSeek-Harness-Portable-0.1.0-rc.6-win-x64.exe
```

To verify a downloaded file in PowerShell:

```powershell
Get-FileHash .\DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe -Algorithm SHA256
```

## Portable Build

The portable EXE does not use an installer or create a desktop shortcut. Download it, place it in a permanent folder such as `D:\Apps\DeepSeek Harness Desktop`, and double-click it. Do not run it from a temporary browser-download folder if you want to keep its local application data in a predictable place.

## What This Desktop Build Includes

- A standalone Electron application window for the official DeepSeek Harness Web UI.
- A bundled production runtime for `@deepseek-ai/dsh`.
- Windows x64 NSIS installer and portable executable.
- A DeepSeek desktop icon for the application, executable, and desktop shortcut.
- A startup guard that avoids installer stalls caused by opening the application before setup has finished.
- Local-only service binding; no public network port is opened by the desktop shell.

Personal API keys, model credentials, prompts, MCP configuration, and skill directories are never built into the release. Configure them locally in your own application environment.

## macOS

The repository contains macOS packaging configuration, but there is no signed or notarized macOS download yet. A macOS release must be built and verified on real macOS hardware, then code-signed and notarized before publishing a DMG or ZIP.

## Run From Source

For contributors or users who want to create their own distribution:

```sh
git clone https://github.com/deathcmd/deepseek-harness-desktop.git
cd deepseek-harness-desktop
pnpm install
pnpm run build
pnpm --dir apps/desktop run package:win
```

The Windows installer and portable EXE are written to `release/desktop/`. See [the desktop package documentation](apps/desktop/README.md) for runtime and packaging details.

## Upstream and License

This repository packages the official open-source [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) codebase for desktop use. The desktop-specific integration lives under [`apps/desktop`](apps/desktop/) and [`apps/desktop-runtime`](apps/desktop-runtime/).

The project is released under the [MIT License](LICENSE). Third-party dependencies and their licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
