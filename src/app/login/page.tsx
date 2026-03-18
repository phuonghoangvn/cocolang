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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 md:p-6 lg:p-12 selection:bg-sky-200">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl border border-zinc-200/60 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Brand & Mascot */}
        <div className="md:w-5/12 bg-zinc-950 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-white shrink-0">
          <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-gradient-to-br from-sky-500/30 via-violet-600/30 to-rose-500/30 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <span className="text-xl leading-none">🦜</span>
            </div>
            <h1 className="font-black text-2xl tracking-tight text-white">
              Cocolang
            </h1>
          </div>
          
          <div className="relative z-10 mt-16 md:mt-0 pb-4">
            <div className="text-6xl md:text-8xl mb-6 select-none animate-bounce origin-bottom drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
              🦜
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-indigo-200">
              Learn any language,<br />the fun way! 🎉
            </h2>
            <p className="text-zinc-400 font-medium text-lg leading-relaxed max-w-sm">
              Explore new languages with bite-sized lessons, fun challenges, and your personal AI companion. Let's go! 🚀
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-16 flex items-center justify-center bg-white relative">
          <div className="w-full max-w-sm">
            <div className="mb-10 w-full">
              <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-base text-zinc-500 font-medium">
                {isLogin
                  ? "Sign in to continue your learning journey."
                  : "Start learning with Cocolang today."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-start gap-3">
                <span className="shrink-0">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Maria Silva"
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all form-input-autofill placeholder-zinc-400 text-zinc-900"
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all form-input-autofill placeholder-zinc-400 text-zinc-900"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all form-input-autofill placeholder-zinc-400 text-zinc-900"
                    disabled={isPending}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] text-white py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-70 disabled:active:scale-100 shadow-md shadow-zinc-900/10 mt-4"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign in to account" : "Create my account"}
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-zinc-500">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="ml-2 font-bold text-zinc-900 hover:text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors"
                disabled={isPending}
              >
                {isLogin ? "Create one here" : "Sign in here"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
