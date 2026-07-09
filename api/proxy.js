export const config = { runtime: 'edge' };

export default async function handler(req) {
  const urlObj = new URL(req.url);
  const url = urlObj.searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'url parameter is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': '*' },
    });
  }

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        'Accept': '*/*',
        'Origin': new URL(req.url).origin,
        'Referer': req.url,
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Source returned ${response.status}` }), {
        status: 502,
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const isM3U = /\bmpegurl\b/.test(contentType) || /\.m3u8?($|\?)/.test(url);

    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': '*',
    };

    if (isM3U) {
      let text = await response.text();
      text = text.replace(/^([^#\s].+)$/gm, (match) => {
        match = match.trim();
        if (!match || match.startsWith('#')) return match;
        try {
          const resolved = match.startsWith('http') ? match : new URL(match, baseUrl).href;
          return `/api/proxy?url=${encodeURIComponent(resolved)}`;
        } catch {
          return match;
        }
      });
      return new Response(text, {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/vnd.apple.mpegurl', 'cache-control': 'no-cache' },
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: { ...corsHeaders, 'content-type': contentType.split(';')[0] || 'application/octet-stream', 'cache-control': 'public, max-age=3600' },
    });
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'Source timed out (15s)' : err.message;
    return new Response(JSON.stringify({ error: `Cannot reach source: ${msg}` }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    });
  }
}