const emojiFor = { rock: "🪨", paper: "📄", scissors: "✂️" };

const choiceButtons = document.querySelectorAll(".choice");

const playerChoiceEl = document.querySelector("#player-choice");
const computerChoiceEl = document.querySelector("#computer-choice");
const playerGlyphEl = document.querySelector("#player-glyph");
const computerGlyphEl = document.querySelector("#computer-glyph");
const resultMessageEl = document.querySelector("#result-message");

const playerScoreEl = document.querySelector("#player-score");
const computerScoreEl = document.querySelector("#computer-score");

const resetButton = document.querySelector("#reset-button");

let playerScore = 0;
let computerScore = 0;

const options = ["rock", "paper", "scissors"];

function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

function getWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) return "draw";
  const playerWinsAgainst = { rock: "scissors", paper: "rock", scissors: "paper" };
  return playerWinsAgainst[playerChoice] === computerChoice ? "player" : "computer";
}

function playGame(playerChoice) {
  choiceButtons.forEach((b) => b.classList.toggle("selected", b.dataset.choice === playerChoice));

  const computerChoice = getComputerChoice();
  const winner = getWinner(playerChoice, computerChoice);

  playerGlyphEl.textContent = emojiFor[playerChoice];
  computerGlyphEl.textContent = emojiFor[computerChoice];
  playerChoiceEl.textContent = playerChoice;
  computerChoiceEl.textContent = computerChoice;

  resultMessageEl.classList.remove("win", "lose", "draw");

  if (winner === "player") {
    playerScore++;
    resultMessageEl.textContent = "You win!";
    resultMessageEl.classList.add("win");
  } else if (winner === "computer") {
    computerScore++;
    resultMessageEl.textContent = "Computer wins!";
    resultMessageEl.classList.add("lose");
  } else {
    resultMessageEl.textContent = "It's a draw!";
    resultMessageEl.classList.add("draw");
  }

  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

choiceButtons.forEach((choice) => {
  choice.addEventListener("click", () => playGame(choice.dataset.choice));
});

resetButton.addEventListener("click", () => {
  playerScore = 0;
  computerScore = 0;

  choiceButtons.forEach((b) => b.classList.remove("selected"));
  playerGlyphEl.textContent = "–";
  computerGlyphEl.textContent = "–";
  playerChoiceEl.textContent = "—";
  computerChoiceEl.textContent = "—";
  resultMessageEl.textContent = "Make your choice!";
  resultMessageEl.classList.remove("win", "lose", "draw");

  playerScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
});