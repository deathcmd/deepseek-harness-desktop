# Agent Note: 精简桌面安装器运行时

Status: implemented

[English](2026-08-15-trim-desktop-installer-runtime.md) | 中文

## 问题

Windows 桌面安装器将调试符号、TypeScript 源码和 source map 与构建完成的官方 Harness 运行时一同部署。生产 Electron 进程不会加载这些文件，但它们使运行时达到约 261 MB、超过 32,000 个文件。构建流程还会生成不会公开发布的额外可执行文件，并使用最高压缩配置。因此安装会在不必要的文件复制和解压上花费时间，Windows 快捷方式也可能在 Shell 缓存中保留 Electron 默认图标。

## 决策

`apps/desktop/scripts/prepare-runtime.mjs` 在 `pnpm deploy` 建立生产依赖闭包后，移除 `.cts`、`.map`、`.mts`、`.pdb` 和 `.ts` 文件，再把剩余 JavaScript 依赖闭包打入 `runtime.asar`，并把必须真实存在的原生文件保留在 `runtime.asar.unpacked`。Windows 打包脚本只构建交互式 NSIS 安装器。它使用无压缩 ZIP 载荷直接写入目标目录，同时避免 LZMA 解压和默认 7z 的临时解压后第二次文件复制。Windows 打包和运行中的桌面窗口都使用受版本控制的多尺寸 `resources/icon.ico`；安装器仅在完成后广播关联变更通知，不会强制全局重建图标缓存。

## 考虑过的替代方案

**保留完整的已部署依赖树。** 保留源码、source map 和原生 PDB 文件可以支持安装后的本地调试，但发布的桌面应用在运行时不会使用它们，安装等待时间不值得为此付出。

**使用压缩的安装器载荷。** 压缩 7z 载荷会减小下载量，但消耗 CPU，并且会先展开到临时目录后再复制到安装目录。Windows 发行版改为接受更大的下载量，换取 ZIP 直接安装速度。

**只在 Electron Builder 中排除文件。** Builder 过滤会让本地运行时与最终发布版本不同，使直接运行时检查失去代表性。在已部署运行时内裁剪可让测试树和打包树保持一致。

## 后果

发布的 Windows 运行时更小，需要安装的文件更少：一个运行时归档，加上 Electron 无法从 ASAR 加载的少量原生文件。运行时堆栈不再能通过 source map 映射到源码，原生 PDB 调试需要使用开发构建。裁剪列表有意仅限于源码和调试扩展名；包元数据、许可证、可执行资源和构建后的 JavaScript 均会保留。打包安装器前，会通过 Electron 内置 Node.js 以及 HTTP Web 根页面探针检查打包运行时。直接安装的代价是下载包明显变大。
