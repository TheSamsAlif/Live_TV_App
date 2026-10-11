import fs from 'fs';

async function fetchAndTestM3U(url, maxPerCategory = 8) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.split('\n');
    const items = [];
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
          group: groupMatch ? groupMatch[1] : ''
        };
      } else if (l && !l.startsWith('#')) {
        cur.url = l;
        items.push({ ...cur });
        cur = {};
      }
    }

    const working = [];
    for (const item of items) {
      if (working.length >= maxPerCategory) break;
      // Skip geo-blocked or obvious dead hosts
      if (item.name.includes('[Geo-blocked]') || item.url.includes('geo-blocked')) continue;
      try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 3000);
        const r = await fetch(item.url, {
          signal: c.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        clearTimeout(t);
        if (r.ok) {
          working.push(item);
          console.log('✅ Found working:', item.name, 'in', url);
        }
      } catch {}
    }
    return working;
  } catch (e) {
    console.error('Error fetching', url, e.message);
    return [];
  }
}

async function main() {
  const sources = [
    { cat: 'Sports', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { cat: 'News', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
    { cat: 'Entertainment', url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u' },
    { cat: 'Music', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
    { cat: 'Movies', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { cat: 'Kids', url: 'https://iptv-org.github.io/iptv/categories/kids.m3u' },
    { cat: 'Religious', url: 'https://iptv-org.github.io/iptv/categories/religious.m3u' },
    { cat: 'Documentary', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' },
  ];

  // Load already verified channels
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync('public/channels.json', 'utf8'));
  } catch {}

  console.log(`Starting with ${existing.length} existing channels...`);

  for (const s of sources) {
    console.log(`Searching for working channels in ${s.cat}...`);
    const found = await fetchAndTestM3U(s.url, 10);
    for (const f of found) {
      if (!existing.some(e => e.url === f.url || e.name === f.name)) {
        existing.push({
          id: 'ch-' + Math.random().toString(36).substring(2, 9),
          name: f.name.replace(/ \(\d+p\)/, ''),
          group: s.cat,
          url: f.url,
          logo: f.logo,
          type: 'stream',
          status: 'active',
          is8k: true
        });
      }
    }
  }

  console.log(`\nTotal verified channels across all categories: ${existing.length}`);
  fs.writeFileSync('public/channels.json', JSON.stringify(existing, null, 2));
  console.log('Saved to public/channels.json!');
}

main();
