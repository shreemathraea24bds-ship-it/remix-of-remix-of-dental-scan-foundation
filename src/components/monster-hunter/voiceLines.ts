/**
 * Voice-Line System — "A.I. Tactical Assistant"
 * Uses Web Speech API (SpeechSynthesis) for zero-dependency TTS.
 * Falls back silently if not supported.
 */

const VOICE_MEMO_KEY = "dentascan-guild-master-voice";

// ---- Voice line pools ----

const COMBAT_ENCOURAGEMENT = [
  "Great form, Hunter! The armor is cracking!",
  "Keep that rhythm! Maximum Enamel Energy!",
  "Excellent technique! The monsters are retreating!",
  "You're a natural, Hunter! Keep it up!",
];

const COMBAT_DIRECTIONAL: Record<number, string> = {
  0: "Target spotted on the upper-left flank! Move your Saber!",
  1: "Hostiles on the upper center! Engage!",
  2: "Upper-right flank under attack! Redirect!",
  3: "Left side needs attention! Sweep that zone!",
  4: "Right side alert! Clear the right flank!",
  5: "Lower-left zone infested! Move down!",
  6: "Lower center needs a sweep! Get in there!",
  7: "Lower-right sector is crawling! Clean it out!",
};

const COMBAT_COMPLETION = [
  "Sector Clear! Moving to the next infested zone.",
  "Zone purified! Great work, Hunter!",
  "Target eliminated! The Guild Master will be proud!",
];

const WARNING_TOO_FAST = [
  "Steady, Hunter! Focus your strikes for maximum damage.",
  "You're swinging wild! Controlled rhythm defeats monsters faster.",
  "Slow down! Precision beats speed every time.",
];

const WARNING_NO_MOTION = [
  "The monsters are laughing at you! Move to defeat them!",
  "No motion detected! The Plaque Legion is advancing!",
  "Hunter, are you asleep? The frontier needs you!",
];

const WARNING_BLOCK = [
  "Armor Breach! Lighten your touch or damage the Frontier!",
  "Too much force! The monsters feed on chaos, not power.",
];

const VICTORY = [
  "Mission Accomplished. Report to the Guild Master for your bounty.",
  "The Plaque Legion is in full retreat! Outstanding work!",
  "All hostiles neutralized. The Oral Frontier is secure!",
];

const STREAK_LINES: Record<number, string> = {
  2: "2 days strong! Keep the momentum going!",
  3: "3 days! The Golden Brush is yours!",
  5: "5 days down! You're becoming a legend!",
  6: "6 days down, 1 to go. The Knight's Medal is within reach!",
  7: "7 days! Knight of the Enamel! Incredible!",
  14: "14 days! Champion of the Oral Frontier!",
  30: "30 days! You are a Legendary Master Hunter!",
};

// ---- Helpers ----

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let lastSpoken = 0;
const COOLDOWN = 4000; // minimum ms between voice lines

function speak(text: string, rate = 1.05, pitch = 0.9) {
  const now = Date.now();
  if (now - lastSpoken < COOLDOWN) return;
  lastSpoken = now;

  try {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.7;
    // Try to find a good voice
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel")
    );
    if (preferred) utterance.voice = preferred;
    speechSynthesis.speak(utterance);
  } catch {}
}

// ---- Public API ----

export function voiceEncouragement() {
  speak(pick(COMBAT_ENCOURAGEMENT));
}

export function voiceDirectional(sector: number) {
  const line = COMBAT_DIRECTIONAL[sector];
  if (line) speak(line);
}

export function voiceCompletion() {
  speak(pick(COMBAT_COMPLETION));
}

export function voiceWarningTooFast() {
  speak(pick(WARNING_TOO_FAST), 0.95, 0.7);
}

export function voiceWarningNoMotion() {
  speak(pick(WARNING_NO_MOTION), 1.0, 0.8);
}

export function voiceWarningBlock() {
  speak(pick(WARNING_BLOCK), 0.9, 0.7);
}

export function voiceVictory() {
  speak(pick(VICTORY), 0.95, 1.0);
}

export function voiceStreakLine(streak: number) {
  const line = STREAK_LINES[streak];
  if (line) speak(line);
}

// ---- Mother's Voice Memo (Battle Cry) ----

export function saveVoiceMemo(blob: Blob): Promise<void> {
  return _saveAudioMemo(VOICE_MEMO_KEY, blob);
}

export function getVoiceMemo(): string | null {
  return _getAudioMemo(VOICE_MEMO_KEY);
}

export function deleteVoiceMemo() {
  _deleteAudioMemo(VOICE_MEMO_KEY);
}

export function playVoiceMemo(): Promise<void> {
  return _playAudioMemo(VOICE_MEMO_KEY, 0.9);
}

// ---- Mother's Daily Briefing ----

const DAILY_BRIEFING_KEY = "dentascan-guild-master-daily-briefing";
const DAILY_BRIEFING_PLAYED_KEY = "dentascan-daily-briefing-played-date";

export function saveDailyBriefing(blob: Blob): Promise<void> {
  return _saveAudioMemo(DAILY_BRIEFING_KEY, blob);
}

export function getDailyBriefing(): string | null {
  return _getAudioMemo(DAILY_BRIEFING_KEY);
}

export function deleteDailyBriefing() {
  _deleteAudioMemo(DAILY_BRIEFING_KEY);
}

export function playDailyBriefing(): Promise<void> {
  return _playAudioMemo(DAILY_BRIEFING_KEY, 0.85);
}

/** Returns true if the daily briefing hasn't been played today yet */
export function shouldPlayDailyBriefing(): boolean {
  if (!getDailyBriefing()) return false;
  try {
    const lastPlayed = localStorage.getItem(DAILY_BRIEFING_PLAYED_KEY);
    const today = new Date().toDateString();
    return lastPlayed !== today;
  } catch {
    return true;
  }
}

export function markDailyBriefingPlayed() {
  try {
    localStorage.setItem(DAILY_BRIEFING_PLAYED_KEY, new Date().toDateString());
  } catch {}
}

// ---- Shared helpers ----

function _saveAudioMemo(key: string, blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try { localStorage.setItem(key, reader.result as string); } catch {}
      resolve();
    };
    reader.readAsDataURL(blob);
  });
}

function _getAudioMemo(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function _deleteAudioMemo(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

function _playAudioMemo(key: string, volume: number): Promise<void> {
  return new Promise((resolve) => {
    const memo = _getAudioMemo(key);
    if (!memo) { resolve(); return; }
    const audio = new Audio(memo);
    audio.volume = volume;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}
