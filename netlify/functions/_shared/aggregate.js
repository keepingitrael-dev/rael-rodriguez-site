function buildTree(categories) {
  const byId = new Map(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots = [];

  for (const cat of byId.values()) {
    if (cat.parentId && byId.has(cat.parentId)) {
      byId.get(cat.parentId).children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return { roots, byId };
}

function sumEntriesByCategory(entries) {
  const map = new Map();
  for (const e of entries) {
    map.set(e.categoryId, (map.get(e.categoryId) || 0) + Number(e.amount));
  }
  return map;
}

function totalForNode(node, directTotals) {
  let sum = directTotals.get(node.id) || 0;
  for (const child of node.children) {
    sum += totalForNode(child, directTotals);
  }
  return sum;
}

module.exports = { buildTree, sumEntriesByCategory, totalForNode };
