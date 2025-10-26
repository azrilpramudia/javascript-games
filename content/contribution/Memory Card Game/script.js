const emojis = ['🎮', '🎨', '🎭', '🎪', '🎸', '🎯', '🎲', '🎳'];
        let cards = [...emojis, ...emojis];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let timer = 0;
        let timerInterval = null;
        let canFlip = true;

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function createBoard() {
            const gameBoard = document.getElementById('gameBoard');
            gameBoard.innerHTML = '';
            cards = shuffle([...emojis, ...emojis]);
            
            cards.forEach((emoji, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.emoji = emoji;
                card.dataset.index = index;
                
                card.innerHTML = `
                    <div class="card-face card-front">${emoji}</div>
                    <div class="card-face card-back"></div>
                `;
                
                card.addEventListener('click', flipCard);
                gameBoard.appendChild(card);
            });
        }

        function flipCard() {
            if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) {
                return;
            }

            if (moves === 0) {
                startTimer();
            }

            this.classList.add('flipped');
            flippedCards.push(this);

            if (flippedCards.length === 2) {
                canFlip = false;
                moves++;
                document.getElementById('moves').textContent = moves;
                checkMatch();
            }
        }

        function checkMatch() {
            const [card1, card2] = flippedCards;
            const emoji1 = card1.dataset.emoji;
            const emoji2 = card2.dataset.emoji;

            if (emoji1 === emoji2) {
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    matchedPairs++;
                    document.getElementById('matches').textContent = `${matchedPairs}/8`;
                    flippedCards = [];
                    canFlip = true;

                    if (matchedPairs === 8) {
                        endGame();
                    }
                }, 600);
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timer++;
                const minutes = Math.floor(timer / 60);
                const seconds = timer % 60;
                document.getElementById('timer').textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
        }

        function endGame() {
            stopTimer();
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            
            document.getElementById('victoryText').textContent = 
                `You won in ${moves} moves and ${timeStr}!`;
            document.getElementById('victoryMessage').style.display = 'flex';
        }

        function resetGame() {
            stopTimer();
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            timer = 0;
            canFlip = true;
            
            document.getElementById('moves').textContent = '0';
            document.getElementById('timer').textContent = '0:00';
            document.getElementById('matches').textContent = '0/8';
            document.getElementById('victoryMessage').style.display = 'none';
            
            createBoard();
        }

        // Initialize game
        createBoard();