// Main elements and game state
const randomNumber = getRandomNumber();

// Feature-detect SpeechRecognition and provide a typed fallback
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let recognition = null;
// Prevent rapid automatic restarts when errors occur
let autoRestart = true;
let errorShown = false;


function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

function onSpeak(event) {
  const transcript = (event.results && event.results[0] && event.results[0][0])
    ? event.results[0][0].transcript.trim()
    : '';
  writeMessage(transcript);
  checkNumber(transcript);
}

function writeMessage(message) {
  const messageElement = document.getElementById('msg');
  if (!messageElement) return;
  messageElement.innerHTML = `
    <div>You said: </div>
    <span class="box">${message}</span>
  `;
}

// Wire up the typed-input fallback so it works whether or not SpeechRecognition is available
function wireTypedInput() {
  const input = document.getElementById('guess-input');
  const btn = document.getElementById('guess-button');
  if (!btn || !input) return;

  const submit = () => {
    const val = input.value.trim();
    if (!val) return;
    // show the typed value in the same UI as speech
    writeMessage(val);
    checkNumber(val);
    input.value = '';
    input.focus();
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });
}

// Try to extract a number from the transcript. Prefer digits, fallback to words-to-number.
function extractNumberFromTranscript(text) {
  if (!text) return NaN;
  const digits = text.match(/-?\d+/);
  if (digits) return Number(digits[0]);
  const n = wordsToNumber(text);
  return Number.isFinite(n) ? n : NaN;
}

function wordsToNumber(text) {
  if (!text) return NaN;
  const small = {
    zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
    ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16,
    seventeen:17, eighteen:18, nineteen:19
  };
  const tens = { twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
  const parts = text.toLowerCase().replace(/[^a-z\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
  let total = 0;
  let current = 0;
  for (const p of parts) {
    if (small.hasOwnProperty(p)) {
      current += small[p];
    } else if (tens.hasOwnProperty(p)) {
      current += tens[p];
    } else if (p === 'hundred') {
      current = current === 0 ? 100 : current * 100;
    } else if (p === 'thousand') {
      current = current === 0 ? 1000 : current * 1000;
      total += current;
      current = 0;
    } else {
      // ignore unknown words (like 'please', 'my', 'guess')
    }
  }
  return total + current;
}

function checkNumber(message) {
  const number = extractNumberFromTranscript(message);
  const messageElement = document.getElementById('msg');

  if (Number.isNaN(number)) {
    if (messageElement) messageElement.innerHTML += "<div>That is not a valid number</div>";
    return;
  }
  if (number > 100 || number < 1) {
    if (messageElement) messageElement.innerHTML += "<div>Number must be between 1 and 100</div>";
    return;
  }
  if (number === randomNumber) {
    // stop recognition and remove handlers to avoid using stale DOM (if recognition was created)
    if (recognition) {
      try {
        recognition.removeEventListener('result', onSpeak);
        recognition.removeEventListener('end', restartRecognition);
        recognition.stop();
      } catch (err) { /* ignore stop/remove errors */ }
    }

    document.body.innerHTML = `
      <div class="game-container">
        <h2>Congrats! You guessed the number! <br><br> It was ${number}</h2>
        <button class="play-again btn" id="play-again">Play Again</button>
      </div>`;
    return;
  } else if (number > randomNumber) {

    if (messageElement) messageElement.innerHTML += "<div>GO LOWER</div>";
  } else {
    if (messageElement) messageElement.innerHTML += "<div>GO HIGHER</div>";
  }
}

function restartRecognition() {
  // start again so the user can say another guess, but avoid tight restart loops
  if (!autoRestart || !recognition) return;
  try {
    // small delay to avoid immediate restart on transient errors
    setTimeout(() => {
      try { recognition.start(); } catch (err) { /* ignore start errors */ }
    }, 500);
  } catch (err) { /* ignore */ }
}

// If SpeechRecognition is supported, initialize it. Otherwise, reveal a typed-input fallback.
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = false;

  // Attach listeners first, then start recognition
  recognition.addEventListener('result', onSpeak);
  recognition.addEventListener('end', restartRecognition);
  recognition.addEventListener('error', (e) => {
    // Show the error message once and stop automatic restarts for certain errors
    const errCode = e && e.error ? e.error : 'unknown';
    const el = document.getElementById('msg');
    if (!errorShown && el) {
      el.innerHTML += `<div>Speech recognition error: ${errCode}. Try typing your guess.</div>`;
      errorShown = true;
    }

    // For 'no-speech' and permission errors, stop auto-restarting to avoid infinite loops
    if (errCode === 'no-speech' || errCode === 'not-allowed' || errCode === 'service-not-allowed' || errCode === 'aborted') {
      autoRestart = false;
      try {
        recognition.removeEventListener('end', restartRecognition);
      } catch (_) {}
      try { recognition.stop(); } catch (_) {}
    }

    // Reveal typed fallback so user can continue
    const unsupportedEl = document.getElementById('voice-unsupported');
    const textGuess = document.getElementById('text-guess');
    if (unsupportedEl) unsupportedEl.style.display = 'block';
    if (textGuess) textGuess.style.display = 'block';
  });

  try { recognition.start(); } catch (err) { /* ignore start errors */ }

} else {
  // No speech support — reveal typed fallback UI so the user can type guesses
  const unsupportedEl = document.getElementById('voice-unsupported');
  const textGuess = document.getElementById('text-guess');
  if (unsupportedEl) unsupportedEl.style.display = 'block';
  if (textGuess) textGuess.style.display = 'block';
}

// Always wire the typed input so typing works regardless of speech support
wireTypedInput();

// Event Listener for Play Again button (delegated)
document.body.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'play-again') history.go(0);
});
