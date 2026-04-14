export interface SearchStrategy {
  id: string
  projectId: string
  name: string
  description?: string
  currentVersionId?: string
}

export interface StrategyVersion {
  id: string
  strategyId: string
  versionNumber: number
  queryText: string
  queryAst: QueryAST
  filters: SearchFilters
  sources: string[]
}

export interface QueryAST {
  type: 'AND' | 'OR' | 'NOT' | 'TERM' | 'PHRASE'
  value?: string
  field?: string
  children?: QueryAST[]
}

export interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  countries?: string[]
  documentTypes?: string[]
  openAccessOnly?: boolean
}

export interface SearchRun {
  id: string
  strategyId: string
  versionId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  totalResults?: number
  newResults?: number
  startedAt?: string
  completedAt?: string
}
