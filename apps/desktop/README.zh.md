# DeepSeek Harness 桌面版

[English](README.md) | 中文

本包为官方 `dsh web` 应用提供 Windows、macOS 和 Linux 桌面壳。Electron 在随机回环端口启动已发布的 CLI（命令行界面）入口，并在隔离窗口中加载未经修改的 Web 客户端，因此会话、模型设置、MCP、skill（技能）、工作区、文件选择、插件和终端行为仍由官方 Harness 包负责。

## 运行时

[`apps/desktop-runtime`](../desktop-runtime) 声明生产依赖闭包。`prepare-runtime` 以 hoisted Node.js 布局部署该闭包，其中不含指向源码检出目录的 pnpm 链接，安装器将其移至其他目录后仍然有效。部署树经裁剪后被打入独立的 `runtime.asar`；必须真实落盘的原生模块和子进程资源位于相邻的 `runtime.asar.unpacked`。小型外置启动桥接器从 Electron 内置 Node.js 导入该归档中的官方 CLI，因此最终用户无需安装系统 Node.js。

应用把 `DSH_HOME` 和 NPM 缓存存入 Electron 的单用户 `userData` 目录。开发启动前可设置 `DSH_DESKTOP_WORKSPACE` 选择初始工作区；安装版从当前用户主目录启动，并保留官方目录选择器。

关闭 Electron 时，应用会终止整个 `dsh web` 进程树，并等待其退出后再关闭。

源码启动从检出根目录解析 `apps/cli/lib/bin.js`；安装版启动从 `runtime.asar` 内解析 CLI。就绪探测在 90 秒启动期限内采用一秒单次请求超时；进程返回退出码或被信号终止时，等待随即结束。

## 开发

从仓库根目录启动桌面壳之前，先构建官方包：

```sh
pnpm install
pnpm run build
pnpm --dir apps/desktop exec electron .
```

## 打包

Windows 命令只生成交互式 NSIS 安装器。运行时部署会排除调试符号和源码地图；生产安装器将整个应用制作为无压缩 ZIP，并由 NSIS 直接写入安装目录，避免默认 7z 的“临时解压再复制”双重写入。代价是下载包更大，但 SSD 上的安装通常会在数秒内完成。安装器在所有文件写入完成前阻止应用启动，创建带产品图标的桌面与开始菜单快捷方式，并保持同一 `appId`、不删除 Electron 用户数据，因此正常升级只覆盖程序文件而保留 `DSH_HOME`、MCP、skill、提示词、凭据和会话。Windows NSIS 工具链受旧式路径长度限制，因此请从较短的检出路径构建，例如 `C:\src\deepseek-harness`。

```sh
pnpm --dir apps/desktop run package:win
```

macOS 命令会生成可安装的 DMG，且必须在 macOS 上运行。公开发行版需要进行对应平台的代码签名和公证；未签名的本地 Windows 构建可能触发 Microsoft Defender SmartScreen。

```sh
pnpm --dir apps/desktop run package:mac
```
