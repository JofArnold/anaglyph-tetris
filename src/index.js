const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
import "./styles.css";

let on = true;

context.scale(20, 20);

const WIDTH = 12;
const HEIGHT = 20;

const FALLING = "FALLING";
const FIXED = "FIXED";
const BACKGROUND = "BACKGROUND";

// Defaults to "Display P3"
const COLORS = {
  [FALLING]: "#FF00FF",
  [FIXED]: "#00FFFF",
  [BACKGROUND]: "#FFFFFF"
};

const hue1 = document.getElementById("hue1");
const sat1 = document.getElementById("sat1");
const lum1 = document.getElementById("lum1");
const fallingColor = document.getElementById("fallingColor");
const hue2 = document.getElementById("hue2");
const sat2 = document.getElementById("sat2");
const lum2 = document.getElementById("lum2");
const fixedColor = document.getElementById("fixedColor");

const updateColor = (hueSlider, satSlider, lumSlider, box, key) => () => {
  let hsl = `hsl(${hueSlider.value || 0}, ${satSlider.value || 0}%,${
    lumSlider.value || 0
  }%)`;
  box.style.backgroundColor = hsl;
  COLORS[key] = hsl;
};

hue1.addEventListener(
  "input",
  updateColor(hue1, sat1, lum1, fallingColor, FALLING)
);
sat1.addEventListener(
  "input",
  updateColor(hue1, sat1, lum1, fallingColor, FALLING)
);
lum1.addEventListener(
  "input",
  updateColor(hue1, sat1, lum1, fallingColor, FALLING)
);
hue2.addEventListener(
  "input",
  updateColor(hue2, sat2, lum2, fixedColor, FIXED)
);
sat2.addEventListener(
  "input",
  updateColor(hue2, sat2, lum2, fixedColor, FIXED)
);
lum2.addEventListener(
  "input",
  updateColor(hue2, sat2, lum2, fixedColor, FIXED)
);

updateColor();

function arenaSweep() {
  let rowCount = 1;

  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] == 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === "I") {
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ];
  } else if (type === "L") {
    return [
      [0, 2, 0],
      [0, 2, 0],
      [0, 2, 2]
    ];
  } else if (type === "J") {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [3, 3, 0]
    ];
  } else if (type === "O") {
    return [
      [4, 4],
      [4, 4]
    ];
  } else if (type === "Z") {
    return [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0]
    ];
  } else if (type === "S") {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0]
    ];
  } else if (type === "T") {
    return [
      [0, 7, 0],
      [7, 7, 7],
      [0, 0, 0]
    ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        if (value.done) {
          if (on) {
            context.fillStyle = COLORS.FALLING;
          } else {
            context.fillStyle = "black";
          }
        } else {
          context.fillStyle = COLORS.FIXED;
        }
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function drawGrid() {
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      context.strokeStyle = "black";
      context.lineWidth = 0.001;
      context.strokeRect(x, y, 1, 1);
    }
  }
}

function draw() {
  context.fillStyle = COLORS.BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);
  //drawGrid();
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

class EnhancedNumber extends Number {
  constructor(value) {
    super(value);
    this.done = true;
    this.value = value;
  }
  valueOf() {
    return this.value;
  }
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = new EnhancedNumber(value);
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    draw();
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerReset() {
  const pieces = "TJLOSZI";

  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    // Player fucked up
    arena.forEach((row) => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  lastTime = time;

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById("score").innerText = player.score;
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(1);
  }
});

const arena = createMatrix(WIDTH, HEIGHT);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0
};

playerReset();
updateScore();
update();
