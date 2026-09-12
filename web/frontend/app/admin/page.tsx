"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/Input";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  qualification: string;
  licence_number: string;
  profile_completed: boolean;
  suspended: boolean;
  created_at: string;
  balance_credits: number;
  questions_asked: number;
}

interface Doc {
  id: string;
  title: string;
  country: string;
  source_type: string;
  status: string;
  created_at: string;
}

interface Stats {
  total_users: number;
  total_questions: number;
  total_revenue: number;
}

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"users" | "documents">("users");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);

  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("ucg");
  const [country, setCountry] = useState("UG");
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function headers() {
    return { "content-type": "application/json", "x-admin-secret": secret };
  }

  async function loadAll() {
    setError("");
    try {
      const [u, s, d] = await Promise.all([
        fetch(`${API}/admin/users`, { headers: headers() }).then((r) => r.json()),
        fetch(`${API}/admin/stats`, { headers: headers() }).then((r) => r.json()),
        fetch(`${API}/documents`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (u.error) throw new Error(u.error);
      setUsers(u.users ?? []);
      setStats(s);
      setDocs(d.documents ?? []);
      setAuthed(true);
    } catch (err) {
      setError((err as Error).message);
      setAuthed(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("afyadrop_admin_secret") ?? "";
    if (saved) setSecret(saved);
    fetch(`${API}/auth/countries`)
      .then((r) => r.json())
      .then((d) => setCountries(d.countries ?? []))
      .catch(() => setCountries([]));
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    window.localStorage.setItem("afyadrop_admin_secret", secret);
    await loadAll();
  }

  async function toggleSuspend(u: AdminUser) {
    try {
      await fetch(`${API}/admin/users/${u.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ suspended: !u.suspended }),
      });
      await loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setError("");
    setFile(selectedFile);
    
    if (!title) setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    
    if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
      setText("");
      setMessage(`Loaded PDF: ${selectedFile.name} (will be parsed on server).`);
    } else {
      try {
        const content = await selectedFile.text();
        setText(content);
        setMessage(`Loaded ${selectedFile.name} (${content.length.toLocaleString()} chars).`);
      } catch {
        setError("Could not read that file.");
      }
    }
  }

  async function onIngest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      let body: BodyInit;
      const fetchHeaders: Record<string, string> = { "x-admin-secret": secret };

      if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("country", country);
        formData.append("source_type", sourceType);
        formData.append("file", file);
        body = formData;
      } else {
        fetchHeaders["content-type"] = "application/json";
        body = JSON.stringify({ title, country, source_type: sourceType, text });
      }

      const res = await fetch(`${API}/documents/ingest`, {
        method: "POST",
        headers: fetchHeaders,
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Ingest failed (${res.status})`);
      setMessage(`Ingested "${title}" into ${data.chunks} searchable chunks.`);
      setText("");
      setFile(null);
      await loadAll();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <main className="flex min-h-[70vh] items-center bg-cream py-16">
        <div className="container-site max-w-md">
          <Card>
            <h1 className="text-2xl font-bold text-teal">Admin access</h1>
            <p className="mt-2 text-sm text-muted">Enter the admin secret to manage Afya Drop.</p>
            <form onSubmit={onLogin} className="mt-6 space-y-5">
              <Input
                id="secret"
                label="Admin secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Enter</Button>
              {error && <p className="error-text">{error}</p>}
            </form>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream py-12">
      <div className="container-site">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-teal">Admin</h1>
          <div className="flex gap-2">
            {(["users", "documents"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "rounded-lg px-4 py-2 text-sm font-semibold capitalize " +
                  (tab === t ? "bg-teal text-cream" : "bg-ivory text-teal hover:bg-sage/50")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <div className="font-heading text-4xl font-bold text-teal">{stats.total_users}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">Clinicians</div>
            </Card>
            <Card className="text-center">
              <div className="font-heading text-4xl font-bold text-teal">{stats.total_questions}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">Questions answered</div>
            </Card>
            <Card className="text-center">
              <div className="font-heading text-4xl font-bold text-teal">${stats.total_revenue.toLocaleString()}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">Revenue (USD)</div>
            </Card>
          </div>
        )}

        {error && <p className="error-text mt-4">{error}</p>}
        {message && <p className="success-text mt-4">{message}</p>}

        {/* USERS TAB */}
        {tab === "users" && (
          <Card className="mt-8 overflow-x-auto">
            <h2 className="text-xl font-bold text-teal">Users</h2>
            <table className="mt-4 w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-teal/10 text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Qualification</th>
                  <th className="py-2 pr-4">Licence</th>
                  <th className="py-2 pr-4">Credits</th>
                  <th className="py-2 pr-4">Questions</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-teal/5 last:border-0">
                    <td className="py-3 pr-4 font-medium text-teal">{u.full_name}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">{u.qualification}</td>
                    <td className="py-3 pr-4">{u.licence_number}</td>
                    <td className="py-3 pr-4">{u.balance_credits}</td>
                    <td className="py-3 pr-4">{u.questions_asked}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
                          (u.suspended ? "bg-red-100 text-red-700" : u.profile_completed ? "bg-sage/60 text-teal" : "bg-amber-100 text-amber-800")
                        }
                      >
                        {u.suspended ? "Suspended" : u.profile_completed ? "Active" : "Incomplete"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => toggleSuspend(u)}
                        className={
                          "rounded-lg px-3 py-1.5 text-xs font-semibold " +
                          (u.suspended ? "bg-sage text-teal" : "bg-red-50 text-red-700 hover:bg-red-100")
                        }
                      >
                        {u.suspended ? "Reinstate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td colSpan={8} className="py-6 text-center text-muted">No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        )}

        {/* DOCUMENTS TAB */}
        {tab === "documents" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Card>
              <h2 className="text-xl font-bold text-teal">Upload clinical reference</h2>
              <p className="mt-1 text-sm text-muted">
                Upload a country's national clinical guideline (or another reference) as a plain text or PDF file. It becomes the ONLY source clinicians in that country get answers from.
              </p>
              <form onSubmit={onIngest} className="mt-5 space-y-5">
                <Select id="country" label="Country this guideline applies to" value={country} onChange={(e) => setCountry(e.target.value)}>
                  {countries.length === 0 && <option value="UG">Uganda</option>}
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
                <Input id="title" label="Document title" placeholder="e.g. Uganda Clinical Guidelines 2023" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <Select id="stype" label="Type" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                  <option value="ucg">National clinical guideline</option>
                  <option value="guideline">Other guideline</option>
                  <option value="formulary">Formulary</option>
                  <option value="other">Other</option>
                </Select>
                <div>
                  <label htmlFor="file" className="label">File (.txt, .pdf)</label>
                  <label
                    htmlFor="file"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal/20 bg-white px-4 py-8 text-center hover:border-sage-500"
                  >
                    <span className="text-sm text-muted">{text ? `${text.length.toLocaleString()} characters ready` : file ? `Ready to ingest ${file.name}` : "Click to choose a .txt or .pdf file"}</span>
                    <input id="file" type="file" accept=".txt,.md,.text,.pdf,application/pdf" onChange={onFile} className="hidden" />
                  </label>
                </div>
                <Button type="submit" loading={loading} disabled={!text && !file} className="w-full">Ingest document</Button>
              </form>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-teal">Uploaded documents</h2>
              <ul className="mt-4 space-y-3">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-teal/10 bg-white px-4 py-3">
                    <div>
                      <div className="font-medium text-teal">{d.title}</div>
                      <div className="text-xs text-muted">{d.country} · {d.source_type}</div>
                    </div>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (d.status === "ready" ? "bg-sage/60 text-teal" : d.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800")
                      }
                    >
                      {d.status}
                    </span>
                  </li>
                ))}
                {!docs.length && <li className="text-sm text-muted">No documents yet.</li>}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
