"use client";

import { useState, useEffect, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Mic, Square, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

const PHASES = [
  { time: 240, label: "Round 1: 4 Minutes", desc: "Speak comprehensively about the topic." },
  { time: 180, label: "Round 2: 3 Minutes", desc: "Condense your thoughts. Speak faster and more clearly." },
  { time: 120, label: "Round 3: 2 Minutes", desc: "Final sprint! Deliver your core message flawlessly." }
];

export default function SpeakWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].time);
  const [phaseFinished, setPhaseFinished] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const isAllFinished = phaseIndex >= PHASES.length;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      setIsRecording(false);
      setPhaseFinished(true);
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const toggleRecording = () => {
    if (phaseFinished || isCompleted || isAllFinished) return;
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setPhaseFinished(true);
    }
  };

  const nextPhase = () => {
    const nextIdx = phaseIndex + 1;
    setPhaseIndex(nextIdx);
    setPhaseFinished(false);
    if (nextIdx < PHASES.length) {
      setTimeLeft(PHASES[nextIdx].time);
    }
  };

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeTask(task.id, `4-3-2 Method Completed`);
      if (res.success) {
        setShowCelebration(true);
      }
    });
  };

  const currentPhase = PHASES[Math.min(phaseIndex, PHASES.length - 1)];

  return (
    <>
      {showCelebration && (
        <TaskCompletionCelebration
          xpReward={task.xpReward}
          onFinish={() => {
            setShowCelebration(false);
            router.push("/dashboard");
            router.refresh();
          }}
        />
      )}

      <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-zinc-900 mb-2">4-3-2 Speaking Method</h2>
          <p className="text-zinc-500">Master fluency by repeating the same topic with decreasing time constraints.</p>
        </div>

        {/* Phase Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-sm">
          {PHASES.map((p, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-1.5 rounded-full transition-colors ${
                  idx < phaseIndex ? "bg-emerald-500" :
                  idx === phaseIndex ? "bg-red-500" : "bg-zinc-200"
                }`}
              />
              <span className={`text-[10px] font-bold ${idx === phaseIndex ? "text-zinc-900" : "text-zinc-400"}`}>
                {p.time / 60}m
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-sm border border-zinc-200 rounded-3xl p-6 mb-10 w-full hover:border-zinc-300 transition-colors">
          <p className="text-lg font-medium text-zinc-800 leading-relaxed italic">&quot;{task.content}&quot;</p>
        </div>

        {!isAllFinished && (
          <div className="mb-6 flex flex-col items-center">
            <span className="text-sm font-black text-red-500 uppercase tracking-widest">{currentPhase.label}</span>
            <span className="text-xs text-zinc-500 mt-1">{currentPhase.desc}</span>
          </div>
        )}

        <div className="relative flex items-center justify-center mb-10 mt-2">
          {isRecording && (
            <>
              <div className="absolute w-32 h-32 bg-red-500/20 rounded-full animate-ping" />
              <div className="absolute w-44 h-44 bg-red-500/10 rounded-full animate-pulse" />
            </>
          )}
          
          <button
            onClick={toggleRecording}
            disabled={phaseFinished || isCompleted || isAllFinished}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isCompleted || isAllFinished
               ? "bg-emerald-100 text-emerald-600 cursor-not-allowed scale-100" 
               : phaseFinished
               ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
               : isRecording 
                  ? "bg-red-500 text-white shadow-xl shadow-red-500/30 scale-110" 
                  : "bg-zinc-950 text-white hover:scale-105 shadow-lg"
            }`}
          >
            {isCompleted || isAllFinished ? (
              <CheckCircle className="w-10 h-10" />
            ) : phaseFinished ? (
              <CheckCircle className="w-8 h-8" />
            ) : isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        {!isAllFinished && (
          <div className={`text-4xl font-mono font-bold mb-10 transition-colors ${isRecording ? "text-red-500" : phaseFinished ? "text-emerald-500" : "text-zinc-800"}`}>
            {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}

        {phaseFinished && !isAllFinished && !isCompleted && (
          <button
            onClick={nextPhase}
            className="w-full max-w-xs bg-red-50 text-red-600 border border-red-200 rounded-xl py-3.5 font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-colors mb-4"
          >
            Start Next Round <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isAllFinished && !isCompleted && (
          <div className="w-full max-w-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-emerald-700 font-medium text-sm">
            Tada! You completed all 3 rounds of the 4-3-2 method! 🎉
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={isPending || (!isAllFinished && !isCompleted) || isCompleted}
          className={`w-full max-w-xs text-white rounded-xl py-3.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            isAllFinished && !isCompleted 
              ? "bg-zinc-950 hover:bg-zinc-800 shadow-lg shadow-zinc-950/20" 
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isCompleted ? "Already Submitted" : "Complete Task"}
        </button>
      </div>
    </>
  );
}
