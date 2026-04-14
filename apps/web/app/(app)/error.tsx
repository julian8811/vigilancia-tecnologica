'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Route error caught:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {error.message || 'An error occurred while loading this page.'}
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button variant="default" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}