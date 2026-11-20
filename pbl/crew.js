// Gerry and Penny as whole-body pose pictures (the same way as the GPFIS site): the game never bends or cuts them,
// it only swaps the picture. Every pose shares one canvas (feet on the bottom edge, head centred), so nothing jumps.
// Crew.add(img, 'gerry' | 'penny', rank) -> { walk(dir), stop(), pose(name, ms), talk(on) }
// Crew.say(text, { level, ko, who, quiet }) : one of the two helpers on screen says the line (voice + speech bubble + talking pose).
//   level 2 = a line of the activity (always said), 1 = a message or reaction, 0 = small talk (only when nobody is speaking).
// Crew.idle(fn) : fn() gives the next thing to say when it has been quiet for a while (string, null = ask the next one, false = stay quiet).
(() => {
  const ART = 'art/crew/', ALL = ['stand', 'blink', 'talk', 'wave', 'cheer', 'point', 'r1', 'r2', 'r3', 'r4', 'l1', 'l2', 'l3', 'l4'];
  const EXTRA = { gerry: ['think', 'thumb'], penny: [] }, PITCH = { penny: 1.45, gerry: 1.1 };
  const list = new Set(), idles = [];
  const now = () => performance.now();
  let muted = false, speaking = null, lastEnd = now(), lastTry = 0, turn = 0, bub = null, bubWho = null;

  function add(img, who, rank = 0) {
    [...ALL, ...EXTRA[who]].forEach(k => { new Image().src = `${ART}${who}/${k}.webp`; });
    const c = {
      img, who, rank, dir: 0, cur: '', until: 0, held: '', talkT: 0, blinkT: now() + 1500 + Math.random() * 2500, off: Math.random() * 1000,
      walk(dir) { c.dir = dir < 0 ? -1 : 1; },                     // -1 walks left, 1 walks right
      stop() { c.dir = 0; },
      pose(k, ms = 1200) { if (EXTRA[who].includes(k) || ALL.includes(k)) { c.held = k; c.until = now() + ms; } },
      talk(on) { c.talkT = on === true ? Infinity : on ? now() + on : 0; },
    };
    list.add(c); set(c, 'stand'); return c;
  }
  function set(c, k) { if (c.cur === k) return; c.cur = k; c.img.src = `${ART}${c.who}/${k}.webp`; }
  const seen = c => c.img.isConnected && c.img.getClientRects().length && (!c.img.checkVisibility || c.img.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }));
  // the helpers the child is looking at right now: in an activity, else in the room, else on the island, else in the airship
  function front() { const v = [...list].filter(seen), top = Math.max(-1, ...v.map(c => c.rank)); return v.filter(c => c.rank === top); }

  // ---------- the speech bubble ----------
  function show(c, text, ko) {
    if (!bub) { bub = document.createElement('div'); bub.id = 'crewbub'; (document.querySelector('#stage') || document.body).appendChild(bub); }
    bub.innerHTML = `<b></b>${ko ? '<small></small>' : ''}`; bub.firstChild.textContent = text; if (ko) bub.lastChild.textContent = ko;
    bubWho = c; bub.dataset.who = c.who; place(); bub.classList.add('on');
  }
  function hide() { if (bub) bub.classList.remove('on'); bubWho = null; }
  function place() {
    if (!bub || !bubWho) return;
    const st = bub.parentElement, sr = st.getBoundingClientRect(), s = sr.width / st.offsetWidth || 1, r = bubWho.img.getBoundingClientRect();
    if (!r.width) return;
    const w = bub.offsetWidth, h = bub.offsetHeight, W = st.offsetWidth;
    const cx = (r.left + r.width / 2 - sr.left) / s, top = (r.top + r.height * .06 - sr.top) / s;
    const x = Math.max(14, Math.min(W - w - 14, cx - w * .5)), y = Math.max(78, top - h - 16);
    bub.style.left = x + 'px'; bub.style.top = y + 'px'; bub.style.setProperty('--tail', Math.max(26, Math.min(w - 26, cx - x)) + 'px');
  }

  // ---------- saying a line ----------
  function say(text, o = {}) {
    const lv = o.level == null ? 1 : o.level;
    return new Promise(res => {
      if (!text || muted) return res(false);                                                 // the microphone is recording the child: total silence
      if (speaking && speaking.lv > lv) return res(false);                                   // never talk over a more important line
      if (lv < 2 && document.querySelector('.sayit .me.live')) return res(false);            // never talk while the microphone listens to the child
      const old = speaking; speaking = null; if (old) old.end();
      const f = front(), who = f.find(c => c.who === o.who) || f[turn++ % Math.max(1, f.length)] || null;
      const me = speaking = { lv, done: false };
      me.end = () => {
        if (me.done) return; me.done = true; clearTimeout(me.t); if (who) who.talk(false);
        if (speaking === me) { speaking = null; lastEnd = now(); hide(); }
        res(true);
      };
      if (who) { who.talk(true); if (!o.quiet) show(who, o.show || text, o.ko); else hide(); }
      try {
        const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = .88; u.pitch = who ? PITCH[who.who] : 1.2; u.onend = me.end; u.onerror = me.end;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) {}
      me.t = setTimeout(me.end, 1000 + text.length * 95);   // the bubble stays about as long as the line takes, voice or no voice
    });
  }
  // Crew.mute(true) while the microphone records: nothing is said (by anyone, any level) until Crew.mute(false)
  function mute(on) { muted = !!on; if (on) hush(); else lastEnd = now(); }
  function hush() { const old = speaking; speaking = null; if (old) old.end(); hide(); lastEnd = now(); try { speechSynthesis.cancel(); } catch (e) {} }

  // on a timer (not the screen's frame clock), so they keep moving in a still or hidden window too
  setInterval(() => {
    const t = now();
    for (const c of list) {
      if (!c.img.isConnected) { list.delete(c); continue; }
      if (c.dir) { set(c, (c.dir < 0 ? 'l' : 'r') + (1 + Math.floor((t + c.off) / 150) % 4)); continue; }
      if (t < c.until) { set(c, c.held); continue; }
      if (t < c.talkT) { set(c, Math.floor(t / 190) % 2 ? 'talk' : 'stand'); continue; }
      if (t > c.blinkT + 160) c.blinkT = t + 2200 + Math.random() * 2600;
      set(c, t > c.blinkT ? 'blink' : 'stand');
    }
    place();
    if (muted) { try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); } catch (e) {} return; }
    // always someone talking: after a quiet moment one of them says the next helpful thing
    if (!speaking && !document.hidden && t - lastEnd > QUIET && t - lastTry > QUIET) {
      lastTry = t;
      for (let i = idles.length - 1; i >= 0; i--) { const x = idles[i](); if (x === false) break; if (x) { say(x.text || x, { level: 0, ko: x.ko }); break; } }
    }
  }, 50);
  const QUIET = /quiet=(\d+)/.test(location.hash) ? +RegExp.$1 : 20000;   // how long it must be quiet before small talk (user: 6.5 s was too often); #quiet=1500 for checking
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.Crew = { add, say, hush, mute, muted: () => muted, pick, idle: f => idles.push(f), all: () => [...list], front, now: () => speaking };
})();
