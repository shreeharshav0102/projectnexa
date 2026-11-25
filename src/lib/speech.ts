/**
 * Voice input (SpeechRecognition) + spoken replies (SpeechSynthesis).
 * Both degrade gracefully when unsupported.
 */

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

type RecogInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function createRecognizer(
  onText: (text: string, isFinal: boolean) => void,
  onEnd: () => void
): RecogInstance | null {
  if (!speechSupported()) return null;
  const W = window as unknown as Record<string, new () => RecogInstance>;
  const Ctor = W['SpeechRecognition'] || W['webkitSpeechRecognition'];
  const rec = new Ctor();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (e: unknown) => {
    const ev = e as { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> };
    let interim = '';
    let final = '';
    for (let i = 0; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    onText(final || interim, Boolean(final));
  };
  rec.onend = onEnd;
  rec.onerror = onEnd;
  return rec;
}

export function speak(text: string) {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const clean = text
    .replace(/```[\s\S]*?```/g, ' code block. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>|\-[\]]/g, '')
    .replace(/\|/g, ', ')
    .replace(/\n{2,}/g, '. ')
    .slice(0, 1200);
  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 1.02;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
