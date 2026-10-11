import fs from 'fs';

const existing = JSON.parse(fs.readFileSync('public/channels.json', 'utf8'));
const bdiptvChannels = JSON.parse(fs.readFileSync('scripts/bdiptv_full_channels.json', 'utf8'));

// Filter and enhance BDIPTV channels
const existingUrls = new Set(existing.map(c => c.url));
const existingNames = new Set(existing.map(c => c.name.toLowerCase()));

const addedBDIPTV = [];
for (const ch of bdiptvChannels) {
  if (!existingUrls.has(ch.url)) {
    addedBDIPTV.push({
      ...ch,
      isOnline: true,
      quality: 'HD BDIX',
      is8k: false,
    });
  }
}

console.log(`Adding ${addedBDIPTV.length} BDIPTV channels to existing ${existing.length} channels...`);

const merged = [...existing, ...addedBDIPTV];

console.log(`Total channels after merge: ${merged.length}`);
fs.writeFileSync('public/channels.json', JSON.stringify(merged, null, 2));

// Also write a dedicated quick access links file
const quickAccessLinks = [
  {
    name: 'BDIPTV Live Portal',
    url: 'http://tv.bdiptv.net/',
    desc: 'BDIX Live TV, Sports, Cricket & Football Server',
    tag: 'BDIX / High Speed',
    icon: '⚡',
    badge: 'Popular in BD'
  },
  {
    name: 'BDIPTV Live Football',
    url: 'http://tv.bdiptv.net/play.php?stream=LIVE-FOOTBALL',
    desc: 'Live International Football Streams',
    tag: 'Sports',
    icon: '⚽',
    badge: 'Live Match'
  },
  {
    name: 'BDIPTV Live Cricket',
    url: 'http://tv.bdiptv.net/play.php?stream=LIVE-CRICKET',
    desc: 'Live Cricket, IPL & T20 Streams',
    tag: 'Sports',
    icon: '🏏',
    badge: 'Live Match'
  },
  {
    name: 'BDIPTV T-Sports',
    url: 'http://tv.bdiptv.net/play.php?stream=T-SPORTS',
    desc: 'Bangladesh T-Sports Live BDIX Stream',
    tag: 'Bangla Sports',
    icon: '🏆',
    badge: 'HD'
  },
  {
    name: 'BDIPTV Star Sports 1',
    url: 'http://tv.bdiptv.net/play.php?stream=STAR-SPORTS-1',
    desc: 'Star Sports 1 Live Cricket & Sports',
    tag: 'Star Network',
    icon: '⭐',
    badge: 'HD'
  },
  {
    name: 'EzLiveTV BDIX Hub',
    url: 'https://tv.ezshomadhan.com/',
    desc: 'Bangladesh BDIX All Channels Portal',
    tag: 'Live TV',
    icon: '📺',
    badge: 'BDIX'
  }
];

fs.writeFileSync('public/quick_access.json', JSON.stringify(quickAccessLinks, null, 2));
console.log('Saved public/channels.json and public/quick_access.json!');
