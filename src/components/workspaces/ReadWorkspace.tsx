"use client";

import { useState, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Copy, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n+/);
  return (
    <div className="space-y-3 text-left">
      {paragraphs.map((para, i) => {
        // match **bold** with (.*?)
        // and optionally links [text](url)
        // A full Markdown parser isn't used here to stay lightweight, but basic bold wrapping helps.
        const parts = para.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
        return (
          <p key={i}>
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={j} className="text-zinc-950 font-black">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("[") && part.includes("](")) {
                const labelMatch = part.match(/\[(.*?)\]/);
                const urlMatch = part.match(/\((.*?)\)/);
                const label = labelMatch ? labelMatch[1] : part;
                const url = urlMatch ? urlMatch[1] : "#";
                return <a key={j} href={url} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800 break-all">{label}</a>;
              }
              // detect raw urls natively
              if (part.startsWith("http")) {
                return <a key={j} href={part.split(" ")[0]} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800 break-all">{part.split(" ")[0]}</a>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ReadWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [userContent, setUserContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(task.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeTask(task.id, userContent);
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

      <div className="flex flex-col gap-6 lg:gap-8 py-6 px-4 md:px-0 max-w-5xl mx-auto">
        {/* Source Toggle block */}
        <div className="w-full flex flex-col">
          <button
            onClick={() => setShowSource((s) => !s)}
            className="flex items-center justify-between bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-5 py-3 rounded-xl font-bold text-sm transition-colors w-full mb-2"
          >
            <span className="flex items-center gap-2">Read Context {showSource ? "" : "(Hidden)"}</span>
            {showSource ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showSource && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative flex flex-col mt-2 shadow-sm">
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition shadow-sm"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
              </button>
              <h3 className="font-semibold text-zinc-900 mb-4">Source Text</h3>
              <div className="text-zinc-700 leading-relaxed overflow-y-auto flex-1 whitespace-pre-wrap">
                <FormattedText text={task.content} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-[350px]">
          <h3 className="font-semibold text-zinc-900 mb-4">Your Translation / Notes</h3>
          <textarea
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            disabled={isCompleted}
            placeholder="Type your notes or translation here..."
            className="flex-1 w-full bg-white border border-zinc-200 rounded-xl p-6 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-colors shadow-sm disabled:bg-zinc-50"
          />
          <button
            onClick={handleComplete}
            disabled={isPending || userContent.trim().length === 0 || isCompleted}
            className="mt-6 w-full bg-zinc-950 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCompleted ? "Already Completed" : "Complete Task"}
          </button>
        </div>
      </div>
    </>
  );
}
