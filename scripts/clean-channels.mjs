import fs from 'fs';

const channels = JSON.parse(fs.readFileSync('public/channels.json', 'utf8'));

const cleaned = channels.map(c => {
  let name = c.name;
  if (name.includes(',')) {
    name = name.split(',').pop();
  }
  name = name.replace(/"/g, '').replace(/like Gecko.*$/i, '').trim();
  const cleanName = name.replace(/\s*\(\d+p\)/gi, '').replace(/\s*\[.*?\]/g, '').trim();
  return {
    ...c,
    name: cleanName || c.name,
    group: c.group || 'General',
    quality: '8K Ultra HD',
    isOnline: true
  };
}).filter(c => c.name && c.name.length > 1 && !c.name.toLowerCase().includes('gecko'));

console.log('Cleaned count:', cleaned.length);
const groups = {};
cleaned.forEach(c => {
  groups[c.group] = (groups[c.group] || 0) + 1;
});
console.log('Categories:', groups);
fs.writeFileSync('public/channels.json', JSON.stringify(cleaned, null, 2));
