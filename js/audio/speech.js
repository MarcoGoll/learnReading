/** Maximum time to wait for the browser's voice list. */
const VOICE_TIMEOUT_MS = 1500;

/** Speech rate (slightly slower than normal). */
const SPEECH_RATE = 0.8;

let germanVoicePromise = null;

/**
 * Finds a German voice in a voice list.
 * @param {Array<SpeechSynthesisVoice>} voices - Available voices.
 * @returns {SpeechSynthesisVoice|null} German voice or null.
 */
function findGermanVoice(voices) {
  return voices.find((voice) => voice.lang === 'de-DE') || voices.find((voice) => voice.lang.startsWith('de')) || null;
}

/**
 * Resolves the German voice, waiting for asynchronously loaded voices.
 * @returns {Promise<SpeechSynthesisVoice|null>} German voice or null.
 */
function loadGermanVoice() {
  if (!('speechSynthesis' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const immediate = findGermanVoice(window.speechSynthesis.getVoices());
    if (immediate) {
      resolve(immediate);
      return;
    }
    const timer = setTimeout(() => resolve(findGermanVoice(window.speechSynthesis.getVoices())), VOICE_TIMEOUT_MS);
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      clearTimeout(timer);
      resolve(findGermanVoice(window.speechSynthesis.getVoices()));
    }, { once: true });
  });
}

/**
 * Returns the German voice (cached).
 * @returns {Promise<SpeechSynthesisVoice|null>} German voice or null.
 */
function germanVoice() {
  if (!germanVoicePromise) {
    germanVoicePromise = loadGermanVoice();
  }
  return germanVoicePromise;
}

/**
 * Checks whether a German voice is available.
 * @returns {Promise<boolean>} True if available.
 */
export async function hasGermanVoice() {
  return (await germanVoice()) !== null;
}

/**
 * Speaks a text with the German voice. Resolves when finished (or after a timeout).
 * @param {string} text - Text to speak.
 * @param {number} [timeoutMs=4000] - Maximum waiting time.
 * @returns {Promise<void>} Resolves after speaking.
 */
export async function speak(text, timeoutMs = 4000) {
  const voice = await germanVoice();
  if (!voice) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = SPEECH_RATE;
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    utterance.onend = () => { clearTimeout(timer); resolve(); };
    utterance.onerror = () => { clearTimeout(timer); resolve(); };
    window.speechSynthesis.speak(utterance);
  });
}
