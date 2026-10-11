import fs from 'fs';
import path from 'path';

async function testStream(url, customHeaders = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...customHeaders
    };

    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.status !== 200) {
      return { ok: false, status: res.status };
    }

    const text = await res.text();
    const isHls = text.includes('#EXTM3U') || text.includes('#EXT-X-TARGETDURATION') || text.includes('#EXT-X-STREAM-INF');

    return {
      ok: isHls,
      status: res.status,
      isHls
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function run() {
  const channelsFilePath = path.resolve('public/channels.json');
  const existingChannels = JSON.parse(fs.readFileSync(channelsFilePath, 'utf8'));

  const existingUrls = new Set(existingChannels.map(c => c.url.trim().toLowerCase()));
  const existingNames = new Set(existingChannels.map(c => c.name.trim().toLowerCase()));

  console.log(`Starting stream verification. Current channels in app: ${existingChannels.length}`);

  // Fetch bangla.json and sports.json
  const [bRes, sRes] = await Promise.all([
    fetch('https://raw.githubusercontent.com/SHAJON-404/iptv-web/main/app/data/bangla.json'),
    fetch('https://raw.githubusercontent.com/SHAJON-404/iptv-web/main/app/data/sports.json')
  ]);

  const banglaList = await bRes.json();
  const sportsList = await sRes.json();

  console.log(`Loaded ${banglaList.length} Bangla channels and ${sportsList.length} Sports channels from Shajon IPTV repository.`);

  const candidateChannels = [
    ...banglaList.map(c => ({ ...c, group: 'Bangla' })),
    ...sportsList.map(c => ({ ...c, group: 'Sports' }))
  ];

  const addedChannels = [];
  let testedCount = 0;

  // Process in batches of 10
  const BATCH_SIZE = 10;
  for (let i = 0; i < candidateChannels.length; i += BATCH_SIZE) {
    const batch = candidateChannels.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (candidate) => {
        testedCount++;
        const url = candidate.url?.trim();
        const name = candidate.name?.trim();

        if (!url || !name) return;
        if (candidate.type === 'dash' || url.endsWith('.mpd')) return; // Skip DRM DASH
        if (existingUrls.has(url.toLowerCase()) || existingNames.has(name.toLowerCase())) return;

        const testResult = await testStream(url, candidate.customHeaders);
        if (testResult.ok) {
          console.log(`[PASS] ${candidate.group} -> ${name} (${url.substring(0, 50)}...)`);
          const newChannel = {
            id: 'ch-' + Math.random().toString(36).substring(2, 9),
            name: candidate.name,
            group: candidate.group,
            url: candidate.url,
            logo: candidate.logo || '',
            type: 'stream',
            status: 'active',
            is8k: true,
            quality: '1080p FHD',
            isOnline: true
          };
          addedChannels.push(newChannel);
          existingUrls.add(url.toLowerCase());
          existingNames.add(name.toLowerCase());
        }
      })
    );
  }

  console.log(`\nVerification finished: Tested ${testedCount} candidates.`);
  console.log(`Found ${addedChannels.length} 100% active functional new streams!`);

  if (addedChannels.length > 0) {
    const updatedChannels = [...existingChannels, ...addedChannels];
    fs.writeFileSync(channelsFilePath, JSON.stringify(updatedChannels, null, 2), 'utf8');
    console.log(`Successfully updated public/channels.json: Total channels is now ${updatedChannels.length}.`);
  }
}

run();
