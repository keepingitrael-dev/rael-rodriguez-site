const { initStore, loadCategories, loadEntries } = require('./_shared/store');
const { buildTree, sumEntriesByCategory, totalForNode } = require('./_shared/aggregate');

exports.handler = async (event) => {
  try {
    const store = initStore(event);
    const [categories, entries] = await Promise.all([loadCategories(store), loadEntries(store)]);

    const { roots } = buildTree(categories);
    const directTotals = sumEntriesByCategory(entries);

    // Only names and order survive into the response — the totals used to
    // sort are computed here and then discarded.
    const rankedCategories = roots
      .map((node) => ({ name: node.name, total: totalForNode(node, directTotals) }))
      .sort((a, b) => b.total - a.total)
      .map((c) => c.name);

    const total = entries.reduce((sum, e) => sum + Number(e.amount), 0);

    const goal = Number(process.env.GOAL_AMOUNT || 500000);
    const startDate = new Date(process.env.CHALLENGE_START_DATE || '2026-08-01T00:00:00Z');
    const endDate = new Date(process.env.CHALLENGE_END_DATE || '2027-08-01T23:59:59Z');
    const now = new Date();

    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, (endDate - startDate) / dayMs);
    const elapsedDays = Math.min(totalDays, Math.max(1, (now - startDate) / dayMs));
    const dailyRate = total / elapsedDays;
    const projectedTotal = now >= endDate ? total : total + dailyRate * (totalDays - elapsedDays);
    const percentage = goal > 0 ? (total / goal) * 100 : 0;

    const payload = {
      total: round2(total),
      goal,
      percentage: round2(percentage),
      pace: {
        projectedTotal: round2(projectedTotal),
        targetDate: formatDate(endDate)
      },
      rankedCategories,
      lastUpdated: now.toISOString()
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(payload)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unable to load progress data right now' })
    };
  }
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
