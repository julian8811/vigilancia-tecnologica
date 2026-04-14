'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { validateQuery } from '@/lib/search/query-parser'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'

interface QueryBuilderProps {
  value: string
  onChange: (value: string) => void
  onExpandWithAI?: () => void
  isExpanding?: boolean
}

const EXAMPLE_QUERIES = [
  'CRISPR AND "gene editing" AND cancer',
  '"renewable energy" AND (solar OR wind) NOT nuclear',
  'title:blockchain AND abstract:"supply chain"',
]

export function QueryBuilder({ value, onChange, onExpandWithAI, isExpanding }: QueryBuilderProps) {
  const [focused, setFocused] = useState(false)
  const validation = value.trim() ? validateQuery(value) : null

  return (
    <div className="space-y-2">
      <div className={`relative rounded-md border transition-colors ${
        focused ? 'border-primary ring-1 ring-primary' : 'border-input'
      } ${validation && !validation.valid ? 'border-destructive' : ''}`}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={'ej. CRISPR AND "gene editing" AND cancer\n\nOperadores: AND, OR, NOT, paréntesis, comillas, field:'}
          className="min-h-[100px] font-mono text-sm border-0 focus-visible:ring-0 resize-none"
        />
        {value.trim() && (
          <div className="absolute bottom-2 right-2">
            {validation?.valid ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>

      {validation && !validation.valid && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {validation.error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => onChange(q)}
              className="text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded px-2 py-0.5 font-mono transition-colors hover:border-border"
            >
              {q.slice(0, 30)}…
            </button>
          ))}
        </div>
        {onExpandWithAI && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExpandWithAI}
            disabled={!value.trim() || isExpanding}
            className="shrink-0"
          >
            <Sparkles className="h-3 w-3 mr-1.5 text-violet-400" />
            {isExpanding ? 'Expandiendo...' : 'Expandir con IA'}
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-x-3">
        <span><code className="bg-muted px-1 rounded">AND</code> ambos términos</span>
        <span><code className="bg-muted px-1 rounded">OR</code> cualquiera</span>
        <span><code className="bg-muted px-1 rounded">NOT</code> excluir</span>
        <span><code className="bg-muted px-1 rounded">"frase exacta"</code></span>
        <span><code className="bg-muted px-1 rounded">title:</code> campo</span>
      </div>
    </div>
  )
}
