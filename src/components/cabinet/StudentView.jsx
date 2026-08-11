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

function LessonCard({ lesson }) {
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
    </div>
  );
}

export default function StudentView({ profile }) {
  const [split, setSplit] = useState(null); // { upcoming, past }, computed once per fetch

  useEffect(() => {
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
  }, [profile.id]);

  if (split === null) return <p className="cabinet-empty">Загрузка занятий…</p>;

  const { upcoming, past } = split;

  return (
    <>
      <section className="cabinet-section">
        <h2>ближайшие занятия</h2>
        {upcoming.length === 0 ? (
          <p className="cabinet-empty">Пока ничего не запланировано.</p>
        ) : (
          upcoming.map((l) => <LessonCard key={l.id} lesson={l} />)
        )}
      </section>

      {past.length > 0 && (
        <section className="cabinet-section">
          <h2>прошедшие занятия</h2>
          {past.map((l) => (
            <LessonCard key={l.id} lesson={l} />
          ))}
        </section>
      )}
    </>
  );
}
