export function buildSummarizePrompt(record: {
  title: string
  abstract?: string
  year?: number
  type: 'article' | 'patent'
}): string {
  const typeLabel = record.type === 'article' ? 'artículo científico' : 'patente'
  return `Analizá el siguiente ${typeLabel} y generá un resumen estructurado en español.

Título: ${record.title}
Año: ${record.year || 'desconocido'}
Resumen original: ${record.abstract || 'No disponible'}

Generá un resumen conciso (máximo 150 palabras) que incluya:
1. Qué problema resuelve o qué descubrimiento describe
2. Metodología o tecnología principal
3. Resultados clave o aplicaciones

Responde SOLO con el resumen, sin títulos ni numeración.`
}

export function buildExpandQueryPrompt(query: string, domain: string, language: string): string {
  return `Sos un experto en vigilancia tecnológica e inteligencia de patentes.

La siguiente es una query booleana de búsqueda científica:
"${query}"

Dominio: ${domain}
Idioma preferido para términos: ${language}

Sugerí 5-8 términos adicionales relevantes que amplíen la cobertura de la búsqueda. Para cada término indicá:
- El término
- Por qué es relevante (sinónimo, término más amplio, más específico, traducción)

Responde en formato JSON:
[{"term": "...", "type": "synonym|broader|narrower|translation", "language": "es|en", "confidence": 0.0-1.0}]`
}
