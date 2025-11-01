const coinContainer = document.getElementById("coinContainer");
const tossButton = document.getElementById("tossButton");
const addCoinsButton = document.getElementById("addCoinsButton");
const tossAllButton = document.getElementById("tossAllButton");
const coinCountInput = document.getElementById("coinCount");
const headsCount = document.getElementById("headsCount");
const tailsCount = document.getElementById("tailsCount");
const totalCoinsCount = document.getElementById("totalCoinsCount");
const totalTossCount = document.getElementById("totalTossCount");
const tossStyleToggle = document.getElementById("tossStyleToggle");
const fullScreenIcon = document.getElementById("fullScreenIcon");
const exitFullScreenIcon = document.getElementById("exitFullScreenIcon");

const spinSound = document.getElementById("spin");
const flipSound = document.getElementById("flip");

fullScreenIcon.addEventListener("click", () => {
  coinContainer.classList.add("full-screen");
});

exitFullScreenIcon.addEventListener("click", () => {
  coinContainer.classList.remove("full-screen");
});

let heads = 0;
let tails = 0;
let totalTosses = 0;
let totalCoins = 1;

// helper to disable controls during animations
function setControlsDisabled(disabled) {
  tossButton.disabled = disabled;
  tossAllButton.disabled = disabled;
  addCoinsButton.disabled = disabled;
}

// track running animations so controls are re-enabled only when all finish
let activeAnimations = 0;

function createCoin() {
  const coin = document.createElement("div");
  coin.classList.add("coin");
  coin.innerHTML = `
    <div class="side heads">Heads</div>
    <div class="side tails">Tails</div>
  `;
  coin.addEventListener("click", () => tossCoin(coin));
  coinContainer.appendChild(coin);
  totalCoinsCount.textContent = totalCoins;
}

function tossCoin(coin) {
  if (navigator.vibrate) {
    navigator.vibrate(70);
  }
  const random = Math.random();
  const result = random < 0.5 ? "heads" : "tails";
  const tossStyle = tossStyleToggle.checked ? "toss" : "spin";
  // prepare coin: remove any previous face classes and anim classes
  coin.classList.remove('anim-spin', 'anim-toss', 'face-heads', 'face-tails');
  // bring above others
  coin.style.zIndex = 9;

  // increment active animations and disable controls
  activeAnimations++;
  setControlsDisabled(true);

  // choose anim class
  const animClass = tossStyle === 'spin' ? 'anim-spin' : 'anim-toss';

  // reset and play sound
  try {
    if (tossStyle === 'spin') { spinSound.currentTime = 0; spinSound.play(); }
    else { flipSound.currentTime = 0; flipSound.play(); }
  } catch (err) { /* ignore play errors */ }

  // force reflow to allow re-adding class
  coin.offsetWidth; // eslint-disable-line no-unused-expressions
  coin.classList.add(animClass);

  // when animation ends, apply result and update counters
  function onAnimEnd(ev) {
    // ensure we only handle the end for our animation (not child animations)
    if (ev.target !== coin) return;
    coin.removeEventListener('animationend', onAnimEnd);
    coin.classList.remove(animClass);
    if (result === 'heads') {
      heads++;
      coin.classList.add('face-heads');
    } else {
      tails++;
      coin.classList.add('face-tails');
    }
    headsCount.textContent = heads;
    tailsCount.textContent = tails;
    totalTosses++;
    totalTossCount.textContent = totalTosses;
    coin.style.zIndex = 0;

    // decrement running animations and re-enable controls when none running
    activeAnimations = Math.max(0, activeAnimations - 1);
    if (activeAnimations === 0) setControlsDisabled(false);
  }

  coin.addEventListener('animationend', onAnimEnd);
}

function tossAllCoins() {
  const coins = Array.from(document.querySelectorAll(".coin"));
  // stagger the tosses so animations/sounds don't all overlap
  coins.forEach((coin, i) => setTimeout(() => tossCoin(coin), i * 150));
}

tossButton.addEventListener("click", () => {
  const coin = document.querySelector(".coin");
  if (coin) tossCoin(coin);
});

addCoinsButton.addEventListener("click", () => {
  const count = parseInt(coinCountInput.value) || 1;
  for (let i = 0; i < count; i++) {
    totalCoins++;
    createCoin();
  }
  totalCoinsCount.textContent = totalCoins;
});

tossAllButton.addEventListener("click", tossAllCoins);

createCoin();
