const expression = document.getElementById("expression");
const result = document.getElementById("result");
const successMsg = document.getElementById("successMsg");
const calculator = document.getElementById("calculator");

const buttons = document.querySelectorAll(".keys button, .cursor-actions button");

const soundBtn = document.getElementById("soundBtn");
const themeSmall = document.getElementById("themeSmall");

const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const closeHistory = document.getElementById("closeHistory");
const clearHistory = document.getElementById("clearHistory");
const historyList = document.getElementById("historyList");

const gameMenuBtn = document.getElementById("gameMenuBtn");
const gamePanel = document.getElementById("gamePanel");
const closeGame = document.getElementById("closeGame");

const playStatus = document.getElementById("playStatus");
const livesDisplay = document.getElementById("livesDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const timeLeftEl = document.getElementById("timeLeft");

const quizBox = document.getElementById("quizBox");
const questionInfo = document.getElementById("questionInfo");
const answerOptions = document.getElementById("answerOptions");

const challengeBtns = document.querySelectorAll("[data-challenge]");
const timeBtns = document.querySelectorAll("[data-time]");
const difficultyBtns = document.querySelectorAll("[data-level]");

const resultPanel = document.getElementById("resultPanel");
const closeResult = document.getElementById("closeResult");
const playAgainBtn = document.getElementById("playAgainBtn");
const finalCorrect = document.getElementById("finalCorrect");
const finalWrong = document.getElementById("finalWrong");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalLives = document.getElementById("finalLives");

const highScoreEl = document.getElementById("highScore");
const totalCalcsEl = document.getElementById("totalCalcs");
const fahhCountEl = document.getElementById("fahhCount");
const accuracyEl = document.getElementById("accuracy");

const errorSound = document.getElementById("errorSound");
const correctSound = document.getElementById("correctSound");

let input = "";
let cursorIndex = 0;
let correctAnswer = null;

let difficulty = "easy";
let challengeActive = false;
let timerActive = false;

let challengeTotal = 0;
let challengeCurrent = 0;
let challengeCorrect = 0;
let challengeWrong = 0;

let lives = 5;
let timeLeft = 0;
let timerInterval = null;

let highScore = Number(localStorage.getItem("fahhHighScore")) || 0;
let history = JSON.parse(localStorage.getItem("fahhHistory")) || [];
let totalCalcs = Number(localStorage.getItem("totalCalcs")) || 0;
let fahhCount = Number(localStorage.getItem("fahhCount")) || 0;
let soundOn = localStorage.getItem("soundOn") !== "false";

const fahhMessages = ["FAHH!", "Oops 😭", "Try Again!", "Almost!"];
const successMessages = ["NOICE 😎", "Perfect ✨", "Well Done 🔥", "Math Master 🧠"];

document.body.classList.add("quiz-mode");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeSmall.textContent = "☀️";
}

soundBtn.textContent = soundOn ? "🔊" : "🔇";

renderExpression();
renderHistory();
updateStats();
updateGameMenu();
updateLives();

buttons.forEach((btn) => {
  btn.addEventListener("click", () => handleInput(btn.dataset.key));
});

function handleInput(key) {
  result.classList.remove("error-text");

  if (key === "AC") {
    resetInput();
    quizBox.classList.add("hidden");
    result.textContent = "0";
    successMsg.classList.remove("show");
    return;
  }

  if (key === "DEL") {
    quizBox.classList.add("hidden");

    if (cursorIndex > 0) {
      input = input.slice(0, cursorIndex - 1) + input.slice(cursorIndex);
      cursorIndex--;
    }

    result.textContent = input ? "" : "0";
    renderExpression();
    return;
  }

  if (key === "LEFT") {
    if (cursorIndex > 0) cursorIndex--;
    renderExpression();
    return;
  }

  if (key === "RIGHT") {
    if (cursorIndex < input.length) cursorIndex++;
    renderExpression();
    return;
  }

  if (key === "=") {
    calculate();
    return;
  }

  insertText(key);
}

function insertText(text) {
  quizBox.classList.add("hidden");
  result.classList.remove("error-text");

  input = input.slice(0, cursorIndex) + text + input.slice(cursorIndex);
  cursorIndex += text.length;

  result.textContent = "";
  renderExpression();
}

function resetInput() {
  input = "";
  cursorIndex = 0;
  correctAnswer = null;
  renderExpression();
}

function renderExpression() {
  if (!input) {
    expression.innerHTML = "";
    return;
  }

  const before = format(input.slice(0, cursorIndex));
  const after = format(input.slice(cursorIndex));

  expression.innerHTML = `${before}<span class="custom-cursor"></span>${after}`;
}

function calculate() {
  try {
    if (!input.trim()) return;

    if (/[+\-*/%.]{2,}/.test(input) || /[+\-*/%.]$/.test(input)) {
      throw new Error();
    }

    let answer = Function(`"use strict"; return (${input})`)();

    if (!isFinite(answer) || isNaN(answer)) throw new Error();

    answer = Number.isInteger(answer) ? answer : Number(answer.toFixed(6));

    correctAnswer = answer;
    showQuizOptions(answer);
  } catch {
    showFahh();
  }
}

function showQuizOptions(answer) {
  result.textContent = "Choose 👇";
  answerOptions.innerHTML = "";

  generateOptions(answer).forEach((option) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => checkQuizAnswer(option));
    answerOptions.appendChild(btn);
  });

  quizBox.classList.remove("hidden");
}

function generateOptions(answer) {
  const options = new Set([answer]);

  while (options.size < 3) {
    let wrong;

    if (Number.isInteger(answer)) {
      wrong = answer + Math.floor(Math.random() * 11) - 5;
      if (wrong === answer) wrong += 3;
    } else {
      wrong = Number((answer + Math.random() * 6 - 3).toFixed(2));
      if (wrong === answer) wrong += 1;
    }

    options.add(wrong);
  }

  return [...options].sort(() => Math.random() - 0.5);
}

function checkQuizAnswer(selected) {
  quizBox.classList.add("hidden");

  const isCorrect = Number(selected) === Number(correctAnswer);

  if (isCorrect) {
    challengeCorrect++;
    totalCalcs++;

    result.textContent = `${correctAnswer} 🎉`;
    successMsg.textContent = successMessages[Math.floor(Math.random() * successMessages.length)];
    successMsg.classList.add("show");
    calculator.classList.add("correct-flash");

    history.unshift(`${format(input)} = ${correctAnswer} ✅`);
    playCorrectSound();
  } else {
    challengeWrong++;
    fahhCount++;

    if (challengeActive || timerActive) {
      lives--;
      updateLives();
    }

    result.classList.add("error-text");
    result.textContent = `FAHH! Answer: ${correctAnswer}`;
    calculator.classList.add("shake");

    history.unshift(`${format(input)} → chose ${selected}, answer ${correctAnswer} ❌`);
    playFahhSound();
  }

  challengeCurrent++;

  saveData();
  renderHistory();
  updateStats();

  setTimeout(() => {
    calculator.classList.remove("shake", "correct-flash");
    successMsg.classList.remove("show");
    result.classList.remove("error-text");

    if ((challengeActive || timerActive) && lives <= 0) {
      finishChallenge();
      return;
    }

    if (challengeActive && challengeCurrent < challengeTotal) {
      generateAutoQuestion();
      return;
    }

    if (challengeActive && challengeCurrent >= challengeTotal) {
      finishChallenge();
      return;
    }

    if (timerActive && timeLeft > 0) {
      generateAutoQuestion();
      return;
    }

    resetInput();
    result.textContent = "0";
  }, 900);
}

function createQuestionByDifficulty() {
  let a, b, op, answer;

  if (difficulty === "easy") {
    const ops = ["+", "-", "*"];
    op = ops[Math.floor(Math.random() * ops.length)];
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
  }

  if (difficulty === "medium") {
    const ops = ["+", "-", "*"];
    op = ops[Math.floor(Math.random() * ops.length)];
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * 20) + 1;
  }

  if (difficulty === "hard") {
    const ops = ["+", "-", "*", "/"];
    op = ops[Math.floor(Math.random() * ops.length)];

    if (op === "/") {
      b = Math.floor(Math.random() * 12) + 2;
      answer = Math.floor(Math.random() * 12) + 2;
      a = b * answer;
    } else {
      a = Math.floor(Math.random() * 100) + 20;
      b = Math.floor(Math.random() * 30) + 2;
    }
  }

  const expressionText = `${a}${op}${b}`;

  if (answer === undefined) {
    answer = Function(`"use strict"; return (${expressionText})`)();
  }

  return { expression: expressionText, answer };
}

function generateAutoQuestion() {
  const question = createQuestionByDifficulty();

  input = question.expression;
  correctAnswer = question.answer;
  cursorIndex = input.length;

  if (challengeActive) {
    questionInfo.textContent = `Question ${challengeCurrent + 1} of ${challengeTotal}`;
  } else if (timerActive) {
    questionInfo.textContent = `Time Challenge • ${timeLeft}s left`;
  } else {
    questionInfo.textContent = "Choose the correct answer 👇";
  }

  renderExpression();
  showQuizOptions(correctAnswer);
}

function startQuestionChallenge(total) {
  closeAllPanels();

  challengeActive = true;
  timerActive = false;

  challengeTotal = total;
  challengeCurrent = 0;
  challengeCorrect = 0;
  challengeWrong = 0;
  lives = 5;

  clearInterval(timerInterval);
  timerDisplay.classList.add("hidden");
  playStatus.classList.remove("hidden");

  updateLives();
  generateAutoQuestion();
}

function startTimeChallenge(seconds) {
  closeAllPanels();

  challengeActive = false;
  timerActive = true;

  challengeTotal = 9999;
  challengeCurrent = 0;
  challengeCorrect = 0;
  challengeWrong = 0;
  lives = 5;

  timeLeft = seconds;
  timeLeftEl.textContent = timeLeft;

  playStatus.classList.remove("hidden");
  timerDisplay.classList.remove("hidden");

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;

    if (timeLeft <= 0) finishChallenge();
  }, 1000);

  updateLives();
  generateAutoQuestion();
}

function finishChallenge() {
  challengeActive = false;
  timerActive = false;

  clearInterval(timerInterval);
  timerDisplay.classList.add("hidden");
  playStatus.classList.add("hidden");
  quizBox.classList.add("hidden");

  const attempted = challengeCorrect + challengeWrong;
  const accuracy = attempted === 0 ? 0 : Math.round((challengeCorrect / attempted) * 100);

  if (challengeCorrect > highScore) {
    highScore = challengeCorrect;
    localStorage.setItem("fahhHighScore", highScore);
  }

  finalCorrect.textContent = challengeCorrect;
  finalWrong.textContent = challengeWrong;
  finalAccuracy.textContent = `${accuracy}%`;
  finalLives.textContent = getLivesText();

  highScoreEl.textContent = highScore;

  resultPanel.classList.add("show");
  result.textContent = "0";
  resetInput();
}

function updateLives() {
  livesDisplay.textContent = getLivesText();
}

function getLivesText() {
  let hearts = "";

  for (let i = 1; i <= 5; i++) {
    hearts += i <= lives ? "❤️" : "🤍";
  }

  return hearts;
}

function showFahh() {
  result.classList.add("error-text");
  result.textContent = fahhMessages[Math.floor(Math.random() * fahhMessages.length)];

  fahhCount++;

  saveData();
  updateStats();

  calculator.classList.add("shake");
  navigator.vibrate?.(100);
  playFahhSound();

  setTimeout(() => calculator.classList.remove("shake"), 400);
}

function playFahhSound() {
  if (!soundOn || !errorSound) return;
  errorSound.currentTime = 0;
  errorSound.play().catch(() => {});
}

function playCorrectSound() {
  if (!soundOn || !correctSound) return;
  correctSound.currentTime = 0;
  correctSound.play().catch(() => {});
}

function format(value) {
  return value
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

challengeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    startQuestionChallenge(Number(btn.dataset.challenge));
  });
});

timeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    startTimeChallenge(Number(btn.dataset.time));
  });
});

difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.level;

    difficultyBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  localStorage.setItem("soundOn", soundOn);
});

// Check if user has already seen the Game Menu hint
if (localStorage.getItem("gameHintSeen")) {
  gameMenuBtn.classList.add("hideHint");
}

themeSmall.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeSmall.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    themeSmall.textContent = "🎨";
    localStorage.setItem("theme", "light");
  }
});

gameMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  gamePanel.classList.toggle("show");
  historyPanel.classList.remove("show");
  resultPanel.classList.remove("show");

  // Hide hint forever after first click
  localStorage.setItem("gameHintSeen", "true");
  gameMenuBtn.classList.add("hideHint");
});

closeGame.addEventListener("click", (e) => {
  e.stopPropagation();
  gamePanel.classList.remove("show");
});

historyBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  historyPanel.classList.toggle("show");
  gamePanel.classList.remove("show");
  resultPanel.classList.remove("show");
});

closeHistory.addEventListener("click", (e) => {
  e.stopPropagation();
  historyPanel.classList.remove("show");
});

closeResult.addEventListener("click", () => {
  resultPanel.classList.remove("show");
});

playAgainBtn.addEventListener("click", () => {
  resultPanel.classList.remove("show");
  gamePanel.classList.add("show");
});

clearHistory.addEventListener("click", () => {
  history = [];
  totalCalcs = 0;
  fahhCount = 0;

  saveData();
  renderHistory();
  updateStats();
});

function closeAllPanels() {
  gamePanel.classList.remove("show");
  historyPanel.classList.remove("show");
  resultPanel.classList.remove("show");
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = `<p class="empty">No history yet</p>`;
    return;
  }

  historyList.innerHTML = history
    .map((item) => `<div class="history-item">${item}</div>`)
    .join("");
}

function updateStats() {
  totalCalcsEl.textContent = totalCalcs;
  fahhCountEl.textContent = fahhCount;

  const total = totalCalcs + fahhCount;
  const accuracy = total === 0 ? 100 : Math.round((totalCalcs / total) * 100);

  accuracyEl.textContent = `${accuracy}%`;
}

function updateGameMenu() {
  highScoreEl.textContent = highScore;
}

function saveData() {
  localStorage.setItem("fahhHistory", JSON.stringify(history));
  localStorage.setItem("totalCalcs", totalCalcs);
  localStorage.setItem("fahhCount", fahhCount);
}

document.addEventListener("keydown", (e) => {
  const allowed = "0123456789+-*/.%";

  if (allowed.includes(e.key)) handleInput(e.key);
  if (e.key === "Enter") handleInput("=");
  if (e.key === "Backspace") handleInput("DEL");
  if (e.key === "ArrowLeft") handleInput("LEFT");
  if (e.key === "ArrowRight") handleInput("RIGHT");
  if (e.key === "Escape") handleInput("AC");
});