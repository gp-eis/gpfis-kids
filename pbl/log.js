/* FLIGHT LOG (24 Nov 2026): the Start PBL report inside the airship, for the parent and the teacher. One island (month) at a time:
   four totals, then one row a week: the days she played, the video, each activity and the Speech Book with how many TIMES each was
   played, her speaking stars, and a button that plays that week's recordings.
   Where the numbers come from (this device only, until children have accounts):
     finished, stars, the day it was finished ... the game's own save (localStorage spbl.pages)
     times played, days played ................. the shared GPFIS counter (localStorage gpfis.log, written by gpfis-site/kit/track.js)
     recordings ................................ the child's best takes (IndexedDB spbl-voice, through Room.voice)
   Pictures are the game's own (the room's TV and book, the clouds, the airship): no new art. */
window.FlightLog = (() => {
  const $ = s => document.querySelector(s), K = () => window.__kit;
  const get = k => { try { return JSON.parse(localStorage.getItem(k) || 'null') || {}; } catch (e) { return {}; } };
  const p2 = n => String(n).padStart(2, '0'), dayKey = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const nice = s => s.toLowerCase().replace(/(^|[\s(])([a-z])/g, (a, b, c) => b + c.toUpperCase()).replace(/\b(A|The|And|To|Of)\b/g, (w, x, i) => i ? w.toLowerCase() : w);
  // the two sky-world badges drawn here (no picture files): a brass compass star for the speaking stars, the airship's radio for the recordings
  const COMPASS = `<svg class="ic" viewBox="0 0 64 64"><circle cx="32" cy="34" r="27" fill="#b5793b"/><circle cx="32" cy="32" r="27" fill="#e9a94f"/><circle cx="32" cy="32" r="21" fill="#fff6dc"/>` +
    `<path d="M32 13l4.6 14.4L51 32l-14.4 4.6L32 51l-4.6-14.4L13 32l14.4-4.600z" fill="#ffc533"/><path d="M32 13l4.6 14.4L32 32zM51 32l-14.4 4.6L32 32zM32 51l-4.600-14.4L32 32zM13 32l14.4-4.600L32 32z" fill="#f09a1a"/>` +
    `<path d="M21 21l7 6-1 1zM43 21l-6 7-1-1zM43 43l-7-6 1-1zM21 43l6-7 1 1z" fill="#e8492e"/><circle cx="32" cy="32" r="3.200" fill="#7a4a22"/></svg>`;
  const RADIO = `<svg class="ic" viewBox="0 0 64 64"><path d="M22 20L14 5" stroke="#7a4a22" stroke-width="4" stroke-linecap="round"/><circle cx="13.500" cy="5" r="3.500" fill="#e8492e"/>` +
    `<rect x="9" y="21" width="40" height="38" rx="9" fill="#a52d17"/><rect x="9" y="18" width="40" height="38" rx="9" fill="#e8492e"/><rect x="15" y="24" width="28" height="11" rx="4" fill="#fff6dc"/>` +
    `<path d="M19 29.500h20" stroke="#2f7fd6" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 5"/><circle cx="21" cy="45" r="5.500" fill="#ffc533"/><circle cx="21" cy="45" r="2" fill="#7a4a22"/>` +
    `<path d="M31 41h12M31 45.500h12M31 50h12" stroke="#7a1d0c" stroke-width="2.600" stroke-linecap="round"/>` +
    `<path d="M53 27q5 6 0 13M57.500 22q9 11 0 23" fill="none" stroke="#2f7fd6" stroke-width="3.400" stroke-linecap="round"/></svg>`;
  let el = null, month = 1, hearing = null, clips = {};

  const room = (m, w) => Room.rooms[m + '-' + w];
  const acts = (m, w) => (room(m, w) || Room.rooms['1-1']).things.filter(t => t.type !== 'book' && t.type !== 'stage');
  const opened = n => { const B = get('spbl.airship').built || {}; return n === 1 || (B[n - 1] || []).length >= 4; };

  // everything the report shows for one month
  function read(m) {
    const P = (get('spbl.pages')[m]) || {}, L = (get('gpfis.log').days) || {}, weeks = [], all = new Set();
    for (let w = 1; w <= 4; w++) {
      const D = P[w] || {}, pre = m + '-' + w + '/', plays = {}, days = new Set();
      for (const dk in L) { const A = ((L[dk] || {}).pbl || {}).a || {}; for (const n in A) if (n.startsWith(pre)) { plays[n.slice(pre.length)] = (plays[n.slice(pre.length)] || 0) + (A[n].p || 0); days.add(dk); } }
      for (const id in D) if (D[id] && D[id].at) days.add(dayKey(new Date(D[id].at)));   // a day something was finished is a day played, even with no counter
      days.forEach(d => all.add(d));
      const list = acts(m, w).map(t => { const v = D[t.id] || {}; return { id: t.id, title: t.title, ok: !!v.ok, stars: v.stars || 0, plays: Math.max(plays[t.id] || 0, v.ok ? 1 : 0) }; });
      const R = room(m, w), names = ((window.__sky.ISLES[m] || {}).names) || [];
      weeks.push({ w, q: R ? R.key : names[w - 1] || '', list, days: [...days].sort(),
        video: { ok: !!D._tv, plays: Math.max(plays.video || 0, D._tv ? 1 : 0) }, book: { ok: !!(D.book && D.book.ok), plays: Math.max(plays.book || 0, D.book && D.book.ok ? 1 : 0) },
        stars: list.reduce((s, a) => s + a.stars, 0), max: list.length * 3, done: list.filter(a => a.ok).length });
    }
    return { weeks, days: all.size, done: weeks.reduce((s, x) => s + x.done, 0), total: weeks.reduce((s, x) => s + x.list.length, 0), stars: weeks.reduce((s, x) => s + x.stars, 0) };
  }

  const date = k => { const [y, mo, d] = k.split('-'); return +d + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mo - 1]; };
  const times = n => n ? '×' + n : '';
  function draw() {
    const I = window.__sky.ISL[month - 1], T = read(month), name = (((get('spbl.pages')[1] || {})[1] || {}).mirror || {}).name;
    const canL = month > 1, canR = month < 24 && opened(month + 1);
    el.querySelector('.sheet').innerHTML = `<h1>FLIGHT LOG <small>비행 기록</small></h1><button class="x">✕</button>` +
      `<div class="head"><button class="arr${canL ? '' : ' no'}" data-d="-1">‹</button><img class="isl" src="art/${I.a}.png" alt=""><b><span>Island ${I.n}</span> · ${nice(I.t)}</b><button class="arr${canR ? '' : ' no'}" data-d="1">›</button>` +
      `<div class="who">${name ? name + ' · ' : ''}played on this device</div></div>` +
      `<div class="sum"><div class="c1"><img src="art/ship.png" alt=""><p><b>${T.days}</b><span>${T.days === 1 ? 'day' : 'days'} played</span></p></div>` +
      `<div class="c2"><img src="art/cloud1.png" class="sun" alt=""><p><b>${T.done} of ${T.total}</b><span>activities finished</span></p></div>` +
      `<div class="c3">${COMPASS}<p><b>${T.stars}</b><span>speaking stars</span></p></div>` +
      `<div class="c4">${RADIO}<p><b class="nrec">0</b><span>recordings saved</span></p></div></div>` +
      `<div class="tb"><div class="hr"><span>Week</span><span>Days played</span><span>Video · activities · Speech Book &nbsp;(× = times played)</span><span>Stars</span><span></span></div>` +
      T.weeks.map(x => { const off = !x.days.length && !x.video.ok && !x.done;
        return `<div class="row${off ? ' off' : ''}" data-w="${x.w}"><div class="wk"><b><i>${x.w}</i>Week ${x.w}</b><p>${x.q}</p></div>` +
          `<div class="days" title="${x.days.map(date).join(', ')}">${[0, 1, 2, 3, 4, 5, 6].map(n => `<img src="art/ship.png" alt=""${n < x.days.length ? ' class="on"' : ''}>`).join('')}<span>${x.days.length ? x.days.length + (x.days.length === 1 ? ' day' : ' days') : ''}<small>${x.days.length ? 'last: ' + date(x.days[x.days.length - 1]) : ''}</small></span></div>` +
          `<div class="steps"><div class="st pic ${x.video.ok ? 'done' : x.video.plays ? 'part' : ''}" title="Video"><u><img src="art/things/tv.png" alt=""></u><em>${times(x.video.plays)}</em></div>` +
          x.list.map((a, i) => `<div class="st ${a.ok ? 'done' : a.plays ? 'part' : ''}" data-id="${a.id}" title="${a.title}${a.stars ? ' · ' + '★'.repeat(a.stars) : ''}"><u><img src="art/cloud1.png" alt=""><b>${i + 1}</b></u><em>${times(a.plays)}</em></div>`).join('') +
          `<div class="st pic ${x.book.ok ? 'done' : x.book.plays ? 'part' : ''}" title="My Speech Book"><u><img src="art/things/book.png" alt=""></u><em>${times(x.book.plays)}</em></div></div>` +
          `<div class="stars">${x.stars ? '★ ' + x.stars + ' <s>/ ' + x.max + '</s>' : ''}</div><button class="hear" disabled>▶ Hear</button></div>`; }).join('') + `</div>` +
      `<div class="key"><span><u class="st done"><img src="art/cloud1.png" alt=""></u>finished</span><span><u class="st part"><img src="art/cloud1.png" alt=""></u>started, not finished</span><span><u class="st"><img src="art/cloud1.png" alt=""></u>not started</span><span><img class="kship" src="art/ship.png" alt="">one airship = one day played</span></div>`;
    el.querySelector('.x').addEventListener('click', close);
    el.querySelectorAll('.arr').forEach(a => a.addEventListener('click', () => { if (a.classList.contains('no')) { K().snd.nope(); return; } stop(); month += +a.dataset.d; K().snd.pop(); draw(); }));
    el.querySelectorAll('.hear').forEach(b => b.addEventListener('click', () => hear(+b.closest('.row').dataset.w, b)));
    // her recordings: looked up after the page is drawn (the store answers a moment later)
    const m = month; clips = {}; let total = 0;
    T.weeks.forEach(x => Promise.all(x.list.map(a => Room.voice.get(`${m}-${x.w}-${a.id}`).then(b => b ? { id: a.id, blob: b } : null))).then(got => {
      if (m !== month || !el) return; got = got.filter(Boolean); clips[x.w] = got; total += got.length;
      const b = el.querySelector(`.row[data-w="${x.w}"] .hear`); if (b && got.length) { b.disabled = false; b.innerHTML = '▶ Hear ' + got.length; b.closest('.row').classList.remove('off'); }
      const n = el.querySelector('.nrec'); if (n) n.textContent = total;
    }));
  }

  // "Hear": that week's recordings one after another, in page order; the cloud of the page being heard hops. Press again to stop.
  function stop() {
    if (!hearing) return; const h = hearing; hearing = null; try { h.au.pause(); } catch (e) {} URL.revokeObjectURL(h.url);
    if (h.btn.isConnected) { h.btn.classList.remove('on'); h.btn.innerHTML = '▶ Hear ' + h.n; } if (el) el.querySelectorAll('.st.now').forEach(s => s.classList.remove('now'));
  }
  function hear(w, btn) {
    const mine = hearing && hearing.btn === btn; stop(); if (mine) return;
    const list = clips[w] || []; if (!list.length) return;
    K().snd.pop();
    btn.classList.add('on'); btn.innerHTML = '■ Stop';
    const h = hearing = { btn, n: list.length, au: new Audio(), url: '' }; let i = 0;
    const next = () => {
      if (hearing !== h) return; if (h.url) URL.revokeObjectURL(h.url);
      el.querySelectorAll('.st.now').forEach(s => s.classList.remove('now'));
      if (i >= list.length) return stop();
      const c = list[i++], st = el.querySelector(`.row[data-w="${w}"] .st[data-id="${c.id}"]`); if (st) st.classList.add('now');
      h.url = URL.createObjectURL(c.blob); h.au.src = h.url; h.au.onended = () => setTimeout(next, 350); h.au.onerror = next; h.au.play().catch(next);
    };
    next();
  }

  function fit() { if (el) el.style.setProperty('--s', Math.min(1, (K().W() - 60) / 1500).toFixed(3)); }
  function open(m) {
    if (el || document.body.classList.contains('inroom')) return;
    try { if (window.GPTrack) window.GPTrack.sync(); } catch (e) {}
    const here = document.body.classList.contains('onisle') && +(($('#place i') || {}).textContent || 0);
    month = m || here || Math.max(1, ...window.__sky.ISL.map(I => I.n).filter(opened));
    el = document.createElement('div'); el.id = 'log'; el.innerHTML = '<div class="sheet"></div>'; $('#stage').appendChild(el);
    el.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === el) close(); });
    fit(); draw(); K().snd.boing(); if (window.Crew) { Crew.hush(); Crew.mute(true); }   // the helpers stay quiet while the report is open
  }
  function close() { if (!el) return; stop(); el.remove(); el = null; K().snd.pop(); if (window.Crew) Crew.mute(false); }
  addEventListener('resize', () => setTimeout(fit, 0));
  addEventListener('DOMContentLoaded', () => { const b = $('#logbtn'); if (b) b.addEventListener('click', () => el ? close() : open()); });
  addEventListener('load', () => { const h = location.hash.match(/log(?:=(\d+))?/); if (h) setTimeout(() => open(+h[1] || 0), 400); });
  return { open, close, read };
})();
