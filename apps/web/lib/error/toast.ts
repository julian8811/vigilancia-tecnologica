'use client'

import { toast } from 'sonner'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  description?: string
  duration?: number
}

function showToast(
  type: ToastType,
  message: string,
  options: ToastOptions = {}
) {
  const { description, duration = 4000 } = options

  switch (type) {
    case 'success':
      toast.success(message, { description, duration })
      break
    case 'error':
      toast.error(message, { description, duration })
      break
    case 'info':
      toast.info(message, { description, duration })
      break
    case 'warning':
      toast.warning(message, { description, duration })
      break
  }
}

export function showSuccess(message: string, options?: ToastOptions) {
  showToast('success', message, options)
}

export function showError(message: string, options?: ToastOptions) {
  showToast('error', message, options)
}

export function showInfo(message: string, options?: ToastOptions) {
  showToast('info', message, options)
}

export function showWarning(message: string, options?: ToastOptions) {
  showToast('warning', message, options)
}

// Helper for API errors
export function showApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'An error occurred'
  showError(message)
}

// Helper for form validation errors  
export function showValidationError(field: string, message: string) {
  showError(`Invalid ${field}: ${message}`)
}