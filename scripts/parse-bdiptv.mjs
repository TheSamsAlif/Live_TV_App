import fs from 'fs';

async function parseBDIptv() {
  const res = await fetch('http://tv.bdiptv.net/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/bdiptv.html', html);

  console.log('HTML saved. Analyzing links and streams...');

  // Match links, video tags, sources, m3u8, channels
  const m3u8Matches = [...html.matchAll(/(https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*)/gi)].map(m => m[1]);
  console.log('M3U8 streams found:', m3u8Matches.length, m3u8Matches.slice(0, 5));

  // Match href links
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  const channelLinks = hrefs.filter(h => h.includes('play') || h.includes('channel') || h.includes('tv') || h.includes('.php'));
  console.log('Interesting href links count:', channelLinks.length, channelLinks.slice(0, 10));

  // Match channel cards or images
  const cards = [];
  // Look for <a> tags with text and img
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = aRegex.exec(html)) !== null) {
    const href = match[1];
    const inner = match[2];
    const imgMatch = inner.match(/src=["']([^"']+)["']/i);
    const textMatch = inner.replace(/<[^>]+>/g, '').trim();
    if (textMatch || imgMatch) {
      cards.push({
        href,
        text: textMatch,
        img: imgMatch ? imgMatch[1] : ''
      });
    }
  }
  console.log('Found anchor cards:', cards.length);
  fs.writeFileSync('scripts/bdiptv_cards.json', JSON.stringify(cards, null, 2));
}

parseBDIptv();
