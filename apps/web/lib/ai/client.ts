type AIProvider = 'openai' | 'anthropic'

interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AICompletionOptions {
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
  provider?: AIProvider
}

export async function aiCompletion(options: AICompletionOptions): Promise<string> {
  const provider = options.provider || 'openai'

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return openaiCompletion(options)
  }

  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return anthropicCompletion(options)
  }

  // Fallback: try whichever key is available
  if (process.env.OPENAI_API_KEY) return openaiCompletion(options)
  if (process.env.ANTHROPIC_API_KEY) return anthropicCompletion(options)

  throw new Error('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.')
}

async function openaiCompletion(options: AICompletionOptions): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: options.messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature ?? 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

async function anthropicCompletion(options: AICompletionOptions): Promise<string> {
  const systemMsg = options.messages.find((m) => m.role === 'system')?.content
  const userMessages = options.messages.filter((m) => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 1000,
      system: systemMsg,
      messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic error: ${error}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}
