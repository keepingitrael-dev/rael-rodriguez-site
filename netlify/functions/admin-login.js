const { sign, safeCompare } = require('./_shared/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Admin password is not configured' }) };
  }

  const provided = body.password || '';
  if (!provided || !safeCompare(provided, expected)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password' }) };
  }

  const token = sign({ role: 'admin' });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  };
};
