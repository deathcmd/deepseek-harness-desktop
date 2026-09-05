# Agent Note: 文档依赖安全修复

Status: implemented

[English](2026-09-05-patched-documentation-dependencies.md) | 中文

## Problem

文档依赖图包含存在漏洞的 Mermaid 和 Vite 版本。只更新锁文件，无法让固定的 Mermaid 版本要求或 VitePress 的 Vite 5 依赖解析到已修复版本。

## Decision

根目录与[网站 manifest（元数据清单）](../../../../website/package.json)使用 Mermaid 11.17.2。网站声明 Vite 6.4.3 或兼容版本；[pnpm-workspace.yaml](../../../../pnpm-workspace.yaml) 中限定父依赖的覆盖规则对 VitePress 应用相同范围。VitePress 稳定版保持不变。锁文件同时解析到已修复的传递依赖，不替换工作区引用，也不禁用发布等待期检查。

## Alternatives considered

**自动升级所有 manifest 版本范围。** 这还会改变无关的依赖最低版本与工作区引用，使安全更新更难审查。只调整阻止采用已修复版本的范围。

**把网站迁移到 VitePress 预发布版本。** 这会引入无关的框架改动。稳定版框架可在限定范围的 Vite 覆盖规则下成功构建。

**忽略开发依赖漏洞报告。** 文档服务器与构建工具仍会处理内容和请求；将它们排除在审计外，并不会改变底层版本。

## Consequences

依赖审计覆盖开发依赖和生产依赖。覆盖规则带来兼容性维护要求：[docs:check](../../../../package.json) 在文档依赖变化时验证网站构建与内部链接。只有当 VitePress 稳定版的依赖范围允许使用已修复的 Vite 版本时，才能移除该覆盖规则。
