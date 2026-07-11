// app.js
// App init + DOM manipulation + event wiring.
// Business logic lives in transactions.js; this file only touches the DOM.

import {
  CATEGORIES,
  addTransaction,
  removeTransaction,
  filterTransactions,
  getSummary,
  getExpenseByCategory,
} from "./transactions.js";
import { renderCategoryChart } from "./charts.js";

// --- Element refs ---
const form = document.getElementById("transactionForm");
const typeToggles = document.querySelectorAll(".type-toggle");
const typeInput = document.getElementById("transactionType");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const totalBalanceEl = document.getElementById("totalBalance");

const chartCanvas = document.getElementById("categoryChart");
const chartEmptyNote = document.getElementById("chartEmptyNote");

const searchText = document.getElementById("searchText");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const filterDateFrom = document.getElementById("filterDateFrom");
const filterDateTo = document.getElementById("filterDateTo");
const clearFiltersBtn = document.getElementById("clearFilters");

const transactionList = document.getElementById("transactionList");
const listEmptyNote = document.getElementById("listEmptyNote");
const rowTemplate = document.getElementById("transactionRowTemplate");

// --- Init ---
init();

function init() {
  populateCategoryOptions(typeInput.value);
  populateFilterCategoryOptions();
  dateInput.value = todayISO();

  wireTypeToggles();
  wireForm();
  wireFilters();

  renderAll();
}

function wireTypeToggles() {
  typeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      typeToggles.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      typeInput.value = btn.dataset.type;
      populateCategoryOptions(btn.dataset.type);
    });
  });
}

function wireForm() {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!amountInput.value || Number(amountInput.value) <= 0) {
      amountInput.focus();
      return;
    }
    if (!descriptionInput.value.trim()) {
      descriptionInput.focus();
      return;
    }

    addTransaction({
      type: typeInput.value,
      amount: amountInput.value,
      category: categorySelect.value,
      description: descriptionInput.value,
      date: dateInput.value || todayISO(),
    });

    form.reset();
    dateInput.value = todayISO();
    populateCategoryOptions(typeInput.value);
    populateFilterCategoryOptions();
    renderAll();
  });
}

function wireFilters() {
  [searchText, filterType, filterCategory, filterDateFrom, filterDateTo].forEach((el) => {
    el.addEventListener("input", renderTransactionList);
  });

  clearFiltersBtn.addEventListener("click", () => {
    searchText.value = "";
    filterType.value = "all";
    filterCategory.value = "all";
    filterDateFrom.value = "";
    filterDateTo.value = "";
    renderTransactionList();
  });
}

// --- Rendering ---

function renderAll() {
  renderSummary();
  renderChart();
  renderTransactionList();
}

function renderSummary() {
  const { income, expense, balance } = getSummary();
  totalIncomeEl.textContent = formatCurrency(income);
  totalExpenseEl.textContent = formatCurrency(expense);
  totalBalanceEl.textContent = formatCurrency(balance);
}

function renderChart() {
  const dataByCategory = getExpenseByCategory();
  const hasData = Object.keys(dataByCategory).length > 0;

  chartCanvas.style.display = hasData ? "block" : "none";
  chartEmptyNote.classList.toggle("visible", !hasData);

  if (hasData) renderCategoryChart(chartCanvas, dataByCategory);
}

function renderTransactionList() {
  const filtered = filterTransactions({
    type: filterType.value,
    category: filterCategory.value,
    text: searchText.value,
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  });

  transactionList.innerHTML = "";
  listEmptyNote.classList.toggle("visible", filtered.length === 0);

  for (const t of filtered) {
    transactionList.appendChild(buildRow(t));
  }
}

function buildRow(t) {
  const node = rowTemplate.content.cloneNode(true);
  const li = node.querySelector(".transaction-row");

  li.dataset.id = t.id;
  li.dataset.type = t.type;

  const badge = node.querySelector(".tx-icon-badge");
  badge.textContent = t.type === "income" ? "+" : "\u2212";

  node.querySelector(".tx-description").textContent = t.description;
  node.querySelector(".tx-category").textContent = t.category;
  node.querySelector(".tx-date").textContent = formatDate(t.date);

  const amountEl = node.querySelector(".tx-amount");
  const sign = t.type === "income" ? "+" : "\u2212";
  amountEl.textContent = `${sign}${formatCurrency(t.amount)}`;

  node.querySelector(".tx-remove").addEventListener("click", () => {
    removeTransaction(t.id);
    populateFilterCategoryOptions();
    renderAll();
  });

  return node;
}

// --- Helpers ---

function populateCategoryOptions(type) {
  const options = CATEGORIES[type] || [];
  categorySelect.innerHTML = options.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function populateFilterCategoryOptions() {
  const allCategories = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])].sort();
  const current = filterCategory.value;

  filterCategory.innerHTML =
    `<option value="all">All categories</option>` +
    allCategories.map((c) => `<option value="${c}">${c}</option>`).join("");

  filterCategory.value = allCategories.includes(current) ? current : "all";
}

function formatCurrency(n) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
