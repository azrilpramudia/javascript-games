const choices = document.querySelectorAll(".choice");
const resultText = document.getElementById("result-text");
const playerScoreDisplay = document.getElementById("player-score");
const computerScoreDisplay = document.getElementById("computer-score");
const playAgainButton = document.getElementById("play-again");
const gameWrapper = document.querySelector(".game-wrapper");

let playerScore = 0;
let computerScore = 0;
let roundOver = false;

const options = ["rock", "paper", "scissors"];

choices.forEach(choice => {
  choice.addEventListener("click", () => {
    if (roundOver) return;

    const playerChoice = choice.getAttribute("data-choice");
    const computerChoice = options[Math.floor(Math.random() * 3)];

    const result = getWinner(playerChoice, computerChoice);
    showResult(result, playerChoice, computerChoice);
  });
});

playAgainButton.addEventListener("click", resetRound);

function getWinner(player, computer) {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
}

function showResult(result, playerChoice, computerChoice) {
  roundOver = true;
  let message = "";

  if (result === "win") {
    playerScore++;
    message = `🎉 You Win! ${capitalize(playerChoice)} beats ${computerChoice}!`;
    gameWrapper.classList.add("result-win");
  } else if (result === "lose") {
    computerScore++;
    message = `💀 You Lose! ${capitalize(computerChoice)} beats ${playerChoice}!`;
    gameWrapper.classList.add("result-lose");
  } else {
    message = `😐 It's a Draw! You both chose ${playerChoice}.`;
  }

  playerScoreDisplay.textContent = playerScore;
  computerScoreDisplay.textContent = computerScore;
  resultText.textContent = message;
  playAgainButton.classList.remove("hidden");
}

function resetRound() {
  roundOver = false;
  resultText.textContent = "Make your move!";
  playAgainButton.classList.add("hidden");
  gameWrapper.classList.remove("result-win", "result-lose");
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
