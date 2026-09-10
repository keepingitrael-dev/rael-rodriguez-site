const crypto = require('crypto');
const { requireAdmin } = require('./_shared/auth');
const { initStore, loadCategories, loadEntries, saveEntries } = require('./_shared/store');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return unauthorized();

  try {
    const store = initStore(event);

    if (event.httpMethod === 'GET') {
      const [entries, categories] = await Promise.all([loadEntries(store), loadCategories(store)]);
      const nameById = new Map(categories.map((c) => [c.id, c.name]));
      const sorted = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 200);
      const shaped = sorted.map((e) => ({
        id: e.id,
        categoryId: e.categoryId,
        categoryName: nameById.get(e.categoryId) || 'Unknown category',
        amount: Number(e.amount),
        date: e.date,
        note: e.note || null,
        createdAt: e.createdAt,
        editedAt: e.editedAt || null
      }));
      return ok({ entries: shaped });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const categoryId = body.categoryId;
      const amount = Number(body.amount);
      const date = body.date || new Date().toISOString().slice(0, 10);
      const note = body.note ? String(body.note).slice(0, 500) : null;

      if (!categoryId) return badRequest('Choose a category');
      if (!Number.isFinite(amount) || amount <= 0) return badRequest('Enter a dollar amount greater than zero');

      const categories = await loadCategories(store);
      if (!categories.some((c) => c.id === categoryId)) return badRequest('That category no longer exists');

      const entries = await loadEntries(store);
      const newEntry = {
        id: crypto.randomUUID(),
        categoryId,
        amount,
        date,
        note,
        createdAt: new Date().toISOString()
      };
      entries.push(newEntry);
      await saveEntries(store, entries);
      return ok({ entry: newEntry });
    }

    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const id = body.id;
      if (!id) return badRequest('Entry id is required');

      const entries = await loadEntries(store);
      const target = entries.find((e) => e.id === id);
      if (!target) return badRequest('Entry not found');

      if (body.categoryId) target.categoryId = body.categoryId;
      if (body.amount !== undefined) {
        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || amount <= 0) return badRequest('Enter a dollar amount greater than zero');
        target.amount = amount;
      }
      if (body.date) target.date = body.date;
      if (body.note !== undefined) target.note = body.note ? String(body.note).slice(0, 500) : null;
      target.editedAt = new Date().toISOString();

      await saveEntries(store, entries);
      return ok({ entry: target });
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return badRequest('Entry id is required');

      const entries = await loadEntries(store);
      const remaining = entries.filter((e) => e.id !== id);
      if (remaining.length === entries.length) return badRequest('Entry not found');
      await saveEntries(store, remaining);
      return ok({ deleted: true });
    }

    return methodNotAllowed();
  } catch (err) {
    console.error(err);
    return serverError();
  }
};

function jsonHeaders() { return { 'Content-Type': 'application/json' }; }
function ok(data) { return { statusCode: 200, headers: jsonHeaders(), body: JSON.stringify(data) }; }
function badRequest(message) { return { statusCode: 400, headers: jsonHeaders(), body: JSON.stringify({ error: message }) }; }
function unauthorized() { return { statusCode: 401, headers: jsonHeaders(), body: JSON.stringify({ error: 'Not authorized' }) }; }
function methodNotAllowed() { return { statusCode: 405, headers: jsonHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }; }
function serverError() { return { statusCode: 500, headers: jsonHeaders(), body: JSON.stringify({ error: 'Something went wrong' }) }; }
