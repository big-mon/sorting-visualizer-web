import { algorithms } from "./algorithms.js?v=2";
import { mulberry32, normalizeSeed, randomSeed } from "./rng.js";
import { computeTargetSize, sliceImage } from "./image_slicer.js";
import { renderPanel } from "./renderer.js";

const MAX_W = 640;
const MAX_H = 480;
const BUBBLE_LIMIT = 250;

const fileInput = document.getElementById("fileInput");
const modeInputs = document.querySelectorAll("input[name='splitMode']");
const stripesControls = document.getElementById("stripesControls");
const tilesControls = document.getElementById("tilesControls");
const stripeCount = document.getElementById("stripeCount");
const stripeCountLabel = document.getElementById("stripeCountLabel");
const tileCols = document.getElementById("tileCols");
const tileColsLabel = document.getElementById("tileColsLabel");
const tileRows = document.getElementById("tileRows");
const tileRowsLabel = document.getElementById("tileRowsLabel");
const tileTotalLabel = document.getElementById("tileTotalLabel");
const algoList = document.getElementById("algoList");
const bubbleWarning = document.getElementById("bubbleWarning");
const seedInput = document.getElementById("seedInput");
const seedRandom = document.getElementById("seedRandom");
const shuffleBtn = document.getElementById("shuffleBtn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");
const speedLabel = document.getElementById("speedLabel");
const panelGrid = document.getElementById("panelGrid");

const baseCanvas = document.createElement("canvas");
const baseCtx = baseCanvas.getContext("2d");

let pieces = [];
let layout = null;
let panels = [];
let running = false;
let stepsPerSecond = Number(speedRange.value);
let stepCarry = 0;
let lastTick = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMode() {
  const checked = [...modeInputs].find((input) => input.checked);
  return checked ? checked.value : "stripes";
}

function currentOptions() {
  const mode = getMode();
  if (mode === "tiles") {
    const cols = Number(tileCols.value);
    const rows = Number(tileRows.value);
    return { mode, cols, rows };
  }
  return { mode, count: Number(stripeCount.value) };
}

function updateModeUI() {
  const mode = getMode();
  stripesControls.classList.toggle("hidden", mode !== "stripes");
  tilesControls.classList.toggle("hidden", mode !== "tiles");
}

function updateTileRows() {
  if (!layout) {
    tileRowsLabel.textContent = "0";
    tileTotalLabel.textContent = "0";
    return;
  }
  tileRowsLabel.textContent = String(layout.rows);
  tileTotalLabel.textContent = String(layout.count);
}

function applyDefaultTileGrid() {
  let nextCols = clamp(Number(tileCols.value), Number(tileCols.min), Number(tileCols.max));
  let nextRows = clamp(Number(tileRows.value), Number(tileRows.min), Number(tileRows.max));
  const maxPieces = 250;
  if (nextCols * nextRows > maxPieces) {
    const scale = Math.sqrt(maxPieces / (nextCols * nextRows));
    nextCols = Math.max(1, Math.floor(nextCols * scale));
    nextRows = Math.max(1, Math.floor(nextRows * scale));
  }
  tileCols.value = String(nextCols);
  tileRows.value = String(nextRows);
  tileColsLabel.textContent = tileCols.value;
  tileRowsLabel.textContent = tileRows.value;
}

function applyBubbleLimit() {
  const bubbleCheckbox = algoList.querySelector("input[value='bubble']");
  if (!layout) {
    bubbleWarning.textContent = "";
    bubbleCheckbox.disabled = false;
    return;
  }
  if (layout.count > BUBBLE_LIMIT) {
    bubbleWarning.textContent = `Bubbleは${BUBBLE_LIMIT}ピース以上だと重くなる可能性があります。`;
    bubbleCheckbox.disabled = false;
  } else {
    bubbleWarning.textContent = "";
    bubbleCheckbox.disabled = false;
  }
}

function createPieces() {
  const { mode, count, cols, rows } = currentOptions();
  const result = sliceImage(baseCanvas, mode, { count, cols, rows });
  pieces = result.pieces;
  layout = result.layout;
  updateTileRows();
  applyBubbleLimit();
}

function resetStats(panel) {
  panel.stats = {
    comparisons: 0,
    swaps: 0,
    writes: 0,
    steps: 0,
    done: false,
    started: false,
    startTime: null,
    elapsed: 0,
  };
  panel.highlight = null;
  updateStatsUI(panel);
}

function updateStatsUI(panel) {
  panel.statEls.comparisons.textContent = panel.stats.comparisons;
  panel.statEls.swaps.textContent = panel.stats.swaps;
  panel.statEls.writes.textContent = panel.stats.writes;
  panel.statEls.steps.textContent = panel.stats.steps;
  const status = panel.stats.done ? "done" : panel.stats.started ? "running" : "idle";
  panel.statusIcon.classList.remove("status-idle", "status-running", "status-done");
  panel.statusIcon.classList.add(`status-${status}`);
  panel.timeLabel.textContent = `${panel.stats.elapsed.toFixed(2)}s`;
}

function setRunning(next) {
  running = next;
  startBtn.textContent = running ? "Pause" : "Start";
}

function buildPanels() {
  panelGrid.innerHTML = "";
  panels = [];
  const selected = [...algoList.querySelectorAll("input[type='checkbox']")]
    .filter((input) => input.checked)
    .map((input) => input.value)
    .filter((key) => algorithms[key]);

  selected.forEach((key) => {
    const algo = algorithms[key];
    const panel = document.createElement("div");
    panel.className = "panel";

    const titleRow = document.createElement("div");
    titleRow.className = "panel-title";

    const statusIcon = document.createElement("span");
    statusIcon.className = "status-dot status-idle";

    const title = document.createElement("h3");
    title.textContent = algo.name;

    const timeLabel = document.createElement("span");
    timeLabel.className = "panel-time";
    timeLabel.textContent = "0.00s";

    const canvas = document.createElement("canvas");
    const width = layout ? layout.width : 480;
    const height = layout ? layout.height : 360;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const stats = document.createElement("div");
    stats.className = "stats";
    stats.innerHTML = `
      <div class="stat-item" data-tip="要素同士を比較した回数">comparisons: <span data-stat="comparisons">0</span></div>
      <div class="stat-item" data-tip="入れ替えが発生した回数">swaps: <span data-stat="swaps">0</span></div>
      <div class="stat-item" data-tip="writeイベントで配列に書き込んだ回数">writes: <span data-stat="writes">0</span></div>
      <div class="stat-item" data-tip="ジェネレータで処理したイベント数">steps: <span data-stat="steps">0</span></div>
    `;

    titleRow.append(statusIcon, title, timeLabel);
    panel.append(titleRow, canvas, stats);
    panelGrid.append(panel);

    const panelObj = {
      key,
      name: algo.name,
      canvas,
      ctx,
      order: [],
      generator: null,
      highlight: null,
      stats: null,
      statEls: {
        comparisons: stats.querySelector("[data-stat='comparisons']"),
        swaps: stats.querySelector("[data-stat='swaps']"),
        writes: stats.querySelector("[data-stat='writes']"),
        steps: stats.querySelector("[data-stat='steps']"),
      },
      statusIcon,
      timeLabel,
    };
    panelObj.order = createSortedOrder();
    resetStats(panelObj);
    panels.push(panelObj);
  });

  renderAll();
}

function createSortedOrder() {
  return pieces.map((_, index) => index);
}

function createShuffledOrder(seed) {
  const rng = mulberry32(seed);
  const order = createSortedOrder();
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function applyOrderToPanels(order) {
  panels.forEach((panel) => {
    panel.order = order.slice();
    panel.generator = null;
    resetStats(panel);
  });
  renderAll();
}

function shuffleAll() {
  if (!layout) {
    return;
  }
  const seed = normalizeSeed(seedInput.value);
  seedInput.value = seed;
  const order = createShuffledOrder(seed);
  applyOrderToPanels(order);
}

function resetAll() {
  if (!layout) {
    return;
  }
  applyOrderToPanels(createSortedOrder());
}

function ensureGenerators() {
  panels.forEach((panel) => {
    if (!panel.generator) {
      const algo = algorithms[panel.key];
      const getKey = (id) => pieces[id].keyIndex;
      panel.generator = algo.generator(panel.order, getKey);
      panel.stats.started = true;
      panel.stats.startTime = performance.now();
    }
  });
}

function stepPanel(panel) {
  if (!panel.generator || panel.stats.done) {
    return;
  }
  const result = panel.generator.next();
  if (result.done) {
    panel.stats.done = true;
    panel.highlight = null;
    panel.stats.elapsed = (performance.now() - panel.stats.startTime) / 1000;
    updateStatsUI(panel);
    return;
  }
  const event = result.value;
  panel.stats.steps += 1;
  if (event.type === "cmp") {
    panel.stats.comparisons += 1;
    panel.highlight = { type: "cmp", indices: [event.i, event.j] };
  } else if (event.type === "swap") {
    panel.stats.swaps += 1;
    panel.highlight = { type: "swap", indices: [event.i, event.j] };
  } else if (event.type === "write") {
    panel.stats.writes += 1;
    panel.highlight = { type: "write", indices: [event.index] };
  }
  if (panel.stats.startTime) {
    panel.stats.elapsed = (performance.now() - panel.stats.startTime) / 1000;
  }
  updateStatsUI(panel);
}

function renderAll() {
  if (!layout) {
    return;
  }
  panels.forEach((panel) => {
    renderPanel(panel.ctx, baseCanvas, pieces, layout, panel.order, panel.highlight);
  });
}

function tick() {
  const now = performance.now();
  const delta = lastTick ? (now - lastTick) / 1000 : 0;
  lastTick = now;
  if (running && layout) {
    ensureGenerators();
    stepCarry += stepsPerSecond * delta;
    const stepsToRun = Math.floor(stepCarry);
    stepCarry -= stepsToRun;
    for (let s = 0; s < stepsToRun; s += 1) {
      panels.forEach(stepPanel);
    }
    renderAll();
    if (panels.length && panels.every((panel) => panel.stats.done)) {
      setRunning(false);
    }
  }
  requestAnimationFrame(tick);
}

function handleFile(file) {
  if (!file) {
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const target = computeTargetSize(img.width, img.height, MAX_W, MAX_H);
    baseCanvas.width = target.width;
    baseCanvas.height = target.height;
    baseCtx.clearRect(0, 0, target.width, target.height);
    baseCtx.drawImage(img, 0, 0, target.width, target.height);
    applyDefaultTileGrid();
    createPieces();
    buildPanels();
    resetAll();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function loadDefaultImage() {
  const img = new Image();
  img.onload = () => {
    const target = computeTargetSize(img.width, img.height, MAX_W, MAX_H);
    baseCanvas.width = target.width;
    baseCanvas.height = target.height;
    baseCtx.clearRect(0, 0, target.width, target.height);
    baseCtx.drawImage(img, 0, 0, target.width, target.height);
    applyDefaultTileGrid();
    createPieces();
    buildPanels();
    seedInput.value = randomSeed();
    shuffleAll();
  };
  img.src = "sample-pastel-image.jpg";
}

fileInput.addEventListener("change", (event) => {
  handleFile(event.target.files[0]);
});

modeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    setRunning(false);
    updateModeUI();
    if (layout) {
      if (getMode() === "tiles") {
        applyDefaultTileGrid();
      }
      createPieces();
      buildPanels();
      resetAll();
    }
  });
});

stripeCount.addEventListener("input", () => {
  stripeCountLabel.textContent = stripeCount.value;
  if (layout) {
    setRunning(false);
    createPieces();
    buildPanels();
    resetAll();
  }
});

tileCols.addEventListener("input", () => {
  tileColsLabel.textContent = tileCols.value;
  tileTotalLabel.textContent = String(Number(tileCols.value) * Number(tileRows.value));
  if (layout) {
    setRunning(false);
    createPieces();
    buildPanels();
    resetAll();
  }
});

tileRows.addEventListener("input", () => {
  tileRowsLabel.textContent = tileRows.value;
  tileTotalLabel.textContent = String(Number(tileCols.value) * Number(tileRows.value));
  if (layout) {
    setRunning(false);
    createPieces();
    buildPanels();
    resetAll();
  }
});

algoList.addEventListener("change", () => {
  if (layout) {
    setRunning(false);
    buildPanels();
    resetAll();
  }
});

seedRandom.addEventListener("click", () => {
  seedInput.value = randomSeed();
});

shuffleBtn.addEventListener("click", () => {
  setRunning(false);
  shuffleAll();
});

startBtn.addEventListener("click", () => {
  if (!layout || panels.length === 0) {
    return;
  }
  setRunning(!running);
});

resetBtn.addEventListener("click", () => {
  setRunning(false);
  resetAll();
});

speedRange.addEventListener("input", () => {
  stepsPerSecond = Number(speedRange.value);
  speedLabel.textContent = speedRange.value;
});

updateModeUI();
stripeCountLabel.textContent = stripeCount.value;
tileColsLabel.textContent = tileCols.value;
tileRowsLabel.textContent = tileRows.value;
tileTotalLabel.textContent = String(Number(tileCols.value) * Number(tileRows.value));
speedLabel.textContent = speedRange.value;

requestAnimationFrame(tick);
loadDefaultImage();
