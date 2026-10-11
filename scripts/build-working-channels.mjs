import fs from 'fs';

const TEST_CATEGORIES = [
  { name: 'Bangla', m3u: 'https://iptv-org.github.io/iptv/countries/bd.m3u' },
  { name: 'Sports', m3u: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
  { name: 'News', m3u: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
  { name: 'Entertainment', m3u: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u' },
  { name: 'Music', m3u: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
  { name: 'Kids', m3u: 'https://iptv-org.github.io/iptv/categories/kids.m3u' },
  { name: 'Movies', m3u: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
  { name: 'Religious', m3u: 'https://iptv-org.github.io/iptv/categories/religious.m3u' },
  { name: 'Documentary', m3u: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' },
];

// Direct well-known highly-reliable 24/7 public live streams
const RELIABLE_STREAMS = [
  // Bangla
  { name: 'Bangla Vision', group: 'Bangla', url: 'https://tvsen5.aynaott.com/banglavision/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/2/2f/Banglavision_Logo.png' },
  { name: 'Maasranga TV', group: 'Bangla', url: 'http://tvsen5.aynascope.net/maasrangatv/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/9/90/Maasranga_Television_logo.png' },
  { name: 'Boishakhi TV', group: 'Bangla', url: 'https://boishakhi.sonarbanglatv.com/boishakhi/boishakhitv/index.m3u8', logo: 'https://i.imgur.com/G5g2mYr.png' },
  { name: 'Ekushey TV', group: 'Bangla', url: 'https://ekusheyserver.com/etvlivesn.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Ekushey_Television_logo.png' },
  { name: 'ATN Bangla', group: 'Bangla', url: 'http://tvsen5.aynascope.net/atnbangla/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/4/4e/ATN_Bangla_Logo.png' },
  { name: 'ATN Music', group: 'Music', url: 'https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI/atnmusic.stream/playlist.m3u8', logo: 'https://i.imgur.com/xT3x0d4.png' },
  { name: 'Green TV HD', group: 'Bangla', url: 'https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI2/greentv.stream/live-orgin/greentv.stream/playlist.m3u8', logo: 'https://i.imgur.com/39N2m6G.png' },
  { name: 'Channel S UK', group: 'Bangla', url: 'https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI/chsukoff.stream/playlist.m3u8', logo: 'https://i.imgur.com/8Qj8mC1.png' },
  { name: 'Deshi TV HD', group: 'Bangla', url: 'https://deshitv.deshitv24.net/live/myStream/playlist.m3u8', logo: 'https://i.imgur.com/jEwL1Vb.png' },
  { name: 'Duronto TV (Kids)', group: 'Kids', url: 'https://tvsen6.aynaott.com/6xyZ3N4oHv2KBJdB6W4p/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/5/50/Duronto_TV_logo.png' },
  { name: 'Disney International', group: 'Kids', url: 'http://103.151.60.162:2122/play/a018/index.m3u8?hls', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Disney_Channel_logo.svg' },
  { name: 'Movie Bangla TV', group: 'Movies', url: 'http://alvetv.com/moviebanglatv/8080/index.m3u8', logo: 'https://i.imgur.com/v8tT4r3.png' },
  { name: 'Matribhumi TV', group: 'Bangla', url: 'http://live.playmax.live/matribhumi/index.m3u8', logo: 'https://i.imgur.com/832P15A.png' },
  { name: 'News 21 Bangla', group: 'News', url: 'http://103.190.133.68:1935/news21live/live/playlist.m3u8', logo: 'https://i.imgur.com/qL6pA6y.png' },
  { name: 'Nexus TV HD', group: 'Bangla', url: 'https://tvsen6.aynaott.com/Epm7WrFa/index.m3u8', logo: 'https://i.imgur.com/N6pP6A4.png' },

  // Religious (100% reliable 24/7 official Makkah & Madinah livestreams)
  { name: 'Makkah Live HD (Quran TV)', group: 'Religious', url: 'https://win.holol.com/live/quran/playlist.m3u8', logo: 'https://i.imgur.com/0Fw0kOa.png' },
  { name: 'Madinah Live HD (Sunnah TV)', group: 'Religious', url: 'https://win.holol.com/live/sunnah/playlist.m3u8', logo: 'https://i.imgur.com/K07q5dO.png' },
  { name: 'Peace TV English', group: 'Religious', url: 'https://peacetvenglish.akamaized.net/hls/live/2042784/pte/master.m3u8', logo: 'https://i.imgur.com/W2kP3zP.png' },

  // Global News (24/7 Verified Official HLS Streams)
  { name: 'Al Jazeera English HD', group: 'News', url: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_English_logo.svg/1200px-Al_Jazeera_English_logo.svg.png' },
  { name: 'DW News English HD', group: 'News', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Deutsche_Welle_symbol_2012.svg' },
  { name: 'France 24 English HD', group: 'News', url: 'https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/65/France_24_logo.svg/1200px-France_24_logo.svg.png' },
  { name: 'RT News HD', group: 'News', url: 'https://rt-eng.rttv.com/live/rteng/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/RT_logo.svg' },
  { name: 'TRT World HD', group: 'News', url: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/TRT_World_logo.svg/1200px-TRT_World_logo.svg.png' },
  { name: 'Sky News UK HD', group: 'News', url: 'https://skynews-live.skynews.com/hls/live/2002598/skynews_live/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sky_News_2018.svg/1200px-Sky_News_2018.svg.png' },
  { name: 'ABC News Australia Live', group: 'News', url: 'https://abclivestream.akamaized.net/hls/live/2042767/abcnews/master.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/54/ABC_News_Australia_logo.svg' },
  { name: 'Euronews English HD', group: 'News', url: 'https://euronews-euronews-world-1-au.samsung.wurl.tv/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Euronews_2016_logo.svg/1200px-Euronews_2016_logo.svg.png' },
  { name: 'CNA (Channel NewsAsia) HD', group: 'News', url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43a7bdd6a6c429782319/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/CNA_%28news_channel%29_logo.svg' },

  // Sports (Red Bull TV, Sports Live, Extreme)
  { name: 'Red Bull TV HD', group: 'Sports', url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png' },
  { name: 'SportsFirst Live', group: 'Sports', url: 'https://live-stream3.tubi.video/live/sportsfirst/playlist.m3u8', logo: 'https://i.imgur.com/kP4Fm41.png' },
  { name: 'FTV Sports HD', group: 'Sports', url: 'https://fash1043.akamaized.net/hls/live/2016749/FASH1043/master.m3u8', logo: 'https://i.imgur.com/Z4uO6Fq.png' },
  { name: 'World Poker Tour (WPT)', group: 'Sports', url: 'https://wpt-samsung.amagi.tv/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/World_Poker_Tour_logo.png' },
  { name: 'Fight Sports Network', group: 'Sports', url: 'https://stream.fightsports.tv/hls/live/fightsports.m3u8', logo: 'https://i.imgur.com/7i2wzJb.png' },

  // Documentary & Nature & Space
  { name: 'NASA TV Public HD', group: 'Documentary', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg' },
  { name: 'EarthxTV HD', group: 'Documentary', url: 'https://earthxtv-samsung.amagi.tv/playlist.m3u8', logo: 'https://i.imgur.com/3q1jO2N.png' },
  { name: 'WildEarth Wildlife Live', group: 'Documentary', url: 'https://wildearth-samsungau.amagi.tv/playlist.m3u8', logo: 'https://i.imgur.com/yFh9x5C.png' },

  // Music & Entertainment
  { name: 'Clubbing TV HD', group: 'Music', url: 'https://clubbingtv.tv/live/clubbingtv_hls/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Clubbing_TV_Logo.png' },
  { name: 'Vevo Pop Hits', group: 'Music', url: 'https://vevo-pop-1-us.tubi.video/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Vevo_logo.svg/1200px-Vevo_logo.svg.png' },
  { name: 'K-Pop TV Live', group: 'Music', url: 'https://kpop-samsungau.amagi.tv/playlist.m3u8', logo: 'https://i.imgur.com/tYt7uK9.png' },

  // Movies
  { name: 'Rakuten Action Movies', group: 'Movies', url: 'https://rakuten-actionmovies-1-eu.rakuten.wurl.tv/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Rakuten_TV_logo.svg/1200px-Rakuten_TV_logo.svg.png' },
  { name: 'Pluto TV Movies', group: 'Movies', url: 'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5d8a9ea8bc819c4d9cb952ef/master.m3u8?deviceType=web&deviceMake=Chrome&deviceModel=web', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Pluto_TV_2020.svg/1200px-Pluto_TV_2020.svg.png' },
];

async function checkUrl(url) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 4000);
    const r = await fetch(url, {
      signal: c.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

async function run() {
  console.log('Testing reliable streams...');
  const verified = [];
  for (const ch of RELIABLE_STREAMS) {
    const ok = await checkUrl(ch.url);
    if (ok) {
      console.log(`✅ [${ch.group}] ${ch.name}`);
      verified.push({
        id: 'ch-' + Math.random().toString(36).substring(2, 9),
        name: ch.name,
        group: ch.group,
        url: ch.url,
        logo: ch.logo,
        type: 'stream',
        status: 'active',
        is8k: true
      });
    } else {
      console.log(`❌ FAILED: ${ch.name}`);
    }
  }

  console.log(`\nVerified ${verified.length} / ${RELIABLE_STREAMS.length} primary channels.`);

  // Write curated channels to public/channels.json
  fs.writeFileSync('public/channels.json', JSON.stringify(verified, null, 2));
  console.log('Successfully saved to public/channels.json!');
}

run();
