export default async function handler(req, res) {
  const base = process.env.RECOMMENDATIONS_API_BASE || 'http://127.0.0.1:8000';

  const url = new URL(req.url, 'http://localhost');
  const pathParts = Array.isArray(req.query?.path)
    ? req.query.path
    : typeof req.query?.path === 'string'
      ? [req.query.path]
      : [];

  url.searchParams.delete('path');
  const targetUrl = `${base.replace(/\/$/, '')}/${pathParts.map(encodeURIComponent).join('/')}${url.search}`;

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        accept: req.headers.accept || 'application/json'
      }
    });

    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    res.statusCode = upstreamResponse.status;

    const body = Buffer.from(await upstreamResponse.arrayBuffer());
    res.end(body);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Bad gateway' }));
  }
}
