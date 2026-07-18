/* ===============================
   FahhCalc – Complete JavaScript
   Matches current HTML + CSS
================================= */

"use strict";

/* ===============================
   DOM HELPERS
================================= */

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

/* ===============================
   ELEMENTS
================================= */

const expression = $("expression");
const result = $("result");
const successMsg = $("successMsg");
const calculator = $("calculator");
const calculatorScreen = $("calculatorScreen");

const keyButtons = $$(".keys button, .cursor-actions button");

const soundBtn = $("soundBtn");
const gameMenuBtn = $("gameMenuBtn");
const historyBtn = $("historyBtn");
const themeSmall = $("themeSmall");

const smartDrawer = $("smartDrawer");
const drawerOverlay = $("drawerOverlay");
const drawerViews = $$(".drawer-view");
const drawerTriggers = $$(".drawer-trigger");

const gamePanel = $("gamePanel");
const historyPanel = $("historyPanel");
const themePanel = $("themePanel");

const closeGame = $("closeGame");
const closeHistory = $("closeHistory");
const closeTheme = $("closeTheme");

const clearHistory = $("clearHistory");
const historyList = $("historyList");

const playStatus = $("playStatus");
const livesDisplay = $("livesDisplay");
const timerDisplay = $("timerDisplay");
const timeLeftEl = $("timeLeft");
const streakCount = $("streakCount");
const streakDisplay = $("streakDisplay");

const pauseChallengeBtn = $("pauseChallengeBtn");
const quitChallengeBtn = $("quitChallengeBtn");
const pauseBox = $("pauseBox");
const resumeChallengeBtn = $("resumeChallengeBtn");
const pauseQuitBtn = $("pauseQuitBtn");

const countdownBox = $("countdownBox");
const countdownText = $("countdownText");

const quizBox = $("quizBox");
const questionInfo = $("questionInfo");
const answerOptions = $("answerOptions");

const challengeBtns = $$("[data-challenge]");
const timeBtns = $$("[data-time]");
const difficultyBtns = $$("[data-level]");

const survivalBtn = $("survivalBtn");
const endlessBtn = $("endlessBtn");
const randomBtn = $("randomBtn");
const bossBtn = $("bossBtn");
const dailyBtn = $("dailyBtn");

const themeBtns = $$("[data-theme]");

const confirmQuitPanel = $("confirmQuitPanel");
const cancelQuitBtn = $("cancelQuitBtn");
const confirmQuitBtn = $("confirmQuitBtn");

const resultPanel = $("resultPanel");
const closeResult = $("closeResult");
const playAgainBtn = $("playAgainBtn");
const shareScoreBtn = $("shareScoreBtn");

const modalOverlay = $("modalOverlay");

const finalCorrect = $("finalCorrect");
const finalWrong = $("finalWrong");
const finalAccuracy = $("finalAccuracy");
const finalLives = $("finalLives");
const finalDifficulty = $("finalDifficulty");
const finalTimeTaken = $("finalTimeTaken");
const finalBestStreak = $("finalBestStreak");
const finalBestScore = $("finalBestScore");
const newHighScoreMsg = $("newHighScoreMsg");

const highScoreEl = $("highScore");
const totalCalcsEl = $("totalCalcs");
const fahhCountEl = $("fahhCount");
const accuracyEl = $("accuracy");
const correctGraph = $("correctGraph");
const wrongGraph = $("wrongGraph");

const errorSound = $("errorSound");
const clickSound = $("clickSound");
const correctSound = $("correctSound");

/* ===============================
   APP STATE
================================= */

let input = "";
let cursorIndex = 0;
let correctAnswer = null;

let difficulty = localStorage.getItem("difficulty") || "easy";
let currentMode = "normal";
let lastPlayedMode = null;
let lastPlayedValue = null;

let challengeActive = false;
let timerActive = false;
let paused = false;
let answerLocked = false;

let challengeTotal = 0;
let challengeCurrent = 0;
let challengeCorrect = 0;
let challengeWrong = 0;

let lives = 5;
let timeLeft = 0;
let timerInterval = null;
let countdownInterval = null;

let currentStreak = 0;
let bestStreak = 0;

let startTime = 0;
let timeTaken = 0;

let highScore = Number(localStorage.getItem("fahhHighScore")) || 0;
let history = safeParse(localStorage.getItem("fahhHistory"), []);
let totalCalcs = Number(localStorage.getItem("totalCalcs")) || 0;
let fahhCount = Number(localStorage.getItem("fahhCount")) || 0;

let soundOn = localStorage.getItem("soundOn") !== "false";
let activeDrawerView = null;
let answerAdvanceTimeout = null;

const fahhMessages = ["FAHH!", "Oops 😭", "Try Again!", "Almost!"];
const successMessages = ["NOICE 😎", "Perfect ✨", "Well Done 🔥", "Math Master 🧠"];
const themeNames = ["sakura", "galaxy", "forest", "ocean", "neon"];

/* ===============================
   INITIALIZE
================================= */

init();

function init() {
  applySavedTheme();
  applySavedDifficulty();
  updateSoundButton();

  if (localStorage.getItem("gameHintSeen")) {
    gameMenuBtn.classList.add("hideHint");
  }

  renderExpression();
  renderHistory();
  updateStats();
  updateGameMenu();
  updateLives();
  updateStreak();
  resetCalculatorView();

  bindEvents();
}

/* ===============================
   EVENT BINDING
================================= */

function bindEvents() {
  keyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      playClickSound();
      handleInput(button.dataset.key);
    });
  });

  soundBtn.addEventListener("click", toggleSound);

  drawerTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      playClickSound();

      const target = trigger.dataset.drawerTarget;
      toggleDrawer(target);
    });
  });

  closeGame.addEventListener("click", closeDrawerWithSound);
  closeHistory.addEventListener("click", closeDrawerWithSound);
  closeTheme.addEventListener("click", closeDrawerWithSound);
  drawerOverlay.addEventListener("click", closeDrawer);

  difficultyBtns.forEach((button) => {
    button.addEventListener("click", () => {
      playClickSound();
      difficulty = button.dataset.level;
      localStorage.setItem("difficulty", difficulty);
      updateDifficultyUI();
    });
  });

  challengeBtns.forEach((button) => {
    button.addEventListener("click", () => {
      playClickSound();
      startQuestionChallenge(Number(button.dataset.challenge));
    });
  });

  timeBtns.forEach((button) => {
    button.addEventListener("click", () => {
      playClickSound();
      startTimeChallenge(Number(button.dataset.time));
    });
  });

  survivalBtn.addEventListener("click", () => {
    playClickSound();
    startSurvivalMode();
  });

  endlessBtn.addEventListener("click", () => {
    playClickSound();
    startEndlessMode();
  });

  randomBtn.addEventListener("click", () => {
    playClickSound();
    startRandomMode();
  });

  bossBtn.addEventListener("click", () => {
    playClickSound();
    startBossChallenge();
  });

  dailyBtn.addEventListener("click", () => {
    playClickSound();
    startDailyChallenge();
  });

  themeBtns.forEach((button) => {
    button.addEventListener("click", () => {
      playClickSound();
      applyTheme(button.dataset.theme);
    });
  });

  clearHistory.addEventListener("click", clearAllHistory);

  pauseChallengeBtn.addEventListener("click", () => {
    playClickSound();
    pauseChallenge();
  });

  resumeChallengeBtn.addEventListener("click", () => {
    playClickSound();
    resumeChallenge();
  });

  quitChallengeBtn.addEventListener("click", () => {
    playClickSound();
    openQuitConfirm();
  });

  pauseQuitBtn.addEventListener("click", () => {
    playClickSound();
    openQuitConfirm();
  });

  cancelQuitBtn.addEventListener("click", () => {
    playClickSound();
    closeModal(confirmQuitPanel);
  });

  confirmQuitBtn.addEventListener("click", () => {
    playClickSound();
    quitChallenge();
  });

  closeResult.addEventListener("click", () => {
    playClickSound();
    closeModal(resultPanel);
  });

  playAgainBtn.addEventListener("click", () => {
    playClickSound();
    closeModal(resultPanel);
    replayLastMode();
  });

  shareScoreBtn.addEventListener("click", shareScore);

  modalOverlay.addEventListener("click", () => {
    if (confirmQuitPanel.classList.contains("show")) return;
    closeAllModals();
  });

  document.addEventListener("keydown", handleKeyboard);
}

/* ===============================
   SMART DRAWER
================================= */

function toggleDrawer(viewId) {
  const isSameOpen =
    smartDrawer.classList.contains("show") &&
    activeDrawerView === viewId;

  if (isSameOpen) {
    closeDrawer();
    return;
  }

  openDrawer(viewId);
}

function openDrawer(viewId) {
  const targetView = $(viewId);
  if (!targetView) return;

  activeDrawerView = viewId;

  drawerViews.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
    view.classList.remove("show");
  });

  smartDrawer.classList.add("show");
  drawerOverlay.classList.add("show");
  document.body.classList.add("drawer-open");

  smartDrawer.setAttribute("aria-hidden", "false");
  drawerOverlay.setAttribute("aria-hidden", "false");

  drawerTriggers.forEach((trigger) => {
    const active = trigger.dataset.drawerTarget === viewId;
    trigger.classList.toggle("active", active);
    trigger.setAttribute("aria-expanded", String(active));
  });

  if (viewId === "gamePanel") {
    localStorage.setItem("gameHintSeen", "true");
    gameMenuBtn.classList.add("hideHint");
    updateGameMenu();
  }

  if (viewId === "historyPanel") {
    renderHistory();
    updateStats();
  }
}

function closeDrawer() {
  smartDrawer.classList.remove("show", "open");
  drawerOverlay.classList.remove("show");
  document.body.classList.remove("drawer-open");

  smartDrawer.setAttribute("aria-hidden", "true");
  drawerOverlay.setAttribute("aria-hidden", "true");

  drawerTriggers.forEach((trigger) => {
    trigger.classList.remove("active");
    trigger.setAttribute("aria-expanded", "false");
  });

  activeDrawerView = null;
}

function closeDrawerWithSound() {
  playClickSound();
  closeDrawer();
}

/* ===============================
   MODALS
================================= */

function openModal(panel) {
  if (!panel) return;

  closeDrawer();
  panel.classList.add("show");
  panel.setAttribute("aria-hidden", "false");

  modalOverlay.classList.add("show");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal(panel) {
  if (!panel) return;

  panel.classList.remove("show");
  panel.setAttribute("aria-hidden", "true");

  const anyOpen = $$(".modal-panel").some((modal) =>
    modal.classList.contains("show")
  );

  if (!anyOpen) {
    modalOverlay.classList.remove("show");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }
}

function closeAllModals() {
  $$(".modal-panel").forEach((modal) => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });

  modalOverlay.classList.remove("show");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

/* ===============================
   NORMAL CALCULATOR
================================= */

function handleInput(key) {
  if (!key) return;

  /* AC must work even after selecting an answer */
  if (key === "AC" && !challengeActive && !timerActive && !paused) {
    clearTimeout(answerAdvanceTimeout);
    answerAdvanceTimeout = null;

    answerLocked = false;

    resetInput();
    resetCalculatorView();
    clearFeedbackClasses();
    return;
  }

  /* Calculator buttons should not work during challenges */
  if (challengeActive || timerActive || paused) return;

  /*
    After answering, allow only AC and DEL.
    Other calculator buttons remain locked.
  */
  if (answerLocked && key !== "DEL") return;

  clearFeedbackClasses();

  if (key === "DEL") {
    clearTimeout(answerAdvanceTimeout);
    answerAdvanceTimeout = null;

    answerLocked = false;

    quizBox.classList.add("hidden");
    quizBox.classList.remove("feedback-lock");
    answerOptions.innerHTML = "";

    if (cursorIndex > 0) {
      input =
        input.slice(0, cursorIndex - 1) +
        input.slice(cursorIndex);

      cursorIndex -= 1;
    }

    correctAnswer = null;
    result.textContent = input ? "" : "0";

    renderExpression();
    return;
  }

  if (key === "LEFT") {
    cursorIndex = Math.max(0, cursorIndex - 1);
    renderExpression();
    return;
  }

  if (key === "RIGHT") {
    cursorIndex = Math.min(input.length, cursorIndex + 1);
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
  successMsg.classList.remove("show", "correct", "wrong", "success", "error");
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

function resetCalculatorView() {
  quizBox.classList.add("hidden");
  quizBox.classList.remove("feedback-lock");
  answerOptions.innerHTML = "";
  successMsg.textContent = "";
  successMsg.classList.remove("show", "correct", "wrong", "success", "error");
  result.classList.remove("error-text");
  result.textContent = "0";
}

function renderExpression() {
  if (!input) {
    expression.innerHTML = "";
    return;
  }

  const before = escapeHtml(format(input.slice(0, cursorIndex)));
  const after = escapeHtml(format(input.slice(cursorIndex)));

  expression.innerHTML = `${before}<span class="custom-cursor"></span>${after}`;
}

function calculate() {
  try {
    if (!input.trim()) return;

    validateExpression(input);

    let answer = Function(`"use strict"; return (${input})`)();

    if (!Number.isFinite(answer)) {
      throw new Error("Invalid result");
    }

    answer = Number.isInteger(answer) ? answer : Number(answer.toFixed(6));
    correctAnswer = answer;

    questionInfo.textContent = "Choose the correct answer 👇";
    showQuizOptions(answer);
  } catch {
    showFahh();
  }
}

function validateExpression(value) {
  if (!/^[0-9+\-*/%.()\s]+$/.test(value)) {
    throw new Error("Unsupported characters");
  }

  if (/[+*/%.]{2,}/.test(value)) {
    throw new Error("Repeated operator");
  }

  if (/[+\-*/%.]$/.test(value)) {
    throw new Error("Incomplete expression");
  }

  if (/^[+*/%.]/.test(value)) {
    throw new Error("Invalid beginning");
  }
}

/* ===============================
   QUIZ OPTIONS
================================= */

function showQuizOptions(answer) {
  answerLocked = false;
  quizBox.classList.remove("feedback-lock");
  answerOptions.innerHTML = "";
  result.textContent = "Choose 👇";

  generateOptions(answer).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(option);

    button.addEventListener("click", () => {
      playClickSound();
      checkQuizAnswer(option, button);
    });

    answerOptions.appendChild(button);
  });

  quizBox.classList.remove("hidden");
}

function generateOptions(answer) {
  const options = new Set([normalizeNumber(answer)]);
  let attempts = 0;

  while (options.size < 3 && attempts < 100) {
    attempts += 1;
    let wrong;

    if (Number.isInteger(answer)) {
      const range = Math.max(5, Math.ceil(Math.abs(answer) * 0.25));
      wrong = answer + randomInt(-range, range);
      if (wrong === answer) wrong += randomChoice([-3, -2, 2, 3]);
    } else {
      wrong = Number((answer + Math.random() * 6 - 3).toFixed(2));
      if (wrong === answer) wrong = Number((wrong + 1).toFixed(2));
    }

    options.add(normalizeNumber(wrong));
  }

  while (options.size < 3) {
    options.add(normalizeNumber(answer + options.size + 1));
  }

  return shuffle([...options]);
}

function checkQuizAnswer(selected, selectedButton) {
  if (paused || answerLocked) return;

  answerLocked = true;
  quizBox.classList.add("feedback-lock");

  const isCorrect = Number(selected) === Number(correctAnswer);
  const buttons = [...answerOptions.querySelectorAll("button")];

  buttons.forEach((button) => {
    button.disabled = true;

    if (Number(button.textContent) === Number(correctAnswer)) {
      button.classList.add("correct-option");
    }
  });

  if (!isCorrect && selectedButton) {
    selectedButton.classList.add("wrong-option");
  }

  if (isCorrect) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer(selected);
  }

  challengeCurrent += 1;

  saveData();
  renderHistory();
  updateStats();

  /* Auto-next only during challenge modes */
  if (challengeActive || timerActive) {
    clearTimeout(answerAdvanceTimeout);

    answerAdvanceTimeout = setTimeout(() => {
      nextAfterAnswer();
    }, 1100);
  }
}

function handleCorrectAnswer() {
  challengeCorrect += 1;
  totalCalcs += 1;

  currentStreak += 1;
  bestStreak = Math.max(bestStreak, currentStreak);

  updateStreak();

  result.textContent = `${correctAnswer} 🎉`;
  successMsg.textContent =
    successMessages[Math.floor(Math.random() * successMessages.length)];

  successMsg.classList.remove("wrong", "error");
  successMsg.classList.add("show", "correct");

  calculator.classList.add("correct-flash");
  calculatorScreen.classList.add("flash-success");

  history.unshift(`${format(input)} = ${correctAnswer} ✅`);

  playCorrectSound();
}

function handleWrongAnswer(selected) {
  challengeWrong += 1;
  fahhCount += 1;

  currentStreak = 0;
  updateStreak();

  if (challengeActive || timerActive) {
    lives -= 1;
    updateLives();
  }

  result.classList.add("error-text");
  result.textContent = `FAHH! Answer: ${correctAnswer}`;

  successMsg.textContent = "Wrong answer 😭";
  successMsg.classList.remove("correct", "success");
  successMsg.classList.add("show", "wrong");

  calculator.classList.add("shake");
  calculatorScreen.classList.add("flash-error");

  history.unshift(
    `${format(input)} → chose ${selected}, answer ${correctAnswer} ❌`
  );

  navigator.vibrate?.(100);
  playFahhSound();
}

function nextAfterAnswer() {
  clearFeedbackClasses();
  answerLocked = false;
  quizBox.classList.remove("feedback-lock");

  if ((challengeActive || timerActive) && lives <= 0) {
    finishChallenge();
    return;
  }

  if (challengeActive && challengeCurrent >= challengeTotal) {
    finishChallenge();
    return;
  }

  if (timerActive && timeLeft <= 0) {
    finishChallenge();
    return;
  }

  if (challengeActive || timerActive) {
    generateAutoQuestion();
    return;
  }

  resetInput();
  resetCalculatorView();
}

function clearFeedbackClasses() {
  calculator.classList.remove("shake", "correct-flash");
  calculatorScreen.classList.remove("flash-success", "flash-error");
  successMsg.classList.remove("show", "correct", "wrong", "success", "error");
  result.classList.remove("error-text");
}

/* ===============================
   QUESTION GENERATION
================================= */

function createQuestionByDifficulty() {
  let levelToUse = difficulty;

  if (currentMode === "random") {
    levelToUse = randomChoice(["easy", "medium", "hard"]);
  }

  if (currentMode === "boss") {
    levelToUse = "hard";
  }

  let a;
  let b;
  let operator;
  let answer;

  if (levelToUse === "easy") {
    operator = randomChoice(["+", "-", "*"]);
    a = randomInt(1, 10);
    b = randomInt(1, 10);

    if (operator === "-" && b > a) {
      [a, b] = [b, a];
    }
  }

  if (levelToUse === "medium") {
    operator = randomChoice(["+", "-", "*"]);
    a = randomInt(10, 59);
    b = randomInt(2, 20);

    if (operator === "-" && b > a) {
      [a, b] = [b, a];
    }
  }

  if (levelToUse === "hard") {
    operator = randomChoice(["+", "-", "*", "/"]);

    if (operator === "/") {
      b = randomInt(2, 12);
      answer = randomInt(2, 12);
      a = b * answer;
    } else {
      a = randomInt(20, 119);
      b = randomInt(2, 31);

      if (operator === "-" && b > a) {
        [a, b] = [b, a];
      }
    }
  }

  const expressionText = `${a}${operator}${b}`;

  if (answer === undefined) {
    answer = Function(`"use strict"; return (${expressionText})`)();
  }

  return {
    expression: expressionText,
    answer: normalizeNumber(answer),
  };
}

function generateAutoQuestion() {
  clearFeedbackClasses();

  const question = createQuestionByDifficulty();

  input = question.expression;
  correctAnswer = question.answer;
  cursorIndex = input.length;

  updateQuestionInfo();
  renderExpression();
  showQuizOptions(correctAnswer);
}

function updateQuestionInfo() {
  if (currentMode === "question") {
    questionInfo.textContent = `Question ${challengeCurrent + 1} of ${challengeTotal}`;
  } else if (currentMode === "time") {
    questionInfo.textContent = `Time Challenge • ${timeLeft}s left`;
  } else if (currentMode === "survival") {
    questionInfo.textContent = "Survival Mode • Stay alive ❤️";
  } else if (currentMode === "endless") {
    questionInfo.textContent = `Endless Mode • Score ${challengeCorrect}`;
  } else if (currentMode === "random") {
    questionInfo.textContent = `Random Mode 🎲 • ${challengeCurrent + 1}/${challengeTotal}`;
  } else if (currentMode === "boss") {
    questionInfo.textContent = `Boss Challenge 👑 • ${challengeCurrent + 1}/${challengeTotal}`;
  } else if (currentMode === "daily") {
    questionInfo.textContent = `Daily Challenge 📅 • ${challengeCurrent + 1}/${challengeTotal}`;
  } else {
    questionInfo.textContent = "Choose the correct answer 👇";
  }
}

/* ===============================
   START CHALLENGES
================================= */

function startQuestionChallenge(total) {
  lastPlayedMode = "question";
  lastPlayedValue = total;
  prepareChallenge("question", total, false, 0);
}

function startTimeChallenge(seconds) {
  lastPlayedMode = "time";
  lastPlayedValue = seconds;
  prepareChallenge("time", Number.POSITIVE_INFINITY, true, seconds);
}

function startSurvivalMode() {
  lastPlayedMode = "survival";
  lastPlayedValue = null;
  prepareChallenge("survival", Number.POSITIVE_INFINITY, false, 0);
}

function startEndlessMode() {
  lastPlayedMode = "endless";
  lastPlayedValue = null;
  prepareChallenge("endless", Number.POSITIVE_INFINITY, false, 0);
}

function startRandomMode() {
  lastPlayedMode = "random";
  lastPlayedValue = 20;
  prepareChallenge("random", 20, false, 0);
}

function startBossChallenge() {
  lastPlayedMode = "boss";
  lastPlayedValue = null;
  prepareChallenge("boss", 50, true, 120);
  calculator.classList.add("boss-active");
}

function startDailyChallenge() {
  lastPlayedMode = "daily";
  lastPlayedValue = null;
  prepareChallenge("daily", 10, false, 0);
  calculator.classList.add("daily-active");
}

function prepareChallenge(mode, total, hasTimer, seconds) {
  closeDrawer();
  closeAllModals();
  clearAllRunningTimers();

  currentMode = mode;
  challengeActive = !hasTimer;
  timerActive = hasTimer;
  paused = false;
  answerLocked = false;

  challengeTotal = total;
  challengeCurrent = 0;
  challengeCorrect = 0;
  challengeWrong = 0;

  lives = mode === "endless" ? Number.POSITIVE_INFINITY : 5;

  currentStreak = 0;
  bestStreak = 0;

  startTime = Date.now();
  timeLeft = seconds;

  timeLeftEl.textContent = String(timeLeft);
  timerDisplay.classList.toggle("hidden", !hasTimer);
  timerDisplay.classList.remove("timer-warning");

  playStatus.classList.remove("hidden");
  pauseBox.classList.add("hidden");
  quizBox.classList.add("hidden");

  updateLives();
  updateStreak();

  startCountdown(() => {
    if (hasTimer) startTimer();
    generateAutoQuestion();
  });
}

function replayLastMode() {
  switch (lastPlayedMode) {
    case "question":
      startQuestionChallenge(lastPlayedValue || 5);
      break;
    case "time":
      startTimeChallenge(lastPlayedValue || 30);
      break;
    case "survival":
      startSurvivalMode();
      break;
    case "endless":
      startEndlessMode();
      break;
    case "random":
      startRandomMode();
      break;
    case "boss":
      startBossChallenge();
      break;
    case "daily":
      startDailyChallenge();
      break;
    default:
      openDrawer("gamePanel");
  }
}

/* ===============================
   COUNTDOWN + TIMER
================================= */

function startCountdown(callback) {
  clearInterval(countdownInterval);

  let count = 3;
  countdownBox.classList.remove("hidden");
  countdownText.textContent = String(count);

  countdownInterval = setInterval(() => {
    count -= 1;

    if (count > 0) {
      countdownText.textContent = String(count);
    } else if (count === 0) {
      countdownText.textContent = "GO!";
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      countdownBox.classList.add("hidden");
      callback();
    }
  }, 650);
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (paused) return;

    timeLeft -= 1;
    timeLeftEl.textContent = String(Math.max(0, timeLeft));

    if (timeLeft <= 10) {
      timerDisplay.classList.add("timer-warning");
    }

    if (timeLeft <= 0) {
      finishChallenge();
    }
  }, 1000);
}

function clearAllRunningTimers() {
  clearInterval(timerInterval);
  clearInterval(countdownInterval);
  clearTimeout(answerAdvanceTimeout);

  timerInterval = null;
  countdownInterval = null;
  answerAdvanceTimeout = null;
}

/* ===============================
   PAUSE + QUIT
================================= */

function pauseChallenge() {
  if (!(challengeActive || timerActive) || paused) return;

  paused = true;
  quizBox.classList.add("hidden");
  pauseBox.classList.remove("hidden");
}

function resumeChallenge() {
  if (!paused) return;

  pauseBox.classList.add("hidden");

  startCountdown(() => {
    paused = false;
    quizBox.classList.remove("hidden");
  });
}

function openQuitConfirm() {
  if (!(challengeActive || timerActive || paused)) return;
  openModal(confirmQuitPanel);
}

function quitChallenge() {
  clearAllRunningTimers();

  challengeActive = false;
  timerActive = false;
  paused = false;
  answerLocked = false;
  currentMode = "normal";
  timeLeft = 0;

  playStatus.classList.add("hidden");
  timerDisplay.classList.add("hidden");
  timerDisplay.classList.remove("timer-warning");
  quizBox.classList.add("hidden");
  pauseBox.classList.add("hidden");
  countdownBox.classList.add("hidden");

  calculator.classList.remove("boss-active", "daily-active");
  closeAllModals();

  resetInput();
  resetCalculatorView();
}

/* ===============================
   FINISH CHALLENGE
================================= */

function finishChallenge() {
  if (!(challengeActive || timerActive)) return;

  clearAllRunningTimers();

  challengeActive = false;
  timerActive = false;
  paused = false;
  answerLocked = false;

  timeTaken = Math.max(0, Math.round((Date.now() - startTime) / 1000));

  timerDisplay.classList.add("hidden");
  timerDisplay.classList.remove("timer-warning");
  playStatus.classList.add("hidden");
  quizBox.classList.add("hidden");
  pauseBox.classList.add("hidden");
  countdownBox.classList.add("hidden");

  calculator.classList.remove("boss-active", "daily-active");

  const attempted = challengeCorrect + challengeWrong;
  const accuracy =
    attempted === 0 ? 0 : Math.round((challengeCorrect / attempted) * 100);

  const isNewHighScore = challengeCorrect > highScore;

  if (isNewHighScore) {
    highScore = challengeCorrect;
    localStorage.setItem("fahhHighScore", String(highScore));
    newHighScoreMsg.classList.remove("hidden");
    createConfetti();
  } else {
    newHighScoreMsg.classList.add("hidden");
  }

  finalCorrect.textContent = String(challengeCorrect);
  finalWrong.textContent = String(challengeWrong);
  finalAccuracy.textContent = `${accuracy}%`;
  finalLives.textContent = getLivesText();
  finalDifficulty.textContent = capitalize(difficulty);
  finalTimeTaken.textContent = `${timeTaken}s`;
  finalBestStreak.textContent = String(bestStreak);
  finalBestScore.textContent = String(highScore);

  updateGameMenu();
  openModal(resultPanel);

  currentMode = "normal";
  resetInput();
  result.textContent = "0";
}

/* ===============================
   LIVES + STREAK
================================= */

function updateLives() {
  if (!livesDisplay) return;

  if (currentMode === "endless" || lives === Number.POSITIVE_INFINITY) {
    livesDisplay.textContent = "∞";
    livesDisplay.classList.remove("low-life");
    return;
  }

  livesDisplay.textContent = getLivesText();

  livesDisplay.classList.toggle(
    "low-life",
    lives <= 1 && (challengeActive || timerActive)
  );
}

function getLivesText() {
  if (lives === Number.POSITIVE_INFINITY) return "∞";

  let hearts = "";

  for (let index = 1; index <= 5; index += 1) {
    hearts += index <= Math.max(0, lives) ? "❤️" : "🤍";
  }

  return hearts;
}

function updateStreak() {
  streakCount.textContent = String(currentStreak);
  streakDisplay.classList.toggle("streak-hot", currentStreak >= 3);
}

/* ===============================
   HISTORY + STATS
================================= */

function clearAllHistory() {
  playClickSound();

  history = [];
  totalCalcs = 0;
  fahhCount = 0;

  saveData();
  renderHistory();
  updateStats();
}

function renderHistory() {
  if (!historyList) return;

  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">🕘</span>
        <p class="empty">No history yet</p>
        <small>Your completed calculations will appear here.</small>
      </div>
    `;
    return;
  }

  historyList.innerHTML = history
    .slice(0, 30)
    .map((item) => `<div class="history-item">${escapeHtml(item)}</div>`)
    .join("");
}

function updateStats() {
  totalCalcsEl.textContent = String(totalCalcs);
  fahhCountEl.textContent = String(fahhCount);

  const total = totalCalcs + fahhCount;
  const accuracy =
    total === 0 ? 100 : Math.round((totalCalcs / total) * 100);

  accuracyEl.textContent = `${accuracy}%`;

  const correctPercent =
    total === 0 ? 0 : Math.round((totalCalcs / total) * 100);

  const wrongPercent =
    total === 0 ? 0 : Math.round((fahhCount / total) * 100);

  correctGraph.style.width = `${correctPercent}%`;
  wrongGraph.style.width = `${wrongPercent}%`;
}

function updateGameMenu() {
  highScoreEl.textContent = String(highScore);
}

function saveData() {
  history = history.slice(0, 100);

  localStorage.setItem("fahhHistory", JSON.stringify(history));
  localStorage.setItem("totalCalcs", String(totalCalcs));
  localStorage.setItem("fahhCount", String(fahhCount));
}

/* ===============================
   THEMES
================================= */

function applySavedTheme() {
  const savedTheme = localStorage.getItem("fahhTheme") || "sakura";
  applyTheme(savedTheme, false);
}

function applyTheme(theme, save = true) {
  const selectedTheme = themeNames.includes(theme) ? theme : "sakura";

  document.body.classList.remove(...themeNames, "dark");
  document.body.classList.add(selectedTheme);

  themeBtns.forEach((button) => {
    const active = button.dataset.theme === selectedTheme;
    button.classList.toggle("active", active);
    button.classList.toggle("active-theme", active);
  });

  themeSmall.textContent = "🎨";

  if (save) {
    localStorage.setItem("fahhTheme", selectedTheme);
  }
}

/* ===============================
   DIFFICULTY
================================= */

function applySavedDifficulty() {
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    difficulty = "easy";
  }

  updateDifficultyUI();
}

function updateDifficultyUI() {
  difficultyBtns.forEach((button) => {
    button.classList.toggle("active", button.dataset.level === difficulty);
  });
}

/* ===============================
   ERROR + EFFECTS
================================= */

function showFahh() {
  result.classList.add("error-text");
  result.textContent =
    fahhMessages[Math.floor(Math.random() * fahhMessages.length)];

  successMsg.textContent = "Invalid expression 😭";
  successMsg.classList.remove("correct", "success");
  successMsg.classList.add("show", "wrong");

  fahhCount += 1;

  saveData();
  updateStats();

  calculator.classList.add("shake");
  calculatorScreen.classList.add("flash-error");

  navigator.vibrate?.(100);
  playFahhSound();

  setTimeout(() => {
    calculator.classList.remove("shake");
    calculatorScreen.classList.remove("flash-error");
  }, 450);
}

function createConfetti() {
  const colors = ["#fb8500", "#ec4899", "#7c3aed", "#22c55e"];

  for (let index = 0; index < 35; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.background = randomChoice(colors);

    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 2200);
  }
}

/* ===============================
   SOUND
================================= */

function toggleSound() {
  soundOn = !soundOn;
  localStorage.setItem("soundOn", String(soundOn));
  updateSoundButton();

  if (soundOn) {
    playClickSound();
  }
}

function updateSoundButton() {
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundBtn.setAttribute(
    "aria-label",
    soundOn ? "Turn sound off" : "Turn sound on"
  );
}

function playClickSound() {
  playAudio(clickSound);
}

function playFahhSound() {
  playAudio(errorSound);
}

function playCorrectSound() {
  playAudio(correctSound);
}

function playAudio(audio) {
  if (!soundOn || !audio) return;

  try {
    audio.currentTime = 0;
    const promise = audio.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  } catch {
    // Audio may be blocked until the first user interaction.
  }
}

/* ===============================
   SHARE SCORE
================================= */

async function shareScore() {
  playClickSound();

  const text =
    `🏆 I scored ${challengeCorrect} in FahhCalc! ` +
    `Accuracy: ${finalAccuracy.textContent}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "FahhCalc Score",
        text,
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    showTemporaryMessage("Score copied!");
  } catch {
    showTemporaryMessage("Could not copy score");
  }
}

function showTemporaryMessage(message) {
  successMsg.textContent = message;
  successMsg.classList.remove("wrong", "error");
  successMsg.classList.add("show", "correct");

  setTimeout(() => {
    successMsg.classList.remove("show");
  }, 1400);
}

/* ===============================
   KEYBOARD
================================= */

function handleKeyboard(event) {
  if (event.key === "Escape") {
    if (confirmQuitPanel.classList.contains("show")) {
      closeModal(confirmQuitPanel);
      return;
    }

    if (resultPanel.classList.contains("show")) {
      closeModal(resultPanel);
      return;
    }

    if (smartDrawer.classList.contains("show")) {
      closeDrawer();
      return;
    }

    if (!(challengeActive || timerActive)) {
      handleInput("AC");
    }

    return;
  }

  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  if (challengeActive || timerActive || paused || answerLocked) return;

  const allowed = "0123456789+-*/.%()";

  if (allowed.includes(event.key)) {
    event.preventDefault();
    playClickSound();
    handleInput(event.key);
  }

  if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    playClickSound();
    handleInput("=");
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    playClickSound();
    handleInput("DEL");
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    handleInput("LEFT");
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    handleInput("RIGHT");
  }
}

/* ===============================
   HELPERS
================================= */

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function format(value) {
  return String(value)
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

function normalizeNumber(value) {
  return Number.isInteger(value) ? value : Number(Number(value).toFixed(6));
}

function capitalize(text) {
  return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
