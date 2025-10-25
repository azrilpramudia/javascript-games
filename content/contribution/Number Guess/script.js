let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const feedback = document.getElementById("feedback");
const attemptsDisplay = document.getElementById("attempts");
const restartBtn = document.getElementById("restartBtn");

guessBtn.addEventListener("click", () => {
    const guess = Number(guessInput.value);
    if (!guess || guess < 1 || guess > 100) {
        feedback.textContent = "❌ Enter a valid number between 1 and 100";
        return;
    }

    attempts++;
    attemptsDisplay.textContent = attempts;

    if (guess < secretNumber) {
        feedback.textContent = "⬆️ Too low!";
    } else if (guess > secretNumber) {
        feedback.textContent = "⬇️ Too high!";
    } else {
        feedback.textContent = `🎉 Correct! The number was ${secretNumber}. You guessed it in ${attempts} attempts.`;
        guessBtn.disabled = true;
        guessInput.disabled = true;
    }
});

restartBtn.addEventListener("click", () => {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    attemptsDisplay.textContent = attempts;
    feedback.textContent = "";
    guessInput.value = "";
    guessBtn.disabled = false;
    guessInput.disabled = false;
});
