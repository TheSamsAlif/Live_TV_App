import fs from 'fs';

const html = fs.readFileSync('scripts/bdiptv.html', 'utf8');

const regex = /<a[^>]*href="play\.php\?stream=([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
const channels = [];
const seen = new Set();
let m;
while ((m = regex.exec(html)) !== null) {
  const streamId = m[1];
  if (seen.has(streamId)) continue;
  seen.add(streamId);
  const img = m[2];
  const name = streamId.replace(/[-_]/g, ' ').trim();
  
  // Categorize
  let group = 'Sports';
  const lower = streamId.toLowerCase();
  if (lower.includes('news') || lower.includes('somoy') || lower.includes('jamuna') || lower.includes('ekattor') || lower.includes('dbc') || lower.includes('channel24')) {
    group = 'News';
  } else if (lower.includes('bangla') || lower.includes('boishakhi') || lower.includes('maasranga') || lower.includes('ekushey') || lower.includes('atn') || lower.includes('deepto') || lower.includes('deshi')) {
    group = 'Bangla';
  } else if (lower.includes('movie') || lower.includes('cinema') || lower.includes('hbo') || lower.includes('star-movies') || lower.includes('sony-pix')) {
    group = 'Movies';
  } else if (lower.includes('music') || lower.includes('song') || lower.includes('mtv') || lower.includes('jalwa') || lower.includes('zoom')) {
    group = 'Music';
  } else if (lower.includes('kids') || lower.includes('cartoon') || lower.includes('pogo') || lower.includes('disney') || lower.includes('nick')) {
    group = 'Kids';
  } else if (lower.includes('islam') || lower.includes('quran') || lower.includes('makkah') || lower.includes('madina') || lower.includes('peace')) {
    group = 'Religious';
  } else if (lower.includes('discovery') || lower.includes('nat-geo') || lower.includes('animal') || lower.includes('history') || lower.includes('geo')) {
    group = 'Documentary';
  }

  channels.push({
    id: 'bdiptv-' + streamId.toLowerCase(),
    name: name,
    group: group,
    url: 'http://tv.bdiptv.net/play.php?stream=' + streamId,
    logo: img.startsWith('http') ? img : 'http://tv.bdiptv.net/' + img,
    type: 'bdiptv',
    source: 'BDIPTV Portal',
    is8k: true,
    quality: 'HD Live',
    isOnline: true
  });
}

console.log('Total unique BDIPTV channels extracted:', channels.length);
console.log('Sample channels:', channels.slice(0, 10));
fs.writeFileSync('scripts/bdiptv_extracted.json', JSON.stringify(channels, null, 2));
