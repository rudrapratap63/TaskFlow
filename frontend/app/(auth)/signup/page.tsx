import { SignupForm } from "@/components/forms/signup-form"

export default function SignupPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  )
}
