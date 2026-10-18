export type Status = "todo" | "doing" | "done";

export interface Card {
  id: string;
  title: string;
  status: Status;
  position: number;
  created_at: string;
}

export const COLUMNS: { status: Status; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "doing", label: "Doing" },
  { status: "done", label: "Done" },
];

const BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  list: () => request<Card[]>("/cards"),
  create: (title: string) =>
    request<Card>("/cards", { method: "POST", body: JSON.stringify({ title }) }),
  move: (id: string, status: Status) =>
    request<Card>(`/cards/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  remove: (id: string) => request<void>(`/cards/${id}`, { method: "DELETE" }),
};