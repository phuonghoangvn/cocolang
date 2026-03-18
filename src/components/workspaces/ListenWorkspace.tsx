"use client";

import { useState, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Headphones, CheckCircle2, Circle, Loader2 } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

export default function ListenWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const mockOptions = [
    "Yes, I completely agree.",
    "No, I have a different opinion.",
    "I'm not sure what you mean.",
    "Could you repeat the question?"
  ];

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeTask(task.id, mockOptions[selectedAnswer || 0]);
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

      <div className="max-w-2xl mx-auto h-full flex flex-col py-8 pb-12">
        <div className="bg-zinc-950 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/20 to-zinc-800/20 mix-blend-overlay" />
          <Headphones className="w-16 h-16 text-white/90 mb-4 animate-pulse relative z-10 group-hover:scale-110 transition-transform" />
          <h2 className="text-white text-lg font-semibold relative z-10">Audio Lesson Demo</h2>
          <p className="text-zinc-400 mt-1.5 text-sm relative z-10 mb-6">Listen carefully to the dialogue before answering.</p>
          
          <div className="w-full max-w-xs bg-zinc-800 rounded-full h-1.5 mb-2 relative z-10 overflow-hidden shrink-0">
            <div className="w-1/3 bg-white h-full rounded-full" />
          </div>
          <div className="w-full max-w-xs flex justify-between text-[11px] text-zinc-500 font-mono relative z-10">
            <span>01:12</span>
            <span>03:45</span>
          </div>
        </div>

        <div className="flex-1 mt-6">
          <h3 className="font-semibold text-lg text-zinc-900 mb-2">{task.content}</h3>
          <p className="text-sm text-zinc-500 mb-6">Select the best response based on the audio clip.</p>
          
          <div className="space-y-3">
            {mockOptions.map((opt, idx) => (
              <button
                key={idx}
                disabled={isCompleted}
                onClick={() => setSelectedAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                  selectedAnswer === idx 
                    ? "border-zinc-950 bg-zinc-50 shadow-sm" 
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <span className={`font-medium ${selectedAnswer === idx ? "text-zinc-950" : "text-zinc-700"}`}>
                  {opt}
                </span>
                {selectedAnswer === idx ? (
                  <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200">
          <button
            onClick={handleComplete}
            disabled={selectedAnswer === null || isPending || isCompleted}
            className="w-full bg-zinc-950 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCompleted ? "Already Completed" : "Submit Answer"}
          </button>
        </div>
      </div>
    </>
  );
}
