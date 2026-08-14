# DeepSeek Harness Desktop

[English](README.md) | 中文

<p align="center">
  <img src="apps/desktop/resources/icon.png" alt="DeepSeek Harness Desktop 图标" width="112">
</p>

> 基于开源 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 制作的桌面版。它会在独立应用窗口中运行官方 Harness 界面，不会自动打开系统浏览器。

## 下载

当前公开版本为 [DeepSeek Harness Desktop 0.1.0-rc.6](https://github.com/deathcmd/deepseek-harness-desktop/releases/tag/desktop-v0.1.0-rc.6)。

| 文件 | 适合谁 | 下载 |
| --- | --- | --- |
| Windows x64 安装版 | 大多数 Windows 用户。可选择安装目录，并自动创建桌面快捷方式。 | [下载安装程序](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-v0.1.0-rc.6/DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe) |
| Windows x64 便携版 | 不想安装、希望放在指定文件夹直接运行的用户。 | [下载便携版](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-v0.1.0-rc.6/DeepSeek-Harness-Portable-0.1.0-rc.6-win-x64.exe) |

Windows 版本目前为预发布版，但它是完整独立包：不需要另装 Node.js、pnpm，也不需要单独安装 `dsh` 命令行。

## 运行

### Windows 安装和第一次启动

1. 下载上面的 **Windows x64 安装版**。
2. 双击 `DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe`。
3. 选择想安装到的目录，然后等待安装器完整结束。
4. 在桌面或开始菜单中打开 **DeepSeek Harness**。
5. 第一次使用时，在应用内配置模型服务商和自己的凭据，再开始对话。

应用会作为普通桌面窗口打开。内部 Harness 服务只监听随机的 `127.0.0.1` 本机端口，关闭应用窗口时会一并停止；程序不会自行打开系统浏览器。

安装过程中请不要提前双击刚出现的桌面快捷方式，等安装器提示完成后再打开。程序已经加入启动保护，避免提前打开导致安装文件被占用。

### Windows SmartScreen 提示

当前 Windows 文件没有商业代码签名，Windows 可能显示“未知发布者”。点击 **更多信息 > 仍要运行** 前，请确认文件来自本仓库的 Release 页面，并校验下面的 SHA-256。

```text
E3970FD6C7B905D37EDDCF13DE5A02F56B67A3F59A8946CF3A941247DC1D4D7B  DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe
C9F45D2AEA9EFD3394235886BF349AF4870AA7EAE17014D39C69BBA5A788C306  DeepSeek-Harness-Portable-0.1.0-rc.6-win-x64.exe
```

在 PowerShell 中校验下载的安装包：

```powershell
Get-FileHash .\DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe -Algorithm SHA256
```

## 便携版怎么用

便携版不需要安装，也不会创建桌面快捷方式。下载后把它放进一个固定目录，例如 `D:\Apps\DeepSeek Harness Desktop`，再双击运行即可。不要长期从浏览器的临时下载目录运行，这样本地应用数据的位置会比较难管理。

## 这个桌面版包含什么

- 官方 DeepSeek Harness Web UI 的独立 Electron 应用窗口。
- 已打包的 `@deepseek-ai/dsh` 生产运行时。
- Windows x64 NSIS 安装程序和便携 EXE。
- 应用、EXE、窗口和桌面快捷方式统一使用 DeepSeek 桌面图标。
- 安装未结束时阻止提前启动，避免安装卡住。
- 服务只绑定本机地址，桌面壳不会开放公网端口。

发布包不会内置个人 API Key、模型凭据、全局提示词、MCP 配置或 skill 目录。请在自己的本地应用环境中配置这些内容。

## macOS

仓库中已经有 macOS 打包配置，但暂时没有已签名、公证的 macOS 下载包。正式发布 DMG 或 ZIP 前，必须在真实 macOS 设备上完成构建、代码签名、公证和运行验证。

## 从源码运行

适合开发者，或希望自行制作安装包的用户：

```sh
git clone https://github.com/deathcmd/deepseek-harness-desktop.git
cd deepseek-harness-desktop
pnpm install
pnpm run build
pnpm --dir apps/desktop run package:win
```

生成的 Windows 安装版和便携版会放在 `release/desktop/`。运行时和打包细节见 [桌面包说明](apps/desktop/README.md)。

## 上游与许可证

本仓库基于官方开源 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 制作桌面发行版。桌面层的代码位于 [`apps/desktop`](apps/desktop/) 和 [`apps/desktop-runtime`](apps/desktop-runtime/)。

项目使用 [MIT License](LICENSE)。第三方依赖及许可证清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
