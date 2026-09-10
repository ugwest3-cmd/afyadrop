"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabaseClient";
import { api, type QALog } from "@/lib/api";

const QUICK_CHIPS = [
  "Malaria treatment",
  "Pneumonia",
  "Anaemia",
  "Hypertension",
  "Sepsis",
  "Antibiotic Guidelines",
  "Paediatric dosing",
];

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AskPage() {
  const [history, setHistory] = useState<QALog[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [pendingQ, setPendingQ] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const { items } = await api.history();
      setHistory(items);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, pendingQ, asking]);

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuestion(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploadingImage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const fileName = `lab-reports/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("lab-reports")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("lab-reports").getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setError("Failed to upload image: " + (err as Error).message);
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleAsk(e?: React.FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setError("");
    setPendingQ(q);
    setAsking(true);
    try {
      const result = await api.ask(q, imageUrl ?? undefined);
      // Prepend to history (newest first from API, we reverse for display)
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          question: q,
          answer: result.answer,
          grounded: result.grounded,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setImageUrl(null);
      setImageFile(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAsking(false);
      setPendingQ(null);
    }
  }

  // Display in chronological order (oldest first, newest at bottom)
  const displayed = [...history].reverse();

  return (
    <div className="chat-container">
      {/* Chat messages */}
      <div className="chat-messages">
        {/* Empty state */}
        {displayed.length === 0 && !pendingQ && !asking && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/8 mb-5">
              <svg className="h-8 w-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">How can I help you today?</h2>
            <p className="mt-2 text-sm text-gray-500">Ask a clinical question to get started.</p>

            {/* Quick chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setQuestion(chip); textareaRef.current?.focus(); }}
                  className="rounded-full border border-teal/15 bg-white px-3.5 py-1.5 text-xs font-medium text-teal/80 transition-colors hover:border-teal/30 hover:bg-teal/5"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message pairs */}
        {displayed.map((item) => (
          <div key={item.id} className="mb-6">
            {/* User bubble */}
            <div className="flex justify-end mb-2 pl-10">
              <div className="chat-bubble-user">{item.question}</div>
            </div>
            {/* AI response */}
            {item.answer && (
              <div className="flex gap-2 pr-6">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal mt-0.5">
                  <svg className="h-3.5 w-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="chat-bubble-ai">
                  <p className="mb-2 text-xs font-bold text-teal">AfyaDrop AI</p>
                  <div className="prose prose-sm prose-teal max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
                  </div>
                  <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(item.answer ?? "")}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-teal transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Copy
                    </button>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">{formatTime(item.created_at)}</span>
                    {!item.grounded && (
                      <>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">No guideline match</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pending / typing state */}
        {pendingQ && (
          <div className="flex justify-end mb-2 pl-10">
            <div className="chat-bubble-user">{pendingQ}</div>
          </div>
        )}
        {asking && (
          <div className="flex gap-2 pr-6 mb-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal mt-0.5">
              <svg className="h-3.5 w-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="chat-bubble-ai flex items-center gap-2">
              <span className="typing-dot" style={{ animationDelay: "0ms" }} />
              <span className="typing-dot" style={{ animationDelay: "150ms" }} />
              <span className="typing-dot" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {/* Quick chips (only when empty) */}
        {displayed.length === 0 && !pendingQ && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_CHIPS.slice(0, 4).map((chip) => (
              <button
                key={chip}
                onClick={() => { setQuestion(chip); textareaRef.current?.focus(); }}
                className="shrink-0 rounded-full border border-teal/15 bg-white px-3 py-1.5 text-xs font-medium text-teal/80 transition-colors hover:border-teal/30"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Image preview */}
        {(imageFile || uploadingImage) && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-teal/15 bg-teal/5 px-3 py-2">
            {uploadingImage ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            ) : (
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
            <span className="flex-1 text-xs font-medium text-teal">
              {uploadingImage ? "Uploading image…" : imageFile?.name}
            </span>
            {!uploadingImage && (
              <button onClick={() => { setImageFile(null); setImageUrl(null); }} className="text-xs text-red-500 font-semibold">Remove</button>
            )}
          </div>
        )}

        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

        <form onSubmit={handleAsk} className="flex items-end gap-2">
          {/* Attach image */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-colors hover:border-teal/30 hover:text-teal"
            title="Attach lab report image"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={question}
              onChange={handleTextareaInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask a clinical question…"
              className="w-full resize-none overflow-hidden rounded-2xl border border-gray-200 bg-white py-2.5 pl-4 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/10"
              style={{ maxHeight: 120 }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!question.trim() || asking || uploadingImage}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-white transition-opacity disabled:opacity-40"
          >
            {asking ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </form>

        <p className="mt-1.5 text-center text-[11px] text-gray-400">1 credit per query · Decision support only</p>
      </div>
    </div>
  );
}
