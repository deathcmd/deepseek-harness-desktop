# Agent Note: CLI smoke tool selection follows the active composition

Status: implemented

English | [中文](2026-09-06-cli-smoke-tool-composition.zh.md)

## Problem

The shared keyless CLI adapter serves both the product's native-shell profile and Bash-only example compositions. The host operating system does not identify which tools a composition registers. Choosing a tool from `process.platform` can produce an unknown-tool call while the mock still emits a final answer, weakening smokes that assert only turn completion.

## Decision

The adapter selects the first advertised `bash` or `pwsh` schema from `GenerateOptions.tools`, emits the matching command, and fails before emitting a tool call if neither exists. The composition remains authoritative; the fixture does not add providers or change product tool selection. Platform-specific product transcripts retain their actual tool names and commands.

## Alternatives considered

- Selecting by host platform conflates the installed shell with the composition's model-facing tools.
- Separate mock adapters for each shell duplicate the same stream and usage protocol.
- Accepting either tool name in the Bash-only smoke would hide an unavailable-tool regression rather than prove a real tool round trip.

## Verification

Adapter tests cover both shells, advertised ordering, unrelated tools, and absent shell schemas. The keyless Loader smoke retains its Bash call assertion and actual command-output check. Product-profile snapshots execute the shipped shell and compare the unchanged Windows or POSIX transcript; goal and telemetry smokes exercise the other shared compositions.

## Consequences

The mock depends on the same request schemas seen by a real provider, so a missing shell is an explicit fixture failure. It supports only these two shell tools and does not substitute an unadvertised tool to finish a turn.
