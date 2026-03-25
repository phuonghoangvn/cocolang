"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, Flame, X, Zap } from "lucide-react";
import { playWelcomeSound } from "@/lib/sounds";

interface DailyWelcomePopupProps {
  name: string;
  streak: number;
  xp: number;
  avatar: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getStreakInfo(streak: number): {
  title: string;
  subtitle: string;
  flameCount: number;
  isSpecial: boolean;
} {
  if (streak === 0)
    return {
      title: "Start your streak today! 🌱",
      subtitle: "Complete one task to kick off your learning journey.",
      flameCount: 0,
      isSpecial: false,
    };
  if (streak === 1)
    return {
      title: "Day 1 — great start!",
      subtitle: "Come back tomorrow to keep your streak alive.",
      flameCount: 1,
      isSpecial: false,
    };
  if (streak < 7)
    return {
      title: `${streak}-day streak! Keep going!`,
      subtitle: "You're building a powerful habit. Don't stop now!",
      flameCount: 1,
      isSpecial: false,
    };
  if (streak === 7)
    return {
      title: "One full week! Amazing! 🎉",
      subtitle: "7 days of consistency. You're absolutely on fire!",
      flameCount: 2,
      isSpecial: true,
    };
  if (streak < 14)
    return {
      title: `${streak} days and counting! 🔥`,
      subtitle: "You're in a serious learning zone. Keep the flame burning!",
      flameCount: 1,
      isSpecial: false,
    };
  if (streak === 14)
    return {
      title: "Two weeks! Legendary! 🏆",
      subtitle: "14 days straight. You're in the top 1% of learners!",
      flameCount: 2,
      isSpecial: true,
    };
  if (streak < 30)
    return {
      title: `${streak}-day warrior! 🔥🔥`,
      subtitle: "Unstoppable momentum. Nothing gets in your way!",
      flameCount: 2,
      isSpecial: false,
    };
  return {
    title: `${streak} days! Absolute legend! 👑`,
    subtitle: "You've mastered the art of consistency. Incredible!",
    flameCount: 3,
    isSpecial: true,
  };
}

const AUTO_DISMISS_MS = 7000;

export default function DailyWelcomePopup({
  name,
  streak,
  xp,
  avatar,
}: DailyWelcomePopupProps) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("cocolang_last_visit");

    if (lastVisit !== today) {
      localStorage.setItem("cocolang_last_visit", today);

      // Short delay so page renders first
      timerRef.current = setTimeout(() => {
        setShow(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setMounted(true));
        });
        playWelcomeSound();

        // Countdown progress bar
        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
          setProgress(remaining);
          if (remaining <= 0) handleClose();
        }, 50);
      }, 700);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMounted(false);
    setTimeout(() => setShow(false), 350);
  };

  if (!show) return null;

  const greeting = getGreeting();
  const streakInfo = getStreakInfo(streak);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-sm"
        onClick={handleClose}
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Card */}
      <div
        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-sm px-4"
        style={{
          transform: `translateX(-50%) translateY(${mounted ? "-50%" : "-42%"})`,
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease",
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Countdown bar */}
          <div className="h-1 bg-zinc-100">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-violet-500"
              style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
            />
          </div>

          {/* Header */}
          <div
            className="relative px-6 pb-8 pt-6 text-center"
            style={{
              background: streakInfo.isSpecial
                ? "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)"
                : "linear-gradient(135deg, #0ea5e9, #6366f1)",
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>

            {/* Mascot */}
            <div
              className="text-6xl mb-3"
              style={{ animation: "mascotBounce 0.8s ease infinite alternate" }}
            >
              {avatar || "🦜"}
            </div>

            <p className="text-white/80 text-sm font-medium">{greeting},</p>
            <h2 className="text-white text-2xl font-black">
              {name || "Learner"}! 👋
            </h2>
          </div>

          {/* Stats cards */}
          <div className="px-5 -mt-5">
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 flex overflow-hidden">
              {/* Streak */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 border-r border-zinc-100">
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: Math.max(1, streakInfo.flameCount) }).map(
                    (_, i) => (
                      <Flame
                        key={i}
                        className="w-5 h-5 text-orange-500"
                        style={{
                          animation: `flamePulse 1s ${i * 0.2}s ease-in-out infinite alternate`,
                        }}
                      />
                    )
                  )}
                </div>
                <div className="text-2xl font-black text-orange-500">{streak}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Day Streak
                </div>
              </div>

              {/* XP */}
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <Zap className="w-5 h-5 text-emerald-500 mb-0.5" />
                <div className="text-2xl font-black text-emerald-600">
                  {xp.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Total XP
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="px-5 pt-4 pb-2">
            <div
              className="rounded-2xl px-4 py-3 text-center"
              style={{
                background: streakInfo.isSpecial
                  ? "linear-gradient(135deg, #fff7ed, #fef3c7)"
                  : "#f8fafc",
                border: streakInfo.isSpecial
                  ? "1px solid #fde68a"
                  : "1px solid #f1f5f9",
              }}
            >
              <p
                className="font-bold text-sm"
                style={{ color: streakInfo.isSpecial ? "#92400e" : "#18181b" }}
              >
                {streakInfo.title}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">{streakInfo.subtitle}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 py-4">
            <button
              onClick={handleClose}
              className="w-full text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] shadow-lg"
              style={{
                background: streakInfo.isSpecial
                  ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                  : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                boxShadow: streakInfo.isSpecial
                  ? "0 8px 24px rgba(245,158,11,0.35)"
                  : "0 8px 24px rgba(14,165,233,0.35)",
              }}
            >
              Let&apos;s study! 🚀
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mascotBounce {
          from { transform: translateY(0px) rotate(-3deg); }
          to   { transform: translateY(-6px) rotate(3deg); }
        }
        @keyframes flamePulse {
          from { transform: scale(1);    opacity: 0.85; }
          to   { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>
  );
}
