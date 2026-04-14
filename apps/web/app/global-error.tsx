'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md">
              We encountered an unexpected error. Your work has been saved — please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 max-h-32 overflow-auto rounded bg-muted p-2 text-left text-xs">
                {error.message}
              </pre>
            )}
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={reset}>
              Try again
            </Button>
            <Button variant="default" onClick={() => window.location.href = '/'}>
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}