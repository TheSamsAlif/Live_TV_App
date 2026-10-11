import fs from 'fs';

async function test() {
  const r = await fetch('http://103.89.248.10:8082/T-SPORTS/embed.html?token=ce40b55a7366dc54bc57413bd1e6ce66bf072502-4aa3fc747939c234e9ee406932cd6006-1791744456-1791733656&remote=no_check_ip');
  const text = await r.text();
  fs.writeFileSync('scripts/embed.html', text);
  console.log('Saved embed.html');
  // Check for urls
  const matches = [...text.matchAll(/(https?:\/\/[^\s"']+|(?:\/[a-zA-Z0-9_\-\.\/]+\.m3u8))/g)].map(m => m[1]);
  console.log('Matches:', matches);
}
test();
