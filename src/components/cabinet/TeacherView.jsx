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

// Best-effort — a failed notification shouldn't block the lesson save
// that already succeeded, so callers don't need to handle its errors.
async function notifyStudent(student, lesson) {
  if (!student.email) return;

  const lines = [
    `Здравствуйте${student.full_name ? `, ${student.full_name}` : ""}!`,
    "",
    `Новое занятие назначено на ${formatDate(lesson.scheduled_at)}.`,
  ];
  if (lesson.topic) lines.push(`Тема: ${lesson.topic}`);
  if (lesson.meeting_url) lines.push(`Ссылка на урок: ${lesson.meeting_url}`);
  if (lesson.homework) lines.push(`Домашнее задание: ${lesson.homework}`);
  lines.push("", "Подробности — в личном кабинете на fedorvoronin.ru/cabinet");

  try {
    await supabase.functions.invoke("send-email", {
      body: { to: student.email, subject: "Новое занятие по английскому", text: lines.join("\n") },
    });
  } catch {
    // Notification is a nice-to-have, not the source of truth — the
    // lesson itself is already saved and visible in the cabinet either way.
  }
}

export default function TeacherView() {
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState(null);
  const [editing, setEditing] = useState(null); // lesson id being edited, or "new"
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [contactDraft, setContactDraft] = useState("");

  function loadStudents(selectId) {
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("full_name")
      .then(({ data }) => {
        const list = data ?? [];
        setStudents(list);
        if (selectId) setSelected(list.find((s) => s.id === selectId) ?? null);
      });
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function saveProfile() {
    await supabase
      .from("profiles")
      .update({ full_name: nameDraft.trim(), contact: contactDraft.trim() })
      .eq("id", selected.id);
    setEditingProfile(false);
    loadStudents(selected.id);
  }

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
    setEditingProfile(false);
    loadLessons(student.id);
  }

  async function saveLesson(values) {
    if (editing === "new") {
      const { data } = await supabase
        .from("lessons")
        .insert({ ...values, student_id: selected.id })
        .select()
        .single();
      if (data) notifyStudent(selected, data);
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
            {s.full_name || s.email || s.contact || "без имени"}
          </button>
        ))}
      </div>

      {selected && (
        <section className="cabinet-section">
          {editingProfile ? (
            <div className="cabinet-form" style={{ marginBottom: 24 }}>
              <label>
                Имя
                <input
                  type="text"
                  placeholder="имя ученика"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  autoFocus
                />
              </label>
              <label>
                Контакт (telegram / instagram)
                <input
                  type="text"
                  placeholder="@username"
                  value={contactDraft}
                  onChange={(e) => setContactDraft(e.target.value)}
                />
              </label>
              <div className="lesson-actions">
                <button type="button" className="btn-burst cabinet-submit" onClick={saveProfile}>
                  сохранить
                </button>
                <button type="button" onClick={() => setEditingProfile(false)}>
                  отмена
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ marginBottom: 4 }}>
                занятия — {selected.full_name || selected.email}{" "}
                <button
                  type="button"
                  className="material-add"
                  style={{ marginLeft: 8, textTransform: "none", letterSpacing: 0 }}
                  onClick={() => {
                    setNameDraft(selected.full_name || "");
                    setContactDraft(selected.contact || "");
                    setEditingProfile(true);
                  }}
                >
                  изменить
                </button>
              </h2>
              <p className="cabinet-note" style={{ fontSize: 13 }}>
                {selected.email}
                {selected.contact ? ` · ${selected.contact}` : ""}
              </p>
            </div>
          )}

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
