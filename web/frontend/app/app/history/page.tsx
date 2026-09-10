"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type QALog } from "@/lib/api";

const FILTERS = [
  { key: "all", label: "All Consults" },
  { key: "dosing", label: "Dosing" },
  { key: "grounded", label: "Guideline-based" },
];

function formatDate(iso: string) {
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

export default function HistoryPage() {
  const [items, setItems] = useState<QALog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { items: data } = await api.history();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) => {
    const matchSearch = !search || item.question.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (filter === "dosing") matchFilter = item.question.toLowerCase().includes("dose") || item.question.toLowerCase().includes("dosing");
    if (filter === "grounded") matchFilter = item.grounded;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Consult Archives</h1>
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Encrypted
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search consultations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/10"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-teal text-sage"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-teal/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-amber-600 font-medium">
          ⚕ Previous consultations are for reference only. Always verify with current guidelines.
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="h-12 w-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm text-gray-500">No consultations found</p>
            <p className="text-xs text-gray-400 mt-1">Ask your first clinical question in the Ask tab</p>
          </div>
        )}

        {filtered.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setExpanded(isOpen ? null : item.id)}
              className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-sm font-semibold text-gray-900 line-clamp-2">{item.question}</p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-400">{formatDate(item.created_at)}</span>
                  {item.grounded ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">Guideline</span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">No match</span>
                  )}
                </div>
              </div>

              {isOpen && item.answer && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="prose prose-sm prose-teal max-w-none text-left">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center gap-1 text-[11px] text-teal/60">
                <svg className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                {isOpen ? "Collapse" : "View answer"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
