import fs from 'fs';

async function testBD() {
  const res = await fetch('https://iptv-org.github.io/iptv/countries/bd.m3u');
  const text = await res.text();
  const lines = text.split('\n');
  const channels = [];
  let cur = {};
  for (let l of lines) {
    l = l.trim();
    if (l.startsWith('#EXTINF:')) {
      const parts = l.split(',');
      const name = parts.slice(1).join(',').trim() || 'Unknown';
      const logoMatch = l.match(/tvg-logo="([^"]+)"/);
      const groupMatch = l.match(/group-title="([^"]+)"/);
      cur = {
        name,
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : 'Bangla'
      };
    } else if (l && !l.startsWith('#')) {
      cur.url = l;
      channels.push({ ...cur });
      cur = {};
    }
  }
  console.log('Total BD channels parsed:', channels.length);

  const results = [];
  for (const ch of channels) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 3500);
      const r = await fetch(ch.url, {
        signal: c.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(t);
      if (r.ok) {
        console.log('✅ OK:', ch.name, ch.url);
        results.push({ ...ch, status: 'ok' });
      } else {
        console.log('❌ HTTP', r.status, ch.name);
      }
    } catch (e) {
      console.log('❌ ERR:', ch.name, e.message);
    }
  }
  console.log(`\nWorking BD channels: ${results.length} / ${channels.length}`);
}

testBD();
