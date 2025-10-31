const textBox = document.getElementById("text-box");
const inputArea = document.getElementById("input-area");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");

let time = 60;
let timer;
let started = false;
let totalTyped = 0;
let correctTyped = 0;

const sampleTexts = [
  "Anime teaches us that even in darkness, a spark of hope can light the way.",
  "Typing fast is not about rushing, it’s about rhythm and focus.",
  "Believe in yourself, and the rest will follow.",
  "Code, type, and create — that’s how legends are born!"
];

let currentText = "";

function generateText() {
  currentText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  textBox.innerHTML = "";
  currentText.split("").forEach(char => {
    const span = document.createElement("span");
    span.textContent = char;
    textBox.appendChild(span);
  });
}

function startGame() {
  if (started) return;
  started = true;
  inputArea.disabled = false;
  inputArea.focus();
  generateText();
  timer = setInterval(() => {
    time--;
    timeDisplay.textContent = time;
    if (time === 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  inputArea.disabled = true;
  const words = totalTyped / 5;
  const wpm = Math.round((words / 60) * (60 - time));
  const accuracy = Math.round((correctTyped / totalTyped) * 100) || 0;
  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy;
  started = false;
}

inputArea.addEventListener("input", () => {
  const input = inputArea.value.split("");
  const spans = textBox.querySelectorAll("span");
  totalTyped = input.length;
  correctTyped = 0;

  spans.forEach((span, i) => {
    const char = input[i];
    if (char == null) {
      span.classList.remove("correct", "incorrect");
    } else if (char === span.textContent) {
      span.classList.add("correct");
      span.classList.remove("incorrect");
      correctTyped++;
    } else {
      span.classList.add("incorrect");
      span.classList.remove("correct");
    }
  });
});

startBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

resetBtn.addEventListener("click", resetGame);

function resetGame() {
  clearInterval(timer);
  time = 60;
  timeDisplay.textContent = 60;
  inputArea.value = "";
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = 0;
  inputArea.disabled = true;
  started = false;
  generateText();
}
