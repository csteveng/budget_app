// transactions.js
// Business logic and in-memory state for transactions.
// No DOM manipulation lives here — see app.js for that.

import { loadTransactions, saveTransactions } from "./storage.js";

export const CATEGORIES = {
  expense: ["Food", "Rent/Housing", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"],
  income: ["Salary", "Freelance", "Investments", "Gifts", "Other"],
};

// Sample data used to seed a fresh install so the app isn't empty on first load.
// Ids are fixed strings (not generated) so this stays stable/predictable.
const SAMPLE_TRANSACTIONS = [
  { id: "sample-1",  type: "income",  amount: 3200.00, category: "Salary",       description: "Monthly paycheck",     date: "2026-07-01" },
  { id: "sample-2",  type: "expense", amount: 1450.00, category: "Rent/Housing", description: "July rent",            date: "2026-07-01" },
  { id: "sample-3",  type: "expense", amount: 35.00,   category: "Health",       description: "Pharmacy",             date: "2026-07-02" },
  { id: "sample-4",  type: "expense", amount: 120.75,  category: "Utilities",    description: "Electric bill",        date: "2026-07-03" },
  { id: "sample-5",  type: "expense", amount: 89.99,   category: "Shopping",     description: "New shoes",            date: "2026-07-04" },
  { id: "sample-6",  type: "income",  amount: 450.00,  category: "Freelance",    description: "Logo design project",  date: "2026-07-05" },
  { id: "sample-7",  type: "expense", amount: 28.99,   category: "Entertainment",description: "Movie night",          date: "2026-07-06" },
  { id: "sample-8",  type: "expense", amount: 45.00,   category: "Transport",   description: "Gas fill-up",          date: "2026-07-07" },
  { id: "sample-9",  type: "expense", amount: 62.40,   category: "Food",        description: "Groceries",            date: "2026-07-08" },
  { id: "sample-10", type: "income",  amount: 3200.00, category: "Salary",       description: "Monthly paycheck",     date: "2026-06-01" },
  { id: "sample-11", type: "expense", amount: 95.20,   category: "Food",        description: "Groceries",            date: "2026-06-10" },
  { id: "sample-12", type: "expense", amount: 210.00,  category: "Shopping",     description: "Birthday present",     date: "2026-06-12" },
  { id: "sample-13", type: "income",  amount: 100.00,  category: "Gifts",       description: "Birthday gift from mom",date: "2026-06-15" },
  { id: "sample-14", type: "expense", amount: 65.00,   category: "Utilities",    description: "Internet bill",        date: "2026-06-18" },
  { id: "sample-15", type: "income",  amount: 85.32,   category: "Investments",  description: "Dividend payout",      date: "2026-06-20" },
  { id: "sample-16", type: "expense", amount: 15.99,   category: "Entertainment",description: "Streaming subscription",date: "2026-06-22" },
  { id: "sample-17", type: "expense", amount: 32.00,   category: "Transport",   description: "Uber rides",           date: "2026-06-25" },
  { id: "sample-18", type: "expense", amount: 18.50,   category: "Food",        description: "Coffee & lunch",       date: "2026-06-28" },
];

// In-memory cache of the full transaction list, kept in sync with localStorage.
let transactions = loadTransactions();

// Seed sample data on first run only (i.e. localStorage was empty).
if (transactions.length === 0) {
  transactions = SAMPLE_TRANSACTIONS.map((t) => ({ ...t }));
  saveTransactions(transactions);
}

/** Returns the full, unfiltered list of transactions (most recent first). */
export function getAllTransactions() {
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Replaces all current transactions with the built-in sample set.
 * Useful for demos or resetting state during development.
 */
export function loadSampleData() {
  transactions = SAMPLE_TRANSACTIONS.map((t) => ({ ...t }));
  saveTransactions(transactions);
  return transactions;
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