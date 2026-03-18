"use client";

import { Mic, Headphones, BookOpen, PenTool, HelpCircle } from "lucide-react";

const TASK_TYPE_CONFIG = {
  SPEAK: { label: "Speak", icon: Mic, color: "#f43f5e", bg: "#fff1f2" },
  LISTEN: { label: "Listen", icon: Headphones, color: "#3b82f6", bg: "#eff6ff" },
  READ: { label: "Read", icon: BookOpen, color: "#8b5cf6", bg: "#f5f3ff" },
  WRITE: { label: "Write", icon: PenTool, color: "#f59e0b", bg: "#fffbeb" },
  QUIZ: { label: "Quiz", icon: HelpCircle, color: "#10b981", bg: "#ecfdf5" },
};

interface Props {
  xpByDay: { label: string; xp: number }[];
  tasksByType: Record<string, number>;
  englishCompleted: number;
  swedishCompleted: number;
}

export default function ProgressCharts({ xpByDay, tasksByType, englishCompleted, swedishCompleted }: Props) {
  const maxXp = Math.max(...xpByDay.map((d) => d.xp), 1);
  const totalTyped = Object.values(tasksByType).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* XP Bar Chart */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 mb-4">XP This Week</h3>
        <div className="flex items-end justify-between gap-2 h-36">
          {xpByDay.map((day, i) => {
            const pct = (day.xp / maxXp) * 100;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold text-zinc-400 transition-all">
                  {day.xp > 0 ? day.xp : ""}
                </span>
                <div className="w-full relative flex items-end justify-center" style={{ height: "90px" }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(pct, day.xp > 0 ? 5 : 2)}%`,
                      background: day.xp > 0
                        ? "linear-gradient(to top, #10b981, #34d399)"
                        : "#f4f4f5",
                      minHeight: "4px",
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task type donut */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 mb-4">Tasks by Type</h3>
        {totalTyped === 1 && Object.keys(tasksByType).length === 0 ? (
          <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">No tasks completed yet</div>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(TASK_TYPE_CONFIG).map(([type, cfg]) => {
              const count = tasksByType[type] || 0;
              const pct = Math.round((count / totalTyped) * 100);
              const TypeIcon = cfg.icon;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                    <TypeIcon className="w-3 h-3" style={{ color: cfg.color }} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 w-12 shrink-0">{cfg.label}</span>
                  <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cfg.color }}
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Track progress comparison */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm md:col-span-2">
        <h3 className="text-sm font-bold text-zinc-900 mb-4">Track Comparison</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* English */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🇬🇧</span>
              <span className="text-sm font-semibold text-zinc-700">English Track</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-sky-600">{englishCompleted}</p>
              <p className="text-sm text-zinc-400 mb-1 font-medium">tasks done</p>
            </div>
            <div className="mt-2 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((englishCompleted / Math.max(englishCompleted + swedishCompleted, 1)) * 100, 100)}%`,
                  background: "linear-gradient(to right, #0ea5e9, #3b82f6)"
                }}
              />
            </div>
          </div>

          {/* Swedish */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🇸🇪</span>
              <span className="text-sm font-semibold text-zinc-700">Swedish Track</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-yellow-500">{swedishCompleted}</p>
              <p className="text-sm text-zinc-400 mb-1 font-medium">tasks done</p>
            </div>
            <div className="mt-2 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((swedishCompleted / Math.max(englishCompleted + swedishCompleted, 1)) * 100, 100)}%`,
                  background: "linear-gradient(to right, #eab308, #f59e0b)"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
