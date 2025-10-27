const squares = document.querySelectorAll(".square");
const timeLeft = document.querySelector("#time-left");
const scoreDisplay = document.querySelector("#score");
const startBtn = document.querySelector("#start-btn");
const restartBtn = document.querySelector("#restart-btn");

let result = 0;
let hitPosition = null;
let currentTime = 60;
let timerId = null;
let countDownTimerId = null;
let gameRunning = false;
const speed = 500; // emoji move interval

function randomSquare() {
  squares.forEach((square) => {
    square.classList.remove("emoji");
  });

  const index = Math.floor(Math.random() * squares.length);
  const randomSquare = squares[index];
  randomSquare.classList.add("emoji");
  hitPosition = randomSquare.id;
}

squares.forEach((square) => {
  square.addEventListener("click", () => {
    if (!gameRunning) return;
    if (square.id === hitPosition) {
      result++;
      scoreDisplay.textContent = result;
      hitPosition = null;
      square.classList.remove("emoji");
    }
  });
});

function moveEmoji() {
  // show one immediately, then continue
  randomSquare();
  timerId = setInterval(randomSquare, speed);
}

function startCountDown() {
  // clear any existing to avoid duplicates
  if (countDownTimerId) clearInterval(countDownTimerId);
  countDownTimerId = setInterval(() => {
    currentTime--;
    timeLeft.textContent = currentTime;

    if (currentTime <= 0) {
      endGame();
    }
  }, 1000);
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  result = 0;
  currentTime = 60;
  scoreDisplay.textContent = result;
  timeLeft.textContent = currentTime;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  moveEmoji();
  startCountDown();
}

function restartGame() {
  clearAllIntervals();
  // reset values and start again
  result = 0;
  currentTime = 60;
  scoreDisplay.textContent = result;
  timeLeft.textContent = currentTime;
  gameRunning = true;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  moveEmoji();
  startCountDown();
}

function endGame() {
  clearAllIntervals();
  gameRunning = false;
  startBtn.disabled = false;
  restartBtn.disabled = true;
  alert(`Game Over! Your final Score Is ${result}`);
}

function clearAllIntervals() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  if (countDownTimerId) {
    clearInterval(countDownTimerId);
    countDownTimerId = null;
  }
  squares.forEach((sq) => sq.classList.remove("emoji"));
  hitPosition = null;
}

// wire buttons (they exist in DOM because script is loaded at end of body)
if (startBtn && restartBtn) {
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restartGame);
  // initial state
  startBtn.disabled = false;
  restartBtn.disabled = true;
}

// ensure UI shows initial values
timeLeft.textContent = currentTime;
scoreDisplay.textContent = result;
