'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { QueryBuilder } from '@/components/search/QueryBuilder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Save } from 'lucide-react'

const AVAILABLE_SOURCES = [
  { id: 'openalex', label: 'OpenAlex', type: 'article' },
  { id: 'crossref', label: 'Crossref', type: 'article' },
  { id: 'lens', label: 'Lens.org', type: 'patent' },
  { id: 'patentsview', label: 'PatentsView', type: 'patent' },
]

export default function SearchPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [strategyName, setStrategyName] = useState('Nueva estrategia')
  const [queryText, setQueryText] = useState('')
  const [selectedSources, setSelectedSources] = useState(['openalex', 'crossref'])
  const [maxResults, setMaxResults] = useState(200)
  const [isRunning, setIsRunning] = useState(false)

  const createStrategy = trpc.search.strategies.create.useMutation()
  const runSearch = trpc.search.run.useMutation({
    onSuccess: (data) => {
      router.push(`/projects/${params.id}/results/${data.runId}`)
    },
  })

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]
    )
  }

  const handleRun = async () => {
    if (!queryText.trim() || selectedSources.length === 0) return
    setIsRunning(true)

    try {
      const strategy = await createStrategy.mutateAsync({
        projectId: params.id,
        name: strategyName,
        queryText,
        sources: selectedSources,
      })

      await runSearch.mutateAsync({
        strategyId: strategy.id,
        sources: selectedSources,
        maxResults,
      })
    } catch {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva búsqueda</h1>
        <p className="text-muted-foreground text-sm mt-1">Definí tu estrategia y ejecutá la búsqueda</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="strategyName">Nombre de la estrategia</Label>
          <Input
            id="strategyName"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Query de búsqueda *</Label>
          <QueryBuilder value={queryText} onChange={setQueryText} />
        </div>

        <div className="space-y-2">
          <Label>Fuentes de datos</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SOURCES.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => toggleSource(source.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  selectedSources.includes(source.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                {source.label}
                <Badge variant={source.type === 'article' ? 'secondary' : 'outline'} className="text-xs">
                  {source.type === 'article' ? 'Artículos' : 'Patentes'}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxResults">Máximo de resultados por fuente</Label>
          <Input
            id="maxResults"
            type="number"
            min={10}
            max={500}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="w-32"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleRun}
            disabled={!queryText.trim() || selectedSources.length === 0 || isRunning}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Ejecutando...' : 'Ejecutar búsqueda'}
          </Button>
        </div>
      </div>
    </div>
  )
}
