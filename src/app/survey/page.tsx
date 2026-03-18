"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const AVATARS = ["🐨", "🦊", "🐸", "🦁", "🐻", "🦋", "🐬", "🦄", "🐙", "🐧"];

const SURVEY_STEPS = [
  {
    id: "avatar",
    mascotText: "Chào mừng! Hãy chọn avatar cho bạn nhé! 🎉",
    title: "Pick your avatar",
  },
  {
    id: "native",
    mascotText: "Ngôn ngữ mẹ đẻ của bạn là gì?",
    title: "What's your native language?",
  },
  {
    id: "goal",
    mascotText: "Tại sao bạn muốn học tiếng Anh?",
    title: "What's your learning goal?",
  },
  {
    id: "level",
    mascotText: "Trình độ tiếng Anh hiện tại của bạn như thế nào?",
    title: "What is your current English level?",
  },
  {
    id: "deadline",
    mascotText: "Bạn muốn đạt mục tiêu trong bao lâu? ⏰",
    title: "How long to reach your goal?",
  },
  {
    id: "daily",
    mascotText: "Mỗi ngày bạn có thể dành bao nhiêu thời gian?",
    title: "How much time per day?",
  },
];

const NATIVE_LANGUAGES = ["Vietnamese", "English", "Swedish", "Chinese", "Japanese", "Korean", "French", "Other"];
const LEARNING_GOALS = [
  { value: "work", label: "💼 Work abroad", desc: "Career opportunities" },
  { value: "travel", label: "✈️ Travel", desc: "Explore the world" },
  { value: "study", label: "📚 Study", desc: "Academic purposes" },
  { value: "family", label: "👪 Family", desc: "Connect with relatives" },
  { value: "culture", label: "🎭 Culture", desc: "Enjoy media & art" },
  { value: "fun", label: "😄 Just for fun", desc: "Love languages" },
];
const LEVELS = [
  { value: "beginner", label: "🌱 Beginner", desc: "Starting from scratch" },
  { value: "elementary", label: "🌿 Elementary (A1-A2)", desc: "Know basic words" },
  { value: "intermediate", label: "🌳 Intermediate (B1-B2)", desc: "Can hold a conversation" },
  { value: "advanced", label: "🏆 Advanced (C1+)", desc: "Nearly fluent" },
];
const DEADLINE_OPTIONS = [
  { value: 7, label: "1 week", emoji: "⚡", desc: "Extreme sprint!", intensity: "EXTREME" },
  { value: 14, label: "2 weeks", emoji: "🔥", desc: "Hardcore grind", intensity: "HARD" },
  { value: 30, label: "1 month", emoji: "🚀", desc: "Intensive focus", intensity: "INTENSIVE" },
  { value: 60, label: "2 months", emoji: "🏃", desc: "Steady & serious", intensity: "SERIOUS" },
  { value: 90, label: "3 months", emoji: "🚶", desc: "Comfortable pace", intensity: "COMFORTABLE" },
  { value: 180, label: "6 months", emoji: "🐌", desc: "Relaxed journey", intensity: "RELAXED" },
];
const DAILY_GOALS = [
  { value: 5, label: "5 min", emoji: "🐌", desc: "Casual" },
  { value: 10, label: "10 min", emoji: "🚶", desc: "Regular" },
  { value: 15, label: "15 min", emoji: "🏃", desc: "Serious" },
  { value: 30, label: "30 min", emoji: "🚀", desc: "Intensive" },
];

interface SurveyData {
  avatar: string;
  nativeLanguage: string;
  learningGoal: string;
  currentLevel: string;
  goalDeadlineDays: number;
  dailyGoalMinutes: number;
  activeTrack: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({
    avatar: "🐨",
    nativeLanguage: "",
    learningGoal: "",
    currentLevel: "",
    goalDeadlineDays: 30,
    dailyGoalMinutes: 15,
    activeTrack: "UX_ENGLISH",
  });
  const [submitting, setSubmitting] = useState(false);
  const [mascotBounce, setMascotBounce] = useState(false);

  const totalSteps = SURVEY_STEPS.length;
  const currentStep = SURVEY_STEPS[step];
  const progress = ((step + 1) / totalSteps) * 100;

  useEffect(() => {
    setMascotBounce(true);
    const t = setTimeout(() => setMascotBounce(false), 600);
    return () => clearTimeout(t);
  }, [step]);

  const canGoNext = () => {
    if (currentStep.id === "avatar") return true;
    if (currentStep.id === "native") return !!data.nativeLanguage;
    if (currentStep.id === "goal") return !!data.learningGoal;
    if (currentStep.id === "level") return !!data.currentLevel;
    if (currentStep.id === "deadline") return !!data.goalDeadlineDays;
    if (currentStep.id === "daily") return !!data.dailyGoalMinutes;
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  };

  const selectedDeadline = DEADLINE_OPTIONS.find((d) => d.value === data.goalDeadlineDays);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-2 bg-zinc-100 fixed top-0 left-0 z-10">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500 rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-xl mx-auto w-full">
        {/* Mascot */}
        <div
          className={`text-6xl mb-6 transition-transform duration-100 ${mascotBounce ? "scale-125" : "scale-100"}`}
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))" }}
        >
          🦜
        </div>

        {/* Mascot speech bubble */}
        <div className="relative bg-white border-2 border-zinc-200 rounded-2xl px-5 py-3 mb-8 shadow-sm max-w-xs text-center">
          <p className="text-zinc-700 font-semibold text-sm leading-relaxed">{currentStep.mascotText}</p>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-zinc-200 rotate-45" />
        </div>

        {/* Step content */}
        <div className="w-full">
          {/* AVATAR */}
          {currentStep.id === "avatar" && (
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setData((d) => ({ ...d, avatar: a }))}
                  className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all border-2 ${
                    data.avatar === a
                      ? "border-sky-400 bg-sky-50 scale-110 shadow-lg shadow-sky-200"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:scale-105"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* NATIVE LANGUAGE */}
          {currentStep.id === "native" && (
            <div className="grid grid-cols-2 gap-3">
              {NATIVE_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setData((d) => ({ ...d, nativeLanguage: lang }))}
                  className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm text-left transition-all ${
                    data.nativeLanguage === lang
                      ? "border-sky-400 bg-sky-50 text-sky-800"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* LEARNING GOAL */}
          {currentStep.id === "goal" && (
            <div className="grid grid-cols-2 gap-3">
              {LEARNING_GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setData((d) => ({ ...d, learningGoal: g.value }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    data.learningGoal === g.value
                      ? "border-sky-400 bg-sky-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <p className="font-bold text-zinc-900 text-sm">{g.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL */}
          {currentStep.id === "level" && (
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setData((d) => ({ ...d, currentLevel: l.value }))}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                    data.currentLevel === l.value
                      ? "border-sky-400 bg-sky-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span className="text-2xl">{l.label.split(" ")[0]}</span>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">{l.label.split(" ").slice(1).join(" ")}</p>
                    <p className="text-xs text-zinc-500">{l.desc}</p>
                  </div>
                  {data.currentLevel === l.value && (
                    <Check className="w-5 h-5 text-sky-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* DEADLINE */}
          {currentStep.id === "deadline" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {DEADLINE_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setData((prev) => ({ ...prev, goalDeadlineDays: d.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.goalDeadlineDays === d.value
                        ? "border-sky-400 bg-sky-50 shadow-md"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-2xl mb-1">{d.emoji}</p>
                    <p className="font-black text-zinc-900 text-base">{d.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{d.desc}</p>
                    <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                      d.intensity === "EXTREME" ? "bg-red-100 text-red-600" :
                      d.intensity === "HARD" ? "bg-orange-100 text-orange-600" :
                      d.intensity === "INTENSIVE" ? "bg-amber-100 text-amber-600" :
                      d.intensity === "SERIOUS" ? "bg-blue-100 text-blue-600" :
                      d.intensity === "COMFORTABLE" ? "bg-emerald-100 text-emerald-600" :
                      "bg-zinc-100 text-zinc-500"
                    }`}>
                      {d.intensity}
                    </span>
                  </button>
                ))}
              </div>
              {selectedDeadline && (
                <div className="mt-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-700 font-medium">
                  🎯 We&apos;ll generate a <strong>{selectedDeadline.intensity.toLowerCase()}</strong> roadmap with tasks packed into <strong>{selectedDeadline.label}</strong> to hit your goal!
                </div>
              )}
            </div>
          )}

          {/* DAILY GOAL */}
          {currentStep.id === "daily" && (
            <div className="grid grid-cols-2 gap-3">
              {DAILY_GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setData((d) => ({ ...d, dailyGoalMinutes: g.value }))}
                  className={`p-5 rounded-xl border-2 text-center transition-all ${
                    data.dailyGoalMinutes === g.value
                      ? "border-sky-400 bg-sky-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <p className="text-3xl mb-1">{g.emoji}</p>
                  <p className="font-black text-zinc-900 text-lg">{g.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full mt-8 gap-4">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="flex items-center gap-1 text-zinc-400 font-semibold text-sm disabled:opacity-0 hover:text-zinc-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-1.5">
            {SURVEY_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-sky-400" : i < step ? "w-3 bg-sky-300" : "w-3 bg-zinc-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext() || submitting}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-sky-200"
          >
            {submitting ? "Saving..." : step === totalSteps - 1 ? "Start Learning! 🚀" : "Continue"}
            {!submitting && step < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
