"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trophy, Zap } from "lucide-react";

interface CelebrationProps {
  xpReward: number;
  onFinish: () => void;
}

// Simple Web Audio API sound generation
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.45);
    });
  } catch {}
}

const PARTICLE_COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6",
  "#f97316", "#14b8a6", "#ef4444", "#84cc16", "#06b6d4"
];

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: 8 + Math.random() * 8,
        h: 8 + Math.random() * 8,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 4,
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
        p.vy += 0.1; // gravity
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.015);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < 120) {
        frameId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default function TaskCompletionCelebration({ xpReward, onFinish }: CelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    playSuccessSound();
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 300);
    }, 3200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <>
      <Confetti />
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
                style={{ animation: `starPop 0.4s ${i * 0.12 + 0.2}s both cubic-bezier(0.175,0.885,0.32,1.275)` }}
              />
            ))}
          </div>

          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">Task Complete!</h2>
          <p className="text-zinc-500 text-sm mb-6">You&apos;re on a roll! Keep going!</p>

          <div
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-3 mb-6"
            style={{ animation: "xpBounce 0.5s 0.5s both" }}
          >
            <Zap className="w-6 h-6 text-emerald-500 fill-emerald-100" />
            <span className="text-2xl font-black text-emerald-600">+{xpReward} XP</span>
          </div>

          <button
            onClick={() => { setVisible(false); setTimeout(onFinish, 300); }}
            className="w-full bg-zinc-950 text-white font-semibold rounded-xl py-3 hover:bg-zinc-800 transition-colors active:scale-95"
          >
            Continue 🚀
          </button>
        </div>
      </div>

      <style>{`
        @keyframes celebPop {
          from { opacity: 0; transform: scale(0.5) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes starPop {
          from { opacity: 0; transform: scale(0) rotate(-30deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes xpBounce {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
