import { useState } from "react";
import { useAuth } from "../../lib/authData";
import { supabase } from "../../lib/supabase";
import "./cabinet.css";

function LoginFields({ onSwitch }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError("Неверная почта или пароль.");
  }

  return (
    <form className="cabinet-login" onSubmit={submit}>
      <h1>Вход в личный кабинет</h1>
      <p className="cabinet-note">
        Доступ выдаёт преподаватель. Если у вас ещё нет логина —{" "}
        <button type="button" className="cabinet-link" onClick={() => onSwitch("apply")}>
          оставьте заявку
        </button>
        .
      </p>

      <label>
        Почта
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>

      {error && <p className="cabinet-error">{error}</p>}

      <button type="submit" className="btn-burst cabinet-submit" disabled={busy}>
        {busy ? "Входим…" : "Войти"}
      </button>

      <button type="button" className="cabinet-link" onClick={() => onSwitch("reset")}>
        забыли пароль?
      </button>
    </form>
  );
}

function ResetFields({ onSwitch }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    await requestPasswordReset(email.trim());
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="cabinet-login">
        <h1>Проверьте почту</h1>
        <p className="cabinet-note">
          Если такой аккаунт существует, на {email} придёт ссылка для смены пароля.
        </p>
        <button type="button" className="cabinet-link" onClick={() => onSwitch("login")}>
          ← назад ко входу
        </button>
      </div>
    );
  }

  return (
    <form className="cabinet-login" onSubmit={submit}>
      <h1>Восстановление пароля</h1>
      <p className="cabinet-note">Пришлём ссылку для смены пароля на вашу почту.</p>

      <label>
        Почта
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      <button type="submit" className="btn-burst cabinet-submit" disabled={busy}>
        {busy ? "Отправляем…" : "Отправить ссылку"}
      </button>

      <button type="button" className="cabinet-link" onClick={() => onSwitch("login")}>
        ← назад ко входу
      </button>
    </form>
  );
}

function ApplyFields({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    await supabase.from("applications").insert({
      name: name.trim() || null,
      contact_email: email.trim(),
      message: message.trim() || null,
    });
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="cabinet-login">
        <h1>Заявка отправлена</h1>
        <p className="cabinet-note">
          Как только преподаватель её одобрит, на вашу почту придёт логин и пароль.
        </p>
        <button type="button" className="cabinet-link" onClick={() => onSwitch("login")}>
          ← назад ко входу
        </button>
      </div>
    );
  }

  return (
    <form className="cabinet-login" onSubmit={submit}>
      <h1>Заявка на доступ</h1>
      <p className="cabinet-note">Оставьте свои данные — преподаватель откроет вам доступ.</p>

      <label>
        Имя
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label>
        Почта
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      <label>
        Сообщение (необязательно)
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      <button type="submit" className="btn-burst cabinet-submit" disabled={busy}>
        {busy ? "Отправляем…" : "Отправить заявку"}
      </button>

      <button type="button" className="cabinet-link" onClick={() => onSwitch("login")}>
        ← назад ко входу
      </button>
    </form>
  );
}

export default function LoginForm() {
  const [mode, setMode] = useState("login"); // login | reset | apply

  if (mode === "reset") return <ResetFields onSwitch={setMode} />;
  if (mode === "apply") return <ApplyFields onSwitch={setMode} />;
  return <LoginFields onSwitch={setMode} />;
}
