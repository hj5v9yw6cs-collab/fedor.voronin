// Speaks English text aloud using the browser's built-in speech
// synthesis. We can't (and won't) clone a specific real person's voice —
// the Web Speech API only exposes whatever voices the OS/browser ships —
// but we can pick the least robotic one available and tune it for
// warmth instead of the flat default.
const CAN_SPEAK = typeof window !== "undefined" && "speechSynthesis" in window;

// Specific voice names known to be the high-quality neural/premium tier
// on their platform, ranked above a generic "sounds natural-ish" text
// match. Edge/Windows ships "Online (Natural)" neural voices for free;
// Safari/iOS ships "Enhanced"/"Premium" ones; Chrome on some platforms
// exposes Google's WaveNet-backed voices under plain names.
const KNOWN_GOOD = [
  /online \(natural\)/i, // Edge neural voices, e.g. "Microsoft Aria Online (Natural)"
  /\(enhanced\)/i, // Safari/macOS/iOS enhanced voices
  /\(premium\)/i, // Safari/macOS/iOS premium voices
  /google (us|uk) english/i, // Chrome's higher-quality built-ins
];

let voicesReady;

function ensureVoices() {
  if (!CAN_SPEAK) return Promise.resolve([]);
  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      resolve(existing);
      return;
    }
    const onChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    // Some browsers never fire voiceschanged — don't hang forever.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 800);
  });

  return voicesReady;
}

function pickVoice(voices) {
  const english = voices.filter((v) => /^en/i.test(v.lang));
  const pool = english.length ? english : voices;

  const score = (v) => {
    let s = 0;
    if (/en-US|en-GB/i.test(v.lang)) s += 2;
    const knownIdx = KNOWN_GOOD.findIndex((re) => re.test(v.name));
    if (knownIdx !== -1) s += 20 - knownIdx; // earlier entries rank higher
    else if (/natural|neural|enhanced|premium/i.test(v.name)) s += 8;
    if (v.localService) s += 1;
    return s;
  };

  return pool.slice().sort((a, b) => score(b) - score(a))[0] ?? null;
}

export async function speak(text) {
  if (!CAN_SPEAK) return;

  window.speechSynthesis.cancel();
  const voices = await ensureVoices();
  const voice = pickVoice(voices);

  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang || "en-US";
  utter.rate = 0.95; // close to natural pace — too slow reads as robotic too
  utter.pitch = 1.0; // let the voice's own pitch carry it, no artificial tilt

  window.speechSynthesis.speak(utter);
}

export const canSpeak = CAN_SPEAK;
