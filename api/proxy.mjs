export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(502).json({ error: `Source returned ${response.status}: ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type') || '';
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const isM3U = contentType.includes('mpegurl') || contentType.includes('x-mpegurl') || url.match(/\.m3u8?(\?|$)/);

    if (isM3U) {
      let text = await response.text();
      // Rewrite relative URLs in M3U manifest to go through proxy
      text = text.replace(/^([^#\s].+)$/gm, (match) => {
        match = match.trim();
        if (!match || match.startsWith('#') || match.startsWith('http://') || match.startsWith('https://')) return match;
        try {
          const resolved = new URL(match, baseUrl).href;
          return `/api/proxy?url=${encodeURIComponent(resolved)}`;
        } catch {
          return match;
        }
      });
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(text);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (contentType) res.setHeader('Content-Type', contentType.split(';')[0]);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    if (err.name === 'AbortError') {
      res.status(504).json({ error: 'Source server timed out (15s)' });
    } else {
      res.status(502).json({ error: err.message });
    }
  }
}