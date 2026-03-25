"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trophy, Zap, Flame } from "lucide-react";
import { playTaskCompleteSound, playStreakMilestoneSound } from "@/lib/sounds";

interface CelebrationProps {
  xpReward: number;
  newStreak?: number;
  onFinish: () => void;
}

function isMilestoneStreak(streak: number) {
  return streak === 7 || streak === 14 || streak === 30 || streak === 50 || streak === 100;
}

function getMilestoneLabel(streak: number): string {
  if (streak >= 100) return "Century Streak! 👑";
  if (streak >= 50) return "50-Day Legend! 🏆";
  if (streak >= 30) return "30-Day Champion! 🔥🔥🔥";
  if (streak >= 14) return "Two-Week Warrior! 🔥🔥";
  if (streak >= 7) return "One Week Streak! 🔥";
  return "";
}

const PARTICLE_COLORS_DEFAULT = [
  "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6",
  "#f97316", "#14b8a6", "#ef4444", "#84cc16", "#06b6d4",
];

const PARTICLE_COLORS_MILESTONE = [
  "#f59e0b", "#fbbf24", "#fcd34d", "#fb923c", "#ef4444",
  "#f97316", "#fde68a", "#fef08a", "#fed7aa", "#fdba74",
];

function Confetti({ milestone = false }: { milestone?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = milestone ? PARTICLE_COLORS_MILESTONE : PARTICLE_COLORS_DEFAULT;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = milestone ? 160 : 120;
    const particles: any[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: milestone ? 10 + Math.random() * 10 : 8 + Math.random() * 8,
        h: milestone ? 10 + Math.random() * 10 : 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * (milestone ? 6 : 4),
        vy: (milestone ? 4 : 3) + Math.random() * 4,
        spin: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI * 2,
        opacity: 1,
      });
    }

    let frameId: number;
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.1;
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.013);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < 140) {
        frameId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [milestone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default function TaskCompletionCelebration({
  xpReward,
  newStreak,
  onFinish,
}: CelebrationProps) {
  const [visible, setVisible] = useState(true);
  const milestone = newStreak !== undefined && isMilestoneStreak(newStreak);

  useEffect(() => {
    // Play appropriate sound
    if (milestone) {
      playStreakMilestoneSound();
    } else {
      playTaskCompleteSound();
    }

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 300);
    }, milestone ? 4500 : 3200);

    return () => clearTimeout(timer);
  }, [milestone, onFinish]);

  if (!visible) return null;

  return (
    <>
      <Confetti milestone={milestone} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <div
          className="celebration-card relative bg-white rounded-3xl shadow-2xl px-10 py-12 flex flex-col items-center text-center max-w-sm mx-4"
          style={{ animation: "celebPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}
        >
          {/* Stars */}
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                className="w-8 h-8 text-yellow-400 fill-yellow-400"
                style={{
                  animation: `starPop 0.4s ${i * 0.12 + 0.2}s both cubic-bezier(0.175,0.885,0.32,1.275)`,
                }}
              />
            ))}
          </div>

          <div className="text-5xl mb-3">{milestone ? "🏆" : "🎉"}</div>
          <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">Task Complete!</h2>
          <p className="text-zinc-500 text-sm mb-4">You&apos;re on a roll! Keep going!</p>

          {/* XP Badge */}
          <div
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-3 mb-4"
            style={{ animation: "xpBounce 0.5s 0.5s both" }}
          >
            <Zap className="w-6 h-6 text-emerald-500 fill-emerald-100" />
            <span className="text-2xl font-black text-emerald-600">+{xpReward} XP</span>
          </div>

          {/* Streak Milestone Banner */}
          {milestone && newStreak !== undefined && (
            <div
              className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 mb-4"
              style={{
                background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
                border: "1px solid #fde68a",
                animation: "xpBounce 0.5s 0.7s both",
              }}
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="text-left">
                <p className="text-sm font-black text-orange-700">{getMilestoneLabel(newStreak)}</p>
                <p className="text-xs text-orange-500">{newStreak}-day streak achieved!</p>
              </div>
            </div>
          )}

          {/* Streak counter (always show if > 0) */}
          {!milestone && newStreak !== undefined && newStreak > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-orange-500 mb-4">
              <Flame className="w-4 h-4" />
              {newStreak}-day streak!
            </div>
          )}

          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onFinish, 300);
            }}
            className="w-full bg-zinc-950 text-white font-semibold rounded-xl py-3 hover:bg-zinc-800 transition-colors active:scale-95"
          >
            Continue 🚀
          </button>
        </div>
      </div>

      <style>{`
        @keyframes celebPop {
          from { opacity: 0; transform: scale(0.5) translateY(40px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes starPop {
          from { opacity: 0; transform: scale(0) rotate(-30deg); }
          to   { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes xpBounce {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
}
