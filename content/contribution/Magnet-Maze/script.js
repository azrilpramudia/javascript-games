(() => {
  const canvas = document.getElementById("map");
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const GRID = 10;
  const TILE_W = W / GRID,
    TILE_H = H / GRID;

  const uiAttempts = document.getElementById("ui-attempts");
  const uiBest = document.getElementById("ui-best");
  const guessList = document.getElementById("guess-list");
  const btnNew = document.getElementById("btn-new");
  const btnHint = document.getElementById("btn-hint");

  let secret = {
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  };
  let attempts = 0;
  let guesses = [];
  let revealedQuadrant = false;

  function newGame() {
    secret = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    attempts = 0;
    guesses = [];
    revealedQuadrant = false;
    uiAttempts.textContent = attempts;
    guessList.innerHTML = "";
    uiBest.textContent = localStorage.getItem("th-best") || "—";
    draw();
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function tempColor(dist) {
    const maxD = Math.hypot(GRID - 1, GRID - 1);
    const t = Math.max(0, Math.min(1, 1 - dist / maxD));
    const cold = [94, 231, 255],
      hot = [255, 77, 77];
    const r = Math.round(cold[0] + (hot[0] - cold[0]) * t);
    const g = Math.round(cold[1] + (hot[1] - cold[1]) * t);
    const b = Math.round(cold[2] + (hot[2] - cold[2]) * t);
    return `rgb(${r},${g},${b})`;
  }

  function directionHint(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const horiz = dx === 0 ? "" : dx > 0 ? "→" : "←";
    const vert = dy === 0 ? "" : dy > 0 ? "↓" : "↑";
    return vert + horiz || "•";
  }

  function addGuess(x, y) {
    const coord = { x, y };
    const dist = distance(coord, secret);
    const color = tempColor(dist);
    const dir = directionHint(coord, secret);
    attempts += 1;
    uiAttempts.textContent = attempts;
    guesses.unshift({ x, y, dist, color, dir });
    renderGuesses();
    draw();
    if (x === secret.x && y === secret.y) {
      onFound();
    }
  }

  function renderGuesses() {
    guessList.innerHTML = "";
    for (const g of guesses) {
      const el = document.createElement("div");
      el.className = "guess";
      el.innerHTML = `<div>(${g.x + 1},${g.y + 1})</div>
        <div style='display:flex;gap:8px;align-items:center'>
          <div style='width:18px;height:18px;border-radius:4px;background:${
            g.color
          }'></div>
          <div>${g.dir}</div>
        </div>`;
      guessList.appendChild(el);
    }
  }

  function onFound() {
    const bestKey = "th-best";
    const prev = Number(localStorage.getItem(bestKey) || 1e9);
    if (attempts < prev) {
      localStorage.setItem(bestKey, attempts);
      uiBest.textContent = attempts;
    }
    showModal(`Treasure found in ${attempts} attempts!`);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const gx = i * TILE_W,
          gy = j * TILE_H;
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(gx, gy, TILE_W - 1, TILE_H - 1);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.strokeRect(gx, gy, TILE_W, TILE_H);
      }
    }

    for (const g of guesses) {
      ctx.fillStyle = g.color;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(g.x * TILE_W, g.y * TILE_H, TILE_W, TILE_H);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.dir, g.x * TILE_W + TILE_W / 2, g.y * TILE_H + TILE_H / 2);
    }

    if (revealedQuadrant) {
      const midX = Math.ceil(GRID / 2) - 1,
        midY = Math.ceil(GRID / 2) - 1;
      const qx = secret.x <= midX ? 0 : midX + 1;
      const qy = secret.y <= midY ? 0 : midY + 1;
      ctx.fillStyle = "rgba(255,230,120,0.06)";
      ctx.fillRect(
        qx * TILE_W,
        qy * TILE_H,
        (GRID / 2) * TILE_W,
        (GRID / 2) * TILE_H
      );
    }

    if (guesses.length > 0) {
      const last = guesses[0];
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        last.x * TILE_W + 4,
        last.y * TILE_H + 4,
        TILE_W - 8,
        TILE_H - 8
      );
    }
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const gx = Math.floor(cx / TILE_W);
    const gy = Math.floor(cy / TILE_H);
    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
      addGuess(gx, gy);
    }
  });

  btnHint.addEventListener("click", () => {
    if (revealedQuadrant) return;
    revealedQuadrant = true;
    draw();
  });

  btnNew.addEventListener("click", newGame);

  function showModal(msg) {
    const d = document.createElement("div");
    d.style.position = "fixed";
    d.style.left = "0";
    d.style.top = "0";
    d.style.width = "100%";
    d.style.height = "100%";
    d.style.display = "flex";
    d.style.alignItems = "center";
    d.style.justifyContent = "center";
    d.style.background = "rgba(0,0,0,0.5)";

    const b = document.createElement("div");
    b.style.background = "linear-gradient(180deg, #0e1b2a, #06101a)";
    b.style.padding = "20px";
    b.style.borderRadius = "12px";
    b.style.color = "#fff";
    b.innerHTML = `<div style='font-weight:800;margin-bottom:8px'>${msg}</div>
      <div style='display:flex;gap:8px;justify-content:center'>
        <button id='m-play'>Play Again</button>
        <button id='m-close'>Close</button>
      </div>`;
    d.appendChild(b);
    document.body.appendChild(d);

    document.getElementById("m-play").addEventListener("click", () => {
      document.body.removeChild(d);
      newGame();
    });
    document.getElementById("m-close").addEventListener("click", () => {
      document.body.removeChild(d);
    });
  }

  uiBest.textContent = localStorage.getItem("th-best") || "—";
  draw();
})();
