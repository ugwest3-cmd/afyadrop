"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Doc {
  id: string;
  title: string;
  source_type: string;
  status: string;
  created_at: string;
}

export default function Admin() {
  const [title, setTitle] = useState("Uganda Clinical Guidelines");
  const [sourceType, setSourceType] = useState("ucg");
  const [text, setText] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDocs() {
    try {
      const res = await fetch(`${API}/documents`, { cache: "no-store" });
      const data = await res.json();
      setDocs(data.documents ?? []);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      // MVP: read .txt / .md directly. PDF/DOCX parsing can be added later.
      const content = await file.text();
      setText(content);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      setMessage(`Loaded ${file.name} (${content.length.toLocaleString()} characters).`);
    } catch {
      setError("Could not read that file. For MVP use a plain-text (.txt) export of the UCG.");
    }
  }

  async function onIngest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/documents/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, source_type: sourceType, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Ingest failed (${res.status})`);
      setMessage(`Ingested "${title}" into ${data.chunks} searchable chunks.`);
      setText("");
      await loadDocs();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="brand">Afya Drop — Admin</div>
      <div className="card">
        <h2>Upload clinical reference</h2>
        <p className="hint">
          Upload the Uganda Clinical Guidelines (or another reference) as plain text. It will be split
          into chunks, embedded, and used as the ONLY source the assistant answers from.
        </p>
        <form onSubmit={onIngest}>
          <label htmlFor="title">Document title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label htmlFor="stype">Type</label>
          <select id="stype" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            <option value="ucg">Uganda Clinical Guidelines (UCG)</option>
            <option value="guideline">Other guideline</option>
            <option value="formulary">Formulary</option>
            <option value="other">Other</option>
          </select>

          <label htmlFor="file">File (.txt)</label>
          <input id="file" type="file" accept=".txt,.md,.text" onChange={onFile} />
          {text && <div className="hint">{text.length.toLocaleString()} characters ready to ingest.</div>}

          <button disabled={loading || !text}>{loading ? "Ingesting…" : "Ingest document"}</button>
        </form>
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
      </div>

      <div className="card">
        <h2>Uploaded documents</h2>
        <button onClick={loadDocs} style={{ width: "auto", padding: "8px 16px" }}>Refresh</button>
        <ul>
          {docs.map((d) => (
            <li key={d.id}>
              <strong>{d.title}</strong> — {d.source_type} — <em>{d.status}</em>
            </li>
          ))}
          {!docs.length && <li className="hint">No documents yet.</li>}
        </ul>
      </div>
    </main>
  );
}
