/* Fresh Math: the DEMO child (user, 24 Nov 2026: "i do want the week 1 to be like all fully open and completed ... and then
   the recording (just use the repeat sound of the character / or the built-in if there is not line recorded)").
   Loaded ONLY by gpfis-site/demo/fill.html; the world itself never loads this file, so a real child's device is never touched.
     GPDemoFill.fm()   writes planet 1, week 1 (stop 1 of 4) as finished: the 8 pages' answers, the speaking stars, the video
                       seen, the stop done (so My book opens at week 1). The save only, no network. Weeks 2-4 stay not started.
     GPDemoVoice.fm()  puts one voice clip per sentence into IndexedDB 'fm-voice' (run afterwards, in the background).
     GPDemoClear.fm()  removes everything Fresh Math keeps on this device.
   The clips are a free Windows built-in voice saying each sentence (demo/say/<key>.mp3, made beforehand by a script): Gerry's
   recorded lines are the QUESTIONS, none of them is the child's sentence. Does not call GPTrack (fill.html adds the days). */
(() => {
  const HERE = new URL('.', document.currentScript.src).href, KEY = 'fm.world.sample', WK = '1-0';
  // the same answers the pages save (see WEEKS['1-0'] in world.js): 01 the dots A-D in four boxes (places 0..1 inside the box),
  // 06 the five round things found, 08 the three gallery colours; the other pages keep no choices of their own
  const PGD = { 0: { d: [[[.48, .42]], [[.26, .3], [.7, .62]], [[.22, .26], [.68, .34], [.44, .76]], [[.2, .24], [.72, .2], [.28, .72], [.76, .7]]] },
    1: {}, 2: {}, 3: {}, 4: {}, 5: { p: ['clock', 'wheel', 'coin', 'plate', 'donut'] }, 6: {}, 7: { c: ['#e3342f', '#2f6fdb', '#ffcc00'] } };
  const SAY = { '1-0-0-a': 3, '1-0-1-a': 3, '1-0-2-a': 2, '1-0-3-a': 3, '1-0-3-b': 3, '1-0-4-a': 3, '1-0-5-a': 3, '1-0-6-a': 2, '1-0-7-a': 3 };   // mostly 3, some 2
  // the two 2-star sentences each have one missed word, shown in red in the book (user: "in the demo, i do want some not full 3 stars")
  const SAYD = { '1-0-2-a': { miss: [10], heard: 'a circle has a center and every radius is the length' }, '1-0-6-a': { miss: [9], heard: 'I can draw a circle to build a round down' } };
  const db = () => new Promise((res, rej) => { const r = indexedDB.open('fm-voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const tx = (d, f) => new Promise((res, rej) => { const t = d.transaction('clips', 'readwrite'); f(t.objectStore('clips')); t.oncomplete = res; t.onerror = t.onabort = () => rej(t.error); });
  window.GPDemoFill.fm = async () => {
    let S = {}; try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    S = Object.assign({ done: 0, stars: 0, stop: 0, deco: [] }, S);
    S.pgd = Object.assign({}, S.pgd, { [WK]: PGD }); S.say = Object.assign({}, S.say, SAY); S.sayd = Object.assign({}, S.sayd, SAYD); S.book = Object.assign({}, S.book, { [WK]: 1 }); S.vid = Object.assign({}, S.vid, { [WK]: 1 });
    if (S.done < 1 && S.stop < 1) { S.stop = 1; S.stars = Math.max(S.stars, 1); }   // stop 1 of planet 1 done: one star, My book opens at week 1
    localStorage.setItem(KEY, JSON.stringify(S));   // the save only: no network, instant (the boss: the entrance must not wait)
  };
  // the 9 voice clips, loaded afterwards in the background by the site (kit/track.js); all at once, safe to run twice, never touches the save
  (window.GPDemoVoice = window.GPDemoVoice || {}).fm = async () => {
    const got = await Promise.all(Object.keys(SAY).map(async k => { const r = await fetch(HERE + 'demo/say/' + k + '.mp3'); if (!r.ok) throw new Error('voice file missing: ' + k); return [k, await r.blob()]; }));
    const d = await db(); await tx(d, st => { for (const [k, b] of got) st.put(b, k); }); d.close();
  };
  window.GPDemoClear.fm = async () => { localStorage.removeItem(KEY); const d = await db(); await tx(d, st => st.clear()); d.close(); };
})();
