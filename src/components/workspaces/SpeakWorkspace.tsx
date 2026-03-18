"use client";

import { useState, useEffect, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Mic, Square, Loader2, CheckCircle } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

export default function SpeakWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      setIsRecording(false);
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const toggleRecording = () => {
    if (isFinished || isCompleted) return;
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setIsFinished(true);
    }
  };

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeTask(task.id, `Audio Recording - ${60 - timeLeft}s`);
      if (res.success) {
        setShowCelebration(true);
      }
    });
  };

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

      <div className="max-w-xl mx-auto h-full flex flex-col items-center justify-center text-center py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Speaking Challenge</h2>
          <p className="text-zinc-500">Read the prompt below and speak your answer clearly.</p>
        </div>

        <div className="bg-white shadow-sm border border-zinc-200 rounded-3xl p-8 mb-16 w-full hover:border-zinc-300 transition-colors">
          <p className="text-xl font-medium text-zinc-800 leading-relaxed italic">&quot;{task.content}&quot;</p>
        </div>

        <div className="relative flex items-center justify-center mb-16 mt-4">
          {isRecording && (
            <>
              <div className="absolute w-32 h-32 bg-red-500/20 rounded-full animate-ping" />
              <div className="absolute w-44 h-44 bg-red-500/10 rounded-full animate-pulse" />
            </>
          )}
          
          <button
            onClick={toggleRecording}
            disabled={isFinished || isCompleted}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isFinished || isCompleted
               ? "bg-emerald-100 text-emerald-600 cursor-not-allowed scale-100" 
               : isRecording 
                  ? "bg-red-500 text-white shadow-xl shadow-red-500/30 scale-110" 
                  : "bg-zinc-950 text-white hover:scale-105 shadow-lg"
            }`}
          >
            {isFinished || isCompleted ? (
              <CheckCircle className="w-10 h-10" />
            ) : isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        <div className={`text-4xl font-mono font-bold mb-12 transition-colors ${isRecording ? "text-red-500" : "text-zinc-800"}`}>
          00:{timeLeft.toString().padStart(2, "0")}
        </div>

        <button
          onClick={handleComplete}
          disabled={isPending || (!isFinished && !isCompleted) || isCompleted}
          className={`w-full max-w-xs text-white rounded-xl py-3.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            isFinished && !isCompleted 
              ? "bg-zinc-950 hover:bg-zinc-800 shadow-lg shadow-zinc-950/20" 
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isCompleted ? "Already Submitted" : "Submit Recording"}
        </button>
      </div>
    </>
  );
}
