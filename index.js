const boardSize = 4; // board size => the 2048 game we are creating is 4 x 4, usually called classic.
let board; // the 4 x 4 board.
let score = 0; // current score
let highScore = 0; // high score
let previousState = []; // previousState for undo purpose.
let gameOver = false; // boolean to check game over
let undoScore; // previous score is kept in order to go back if undo is clicked.



/*
    * initialize the board when the game start => exprected to run only once when the game start.
    * initial state when game is opened.
*/
function initializeBoard() {
    board = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // creating the 4 x 4 board.

    // since we need two tile to be created while the game start, we need to call generateRandomTile twice
    generateRandomTile();
    generateRandomTile();

    updateBoard(); // update the board after generating the start tiles position and value.
}



/*
    * put on random place 2 or 4 => 2 has 90% probability and 4 has 10% probability.
*/
function generateRandomTile() {
    let emptyTiles = []; // hold, all the empty tiles position(x and y index) => empty tile = tile with no number.
    // the following loop search for empty tile and if there is empty tile it's position is stored in emptyTiles array.
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) { // if 0 then it's empty tile
                emptyTiles.push({ x: i, y: j }); // add an object with x and y postion to the emptyTiles array.
            }
        }
    }
    if (emptyTiles.length > 0) { // emptyTiles.length > 0 then there is empty tiles.
        let pos = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]; // finding random place but the random place is empty tile.
        board[pos.x][pos.y] = Math.random() < 0.1 ? 4 : 2; // putting 2 or 4 on the empty tile => 2 has 90% probability and 4 has 10% probability
    }
}



/*
    * update the board(UI) according to the 2D array `board`
    * `board` is the backEnd array.
*/
function updateBoard() {
    const boardElement = document.getElementById('board'); // the 4 x 4 board.
    boardElement.innerHTML = ''; // reset the board.
    for(let i = 0; i < boardSize; i++) { // for each row in the board
        for(let j = 0; j < board[i].length; j++) { // for each tile in the row.
            const tileElement = document.createElement('div');
            tileElement.className = "tile"; //  style class for the all common tile and for empty tile
            if (board[i][j] !== 0) { // we don't add it's own style class for an empty tile => no need.
                tileElement.textContent = board[i][j]; // add the number to the tile.
                tileElement.className += (` tile-${board[i][j]}`); // adding the style class depending on the number inside the tile.
            }
            boardElement.appendChild(tileElement); // adding the tile into the board.

            // animate the Tiles
            animateTile(tileElement, boardElement);
        }
    }
    document.getElementById('score').textContent = `Score: ${score}`; // update score
    document.getElementById('high-score').textContent = `High Score: ${highScore}`; // update high score => to be modified when we learn php

    // play sound effect when the tile moves:
    let audioElement = document.getElementById('myAudio');
    audioElement.playbackRate = 2;
    audioElement.play();
}



/* Animate Tile */
function animateTile(tileElement) {
    // Tile Element animation
    tileElement.animate({
            boxShadow: '4px 4px 4px 4px #8f8c8c'
        }, 500, "linear");
    
    tileElement.animate({
            boxShadow: '0px 0px 0px 0px #8f8c8c'
        }, 500, "linear");
}



/* 
    * logic for moving the tile in proper place.
*/
function moveTiles(direction) {
    undoScore = 0;
    previousState = board.map(row => [...row]); // Store the previous state for undo functionality
    moved = false; // check if the board is updated by the user action(user try to move the tile)
    
    // updating board[i][j]...
    for (let i = 0; i < boardSize; i++) {
        let rowOrColNo0 = []; // hold non-zero column or row
        let rowOrColAdjAdded = [0, 0, 0, 0]; // hold the addition of adjacent tile
        let rowOrColAdjAddedCounter = 0; // conunter variable for `rowOrColAdjAdded`
    
        if (direction == "right") { // start adding from right to left or from high index to low index
            rowOrColNo0 = board[i].filter(num => num != 0); // filtering out 0
            rowOrColAdjAddedCounter = board[i].length - 1; // the counter
    
            // add adjacent tile if they are the same and put it in `rowOrAdjAdded` array.
            for (let j = rowOrColNo0.length - 1; j >= 0; j--) {
                // we need to process j = 0, b/c j = 0 may not be added and should be stored.
                if (j > 0 && rowOrColNo0[j] === rowOrColNo0[j - 1]) {
                    score += rowOrColNo0[j] + rowOrColNo0[j - 1];
                    undoScore += rowOrColNo0[j] + rowOrColNo0[j - 1];
                    rowOrColAdjAdded[rowOrColAdjAddedCounter--] = rowOrColNo0[j] + rowOrColNo0[j - 1]; // adjacent added
                    j--; // skiping the next element since j - 1 is added with j.
                } 
                else {
                    rowOrColAdjAdded[rowOrColAdjAddedCounter--] = rowOrColNo0[j]; // adjacent not added
                }
            }
    
            // updating board[i][j] according to `rowOrColAdjAdded`
            for (let j = 0; j < board[i].length; j++) {
                if(board[i][j] != rowOrColAdjAdded[j]) { // check if the board is updated by the movement.
                    moved = true; // movement made!
                }
                board[i][j] = rowOrColAdjAdded[j]; // updating the board
            }
        } 
        else if (direction == "left") { // start adding from left to right or from low index to high index
            rowOrColNo0 = board[i].filter(num => num != 0);
            rowOrColAdjAddedCounter = 0;
    
            for (let j = 0; j < rowOrColNo0.length; j++) {
                if (j < rowOrColNo0.length - 1 && rowOrColNo0[j] === rowOrColNo0[j + 1]) {
                    score += rowOrColNo0[j] + rowOrColNo0[j + 1];
                    undoScore += rowOrColNo0[j] + rowOrColNo0[j + 1]; 
                    rowOrColAdjAdded[rowOrColAdjAddedCounter++] = rowOrColNo0[j] + rowOrColNo0[j + 1];
                    j++;
                } 
                else {
                    rowOrColAdjAdded[rowOrColAdjAddedCounter++] = rowOrColNo0[j];
                }
            }
    
            for (let j = 0; j < board[i].length; j++) {
                if(board[i][j] != rowOrColAdjAdded[j]) {
                    moved = true;
                }
                board[i][j] = rowOrColAdjAdded[j];
            }
        } 
        else if (direction == "up") { // start adding from top to down or from low index to high index
            // Extract the column values into rowOrColNo0 array ==> b/c we can't use filter(array method)
            for (let j = 0; j < boardSize; j++) {
                if (board[j][i] !== 0) {
                    rowOrColNo0.push(board[j][i]);
                }
            }
            rowOrColAdjAddedCounter = 0;
    
            for (let j = 0; j < rowOrColNo0.length; j++) {
                if (j < rowOrColNo0.length - 1 && rowOrColNo0[j] === rowOrColNo0[j + 1]) {
                    score += rowOrColNo0[j] + rowOrColNo0[j + 1];
                    undoScore += rowOrColNo0[j] + rowOrColNo0[j + 1];
                    rowOrColAdjAdded[rowOrColAdjAddedCounter++] = rowOrColNo0[j] + rowOrColNo0[j + 1];
                    j++;
                } 
                else {
                    rowOrColAdjAdded[rowOrColAdjAddedCounter++] = rowOrColNo0[j];
                }
            }
    
            for (let j = 0; j < boardSize; j++) {
                if(board[j][i] != rowOrColAdjAdded[j]) {
                    moved = true;
                }
                board[j][i] = rowOrColAdjAdded[j];
            }
        } 
        else if (direction == "down") { // start adding from down to top or from high index to low index
            for (let j = 0; j < boardSize; j++) {
                if (board[j][i] !== 0) {
                    rowOrColNo0.push(board[j][i]);
                }
            }
            rowOrColAdjAddedCounter = boardSize - 1;
    
            for (let j = rowOrColNo0.length - 1; j >= 0; j--) {
                if (j > 0 && rowOrColNo0[j] === rowOrColNo0[j - 1]) {
                    score += rowOrColNo0[j] + rowOrColNo0[j - 1];
                    undoScore +=  rowOrColNo0[j] + rowOrColNo0[j - 1];
                    rowOrColAdjAdded[rowOrColAdjAddedCounter--] = rowOrColNo0[j] + rowOrColNo0[j - 1];
                    j--;
                } 
                else {
                    rowOrColAdjAdded[rowOrColAdjAddedCounter--] = rowOrColNo0[j];
                }
            }
    
            for (let j = 0; j < boardSize; j++) {
                if(board[j][i] != rowOrColAdjAdded[j]) { 
                    moved = true;
                }
                board[j][i] = rowOrColAdjAdded[j];
            }
        }
    }

    if(moved) {
        generateRandomTile(); // Continue the game by generating a random num(2 or 4) in a random board position.
        updateBoard(); // update the UI => HTML.
    }

    checkGameOver(); // Check game over condition

    if (score > highScore) { // this line will be done correctly, when we finish Server side scripting in php.
        highScore = score;
    }
}



/*
    * checking game over condition, if though, quit the game.
*/
function checkGameOver() {
    gameOver = true;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) { // check if there is empty tile
                gameOver = false;
                return;
            }
            if (j < boardSize - 1 && board[i][j] === board[i][j + 1]) { // check if there is a tile added horizontally
                gameOver = false;
                return;
            }
            if (i < boardSize - 1 && board[i][j] === board[i + 1][j]) { // check if there is a tile added vertically
                gameOver = false;
                return;
            }
        }
    }
    if (gameOver) {
        alert('Game Over!');
    }
}



/*
    * undo:- by updating board by it's previous state.
*/
function undo() {
    if (previousState.length) {
        board = previousState.map(row => [...row]);
        previousState.length = 0; // reset the previousState array.
        score -= undoScore;
        undoScore = 0;
        updateBoard(); // update board to refelect the undo effect.
    }
}



/*
    * Game Started
*/
function newGame() {
    score = 0; // scrore must be 0.
    initializeBoard(); // initialize the board with two random tile in two random position to start the game.
}



/*
    * adding event listener to play the game.
*/
document.addEventListener('keydown', (event) => {
    if(gameOver) {
        return;
    }

    switch (event.key) {
        case 'ArrowLeft': case 'A': case 'a':
            moveTiles('left');
            break;
        case 'ArrowRight': case 'D': case 'd':
            moveTiles('right');
            break;
        case 'ArrowUp': case 'W': case 'w':
            moveTiles('up');
            break;
        case 'ArrowDown': case 'D': case 'd':
            moveTiles('down');
            break;
    }
});



newGame(); // consist code to start the new Game. Consider it as method inside a main function



// Event connection PC
let undoElement = document.getElementById("btnUndo");
undoElement.addEventListener('click', undo);
let newGameElement = document.getElementById('btnNewGame');
newGameElement.addEventListener('click', newGame);



// Touch event listeners for Mobile Device
let startX;
let startY;
let endX;
let endY;
document.addEventListener('touchstart', (event) => {
    if(event.target.tagName === 'button') {
        return;
    }
    
    if (gameOver) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
});

document.addEventListener('touchmove', (event) => {
    if(event.target.tagName === 'button') {
        return;
    }

    event.preventDefault(); // Prevent scrolling
});

document.addEventListener('touchend', (event) => {
    if(event.target.tagName === 'button') {
        return;
    }

    if (gameOver) return;
    const touch = event.changedTouches[0];
    endX = touch.clientX;
    endY = touch.clientY;
    handleSwipe();
});

function handleSwipe() {
    const averX = endX - startX;
    const averY = endY - startY;
    if (Math.abs(averX) > Math.abs(averY)) {
        if (averX > 0) {
            moveTiles('right');
        } else {
            moveTiles('left');
        }
    } else {
        if (averY > 0) {
            moveTiles('down');
        } else {
            moveTiles('up');
        }
    }
}
