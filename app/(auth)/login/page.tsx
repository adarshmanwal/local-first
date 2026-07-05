"use client";

import { useActionState } from "react";
import { loginUser } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to access your local-first documents
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-lg border-0 bg-zinc-50 py-3 px-4 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-white sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-lg border-0 bg-zinc-50 py-3 px-4 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-white sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
              <p className="text-sm font-medium text-red-800 dark:text-red-400">{state.error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-lg bg-black px-3 py-3 text-sm font-semibold text-white hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Don't have an account? </span>
            <Link href="/register" className="font-medium text-black hover:underline dark:text-white">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
