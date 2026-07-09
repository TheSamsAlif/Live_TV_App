import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

async function handleProxyRequest(req, res, next) {
  if (!req.url?.startsWith('/api/proxy')) {
    next();
    return;
  }

  const requestUrl = new URL(req.url, 'http://127.0.0.1');
  const targetUrl = requestUrl.searchParams.get('url');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', 'GET, OPTIONS');
    res.setHeader('access-control-allow-headers', '*');
    res.end();
    return;
  }

  if (!targetUrl) {
    res.statusCode = 400;
    res.setHeader('content-type', 'application/json');
    res.setHeader('access-control-allow-origin', '*');
    res.end(JSON.stringify({ error: 'url parameter is required' }));
    return;
  }

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        'Accept': '*/*',
        'Origin': requestUrl.origin,
        'Referer': requestUrl.toString(),
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      res.statusCode = 502;
      res.setHeader('content-type', 'application/json');
      res.setHeader('access-control-allow-origin', '*');
      res.end(JSON.stringify({ error: `Source returned ${response.status}` }));
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    const isM3U = /\bmpegurl\b/.test(contentType) || /\.m3u8?($|\?)/.test(targetUrl);
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': '*',
    };

    if (isM3U) {
      let text = await response.text();
      text = text.replace(/^([^#\s].+)$/gm, (match) => {
        const trimmed = match.trim();
        if (!trimmed || trimmed.startsWith('#')) return trimmed;
        try {
          const resolved = trimmed.startsWith('http') ? trimmed : new URL(trimmed, baseUrl).href;
          return `/api/proxy?url=${encodeURIComponent(resolved)}`;
        } catch {
          return trimmed;
        }
      });

      res.statusCode = 200;
      res.setHeader('cache-control', 'no-cache');
      res.setHeader('content-type', 'application/vnd.apple.mpegurl');
      Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
      res.end(text);
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    res.statusCode = 200;
    res.setHeader('cache-control', 'public, max-age=3600');
    res.setHeader('content-type', contentType.split(';')[0] || 'application/octet-stream');
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Source timed out (15s)' : error?.message || 'Unknown error';
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.setHeader('access-control-allow-origin', '*');
    res.end(JSON.stringify({ error: `Cannot reach source: ${message}` }));
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-api-proxy',
      configureServer(server) {
        server.middlewares.use(handleProxyRequest);
      },
    },
  ],
})
