(function () {
  const boardEl = document.getElementById("board"),
    turnEl = document.getElementById("turn"),
    statusEl = document.getElementById("status"),
    movesEl = document.getElementById("moves"),
    btnNew = document.getElementById("btn-new"),
    btnUndo = document.getElementById("btn-undo");
  const PIECE_SYMBOLS = {
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
  };
  const STARTING = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  let board = [],
    whiteToMove = true,
    selected = null,
    legalMoves = [],
    history = [],
    moveList = [];
  const clone = (b) => b.map((r) => r.slice()),
    inB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8,
    color = (p) => (p ? (p === p.toUpperCase() ? "w" : "b") : null);

  function setup() {
    board = clone(STARTING);
    whiteToMove = true;
    selected = null;
    legalMoves = [];
    history = [];
    moveList = [];
    render();
    ui("New game — White to move");
  }
  function ui(m) {
    statusEl.textContent = "Status: " + m;
  }
  function render() {
    boardEl.innerHTML = "";
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const d = document.createElement("div");
        d.className = "cell " + ((r + c) % 2 === 0 ? "light" : "dark");
        d.dataset.r = r;
        d.dataset.c = c;
        const p = board[r][c];
        if (p) d.textContent = PIECE_SYMBOLS[p];
        if (selected && selected.r == r && selected.c == c)
          d.classList.add("highlight");
        if (legalMoves.some((m) => m.r2 == r && m.c2 == c))
          d.classList.add("move");
        d.onclick = clickCell;
        boardEl.appendChild(d);
      }
    turnEl.textContent = whiteToMove ? "White" : "Black";
    moves();
  }

  function clickCell(e) {
    const r = +e.currentTarget.dataset.r,
      c = +e.currentTarget.dataset.c,
      p = board[r][c];
    if (selected) {
      const m = legalMoves.find((x) => x.r2 == r && x.c2 == c);
      if (m) {
        move(selected.r, selected.c, r, c, m.prom);
        selected = null;
        legalMoves = [];
        render();
        check();
        return;
      }
    }
    if (
      p &&
      ((whiteToMove && p === p.toUpperCase()) ||
        (!whiteToMove && p === p.toLowerCase()))
    ) {
      selected = { r, c };
      legalMoves = legals(r, c);
      render();
      ui("Piece selected");
    } else {
      selected = null;
      legalMoves = [];
      render();
    }
  }

  function legals(r, c) {
    const p = board[r][c],
      col = color(p);
    const ps = pseudo(r, c, p),
      ok = [];
    for (const m of ps) {
      const b2 = clone(board);
      b2[m.r2][m.c2] = m.prom || b2[r][c];
      b2[r][c] = "";
      if (!checkKing(col, b2)) ok.push(m);
    }
    return ok;
  }

  function pseudo(r, c, p) {
    const m = [],
      col = color(p),
      dir = p === "P" ? -1 : p === "p" ? 1 : null,
      add = (r2, c2, prom) => m.push({ r1: r, c1: c, r2, c2, prom }),
      emp = (x, y) => inB(x, y) && !board[x][y];
    const piece = p.toUpperCase();
    if (piece === "P") {
      if (dir !== null) {
        if (emp(r + dir, c)) {
          add(r + dir, c);
          const s = p === "P" ? 6 : 1;
          if (r === s && emp(r + 2 * dir, c)) add(r + 2 * dir, c);
        }
        for (const dc of [-1, 1]) {
          const rr = r + dir,
            cc = c + dc;
          if (inB(rr, cc) && board[rr][cc] && color(board[rr][cc]) !== col)
            add(rr, cc);
        }
        m.forEach((x) => {
          if ((x.r2 === 0 && p === "P") || (x.r2 === 7 && p === "p"))
            x.prom = p === "P" ? "Q" : "q";
        });
      }
    } else if (piece === "N") {
      [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ].forEach((d) => {
        const r2 = r + d[0],
          c2 = c + d[1];
        if (inB(r2, c2) && (!board[r2][c2] || color(board[r2][c2]) !== col))
          add(r2, c2);
      });
    } else if (["B", "R", "Q"].includes(piece)) {
      const dirs = [];
      if (piece !== "R") dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (piece !== "B") dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      dirs.forEach((d) => {
        let r2 = r + d[0],
          c2 = c + d[1];
        while (inB(r2, c2)) {
          if (!board[r2][c2]) add(r2, c2);
          else {
            if (color(board[r2][c2]) !== col) add(r2, c2);
            break;
          }
          r2 += d[0];
          c2 += d[1];
        }
      });
    } else if (piece === "K") {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr || dc) {
            const r2 = r + dr,
              c2 = c + dc;
            if (inB(r2, c2) && (!board[r2][c2] || color(board[r2][c2]) !== col))
              add(r2, c2);
          }
        }
    }
    return m;
  }

  function findKing(col, b) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && ((p === "K" && col === "w") || (p === "k" && col === "b")))
          return { r, c };
      }
    return null;
  }
  function checkKing(col, b) {
    const k = findKing(col, b);
    if (!k) return true;
    const oc = col === "w" ? "b" : "w";
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && color(p) === oc) {
          for (const mv of pseudoBoard(r, c, p, b)) {
            if (mv.r2 === k.r && mv.c2 === k.c) return true;
          }
        }
      }
    return false;
  }

  function pseudoBoard(r, c, p, b) {
    const m = [],
      col = color(p),
      dir = p === "P" ? -1 : p === "p" ? 1 : null,
      add = (r2, c2) => m.push({ r1: r, c1: c, r2, c2 }),
      emp = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8 && !b[x][y];
    const piece = p.toUpperCase();
    if (piece === "P") {
      if (dir !== null) {
        if (emp(r + dir, c)) add(r + dir, c);
        for (const dc of [-1, 1]) {
          const rr = r + dir,
            cc = c + dc;
          if (
            rr >= 0 &&
            rr < 8 &&
            cc >= 0 &&
            cc < 8 &&
            b[rr][cc] &&
            color(b[rr][cc]) !== col
          )
            add(rr, cc);
        }
      }
    } else if (piece === "N") {
      [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ].forEach((d) => {
        const r2 = r + d[0],
          c2 = c + d[1];
        if (
          r2 >= 0 &&
          r2 < 8 &&
          c2 >= 0 &&
          c2 < 8 &&
          (!b[r2][c2] || color(b[r2][c2]) !== col)
        )
          add(r2, c2);
      });
    } else if (["B", "R", "Q"].includes(piece)) {
      const dirs = [];
      if (piece !== "R") dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (piece !== "B") dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      dirs.forEach((d) => {
        let r2 = r + d[0],
          c2 = c + d[1];
        while (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8) {
          if (!b[r2][c2]) add(r2, c2);
          else {
            if (color(b[r2][c2]) !== col) add(r2, c2);
            break;
          }
          r2 += d[0];
          c2 += d[1];
        }
      });
    } else if (piece === "K") {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr || dc) {
            const r2 = r + dr,
              c2 = c + dc;
            if (
              r2 >= 0 &&
              r2 < 8 &&
              c2 >= 0 &&
              c2 < 8 &&
              (!b[r2][c2] || color(b[r2][c2]) !== col)
            )
              add(r2, c2);
          }
        }
    }
    return m;
  }

  function move(r1, c1, r2, c2, prom) {
    const txt = fmt(r1, c1, r2, c2);
    history.push({ board: clone(board), whiteToMove, txt });
    let piece = board[r1][c1];
    if (prom) piece = prom;
    board[r2][c2] = piece;
    board[r1][c1] = "";
    if (piece === "P" && r2 === 0) board[r2][c2] = "Q";
    if (piece === "p" && r2 === 7) board[r2][c2] = "q";
    moveList.push(txt);
    whiteToMove = !whiteToMove;
    selected = null;
    legalMoves = [];
    render();
  }

  function fmt(r1, c1, r2, c2) {
    const f = ["a", "b", "c", "d", "e", "f", "g", "h"];
    return f[c1] + (8 - r1) + "→" + f[c2] + (8 - r2);
  }
  function moves() {
    movesEl.innerHTML = "";
    for (let i = 0; i < moveList.length; i += 2) {
      const row = document.createElement("div");
      row.className = "move-row";
      row.innerHTML = `<div>${Math.floor(i / 2) + 1}.</div><div>${
        moveList[i] || ""
      }</div><div>${moveList[i + 1] || ""}</div>`;
      movesEl.appendChild(row);
    }
  }
  function check() {
    const col = whiteToMove ? "w" : "b";
    let any = false;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && color(p) === col && legals(r, c).length) any = true;
      }
    const chk = checkKing(col, board);
    if (!any) {
      ui(
        chk
          ? (whiteToMove ? "White" : "Black") +
              " checkmated. " +
              (whiteToMove ? "Black" : "White") +
              " wins!"
          : "Stalemate — draw"
      );
    } else ui(chk ? (whiteToMove ? "White" : "Black") + " in check" : "Normal");
  }

  btnNew.onclick = () => setup();
  btnUndo.onclick = () => {
    const h = history.pop();
    if (h) {
      board = clone(h.board);
      whiteToMove = h.whiteToMove;
      moveList.pop();
      render();
      ui("Undid move");
    } else ui("Nothing to undo");
  };
  setup();
})();
