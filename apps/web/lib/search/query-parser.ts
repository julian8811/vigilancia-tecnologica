export interface QueryToken {
  type: 'TERM' | 'PHRASE' | 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN' | 'FIELD'
  value: string
}

export function tokenize(query: string): QueryToken[] {
  const tokens: QueryToken[] = []
  let i = 0

  while (i < query.length) {
    if (/\s/.test(query[i])) { i++; continue }
    if (query[i] === '(') { tokens.push({ type: 'LPAREN', value: '(' }); i++; continue }
    if (query[i] === ')') { tokens.push({ type: 'RPAREN', value: ')' }); i++; continue }

    if (query[i] === '"') {
      let phrase = ''
      i++
      while (i < query.length && query[i] !== '"') phrase += query[i++]
      i++
      tokens.push({ type: 'PHRASE', value: phrase })
      continue
    }

    let word = ''
    while (i < query.length && !/[\s()"]/.test(query[i])) word += query[i++]
    if (!word) { i++; continue }

    if (word.endsWith(':')) {
      tokens.push({ type: 'FIELD', value: word.slice(0, -1) })
      continue
    }

    const upper = word.toUpperCase()
    if (upper === 'AND') { tokens.push({ type: 'AND', value: 'AND' }); continue }
    if (upper === 'OR') { tokens.push({ type: 'OR', value: 'OR' }); continue }
    if (upper === 'NOT') { tokens.push({ type: 'NOT', value: 'NOT' }); continue }

    tokens.push({ type: 'TERM', value: word })
  }

  return tokens
}

export function parseBooleanQueryToMeiliSearch(query: string): string {
  const tokens = tokenize(query)
  const terms: string[] = []

  for (const token of tokens) {
    if (token.type === 'TERM') terms.push(token.value)
    if (token.type === 'PHRASE') terms.push(`"${token.value}"`)
  }

  return terms.join(' ')
}

export function parseQueryToAST(query: string) {
  return { raw: query, tokens: tokenize(query) }
}

export function validateQuery(query: string): { valid: boolean; error: string | null } {
  let depth = 0
  for (const char of query) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (depth < 0) return { valid: false, error: 'Paréntesis de cierre sin apertura' }
  }
  if (depth !== 0) return { valid: false, error: 'Paréntesis sin cerrar' }
  return { valid: true, error: null }
}
