const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';

class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Apple extends Cell {
	constructor(x, y) {
		super(x, y);
		// this.color = 'red';
	}
}

class Section extends Cell {
	constructor(x, y) {
		super(x, y);
		// this.color = 'blue';
	}
}

class Head extends Section {
	constructor(x, y) {
		super(x, y);
		// this.color = 'black';
	}

	changeColor() {
		// this.color = 'red';
	}
}

class Snake {
	#direction;
	#body;
	#chDir;

	constructor() {
		this.#direction = DIRECTION_RIGHT;
		this.#body = [new Head(6, 6), new Section(5, 6)];
		this.#chDir = true;
	}

	getBody() {
		const body = [];
		this.#body.forEach(function (section) {
			body.push({ x: section.x, y: section.y });
		});
		return body;
	}

	move() {
		// Сдвигаем все клетки на место предыдущей, кроме головы
		for (let i = this.#body.length - 1; i > 0; i--) {
			this.#body[i].x = this.#body[i - 1].x;
			this.#body[i].y = this.#body[i - 1].y;
		}

		// Сдвигаем голову в направлении #direction
		if (this.#direction === DIRECTION_RIGHT) this.#body[0].x += 1;
		if (this.#direction === DIRECTION_LEFT) this.#body[0].x -= 1;
		if (this.#direction === DIRECTION_UP) this.#body[0].y += 1;
		if (this.#direction === DIRECTION_DOWN) this.#body[0].y -= 1;

		// Телепортируем через стену если требуется
		if (this.#body[0].x < 1) this.#body[0].x = 10;
		if (this.#body[0].x > 10) this.#body[0].x = 1;
		if (this.#body[0].y < 1) this.#body[0].y = 10;
		if (this.#body[0].y > 10) this.#body[0].y = 1;

		this.#chDir = true;
	}

	eat() {
		const last = this.#body[this.#body.length - 1];
		this.#body.push(new Section(last.x, last.y));
	}

	changeDirection(direction) {
		if (!this.#chDir) return;

		const d = this.#direction;

		if (d === DIRECTION_UP && direction === DIRECTION_DOWN) return;
		if (d === DIRECTION_DOWN && direction === DIRECTION_UP) return;
		if (d === DIRECTION_RIGHT && direction === DIRECTION_LEFT) return;
		if (d === DIRECTION_LEFT && direction === DIRECTION_RIGHT) return;

		this.#chDir = false;

		this.#direction = direction;
	}
}

function createField() {
	let field = document.createElement("div");
	document.body.appendChild(field);
	field.classList.add("field");

	for (let i = 1; i <= 100; i++) {
		let cell = document.createElement("div");
		field.appendChild(cell);
		cell.classList.add("cell");
	}

	let cells = document.getElementsByClassName("cell");
	let x = 1;
	let y = 10;

	for (let i = 0; i < cells.length; i++) {
		if (x > 10) {
			x = 1;
			y--;
		}
		cells[i].setAttribute("posX", x);
		cells[i].setAttribute("posY", y);
		x++;
	}
}

createField();

function getCell(x, y) {
	return document.querySelector(`[posX = "${x}"][posY = "${y}"]`)
}

const snake = new Snake();

function createSnake() {
	const startBody = snake.getBody();

	const snakeBody = [getCell(startBody[0].x, startBody[0].y), getCell(startBody[1].x, startBody[1].y)];

	for (let i = 0; i < snakeBody.length; i++) {
		snakeBody[i].classList.add('snakeBody');
	}

	snakeBody[0].classList.add('snakeHead');
}

createSnake();

function eraseSnake() {
	const sections = document.querySelectorAll('.snakeBody');
	sections.forEach(section => {
		section.classList.remove('snakeBody');
	});

	const heads = document.querySelectorAll('.snakeHead');
	heads.forEach(section => {
		section.classList.remove('snakeHead');
	});
}

function drawSnake() {
	eraseSnake();

	const snakeClassBody = snake.getBody();
	const snakeBody = [];

	snakeClassBody.forEach(section => {
		snakeBody.push(getCell(section.x, section.y));
	});

	snakeBody[0].classList.add('snakeHead');

	snakeBody.forEach(section => {
		section.classList.add('snakeBody');
	})
}

function generateApple() {

	const apples = document.querySelectorAll('.apple');
	apples.forEach(apple => {
		apple.classList.remove('apple');
	});

	let x;
	let y;

	do {
		x = Math.round(Math.random() * (10 - 1) + 1);
		y = Math.round(Math.random() * (10 - 1) + 1);
	} while (getCell(x, y).classList.contains('snakeBody'));

	getCell(x, y).classList.add('apple');

	return new Apple(x, y);
}

let apple = generateApple();


let input = document.createElement('input');
document.body.appendChild(input);
input.classList.add('inputScore');

let input2 = document.createElement('input');
document.body.appendChild(input2);
input2.classList.add('inputTopScore');

let score = 0;
input.value = `Your score: ${score}`;

let topScore = 0;

if (localStorage.getItem('topScore') !== null) topScore = localStorage.getItem('topScore');

input2.value = `Your top score: ${topScore}`;

function move2() {
	snake.move();

	const snakeBody = snake.getBody();

	if (snakeBody[0].x === apple.x && snakeBody[0].y === apple.y) {
		apple = generateApple();
		snake.eat();
		score++;
		input.value = `Your score: ${score}`;
	}

	// проверяем голову на столкновение с телом
	for (let i = snakeBody.length - 1; i > 0; i--) {
		if (snakeBody[0].x === snakeBody[i].x && snakeBody[0].y === snakeBody[i].y) {
			setTimeout(() => {
				const isRestart = confirm(`Game over! Your score: ${score}.\nRestart game?`);
				if (isRestart) location.reload();
			}, 200);

			clearInterval(interval);
			getCell(snakeBody[0].x, snakeBody[0].y).style.background = "red";

			if (score > topScore) {
				topScore = score;
				localStorage.setItem('topScore', topScore.toString());
				input2.value = `Your top score: ${topScore}`;
			}
		}
	}

	drawSnake();
}

let interval = undefined;

window.addEventListener('mouseup', function () {
	if (interval === undefined) interval = setInterval(move2, 500);
});

window.addEventListener('keydown', function (e) {
	if (e.key == 'ArrowLeft') {
		snake.changeDirection(DIRECTION_LEFT);
	} else if (e.key == 'ArrowUp') {
		snake.changeDirection(DIRECTION_UP);
	} else if (e.key == 'ArrowRight') {
		snake.changeDirection(DIRECTION_RIGHT);
	} else if (e.key == 'ArrowDown') {
		snake.changeDirection(DIRECTION_DOWN);
	}
});

