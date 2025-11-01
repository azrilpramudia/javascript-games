// game.js
// Minimal Klondike Solitaire starter with click-to-move, waste/stock, foundations,
// basic validation, selection, dblclick auto-move, and rendering with suit/rank visuals.

const SUITS = ['hearts','diamonds','clubs','spades'];
const RANKS = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function mkDeck(){
  const d = [];
  for(const s of SUITS) for(const r of RANKS) d.push({ id:`${s[0]}${r}`, suit:s, rank:r });
  return d;
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } }

class Klondike {
  constructor(){
    this.stock = [];
    this.waste = [];
    this.foundations = { hearts:[], diamonds:[], clubs:[], spades:[] };
    this.tableau = Array.from({length:7},()=>[]);
    this.moves = 0;
    this.selected = null; // { fromCol: number (-1 = waste), index: number }
    this.el = {};
    this.bindUI();
    this.newGame();
  }

  // --------- setup & deal ----------
  newGame(){
    const deck = mkDeck();
    shuffle(deck);

    // reset model
    this.stock = [];
    this.waste = [];
    for(const k of Object.keys(this.foundations)) this.foundations[k] = [];
    this.tableau = Array.from({length:7},()=>[]);
    this.moves = 0;
    this.selected = null;
    this.startTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);


    // deal tableau: col 0..6, with increasing counts, top card faceUp
    let idx = 0;
    for(let col=0; col<7; col++){
      for(let j=0;j<=col;j++){
        const card = deck[idx++];
        card.faceUp = (j === col);
        this.tableau[col].push(card);
      }
    }

    // remainder to stock (faceDown)
    this.stock = deck.slice(idx).map(c => ({ ...c, faceUp:false }));
    this.render();
  }

    updateTimer() {
  if (!this.startTime || !this.el.timer) return;
  const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
  this.el.timer.textContent = `Time: ${elapsed}s`;
}



  // --------- UI wiring ----------
  bindUI(){
    this.el.newBtn = document.getElementById('newBtn');
    this.el.undoBtn = document.getElementById('undoBtn');
    this.el.stock = document.getElementById('stock');
    this.el.waste = document.getElementById('waste');
    this.el.tableauCols = Array.from(document.querySelectorAll('.col'));
    this.el.moves = document.getElementById('moves');
    this.el.timer = document.getElementById('timer');
    this.el.foundationSlots = Array.from(document.querySelectorAll('.foundations .slot'));

    if (this.el.newBtn) this.el.newBtn.addEventListener('click', ()=> this.newGame());
    if (this.el.stock) this.el.stock.addEventListener('click', ()=> { this.draw(); });

    // tableau column click delegation
    this.el.tableauCols.forEach((colEl, idx) => {
      colEl.addEventListener('click', (ev) => {
        const cardEl = ev.target.closest && ev.target.closest('.card');
        if (cardEl && cardEl.dataset.index !== undefined) {
          const index = Number(cardEl.dataset.index);
          this.onCardSelected(idx, index);
        } else {
          this.onEmptyColClicked(idx);
        }
      });
    });

    // waste click (select top)
    if (this.el.waste) {
      this.el.waste.addEventListener('click', (ev) => {
        if (!this.waste.length) return;
        this.selected = { fromCol: -1, index: this.waste.length - 1 };
        this.render();
      });
    }

    // foundation slot clicks
    if (this.el.foundationSlots) {
      this.el.foundationSlots.forEach(slotEl => {
        const suit = slotEl.dataset.suit;
        slotEl.addEventListener('click', () => {
          if (this.selected) {
            this.attemptMoveToFoundation(suit);
            return;
          }
          // auto-move: prefer waste top then tableau tops
          const wasteTop = this.waste.length ? this.waste[this.waste.length - 1] : null;
          if (wasteTop && wasteTop.suit === suit && this.canMoveToFoundationCard(wasteTop)) {
            this.selected = { fromCol: -1, index: this.waste.length - 1 };
            this.attemptMoveToFoundation(suit);
            return;
          }
          for (let col = 0; col < this.tableau.length; col++) {
            const c = this.tableau[col];
            if (!c.length) continue;
            const top = c[c.length - 1];
            if (top.suit === suit && this.canMoveToFoundationCard(top)) {
              this.selected = { fromCol: col, index: c.length - 1 };
              this.attemptMoveToFoundation(suit);
              return;
            }
          }
        });
      });
    }
  }

  // --------- interactions ----------
  draw(){
    if (this.stock.length === 0) {
      // recycle waste -> stock (faceDown)
      this.stock = this.waste.reverse().map(c => ({ ...c, faceUp:false }));
      this.waste = [];
    } else {
      const c = this.stock.pop();
      c.faceUp = true;
      this.waste.push(c);
    }
    this.moves++;
    this.selected = null;
    this.render();
  }

  isRed(suit){ return suit === 'hearts' || suit === 'diamonds'; }

  onCardSelected(colIdx, index){
    const col = this.tableau[colIdx];
    const card = col[index];
    if (!card || !card.faceUp) return; // can't select face-down

    // If nothing selected, select this stack
    if (!this.selected) {
      this.selected = { fromCol: colIdx, index };
      this.render();
      return;
    }

    // If clicking same selected top -> deselect
    if (this.selected.fromCol === colIdx && this.selected.index === index) {
      this.selected = null;
      this.render();
      return;
    }

    // Otherwise attempt move from selected -> clicked column
    this.attemptMoveToCol(colIdx);
  }

  onEmptyColClicked(colIdx){
    if (!this.selected) return;
    this.attemptMoveToCol(colIdx);
  }

  canMoveStack(fromCol, fromIndex, toCol){
    // moving from waste (-1) only single-card
    let movingCards;
    if (fromCol === -1) {
      if (!this.waste.length) return false;
      movingCards = [ this.waste[this.waste.length - 1] ];
    } else {
      movingCards = this.tableau[fromCol].slice(fromIndex);
      if (!movingCards.length) return false;
    }
    const bottom = movingCards[0];
    const destCol = this.tableau[toCol];
    // empty dest accepts only King
    if (destCol.length === 0) return bottom.rank === 13;
    const destTop = destCol[destCol.length - 1];
    if (this.isRed(bottom.suit) === this.isRed(destTop.suit)) return false;
    return bottom.rank === destTop.rank - 1;
  }

  attemptMoveToCol(toCol){
    const sel = this.selected;
    if (!sel) return;
    const fromCol = sel.fromCol;
    const fromIndex = sel.index;

    if (!this.canMoveStack(fromCol, fromIndex, toCol)) {
      this.selected = null;
      this.render();
      return;
    }

    if (fromCol === -1) {
      const card = this.waste.pop();
      this.tableau[toCol].push(card);
    } else {
      const moving = this.tableau[fromCol].splice(fromIndex);
      this.tableau[toCol].push(...moving);
      const src = this.tableau[fromCol];
      if (src.length) src[src.length -1].faceUp = true;
    }

    this.moves++;
    this.selected = null;
    this.render();
  }

  // --------- foundations ----------
  canMoveToFoundationCard(card){
    if (!card) return false;
    const f = this.foundations[card.suit];
    if (f.length === 0) return card.rank === 1; // Ace
    const top = f[f.length - 1];
    return card.suit === top.suit && card.rank === top.rank + 1;
  }

  attemptMoveToFoundation(targetSuit){
    if (!this.selected) return false;
    const { fromCol, index } = this.selected;

    let movingCard = null;
    if (fromCol === -1) {
      movingCard = this.waste[this.waste.length - 1];
    } else {
      movingCard = this.tableau[fromCol][index];
    }
    if (!movingCard) { this.selected = null; this.render(); return false; }
    if (movingCard.suit !== targetSuit) { this.selected = null; this.render(); return false; }

    if (!this.canMoveToFoundationCard(movingCard)) {
      this.selected = null;
      this.render();
      return false;
    }

    // perform move
    if (fromCol === -1) {
      this.waste.pop();
    } else {
      const col = this.tableau[fromCol];
      // remove single card (foundation only accepts single)
      col.splice(index, 1);
      if (col.length) col[col.length - 1].faceUp = true;
    }

    this.foundations[targetSuit].push(movingCard);
    this.moves++;
    this.selected = null;
    this.render();
    return true;
  }

  // --------- rendering ----------
  render(){
    // moves
    if (this.el.moves) this.el.moves.textContent = `Moves: ${this.moves}`;

    // stock rendering
    if (this.el.stock) {
      const stockEl = this.el.stock;
      stockEl.innerHTML = '';
      if (this.stock.length === 0) {
        stockEl.classList.add('empty');
        stockEl.textContent = 'Empty';
      } else {
        stockEl.classList.remove('empty');
        const back = document.createElement('div');
        back.className = 'card back';
        back.style.setProperty('--index', 0);
        stockEl.appendChild(back);

        const badge = document.createElement('div');
        badge.className = 'pile-count';
        badge.textContent = String(this.stock.length);
        stockEl.appendChild(badge);
      }
    }

    // waste rendering
    if (this.el.waste) {
      const wasteEl = this.el.waste;
      wasteEl.innerHTML = '';
      if (this.waste.length === 0) {
        wasteEl.textContent = 'Waste';
      } else {
        const top = this.waste[this.waste.length - 1];
        const c = document.createElement('div');
        c.className = 'card' + (top.faceUp ? ` suit-${top.suit}` : ' back');
        c.style.setProperty('--index', 0);
        if (top.faceUp) {
          const rankMap = {1:'A',11:'J',12:'Q',13:'K'};
          const rank = rankMap[top.rank] || String(top.rank);
          const glyph = {'hearts':'♥','diamonds':'♦','clubs':'♣','spades':'♠'}[top.suit];
          c.innerHTML = `<div class="rank-top">${rank}</div><div class="suit-large">${glyph}</div><div class="rank-bottom">${rank}</div>`;
        }
        // attach interactions
        c.addEventListener('click', (ev) => { ev.stopPropagation(); this.selected = { fromCol: -1, index: this.waste.length - 1 }; this.render(); });
        c.addEventListener('dblclick', (ev) => { ev.stopPropagation(); if (this.canMoveToFoundationCard(top)) { this.selected = { fromCol: -1, index: this.waste.length - 1 }; this.attemptMoveToFoundation(top.suit); } });
        wasteEl.appendChild(c);
      }
    }

    // foundations rendering
    if (this.el.foundationSlots) {
    this.el.foundationSlots.forEach((el) => {
        const suit = el.dataset.suit;
        const pile = this.foundations[suit];
        el.innerHTML = '';               // clear slot
        el.classList.remove('empty');
        if (pile.length === 0) {
        // show suit glyph for empty foundation
        const glyph = {'hearts':'♥','diamonds':'♦','clubs':'♣','spades':'♠'}[suit];
        el.textContent = glyph;
        el.classList.add('empty');
        el.classList.remove('has-card');
        } else {
        el.classList.add('has-card');
        const top = pile[pile.length - 1];
        // create card element; ensure it flows inside slot (position: static)
        const c = document.createElement('div');
        c.className = 'card' + (top.faceUp ? ` suit-${top.suit}` : ' back');
        // remove absolute positioning transforms for foundation inserted card
        c.style.removeProperty('position');
        c.style.removeProperty('top');
        c.style.removeProperty('left');
        c.style.setProperty('--index', 0);

        if (top.faceUp) {
            const rankMap = {1:'A',11:'J',12:'Q',13:'K'};
            const rank = rankMap[top.rank] || String(top.rank);
            const glyph = {'hearts':'♥','diamonds':'♦','clubs':'♣','spades':'♠'}[top.suit];
            c.innerHTML = `<div class="rank-top">${rank}</div><div class="suit-large">${glyph}</div><div class="rank-bottom">${rank}</div>`;
        }

        el.appendChild(c);
        }
    });
    }

    // tableau rendering
    if (this.el.tableauCols) {
    this.el.tableauCols.forEach((el, idx) => {
        el.innerHTML = '';
        const col = this.tableau[idx];

        // mark empty vs non-empty for styling
        if (col.length === 0) {
        el.classList.add('empty');
        } else {
        el.classList.remove('empty');
        }

        // if there is a selection and this column is a legal drop target, add drop-target class
        if (this.selected && this.canMoveStack(this.selected.fromCol, this.selected.index, idx)) {
        el.classList.add('drop-target');
        } else {
        el.classList.remove('drop-target');
        }

        if (col.length === 0) {
        // show a simple placeholder so user sees the target
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-placeholder';
        placeholder.innerHTML = '<span class="suit-hint">🞄</span><span>Drop here</span>';
        el.appendChild(placeholder);
        return;
        }

        // existing card rendering for non-empty columns
        col.forEach((card, i) => {
        const c = document.createElement('div');
        c.className = 'card' + (card.faceUp ? '' : ' back');
        c.dataset.index = String(i);
        c.dataset.col = String(idx);
        c.style.setProperty('--index', i);

        if (this.selected && this.selected.fromCol === idx && i >= this.selected.index) {
            c.classList.add('selected');
        }

        if (!card.faceUp) {
            c.textContent = '';
        } else {
            const rankMap = {1:'A',11:'J',12:'Q',13:'K'};
            const rank = rankMap[card.rank] || String(card.rank);
            const glyph = {'hearts':'♥','diamonds':'♦','clubs':'♣','spades':'♠'}[card.suit];
            c.classList.add(`suit-${card.suit}`);

            const top = document.createElement('div'); top.className='rank-top'; top.innerText = rank;
            const suitEl = document.createElement('div'); suitEl.className='suit-large'; suitEl.innerText = glyph;
            const bottom = document.createElement('div'); bottom.className='rank-bottom'; bottom.innerText = rank;
            c.appendChild(top); c.appendChild(suitEl); c.appendChild(bottom);

            c.addEventListener('click', (ev) => { ev.stopPropagation(); this.onCardSelected(idx, i); });
            c.addEventListener('dblclick', (ev) => { ev.stopPropagation(); if (this.canMoveToFoundationCard(card)) { this.selected = { fromCol: idx, index: i }; this.attemptMoveToFoundation(card.suit); } });
        }
        el.appendChild(c);
        });
    });
    }

  }
}

window.addEventListener('DOMContentLoaded', ()=> new Klondike());