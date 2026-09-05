# Agent Note: Patched documentation dependencies

Status: implemented

English | [中文](2026-09-05-patched-documentation-dependencies.zh.md)

## Problem

The documentation dependency graph includes vulnerable Mermaid and Vite versions. Updating only the lockfile cannot resolve a fixed Mermaid requirement or VitePress's Vite 5 dependency to patched releases.

## Decision

The root and [website manifest](../../../../website/package.json) use Mermaid 11.17.2. The website declares Vite 6.4.3 or a compatible release; a parent-scoped override in [pnpm-workspace.yaml](../../../../pnpm-workspace.yaml) applies the same range to VitePress. The stable VitePress release remains unchanged. The lockfile also resolves patched transitive dependencies without replacing workspace references or disabling release-age checks.

## Alternatives considered

**Upgrade all manifest ranges automatically.** This also changes unrelated dependency floors and workspace references, making security updates harder to review. Only ranges that block patched versions change.

**Move the site to a prerelease VitePress version.** This adds unrelated framework changes. The stable framework builds successfully with the scoped Vite override.

**Suppress development dependency advisories.** The documentation server and build tooling still process content and requests; excluding them from audits leaves the underlying versions unchanged.

## Consequences

The dependency audit includes development and production dependencies. The override adds a compatibility obligation: [docs:check](../../../../package.json) verifies the website build and internal links when documentation dependencies change. Removing the override requires a stable VitePress dependency range that admits a patched Vite release.
