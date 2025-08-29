"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  // Guard: ensure signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        window.location.replace("/");
        return;
      }
    });
  }, []);

  // Fetch notes (polling fallback when replication/Realtime isn't available)
  useEffect(() => {
    if (!userId) return;
    let active = true;

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id,title,content,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        console.error(error);
        return;
      }
      setNotes(data ?? []);
      setLoading(false);
    };

    setLoading(true);
    fetchNotes();

    // poll every 5s
    const intervalId = window.setInterval(fetchNotes, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  // Create note
  async function addNote() {
    if (!userId) return;
    const title = draft.title.trim() || "Untitled";
    const content = draft.content.trim();
    if (!title && !content) return;

    setSaving(true);
    const optimistic: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setNotes((n) => [optimistic, ...n]);
    setDraft({ title: "", content: "" });

    const { error } = await supabase.from("notes").insert({
      user_id: userId,
      title,
      content,
    });
    if (error) {
      console.error(error);
      // revert on failure
      setNotes((n) => n.filter((x) => x.id !== optimistic.id));
    }
    setSaving(false);
  }

  // Update note
  async function updateNote(id: string, fields: Partial<Pick<Note, "title" | "content">>) {
    setNotes((n) =>
      n.map((note) => (note.id === id ? { ...note, ...fields, updated_at: new Date().toISOString() } : note))
    );
    const { error } = await supabase.from("notes").update(fields).eq("id", id);
    if (error) console.error(error);
  }

  // Delete note
  async function deleteNote(id: string) {
    const snapshot = notes;
    setNotes((n) => n.filter((x) => x.id !== id));
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      console.error(error);
      setNotes(snapshot);
    }
  }

  const empty = useMemo(() => !loading && notes.length === 0, [loading, notes.length]);

  return (
    <div style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", letterSpacing: "-.01em" }}>Your Notes</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/">Home</Link>
          <button
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
            style={{
              background: "linear-gradient(92deg,#e650a6 24%,#44cfd1 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Composer */}
      <section
        style={{
          background: "rgba(255,255,255,.08)",
          border: "1px solid rgba(140,142,210,.22)",
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Title"
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid rgba(140,142,210,.26)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 8,
          }}
        />
        <textarea
          value={draft.content}
          onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
          placeholder="Write a quick note…"
          rows={4}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid rgba(140,142,210,.26)",
            borderRadius: 10,
            padding: "10px 12px",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            onClick={addNote}
            disabled={saving}
            style={{
              background: "linear-gradient(92deg, #7c5df7 18%, #21d4fd 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              fontWeight: 700,
              cursor: "pointer",
              opacity: saving ? 0.8 : 1,
            }}
          >
            Add note
          </button>
        </div>
      </section>

      {/* List */}
      {loading && <p>Loading…</p>}
      {empty && <p>No notes yet. Create your first one above.</p>}

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {notes.map((n) => (
          <li
            key={n.id}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(140,142,210,.22)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <input
              value={n.title}
              onChange={(e) => updateNote(n.id, { title: e.target.value })}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(140,142,210,.26)",
                borderRadius: 10,
                padding: "8px 10px",
                marginBottom: 8,
                fontWeight: 700,
              }}
            />
            <textarea
              value={n.content}
              onChange={(e) => updateNote(n.id, { content: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(140,142,210,.26)",
                borderRadius: 10,
                padding: "8px 10px",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: ".85rem", opacity: .8 }}>
              <span>{new Date(n.updated_at).toLocaleString()}</span>
              <button
                onClick={() => deleteNote(n.id)}
                style={{
                  background: "transparent",
                  color: "#ff6b6b",
                  border: "1px solid rgba(255,107,107,.35)",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}