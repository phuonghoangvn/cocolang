"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Mic, Headphones, BookOpen, PenTool, HelpCircle,
  CheckCircle2, Lock, ChevronDown, Globe, Star, Zap
} from "lucide-react";

const TASK_TYPE_CONFIG = {
  SPEAK: { icon: Mic, label: "Speak", color: "#f43f5e", bg: "#fff1f2", nodeGrad: "from-rose-400 to-pink-500" },
  LISTEN: { icon: Headphones, label: "Listen", color: "#3b82f6", bg: "#eff6ff", nodeGrad: "from-blue-400 to-sky-500" },
  READ: { icon: BookOpen, label: "Read", color: "#8b5cf6", bg: "#f5f3ff", nodeGrad: "from-violet-400 to-purple-500" },
  WRITE: { icon: PenTool, label: "Write", color: "#f59e0b", bg: "#fffbeb", nodeGrad: "from-amber-400 to-orange-400" },
  QUIZ: { icon: HelpCircle, label: "Quiz", color: "#10b981", bg: "#ecfdf5", nodeGrad: "from-emerald-400 to-teal-500" },
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];

const LEVEL_COLORS: Record<string, string> = {
  A1: "from-green-400 to-emerald-500",
  A2: "from-teal-400 to-cyan-500",
  B1: "from-sky-400 to-blue-500",
  B2: "from-violet-400 to-purple-500",
  C1: "from-rose-400 to-pink-500",
};

// Zigzag positions for nodes in a snake pattern
function getNodePosition(index: number, totalPerRow = 4) {
  const row = Math.floor(index / totalPerRow);
  const col = index % totalPerRow;
  const isEvenRow = row % 2 === 0;
  const x = isEvenRow ? col : totalPerRow - 1 - col;
  return { x, y: row };
}

interface TrackRoadmapProps {
  tasks: any[];
  completedIds: string[];
  activeTrack: string;
  onSwitchTrack: (t: string) => void;
  userAvatar: string;
}

export default function DuolingoRoadmap({
  tasks, completedIds, activeTrack, onSwitchTrack, userAvatar
}: TrackRoadmapProps) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = tasks.filter((t) => t.category === activeTrack);
  const totalDone = filtered.filter((t) => completedIds.includes(t.id)).length;

  // Group by level
  const grouped: Record<string, any[]> = {};
  for (const t of filtered) {
    if (!grouped[t.level]) grouped[t.level] = [];
    grouped[t.level].push(t);
  }

  const NODES_PER_ROW = 4;

  return (
    <div className="flex flex-col">
      {/* Course switcher header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-3.5 flex items-center justify-between">
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setShowSwitcher((v) => !v)}
            className="flex items-center gap-3 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors font-bold text-sm text-zinc-900"
          >
            <span className="text-lg">{activeTrack === "SWEDISH" ? "🇸🇪" : "🇬🇧"}</span>
            {activeTrack === "SWEDISH" ? "Swedish" : "English"}
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showSwitcher ? "rotate-180" : ""}`} />
          </button>

          {showSwitcher && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-30 min-w-[200px]">
              <div className="px-4 py-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100">
                MY COURSES
              </div>
              {[
                { value: "SWEDISH", label: "Swedish", emoji: "🇸🇪" },
                { value: "UX_ENGLISH", label: "English", emoji: "🇬🇧" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => { onSwitchTrack(t.value); setShowSwitcher(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors ${
                    activeTrack === t.value ? "bg-sky-50 text-sky-700" : "text-zinc-700"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="font-semibold text-sm">{t.label}</span>
                  {activeTrack === t.value && <CheckCircle2 className="w-4 h-4 text-sky-500 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          {totalDone} done
        </div>
      </div>

      {/* Roadmap path */}
      <div className="px-6 py-8 space-y-12">
        {LEVEL_ORDER.filter((lvl) => grouped[lvl]?.length > 0).map((level, levelIdx) => {
          const levelTasks = grouped[level];
          const levelGrad = LEVEL_COLORS[level] || "from-zinc-400 to-zinc-500";

          return (
            <div key={level}>
              {/* Level banner */}
              <div className={`bg-gradient-to-r ${levelGrad} rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-md`}>
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Level</p>
                  <h2 className="text-white text-2xl font-black">{level}</h2>
                </div>
                <div className="text-white/90 text-4xl">
                  {level === "A1" ? "🌱" : level === "A2" ? "🌿" : level === "B1" ? "🌳" : level === "B2" ? "🏆" : "👑"}
                </div>
              </div>

              {/* Snake path nodes */}
              <div className="relative">
                {/* Connector lines drawn as absolute positioned divs */}
                <div className="flex flex-col gap-4">
                  {/* Chunk tasks into rows of NODES_PER_ROW */}
                  {Array.from({ length: Math.ceil(levelTasks.length / NODES_PER_ROW) }, (_, rowIdx) => {
                    const rowTasks = levelTasks.slice(rowIdx * NODES_PER_ROW, (rowIdx + 1) * NODES_PER_ROW);
                    const isEvenRow = rowIdx % 2 === 0;
                    const orderedRow = isEvenRow ? rowTasks : [...rowTasks].reverse();

                    return (
                      <div key={rowIdx} className={`flex gap-4 justify-center ${isEvenRow ? "" : "flex-row-reverse"}`}>
                        {orderedRow.map((task: any, colIdx: number) => {
                          const globalIdx = rowIdx * NODES_PER_ROW + (isEvenRow ? colIdx : rowTasks.length - 1 - colIdx);
                          const prevTask = levelTasks[globalIdx - 1];
                          const isCompleted = completedIds.includes(task.id);
                          const isActive = !isCompleted && (!prevTask || completedIds.includes(prevTask.id));
                          const cfg = TASK_TYPE_CONFIG[task.type as keyof typeof TASK_TYPE_CONFIG] || TASK_TYPE_CONFIG.READ;
                          const TypeIcon = cfg.icon;

                          return (
                            <div key={task.id} className="flex flex-col items-center gap-1.5 relative">
                              {/* Tooltip label above active node */}
                              {isActive && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg z-10">
                                  START
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                                </div>
                              )}

                              <Link
                                href={isCompleted || isActive ? `/dashboard/task/${task.id}` : "#"}
                                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ${
                                  isCompleted
                                    ? `bg-gradient-to-br ${cfg.nodeGrad} shadow-lg opacity-80`
                                    : isActive
                                    ? `bg-gradient-to-br ${cfg.nodeGrad} shadow-xl shadow-current/30 scale-110 ring-4 ring-white animate-pulse`
                                    : "bg-zinc-200 cursor-not-allowed"
                                }`}
                                onClick={!isCompleted && !isActive ? (e) => e.preventDefault() : undefined}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-7 h-7 text-white fill-white/30" />
                                ) : isActive ? (
                                  <TypeIcon className="w-7 h-7 text-white" />
                                ) : (
                                  <Lock className="w-5 h-5 text-zinc-400" />
                                )}

                                {/* XP badge on completed */}
                                {isCompleted && (
                                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    ✓
                                  </div>
                                )}
                              </Link>

                              {/* Type label */}
                              <span className={`text-[10px] font-bold ${
                                isCompleted ? "text-zinc-500" : isActive ? "text-zinc-700" : "text-zinc-400"
                              }`}>
                                {cfg.label}
                              </span>
                              <span className={`text-[10px] truncate max-w-[72px] text-center leading-tight font-medium ${
                                isCompleted ? "text-zinc-400 line-through" : isActive ? "text-zinc-600" : "text-zinc-300"
                              }`}>
                                {task.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <div className="text-5xl mb-4">✨</div>
            <p className="font-semibold">Generating your curriculum with AI...</p>
            <p className="text-sm mt-1">Check back in a moment!</p>
          </div>
        )}

        {/* Mascot at the bottom */}
        <div className="flex flex-col items-center py-8 gap-3 text-zinc-400 text-sm">
          <div className="text-5xl">{userAvatar || "🦜"}</div>
          <p className="font-semibold text-zinc-500">You&apos;re doing amazing!</p>
        </div>
      </div>
    </div>
  );
}
