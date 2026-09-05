import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { type StreamChunk, type ToolSchema } from '@deepseek-ai/dsh-llm'
import { describe, expect, it } from 'vitest'
import * as CliMockLlm from './fixtures/cli-mock-llm.ts'

async function generate(toolNames?: string[]): Promise<StreamChunk[]> {
  const ctx = new Context()
  const llm = await ctx.plugin(LlmRuntime)
  const fixture = await ctx.plugin(CliMockLlm)
  try {
    const tools: ToolSchema[] | undefined = toolNames?.map(name => ({ name, description: name, parameters: {} }))
    const chunks: StreamChunk[] = []
    for await (const chunk of ctx.llm.stream({
      provider: 'cli-mock',
      model: 'cli-mock',
      messages: [],
      ...(tools === undefined ? {} : { tools }),
    })) {
      chunks.push(chunk)
    }
    return chunks
  } finally {
    await fixture.dispose()
    await llm.dispose()
  }
}

describe('headless CLI mock tool selection', () => {
  it.each([
    { tools: ['bash'], name: 'bash', command: 'printf CLI_TOOL_ROUND_TRIP' },
    { tools: ['pwsh'], name: 'pwsh', command: '[Console]::Write("CLI_TOOL_ROUND_TRIP")' },
    { tools: ['read', 'bash', 'pwsh'], name: 'bash', command: 'printf CLI_TOOL_ROUND_TRIP' },
    { tools: ['read', 'pwsh', 'bash'], name: 'pwsh', command: '[Console]::Write("CLI_TOOL_ROUND_TRIP")' },
  ])('calls the first advertised shell in $tools', async ({ tools, name, command }) => {
    const chunks = await generate(tools)
    expect(chunks).toContainEqual({
      type: 'block-end',
      index: 0,
      block: {
        type: 'tool-call',
        id: 'cli-smoke-call',
        name,
        arguments: JSON.stringify({ command, description: 'Prove the CLI tool round trip.' }),
      },
    })
    expect(chunks.at(-1)).toEqual({ type: 'finish', reason: { kind: 'tool-calls' } })
  })

  it.each([{ tools: undefined }, { tools: [] }, { tools: ['read'] }])('fails without an advertised shell: $tools', async ({ tools }) => {
    const chunks = await generate(tools)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toMatchObject({
      type: 'finish',
      reason: {
        kind: 'error',
        failure: { message: 'CLI mock requires an advertised bash or pwsh tool.' },
      },
    })
  })
})
