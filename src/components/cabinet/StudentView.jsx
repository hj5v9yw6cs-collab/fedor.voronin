import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./cabinet.css";

function formatDate(iso) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LessonCard({ lesson, editable, onChange }) {
  const [message, setMessage] = useState(lesson.student_message || "");
  const [saved, setSaved] = useState(false);

  async function toggleDone(e) {
    const homework_done = e.target.checked;
    await supabase.from("lessons").update({ homework_done }).eq("id", lesson.id);
    onChange({ ...lesson, homework_done });
  }

  async function saveMessage() {
    await supabase.from("lessons").update({ student_message: message.trim() }).eq("id", lesson.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="lesson-card">
      <div className="lesson-date">{formatDate(lesson.scheduled_at)}</div>
      {lesson.topic && <div className="lesson-topic">{lesson.topic}</div>}

      {lesson.meeting_url && (
        <div className="lesson-row">
          <strong>Ссылка на урок:</strong>
          <a className="lesson-meet" href={lesson.meeting_url} target="_blank" rel="noreferrer">
            Яндекс Телемост
          </a>
        </div>
      )}

      {lesson.homework && (
        <div className="lesson-row">
          <strong>Домашнее задание:</strong>
          {lesson.homework}
        </div>
      )}

      {lesson.homework && editable && (
        <label className="cabinet-checkbox-label">
          <input type="checkbox" checked={lesson.homework_done} onChange={toggleDone} />
          домашнее задание выполнено
        </label>
      )}

      {lesson.teacher_comment && (
        <div className="lesson-row">
          <strong>Комментарий:</strong>
          {lesson.teacher_comment}
        </div>
      )}

      {Array.isArray(lesson.materials) && lesson.materials.length > 0 && (
        <div className="lesson-row">
          <strong>Материалы:</strong>
          <div className="lesson-materials">
            {lesson.materials.map((m, i) => (
              <a key={i} href={m.url} target="_blank" rel="noreferrer">
                {m.title || m.url}
              </a>
            ))}
          </div>
        </div>
      )}

      {editable && (
        <div className="material-row" style={{ marginTop: 10 }}>
          <input
            type="text"
            placeholder="есть вопрос к преподавателю?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="button" onClick={saveMessage}>
            {saved ? "отправлено ✓" : "отправить"}
          </button>
        </div>
      )}
    </div>
  );
}

function TestHistory({ email }) {
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!email) return;
    supabase
      .from("test_results")
      .select("*")
      .eq("contact", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => setResults(data ?? []));
  }, [email]);

  if (!results || results.length === 0) return null;

  return (
    <section className="cabinet-section">
      <h2>история теста</h2>
      {results.map((r) => (
        <div className="lesson-card" key={r.id}>
          <div className="lesson-date">
            {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="lesson-row">
            <strong>Результат:</strong>
            {r.score}/{r.total} — уровень {r.level_code} ({r.level_label})
          </div>
        </div>
      ))}
    </section>
  );
}

export default function StudentView({ profile }) {
  const [split, setSplit] = useState(null); // { upcoming, past }, computed once per fetch

  function load() {
    supabase
      .from("lessons")
      .select("*")
      .eq("student_id", profile.id)
      .order("scheduled_at", { ascending: true })
      .then(({ data }) => {
        const lessons = data ?? [];
        const now = Date.now();
        setSplit({
          upcoming: lessons.filter((l) => new Date(l.scheduled_at).getTime() >= now),
          past: lessons.filter((l) => new Date(l.scheduled_at).getTime() < now).reverse(),
        });
      });
  }

  useEffect(load, [profile.id]);

  function patchLesson(updated) {
    setSplit((prev) => {
      if (!prev) return prev;
      const patch = (list) => list.map((l) => (l.id === updated.id ? updated : l));
      return { upcoming: patch(prev.upcoming), past: patch(prev.past) };
    });
  }

  if (split === null) return <p className="cabinet-empty">Загрузка занятий…</p>;

  const { upcoming, past } = split;

  return (
    <>
      <section className="cabinet-section">
        <h2>ближайшие занятия</h2>
        {upcoming.length === 0 ? (
          <p className="cabinet-empty">Пока ничего не запланировано.</p>
        ) : (
          upcoming.map((l) => (
            <LessonCard key={l.id} lesson={l} editable onChange={patchLesson} />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="cabinet-section">
          <h2>прошедшие занятия</h2>
          {past.map((l) => (
            <LessonCard key={l.id} lesson={l} editable={false} onChange={patchLesson} />
          ))}
        </section>
      )}

      <TestHistory email={profile.email} />
    </>
  );
}
