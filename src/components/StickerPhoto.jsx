import "./StickerPhoto.css";
import photo from "../assets/me.jpg";
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
          width="920"
          height="689"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <div className="photo-note">

        <svg
          className="arrow"
          width="46"
          height="40"
          viewBox="0 0 46 40"
          fill="none"
        >
          {/* Curves up toward the photo directly above this note,
              ending in a small hook so it reads as an arrow, not just
              a stray line. */}
          <path
            d="M4 36 C10 16 22 6 34 4"
            stroke="var(--fg-dim)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M25 3 L34 4 L31 12"
            stroke="var(--fg-dim)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
