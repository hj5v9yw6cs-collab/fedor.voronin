import "./StickerPhoto.css";
import photo from "../assets/me.png";
import { useLanguage } from "../lib/i18nData";

export default function StickerPhoto() {
  const { strings } = useLanguage();

  return (
    <div className="sticker">

      <div className="photo-card">
        <img
          src={photo}
          alt="Федор"
          className="photo"
        />
      </div>

      <div className="photo-note">

        <svg
          className="arrow"
          width="80"
          height="30"
          viewBox="0 0 80 30"
          fill="none"
        >
          <path
            d="M2 5 C25 8 45 12 72 24"
            stroke="var(--fg-dim)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <p>
          {strings.hero.photoNote.map((line, i) => (
            <span key={i}>
              {line}
              {i < strings.hero.photoNote.length - 1 && <br />}
            </span>
          ))}
        </p>

      </div>

    </div>
  );
}
