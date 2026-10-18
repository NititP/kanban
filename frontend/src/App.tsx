import { useEffect, useState, type FormEvent } from "react";
import { api, COLUMNS, type Card, type Status } from "./api";

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState<Status | null>(null);

  useEffect(() => {
    api.list().then(setCards).catch(fail).finally(() => setLoading(false));
  }, []);

  function fail(e: unknown) {
    setError(e instanceof Error ? e.message : "Can't reach the API. Check the backend is running.");
  }

  async function addCard(e: FormEvent) {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    try {
      const card = await api.create(text);
      setCards((c) => [...c, card]);
      setTitle("");
    } catch (err) { fail(err); }
  }

  async function moveCard(id: string, status: Status) {
    const before = cards;
    const card = cards.find((c) => c.id === id);
    if (!card || card.status === status) return;
    setCards((c) => [...c.filter((x) => x.id !== id), { ...card, status }]);
    try {
      const saved = await api.move(id, status);
      setCards((c) => c.map((x) => (x.id === id ? saved : x)));
    } catch (err) { setCards(before); fail(err); }
  }

  async function deleteCard(id: string) {
    const before = cards;
    setCards((c) => c.filter((x) => x.id !== id));
    try { await api.remove(id); } catch (err) { setCards(before); fail(err); }
  }

  return (
    <main className="app">
      <header className="top">
        <h1>Kanban board</h1>
        <form className="add" onSubmit={addCard}>
          <input aria-label="New card title" value={title} maxLength={200}
            placeholder="What needs doing?" onChange={(e) => setTitle(e.target.value)} />
          <button type="submit" disabled={!title.trim()}>Add card</button>
        </form>
      </header>

      {error && (
        <p className="error" role="alert">
          {error} <button onClick={() => setError(null)}>Dismiss</button>
        </p>
      )}

      <section className="board">
        {COLUMNS.map((col, i) => {
          const items = cards.filter((c) => c.status === col.status);
          return (
            <div key={col.status}
              className={`column col-${col.status} ${dragOver === col.status ? "over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(null);
                moveCard(e.dataTransfer.getData("text/plain"), col.status);
              }}>
              <h2>{col.label} <span className="count">{items.length}</span></h2>
              {loading ? <p className="empty">Loading cards…</p> :
                items.length === 0 ? <p className="empty">Drop a card here</p> : (
                <ul>
                  {items.map((card) => (
                    <li key={card.id} className="card" draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}>
                      <p>{card.title}</p>
                      <div className="actions">
                        {i > 0 && (
                          <button onClick={() => moveCard(card.id, COLUMNS[i - 1].status)}>
                            ← {COLUMNS[i - 1].label}
                          </button>
                        )}
                        {i < COLUMNS.length - 1 && (
                          <button onClick={() => moveCard(card.id, COLUMNS[i + 1].status)}>
                            {COLUMNS[i + 1].label} →
                          </button>
                        )}
                        <button className="delete" onClick={() => deleteCard(card.id)}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}