import fs from 'fs';

const html = fs.readFileSync('scripts/bdiptv.html', 'utf8');

// Match <div class="item ..."> ... onclick="tv.location.href='play.php?stream=...'" ... <img src="..."
const itemRegex = /<div class="item\s+([^"]+)">[\s\S]*?play\.php\?stream=([^'"]+)[\s\S]*?<img src="([^"]+)"/gi;

const channels = [];
const seen = new Set();
let match;

const CLASS_TO_CATEGORY = {
  lsports: 'Sports',
  sports: 'Sports',
  news: 'News',
  bangla: 'Bangla',
  hindi: 'Entertainment',
  movies: 'Movies',
  music: 'Music',
  documentary: 'Documentary',
  kids: 'Kids',
};

while ((match = itemRegex.exec(html)) !== null) {
  const cssClass = match[1].trim();
  const streamId = match[2].trim();
  const imgSrc = match[3].trim();

  if (seen.has(streamId)) continue;
  seen.add(streamId);

  let category = 'Bangla';
  for (const [cls, cat] of Object.entries(CLASS_TO_CATEGORY)) {
    if (cssClass.includes(cls)) {
      category = cat;
      break;
    }
  }

  // Clean stream name
  let name = streamId.replace(/[-_]/g, ' ').trim();
  name = name.replace(/\b\w/g, (c) => c.toUpperCase());

  channels.push({
    id: `bdiptv-${streamId.toLowerCase()}`,
    name,
    group: category,
    url: `http://tv.bdiptv.net/play.php?stream=${streamId}`,
    logo: imgSrc.startsWith('http') ? imgSrc : `http://tv.bdiptv.net/${imgSrc}`,
    type: 'bdiptv',
    source: 'BDIPTV BDIX',
    quality: 'HD Live',
    is8k: true,
    isOnline: true,
  });
}

console.log('Successfully parsed BDIPTV items:', channels.length);
console.log('Sample parsed items:', channels.slice(0, 10));

const categoriesCount = {};
channels.forEach((c) => {
  categoriesCount[c.group] = (categoriesCount[c.group] || 0) + 1;
});
console.log('Categories count:', categoriesCount);

fs.writeFileSync('scripts/bdiptv_full_channels.json', JSON.stringify(channels, null, 2));
