# Agent Note: CLI 冒烟测试按当前组装选择工具

Status: implemented

[English](2026-09-06-cli-smoke-tool-composition.md) | 中文

## 问题

共享的无密钥 CLI（命令行界面）适配器同时服务于产品的原生 shell profile 和仅配置 Bash 的示例组装。宿主操作系统不能说明某个组装注册了哪些工具。根据 `process.platform` 选择工具可能发出未知工具调用，而 mock 仍然给出最终回答，削弱仅断言轮次完成的冒烟测试。

## 决策

适配器从 `GenerateOptions.tools` 中选择向模型提供的第一个 `bash` 或 `pwsh` schema，发出匹配的命令；两者均不存在时，在发出工具调用之前失败。组装仍是权威来源；fixture（测试前置数据）不会添加提供方或改变产品的工具选择。分平台的产品转录保留实际工具名和命令。

## 考虑过的替代方案

- 按宿主平台选择会混淆已安装的 shell 与组装中面向模型的工具。
- 为每个 shell 分别设置 mock 适配器会重复相同的流式与用量协议。
- 在仅配置 Bash 的冒烟测试中接受任一工具名，会掩盖不可用工具的回归，而不是证明真实的工具往返。

## 验证

适配器测试覆盖两种 shell、向模型提供工具的顺序、无关工具以及缺少 shell schema 的情况。无密钥 Loader 冒烟测试保留 Bash 调用断言和实际命令输出检查。产品 profile 快照执行随产品提供的 shell，并比较未改动的 Windows 或 POSIX 转录；goal 和遥测冒烟测试覆盖其他共享组装。

## 后果

mock 依赖真实提供方看到的同一组请求 schema，因此缺少 shell 会显式导致 fixture 失败。它只支持这两种 shell 工具，不会替换为未向模型提供的工具来完成轮次。
