# Agent Note: 自包含桌面发行版

Status: implemented

[English](2026-08-14-self-contained-desktop-distribution.md) | 中文

## Problem

DeepSeek Harness 通过 `dsh web` 提供完整图形应用，但桌面用户需要无需另外安装 Node.js 或 pnpm 的可安装应用。桌面发行版必须保留官方 Web 组合，而不是开发另一套 UI，导致会话、模型配置、MCP、skill（技能）、工作区行为、插件和终端集成逐渐分化。

monorepo 中的包依赖工作区关系、对等依赖（peer dependency）、原生模块与子进程资源。pnpm 部署树还可能包含链接，其 Windows junction 目标带有构建检出目录路径，导致安装器只能在构建机器上运行，搬到其他位置后即失效。

## Decision

[`apps/desktop`](../../../../apps/desktop/README.md) 是 Electron 壳，它使用 Electron 内置的 Node.js 运行时启动已发布的 `@deepseek-ai/dsh` CLI（命令行界面）入口，将 `dsh web` 绑定至随机回环端口，等待成功的 HTTP 响应，然后在沙箱化 renderer 中加载未经修改的 Web 应用。该发行版有意复用 [GUI 分层决策](../architecture/2026-07-19-gui-layering-and-rpc-protocol.md)中描述的 Web 载体；桌面壳不添加 IPC 客户端，也不重新装配 Harness 插件。

`apps/desktop-runtime` 是仅含 manifest（元数据清单）的部署根，声明官方 CLI 与随应用发布的 Harness 包。准备脚本使用 pnpm 的 legacy hoisted 部署布局，移除非生产源码产物后把无链接依赖闭包写入独立的 `runtime.asar`。原生 addon 与子进程 helper 放在相邻的 `runtime.asar.unpacked`；一个很小的外置启动器使用 Electron 内置 Node.js 从归档导入 CLI。运行时链接不会指向源码检出目录。安装状态与 NPM 缓存位于 Electron 的单用户数据目录中，初始工作区则保持为用户主目录，除非 `DSH_DESKTOP_WORKSPACE` 覆盖该设置。

桌面[运行时辅助函数](../../../../apps/desktop/src/runtime.mjs)区分源码检出根目录与安装归档，并在启动期限内限制每次 HTTP 就绪探测的等待时间。停滞的 HTTP 连接不能让启动无限等待。数字退出码与终止信号都表示子进程已经结束。

[发布规则](../../../../scripts/publication-payload.ts)显式包含两个桌面源码模块，并对 manifest 与已打包的 tarball 应用相同的包级例外。其他源码条目和所有 source map 仍禁止发布。Knip 将外置启动器与解析器视为进程入口，并将仅含 manifest 的部署工作区排除在导入使用分析之外，与 Python 部署工作区保持一致；打包与运行时检查仍会验证其依赖。

应用关闭时会终止官方 CLI 的完整进程树，并等待其退出后再关闭 Electron。Windows 使用 `taskkill /T`；macOS 和 Linux 使用独立进程组，先进行有时限的优雅关闭，随后强制终止。

Electron Builder 使用显式产品图标定义交互式 Windows NSIS 安装器和 macOS DMG 安装器。Windows 安装器把完整应用载荷存为无压缩 ZIP 并直接写入所选安装目录，避免默认 7z 的临时解压再复制步骤。它在替换应用文件前把自身进程记录到临时启动锁；只要该安装器仍在运行，已打包的桌面进程就拒绝启动，避免解压早期写入的可执行文件锁住其余文件。安装完成后会删除该锁并广播轻量的 Shell 关联刷新。固定的 app ID 与 `deleteAppDataOnUninstall: false` 使正常升级只覆盖程序文件而不会删除 Electron 用户数据。平台签名与公证仍由发行流水线负责。

## Verification

- 部署的运行时不含符号链接或 Windows junction；Electron 内置 Node.js 可从 `runtime.asar` 导入官方 CLI，并通过回环 HTTP 提供 Web 根页面。
- 取消临时构建盘符映射后，解包的 Windows 应用仍能启动其打包 CLI；关闭窗口后不会留下 Harness 进程树。
- 安装期间启动已打包应用时，它会在启动 CLI 前退出；安装后的可执行文件、应用窗口与快捷方式使用产品图标。
- 签名公开发行前，macOS 打包与运行时验证在 macOS 上执行；Windows 主机无法验证原生 macOS 产物。

## Alternatives considered

**为 Electron 重新实现图形客户端。** 这种做法会复制产品行为，并为每项官方 Web 功能建立第二份兼容性义务，因此桌面壳改为嵌入现有应用。

**打包 pnpm 默认部署布局。** Electron Builder 复制其中的 Windows junction 后，目标可能编码检出目录的绝对路径。每次应用启动时重建 junction 会给安装文件增加写入操作和失败模式；hoisted 无链接部署无需这种运行时修复。

**先构建进程内或 IPC 载体。** 协议支持其他载体，但单独的桌面装配无法以最短路径提供与官方完全一致的行为。原生集成需要 IPC 并能负责验证其与 Web 组合的一致性时，仍可引入 IPC 载体。

**要求用户单独安装 CLI。** 这种做法会缩小产物，但桌面启动将依赖兼容的外部 Node.js、pnpm、包版本与环境。安装器改为自行提供一套经过测试的运行时。

## Consequences

桌面应用不复制产品代码，并随官方 Web 与 CLI 包同步；安装也不依赖源码检出目录或开发工具链。代价是产物达到数百 MB，因为 Electron、完整 CLI 依赖闭包、原生模块与 Web 资源需要一同发布。回环服务器仅在桌面应用生命周期内存在，并只监听 `127.0.0.1`；桌面原生 IPC 与原生对话框集成推迟到足以证明需要单独载体时再实现。未签名的开发产物可能触发操作系统信任警告，各公开平台构建也都需要独立签名和原生验证。
