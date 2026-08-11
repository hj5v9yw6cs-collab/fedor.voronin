import { useState } from "react";
import { useAuth } from "../../lib/authData";
import "./cabinet.css";

export default function LoginForm() {
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
        Доступ выдаёт преподаватель. Если у вас ещё нет логина — напишите
        в Telegram.
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
    </form>
  );
}
