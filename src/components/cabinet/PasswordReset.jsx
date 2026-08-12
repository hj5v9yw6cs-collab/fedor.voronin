import { useState } from "react";
import { useAuth } from "../../lib/authData";
import "./cabinet.css";

export default function PasswordReset() {
  const { completeRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    setError("");
    setBusy(true);
    const { error: err } = await completeRecovery(password);
    setBusy(false);
    if (err) setError("Не получилось сохранить пароль, попробуйте ещё раз.");
    else setDone(true);
  }

  if (done) {
    return (
      <div className="cabinet-login">
        <h1>Готово</h1>
        <p className="cabinet-note">Пароль сохранён — обновите страницу, чтобы зайти в кабинет.</p>
      </div>
    );
  }

  return (
    <form className="cabinet-login" onSubmit={submit}>
      <h1>Новый пароль</h1>
      <p className="cabinet-note">Придумайте новый пароль для входа в личный кабинет.</p>

      <label>
        Новый пароль
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </label>

      {error && <p className="cabinet-error">{error}</p>}

      <button type="submit" className="btn-burst cabinet-submit" disabled={busy}>
        {busy ? "Сохраняем…" : "Сохранить пароль"}
      </button>
    </form>
  );
}
