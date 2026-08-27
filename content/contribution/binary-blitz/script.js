const TOTAL_QUESTIONS = 10;
const MIN_VALUE = 1;
const MAX_VALUE = 255;

const questionNumberElement = document.querySelector("#question-number");
const questionTotalElement = document.querySelector("#question-total");
const scoreElement = document.querySelector("#score");
const binaryNumberElement = document.querySelector("#binary-number");
const answerOptionsElement = document.querySelector("#answer-options");
const feedbackElement = document.querySelector("#feedback");
const nextButton = document.querySelector("#next-button");
const restartButton = document.querySelector("#restart-button");
const questionPanel = document.querySelector("#question-panel");
const resultsPanel = document.querySelector("#results-panel");
const finalScoreElement = document.querySelector("#final-score");
const resultMessageElement = document.querySelector("#result-message");

let currentQuestion = 1;
let score = 0;
let correctAnswer = 0;
let usedValues = new Set();

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUniqueQuestionValue() {
    let value;

    do {
        value = randomInteger(MIN_VALUE, MAX_VALUE);
    } while (usedValues.has(value));

    usedValues.add(value);
    return value;
}

function shuffle(values) {
    const shuffledValues = [...values];

    for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
        const randomIndex = randomInteger(0, index);
        [shuffledValues[index], shuffledValues[randomIndex]] = [
            shuffledValues[randomIndex],
            shuffledValues[index]
        ];
    }

    return shuffledValues;
}

function createAnswerChoices(answer) {
    const choices = new Set([answer]);

    while (choices.size < 4) {
        const offset = randomInteger(-18, 18);
        const possibleChoice = answer + offset;

        if (possibleChoice >= MIN_VALUE && possibleChoice <= MAX_VALUE) {
            choices.add(possibleChoice);
        }
    }

    return shuffle([...choices]);
}

function renderQuestion() {
    correctAnswer = getUniqueQuestionValue();
    const binaryValue = correctAnswer.toString(2).padStart(8, "0");

    questionNumberElement.textContent = currentQuestion;
    scoreElement.textContent = score;
    binaryNumberElement.textContent = binaryValue;
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";
    nextButton.hidden = true;
    answerOptionsElement.replaceChildren();

    createAnswerChoices(correctAnswer).forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.textContent = choice;
        button.dataset.value = choice;
        button.addEventListener("click", handleAnswer);
        answerOptionsElement.append(button);
    });
}

function handleAnswer(event) {
    const selectedAnswer = Number(event.currentTarget.dataset.value);
    const answerButtons = answerOptionsElement.querySelectorAll("button");

    answerButtons.forEach((button) => {
        button.disabled = true;

        if (Number(button.dataset.value) === correctAnswer) {
            button.classList.add("correct");
        }
    });

    if (selectedAnswer === correctAnswer) {
        score += 1;
        scoreElement.textContent = score;
        feedbackElement.textContent = "Correct! Nice conversion.";
        feedbackElement.classList.add("correct-text");
    } else {
        event.currentTarget.classList.add("incorrect");
        feedbackElement.textContent = `Not quite. The correct answer is ${correctAnswer}.`;
        feedbackElement.classList.add("incorrect-text");
    }

    nextButton.textContent = currentQuestion === TOTAL_QUESTIONS
        ? "See Results"
        : "Next Question";
    nextButton.hidden = false;
}

function showResults() {
    questionPanel.hidden = true;
    resultsPanel.hidden = false;
    finalScoreElement.textContent = `${score} out of ${TOTAL_QUESTIONS}`;

    if (score === TOTAL_QUESTIONS) {
        resultMessageElement.textContent = "Perfect score—you are a binary master!";
    } else if (score >= 7) {
        resultMessageElement.textContent = "Great work! Your binary skills are strong.";
    } else if (score >= 4) {
        resultMessageElement.textContent = "Good start. A little more practice will sharpen your skills.";
    } else {
        resultMessageElement.textContent = "Keep practicing—you will get faster with every round.";
    }
}

function goToNextQuestion() {
    if (currentQuestion === TOTAL_QUESTIONS) {
        showResults();
        return;
    }

    currentQuestion += 1;
    renderQuestion();
}

function startGame() {
    currentQuestion = 1;
    score = 0;
    usedValues = new Set();
    questionTotalElement.textContent = TOTAL_QUESTIONS;
    questionPanel.hidden = false;
    resultsPanel.hidden = true;
    renderQuestion();
}

nextButton.addEventListener("click", goToNextQuestion);
restartButton.addEventListener("click", startGame);

startGame();
