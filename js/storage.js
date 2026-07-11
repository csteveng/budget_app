// storage.js
// The ONLY module that talks to localStorage.
// Everything else should go through the functions exported here.

const STORAGE_KEY = "budget_app_transactions";
const STORAGE_VERSION = 1; // bump this if the data shape changes, and add a migration below

/**
 * Reads all transactions from localStorage.
 * Returns an empty array if nothing is stored yet, or if the stored data is corrupt.
 * @returns {Array<Object>}
 */
export function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Support a plain-array legacy shape as well as a versioned wrapper,
    // in case we introduce { version, data } later.
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.data)) return migrate(parsed);

    return [];
  } catch (err) {
    console.error("Failed to read transactions from localStorage:", err);
    return [];
  }
}

/**
 * Persists the full transactions array to localStorage.
 * @param {Array<Object>} transactions
 */
export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error("Failed to save transactions to localStorage:", err);
  }
}

/**
 * Placeholder for future schema migrations.
 * Currently a no-op that just returns the data array.
 */
function migrate(wrapped) {
  if (wrapped.version === STORAGE_VERSION) return wrapped.data;
  // Future migrations would branch on wrapped.version here.
  return wrapped.data;
}
