class ShanghaiGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.numbers = [20, 19, 18, 17, 16, 15, 'BULL'];
        this.dartsThrown = 0;
        this.currentRoundScores = [];
        this.moveHistory = [];  // Add this to track moves
    }

    addPlayer(name, requiredPoints) {
        this.players.push({
            name,
            requiredPoints,
            scores: {},
            totalScore: 0,
            currentNumberIndex: 0  // Add this to track each player's current number
        });
        // Initialize scores for each number
        this.numbers.forEach(num => {
            this.players[this.players.length - 1].scores[num] = 0;
        });
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getCurrentNumber() {
        return this.numbers[this.getCurrentPlayer().currentNumberIndex];
    }

    recordScore(points) {
        // Save state before making any changes
        this.saveMove();  

        const currentPlayer = this.getCurrentPlayer();
        const currentNumber = this.getCurrentNumber();
        
        this.currentRoundScores.push(points);
        
        // Add points to player's score for current number
        currentPlayer.scores[currentNumber] += points;
        currentPlayer.totalScore += points * (currentNumber === 'BULL' ? 25 : currentNumber);

        this.dartsThrown++;

        // Check if player has achieved their required points
        if (currentPlayer.scores[currentNumber] >= currentPlayer.requiredPoints) {
            // Check for Shanghai before moving to next number
            if (this.dartsThrown === 3 && this.checkShanghai(this.currentRoundScores)) {
                return 'SHANGHAI';
            }
            
            currentPlayer.currentNumberIndex++; // Move to next number immediately
            this.currentRoundScores = [];      // Reset round scores for new number
        }
        
        // If all darts thrown, move to next player
        if (this.dartsThrown === 3) {
            this.nextTurn();
            return 'NEXT_TURN';
        }

        return 'CONTINUE';
    }

    checkShanghai(scores) {
        return scores.includes(1) && scores.includes(2) && scores.includes(3);
    }

    nextTurn() {
        this.dartsThrown = 0;
        this.currentRoundScores = [];
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    allPlayersCompleted() {
        // Game is over when any player completes all numbers
        return this.players.some(player => player.currentNumberIndex >= this.numbers.length);
    }

    isGameOver() {
        return this.allPlayersCompleted();
    }

    // Add this method to save the current state
    saveMove() {
        this.moveHistory.push({
            playerIndex: this.currentPlayerIndex,
            dartsThrown: this.dartsThrown,
            currentRoundScores: [...this.currentRoundScores],
            playerState: this.players.map(player => ({
                currentNumberIndex: player.currentNumberIndex,
                scores: {...player.scores},
                totalScore: player.totalScore
            }))
        });
    }

    // Add this method to undo the last move
    undoLastMove() {
        console.log('Attempting to undo. History length:', this.moveHistory.length);
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        console.log('Restoring move:', lastMove);
        
        this.currentPlayerIndex = lastMove.playerIndex;
        this.dartsThrown = lastMove.dartsThrown;
        this.currentRoundScores = [...lastMove.currentRoundScores];
        
        lastMove.playerState.forEach((state, index) => {
            this.players[index].currentNumberIndex = state.currentNumberIndex;
            this.players[index].scores = {...state.scores};
            this.players[index].totalScore = state.totalScore;
        });
        
        return true;
    }
}

// DOM manipulation and event handlers will go here
document.addEventListener('DOMContentLoaded', () => {
    const game = new ShanghaiGame();
    const playerSetup = document.getElementById('playerSetup');
    const gameBoard = document.getElementById('gameBoard');
    const addPlayerForm = document.getElementById('addPlayerForm');
    const startGameBtn = document.getElementById('startGame');
    const playersDiv = document.getElementById('players');
    const currentNumberSpan = document.getElementById('currentNumber');

    function updatePlayersDisplay() {
        // Clear existing table content
        const playerNamesRow = document.getElementById('playerNames');
        const playerPointsRow = document.getElementById('playerPoints');
        const tbody = document.querySelector('#scoreboard tbody');
        
        playerNamesRow.innerHTML = '<th rowspan="2">Target</th>';
        playerPointsRow.innerHTML = '';  // Back to empty cell
        tbody.innerHTML = '';

        // Add all player names and required points
        game.players.forEach((player, index) => {
            // Add player name
            const nameCell = document.createElement('th');
            nameCell.textContent = player.name;
            playerNamesRow.appendChild(nameCell);

            // Add required points row
            const pointsCell = document.createElement('td');
            pointsCell.textContent = `${player.requiredPoints}`;
            pointsCell.className = 'required-points';
            playerPointsRow.appendChild(pointsCell);
        });

        // Create rows for each number
        game.numbers.forEach(number => {
            const row = document.createElement('tr');
            row.id = `row-${number}`;
            
            const targetCell = document.createElement('td');
            targetCell.textContent = number;
            row.appendChild(targetCell);

            game.players.forEach(() => {
                const scoreCell = document.createElement('td');
                scoreCell.textContent = '';
                row.appendChild(scoreCell);
            });

            document.querySelector('#scoreboard tbody').appendChild(row);
        });

        // Update scores and highlighting
        game.numbers.forEach(number => {
            const row = document.getElementById(`row-${number}`);
            game.players.forEach((player, playerIndex) => {
                const cell = row.children[playerIndex + 1];
                const score = player.scores[number];
                
                // Add marks for each point scored
                cell.textContent = '|'.repeat(score);
                
                // Highlight completed numbers
                if (score >= player.requiredPoints) {
                    cell.classList.add('completed');
                } else {
                    cell.classList.remove('completed');
                }
                
                // Highlight current target
                if (playerIndex === game.currentPlayerIndex && 
                    number === game.getCurrentNumber()) {
                    cell.classList.add('current-target');
                } else {
                    cell.classList.remove('current-target');
                }
            });
        });

        // Update current player info
        const currentPlayer = game.getCurrentPlayer();
        document.getElementById('currentPlayerName').textContent = currentPlayer.name;
        document.getElementById('currentNumber').textContent = game.getCurrentNumber();
        document.getElementById('dartsRemaining').textContent = 3 - game.dartsThrown;
        document.getElementById('currentRequiredPoints').textContent = currentPlayer.requiredPoints;
    }

    function updateGameBoard() {
        const currentPlayer = game.getCurrentPlayer();
        console.log('Current player:', currentPlayer);
        console.log('Required points:', currentPlayer.requiredPoints);
        
        document.getElementById('currentPlayerName').textContent = currentPlayer.name;
        document.getElementById('currentNumber').textContent = game.getCurrentNumber();
        document.getElementById('currentRequiredPoints').textContent = currentPlayer.requiredPoints;
        document.getElementById('dartsRemaining').textContent = 3 - game.dartsThrown;
        updatePlayersDisplay();
    }

    function handleGameOver() {
        const winner = game.players.reduce((prev, current) => 
            (prev.totalScore > current.totalScore) ? prev : current
        );

        gameBoard.innerHTML = `
            <h2>Game Over!</h2>
            <h3>${winner.name} wins with ${winner.totalScore} points!</h3>
            <button onclick="location.reload()">New Game</button>
        `;
    }

    function handleShanghai(playerName) {
        gameBoard.innerHTML = `
            <h2>SHANGHAI!</h2>
            <h3>${playerName} wins with a Shanghai!</h3>
            <button onclick="location.reload()">New Game</button>
        `;
    }

    addPlayerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('playerName').value;
        const requiredPoints = parseInt(document.getElementById('requiredPoints').value);
        
        const playerIndex = game.players.length;  // Get index before adding player
        game.addPlayer(name, requiredPoints);
        document.getElementById('playerName').value = '';
        
        // Show start game button if we have at least one player
        startGameBtn.style.display = 'block';
        
        // Show current players list with delete button
        const playersList = document.createElement('div');
        playersList.className = 'added-player';
        playersList.innerHTML = `
            <p>Added player: ${name} (${requiredPoints} points required)</p>
            <button type="button" class="delete-player" data-index="${playerIndex}">Delete</button>
        `;
        playerSetup.appendChild(playersList);
    });

    // Add delete functionality
    playerSetup.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-player')) {
            const index = parseInt(e.target.dataset.index);
            game.players.splice(index, 1);
            e.target.closest('.added-player').remove();
            
            // Hide start button if no players left
            if (game.players.length === 0) {
                startGameBtn.style.display = 'none';
            }
            
            // Update remaining delete buttons' indices
            document.querySelectorAll('.delete-player').forEach((button, newIndex) => {
                button.dataset.index = newIndex;
            });
        }
    });

    startGameBtn.addEventListener('click', () => {
        if (game.players.length < 1) {
            alert('Please add at least one player to start the game');
            return;
        }
        playerSetup.style.display = 'none';
        gameBoard.style.display = 'block';
        updateGameBoard();
    });

    // Modify the scoring button event listeners
    document.querySelectorAll('.score-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'shanghaiOverride' || button.id === 'undoButton') return;
            
            const points = parseInt(button.dataset.value);
            const result = game.recordScore(points);

            switch(result) {
                case 'SHANGHAI':
                    handleShanghai(game.getCurrentPlayer().name);
                    break;
                case 'NEXT_TURN':
                    if (game.isGameOver()) {
                        handleGameOver();
                    } else {
                        updateGameBoard();
                    }
                    break;
                case 'CONTINUE':
                    updateGameBoard();
                    break;
            }
        });
    });

    document.getElementById('shanghaiOverride').addEventListener('click', () => {
        if (confirm('Are you sure you want to declare a Shanghai win?')) {
            handleShanghai(game.getCurrentPlayer().name);
        }
    });

    // Add the event listener for the undo button
    document.getElementById('undoButton').addEventListener('click', () => {
        console.log('Undo button clicked');
        if (game.undoLastMove()) {
            console.log('Undo successful, updating board');
            updateGameBoard();
        } else {
            console.log('Nothing to undo');
            alert('No moves to undo!');
        }
    });
}); 