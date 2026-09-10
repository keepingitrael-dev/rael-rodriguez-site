const { requireAdmin } = require('./_shared/auth');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return unauthorized();

  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.SITE_ID;
  if (!token || !siteId) return serverError('Form inbox is not configured');

  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Netlify API returned ${res.status}`);

    const submissions = await res.json();
    const shaped = submissions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50)
      .map((s) => ({
        id: s.id,
        form: s.form_name || s.name || 'form',
        data: s.data || {},
        createdAt: s.created_at
      }));

    return ok({ submissions: shaped });
  } catch (err) {
    console.error(err);
    return serverError('Unable to load form submissions right now');
  }
};

function jsonHeaders() { return { 'Content-Type': 'application/json' }; }
function ok(data) { return { statusCode: 200, headers: jsonHeaders(), body: JSON.stringify(data) }; }
function unauthorized() { return { statusCode: 401, headers: jsonHeaders(), body: JSON.stringify({ error: 'Not authorized' }) }; }
function serverError(message) { return { statusCode: 500, headers: jsonHeaders(), body: JSON.stringify({ error: message || 'Something went wrong' }) }; }
