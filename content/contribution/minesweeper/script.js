var width = 20;
var height = 20;
var maxMines = 50;
var map = [];
var gameStarted = 0;

var getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

var generateMines = (x, y) => {
	var mines = 0;
	var position;

	while (mines < maxMines) {
		position = [getRandomInt(0, height - 1), getRandomInt(0, width - 1)];
		if (position[0] !== y && position[1] !== x) {
			map[position[0]][position[1]][3] = 1;
			mines++;
		}
	}

	numberBlocks();
};

var loopThroughMap = (cb) => {
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			cb(x, y, map[y][x]);
		}
	}
};

var numberBlocks = () => {
	var number;
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			number = 0;

			if (!map[y][x][3]) {// if self is not mine
				for (var i = (y - 1); i <= (y + 1); i++) {
					for (var j = (x - 1); j <= (x + 1); j++) {
						if (inMap(j, i)) {
							if (!(i === y && j === x)) { // Not self
								if (map[i][j][3]) // Mine
									number++;
							}
						}	
					}
				}

				map[y][x][2] = number;
			}
		}
	}
};

var generateMap = () => {
	for (var i = 0; i < height; i++) {
		map[i] = [];
		for (var j = 0; j < width; j++) {
			map[i].push([0, 0, 0, 0]);
		}
	}
};

var inMap = (x, y) => {
	if (map[y] !== undefined && map[y][x] !== undefined)
		return 1;
	return 0;
}

var invisibleBlockCount = () => {
	var count = 0;

	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			if (!map[j][i][1])
				count++;
		}
	}

	return count;
};

var revealBlock = (x, y, numbered = 0) => {
	map[y][x][1] = 1;

	if (!numbered) { // invisible and not numbered
		for (var i = (y - 1); i <= (y + 1); i++) {
			for (var j = (x - 1); j <= (x + 1); j++) {
				if (inMap(j, i)) {
					if (!map[i][j][3] && !map[i][j][1]) { // not mine and not visible
						revealBlock(j, i, map[i][j][2]);
					}
				}	
			}
		}
	}
};

var makeMapVisible = () => {
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			map[j][i][1] = 1;
		}
	}
};

var blockClickListener = (e) => {
	x = parseInt(/[0-9]+/.exec(e.getAttribute('class'))[0]);
	y = parseInt(/[0-9]+/.exec(e.parentNode.getAttribute('class'))[0]);

	if (!gameStarted) {
		gameStarted++;
		generateMines(x, y);
	}

	if (map[y][x][0]) // Ignore if it's flagged
		return 0;

	if (map[y][x][3]) {
		makeMapVisible();
		renderBoard();
		alert("You lost!");
		resetEventListeners();
		return 0;
	}

	revealBlock(x, y, map[y][x][2]);

	if (invisibleBlockCount() === 0)
		alert('You won!');

	renderBoard();
};

var blockRightClickListener = (e) => {
	x = parseInt(/[0-9]+/.exec(e.getAttribute('class'))[0]);
	y = parseInt(/[0-9]+/.exec(e.parentNode.getAttribute('class'))[0]);

	if (!map[y][x][1]) {
		if (!map[y][x][0])
			map[y][x][0] = 1;
		else
			map[y][x][0] = 0;
	}
	renderBoard();
};

var renderBoard = () => {
	if (JSON.stringify(map) === '[]')
		generateMap();

	var tr;
	var td;
	var board = document.getElementById('board');
	board.innerHTML = '';

	for (var y = 0; y < height; y++) {
		tr = document.createElement('tr');
		tr.classList.add('y' + y);
		board.appendChild(tr);

		for (var x = 0; x < width; x++) {
			td = document.createElement('td');
			td.classList.add('x' + x);
			td.setAttribute('onclick', "blockClickListener(this)");
			td.setAttribute('oncontextmenu', "blockRightClickListener(this); return false;");
			tr.appendChild(td);

			// Check for flags
			if (map[y][x][0])
				td.classList.add('flagged');

			// Check for number if it's visible
			if (map[y][x][1]) {
				switch(map[y][x][2]) {
					case 0:
						td.classList.add('empty');
						break;
					case 1:
						td.classList.add('one');
						break;
					case 2:
						td.classList.add('two');
						break;
					case 3:
						td.classList.add('three');
						break;
					case 4:
						td.classList.add('four');
						break;
					case 5:
						td.classList.add('five');
						break;
					case 6:
						td.classList.add('six');
						break;
					case 7:
						td.classList.add('seven');
						break;
					case 8:
						td.classList.add('eight');
						break;
				}

				if (map[y][x][3]) {
					td.classList.add('mine');
				}
			}
		}
	}
};

(function() {
	renderBoard();
})();