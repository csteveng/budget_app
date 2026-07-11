// charts.js
// Lightweight, dependency-free <canvas> bar chart of spending by category.
// No external charting library is used (see CLAUDE.md "Open Items").

const NAVY = "#1B2A56";
const ORANGE = "#F2994A";
const MUTED = "#D9DCE3";

/**
 * Renders a horizontal bar chart of expense totals by category.
 * @param {HTMLCanvasElement} canvas
 * @param {Object<string, number>} dataByCategory - e.g. { Food: 120.5, Rent: 900 }
 */
export function renderCategoryChart(canvas, dataByCategory) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = canvas.clientHeight || canvas.height;

  // Crisp rendering on high-DPI screens.
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const entries = Object.entries(dataByCategory).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return;

  const maxValue = Math.max(...entries.map(([, v]) => v));
  const paddingLeft = 96;
  const paddingRight = 56;
  const rowHeight = Math.min(32, (cssHeight - 16) / entries.length);
  const barMaxWidth = cssWidth - paddingLeft - paddingRight;
  const gap = 10;

  ctx.font = "600 12px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  entries.forEach(([category, value], i) => {
    const y = 8 + i * (rowHeight + gap);
    const barWidth = maxValue > 0 ? (value / maxValue) * barMaxWidth : 0;

    // Track (background)
    ctx.fillStyle = MUTED;
    roundRect(ctx, paddingLeft, y, barMaxWidth, rowHeight, 6);
    ctx.fill();

    // Value bar
    ctx.fillStyle = ORANGE;
    roundRect(ctx, paddingLeft, y, Math.max(barWidth, 4), rowHeight, 6);
    ctx.fill();

    // Category label (left)
    ctx.fillStyle = NAVY;
    ctx.textAlign = "right";
    ctx.fillText(truncate(category, 12), paddingLeft - 10, y + rowHeight / 2);

    // Value label (right of bar)
    ctx.textAlign = "left";
    ctx.fillText(`$${value.toFixed(2)}`, paddingLeft + barMaxWidth + 8, y + rowHeight / 2);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, height / 2, width / 2 > 0 ? width / 2 : radius);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function truncate(str, max) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
