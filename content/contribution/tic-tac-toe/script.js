const score = {
            wins: 0,
            losses: 0,
            ties: 0
        };

       // call function
       updateScoreElement();

        function playGame(playerMove){

            const computerMove = PickComputerMove();
            let result = '';

            if(playerMove === 'Rock'){
                if (computerMove === 'Rock') {
                    result = 'Tie.';
                } else if (computerMove === 'Paper') {
                    result = 'You lose.';
                } else if (computerMove === 'Scissors') {
                    result = 'You win.';
                }
            }

            else if(playerMove === 'Scissors'){
                if (computerMove === 'Rock') {
                    result = 'You lose.';
                } else if (computerMove === 'Paper') {
                    result = 'You win.';
                } else if (computerMove === 'Scissors') {
                    result = 'Tie.';
                }
            }

            else if(playerMove === 'Paper'){
                if (computerMove === 'Rock') {
                    result = 'You win.';
                } else if (computerMove === 'Paper') {
                    result = 'Tie.';
                } else if (computerMove === 'Scissors') {
                    result = 'You lose.';
                }
            }
             
            if(result === 'You win.'){
                score.wins +=1;
            }

            else if(result === 'You lose.'){
                score.losses +=1;

            }

            else if(result === 'Tie.'){
                score.ties +=1;
            }
            
            localStorage.setItem('score' , JSON.stringify(score));

            updateScoreElement();

            document.querySelector('.js-result').
                innerHTML = result;

            document.querySelector('.js-moves').
                innerHTML = `You
                    <img src="${playerMove}-emoji-removebg-preview.png" class="move-icon">
                    Computer
                    <img src="${computerMove}-emoji-removebg-preview.png" class="move-icon">`;

//             alert(`You picked ${playerMove}. Computer picked ${computerMove}. ${result}
// Wins: ${score.wins} , Losses: ${score.losses} , Ties: ${score.ties}`);
        }

        function updateScoreElement(){
            document.querySelector('.js-score')
               .innerHTML = `Wins: ${score.wins} , Losses: ${score.losses} , Ties: ${score.ties}`
        }

        function PickComputerMove(){

            const randomNumber = Math.random();
            let ComputerMove ='';

            if(randomNumber >= 0 && randomNumber < 1/3){
                ComputerMove = 'Rock';
            }

            else if(randomNumber >= 1/3 && randomNumber < 2/3){
                ComputerMove = 'Paper';
                }

            else if(randomNumber >= 2/3 && randomNumber <=1){
                ComputerMove = 'Scissors';
            }

            return ComputerMove;
        
        }
