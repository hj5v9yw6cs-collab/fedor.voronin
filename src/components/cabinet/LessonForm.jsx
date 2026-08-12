import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./cabinet.css";

// <input type="datetime-local"> works in the visitor's local time and
// expects/returns "YYYY-MM-DDTHH:mm" with no timezone — these two
// convert between that and the ISO string Supabase stores.
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyLesson() {
  return {
    scheduled_at: "",
    meeting_url: "",
    topic: "",
    homework: "",
    teacher_comment: "",
    materials: [],
    paid: false,
  };
}

export default function LessonForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() =>
    initial
      ? { ...initial, scheduled_at: toLocalInputValue(initial.scheduled_at) }
      : emptyLesson()
  );
  // Only offered when creating a new lesson — repeating an edit to an
  // existing one would be ambiguous (repeat from its original date, or
  // from today?), so this stays out of the "initial" branch entirely.
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [busy, setBusy] = useState(false);
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    supabase
      .from("materials")
      .select("*")
      .order("title")
      .then(({ data }) => setLibrary(data ?? []));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setMaterial(i, field, value) {
    setForm((f) => {
      const materials = f.materials.slice();
      materials[i] = { ...materials[i], [field]: value };
      return { ...f, materials };
    });
  }

  function addMaterial() {
    setForm((f) => ({ ...f, materials: [...f.materials, { title: "", url: "" }] }));
  }

  function addFromLibrary(id) {
    const item = library.find((m) => m.id === id);
    if (!item) return;
    setForm((f) => ({ ...f, materials: [...f.materials, { title: item.title, url: item.url }] }));
  }

  function removeMaterial(i) {
    setForm((f) => ({ ...f, materials: f.materials.filter((_, idx) => idx !== i) }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.scheduled_at) return;
    setBusy(true);
    const base = {
      ...form,
      materials: form.materials.filter((m) => m.url.trim()),
    };
    const startDate = new Date(form.scheduled_at);
    const weeks = !initial && repeatWeeks > 1 ? repeatWeeks : 1;
    for (let i = 0; i < weeks; i++) {
      const at = new Date(startDate);
      at.setDate(at.getDate() + i * 7);
      // Sequential on purpose — each is an independent insert, and
      // awaiting one at a time avoids firing a burst of simultaneous
      // notification emails.
      await onSave({ ...base, scheduled_at: at.toISOString() });
    }
    setBusy(false);
  }

  return (
    <form className="cabinet-form" onSubmit={submit}>
      <label>
        Дата и время урока
        <input
          type="datetime-local"
          value={form.scheduled_at}
          onChange={(e) => set("scheduled_at", e.target.value)}
          required
        />
      </label>

      {!initial && (
        <label>
          Повторять каждую неделю
          <select value={repeatWeeks} onChange={(e) => setRepeatWeeks(Number(e.target.value))}>
            <option value={1}>не повторять</option>
            <option value={4}>4 недели</option>
            <option value={8}>8 недель</option>
            <option value={12}>12 недель</option>
          </select>
        </label>
      )}

      <label>
        Ссылка на Яндекс Телемост
        <input
          type="url"
          placeholder="https://telemost.yandex.ru/..."
          value={form.meeting_url}
          onChange={(e) => set("meeting_url", e.target.value)}
        />
      </label>

      <label>
        Тема урока
        <input
          type="text"
          value={form.topic}
          onChange={(e) => set("topic", e.target.value)}
        />
      </label>

      <label>
        Домашнее задание
        <textarea
          value={form.homework}
          onChange={(e) => set("homework", e.target.value)}
        />
      </label>

      <label>
        Комментарий к уроку
        <textarea
          value={form.teacher_comment}
          onChange={(e) => set("teacher_comment", e.target.value)}
        />
      </label>

      <label>
        Учебные материалы (ссылки)
        {form.materials.map((m, i) => (
          <div className="material-row" key={i}>
            <input
              type="text"
              placeholder="название"
              value={m.title}
              onChange={(e) => setMaterial(i, "title", e.target.value)}
            />
            <input
              type="url"
              placeholder="ссылка"
              value={m.url}
              onChange={(e) => setMaterial(i, "url", e.target.value)}
            />
            <button type="button" onClick={() => removeMaterial(i)}>
              ✕
            </button>
          </div>
        ))}
        <div className="material-row">
          <button type="button" className="material-add" onClick={addMaterial}>
            + добавить материал
          </button>
          {library.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) addFromLibrary(e.target.value);
              }}
            >
              <option value="">+ добавить из библиотеки</option>
              {library.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </label>

      <label className="cabinet-checkbox-label">
        <input
          type="checkbox"
          checked={form.paid}
          onChange={(e) => set("paid", e.target.checked)}
        />
        оплачено
      </label>

      <div className="lesson-actions">
        <button type="submit" className="btn-burst cabinet-submit" disabled={busy}>
          {busy ? "Сохраняем…" : "Сохранить"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            отмена
          </button>
        )}
      </div>
    </form>
  );
}
