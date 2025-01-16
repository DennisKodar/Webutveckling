const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Load images
const birdImage = new Image();
birdImage.src = "assets/axolotl.png"; // Replace with your custom PNG image path
const backgroundImage = new Image();
backgroundImage.src = "assets/background.jpg"; // Your scrolling background image

const pipeWidth = 50;
const pipeGap = 200;
let birdY = canvas.height / 2;
let birdVelocity = 0;
let gravity = 0.6;
let lift = -10;
let pipes = [];
let score = 0;
let level = 1;
let isPaused = false; // Track if the game is paused

// Bird Object
const bird = {
  x: 50,
  y: birdY,
  width: 40,
  height: 40,
  draw: function () {
    ctx.drawImage(birdImage, this.x, this.y, this.width, this.height);
  },
  update: function () {
    if (isPaused) return; // Skip update if paused
    this.y += birdVelocity;
    birdVelocity += gravity;

    // Prevent bird from going out of bounds
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
  },
  flap: function () {
    if (isPaused) return; // Prevent flap if paused
    birdVelocity = lift;
  },
};

// Pipe Object
const Pipe = function (x) {
  this.x = x;
  this.topHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
  this.bottomHeight = canvas.height - (this.topHeight + pipeGap);
  this.width = pipeWidth;
  this.draw = function () {
    // Apply gradient for top pipe
    let topGradient = ctx.createLinearGradient(this.x, 0, this.x, this.topHeight);
    topGradient.addColorStop(0, "#66FF66");
    topGradient.addColorStop(1, "#338033");
    ctx.fillStyle = topGradient;
    ctx.fillRect(this.x, 0, this.width, this.topHeight);

    // Apply gradient for bottom pipe
    let bottomGradient = ctx.createLinearGradient(this.x, canvas.height - this.bottomHeight, this.x, canvas.height);
    bottomGradient.addColorStop(0, "#66FF66");
    bottomGradient.addColorStop(1, "#338033");
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(this.x, canvas.height - this.bottomHeight, this.width, this.bottomHeight);

    // Add border for extra detail
    ctx.strokeStyle = "#004d00";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);
    ctx.strokeRect(this.x, canvas.height - this.bottomHeight, this.width, this.bottomHeight);
  };
  this.update = function () {
    if (isPaused) return; // Skip update if paused
    this.x -= 2; // Speed of the pipes
  };
};

// Handle key events
document.addEventListener("keydown", function (e) {
  if (e.key === " " || e.key === "ArrowUp") { // Space or ArrowUp to flap
    bird.flap();
  }
  if (e.key === "Escape") { // Escape to pause/unpause
    isPaused = !isPaused;
  }
});

// Create pipes every 1000ms
setInterval(() => {
  if (!isPaused) {
    pipes.push(new Pipe(canvas.width));
  }
}, 2000);

// Background scrolling variables
let backgroundX = 0;
const backgroundSpeed = 1; // Speed of the background scrolling

// Update level based on score
function updateLevel() {
  level = Math.floor(score / 10) + 1; // Level increases every 10 points
}

// Draw Score with Glow Effect
function drawScore() {
  // Glow effect
  ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
  ctx.shadowBlur = 10;

  // Draw the score
  ctx.fillStyle = "white"; // Score color
  ctx.font = "30px 'Press Start 2P', sans-serif"; // Use pixel font or regular font
  ctx.textAlign = "center";
  ctx.fillText("Score: " + score, canvas.width / 2, 50); // Draw the score

  // Reset shadow
  ctx.shadowColor = "transparent"; // Reset shadow
}

// Draw Level with Glow Effect
function drawLevel() {
  // Apply glow effect for the level counter
  ctx.shadowColor = "rgba(255, 255, 0, 0.8)"; // Yellow glow
  ctx.shadowBlur = 15;

  // Draw the level
  ctx.fillStyle = "yellow"; // Level color
  ctx.font = "20px 'Press Start 2P', sans-serif"; // Use pixel font for level
  ctx.textAlign = "center";
  ctx.fillText("Level: " + level, canvas.width / 2, 100); // Draw level

  // Reset shadow
  ctx.shadowColor = "transparent"; // Reset shadow
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Draw the scrolling background
  ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

  // Scroll the background
  backgroundX -= backgroundSpeed;
  if (backgroundX <= -canvas.width) {
    backgroundX = 0; // Reset position when background completely scrolls off-screen
  }

  // Draw and update bird
  bird.update();
  bird.draw();

  // Draw and update pipes
  pipes.forEach((pipe, index) => {
    pipe.update();
    pipe.draw();

    // Remove pipes that are off-screen
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
      score++;
    }

    // Check for collisions with pipes
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipe.width &&
      (bird.y < pipe.topHeight || bird.y + bird.height > canvas.height - pipe.bottomHeight)
    ) {
      // Collision detected, reset game
      resetGame();
    }
  });

  // Update level based on the score
  updateLevel();

  // Draw score and level with glow effects
  drawScore();
  drawLevel();

  // Request the next frame for smooth animation
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  bird.y = canvas.height / 2;
  birdVelocity = 0;
  pipes = [];
  score = 0;
  level = 1; // Reset level
}

gameLoop();
