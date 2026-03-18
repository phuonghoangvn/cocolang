"use client";

import { useTransition, useState } from "react";
import { autoGenerateNextRoadmapTask } from "@/app/actions/ai";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

export default function AutoGenerateButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleGenerate = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await autoGenerateNextRoadmapTask();
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "New task added to your roadmap!" });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return (
    <div className="mt-12 flex flex-col items-center">
      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-zinc-950 text-white text-sm font-semibold rounded-full overflow-hidden transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
        )}
        
        {isPending ? "Configuring Module..." : "Unlock Next Task using AI"}
      </button>

      {message && (
        <div className={`mt-4 text-sm font-medium flex items-center gap-1.5 ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
          {message.type === "success" && <CheckCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
