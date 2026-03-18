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
    mascotText: "Tại sao bạn muốn học?",
    title: "What's your learning goal?",
  },
  {
    id: "level",
    mascotText: "Trình độ hiện tại của bạn như thế nào?",
    title: "What is your current level?",
  },
  {
    id: "daily",
    mascotText: "Mỗi ngày bạn có thể dành bao nhiêu thời gian?",
    title: "How much time per day?",
  },
  {
    id: "track",
    mascotText: "Bạn muốn bắt đầu học ngôn ngữ nào trước?",
    title: "Choose your first course",
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
const DAILY_GOALS = [
  { value: 5, label: "5 min", emoji: "🐌", desc: "Casual" },
  { value: 10, label: "10 min", emoji: "🚶", desc: "Regular" },
  { value: 15, label: "15 min", emoji: "🏃", desc: "Serious" },
  { value: 30, label: "30 min", emoji: "🚀", desc: "Intensive" },
];
const TRACKS = [
  { value: "SWEDISH", label: "Swedish", emoji: "🇸🇪", desc: "A1 → C1 full journey", color: "from-yellow-400 to-amber-500" },
  { value: "UX_ENGLISH", label: "English", emoji: "🇬🇧", desc: "B1 → C1 in 30 days", color: "from-sky-400 to-blue-600" },
];

interface SurveyData {
  avatar: string;
  nativeLanguage: string;
  learningGoal: string;
  currentLevel: string;
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
    dailyGoalMinutes: 15,
    activeTrack: "SWEDISH",
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
    if (currentStep.id === "daily") return !!data.dailyGoalMinutes;
    if (currentStep.id === "track") return !!data.activeTrack;
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

          {/* TRACK */}
          {currentStep.id === "track" && (
            <div className="space-y-4">
              {TRACKS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setData((d) => ({ ...d, activeTrack: t.value }))}
                  className={`w-full p-6 rounded-2xl border-2 flex items-center gap-5 transition-all ${
                    data.activeTrack === t.value
                      ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span className="text-5xl">{t.emoji}</span>
                  <div className="text-left">
                    <p className="font-black text-zinc-900 text-xl">{t.label}</p>
                    <p className="text-sm text-zinc-500">{t.desc}</p>
                  </div>
                  {data.activeTrack === t.value && (
                    <Check className="w-6 h-6 text-sky-500 ml-auto" />
                  )}
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
