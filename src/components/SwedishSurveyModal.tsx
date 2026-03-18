"use client";

import { useState } from "react";
import { X, ChevronRight, Check, Loader2 } from "lucide-react";

const SWEDISH_GOALS = [
  { value: "work", label: "💼 Work in Sweden", desc: "IKEA, Spotify, Volvo..." },
  { value: "travel", label: "✈️ Visit Scandinavia", desc: "Explore the North" },
  { value: "study", label: "📚 Study in Sweden", desc: "Top Nordic universities" },
  { value: "family", label: "👪 Swedish family/partner", desc: "Personal connections" },
  { value: "culture", label: "🎭 Culture & media", desc: "Films, music, literature" },
  { value: "fun", label: "😄 Challenge myself", desc: "Love tough languages" },
];

const CURRENT_LEVELS = [
  { value: "A1", label: "🌱 A1 – Complete beginner", desc: "Never studied Swedish" },
  { value: "A2", label: "🌿 A2 – Elementary", desc: "Know a few words & phrases" },
  { value: "B1", label: "🌳 B1 – Intermediate", desc: "Can hold simple conversations" },
  { value: "B2", label: "🏆 B2 – Upper Intermediate", desc: "Nearly fluent in daily life" },
];

const TARGET_LEVELS = [
  { value: "A2", label: "🌿 A2", desc: "Basic conversations" },
  { value: "B1", label: "🌳 B1", desc: "Everyday interactions" },
  { value: "B2", label: "🏆 B2", desc: "Work & study ready" },
  { value: "C1", label: "👑 C1", desc: "Fluent & professional" },
];

const DEADLINE_OPTIONS = [
  { value: 7, label: "1 week", emoji: "⚡", badge: "EXTREME", badgeColor: "bg-red-100 text-red-600" },
  { value: 14, label: "2 weeks", emoji: "🔥", badge: "HARDCORE", badgeColor: "bg-orange-100 text-orange-600" },
  { value: 30, label: "1 month", emoji: "🚀", badge: "INTENSIVE", badgeColor: "bg-amber-100 text-amber-600" },
  { value: 60, label: "2 months", emoji: "🏃", badge: "SERIOUS", badgeColor: "bg-blue-100 text-blue-600" },
  { value: 90, label: "3 months", emoji: "🚶", badge: "STEADY", badgeColor: "bg-emerald-100 text-emerald-600" },
  { value: 180, label: "6 months", emoji: "🐌", badge: "RELAXED", badgeColor: "bg-zinc-100 text-zinc-500" },
];

const STEPS = [
  { id: "goal", title: "Why learn Swedish?", mascot: "What's your main motivation for learning Swedish? 🇸🇪" },
  { id: "currentLevel", title: "Your current level?", mascot: "How much Swedish do you already know?" },
  { id: "targetLevel", title: "Where do you want to reach?", mascot: "What level do you want to achieve?" },
  { id: "deadline", title: "Your timeline?", mascot: "How much time do you have? ⏰" },
];

interface SwedishSurveyModalProps {
  onClose: () => void;
  onComplete: (data: SwedishEnrollmentData) => void;
}

export interface SwedishEnrollmentData {
  learningGoal: string;
  currentLevel: string;
  targetLevel: string;
  goalDeadlineDays: number;
}

export default function SwedishSurveyModal({ onClose, onComplete }: SwedishSurveyModalProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SwedishEnrollmentData>({
    learningGoal: "",
    currentLevel: "",
    targetLevel: "C1",
    goalDeadlineDays: 90,
  });
  const [submitting, setSubmitting] = useState(false);

  const currentStepDef = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canNext = () => {
    if (currentStepDef.id === "goal") return !!data.learningGoal;
    if (currentStepDef.id === "currentLevel") return !!data.currentLevel;
    if (currentStepDef.id === "targetLevel") return !!data.targetLevel;
    if (currentStepDef.id === "deadline") return !!data.goalDeadlineDays;
    return false;
  };

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      try {
        await fetch("/api/enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "SWEDISH",
            ...data,
          }),
        });
        onComplete(data);
      } catch (e) {
        console.error(e);
        onComplete(data);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const selectedDeadline = DEADLINE_OPTIONS.find((d) => d.value === data.goalDeadlineDays);

  // Filter valid target levels (must be above current)
  const validTargets = TARGET_LEVELS.filter(
    (t) => !data.currentLevel || t.value > data.currentLevel
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-zinc-100">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 rounded-r-full"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇸🇪</span>
            <span className="font-black text-zinc-900 text-sm">Add Swedish Course</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Mascot bubble */}
        <div className="px-6 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-2xl">🦜</span>
            <p className="text-zinc-700 font-semibold text-sm leading-relaxed">{currentStepDef.mascot}</p>
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 max-h-80 overflow-y-auto space-y-2">
          {/* GOAL */}
          {currentStepDef.id === "goal" && (
            <div className="grid grid-cols-2 gap-2">
              {SWEDISH_GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setData((d) => ({ ...d, learningGoal: g.value }))}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    data.learningGoal === g.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <p className="font-bold text-zinc-900 text-sm">{g.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* CURRENT LEVEL */}
          {currentStepDef.id === "currentLevel" && (
            <div className="space-y-2">
              {CURRENT_LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => {
                    setData((d) => ({
                      ...d,
                      currentLevel: l.value,
                      // Reset target if it's now invalid
                      targetLevel: d.targetLevel > l.value ? d.targetLevel : "C1",
                    }));
                  }}
                  className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                    data.currentLevel === l.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span className="text-xl">{l.label.split(" ")[0]}</span>
                  <div className="flex-1">
                    <p className="font-bold text-zinc-900 text-sm">{l.label.split(" – ")[1]}</p>
                    <p className="text-xs text-zinc-500">{l.desc}</p>
                  </div>
                  {data.currentLevel === l.value && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* TARGET LEVEL */}
          {currentStepDef.id === "targetLevel" && (
            <div className="grid grid-cols-2 gap-2">
              {validTargets.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setData((d) => ({ ...d, targetLevel: t.value }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    data.targetLevel === t.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <p className="font-black text-zinc-900 text-xl">{t.label.split(" ")[1]}</p>
                  <p className="text-lg mb-1">{t.label.split(" ")[0]}</p>
                  <p className="text-xs text-zinc-500">{t.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* DEADLINE */}
          {currentStepDef.id === "deadline" && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {DEADLINE_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setData((prev) => ({ ...prev, goalDeadlineDays: d.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      data.goalDeadlineDays === d.value
                        ? "border-amber-400 bg-amber-50 shadow-sm"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-xl mb-0.5">{d.emoji}</p>
                    <p className="font-black text-zinc-900 text-xs">{d.label}</p>
                    <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${d.badgeColor}`}>
                      {d.badge}
                    </span>
                  </button>
                ))}
              </div>
              {selectedDeadline && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-medium">
                  🎯 We&apos;ll generate a <strong>{selectedDeadline.badge.toLowerCase()}</strong> roadmap going from{" "}
                  <strong>{data.currentLevel || "A1"}</strong> to <strong>{data.targetLevel}</strong> in{" "}
                  <strong>{selectedDeadline.label}</strong>!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="border-t border-zinc-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="text-sm font-semibold text-zinc-400 hover:text-zinc-600 disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-amber-400" : i < step ? "w-2 bg-amber-300" : "w-2 bg-zinc-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canNext() || submitting}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all active:scale-95"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : isLast ? (
              "Start Swedish! 🇸🇪"
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
