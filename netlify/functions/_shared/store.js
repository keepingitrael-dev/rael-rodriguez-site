const crypto = require('crypto');
const { connectLambda, getStore } = require('@netlify/blobs');

const STORE_NAME = 'income-tracker';
const CATEGORIES_KEY = 'categories';
const ENTRIES_KEY = 'entries';

// Call once per function invocation, before touching the store.
function initStore(event) {
  connectLambda(event);
  // NOTE: consistency: 'strong' is intentionally omitted. It requires an
  // `uncachedEdgeURL`, which connectLambda() never populates (it only sets
  // edgeURL/siteID/token/deployID) — requesting it here made every read
  // throw BlobsConsistencyError in the deployed environment. Default
  // ("eventual") consistency is what actually works with connectLambda.
  return getStore({ name: STORE_NAME });
}

function defaultCategories() {
  const now = new Date().toISOString();
  return [
    { id: crypto.randomUUID(), name: 'Salary Income', parentId: null, createdAt: now },
    { id: crypto.randomUUID(), name: 'YouTube Ad Revenue', parentId: null, createdAt: now },
    { id: crypto.randomUUID(), name: 'Benefits Income', parentId: null, createdAt: now },
    { id: crypto.randomUUID(), name: 'Education Stipend', parentId: null, createdAt: now }
  ];
}

// Returns [] if entries have never been written. Returns the seeded
// defaults (and writes them once) the very first time categories are
// touched. After that, an intentionally emptied list stays empty.
async function loadCategories(store) {
  const data = await store.get(CATEGORIES_KEY, { type: 'json' });
  if (data === null) {
    const seeded = defaultCategories();
    await store.setJSON(CATEGORIES_KEY, seeded);
    return seeded;
  }
  return data;
}

async function saveCategories(store, categories) {
  await store.setJSON(CATEGORIES_KEY, categories);
}

async function loadEntries(store) {
  const data = await store.get(ENTRIES_KEY, { type: 'json' });
  return data || [];
}

async function saveEntries(store, entries) {
  await store.setJSON(ENTRIES_KEY, entries);
}

module.exports = { initStore, loadCategories, saveCategories, loadEntries, saveEntries };
