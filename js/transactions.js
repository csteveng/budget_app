// transactions.js
// Business logic and in-memory state for transactions.
// No DOM manipulation lives here — see app.js for that.

import { loadTransactions, saveTransactions } from "./storage.js";

export const CATEGORIES = {
  expense: ["Food", "Rent/Housing", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"],
  income: ["Salary", "Freelance", "Investments", "Gifts", "Other"],
};

// In-memory cache of the full transaction list, kept in sync with localStorage.
let transactions = loadTransactions();

/** Returns the full, unfiltered list of transactions (most recent first). */
export function getAllTransactions() {
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Adds a new transaction and persists it.
 * @param {{type: 'expense'|'income', amount: number, category: string, description: string, date: string}} input
 * @returns {Object} the created transaction, including its generated id
 */
export function addTransaction(input) {
  const transaction = {
    id: generateId(),
    type: input.type,
    amount: Math.round(Number(input.amount) * 100) / 100,
    category: input.category,
    description: input.description.trim(),
    date: input.date,
  };

  transactions.push(transaction);
  saveTransactions(transactions);
  return transaction;
}

/**
 * Removes a transaction by id and persists the change.
 * @param {string} id
 */
export function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions(transactions);
}

/**
 * Filters transactions by type, category, free text, and date range.
 * @param {{type?: string, category?: string, text?: string, dateFrom?: string, dateTo?: string}} filters
 * @returns {Array<Object>}
 */
export function filterTransactions(filters = {}) {
  const { type = "all", category = "all", text = "", dateFrom = "", dateTo = "" } = filters;
  const needle = text.trim().toLowerCase();

  return getAllTransactions().filter((t) => {
    if (type !== "all" && t.type !== type) return false;
    if (category !== "all" && t.category !== category) return false;
    if (needle && !t.description.toLowerCase().includes(needle)) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });
}

/** Computes total income, total expense, and net balance across ALL transactions. */
export function getSummary() {
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return {
    income: round2(totals.income),
    expense: round2(totals.expense),
    balance: round2(totals.income - totals.expense),
  };
}

/** Sums expense amounts grouped by category, for the chart. Only non-zero categories are returned. */
export function getExpenseByCategory() {
  const sums = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    sums[t.category] = round2((sums[t.category] || 0) + t.amount);
  }
  return sums;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
