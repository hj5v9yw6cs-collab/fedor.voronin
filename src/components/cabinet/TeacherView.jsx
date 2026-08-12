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

function buildLessonEmail(student, lesson, heading) {
  const lines = [
    `Здравствуйте${student.full_name ? `, ${student.full_name}` : ""}!`,
    "",
    `${heading} ${formatDate(lesson.scheduled_at)}.`,
  ];
  if (lesson.topic) lines.push(`Тема: ${lesson.topic}`);
  if (lesson.meeting_url) lines.push(`Ссылка на урок: ${lesson.meeting_url}`);
  if (lesson.homework) lines.push(`Домашнее задание: ${lesson.homework}`);
  lines.push("", "Подробности — в личном кабинете на fedorvoronin.ru/cabinet");
  return lines.join("\n");
}

// Both best-effort — a failed email shouldn't block whatever the
// teacher was already doing (the lesson itself is saved regardless,
// and reminders are a courtesy on top of it).
async function notifyStudent(student, lesson) {
  if (!student.email) return;
  try {
    await supabase.functions.invoke("send-email", {
      body: {
        to: student.email,
        subject: "Новое занятие по английскому",
        text: buildLessonEmail(student, lesson, "Новое занятие назначено на"),
      },
    });
  } catch {
    // see comment above
  }
}

async function remindStudent(student, lesson) {
  if (!student.email) return false;
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        to: student.email,
        subject: "Напоминание о занятии по английскому",
        text: buildLessonEmail(student, lesson, "Напоминаем: у вас занятие"),
      },
    });
    return !error;
  } catch {
    return false;
  }
}

function WeekOverview({ onPickStudent }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    supabase
      .from("lessons")
      .select("*, profiles!lessons_student_id_fkey(id, full_name, email, contact)")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in7days.toISOString())
      .order("scheduled_at", { ascending: true })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  if (items === null) return null;

  return (
    <section className="cabinet-section">
      <h2>ближайшие 7 дней</h2>
      {items.length === 0 ? (
        <p className="cabinet-empty">На этой неделе занятий не запланировано.</p>
      ) : (
        items.map((l) => (
          <button
            key={l.id}
            type="button"
            className="week-item"
            onClick={() => onPickStudent(l.profiles)}
          >
            <span className="week-item-date">{formatDate(l.scheduled_at)}</span>
            <span className="week-item-student">
              {l.profiles?.full_name || l.profiles?.email || "без имени"}
            </span>
            {l.paid && <span className="week-item-paid">оплачено</span>}
          </button>
        ))
      )}
    </section>
  );
}

// Deterministic pseudo-random height per book, so the same material
// always looks the same rather than reshuffling on every reload — just
// enough variation for an organic "row of spines" rhythm, no color.
function bookHeight(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 34 + (hash % 18); // 34–52px
}

function Bookshelf({ items, onRemove }) {
  return (
    <div className="bookshelf-wrap">
      <div className="bookshelf-frame">
        {items.length === 0 ? (
          <p className="bookshelf-empty">полка пуста — добавьте первую книгу</p>
        ) : (
          items.map((m) => (
            <a
              key={m.id}
              className="book"
              style={{ height: `${bookHeight(m.id)}px` }}
              href={m.url}
              target="_blank"
              rel="noreferrer"
              title={m.title}
            >
              <button
                type="button"
                className="book-remove"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(m.id);
                }}
                aria-label={`удалить «${m.title}»`}
              >
                ✕
              </button>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function MaterialsLibrary() {
  const [items, setItems] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function load() {
    supabase
      .from("materials")
      .select("*")
      .order("title")
      .then(({ data }) => setItems(data ?? []));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    if (!url.trim()) return;
    await supabase.from("materials").insert({ title: title.trim() || url.trim(), url: url.trim() });
    setTitle("");
    setUrl("");
    load();
  }

  async function remove(id) {
    await supabase.from("materials").delete().eq("id", id);
    load();
  }

  return (
    <section className="cabinet-section">
      <h2>библиотека материалов</h2>
      <Bookshelf items={items ?? []} onRemove={remove} />
      <form className="material-row" onSubmit={add}>
        <input type="text" placeholder="название" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="url" placeholder="ссылка" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <button type="submit">+ добавить книгу</button>
      </form>
      <p className="bookshelf-hint">
        {items === null
          ? "Загрузка…"
          : "Каждая добавленная ссылка появляется книгой на полке — наведите, чтобы увидеть название, кликните, чтобы открыть, крестик снимает книгу с полки."}
      </p>
    </section>
  );
}

function Applications({ onApproved }) {
  const [apps, setApps] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    supabase
      .from("applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .then(({ data }) => setApps(data ?? []));
  }

  useEffect(load, []);

  async function approve(app) {
    setBusyId(app.id);
    const { error } = await supabase.functions.invoke("approve-application", {
      body: { applicationId: app.id },
    });
    setBusyId(null);
    if (error) {
      window.alert("Не удалось одобрить заявку — проверьте, что Edge Function approve-application развёрнута (см. README).");
      return;
    }
    load();
    onApproved?.();
  }

  async function reject(app) {
    if (!window.confirm("Отклонить эту заявку?")) return;
    await supabase.from("applications").update({ status: "rejected" }).eq("id", app.id);
    load();
  }

  if (!apps || apps.length === 0) return null;

  return (
    <section className="cabinet-section">
      <h2>заявки на доступ</h2>
      {apps.map((app) => (
        <div className="lesson-card" key={app.id}>
          <div className="lesson-date">{app.name || "без имени"}</div>
          <div className="lesson-row">
            <strong>Почта:</strong>
            {app.contact_email}
          </div>
          {app.message && (
            <div className="lesson-row">
              <strong>Сообщение:</strong>
              {app.message}
            </div>
          )}
          <div className="lesson-actions">
            <button onClick={() => approve(app)} disabled={busyId === app.id}>
              {busyId === app.id ? "одобряем…" : "одобрить"}
            </button>
            <button onClick={() => reject(app)}>отклонить</button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function TeacherView() {
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState(null);
  const [editing, setEditing] = useState(null); // lesson id being edited, or "new"
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [contactDraft, setContactDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [reminding, setReminding] = useState(null); // lesson id currently sending
  const [reminded, setReminded] = useState(null); // lesson id that just sent

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
      .update({ full_name: nameDraft.trim(), contact: contactDraft.trim(), teacher_notes: notesDraft.trim() })
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
    if (!student) return;
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

  async function handleRemind(lesson) {
    setReminding(lesson.id);
    const ok = await remindStudent(selected, lesson);
    setReminding(null);
    if (ok) {
      setReminded(lesson.id);
      setTimeout(() => setReminded((id) => (id === lesson.id ? null : id)), 2500);
    } else {
      window.alert("Не удалось отправить напоминание — проверьте настройку почты (см. README).");
    }
  }

  if (students === null) return <p className="cabinet-empty">Загрузка учеников…</p>;

  return (
    <>
      <Applications onApproved={() => loadStudents()} />

      {students.length === 0 ? (
        <p className="cabinet-empty">
          Пока нет учеников. Добавьте их в Supabase → Authentication → Users
          (см. README) или дождитесь заявки выше.
        </p>
      ) : (
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
      )}

      <WeekOverview onPickStudent={selectStudent} />

      <MaterialsLibrary />

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
              <label>
                Заметки (видны только вам)
                <textarea
                  placeholder="например: слабое место — времена"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
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
                    setNotesDraft(selected.teacher_notes || "");
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
              {selected.teacher_notes && (
                <p className="cabinet-note" style={{ fontSize: 13, fontStyle: "italic" }}>
                  {selected.teacher_notes}
                </p>
              )}
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
                  <div className="lesson-date">
                    {formatDate(l.scheduled_at)}
                    {l.paid && <span className="lesson-badge">оплачено</span>}
                    {l.homework_done && <span className="lesson-badge">дз готово</span>}
                  </div>
                  {l.topic && <div className="lesson-topic">{l.topic}</div>}
                  {l.meeting_url && (
                    <div className="lesson-row">
                      <strong>Ссылка:</strong>
                      <a className="lesson-meet" href={l.meeting_url} target="_blank" rel="noreferrer">
                        Яндекс Телемост
                      </a>
                    </div>
                  )}
                  {l.student_message && (
                    <div className="lesson-row">
                      <strong>Вопрос от ученика:</strong>
                      {l.student_message}
                    </div>
                  )}
                  <div className="lesson-actions">
                    <button onClick={() => setEditing(l.id)}>редактировать</button>
                    <button onClick={() => deleteLesson(l.id)}>удалить</button>
                    <button onClick={() => handleRemind(l)} disabled={reminding === l.id || !selected.email}>
                      {reminding === l.id ? "отправляем…" : reminded === l.id ? "отправлено ✓" : "напомнить"}
                    </button>
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
