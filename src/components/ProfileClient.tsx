"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Clock, Target, Globe, Bell, BellOff, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const AVATARS = ["🐨", "🦊", "🐸", "🦁", "🐻", "🦋", "🐬", "🦄", "🐙", "🐧", "🦜", "🐺"];
const DAILY_GOALS = [5, 10, 15, 30];

interface ProfileClientProps {
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
    dailyGoalMinutes: number | null;
    emailReminders: boolean;
    nativeLanguage: string | null;
    learningGoal: string | null;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "🐨");
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalMinutes || 15);
  const [emailReminders, setEmailReminders] = useState(user.emailReminders);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar, dailyGoalMinutes: dailyGoal, emailReminders }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950">My Profile</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account and preferences.</p>
      </div>

      {/* Avatar picker */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-4 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <span className="text-xl">{avatar}</span> Choose Avatar
        </h2>
        <div className="grid grid-cols-6 gap-3">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                avatar === a
                  ? "border-sky-400 bg-sky-50 scale-110 shadow-sm"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:scale-105"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-4 shadow-sm space-y-4">
        <h2 className="font-bold text-zinc-900">Account Info</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Display Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-shadow"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <input
            value={user.email}
            disabled
            className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
          />
          <p className="text-xs text-zinc-400">Email cannot be changed.</p>
        </div>
      </div>

      {/* Learning prefs */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-4 shadow-sm space-y-4">
        <h2 className="font-bold text-zinc-900">Learning Preferences</h2>

        <div>
          <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5" /> Daily Goal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setDailyGoal(g)}
                className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                  dailyGoal === g
                    ? "border-sky-400 bg-sky-50 text-sky-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {g} min
              </button>
            ))}
          </div>
        </div>

        {user.nativeLanguage && (
          <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50 rounded-xl p-3">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span>Native language: <strong className="text-zinc-800">{user.nativeLanguage}</strong></span>
          </div>
        )}

        {user.learningGoal && (
          <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50 rounded-xl p-3">
            <Target className="w-4 h-4 text-zinc-400" />
            <span>Goal: <strong className="text-zinc-800 capitalize">{user.learningGoal}</strong></span>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-4">Notifications</h2>
        <button
          onClick={() => setEmailReminders((v) => !v)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
            emailReminders
              ? "border-sky-400 bg-sky-50"
              : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {emailReminders ? (
              <Bell className="w-5 h-5 text-sky-500" />
            ) : (
              <BellOff className="w-5 h-5 text-zinc-400" />
            )}
            <div className="text-left">
              <p className="font-semibold text-sm text-zinc-900">Daily Email Reminder</p>
              <p className="text-xs text-zinc-500">Get a nudge every day to keep your streak going</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${emailReminders ? "bg-sky-400" : "bg-zinc-300"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${emailReminders ? "left-5" : "left-0.5"}`} />
          </div>
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-sky-200 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <><Check className="w-4 h-4" /> Saved!</>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}
