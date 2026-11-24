/* Let's Go Readers · demo child (24 Nov 2026, asked by the GPFIS site chat for the user: "week 1 ... fully open and
   completed ... and then the recording (just use the repeat sound of the character)").
   Loaded ONLY by gpfis-site/demo/fill.html. It never runs by itself and no page of the real site loads it.

     GPDemoFill.lgr()   Ruby · 1 · week 1 as a child who has FINISHED it:
                        - the four quests starred and the week's treasure built        ('lgr2': w1 + done)
                        - all six A readings finished in ABC, Speak and Grammar        ('lgr.pages', 'lgr.sheets', 'lgr.dictations')
                        - the week's Speaking Book read through                        ('lgr.speakbooks')
                        - the child's voice for all 60 lines of the Speaking Book: PENNY's own recording of each
                          sentence stands in for the child (IndexedDB "lgr-voice", the store of vendor/myvoice.js),
                          so "Hear my page", "Hear my whole book" and the report's Hear button play
                        Weeks 2-4 are left untouched (not started).
     GPDemoClear.lgr()  removes everything Let's Go Readers keeps on this device (as kingdom.html?reset=1 does, plus
                        the reading lists).
   No game code is loaded here: the readings come from sheet/data.js (data only), read as text. */
(function () {
  const HERE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');   // .../active-readers/app/ or .../lgr/
  // the shared voice folder sits next to the kit that fill.html has already loaded (kit/track.js), wherever the site lives
  const kit = [...document.scripts].map(s => s.src).find(s => /kit\/track\.js/.test(s)) || '';
  const VOICE = kit ? kit.replace(/kit\/track\.js.*$/, 'voice/') : HERE + '../../gpfis-site/voice/';
  const norm = t => String(t).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim();
  const clipId = t => { let h = 2166136261; for (const c of norm(t)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };   // the same id as kit/voice.js
  const KEYS = ['lgr2', 'lgr.pages', 'lgr.sheets', 'lgr.dictations', 'lgr.speakbooks', 'lgr.said'];
  const store = mode => new Promise((res, rej) => { const r = indexedDB.open('lgr-voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips');
    r.onsuccess = () => res(r.result.transaction('clips', mode).objectStore('clips')); r.onerror = () => rej(r.error); });
  const done = q => new Promise((res, rej) => { q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  async function readings() { const txt = await fetch(HERE + 'sheet/data.js', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('readings not found'); return r.text(); });
    const w = {}; new Function('window', txt)(w); return (w.LGR_SHEETS || []).filter(r => r.L === 'a' && r.q10); }

  window.GPDemoClear = window.GPDemoClear || {}; window.GPDemoFill = window.GPDemoFill || {};
  window.GPDemoClear.lgr = async () => { KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    ['lgr2.abc', 'lgr2.sheet', 'lgr2.dict', 'lgr2.arrive', 'lgr2.from'].forEach(k => { try { sessionStorage.removeItem(k); } catch (e) {} });
    try { await done((await store('readwrite')).clear()); } catch (e) {} };
  window.GPDemoFill.lgr = async () => {
    const R = await readings(), ids = R.map(r => r.id); if (!ids.length) throw new Error('no readings for week 1');
    await window.GPDemoClear.lgr();
    // the child's voice: Penny's recording of each sentence (fetched first, then written in one go)
    const clips = []; let missing = 0;
    for (const r of R) for (let i = 0; i < r.lines.length; i++) { const res = await fetch(VOICE + 'penny/' + clipId(r.lines[i]) + '.mp3').catch(() => null);
      if (res && res.ok) clips.push([r.id + ':' + i, await res.blob()]); else missing++; }
    for (const [key, blob] of clips) await done((await store('readwrite')).put(blob, key));
    localStorage.setItem('lgr2', JSON.stringify({ w1: { watch: 1, abc: 1, sheet: 1, dictation: 1 }, done: { 1: 1 } }));
    localStorage.setItem('lgr.pages', JSON.stringify(ids)); localStorage.setItem('lgr.sheets', JSON.stringify(ids)); localStorage.setItem('lgr.dictations', JSON.stringify(ids));
    localStorage.setItem('lgr.speakbooks', JSON.stringify({ w1: 1 }));
    // the stars and missed words of each line's best try ('lgr.said', as Speak writes it). Mostly three stars; on two pages one
    // line has two stars with a word the child got wrong, so the book shows a red word (user: "to show the mistakes and all").
    const SLIP = { 'a-airplane:5': ['clouds', 'cloud'], 'a-ant:3': ['cookie', 'cook'], 'a-apple:7': ['friend', 'friends'] }, said = {};
    for (const r of R) r.lines.forEach((l, i) => { const key = r.id + ':' + i, slip = SLIP[key], ws = l.split(' ');
      if (!slip) { said[key] = { s: 3, m: [], h: l.replace(/[.!?]$/, '') }; return; }
      const k = ws.findIndex(w => w.toLowerCase().replace(/[^a-z']/g, '') === slip[0]); said[key] = { s: 2, m: k < 0 ? [] : [k], h: ws.map((w, n) => n === k ? slip[1] : w).join(' ').replace(/[.!?]$/, '') }; });
    localStorage.setItem('lgr.said', JSON.stringify(said));
    if (missing) console.warn("Let's Go Readers demo: " + missing + ' line(s) had no recorded clip and were left empty');
    return { readings: ids.length, clips: clips.length, missing };
  };
})();
