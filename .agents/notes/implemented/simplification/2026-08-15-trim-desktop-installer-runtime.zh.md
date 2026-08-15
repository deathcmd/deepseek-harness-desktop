# Agent Note: 精简桌面安装器运行时

Status: implemented

[English](2026-08-15-trim-desktop-installer-runtime.md) | 中文

## 问题

Windows 桌面安装器将调试符号、TypeScript 源码和 source map 与构建完成的官方 Harness 运行时一同部署。生产 Electron 进程不会加载这些文件，但它们使运行时达到约 261 MB、超过 32,000 个文件。安装器还会构建不会公开发布的便携式可执行文件，并使用最高压缩配置。因此安装会在不必要的文件复制和解压上花费时间，Windows 快捷方式也可能在 Shell 缓存中保留 Electron 默认图标。

## 决策

`apps/desktop/scripts/prepare-runtime.mjs` 在 `pnpm deploy` 建立生产依赖闭包后，移除 `.cts`、`.map`、`.mts`、`.pdb` 和 `.ts` 文件。Windows 打包脚本只构建交互式 NSIS 安装器，Electron Builder 使用普通压缩配置。Windows 打包和运行中的桌面窗口都使用受版本控制的多尺寸 `resources/icon.ico`；安装器会清理 Shell 图标缓存，并在安装后广播关联变更通知。

## 考虑过的替代方案

**保留完整的已部署依赖树。** 保留源码、source map 和原生 PDB 文件可以支持安装后的本地调试，但发布的桌面应用在运行时不会使用它们，安装等待时间不值得为此付出。

**使用不压缩的安装器载荷。** Store 压缩能将解压 CPU 消耗降到最低，但会显著增大下载体积。普通压缩让安装器仍适合分发，同时避免最慢的压缩配置。

**只在 Electron Builder 中排除文件。** Builder 过滤会让本地运行时与最终发布版本不同，使直接运行时检查失去代表性。在已部署运行时内裁剪可让测试树和打包树保持一致。

## 后果

发布的 Windows 运行时更小，需要安装的文件更少。运行时堆栈不再能通过 source map 映射到源码，原生 PDB 调试需要使用开发构建。裁剪列表有意仅限于源码和调试扩展名；包元数据、许可证、可执行资源和构建后的 JavaScript 均会保留。打包安装器前，先用官方 `dsh --help` 入口检查打包运行时。
