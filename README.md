# DeepSeek Harness 桌面版

[中文详细说明](README.zh.md)

这是基于官方开源 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 打包的桌面应用。安装后会像普通 Windows 或 macOS 软件一样打开独立窗口，不会自动把你带到系统浏览器。桌面壳复用官方 Harness 的 Web 界面和运行时，因此会话、模型、工作区、MCP、skill（技能）、文件操作和终端行为仍由官方项目负责。

如果你只是想使用，不需要安装 Node.js、pnpm 或命令行工具。Windows 与 macOS 安装包都自带 Electron 运行时和它内置的 Node.js；请直接阅读下面的“下载”和“安装”部分。只有要参与开发或自己打包时，才需要阅读文末的源码构建说明。

## 一分钟开始

1. 在“下载”表格中选择与你的电脑匹配的安装程序。
2. Windows 双击 `.exe` 安装；Intel Mac 或 Apple Silicon（M 系列）Mac 打开对应 `.dmg` 并把应用拖入“应用程序”。
3. 启动桌面应用，在窗口内先选择工作区，再在“设置 → 模型”中填写自己的 API 密钥并选择模型。
4. 新建会话，输入任务并发送；需要授权时先阅读操作内容，再决定是否允许。

## 下载

当前公开版本是 `0.1.0-rc.7`，仍属于预发布版本。请从下面的 Release 页面或直接链接下载，不要点击 GitHub 的“Code → Download ZIP”来代替安装程序。

| 系统 | 安装文件 | 适用电脑 | 下载 |
| --- | --- | --- | --- |
| Windows | `DeepSeek-Harness-Setup-0.1.0-rc.7-win-x64.exe` | Windows 10/11 64 位（Intel 或 AMD） | [下载 Windows 安装程序](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-v0.1.0-rc.7/DeepSeek-Harness-Setup-0.1.0-rc.7-win-x64.exe) |
| macOS | `DeepSeek-Harness-0.1.0-rc.7-mac-x64.dmg` | Intel x64 Mac | [下载 macOS Intel 安装程序](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-macos-v0.1.0-rc.7/DeepSeek-Harness-0.1.0-rc.7-mac-x64.dmg) |
| macOS | `DeepSeek-Harness-0.1.0-rc.7-mac-arm64.dmg` | Apple Silicon（M1/M2/M3/M4 等）Mac | [下载 macOS Apple Silicon 安装程序](https://github.com/deathcmd/deepseek-harness-desktop/releases/download/desktop-macos-v0.1.0-rc.7/DeepSeek-Harness-0.1.0-rc.7-mac-arm64.dmg) |

完整文件列表和 Release 说明见：[GitHub Releases](https://github.com/deathcmd/deepseek-harness-desktop/releases)。Apple Silicon 安装包是原生 arm64 版本，不需要 Rosetta 2；在“关于本机”里显示“芯片 Apple”时请选择上面的 `mac-arm64.dmg`。

安装包只包含程序本身，不包含任何人的 API Key、模型凭据、全局提示词、MCP 配置或个人 skill。不要把自己的密钥写进 README、截图、公开仓库或发给其他人。

<a id="run"></a>

## Windows 安装

### 安装前准备

- 使用 Windows 10 或 Windows 11 的 64 位版本；在“设置 → 系统 → 系统信息”中查看“系统类型”。
- 预留至少 1 GB 空间。Windows 快速安装程序约 470 MiB：为了缩短安装时间，它把完整应用以无压缩 ZIP 直接写入安装目录，因此下载体积比旧版本大。下载完成后，安装阶段不需要联网。
- 不需要另外安装 Node.js、pnpm 或命令行工具。桌面应用会使用安装包自带的 Electron 与内置 Node.js。
- 准备一个你自己的模型服务 API Key。安装程序不会替你购买服务，也不会自动生成密钥。

### 逐步安装

1. 点击上面“下载 Windows 安装程序”，等待浏览器下载完成。
2. 打开下载目录，双击 `DeepSeek-Harness-Setup-0.1.0-rc.7-win-x64.exe`。
3. 如果 Windows 显示“Windows 已保护你的电脑”，先点击“更多信息”，确认文件名和下载来源正确，再点击“仍要运行”。原因是当前发布包没有商业代码签名。
4. 在安装器中选择安装目录，例如 `D:\DeepSeek Harness Desktop`，再点击“安装”。
5. 等进度条和安装器明确显示完成后，再打开桌面上的 **DeepSeek Harness** 图标。安装过程中不要提前双击刚出现的快捷方式，也不要强行结束安装器。
6. 安装完成后，桌面和开始菜单都会有 **DeepSeek Harness** 快捷方式。双击后应看到应用窗口，而不是自动打开浏览器。

### 快速安装机制

此版本的 Windows 安装器将完整应用放在一个无压缩 ZIP 中并直接写入安装目录，不再先解压数万个运行时文件到临时目录、再复制第二次。构建验证中，应用载荷展开到独立目录耗时低于 1 秒；在普通 SSD 上，完整安装通常会在数秒内完成。机械硬盘、外接盘、实时杀毒扫描、磁盘空间不足或已有程序尚未退出都可能增加时间，因此无法为每台电脑保证固定秒数。

安装器会在写入文件期间阻止应用提前启动。这样做是为了防止程序只写入一部分就被打开，造成文件被占用；如果看到“仍在安装”的提示，回到安装器等待它完成即可。

### 覆盖升级且保留配置

升级前先退出所有 **DeepSeek Harness** 窗口，然后下载同名的新安装程序并正常执行安装。安装器使用与旧版相同的应用标识，会覆盖原安装目录中的程序文件、快捷方式和内置运行时；它不会删除或重置你的 `DSH_HOME`、已安装插件及插件配置、模型/API 设置、全局提示词、MCP、skill、工作区选择、会话、聊天记录或 NPM 缓存。具体包括 `settings.yaml`、全局和 profile 内的 `cordis.patch.yml`、`.credentials.yaml`、profile 的 `package.json` 以及各插件的 `node_modules`。新版桌面启动器还会从现有 profile 的 `node_modules` 解析第三方插件，并从内置运行时解析官方依赖，因此升级不需要重新安装插件。

这些个人数据位于 Electron 的单用户数据目录，不在安装目录中。即使卸载程序，也不会自动清除它们；需要彻底清理时，请先自行备份后再按“忘记配置或想重新开始”操作。

### Windows 安装包校验

从 Release 下载完成后，可以用 PowerShell 计算 SHA-256。先在文件所在目录空白处按住 Shift 右键，选择“在此处打开 PowerShell”，再执行：

```powershell
Get-FileHash .\DeepSeek-Harness-Setup-0.1.0-rc.7-win-x64.exe -Algorithm SHA256
```

正常结果应为：

```text
BA499A6C1D96BB7F2AEADF0782CAD2907DE42C64F64563A1A69354B289E971BA
```

如果计算出的值不一致，不要继续安装；重新从 Release 页面下载，并确认浏览器没有使用损坏的缓存文件。

## macOS 安装

### 兼容性

当前同时提供 Intel x64 和 Apple Silicon arm64 两个原生 macOS 安装程序。点击左上角苹果菜单 →“关于本机”：处理器一栏显示“Intel”时下载 `mac-x64.dmg`；显示“芯片 Apple M1/M2/M3/M4”等时下载 `mac-arm64.dmg`。不要把两个架构的文件混用。

### 逐步安装

1. 根据“关于本机”的结果，点击上面的 Intel 或 Apple Silicon 下载链接，等待对应的 `.dmg` 下载完成。
2. 双击 `.dmg` 文件，等待磁盘映像窗口打开。
3. 把窗口里的 `DeepSeek Harness.app` 拖到“应用程序”文件夹，不要直接长期放在下载目录或 DMG 窗口里运行。
4. 打开“应用程序”，找到 **DeepSeek Harness**，双击启动。首次启动可能出现 macOS 的安全提示，这是因为当前包没有 Apple Developer 签名和公证。
5. 如果 macOS 不允许打开：先点“完成”，然后打开“系统设置 → 隐私与安全性”，向下找到被阻止的应用，点击“仍要打开”，再回到“应用程序”重新启动。
6. 应用成功复制到“应用程序”后，可以在 Finder 侧边栏对 DMG 点击推出；以后从“应用程序”或 Dock 启动即可。

Intel DMG 的 SHA-256 校验值如下：

```text
74019C0811D42514CCCA44CAE8C73D3D1E9DFEE4CE03292FFC4E034DC93BD85E
```

在终端中校验下载文件可以执行：

```sh
shasum -a 256 ~/Downloads/DeepSeek-Harness-0.1.0-rc.7-mac-x64.dmg
```

Apple Silicon DMG 的 SHA-256 校验值如下：

```text
3058C15E7A356F95D90B8E8147A23994C0FFD143BCB9E090BA6FF3DB2EAB7AAD
```

Release 中也提供同名 `.dmg.sha256` 校验文件。下载 DMG 和校验文件后，可以在终端执行：

```sh
cd ~/Downloads
shasum -a 256 -c DeepSeek-Harness-0.1.0-rc.7-mac-arm64.dmg.sha256
```

## 第一次打开后的配置

### 1. 选择工作区

工作区就是 Harness 可以读取和修改的项目文件夹。第一次打开后点击“选择工作区”，选择一个项目根目录；如果只是试用，可以先新建一个空文件夹。不要选择整个系统盘、包含隐私资料的父目录或你不希望模型访问的文件夹。

选择工作区后，模型才能读取文件、编辑文件和运行项目命令。换电脑或换项目时，可以重新选择其他工作区；模型不会因为你选择了一个目录就自动获得这台电脑所有文件的访问权。

### 2. 配置模型和 API Key

1. 打开“设置 → 模型”。
2. 如果使用 DeepSeek，找到 DeepSeek 卡片，粘贴你从 [DeepSeek API 平台](https://platform.deepseek.com/api_keys) 创建的 API Key，然后保存。
3. 在模型选择器中选择一个已配置的模型，再新建会话。
4. 如果使用其他服务，选择“添加提供方”或“添加自定义提供方”，按服务商文档填写 Provider ID、基础 URL、API 协议、凭据和模型 ID。

API Key 是只写凭据：保存后页面只显示脱敏信息，明文凭据保存在本机 Harness 数据目录中。不要把 API Key 放进项目文件、截图、命令行历史或 Git 提交。

自定义提供方的具体字段和错误说明见：[模型提供方配置指南](docs/user/guide/providers.zh.md)。例如 OpenAI 兼容服务通常需要一个以 `/v1` 结尾的基础 URL，但必须以服务商文档为准，不要盲目复制别人的地址。

### 3. 发出第一条消息

新建会话后，可以先发送一条简单任务，例如：

```text
请先列出当前工作区的主要文件，再用中文说明这个项目是做什么的。不要修改文件。
```

如果模型准备读取文件、执行命令或修改内容，界面可能会显示授权请求。先检查路径、命令和目标，再选择允许或拒绝；不确定时可以拒绝并要求模型先解释计划。

## 图片、文件、MCP 和 skill

### 图片和文件

能否发送图片取决于当前选择的模型和提供方，不是所有文本模型都支持图片。遇到“模型不支持图片”“图片在发送前被拒绝”等提示时，先确认选择的是视觉模型，再按[模型提供方配置指南](docs/user/guide/providers.zh.md)为自定义模型声明 `input: [text, image]`。声明只是配置记录；如果服务端实际不支持图片，服务端仍会拒绝请求。

上传文件或图片前，确认其中没有密码、私钥、身份证件和其他不应发送给模型的内容。图片请求会消耗模型服务的额度，具体限制和费用以服务商为准。

### MCP

MCP 是让 Harness 连接外部工具服务器的协议。桌面安装包不会替你安装第三方 MCP 服务器，也不会自动复制 Codex 或其他应用的私有 MCP 配置。MCP 服务器命令属于本机受信任程序，配置前先确认来源、命令和它需要读取的文件。

普通使用者可以先不配置 MCP；需要接入时，请阅读 [MCP 客户端配置说明](packages/mcp/mcp-client/README.zh.md) 和 [完整配置目录](docs/config-catalog.zh.md)。配置中的 token、密码和 API Key 应通过本机环境变量或私有配置提供，不能提交到公开仓库。

### skill（技能）

skill 是一组可复用的任务说明，通常是一个目录中的 `SKILL.md` 文件。项目级技能放在工作区的 `.agents/skills` 或 `.dsh/skills`；用户级技能放在 Harness 数据目录的 `skills`，或用户目录下的 `.agents/skills`。技能目录名称和 `SKILL.md` 内容会影响模型能否发现和调用它。

安装或复制技能后，重新打开会话并查看可用技能列表。不要覆盖或删除 Codex 自己的 MCP、skill、配置和用户数据；DeepSeek Harness 桌面版使用独立的用户数据目录。

### 全局提示词（AGENTS.md）

如果希望每个工作区都遵守一套共同规则，可以在 Harness 数据目录的根目录创建 `AGENTS.md`。例如：

```markdown
# 我的全局规则

- 默认使用中文回答。
- 修改文件前先说明将要修改的文件。
- 删除或覆盖文件前先请求确认。
```

已安装桌面版的 Harness 数据目录通常是：

- Windows：按 `Win + R`，输入 `%APPDATA%\@deepseek-ai\dsh-desktop\dsh-home`，按回车。
- macOS：在 Finder 中按 `Command + Shift + G`，输入 `~/Library/Application Support/@deepseek-ai/dsh-desktop/dsh-home`，按回车。

如果目录尚未出现，先启动一次应用并关闭，再重新打开上述路径。项目内的 `AGENTS.md` 仍然只对对应项目或子目录生效；不要把 API Key 写入任何 `AGENTS.md`。

## 日常使用和退出

- 每个会话会保留自己的对话记录和所选模型；新会话可以重新选择模型。
- 需要换项目时先切换工作区，避免把任务发送到错误的目录。
- 任务执行中可以使用界面提供的停止或取消操作；关闭窗口也会停止该桌面实例启动的 Harness 进程树。
- 应用只在本机 `127.0.0.1` 的随机端口运行内部服务，不会由桌面壳主动开放公网端口，也不会自动打开浏览器。
- 关闭并重新打开应用不会删除已经保存的凭据和会话数据；卸载或清理数据前请先备份需要保留的配置。

## 常见问题

### Windows 安装器长时间不动

先确认所有 **DeepSeek Harness** 窗口已经退出，并等待安装器明确结束。新版安装器不再使用慢速临时 7z 解压；在 SSD 上若进度条持续几分钟没有变化，检查 Windows Defender 或其他安全软件是否正在扫描该 EXE，并确认目标磁盘至少剩余 1 GB。随后重新运行同一个安装程序，并选择可写目录，例如 `D:\DeepSeek Harness Desktop`。不要在安装未完成时反复双击 EXE。

### 安装完成后图标没有立即变化

先按 `F5` 刷新桌面，或注销并重新登录 Windows；不要删除程序文件。安装器会请求 Windows 刷新图标缓存，但 Windows 可能需要稍后才更新 Explorer 显示。

### 应用提示启动失败或窗口空白

先关闭所有 DeepSeek Harness 窗口，再从桌面快捷方式重新启动，并等待一段时间让内部服务完成启动。确认防火墙没有阻止本机回环连接，且安装目录中的文件没有被手动删除或移动。若仍失败，记录错误窗口中的完整文字，并在 GitHub Issues 中附上版本、操作系统和复现步骤，不要附 API Key。

### API 返回 401、403 或 `MISSING_CREDENTIAL`

检查 API Key 是否复制完整、是否已过期、模型提供方和基础 URL 是否匹配。回到“设置 → 模型”重新保存凭据；不要把密钥直接写进命令行或公开 Issue。不同服务商的 API Key 不能混用。

### 模型列表为空或出现 `UNKNOWN_MODEL`

确认提供方已保存，并在模型选择器中选择一个实际存在的模型 ID。某些兼容服务不提供 `/models` 查询接口，这时需要按照服务商文档手动填写模型 ID。

### 图片发送前被拒绝

当前模型没有声明图片输入能力，或你选择的是纯文本模型。换用视觉模型，并按[模型提供方配置指南](docs/user/guide/providers.zh.md)完成 `input` 配置；不要只修改显示名称来伪装成视觉模型。

### macOS 提示无法验证开发者

确认 DMG 来自本仓库的 macOS Release，再到“系统设置 → 隐私与安全性”点击“仍要打开”。如果“仍要打开”没有出现，先尝试右键应用选择“打开”，关闭提示后再次查看该设置页面。

### 忘记配置或想重新开始

先退出应用，再把 `dsh-home` 重命名为 `dsh-home.backup`，不要直接删除。重新启动会生成新的空配置；确认新配置可用后，再从备份目录恢复需要的会话或技能文件。API 凭据文件不要上传到 GitHub。

## 数据位置和隐私

桌面应用把 Harness 数据和 NPM 缓存放在 Electron 的单用户数据目录下，并为桌面实例设置独立的 `DSH_HOME`。应用不会读取或删除 Codex 的配置目录；MCP、skill、会话和凭据属于各自应用的数据范围。

内部 Web 服务只绑定 `127.0.0.1`，端口每次启动随机选择，并随应用退出而停止。模型请求会按照你配置的提供方发送到对应服务商；是否保存请求、如何计费以及数据保留多久由服务商的条款决定。

<a id="run-from-source"></a>

## 从源码构建（开发者）

这一部分不是普通安装步骤。开发环境需要 Node.js `22.19.0` 或更高版本、pnpm `11.7.0`、Git，以及能够访问依赖下载地址的网络。

```sh
git clone https://github.com/deathcmd/deepseek-harness-desktop.git
cd deepseek-harness-desktop
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm install
pnpm run build
```

Windows 打包前请把源码放在较短路径，例如 `C:\src\deepseek-harness`，以减少旧版 NSIS 工具链遇到路径长度限制的概率：

```sh
pnpm --dir apps/desktop run package:win
```

macOS 打包必须在 macOS 上运行：

```sh
pnpm --dir apps/desktop run package:mac
```

构建产物写入 `release/desktop/`。公开发布前还需要在对应平台进行运行验证、代码签名和 macOS 公证；本地未签名构建可能触发 Windows SmartScreen 或 macOS Gatekeeper。更多运行时和打包细节见[桌面包开发说明](apps/desktop/README.zh.md)。

## 上游与许可证

本仓库是官方开源 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的桌面发行版。桌面层位于 [`apps/desktop`](apps/desktop/) 和 [`apps/desktop-runtime`](apps/desktop-runtime/)，官方 Web 与 CLI 代码仍由上游包提供。

项目使用 [MIT License](LICENSE)。第三方依赖及其许可证清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
