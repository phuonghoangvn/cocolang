"use client";

import { useState, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

function parseQuizContent(content: string) {
  // Try to parse AI-formatted quiz: "Question? | Opt1 | Opt2 | Opt3 | Opt4 | CorrectIndex"
  const parts = content.split("|").map((p) => p.trim());
  if (parts.length >= 6) {
    const question = parts[0];
    const opts = parts.slice(1, 5).map((text) => ({ text }));
    const correctIdx = parseInt(parts[5]) || 0;
    return {
      question,
      options: opts.map((o, i) => ({ text: o.text, isCorrect: i === correctIdx })),
    };
  }
  // Fallback
  return {
    question: content,
    options: [
      { text: "Yes, that is correct.", isCorrect: true },
      { text: "No, it is the opposite.", isCorrect: false },
      { text: "It depends on context.", isCorrect: false },
      { text: "None of the above.", isCorrect: false },
    ],
  };
}

export default function QuizWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const parsed = parseQuizContent(task.content);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const isCorrect = selectedOption !== null && parsed.options[selectedOption].isCorrect;

  const handleAction = () => {
    if (selectedOption !== null && !hasChecked) {
      setHasChecked(true);
    } else if (hasChecked && isCorrect) {
      startTransition(async () => {
        const res = await completeTask(task.id, parsed.options[selectedOption!].text);
        if (res.success) {
          setShowCelebration(true);
        }
      });
    } else if (hasChecked && !isCorrect) {
      setHasChecked(false);
      setSelectedOption(null);
    }
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

      <div className="max-w-2xl mx-auto py-12 flex flex-col h-full">
        <div className="mb-10 text-center">
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-zinc-400 mb-3 text-center">Multiple Choice</h2>
          <p className="text-zinc-900 font-semibold text-2xl leading-snug">{parsed.question}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 flex-1">
          {parsed.options.map((option, idx) => {
            let stateStyle = "bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300";
            
            if (selectedOption === idx) {
              stateStyle = "bg-zinc-50 border-zinc-950 text-zinc-950 ring-1 ring-zinc-950";
            }
            
            if (hasChecked) {
              if (option.isCorrect) {
                stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-900";
              } else if (selectedOption === idx) {
                stateStyle = "bg-red-50 border-red-500 text-red-900";
              } else {
                stateStyle = "opacity-40 bg-white border-zinc-200";
              }
            }

            if (isCompleted && option.isCorrect) {
               stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-900";
            }

            return (
              <button
                key={idx}
                disabled={hasChecked || isCompleted}
                onClick={() => setSelectedOption(idx)}
                className={`p-5 rounded-2xl border-2 font-medium text-[17px] transition-all flex items-center justify-between text-left ${stateStyle} ${hasChecked || isCompleted ? "cursor-default" : "cursor-pointer"} shadow-sm`}
              >
                <span>{option.text}</span>
                {hasChecked && option.isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {hasChecked && selectedOption === idx && !option.isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <button
            onClick={handleAction}
            disabled={selectedOption === null || isPending || isCompleted}
            className={`w-full py-4 text-white font-bold rounded-2xl transition-all shadow-md flex justify-center items-center gap-2 ${
              hasChecked 
                ? isCorrect 
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" 
                  : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                : "bg-zinc-950 hover:bg-zinc-800 shadow-zinc-950/20"
            } disabled:opacity-50 disabled:shadow-none`}
          >
            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {isCompleted 
              ? "Task Completed" 
              : hasChecked 
                ? isCorrect 
                  ? "Excellent! Continue" 
                  : "Incorrect. Try Again"
                : "Check Answer"}
          </button>
        </div>
      </div>
    </>
  );
}
