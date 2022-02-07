var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.png" />'

var gBoard;
var gGamerPos;
var gIntervalIdBall = null;
var ballCount = 0;
var ballSound = new Audio('music/perc.wav')
var gLastGamerPos = {};
var gIntervalIdGlue = null;
var isGlued = false;

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	var elBtn = document.querySelector('.restart');
	elBtn.style.display = 'none';
	var emptyCells = getAllEmptyCells(gBoard);
	var elH2 = document.querySelector('h2');
	elH2.innerText = `Collected : ${ballCount}`;
	gIntervalIdBall = setInterval(getBall, 3000, emptyCells);
	var emptyCells = getAllEmptyCells(gBoard);
	gIntervalIdGlue = setInterval(getGlue, 5000, emptyCells);

}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;

			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	board[0][6].type = FLOOR;
	board[5][0].type = FLOOR;
	board[5][11].type = FLOOR;
	board[9][6].type = FLOOR;

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}


// Move the player to a specific location
function moveTo(i, j) {
	if (isGlued) return;
	if (gLastGamerPos.i === 0 && gLastGamerPos.j === 6 && i === -1) {
		i = 9;
		j = 6;
	} else if (gLastGamerPos.i === 5 && gLastGamerPos.j === 0 && j === -1) {
		i = 5;
		j = 11;
	} else if (gLastGamerPos.i === 5 && gLastGamerPos.j === 11 && j === 12) {
		i = 5;
		j = 0;
	} else if (gLastGamerPos.i === 9 && gLastGamerPos.j === 6 && i === 10) {
		i = 0;
		j = 6;
	}
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;


	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) ||
		i === 9 && j === 6 || i === 0 && j === 6 || i === 5 && j === 11 || i === 5 && j === 0) {
		if (targetCell.gameElement === BALL) {
			ballCount++;
			ballSound.play();
			var elH2 = document.querySelector('h2');
			elH2.innerText = `Collected : ${ballCount}`;
		}
		if (targetCell.gameElement === GLUE) {
			isGlued = true;
			setTimeout(notGlued, 3000)
		}
		gLastGamerPos = gGamerPos;
		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	}


	if (isGameOver(gBoard)) {
		elH2.innerText = `Victory! you've collected ${ballCount} balls!`;
		var elBtn = document.querySelector('.restart');
		elBtn.style.display = 'block';
		ballCount = 0;
		clearInterval(gIntervalIdBall);
		clearInterval(gIntervalIdGlue);
	}

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function isGameOver(board) {
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			if (currCell.type === FLOOR) {
				if (currCell.gameElement === BALL) return false;

			}
		}
	}
	return true;
}


function getAllEmptyCells(board) {
	var res = [];
	console.log('board', board);
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			if (currCell.type === FLOOR) {
				if (isEmptyCell(i, j)) {
					currCell.i = i;
					currCell.j = j;
					res.push(currCell);
				}
			}
		}
	}
	var shuffled = shuffle(res);
	return shuffled;
}

function getBall(items) {
	var ballPos = items.pop();
	var obj = {
		i: ballPos.i,
		j: ballPos.j
	}
	gBoard[obj.i][obj.j].gameElement = BALL;
	renderCell(obj, BALL_IMG);
}

function getGlue(items) {
	var gluePos = items.pop();
	var obj = {
		i: gluePos.i,
		j: gluePos.j
	}
	gBoard[obj.i][obj.j].gameElement = GLUE;
	renderCell(obj, GLUE_IMG);
	setTimeout(clearGlue, 3000, obj);
}

function clearGlue(obj) {
	gBoard[obj.i][obj.j].gameElement = '';
	renderCell(obj, '');
}

function notGlued() {
	isGlued = false;
}

function isEmptyCell(i, j) {
	return gBoard[i][j].gameElement === null;
}
