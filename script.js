let userScore = 0;
let compScore = 0;
let round = 1;

const choices = document.querySelectorAll(".choice");
const ANIM_DURATION = 650; // match with CSS animation durations (ms)

// Add event listeners (click + keyboard)
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    game(choice.id);
  });

  choice.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      game(choice.id);
    }
  });
});

function game(userChoice) {
  const choicesContainer = document.getElementById("choices");
  if (choicesContainer && choicesContainer.classList.contains("animating")) return;

  const compChoice = getCompChoice();
  let result = "";
  let outcome = ""; // "user", "comp", "tie"

  if (userChoice === compChoice) {
    result = "It's a Tie!";
    outcome = "tie";
  } else if (
    (userChoice === "rock" && compChoice === "scissors") ||
    (userChoice === "paper" && compChoice === "rock") ||
    (userChoice === "scissors" && compChoice === "paper")
  ) {
    userScore++;
    result = "You Win!";
    outcome = "user";
  } else {
    compScore++;
    result = "Computer Wins!";
    outcome = "comp";
  }

  updateScore();
  displayResult(userChoice, compChoice, result);

  // Animations
  animateChoices(userChoice, compChoice, outcome);

  // If user wins, burst confetti at the user's choice position
  if (outcome === "user") {
    const el = document.getElementById(userChoice);
    if (el) {
      const rect = el.getBoundingClientRect();
      // center of the element
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      burstConfetti(x, y);
    } else {
      // fallback: center of viewport
      burstConfetti(window.innerWidth / 2, window.innerHeight / 3);
    }
  }

  // Update round
  round++;
  const roundEl = document.getElementById("round");
  if (roundEl) roundEl.innerText = round;
}

function getCompChoice() {
  const choices = ["rock", "paper", "scissors"];
  const randomIndex = Math.floor(Math.random() * 3);
  return choices[randomIndex];
}

function updateScore() {
  const userEl = document.getElementById("user-score");
  const compEl = document.getElementById("comp-score");
  if (userEl) userEl.innerText = userScore;
  if (compEl) compEl.innerText = compScore;
}

function displayResult(userChoice, compChoice, result) {
  const resultDiv = document.getElementById("result");
  if (!resultDiv) return;

  resultDiv.innerHTML = `
    <p>You chose: <strong>${userChoice}</strong></p>
    <p>Computer chose: <strong>${compChoice}</strong></p>
    <p id="msg">Result: <strong>${result}</strong></p>
  `;
}

/* ---- Animation helper (existing) ---- */
function animateChoices(userChoice, compChoice, outcome) {
  const choicesContainer = document.getElementById("choices");
  if (choicesContainer) choicesContainer.classList.add("animating");

  const userEl = document.getElementById(userChoice);
  const compEl = document.getElementById(compChoice);

  if (!userEl || !compEl) {
    setTimeout(() => {
      if (choicesContainer) choicesContainer.classList.remove("animating");
    }, ANIM_DURATION);
    return;
  }

  if (outcome === "tie") {
    userEl.classList.add("flash-tie");
    compEl.classList.add("flash-tie");
  } else if (outcome === "user") {
    userEl.classList.add("flash-win");
    compEl.classList.add("flash-lose");
  } else {
    userEl.classList.add("flash-lose");
    compEl.classList.add("flash-win");
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    userEl.classList.remove("flash-win", "flash-lose", "flash-tie");
    compEl.classList.remove("flash-win", "flash-lose", "flash-tie");
    if (choicesContainer) choicesContainer.classList.remove("animating");
  };

  const onAnimEnd = () => {
    cleanup();
    userEl.removeEventListener("animationend", onAnimEnd);
    compEl.removeEventListener("animationend", onAnimEnd);
  };

  userEl.addEventListener("animationend", onAnimEnd);
  compEl.addEventListener("animationend", onAnimEnd);

  setTimeout(cleanup, ANIM_DURATION + 100);
}

/* ---------- Confetti implementation ---------- */
/*
  burstConfetti(x, y)
   - x,y are viewport coordinates where the burst will originate
   - the function creates a temporary container, spawns pieces, animates them, then removes container
*/
function burstConfetti(x, y, opts = {}) {
  const pieces = opts.pieces || 28; // number of confetti pieces
  const spread = opts.spread || 120; // px horizontal spread multiplier
  const lifetime = opts.lifetime || 1800; // ms until cleanup

  // Create container
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  const colors = ["#ff5252", "#ffb74d", "#ffd54f", "#81c784", "#4fc3f7", "#9575cd", "#f06292", "#fff176"];

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    // random color, size, rotation
    const color = colors[Math.floor(Math.random() * colors.length)];
    const w = 6 + Math.floor(Math.random() * 10); // width
    const h = 9 + Math.floor(Math.random() * 12); // height
    piece.style.width = w + "px";
    piece.style.height = h + "px";
    piece.style.background = color;

    // initial position (place at x,y but shift a little to avoid overlapping)
    const offsetX = (Math.random() - 0.5) * 8;
    const offsetY = (Math.random() - 0.5) * 8;
    piece.style.left = x + offsetX + "px";
    piece.style.top = y + offsetY + "px";

    // randomized flight variables stored in CSS variables for the confetti-flight animation
    const tx = (Math.random() - 0.5) * spread + (Math.random() < 0.5 ? -10 : 10); // horizontal travel
    const ty = -20 - Math.random() * 40; // small upward push first (negative)
    const rot = (Math.random() - 0.5) * 360; // rotation degrees

    piece.style.setProperty("--tx", tx + "px");
    piece.style.setProperty("--ty", ty + "px");
    piece.style.setProperty("--rot", rot + "deg");

    // randomize duration and delay to make burst lively
    const duration = 1100 + Math.floor(Math.random() * 900); // 1100..2000ms
    const delay = Math.floor(Math.random() * 120); // 0..120ms

    piece.style.animation = `confetti-flight ${duration}ms cubic-bezier(.15,.8,.25,1) ${delay}ms forwards`;
    // small spin to look like flipping
    piece.style.transformOrigin = "center";
    piece.style.willChange = "transform, opacity";

    container.appendChild(piece);
  }

  // cleanup after lifetime
  setTimeout(() => {
    // fade out container quickly for smooth cleanup
    container.style.transition = "opacity 300ms ease";
    container.style.opacity = "0";
    setTimeout(() => {
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }, 320);
  }, lifetime);
}

/* ---- Reset ---- */
function resetGame() {
  userScore = 0;
  compScore = 0;
  round = 1;
  updateScore();

  const roundEl = document.getElementById("round");
  if (roundEl) roundEl.innerText = round;

  const resultDiv = document.getElementById("result");
  if (resultDiv) resultDiv.innerHTML = "<p id='msg'>Make your move!</p>";
}

const resetBtn = document.getElementById("reset-btn") || document.getElementById("reset");
if (resetBtn) {
  resetBtn.addEventListener("click", resetGame);
}
