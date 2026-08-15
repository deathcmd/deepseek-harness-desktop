# DeepSeek Harness 桌面版

[English](README.md) | 中文

本包为官方 `dsh web` 应用提供 Windows、macOS 和 Linux 桌面壳。Electron 在随机回环端口启动已发布的 CLI（命令行界面）入口，并在隔离窗口中加载未经修改的 Web 客户端，因此会话、模型设置、MCP、skill（技能）、工作区、文件选择、插件和终端行为仍由官方 Harness 包负责。

## 运行时

[`apps/desktop-runtime`](../desktop-runtime) 声明生产依赖闭包。`prepare-runtime` 以 hoisted Node.js 布局部署该闭包，其中不含指向源码检出目录的 pnpm 链接，安装器将其移至其他目录后仍然有效。Electron 使用其内置 Node.js 运行时执行 CLI，原生模块与子进程资源则放在 `app.asar` 外部。

应用把 `DSH_HOME` 和 NPM 缓存存入 Electron 的单用户 `userData` 目录。开发启动前可设置 `DSH_DESKTOP_WORKSPACE` 选择初始工作区；安装版从当前用户主目录启动，并保留官方目录选择器。

关闭 Electron 时，应用会终止整个 `dsh web` 进程树，并等待其退出后再关闭。

## 开发

从仓库根目录启动桌面壳之前，先构建官方包：

```sh
pnpm install
pnpm run build
pnpm --dir apps/desktop exec electron .
```

## 打包

Windows 命令只生成交互式 NSIS 安装器。安装器使用更快的普通压缩配置，部署运行时会排除调试符号和源码地图，在所有打包文件写入完成前阻止应用启动，并创建带产品图标的桌面与开始菜单快捷方式。Windows NSIS 工具链受旧式路径长度限制，因此请从较短的检出路径构建，例如 `C:\src\deepseek-harness`。

```sh
pnpm --dir apps/desktop run package:win
```

macOS 命令会生成 DMG 和 ZIP 构建目标，且必须在 macOS 上运行。公开发行版需要进行对应平台的代码签名和公证；未签名的本地 Windows 构建可能触发 Microsoft Defender SmartScreen。

```sh
pnpm --dir apps/desktop run package:mac
```
