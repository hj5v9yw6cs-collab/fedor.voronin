import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import LessonForm from "./LessonForm";
import "./cabinet.css";

function formatDate(iso) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherView() {
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState(null);
  const [editing, setEditing] = useState(null); // lesson id being edited, or "new"

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("full_name")
      .then(({ data }) => setStudents(data ?? []));
  }, []);

  function loadLessons(studentId) {
    setLessons(null);
    supabase
      .from("lessons")
      .select("*")
      .eq("student_id", studentId)
      .order("scheduled_at", { ascending: false })
      .then(({ data }) => setLessons(data ?? []));
  }

  function selectStudent(student) {
    setSelected(student);
    setEditing(null);
    loadLessons(student.id);
  }

  async function saveLesson(values) {
    if (editing === "new") {
      await supabase.from("lessons").insert({ ...values, student_id: selected.id });
    } else {
      await supabase.from("lessons").update(values).eq("id", editing);
    }
    setEditing(null);
    loadLessons(selected.id);
  }

  async function deleteLesson(id) {
    if (!window.confirm("Удалить это занятие?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    loadLessons(selected.id);
  }

  if (students === null) return <p className="cabinet-empty">Загрузка учеников…</p>;

  if (students.length === 0) {
    return (
      <p className="cabinet-empty">
        Пока нет учеников. Добавьте их в Supabase → Authentication → Users
        (см. README).
      </p>
    );
  }

  return (
    <>
      <div className="student-list">
        {students.map((s) => (
          <button
            key={s.id}
            className={`student-pill${selected?.id === s.id ? " is-active" : ""}`}
            onClick={() => selectStudent(s)}
          >
            {s.full_name || s.contact || "без имени"}
          </button>
        ))}
      </div>

      {selected && (
        <section className="cabinet-section">
          <h2>занятия — {selected.full_name || selected.contact}</h2>

          {editing === "new" ? (
            <LessonForm onSave={saveLesson} onCancel={() => setEditing(null)} />
          ) : (
            <button className="material-add" onClick={() => setEditing("new")}>
              + добавить занятие
            </button>
          )}

          {lessons === null ? (
            <p className="cabinet-empty">Загрузка…</p>
          ) : lessons.length === 0 ? (
            <p className="cabinet-empty">Занятий пока нет.</p>
          ) : (
            lessons.map((l) =>
              editing === l.id ? (
                <LessonForm
                  key={l.id}
                  initial={l}
                  onSave={saveLesson}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="lesson-card" key={l.id}>
                  <div className="lesson-date">{formatDate(l.scheduled_at)}</div>
                  {l.topic && <div className="lesson-topic">{l.topic}</div>}
                  {l.meeting_url && (
                    <div className="lesson-row">
                      <strong>Ссылка:</strong>
                      <a className="lesson-meet" href={l.meeting_url} target="_blank" rel="noreferrer">
                        Яндекс Телемост
                      </a>
                    </div>
                  )}
                  <div className="lesson-actions">
                    <button onClick={() => setEditing(l.id)}>редактировать</button>
                    <button onClick={() => deleteLesson(l.id)}>удалить</button>
                  </div>
                </div>
              )
            )
          )}
        </section>
      )}
    </>
  );
}
