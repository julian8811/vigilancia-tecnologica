import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp routing="hash" afterSignUpUrl="/onboarding" afterSignInUrl="/dashboard" />
    </div>
  )
}
