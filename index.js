const expression = document.getElementById("expression");
const result = document.getElementById("result");
const calculator = document.getElementById("calculator");

const buttons = document.querySelectorAll(".keys button");
const functionButtons = document.querySelectorAll(".func-grid button");

const copyBtn = document.getElementById("copyBtn");
const soundBtn = document.getElementById("soundBtn");
const themeSmall = document.getElementById("themeSmall");

const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const closeHistory = document.getElementById("closeHistory");
const clearHistory = document.getElementById("clearHistory");
const historyList = document.getElementById("historyList");

const moreSmall = document.getElementById("moreSmall");
const morePanel = document.getElementById("morePanel");
const closeMore = document.getElementById("closeMore");

const totalCalcsEl = document.getElementById("totalCalcs");
const fahhCountEl = document.getElementById("fahhCount");
const accuracyEl = document.getElementById("accuracy");

let input = "";
let history = JSON.parse(localStorage.getItem("fahhHistory")) || [];
let totalCalcs = Number(localStorage.getItem("totalCalcs")) || 0;
let fahhCount = Number(localStorage.getItem("fahhCount")) || 0;
let soundOn = localStorage.getItem("soundOn") !== "false";

const fahhMessages = ["FAHH!", "Invalid", "Try Again!"];

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeSmall.textContent = "☀️ Light";
}

soundBtn.textContent = soundOn ? "🔊" : "🔇";
renderHistory();
updateStats();

buttons.forEach((btn) => {
  btn.addEventListener("click", () => handleInput(btn.dataset.key));
});

function handleInput(key) {
  result.classList.remove("error-text");

  if (key === "AC") {
    input = "";
    expression.textContent = "";
    result.textContent = "0";
    return;
  }

  if (key === "DEL") {
    input = input.slice(0, -1);
    expression.textContent = format(input);
    if (!input) result.textContent = "0";
    return;
  }

  if (key === "=") {
    calculate();
    return;
  }

  input += key;
  expression.textContent = format(input);
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

    result.textContent = answer;

    if (answer === 69 || answer === 420) {
      setTimeout(() => {
        result.textContent = "😏 Nice";
      }, 400);
    }

    history.unshift(`${format(input)} = ${answer}`);
    totalCalcs++;

    saveData();
    renderHistory();
    updateStats();

    input = String(answer);
  } catch {
    showFahh();
  }
}

function showFahh() {
  result.classList.add("error-text");
  result.textContent = fahhMessages[Math.floor(Math.random() * fahhMessages.length)];

  fahhCount++;
  saveData();
  updateStats();

  calculator.classList.add("shake");
  navigator.vibrate?.(100);

  if (soundOn) {
    const sound = new Audio("fahh.mp3");
    sound.play().catch(() => {});
  }

  setTimeout(() => calculator.classList.remove("shake"), 400);
}

function format(value) {
  return value
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/Math\.sqrt/g, "√")
    .replace(/Math\.sin/g, "sin")
    .replace(/Math\.cos/g, "cos")
    .replace(/Math\.tan/g, "tan")
    .replace(/Math\.log10/g, "log")
    .replace(/Math\.log/g, "ln")
    .replace(/Math\.PI/g, "π")
    .replace(/Math\.E/g, "e");
}

functionButtons.forEach((btn) => {
  btn.addEventListener("click", () => addFunction(btn.dataset.func));
});

function addFunction(func) {
  result.classList.remove("error-text");

  if (func === "sqrt") input += "Math.sqrt(";
  if (func === "square") input += "**2";
  if (func === "power") input += "**";
  if (func === "sin") input += "Math.sin(";
  if (func === "cos") input += "Math.cos(";
  if (func === "tan") input += "Math.tan(";
  if (func === "log") input += "Math.log10(";
  if (func === "ln") input += "Math.log(";
  if (func === "pi") input += "Math.PI";
  if (func === "e") input += "Math.E";

  if (func === "paren") {
    const open = (input.match(/\(/g) || []).length;
    const close = (input.match(/\)/g) || []).length;
    input += open > close ? ")" : "(";
  }

  if (func === "fact") {
    const match = input.match(/(\d+)$/);
    if (!match) return showFahh();

    const num = Number(match[0]);
    if (num < 0 || num > 20) return showFahh();

    input = input.slice(0, -match[0].length) + factorial(num);
  }

  expression.textContent = format(input);
}

function factorial(n) {
  let ans = 1;
  for (let i = 2; i <= n; i++) ans *= i;
  return ans;
}

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(result.textContent);
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => copyBtn.textContent = "📋 Copy Result", 1200);
  } catch {
    copyBtn.textContent = "Copy Failed";
  }
});

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  localStorage.setItem("soundOn", soundOn);
});

themeSmall.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeSmall.textContent = "☀️ Light";
    localStorage.setItem("theme", "dark");
  } else {
    themeSmall.textContent = "🎨 Theme";
    localStorage.setItem("theme", "light");
  }
});

moreSmall.addEventListener("click", (e) => {
  e.stopPropagation();
  morePanel.classList.toggle("show");
  historyPanel.classList.remove("show");
});

closeMore.addEventListener("click", (e) => {
  e.stopPropagation();
  morePanel.classList.remove("show");
});

historyBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  historyPanel.classList.toggle("show");
  morePanel.classList.remove("show");
});

closeHistory.addEventListener("click", (e) => {
  e.stopPropagation();
  historyPanel.classList.remove("show");
});

clearHistory.addEventListener("click", () => {
  history = [];
  totalCalcs = 0;
  fahhCount = 0;
  saveData();
  renderHistory();
  updateStats();
});

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
  if (e.key === "Escape") handleInput("AC");
});