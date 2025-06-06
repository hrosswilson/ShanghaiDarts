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

            // Check if player just completed BULL
            if (currentNumber === 'BULL') {
                return 'GAME_OVER';
            }
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
    // Check if we should be in fullscreen
    if (localStorage.getItem('wantFullscreen') === 'true') {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            localStorage.setItem('wantFullscreen', 'true');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            localStorage.setItem('wantFullscreen', 'false');
        }
    }

    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullScreen);
    }

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

    function showPlayerOrderScreen() {
        playerSetup.style.display = 'none';
        document.getElementById('playerOrder').style.display = 'block';
        
        const unorderedPlayersDiv = document.getElementById('unorderedPlayers');
        const orderedPlayersDiv = document.getElementById('orderedPlayers');
        
        // Clear previous content
        unorderedPlayersDiv.innerHTML = '';
        orderedPlayersDiv.innerHTML = '<h3>Throwing Order:</h3>';
        
        // Create player items
        game.players.forEach((player, index) => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.textContent = player.name;
            playerItem.dataset.playerIndex = index;
            unorderedPlayersDiv.appendChild(playerItem);
        });

        // Add click handlers
        unorderedPlayersDiv.addEventListener('click', handlePlayerOrder);
    }

    function handlePlayerOrder(e) {
        if (!e.target.classList.contains('player-item')) return;
        
        const orderedPlayersDiv = document.getElementById('orderedPlayers');
        e.target.classList.add('ordered-player');
        orderedPlayersDiv.appendChild(e.target);
        
        // Show start button when all players are ordered
        const unorderedPlayers = document.getElementById('unorderedPlayers').children.length;
        if (unorderedPlayers === 0) {
            document.getElementById('confirmOrder').style.display = 'block';
        }
    }

    function startGameWithOrder() {
        const orderedPlayers = Array.from(document.getElementById('orderedPlayers').children)
            .filter(el => el.classList.contains('player-item'))
            .map(el => parseInt(el.dataset.playerIndex));
        
        // Reorder players array
        game.players = orderedPlayers.map(index => game.players[index]);
        
        // Start the game
        document.getElementById('playerOrder').style.display = 'none';
        gameBoard.style.display = 'block';
        updateGameBoard();
    }

    // Modify the start game button click handler
    startGameBtn.addEventListener('click', () => {
        if (game.players.length < 1) {
            alert('Please add at least one player to start the game');
            return;
        }
        showPlayerOrderScreen();
    });

    // Add confirm order button handler
    document.getElementById('confirmOrder').addEventListener('click', startGameWithOrder);

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
                case 'GAME_OVER':
                    handleGameOver();
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
        const confirmed = confirm(`Are you sure ${game.getCurrentPlayer().name} hit a Shanghai?`);
        if (confirmed) {
            // Save the state before applying Shanghai
            game.saveMove();
            
            const currentPlayer = game.getCurrentPlayer();
            const currentNumber = game.getCurrentNumber();
            
            // Record the Shanghai scores
            currentPlayer.scores[currentNumber] = currentPlayer.requiredPoints;
            currentPlayer.currentNumberIndex++;
            game.dartsThrown = 3;
            game.currentRoundScores = [1, 2, 3];  // Represent Single, Double, Triple
            
            // Move to next player
            game.nextTurn();
            
            if (game.isGameOver()) {
                handleGameOver();
            } else {
                updateGameBoard();
            }
        }
        // If not confirmed, do nothing but ensure the game state remains valid
        updateGameBoard();  // Refresh the display
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

    // Add this function after showPlayerOrderScreen
    function resetPlayerOrder() {
        const unorderedPlayersDiv = document.getElementById('unorderedPlayers');
        const orderedPlayersDiv = document.getElementById('orderedPlayers');
        
        // Move all players back to unordered list
        const orderedPlayers = Array.from(orderedPlayersDiv.getElementsByClassName('player-item'));
        orderedPlayers.forEach(player => {
            player.classList.remove('ordered-player');
            unorderedPlayersDiv.appendChild(player);
        });
        
        // Hide the confirm button
        document.getElementById('confirmOrder').style.display = 'none';
        
        // Reset the orderedPlayers div to just the heading
        orderedPlayersDiv.innerHTML = '<h3>Throwing Order:</h3>';
    }

    // Add the event listener for the reset button
    document.getElementById('resetOrder').addEventListener('click', resetPlayerOrder);
}); 