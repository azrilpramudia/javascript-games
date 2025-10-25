const wordData = [
  { word: "galaxy", hint: "A system of millions or billions of stars" },
  { word: "javascript", hint: "A popular programming language for web" },
  { word: "puzzle", hint: "A game that tests ingenuity" },
  { word: "nebula", hint: "A cloud of gas and dust in space" },
  { word: "voltage", hint: "Electric potential difference" },
  { word: "algorithm", hint: "Step-by-step procedure for calculations" },
  { word: "matrix", hint: "A rectangular array of numbers" },
  { word: "parallel", hint: "Lines that never meet" },
  { word: "signal", hint: "An electrical impulse or message" },
  { word: "dynamic", hint: "Characterized by constant change or progress" }
];

let selectedWord = "";
let selectedHint = "";
let guessed = [];
const maxWrong = 6;
let mistakes = 0;

const canvas = document.getElementById('hangman');
const context = canvas.getContext('2d');

function drawGallows() {
  context.lineWidth = 2;
  context.strokeStyle = '#333';
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Base
  context.beginPath();
  context.moveTo(10, 230);
  context.lineTo(190, 230);
  context.stroke();

  // Pole
  context.beginPath();
  context.moveTo(50, 230);
  context.lineTo(50, 20);
  context.lineTo(150, 20);
  context.lineTo(150, 40);
  context.stroke();
}

function drawHangman(mistakes) {
  switch(mistakes) {
    case 1:  // Head
      context.beginPath();
      context.arc(150, 60, 20, 0, Math.PI * 2);
      context.stroke();
      break;
    case 2: // Body
      context.beginPath();
      context.moveTo(150, 80);
      context.lineTo(150, 140);
      context.stroke();
      break;
    case 3: // Left arm
      context.beginPath();
      context.moveTo(150, 100);
      context.lineTo(120, 120);
      context.stroke();
      break;
    case 4: // Right arm
      context.beginPath();
      context.moveTo(150, 100);
      context.lineTo(180, 120);
      context.stroke();
      break;
    case 5: // Left leg
      context.beginPath();
      context.moveTo(150, 140);
      context.lineTo(120, 180);
      context.stroke();
      break;
    case 6: // Right leg
      context.beginPath();
      context.moveTo(150, 140);
      context.lineTo(180, 180);
      context.stroke();
      break;
  }
}

function generateRandomWord() {
  const randomIndex = Math.floor(Math.random() * wordData.length);
  selectedWord = wordData[randomIndex].word;
  selectedHint = wordData[randomIndex].hint;
}

function startGame() {
  generateRandomWord();
  guessed = [];
  mistakes = 0;
  document.getElementById("message").textContent = "";
  document.getElementById("hint").textContent = selectedHint;
  displayWord();
  generateButtons();
  drawGallows();
}

function displayWord() {
  const wordDisplay = selectedWord
    .split("")
    .map(letter => (guessed.includes(letter) ? letter : "_"))
    .join(" ");
  document.getElementById("word").textContent = wordDisplay;

  if (wordDisplay.replace(/\s+/g, "") === selectedWord) {
    document.getElementById("message").textContent = "You Win! 🎉";
    disableButtons();
  }
}

function generateButtons() {
  const lettersDiv = document.getElementById("letters");
  lettersDiv.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const btn = document.createElement("button");
    btn.textContent = String.fromCharCode(i);
    btn.addEventListener("click", handleGuess);
    lettersDiv.appendChild(btn);
  }
}

function handleGuess(event) {
  const letter = event.target.textContent.toLowerCase();
  event.target.disabled = true;

  if (selectedWord.includes(letter)) {
    guessed.push(letter);
    displayWord();
  } else {
    mistakes++;
    drawHangman(mistakes);
    if (mistakes === maxWrong) {
      document.getElementById("message").textContent =
        `You lost! The word was "${selectedWord}".`;
      disableButtons();
    }
  }
}

function disableButtons() {
  document.querySelectorAll("#letters button").forEach(b => b.disabled = true);
}

document.getElementById("restart").addEventListener("click", startGame);

startGame();
