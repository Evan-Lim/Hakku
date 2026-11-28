"use client";

// Browser voice helpers for /tanya.
// Reading aloud: device voices via speechSynthesis (the live app can switch to /api/ilmu/tts).
// Speaking in: SpeechRecognition where the browser has it (Chrome, Edge, Safari).

export type SpeakResult = "ok" | "near" | "none";

/** Reads `text` aloud. Resolves "near" when no voice for `lang` exists and the closest one is used. */
export function speak(text: string, lang: string, onEnd: () => void): Promise<SpeakResult> {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return Promise.resolve("none");
  try {
    synth.cancel();
  } catch {
    /* ignore */
  }
  const want = lang.toLowerCase();
  const base = want.split("-")[0];
  const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace("_", "-");

  const pick = () => {
    const voices = synth.getVoices();
    let v = voices.find((x) => norm(x) === want) ?? voices.find((x) => norm(x).startsWith(`${base}-`) || norm(x) === base);
    let near = false;
    if (!v && base === "ms") {
      v = voices.find((x) => norm(x).startsWith("id")); // Indonesian is the closest voice to Malay
      near = !!v;
    }
    return { v, near };
  };

  return new Promise((resolve) => {
    const start = () => {
      const { v, near } = pick();
      const u = new SpeechSynthesisUtterance(text);
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      } else {
        u.lang = lang;
      }
      u.rate = 0.95;
      u.onend = onEnd;
      u.onerror = onEnd;
      try {
        synth.resume();
      } catch {
        /* ignore */
      }
      synth.speak(u);
      resolve(!v || near ? "near" : "ok");
    };
    // Chrome drops speak() called in the same tick as cancel(), and voices can load late.
    window.setTimeout(() => {
      if (synth.getVoices().length) return start();
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        start();
      };
      synth.addEventListener("voiceschanged", once, { once: true });
      window.setTimeout(once, 700);
    }, 160);
  });
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

/** Returns a speech recogniser, or null when the browser has none. */
export function createRecognizer(lang: string): RecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = lang;
  r.interimResults = false;
  return r;
}
