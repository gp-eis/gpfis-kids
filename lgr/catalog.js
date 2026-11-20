// What Let's Go Readers holds. Source: Desktop/Claude/worksheets/contents/lets-go-readers-24-months.md
// (목차 FINAL, user 20 Nov 2026). 24 numbers, four medal levels of six numbers each, every number has 4 weeks:
//   Bronze (A) = 1-6, Silver (B) = 7-12, Gold (C) = 13-18, Diamond (D) = 19-24.
// Each week: the Daily Essay video, Alphabet Reading, the worksheet, Dictation, and the Library.
// Videos come from a coworker: drop them into app/videos/ named <letter>-<number>-w<week>-essay.mp4 (a-1-w1-essay.mp4).
(function () {
  // phonics lesson of each number (the grammar point of each number is in the 목차 file)
  const TITLES = {
    1: 'Letters A–D', 2: 'Letters E–H', 3: 'Letters I–L', 4: 'Letters M–P', 5: 'Letters Q–T', 6: 'Letters U–Z',
    7: 'Short a · 1', 8: 'Short a · 2', 9: 'Short e and i · 1', 10: 'Short e and i · 2', 11: 'Short o and u · 1', 12: 'Short o and u · 2',
    13: 'pl, sl, dr', 14: 'fr, sk, sm', 15: 'st, sw, sh', 16: 'th, nk, ck', 17: 'ee, ea, oo', 18: 'ow, ue, er, ir',
    19: 'Magic e · 1', 20: 'Magic e · 2', 21: 'Soft sounds', 22: 'Hard sounds and y', 23: 'Word sorting and sound rules', 24: 'Reading new words'
  };
  // Activities ready so far. Key: letter-number-week. Values are page links (relative to app/).
  const READY = {
    // Sample reading books for the boss: Phonics Writing A-1, the six A words.
    'A-1-1': { read: 'book/index.html?set=a', sample: 'My A Book (sample)' },
    // Older sample unit (ou, house), kept to show dictation; parked under Gold 18 (ow, ue, er, ir).
    'C-18-1': { read: 'units/unit.html?step=0', write: 'units/unit.html?step=3', sample: 'My Lovely House (sample)' }
  };
  // Levels are gems (user + boss, 20 Nov 2026). 'means' is what the gem stands for; 'item' is what the child wins.
  const LEVELS = {
    A: { name: 'Ruby',     first: 1,  gem: '#e23b4a', means: 'Love & Passion',      ko: '사랑과 열정',   item: 'Ruby Heart Pendant',      master: 'Ruby Master',     open: true },
    B: { name: 'Sapphire', first: 7,  gem: '#2f6fe0', means: 'Wisdom & Truth',      ko: '지혜와 진실',   item: 'Sapphire Wisdom Ring',    master: 'Sapphire Master' },
    C: { name: 'Emerald',  first: 13, gem: '#22a35a', means: 'Hope & Renewal',      ko: '희망과 새로움', item: 'Emerald Growth Bracelet', master: 'Emerald Master' },
    D: { name: 'Diamond',  first: 19, gem: '#9fdcf5', means: 'Eternity & Strength', ko: '영원과 강인함', item: 'Diamond Power Crown',     master: 'Diamond Master' }
  };
  // The boss's "Legend of Ruby": one chapter per chest (number), one mission per week, each with an item to win.
  // [chapter title, rank earned, [[mission, item] x 4]]   (Sapphire, Emerald, Diamond: content/boss-shares/*.txt)
  const QUESTS = {
    A: [
      ['The Ruby Explorers', 'Ruby Explorer',  [['The Lost Ruby', 'Explorer Badge'], ['The Secret Map', 'Ruby Map'], ['The Hidden Cave', 'Explorer Torch'], ['The Ruby Treasure', 'Ruby Pendant']]],
      ['The Secret of Ruby', 'Ruby Detective', [['Born Inside the Earth', 'Earth Card'], ['The Red Mystery', 'Colour Lens'], ['The Ruby Detective', 'Detective Badge'], ['The Ruby Laboratory', 'Lab Card']]],
      ['The Magic of Ruby',  'Ruby Scientist', [['The Power of Light', 'Light Crystal'], ['The Ruby Shapes', 'Shape Card'], ['The Hardness Test', 'Scientist Badge'], ['The Secret of Sparkle', 'Ruby Magnifier']]],
      ['The Ruby Kingdom',   'Ruby Historian', [['The Ruby Crown', 'Crown Piece'], ['The Ruby Legend', 'Legend Book'], ['The Ruby Journey', 'World Map'], ['The Royal Ruby', 'Designer Badge']]],
      ['The Art of Ruby',    'Ruby Designer',  [['The Ruby Cutter', 'Tool Card'], ['The Ruby Jewelry', 'My Ruby Jewel'], ['The Ruby Market', 'Gem Report'], ['The Ruby Masterpiece', 'Art Award']]],
      ['The Ruby Legacy',    'Ruby Curator',   [['The Ruby Collection', 'Collector Card'], ['The Ruby Museum Design', 'Museum Plan'], ['Build Our Ruby Museum', 'Curator Badge'], ['The Ruby Grand Opening', 'Ruby Master Award']]]
    ]
  };
  const weeks = (lv, n) => [1, 2, 3, 4].map(w => {
    const base = 'videos/' + lv.toLowerCase() + '-' + n + '-w' + w;
    const q = QUESTS[lv] && QUESTS[lv][n - LEVELS[lv].first];
    return { no: w, essay: base + '-essay.mp4', ready: READY[lv + '-' + n + '-' + w] || null, mission: q ? q[2][w - 1][0] : '', item: q ? q[2][w - 1][1] : '' };
  });
  for (const lv in LEVELS) {
    LEVELS[lv].numbers = {};
    for (let n = LEVELS[lv].first; n < LEVELS[lv].first + 6; n++) { const q = QUESTS[lv] && QUESTS[lv][n - LEVELS[lv].first]; LEVELS[lv].numbers[n] = { no: n, title: TITLES[n] || '', chapter: q ? q[0] : '', rank: q ? q[1] : '', weeks: weeks(lv, n) }; }
  }
  window.AR = { LEVELS };
})();
