const result = document.getElementById("result");

let startTime, timeout;
let bestTime = parseInt(localStorage.getItem("bestReactionTime")) || null;
let gameStarted = false;

function startGame() {
  clearTimeout(timeout);
  document.body.style.backgroundColor = "lightcoral"; // red
  result.innerText = "Click anywhere to start...";
  gameStarted = false;
}

// Begin waiting for green
function beginRound() {
  clearTimeout(timeout);
  document.body.style.backgroundColor = "lightcoral"; // reset to red
  result.innerText = "Wait for green...";
  gameStarted = true;

  const delay = Math.floor(Math.random() * 4000) + 1000; // 1-5s
  timeout = setTimeout(() => {
    startTime = new Date();
    document.body.style.backgroundColor = "lightgreen"; // green
    result.innerText = "CLICK!";
  }, delay);
}

// Click anywhere on screen
document.body.addEventListener("click", () => {
  if (!gameStarted) {
    // Start a new round
    beginRound();
  } else if (!startTime) {
    // Clicked too early
    clearTimeout(timeout);
    result.innerText = "Too early! Click to try again.";
    gameStarted = false; // wait for next click to start round
  } else {
    // Correct click
    const endTime = new Date();
    const reactionTime = endTime - startTime;
    startTime = null;
    gameStarted = false;

    // Update best time
    if (!bestTime || reactionTime < bestTime) {
      bestTime = reactionTime;
      localStorage.setItem("bestReactionTime", bestTime);
    }

    result.innerHTML = `
    <div class="time-box reaction-time">Reaction Time: ${reactionTime} ms</div>
    <div class="time-box best-time">Best Time: ${bestTime} ms</div>
    <div class="instruction">Click anywhere to start again</div>
    `;

  }
});


startGame();
