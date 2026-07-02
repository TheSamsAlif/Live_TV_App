export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const isM3U8 = contentType.includes('mpegurl') || contentType.includes('x-mpegurl') || url.endsWith('.m3u8');

    if (isM3U8) {
      let text = await response.text();
      text = text.replace(/^([^#\s].+)$/gm, (match) => {
        match = match.trim();
        if (!match) return match;
        try {
          const resolved = match.startsWith('http') ? match : new URL(match, baseUrl).href;
          return `/api/proxy?url=${encodeURIComponent(resolved)}`;
        } catch {
          return match;
        }
      });
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.status(200).send(text);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (contentType) res.setHeader('Content-Type', contentType);
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
