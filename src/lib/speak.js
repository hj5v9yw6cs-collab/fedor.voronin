// Speaks English text aloud using the browser's built-in speech
// synthesis. We can't (and won't) clone a specific real person's voice —
// the Web Speech API only exposes whatever voices the OS/browser ships —
// but we can pick the least robotic one available and tune it for
// warmth instead of the flat default.
const CAN_SPEAK = typeof window !== "undefined" && "speechSynthesis" in window;

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
  const score = (v) => {
    let s = 0;
    if (/^en/i.test(v.lang)) s += 10;
    if (/en-US|en-GB/i.test(v.lang)) s += 2;
    // Higher-quality synthesis engines tend to flag themselves this way
    // (Edge's "... Online (Natural)", Safari's "(Enhanced)"/"(Premium)").
    if (/natural|neural|enhanced|premium/i.test(v.name)) s += 8;
    if (v.localService) s += 1;
    return s;
  };
  return voices.slice().sort((a, b) => score(b) - score(a))[0] ?? null;
}

export async function speak(text) {
  if (!CAN_SPEAK) return;

  window.speechSynthesis.cancel();
  const voices = await ensureVoices();
  const voice = pickVoice(voices);

  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang || "en-US";
  utter.rate = 0.93; // a touch slower than default — reads less clipped
  utter.pitch = 1.04; // a touch brighter than the flat default pitch

  window.speechSynthesis.speak(utter);
}

export const canSpeak = CAN_SPEAK;
