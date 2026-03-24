"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/users/signin", {
        email,
        password,
      })
      
      const { access_token } = response.data
      localStorage.setItem("token", access_token)
      router.push("/dashboard") // Adjust based on your protected route
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      <div className="flex flex-col space-y-1.5 mb-6">
        <h3 className="font-semibold tracking-tight text-2xl">Login</h3>
        <p className="text-sm text-muted-foreground">Enter your email and password to access your account.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">Email or Username</label>
          <input
            id="email"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
