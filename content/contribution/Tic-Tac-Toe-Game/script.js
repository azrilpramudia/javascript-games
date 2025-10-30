const cells = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");

let currentPlayer = "X";
let running = true;

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

cells.forEach(cell => cell.addEventListener("click", cellClicked));
restartBtn.addEventListener("click", restartGame);

function cellClicked() {
  const index = Array.from(cells).indexOf(this);

  if (this.textContent !== "" || !running) return;

  this.textContent = currentPlayer;
  this.classList.add("glow");
  checkWinner();
}

function checkWinner() {
  let roundWon = false;

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      cells[a].textContent &&
      cells[a].textContent === cells[b].textContent &&
      cells[a].textContent === cells[c].textContent
    ) {
      roundWon = true;
      highlightCells([a, b, c]);
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `🎉 Player ${currentPlayer} Wins! 🎉`;
    running = false;
  } else if ([...cells].every(cell => cell.textContent !== "")) {
    statusText.textContent = "😸 It's a Draw!";
    running = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn 💫`;
  }
}

function highlightCells(indices) {
  indices.forEach(i => {
    cells[i].style.background = "#ffb6e3";
    cells[i].style.boxShadow = "0 0 25px #fff";
  });
}

function restartGame() {
  currentPlayer = "X";
  running = true;
  statusText.textContent = "Player X's turn 💫";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.background = "rgba(255, 255, 255, 0.2)";
    cell.classList.remove("glow");
  });
}
