export function parseM3U(content) {
  const channels = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF')) {
      const urlLine = lines[i + 1]?.trim();
      if (!urlLine || urlLine.startsWith('#')) continue;

      const url = urlLine.split('|')[0].trim();

      const nameMatch = line.match(/,([^,]+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const logo = logoMatch ? logoMatch[1] : '';

      const groupMatch = line.match(/group-title="([^"]*)"/);
      const group = groupMatch ? groupMatch[1] : 'Uncategorized';

      channels.push({
        id: `ch-${i}`,
        name,
        logo,
        group,
        url,
        isFavorite: false,
      });
    }
  }

  return channels;
}
