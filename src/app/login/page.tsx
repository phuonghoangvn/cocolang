"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerUser } from "@/app/actions/auth";
import { Loader2, ArrowRight, Lock, User, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.toLowerCase();
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all the required fields.");
      return;
    }

    startTransition(async () => {
      if (!isLogin) {
        // Registration flow
        const result = await registerUser(null, formData);
        if (result.error) {
          setError(result.error);
        } else {
          // Auto-login after successful registration
          const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });

          if (res?.error) {
            setError("Created, but login failed. Please sign in.");
            setIsLogin(true);
          } else {
            router.push("/survey"); // Redirect to onboarding survey
          }
        }
      } else {
        // Login flow
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setError("Invalid email or password.");
        } else {
          router.push("/dashboard");
        }
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {isLogin
              ? "Sign in to continue your learning journey."
              : "Start learning Swedish & UX English today."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Maria"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-colors"
                  disabled={isPending}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-colors"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-colors"
                disabled={isPending}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="font-medium text-zinc-950 hover:underline"
            disabled={isPending}
          >
            {isLogin ? "Register here" : "Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
}
