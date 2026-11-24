/* GPFIS demo child, Start PBL part (24 Nov 2026). Loaded ONLY by gpfis-site/demo/fill.html; the game never loads this file.
   GPDemoFill.pbl()  writes Island 1 · week 1 ("Who am I?") as FINISHED for a child called Mina:
     the video watched, all six activities done with their answers and stars (four with 3, two with 2), a finished drawing in the
     mirror and a painting on the easel, a voice clip for every "Say it!", the week's Speech Book done and the first place built.
     Weeks 2-4 are left as they are (the month's book stays closed). It does not call GPTrack: fill.html does that afterwards.
   GPDemoClear.pbl() removes everything Start PBL keeps on this device (the same as ?reset).
   The pictures and clips are in airship/demo/:
     mirror.webp, easel.webp ... child-style crayon drawings (ChatGPT, GPFIS chat), cut to the two canvas sizes
     voice/<activity>.mp3 ..... Gerry's recorded clip of that sentence where one exists (tablet, frames, shelf, easel);
                                the two sentences nobody has recorded (mirror "My name is Mina.", board "I am happy and kind.")
                                are the Windows built-in voice. No paid voice was used. */
(function () {
  const BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '') + 'demo/';
  const PAGES = 'spbl.pages', SHIP = 'spbl.airship';
  const get = k => { try { return JSON.parse(localStorage.getItem(k) || 'null') || {}; } catch (e) { return {}; } };
  const blob = f => fetch(BASE + f).then(r => { if (!r.ok) throw new Error(f + ' ' + r.status); return r.blob(); });
  const dataUrl = b => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); });
  const db = () => new Promise((res, rej) => { const r = indexedDB.open('spbl-voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const NAME = 'Mina';
  // id, the sentence the child said, stars, and what the activity itself saves
  const WEEK = [['mirror', `My name is ${NAME}.`, 3, { name: NAME }], ['tablet', 'Emma is eight.', 3, {}], ['frames', 'We are different.', 2, { miss: [2], heard: 'we are difference' }],
    ['board', 'I am happy and kind.', 3, { words: ['happy', 'kind'] }], ['shelf', 'I am good at drawing.', 2, { good: ['drawing'], miss: [4], heard: 'I am good at drying' }], ['easel', 'I like animals.', 3, { like: 'animals' }]];

  window.GPDemoFill = window.GPDemoFill || {}; window.GPDemoClear = window.GPDemoClear || {};
  window.GPDemoFill.pbl = async () => {
    const draw = { mirror: await dataUrl(await blob('mirror.webp')), easel: await dataUrl(await blob('easel.webp')) };
    const clips = await Promise.all(WEEK.map(w => blob('voice/' + w[0] + '.mp3')));
    const d = await db();
    await new Promise((res, rej) => { const tx = d.transaction('clips', 'readwrite'), st = tx.objectStore('clips'); WEEK.forEach((w, i) => st.put(clips[i], '1-1-' + w[0])); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    d.close();
    const now = Date.now(), W = { _tv: 1 };
    WEEK.forEach(([id, said, stars, own], i) => { W[id] = Object.assign({}, own, draw[id] ? { draw: draw[id] } : {}, { ok: true, said, stars, voice: 1, at: now - (WEEK.length - i) * 4 * 60000 }); });
    W.book = { ok: true, at: now };
    const P = get(PAGES); P[1] = P[1] || {}; P[1][1] = W; localStorage.setItem(PAGES, JSON.stringify(P));
    const S = Object.assign({ v: 2, stars: 0, built: {}, x: 600, y: 900 }, get(SHIP)); S.v = 2;
    const b = S.built[1] = S.built[1] || []; if (!b.includes(0)) { b.push(0); S.stars = (S.stars || 0) + 5; }   // the first place stands on the island
    localStorage.setItem(SHIP, JSON.stringify(S));
  };
  window.GPDemoClear.pbl = async () => {
    localStorage.removeItem(PAGES); localStorage.removeItem(SHIP);
    await new Promise(res => { const r = indexedDB.deleteDatabase('spbl-voice'); r.onsuccess = r.onerror = r.onblocked = () => res(); });
  };
})();
