import "./Cabinet.css";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/authData";
import { isCabinetEnabled } from "../lib/supabase";
import Flower from "../components/Flower";
import LoginForm from "../components/cabinet/LoginForm";
import StudentView from "../components/cabinet/StudentView";
import TeacherView from "../components/cabinet/TeacherView";

function Shell({ children }) {
  return (
    <div className="cabinet">
      <div className="cabinet-topbar">
        <Link to="/" className="cabinet-brand">
          <Flower size={24} static />
          <span>Fedor.</span>
        </Link>
      </div>
      <div className="cabinet-body">{children}</div>
    </div>
  );
}

export default function Cabinet() {
  const { enabled, loading, user, profile, signOut } = useAuth();

  if (!isCabinetEnabled || !enabled) {
    return (
      <Shell>
        <p className="cabinet-note">
          Личный кабинет пока не настроен. Загляните позже.
        </p>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <p className="cabinet-note">Загрузка…</p>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <p className="cabinet-note">Загрузка профиля…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="cabinet-header">
        <span>
          {profile.full_name || user.email}
          {profile.role === "teacher" && <span className="cabinet-role"> — преподаватель</span>}
        </span>
        <button className="cabinet-signout btn-burst" onClick={signOut}>
          выйти
        </button>
      </div>
      {profile.role === "teacher" ? <TeacherView /> : <StudentView profile={profile} />}
    </Shell>
  );
}
