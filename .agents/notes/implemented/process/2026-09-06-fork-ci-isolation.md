# Agent Note: Fork CI isolation

Status: implemented

English | [中文](2026-09-06-fork-ci-isolation.zh.md)

## Problem

A repository copy does not inherit organization runner pools, Project permissions, or the Issue App credentials. Assigning its required jobs to upstream-only labels leaves them queued indefinitely; running the upstream Issue workflows either requests a nonexistent pull request in another repository or fails before creating the Project token.

## Decision

[CI](../../../../.github/workflows/ci.yml) selects standard `ubuntu-latest` and `windows-2025` runners outside `deepseek-harness/deepseek-harness` before evaluating upstream failover variables. The upstream enterprise labels, Dependabot exception, and [failover procedure](2026-07-26-ci-failover-runbook.md) retain their behavior. Standby drills and enterprise benchmarks run only in that upstream repository. This is repository isolation, not an automatic response to an upstream allocation outage; the [portable recovery decision](2026-07-23-portable-required-pull-request-ci.md) still governs that outage.

Forks serialize outer gates and bound inner workers for standard capacity. Coverage partitions change scheduling, not the measured source or thresholds. The complete required-job list and the independent native Windows job remain intact. Cache and browser provisioning steps follow `runner.environment`, so a copied failover variable cannot suppress hosted Linux system dependencies.

[Issue policy](../../../../.github/workflows/issue-policy.yml) and [Issue lifecycle](../../../../.github/workflows/issue-lifecycle.yml) run only in the repository named by their checked-in organization configuration. Other repositories neither request the upstream App token nor query its Project. The upstream [review-event rules](2026-08-10-event-directed-pr-review-status.md) are unchanged. Supporting another Project requires an explicit configuration and credential decision, not merely removing these guards.

## Alternatives considered

**Drop queued correctness jobs or accept skipped results.** That produces a passing aggregate without executing its required checks.

**Require every copy to provision upstream infrastructure.** Runner pools and the Issue App belong to the upstream organization, not to consumers of the source.

**Use standard capacity for the upstream repository too.** That discards its measured latency and failover decisions without evidence that they need replacing.

## Consequences

Fork pull requests can execute the full code-validation inventory without upstream infrastructure, at lower concurrency and potentially higher latency. Organization-specific issue management remains unavailable until deliberately configured. Standard runner availability and repository Actions policy can still block execution; the selector does not guarantee capacity.

[Workflow regressions](../../../../scripts/ci-workflow.spec.ts) pin repository-first runner selection, upstream failover branches, fork worker budgets, browser provisioning, required dependencies, and Issue job scoping. Actual exact-head Actions runs remain the evidence for runner allocation and platform execution.
