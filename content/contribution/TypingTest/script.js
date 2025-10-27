const quotes = [
    "Practice makes perfect",
    "Never give up",
    "Believe in yourself",
    "Hard work beats talent",
    "Set you heart ablaze",
    "Wake up to reality kid"
];

let quoteText = document.getElementById("quote");
let input = document.getElementById("input");
let startBtn = document.getElementById("start-btn");
let timeEl = document.getElementById("time");
let wpmEl = document.getElementById("wpm");
let accuracyEl = document.getElementById("accuracy");

let time = 15;
let timer;
let currentQuote = "";
let correctChars = 0;
let totalChars = 0;

startBtn.addEventListener("click", startTest);

function startTest() {
    startBtn.disabled = true;
    input.disabled = false;
    input.value = "";
    input.focus();
    time = 15;
    correctChars = 0;
    totalChars = 0;
    wpmEl.textContent = 0;
    accuracyEl.textContent = 0;
    timeEl.textContent = time;

    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = currentQuote;

    input.addEventListener("input", checkInput);

    timer = setInterval(() => {
        time--;
        timeEl.textContent = time;

        if (time === 0) {
            endTest();
        }
    }, 1000);
}

function checkInput() {
    let typed = input.value;
    totalChars = typed.length;
    correctChars = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === currentQuote[i]) correctChars++;
    }

    let accuracy = totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);
    accuracyEl.textContent = accuracy;
}

function endTest() {
    clearInterval(timer);
    input.disabled = true;
    startBtn.disabled = false;

    let wordsTyped = input.value.trim().split(" ").length;
    let wpm = Math.round(wordsTyped / (15 / 60));
    wpmEl.textContent = wpm;
}
