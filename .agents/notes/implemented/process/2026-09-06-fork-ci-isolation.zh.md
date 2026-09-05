# Agent Note: Fork CI 隔离

Status: implemented

[English](2026-09-06-fork-ci-isolation.md) | 中文

## 问题

仓库副本不会继承组织的运行器池、Project 权限或 Issue App 凭据。将其必需作业分配给上游专用标签，会导致作业无限排队；运行上游 Issue 工作流则会查询另一个仓库中不存在的拉取请求，或在创建 Project 令牌前失败。

## 决策

[CI](../../../../.github/workflows/ci.yml) 在 `deepseek-harness/deepseek-harness` 以外的仓库中，先选择标准 `ubuntu-latest` 和 `windows-2025` 运行器，再考虑上游故障切换变量。上游企业级标签、Dependabot 例外和[故障切换流程](2026-07-26-ci-failover-runbook.md)保留原有行为。热备演练和企业级基准测试仅在该上游仓库运行。这是仓库隔离，不是对上游运行器分配故障的自动响应；该故障仍由[可移植恢复决策](2026-07-23-portable-required-pull-request-ci.md)约束。

Fork 将外层门禁串行化，并根据标准容量限制内部工作进程。覆盖率分区只改变调度，不改变被测源码或阈值。完整的必需作业列表和独立的原生 Windows 作业保持不变。缓存和浏览器预配步骤依据 `runner.environment` 选择，因此复制过来的故障切换变量不能抑制托管 Linux 所需的系统依赖安装。

[Issue 策略](../../../../.github/workflows/issue-policy.yml)和[Issue 生命周期](../../../../.github/workflows/issue-lifecycle.yml)仅在已提交组织配置指定的仓库中运行。其他仓库既不请求上游 App 令牌，也不查询其 Project。上游[评审事件规则](2026-08-10-event-directed-pr-review-status.md)保持不变。支持另一个 Project 需要明确决定配置和凭据，而不是仅移除这些条件。

## 考虑过的替代方案

**删除排队中的正确性作业或接受跳过结果。** 这会在没有执行必需检查的情况下产生通过的聚合结果。

**要求每个副本预配上游基础设施。** 运行器池和 Issue App 属于上游组织，而不是源码使用者。

**也让上游仓库使用标准容量。** 这会在没有证据表明需要替换的情况下，丢弃其基于测量的延迟和故障切换决策。

## 后果

Fork 拉取请求无需上游基础设施即可执行完整的代码验证清单，但并发更低，耗时可能更长。在明确配置前，组织专用的 Issue 管理仍不可用。标准运行器可用性和仓库 Actions 策略仍可能阻止执行；选择器并不保证容量。

[工作流回归测试](../../../../scripts/ci-workflow.spec.ts)锁定仓库优先的运行器选择、上游故障切换分支、Fork 工作进程预算、浏览器预配、必需依赖项和 Issue 作业范围。运行器分配与平台执行仍以实际确切分支头的 Actions 运行为证据。
