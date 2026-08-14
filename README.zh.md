# DeepSeek Harness Desktop

[返回中文主页](README.md) | 中文

这是基于官方开源 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 制作的 Windows 桌面版。它会在独立应用窗口中运行 Harness，不会自动打开系统浏览器。

## 下载

当前版本：[DeepSeek Harness Desktop 0.1.0-rc.6](https://github.com/deathcmd/deepseek-harness-desktop/releases/tag/desktop-v0.1.0-rc.6)

**Windows x64 安装程序：**

[点击下载 DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-v0.1.0-rc.6/DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe)

安装程序已经包含运行所需的内容，不需要另外安装 Node.js、pnpm 或 `dsh` 命令行。

<a id="run"></a>

## Windows 安装和第一次使用

1. 点击上面的下载链接，等待安装程序下载完成。
2. 双击 `DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe`。
3. 选择安装目录，例如 `D:\DeepSeek Harness Desktop`。
4. 等安装器明确显示安装完成后，再打开桌面上的 **DeepSeek Harness** 图标。
5. 应用打开后，在窗口内配置模型服务商和自己的凭据，然后开始对话。

应用会像普通 Windows 软件一样打开一个独立窗口。内部服务只监听本机 `127.0.0.1` 地址，关闭应用窗口时会停止；程序不会自行打开浏览器。

安装过程中不要提前双击刚出现的桌面快捷方式。安装器已经加入启动保护，但仍应等安装完成后再启动应用。

### Windows “未知发布者”提示

当前安装程序没有商业代码签名，Windows SmartScreen 可能显示“未知发布者”。点击“更多信息”或“仍要运行”前，请确认文件来自本仓库的 Release 页面，并核对 SHA-256：

```text
E3970FD6C7B905D37EDDCF13DE5A02F56B67A3F59A8946CF3A941247DC1D4D7B  DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe
```

PowerShell 校验命令：

```powershell
Get-FileHash .\DeepSeek-Harness-Setup-0.1.0-rc.6-win-x64.exe -Algorithm SHA256
```

## 这个桌面版包含什么

- 官方 DeepSeek Harness 界面的独立 Electron 应用窗口。
- 已打包的 `@deepseek-ai/dsh` 生产运行时。
- Windows x64 安装程序和桌面快捷方式。
- 应用、EXE、窗口和桌面快捷方式统一使用 DeepSeek 图标。
- 安装未结束时阻止提前启动，避免安装文件被占用。
- 服务只绑定本机地址，不会由桌面壳开放公网端口。

发布包不会内置个人 API Key、模型凭据、全局提示词、MCP 配置或 skill 目录。请在自己的本地应用环境中配置这些内容。

## macOS

仓库中已经保留 macOS 打包配置，但暂时没有 macOS 下载包。正式发布前，需要在真实 macOS 设备上完成构建、代码签名、公证和运行验证。

<a id="run-from-source"></a>

## 从源码运行

开发者可以这样构建桌面版：

```sh
git clone https://github.com/deathcmd/deepseek-harness-desktop.git
cd deepseek-harness-desktop
pnpm install
pnpm run build
pnpm --dir apps/desktop run package:win
```

运行时和打包细节见 [桌面包说明](apps/desktop/README.md)。

## 上游与许可证

本仓库基于官方开源 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 制作桌面发行版。桌面层代码位于 [`apps/desktop`](apps/desktop/) 和 [`apps/desktop-runtime`](apps/desktop-runtime/)。

项目使用 [MIT License](LICENSE)。第三方依赖及许可证清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
