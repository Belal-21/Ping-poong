const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const settingsMenu = document.getElementById('settingsMenu');
const gameOverScreen = document.getElementById('gameOverScreen');
const startGameButton = document.getElementById('startGame');
const settingsButton = document.getElementById('settings');
const backToMenuButton = document.getElementById('backToMenu');
const restartGameButton = document.getElementById('restartGame');
const enablePowerUpsCheckbox = document.getElementById('enablePowerUps');
const winnerText = document.getElementById('winnerText');

let enablePowerUps = false;
let isGameOver = false;
let powerUp = {
    x: 0,
    y: 0,
    radius: 15,
    active: false,
    effect: null,
    timeout: null
};

startGameButton.addEventListener('click', () => {
    menu.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameLoop();
});

settingsButton.addEventListener('click', () => {
    menu.style.display = 'none';
    settingsMenu.style.display = 'block';
});

backToMenuButton.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    menu.style.display = 'block';
});

restartGameButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameLoop();
});

enablePowerUpsCheckbox.addEventListener('change', (e) => {
    enablePowerUps = e.target.checked;
});

canvas.width = 800;
canvas.height = 400;

// Ball properties
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 2,
    dy: 2,
    speed: 2,
    color: 'white'
};

// Set a constant speed for the ball
ball.speed = 2;
ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);

// Player properties
let player1 = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    color: 'blue',
    score: 0,
    dy: 0
};

let player2 = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    color: 'red',
    score: 0,
    dy: 0
};

const winningScore = 5;

// Add sound effects
const paddleHitSound = new Audio('paddle_hit.mp3');
const scoreSound = new Audio('score.mp3');
const gameOverSound = new Audio('game_over.mp3');

// Draw rectangle
function drawRect(rect) {
    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
}

// Draw ball
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Draw scores
function drawScores() {
    ctx.font = '40px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(player1.score, canvas.width / 4, 50);
    ctx.fillStyle = 'blue';
    ctx.fillText(player2.score, (canvas.width / 4) * 3, 50);
}

// Draw game over screen
function drawGameOver() {
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'block';
    winnerText.textContent = player1.score === 5 ? 'Player 1 Wins!' : 'Player 2 Wins!';
}

// Draw power-up
function drawPowerUp() {
    if (!powerUp.active) return;

    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Reset game
function resetGame() {
    player1.score = 0;
    player2.score = 0;
    isGameOver = false;
    resetBall();
}

// Check power-up collision
function checkPowerUpCollision(player) {
    if (
        powerUp.active &&
        player.x < powerUp.x + powerUp.width &&
        player.x + player.width > powerUp.x &&
        player.y < powerUp.y + powerUp.height &&
        player.y + player.height > powerUp.y
    ) {
        powerUp.active = false;
        ball.speed += 2; // Example power-up effect
    }
}

// Spawn power-up
function spawnPowerUp() {
    if (!enablePowerUps || powerUp.active) return;

    powerUp.x = Math.random() * (canvas.width - powerUp.radius * 2) + powerUp.radius;
    powerUp.y = Math.random() * (canvas.height - powerUp.radius * 2) + powerUp.radius;
    powerUp.active = true;
    powerUp.effect = Math.random() > 0.5 ? 'speed' : 'disappear';

    powerUp.timeout = setTimeout(() => {
        powerUp.active = false;
    }, 5000);
}

// AI player logic
function updateAI() {
    if (ball.y < player2.y + player2.height / 2) {
        player2.dy = -2; // AI moves up
    } else if (ball.y > player2.y + player2.height / 2) {
        player2.dy = 2; // AI moves down
    } else {
        player2.dy = 0; // AI stays still
    }
}

// Update game state
function update() {
    if (isGameOver) return;

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < player1.x + player1.width &&
        ball.y > player1.y &&
        ball.y < player1.y + player1.height
    ) {
        ball.dx = ball.speed; // Ensure constant speed
        paddleHitSound.play();
    }

    if (
        ball.x + ball.radius > player2.x &&
        ball.y > player2.y &&
        ball.y < player2.y + player2.height
    ) {
        ball.dx = -ball.speed; // Ensure constant speed
        paddleHitSound.play();
    }

    // Ball out of bounds
    if (ball.x - ball.radius < 0) {
        player2.score++;
        scoreSound.play();
        if (player2.score === winningScore) {
            isGameOver = true;
            gameOverSound.play();
            drawGameOver();
        } else {
            resetBall();
        }
    }

    if (ball.x + ball.radius > canvas.width) {
        player1.score++;
        scoreSound.play();
        if (player1.score === winningScore) {
            isGameOver = true;
            gameOverSound.play();
            drawGameOver();
        } else {
            resetBall();
        }
    }

    // Player movement
    player1.y += player1.dy;
    player2.y += player2.dy;

    // Prevent paddles from going out of bounds
    if (player1.y < 0) player1.y = 0;
    if (player1.y + player1.height > canvas.height) player1.y = canvas.height - player1.height;

    if (player2.y < 0) player2.y = 0;
    if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height;

    // Update AI player
    updateAI();

    // Power-up logic
    if (Math.random() < 0.01) {
        spawnPowerUp();
    }
}

// Render game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(player1);
    drawRect(player2);
    drawBall(ball);
    drawScores();
    drawPowerUp();

    if (isGameOver) {
        drawGameOver();
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
resetBall();
gameLoop();

// Player controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') player1.dy = -5;
    if (e.key === 's') player1.dy = 5;
    if (e.key === 'ArrowUp') player2.dy = -5;
    if (e.key === 'ArrowDown') player2.dy = 5;
    if (e.key === 'r' && isGameOver) resetGame();
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 's') player1.dy = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player2.dy = 0;
});

canvas.addEventListener('click', (e) => {
    if (!powerUp.active) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dist = Math.sqrt(
        (mouseX - powerUp.x) ** 2 + (mouseY - powerUp.y) ** 2
    );

    if (dist <= powerUp.radius) {
        if (powerUp.effect === 'speed') {
            ball.speed += 2;
        } else if (powerUp.effect === 'disappear') {
            player2.height = 0;
            setTimeout(() => {
                player2.height = 100;
            }, 2000);
        }

        powerUp.active = false;
        clearTimeout(powerUp.timeout);
    }
});