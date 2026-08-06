import "./StickerPhoto.css";
import photo from "../assets/me.png";

export default function StickerPhoto() {
  return (
    <div className="sticker">

      <div className="tape"></div>

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
      stroke="white"
      strokeOpacity="0.35"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>

  <p>
    Язык объединяет
    <br />
    людей и открывает
    <br />
    весь мир.
  </p>

</div>

     

    </div>
  );
}