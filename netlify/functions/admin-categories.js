const crypto = require('crypto');
const { requireAdmin } = require('./_shared/auth');
const { initStore, loadCategories, saveCategories, loadEntries } = require('./_shared/store');
const { sumEntriesByCategory } = require('./_shared/aggregate');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return unauthorized();

  try {
    const store = initStore(event);

    if (event.httpMethod === 'GET') {
      const [categories, entries] = await Promise.all([loadCategories(store), loadEntries(store)]);
      const directTotals = sumEntriesByCategory(entries);
      const withTotals = categories.map((c) => ({ ...c, directTotal: directTotals.get(c.id) || 0 }));
      return ok({ categories: withTotals });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const name = (body.name || '').trim();
      const parentId = body.parentId || null;
      if (!name) return badRequest('Category name is required');

      const categories = await loadCategories(store);
      const newCategory = { id: crypto.randomUUID(), name, parentId, createdAt: new Date().toISOString() };
      categories.push(newCategory);
      await saveCategories(store, categories);
      return ok({ category: newCategory });
    }

    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const id = body.id;
      const name = (body.name || '').trim();
      if (!id || !name) return badRequest('Category id and name are required');

      const categories = await loadCategories(store);
      const target = categories.find((c) => c.id === id);
      if (!target) return badRequest('Category not found');
      target.name = name;
      await saveCategories(store, categories);
      return ok({ category: target });
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return badRequest('Category id is required');

      const [categories, entries] = await Promise.all([loadCategories(store), loadEntries(store)]);
      const hasChildren = categories.some((c) => c.parentId === id);
      const hasEntries = entries.some((e) => e.categoryId === id);
      if (hasChildren) return badRequest('This category still has subcategories. Move or remove those first.');
      if (hasEntries) return badRequest('This category still has entries logged against it. Remove or reassign those first.');

      const remaining = categories.filter((c) => c.id !== id);
      await saveCategories(store, remaining);
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
