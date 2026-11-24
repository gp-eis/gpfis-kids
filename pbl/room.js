/* Inside a place: the week's steps, ONE AFTER ANOTHER (user, 23 Nov): video -> the activities in order -> My Speech Book (the boss's name for it, 23 Nov).
   The room painting is only a soft backdrop with THREE buttons: Video, one big START, My book (user, 23 Nov: one button, not a
   Play press for every activity). START opens the first unfinished worksheet page; its Next button goes straight to the next page.
   The video opens as a pop-up player (full screen and jumping along the timeline are the player's own controls).
   Every activity is one worksheet page: PLAY first, then SAY IT (shared GPFIS speaking kit), then Done.
   The child's best recording of each sentence is kept on this device (IndexedDB spbl-voice) and goes into MY BOOK:
   one page per activity with their work, their sentence and "Hear me!". "Hear my whole book" is the finale (it replaces
   the separate Speech Time step) and finishes the place.
   A room is DATA (see ROOMS at the bottom): its painting, its key question, and for each activity a TYPE plus that page's words.
   Every finished page is saved per month and week (localStorage spbl.pages) so a library can later bind the month's book. */
window.Room = (() => {
  const K = () => window.__kit, PKEY = 'spbl.pages';
  const load = () => { try { return JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) { return {}; } };
  let all = load(), D = null, ctx = null, box = null, rp = null, R = null;
  const save = () => { try { localStorage.setItem(PKEY, JSON.stringify(all)); } catch (e) {} };
  const sc = () => innerHeight / 820, rnd = (a, b) => a + Math.random() * (b - a), wait = ms => new Promise(r => setTimeout(r, ms));
  const isDone = id => !!(D[id] && D[id].ok);
  const plays = () => R.things.filter(t => t.type !== 'book' && t.type !== 'stage');
  const allPlayed = () => plays().every(t => isDone(t.id));
  const bookT = () => R.things.find(t => t.type === 'book');
  const count = () => plays().filter(t => isDone(t.id)).length;
  // the fixed order: the video, each activity, then the book. cur() = the first step that is not finished yet
  const steps = () => ['tv', ...plays(), bookT()].filter(Boolean);
  const stepDone = st => st === 'tv' ? !!D._tv : isDone(st.id);
  const cur = () => steps().find(st => !stepDone(st)) || null;
  const lockedNow = t => t.type === 'stage' || (t.type === 'book' ? !allPlayed() : plays().indexOf(t) > plays().findIndex(x => !isDone(x.id)) && !isDone(t.id) && plays().some(x => !isDone(x.id)));
  // the child's own recordings, kept on this device only (never uploaded)
  const VDB = (() => {
    let p; const db = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open('spbl-voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = (mode, f) => db().then(d => new Promise((res, rej) => { const q = f(d.transaction('clips', mode).objectStore('clips')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })).catch(() => null);
    return { put: (k, b) => tx('readwrite', st => st.put(b, k)), get: k => tx('readonly', st => st.get(k)) };
  })();
  if (/[?&]reset/.test(location.search)) { try { indexedDB.deleteDatabase('spbl-voice'); } catch (e) {} }
  const vkey = id => `${ctx.month}-${ctx.week}-${id}`;
  const keepClip = (id, url) => { if (url) fetch(url).then(r => r.blob()).then(b => VDB.put(vkey(id), b)).catch(() => {}); };

  // ---------- talking and listening ----------
  let rc = [];   // the two helpers in the room (crew.js pose pictures)
  // every line is said by Penny or Gerry (crew.js): voice, talking pose, and a speech bubble unless the words are already lit up on screen
  // The children on the phone (Emma, Mia, Tom, Amy ...) speak with three voices the user chose on 24 Nov: the girls take turns
  // with SUNNY and BELLA, boys are HARRY. A new child is added here; an unknown name gets one of the two girl voices by its letters.
  const KID_VOICE = { emma: 'sunny', mia: 'bella', amy: 'sunny', lily: 'bella', tom: 'harry', sam: 'harry', ben: 'harry' };
  const kidVoice = name => { const k = String(name || '').toLowerCase().replace(/[^a-z]/g, ''); return KID_VOICE[k] || ([...k].reduce((a, c) => a + c.charCodeAt(0), 0) % 2 ? 'sunny' : 'bella'); };
  // who: 'penny' | 'gerry' when the page says which helper speaks; any other name = a voice for a child on the phone (sunny, bella, harry; no helper's mouth moves)
  function say(text, el, quiet, who) {
    if (el) el.classList.add('saying');
    const o = { level: 2, quiet: !!el || quiet }; if (who === 'penny' || who === 'gerry') o.who = who; else if (who) o.voice = who;
    return Crew.say(text, o).then(() => { if (el) el.classList.remove('saying'); });
  }
  const chat = (a, level = 1) => Crew.say(Array.isArray(a) ? Crew.pick(a) : a, { level });
  let praiseT = 0, wrongT = 0;

  // ---------- small tools ----------
  function pad(cv, getCol, onInk, getStamp) {
    const c = cv.getContext('2d'); c.lineCap = c.lineJoin = 'round'; let on = false, last = null;
    const p = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
    cv.addEventListener('pointerdown', e => {
      e.stopPropagation(); last = p(e); onInk && onInk(); const st = getStamp && getStamp();
      if (st) { c.font = '64px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(st, last.x, last.y); K().snd.boing(); return; }
      on = true; try { cv.setPointerCapture(e.pointerId); } catch (er) {} c.fillStyle = getCol(); c.beginPath(); c.arc(last.x, last.y, 5, 0, 7); c.fill();
    });
    cv.addEventListener('pointermove', e => { if (!on) return; const q = p(e); c.strokeStyle = getCol(); c.lineWidth = 10; c.beginPath(); c.moveTo(last.x, last.y); c.lineTo(q.x, q.y); c.stroke(); last = q; });
    const up = () => { on = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    return { clear: () => c.clearRect(0, 0, cv.width, cv.height), data: () => cv.toDataURL('image/png'), put: d => { if (!d) return; const im = new Image(); im.onload = () => c.drawImage(im, 0, 0); im.src = d; } };
  }
  const DOTS = ['#1f2a4d', '#e8492e', '#ff9f1c', '#ffd23f', '#2fb86a', '#3a86ff', '#b9a5e6', '#8d5a3b'];
  const dots = st => `<div class="dots">${DOTS.map((c, i) => `<i style="background:${c}" data-c="${c}"${i ? '' : ' class="on"'}></i>`).join('')}${(st || []).map(s => `<s data-s="${s}">${s}</s>`).join('')}<b class="wipe">↺</b></div>`;
  function wireDots(root, getPad) {
    let col = DOTS[0], stamp = '';
    const els = [...root.querySelectorAll('.dots i, .dots s')];
    els.forEach(d => d.addEventListener('click', () => { col = d.dataset.c || col; stamp = d.dataset.s || ''; els.forEach(x => x.classList.toggle('on', x === d)); K().snd.pop(); }));
    root.querySelector('.wipe').addEventListener('click', () => { getPad().clear(); K().snd.boing(); });
    return { col: () => col, stamp: () => stamp };
  }
  // drag a thing with a finger; onDrop(target) says whether it was right (wrong ones spring back)
  function drag(el, targets, onDrop) {
    let sx, sy, on = false;
    el.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); if (el.classList.contains('gone')) return; on = true; sx = e.clientX; sy = e.clientY; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (er) {} K().snd.pop(); });
    el.addEventListener('pointermove', e => { if (on) el.style.translate = `${(e.clientX - sx) / sc()}px ${(e.clientY - sy) / sc()}px`; });
    const up = () => {
      if (!on) return; on = false; el.classList.remove('drag');
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const t = targets().find(q => { const b = q.getBoundingClientRect(); return cx > b.left && cx < b.right && cy > b.top && cy < b.bottom; });
      if (!(t && onDrop(t))) { el.style.translate = ''; if (t) wrong(el); }
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  const at = el => { const r = el.getBoundingClientRect(); return K().pt({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }); };
  function right(el, n = 22) { const o = at(el); K().snd.ding(3); K().burst(o.x, o.y, n, 320); K().again(el, 'yes'); cheer(); }
  function wrong(el) { K().snd.nope(); K().again(el, 'no'); if (performance.now() - wrongT > 6000) { wrongT = performance.now(); chat(['Try another one!', 'Oops! Try again.', 'Not that one. Try again!', 'Hmm, have another go!']); } }
  function cheer() {
    if (!box) return; box.querySelectorAll('#act .hl').forEach(m => K().again(m, 'jump')); Crew.all().filter(c => c.rank === 3).forEach(c => c.pose('cheer', 700));
    if (performance.now() - praiseT > 9000) { praiseT = performance.now(); chat(['Good one!', 'Yes!', 'Great!', 'Well done!', 'You got it!', 'Nice!', 'That is right!'], 0); }
  }
  const clap = () => { for (let i = 0; i < 14; i++) setTimeout(() => K().snd.rattle(), i * 90 + rnd(0, 40)); };
  const chipsOf = (list, cls, on) => list.map(([e, w], i) => `<button class="${cls}${on.includes(w) ? ' on' : ''}" data-w="${w}" style="--a:${i * (360 / list.length) - 90}deg;--d:${i * -.45}s"><i>${e}</i>${w}</button>`).join('');
  const emo = (t, w) => ((t.words || t.items || t.likes || []).find(x => x[1] === w) || [''])[0];

  // ---------- the room ----------
  function lay() {
    if (!rp) return; const k = K(), w = k.W(), h = w * 941 / 1672;   // always the room's full width; pinned to the top so the TV shows
    rp.style.cssText = `left:0;top:0;width:${w}px;height:${h}px`;
  }
  let flow = false;   // true while the child is going through the pages with Next (started from START)
  function open(c) {
    ctx = c; R = ROOMS[c.month + '-' + c.week] || ROOMS['1-1']; flow = false;
    all = load(); all[c.month] = all[c.month] || {}; D = all[c.month][c.week] = all[c.month][c.week] || {};
    box = document.querySelector('#inside');
    const bt = bookT();
    box.innerHTML = `<div class="rpic soft"><img class="bg" src="${R.art}" alt=""></div><div class="rwash"></div>` +
      `<button class="nowc"><i class="tagl"></i><h1></h1><p></p></button>` +
      `<div class="hub"><button class="stn sp" data-id="tv"><img src="art/things/tv.png" alt=""><b>Video</b><s></s></button>` +
      `<button class="startb"><b></b><em></em><span class="pr">${plays().map(() => '<i></i>').join('')}</span></button>` +
      (bt ? `<button class="stn sp" data-id="${bt.id}"><img src="art/things/book.png" alt=""><b>My Speech Book</b><s></s></button>` : '') + `</div>` +
      `<img class="rm g" src="art/crew/gerry/stand.webp" alt=""><img class="rm p" src="art/crew/penny/stand.webp" alt="">` +
      `<button class="out pill">← Outside <small>밖으로</small></button><div class="keyq pill"><i>?</i>${R.key}</div><div id="act"></div>`;
    rp = box.querySelector('.rpic'); rc = [Crew.add(box.querySelector('.rm.p'), 'penny', 2), Crew.add(box.querySelector('.rm.g'), 'gerry', 2)]; rc.forEach(c => c.pose('wave', 1400)); lay(); box.classList.add('on'); document.body.classList.add('inroom'); K().snd.boing();
    box.querySelectorAll('.stn').forEach(z => z.addEventListener('click', () => press(z.dataset.id, z)));
    box.querySelector('.startb').addEventListener('click', start);
    // the card says what is next; pressing it does the same as the button it points to
    box.querySelector('.nowc').addEventListener('click', () => { const b = bookT(); if (allPlayed() && b) press(b.id, box.querySelector(`.stn[data-id="${b.id}"]`)); else start(); });
    box.querySelector('.out').addEventListener('click', () => close(false));
    box.querySelector('.keyq').addEventListener('click', () => say(R.key));
    paint();
    // first the week's question, then what to do (one after the other, so neither is cut off)
    setTimeout(() => { if (count() || D._tv) K().toast('Welcome back! Keep going. <small>계속해요!</small>'); else say(R.key).then(() => { if (!closing && box.classList.contains('on') && !box.querySelector('#act.on')) K().toast('Press START! <small>시작 버튼을 눌러요</small>'); }); }, 400);
  }
  // START: the first page that is not finished yet (all finished = from page 1 again), then Next, Next, Next
  function start() {
    const k = K(), P = plays(), t = P.find(x => !isDone(x.id)) || P[0];
    k.again(box.querySelector('.startb'), 'tap'); k.snd.pop(); crew(); Crew.hush(); goPage(t, true);
  }
  function goPage(t, inFlow) { flow = !!inFlow; TYPES[t.type](t); if (INTRO[t.type]) chat(INTRO[t.type]); }
  // the three buttons always show where the child is
  function paint() {
    const P = plays(), n = count(), sb = box.querySelector('.startb'), bt = bookT(), card = box.querySelector('.nowc'), nx = P.find(x => !isDone(x.id));
    const set = (tag, h, p) => { const k2 = tag + h; card.querySelector('.tagl').textContent = tag; card.querySelector('h1').textContent = h; card.querySelector('p').textContent = p; if (card.dataset.at && card.dataset.at !== k2) K().again(card, 'next'); card.dataset.at = k2; };
    if (nx) set(`Activity ${P.indexOf(nx) + 1} of ${P.length}`, nx.title, nx.sub);
    else if (bt && !isDone(bt.id)) set('Last step', 'My Speech Book', 'Open your Speech Book and hear yourself!');
    else set('All done!', 'You finished this place!', 'Press PLAY AGAIN, or open your Speech Book.');
    sb.querySelector('b').textContent = !n ? 'START' : n < P.length ? 'KEEP GOING' : 'PLAY AGAIN';
    sb.querySelector('em').textContent = n < P.length ? `Activity ${n + 1} of ${P.length}` : 'All done!';
    sb.classList.toggle('all', n >= P.length); sb.classList.toggle('long', n > 0);
    [...sb.querySelectorAll('.pr i')].forEach((d, i) => { const was = d.classList.contains('on'); d.classList.toggle('on', isDone(P[i].id)); if (!was && d.classList.contains('on') && sb.dataset.seen) K().again(d, 'won'); });
    sb.dataset.seen = 1;
    const tv = box.querySelector('.stn[data-id="tv"]'); tv.classList.toggle('done', !!D._tv);
    if (bt) { const z = box.querySelector(`.stn[data-id="${bt.id}"]`), ready = allPlayed(), was = z.classList.contains('now');
      z.classList.toggle('done', isDone(bt.id)); z.classList.toggle('later', !ready); z.classList.toggle('now', ready && !isDone(bt.id));
      if (!was && z.classList.contains('now')) { K().again(z, 'won'); const o = at(z); K().burst(o.x, o.y, 30, 360); } }
  }
  let closing = false;
  function close(ok) {   // the clouds close over the room and open on the island again
    if (closing) return; closing = true; Crew.hush();
    const fin = () => { closing = false; box.classList.remove('on'); document.body.classList.remove('inroom'); rp = null; ctx.done(ok); };
    K().wipe ? K().wipe(fin) : fin();
  }
  function crew() { box.querySelectorAll('.rm').forEach(m => K().again(m, 'jump')); rc.forEach(c => c.pose('cheer', 700)); }
  function press(id, z) {
    const k = K(); if (z) k.again(z, 'tap');
    if (id === 'tv') return video();
    const t = R.things.find(x => x.id === id);
    if (t.type === 'book' && !allPlayed()) { k.snd.nope(); if (z) k.again(z, 'no'); return k.toast('Your Speech Book opens when the activities are done. <small>활동을 먼저 해요</small>'); }
    k.snd.pop(); crew(); Crew.hush(); goPage(t, false);
  }

  // ---------- one activity: PLAY, then SAY IT, then Done ----------
  // The speaking turn is the shared GPFIS kit (kit/talk.js, the same piece as gpfis-site/demo/speak.html):
  // it listens, shows the words it hears, lights up each word the child said, gives 1-3 stars and a score, and lets them try again.
  function screen(t, sub, body) {
    const a = box.querySelector('#act'), T = window.Talk, id = t.id, stage = t.type === 'stage';
    a.style.setProperty('--c', t.col);
    const P = plays(), pi = P.indexOf(t), nextT = flow && pi >= 0 ? P[pi + 1] : null;
    a.dataset.id = id;
    a.innerHTML = `<button class="back pill">← Room <small>방으로</small></button><h2>${t.title}</h2><p class="sub">${sub}</p><div class="body">${body}</div>` +
      (pi >= 0 ? `<div class="pgd">${P.map((p, i) => `<i class="${i === pi ? 'now' : isDone(p.id) ? 'on' : ''}" data-i="${i}">${i + 1}</i>`).join('')}</div>` : '') +
      `<img class="hl g" src="art/crew/gerry/stand.webp" alt=""><img class="hl p" src="art/crew/penny/stand.webp" alt="">` +
      `<div class="sayit${stage ? ' speech' : ''}"><div class="row"><i>${stage ? 'Speech Time!' : 'Say it!'}</i><p class="words"></p><div class="res"><b class="st"></b><span class="num"></span></div></div>` +
      `<div class="row"><button class="hear" title="Listen">🔊</button><button class="slow" title="Listen slowly">🐢</button><button class="me" title="Press and speak">🎤</button>` +
      `<button class="mine" title="Hear me" disabled>🙋</button><span class="heard"></span><button class="saidit">I said it! ✋</button></div></div><button class="ok">${nextT ? 'Next ➜' : flow ? 'Finish ✓' : 'Done ✓'}</button>`;
    a.classList.add('on'); delete a.dataset.hinted; Crew.add(a.querySelector('.hl.p'), 'penny', 3); Crew.add(a.querySelector('.hl.g'), 'gerry', 3);
    const ok = a.querySelector('.ok'), bar = a.querySelector('.sayit'), txt = bar.querySelector('.words'), me = bar.querySelector('.me'), mine = bar.querySelector('.mine');
    const heard = bar.querySelector('.heard'), res = bar.querySelector('.res'), manual = bar.querySelector('.saidit');
    let fin = null, line = () => '', played = false, said = false, url = null, after = null, tries = 0, best = 0, listening = false, bestUrl = null, bestS = -1;
    const sync = () => { bar.classList.toggle('on', played); ok.classList.toggle('on', played && said); };
    const setLine = () => { txt.innerHTML = line().split(' ').map(w => `<span class="w">${w}</span>`).join(' '); res.classList.remove('on'); heard.textContent = ''; };
    const tell = (msg, speak) => { heard.textContent = msg; if (speak !== false) return say(msg, null, true); };
    const give = (n, s) => {
      best = Math.max(best, n); res.querySelector('.st').innerHTML = '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i>'; res.querySelector('.num').textContent = s == null ? '' : s + ' / 100';
      K().again(res, 'on'); const o = at(res); K().burst(o.x, o.y, n * 10, 300); T.ding(n); cheer();
    };
    const accept = () => { if (!said) { said = true; sync(); if (after) after(); } };
    // a finished page's dot goes back to that page
    a.querySelectorAll('.pgd i.on').forEach(x => x.addEventListener('click', () => { if (listening) return; Crew.hush(); K().snd.pop(); goPage(P[+x.dataset.i], flow); }));
    a.querySelector('.back').addEventListener('click', () => { Crew.hush(); a.classList.remove('on'); flow = false; paint(); });
    bar.querySelector('.hear').addEventListener('click', () => { if (!listening) say(line(), txt); });
    bar.querySelector('.slow').addEventListener('click', () => { if (listening) return; txt.classList.add('saying'); T.say(line(), { slow: true }).then(() => txt.classList.remove('saying')); });
    let clip = null; mine.addEventListener('click', () => { if (url && !listening) { Crew.hush(); clip = new Audio(url); clip.play(); } });
    manual.addEventListener('click', () => { give(2); tell('Great speaking!'); accept(); });
    me.addEventListener('click', async () => {
      if (listening) return; listening = true; Crew.mute(true); if (clip) { try { clip.pause(); } catch (e) {} }   // nothing may talk over the child's recording
      me.classList.add('live'); heard.textContent = "I'm listening…"; K().snd.pop();
      const long = line().split(' ').length > 8;
      const r = await T.listen({ ms: long ? 18000 : 6000, long, onLevel: v => me.style.setProperty('--lv', v), onWords: w => { heard.textContent = w; } });
      me.classList.remove('live'); me.style.setProperty('--lv', 0); listening = false; Crew.mute(false); tries++;
      if (r.clip) { url = r.clip; mine.disabled = false; }
      if (!r.heard.length) {   // nothing heard: no microphone, or too quiet. Never leave the child stuck.
        wrong(bar); manual.classList.add('on');
        if (tries >= 2) tell('Say it out loud, then press "I said it!"'); else tell("I couldn't hear you. Press the microphone and say it loudly!");
        return;
      }
      heard.textContent = r.heard[0];
      const s = T.score(line(), r.heard), st = T.stars(s);
      txt.querySelectorAll('.w').forEach(w => {
        const W = T.words(w.textContent)[0] || '', hit = r.heard.some(h => T.words(h).some(x => x === W || (x.length > 3 && x.slice(0, 3) === W.slice(0, 3))));
        w.classList.toggle('hit', hit); w.classList.toggle('miss', !hit);
      });
      if (r.clip && s >= bestS) { bestS = s; bestUrl = r.clip; }   // the best try is the one that goes into the book
      give(st, s);
      if (st === 3) { tell(s >= 95 ? 'Perfect! You sound great!' : 'Wonderful speaking!'); accept(); }
      else if (tries >= 3) { tell("Good try! Let's say it together: " + line()); accept(); }
      else { if (st === 2) accept(); tell(st === 2 ? 'Nice! Try once more for three stars!' : 'Good try! Listen and say it again.').then(() => st === 1 && !listening && T.say(line(), { slow: true })); }
    });
    if (!T.canHear) { me.style.display = 'none'; manual.classList.add('on'); }
    ok.addEventListener('click', () => {
      if (!ok.classList.contains('on')) return;
      D[id] = Object.assign(D[id] || {}, fin ? fin() : {}, { ok: true, said: line(), stars: Math.max(best, (D[id] || {}).stars || 0), at: Date.now() }); save();
      if (bestUrl || url) { keepClip(id, bestUrl || url); D[id].voice = 1; save(); }
      const k = K(); k.snd.win(); k.burst(k.W() / 2, 380, 40, 440); paint();
      if (nextT) { Crew.hush(); k.again(a, 'on'); return goPage(nextT, true); }   // straight on to the next worksheet page
      a.classList.remove('on'); flow = false; crew();
      k.toast(allPlayed() && bookT() && !isDone(bookT().id) ? 'All done! Your Speech Book is ready. Open it! <small>스피치 북을 열어 봐요</small>' : 'Well done! <small>잘했어요!</small>');
    });
    return {
      a, body: a.querySelector('.body'),
      // the play part is finished (or not any more): bring in the sentence to say
      ready(v) { const was = played; played = v !== false; if (!said) setLine(); sync(); if (played && !was) { K().snd.boing(); setTimeout(() => { heard.textContent = 'Listen, then press the microphone and say it!'; say(line(), txt); }, 350); } },
      line(f) { line = () => String(f()).replace(/[‘’]/g, "'"); }, onSave(f) { fin = f; }, onSaid(f) { after = f; }
    };
  }

  // ---------- the activity types (one per kind of worksheet page) ----------
  const TYPES = {
    // draw your face in a mirror, then build your name from letter tiles
    mirror(t) {
      const old = D[t.id] || {}; let name = old.name || '', ink = !!old.draw;
      const s = screen(t, t.sub, `<div class="mir"><canvas width="420" height="520"></canvas><u></u></div><div class="side">${dots()}<p class="line">My name is <b class="nm"></b></p><div class="keys">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => `<button>${l}</button>`).join('')}<button class="del">⌫</button></div></div>`);
      let P; const tool = wireDots(s.a, () => P); P = pad(s.a.querySelector('canvas'), tool.col, () => { ink = true; chk(); }); P.put(old.draw);
      const nm = s.a.querySelector('.nm'), show = () => { nm.innerHTML = name ? name.split('').map(l => `<span>${l}</span>`).join('') : '…'; };
      const chk = () => s.ready(ink && name.length > 0);
      s.a.querySelectorAll('.keys button').forEach((b, i) => b.addEventListener('click', () => {
        if (b.classList.contains('del')) { name = name.slice(0, -1); K().snd.boing(); }
        else if (name.length < 10) { name += name ? b.textContent.toLowerCase() : b.textContent; K().snd.ding(i % 12); K().again(b, 'yes'); }
        show(); chk();
      }));
      s.line(() => t.line({ name })); s.onSave(() => ({ draw: P.data(), name })); s.onSaid(() => K().again(s.a.querySelector('.mir'), 'yes'));
      show(); chk();
    },
    // a friend calls: answer, listen to their lines, then pop the balloon with the right answer
    call(t) {
      const s = screen(t, t.sub, `<div class="call"><div class="ring"><b>${t.icon || '📞'}</b><span>${t.who} is calling…</span><button class="pick">Answer</button></div><img class="kid" src="${t.kid}" alt=""><div class="bub">${t.lines.map(l => `<p>${l}</p>`).join('')}<button class="again">🔊 Listen again</button></div></div>` +
        `<div class="pop"><b>${t.ask}</b><div class="bal">${t.opts.map((n, i) => `<button data-v="${n}" style="--h:${[205, 8, 130][i % 3]}"><i${String(n).length > 2 ? ' class="wide"' : ''}>${n}</i></button>`).join('')}</div></div>`);
      const call = s.a.querySelector('.call'), ps = [...s.a.querySelectorAll('.bub p')], pop = s.a.querySelector('.pop'); let ringing = true;
      (async () => { while (ringing && s.a.classList.contains('on')) { K().snd.ding(7); await wait(220); K().snd.ding(9); await wait(900); } })();
      const talk = async () => { for (const p of ps) { if (!s.a.classList.contains('on')) return; p.classList.add('in'); await say(p.textContent, p, false, kidVoice(t.who)); } pop.classList.add('on'); K().snd.boing(); };
      s.a.querySelector('.pick').addEventListener('click', () => { ringing = false; call.classList.add('live'); K().snd.win(); cheer(); setTimeout(talk, 500); });
      s.a.querySelector('.again').addEventListener('click', talk);
      s.a.querySelectorAll('.bal button').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.v !== String(t.ans)) return wrong(b);
        const o = at(b); K().snd.poof(); K().burst(o.x, o.y, 34, 420); b.classList.add('popped'); cheer(); s.ready();
      }));
      s.line(() => t.line({}));
    },
    // drag each thing to the friend it belongs to (two or three friends)
    sort(t) {
      const fr = t.targets.map((g, k) => `<button class="fr" data-k="${k}"><img src="${g.img}" alt=""><span>${g.text}</span><div class="got"></div></button>`);
      const pile = `<div class="pile">${t.items.map(([e, k], i) => `<b class="it" data-k="${k}" style="--d:${i * -.4}s">${e}</b>`).join('')}</div>`;
      const s = screen(t, t.sub, (t.targets.length === 2 ? fr[0] + pile + fr[1] : `<div class="frs">${fr.join('')}</div>` + pile) + `<h3 class="big">${t.big}</h3>`);
      if (t.targets.length > 2) s.body.classList.add('three');
      const frs = [...s.a.querySelectorAll('.fr')]; let left = t.items.length;
      frs.forEach(b => b.addEventListener('click', () => { K().again(b, 'yes'); say(b.querySelector('span').textContent, b.querySelector('span')); }));
      s.a.querySelectorAll('.it').forEach(it => drag(it, () => frs, g => {
        if (g.dataset.k !== it.dataset.k) { say('Try another friend!'); return false; }
        it.classList.add('gone'); g.querySelector('.got').append(Object.assign(document.createElement('i'), { textContent: it.textContent })); right(g, 16);
        if (--left === 0) { s.a.querySelector('.big').classList.add('on'); K().snd.win(); s.ready(); }
        return true;
      }));
      setTimeout(async () => { for (const b of frs) { if (!s.a.classList.contains('on')) return; await say(b.querySelector('span').textContent, b.querySelector('span')); } }, 500);
      s.line(() => t.line({}));
    },
    // catch the floating words that are true; they join the middle word on a mind map
    mind(t) {
      let mine = ((D[t.id] || {}).words || []).slice(); const n = t.words.length;
      const s = screen(t, t.sub, `<div class="mm"><svg viewBox="0 0 900 500"></svg><span class="me${t.centre.length > 2 ? ' long' : ''}">${t.centre}</span>${chipsOf(t.words, 'wd', mine)}</div>`);
      const svg = s.a.querySelector('svg'), me = s.a.querySelector('.me'), ws = [...s.a.querySelectorAll('.wd')];
      const draw = () => {
        svg.innerHTML = ws.map((b, i) => { const a = (i * (360 / n) - 90) * Math.PI / 180; return mine.includes(b.dataset.w) ? `<line x1="450" y1="250" x2="${450 + Math.cos(a) * 300}" y2="${250 + Math.sin(a) * 185}"/>` : ''; }).join('');
        ws.forEach(b => b.classList.toggle('on', mine.includes(b.dataset.w))); me.style.setProperty('--g', 1 + mine.length * .06); s.ready(mine.length >= (t.min || 2));
      };
      ws.forEach(b => b.addEventListener('click', () => {
        const w = b.dataset.w; if (mine.includes(w)) { mine = mine.filter(x => x !== w); K().snd.boing(); } else { mine.push(w); right(b, 14); K().again(me, 'yes'); say(t.say(w)); }
        draw();
      }));
      s.line(() => t.line({ words: mine })); s.onSave(() => ({ words: mine })); draw();
    },
    // a shelf or chest of toys: each does its own trick; take the ones that are true for you
    toys(t) {
      let good = ((D[t.id] || {}).good || []).slice();
      const s = screen(t, t.sub, `<div class="sh">${t.items.map(([e, w, tr]) => `<button class="toy ${tr}" data-w="${w}"><i>${e}</i><span>${w}</span></button>`).join('')}</div><p class="line2">${t.lead} <b></b>${t.tail ? ' ' + t.tail : ''}</p>`);
      const ts = [...s.a.querySelectorAll('.toy')], out = s.a.querySelector('.line2 b');
      const draw = () => { ts.forEach(b => b.classList.toggle('on', good.includes(b.dataset.w))); out.textContent = good.length ? good.join(' and ') + (t.tail ? '' : '.') : '…'; s.ready(good.length >= 1); };
      ts.forEach((b, i) => b.addEventListener('click', () => {
        const w = b.dataset.w; K().again(b, 'go');
        ({ sing: () => K().snd.win(), run: () => K().snd.whoosh(), stack: () => K().snd.rattle(), beat: () => { K().snd.boing(); setTimeout(K().snd.boing, 260); }, flip: () => K().snd.poof(), scrib: () => K().snd.ding(i) })[t.items[i][2]]();
        if (good.includes(w)) good = good.filter(x => x !== w); else { good.push(w); const o = at(b); K().burst(o.x, o.y, 16, 300); cheer(); say(t.say(w)); }
        draw();
      }));
      s.line(() => t.line({ good })); s.onSave(() => ({ good })); draw();
    },
    // paint a picture (with stamps); some pages also ask to pick one thing
    paint(t) {
      const old = D[t.id] || {}; let like = old.like || '', ink = !!old.draw;
      const s = screen(t, t.sub, `<div class="pol"><canvas width="420" height="460"></canvas></div><div class="side">${dots(['⭐', '❤️', '🌈', '👑'])}` +
        (t.likes ? `<p class="line2">${t.lead} <b></b></p><div class="likes">${chipsOf(t.likes, 'lk', [like])}</div>` : `<p class="line2">${t.caption}</p>`) + `</div>`);
      let P; const tool = wireDots(s.a, () => P); P = pad(s.a.querySelector('canvas'), tool.col, () => { ink = true; chk(); }, tool.stamp); P.put(old.draw);
      const ls = [...s.a.querySelectorAll('.lk')], out = s.a.querySelector('.line2 b');
      const chk = () => { ls.forEach(b => b.classList.toggle('on', b.dataset.w === like)); if (out) out.textContent = like ? like + '.' : '…'; s.ready(ink && (!t.likes || !!like)); };
      ls.forEach(b => b.addEventListener('click', () => { like = b.dataset.w; right(b, 14); say(t.say(like)); chk(); }));
      s.line(() => t.line({ like })); s.onSave(() => ({ draw: P.data(), like })); chk();
    },
    // interview a friend: ask each question, listen, then tap what they said
    ask(t) {
      const s = screen(t, t.sub, `<img class="kid small" src="${t.friend}" alt=""><div class="iv"><div class="bub one"><p>Ask me!</p></div><div class="qs">${t.qs.map((q, i) => `<button data-i="${i}">${q.q}</button>`).join('')}</div><div class="opts"></div></div>`);
      const bub = s.a.querySelector('.bub p'), opts = s.a.querySelector('.opts'), qb = [...s.a.querySelectorAll('.qs button')]; let left = t.qs.length;
      qb.forEach((b, i) => b.addEventListener('click', async () => {
        if (b.classList.contains('tick')) return; const q = t.qs[i]; K().snd.pop(); qb.forEach(x => x.classList.toggle('cur', x === b));
        opts.innerHTML = ''; await say(q.q); bub.textContent = q.say; K().again(bub.parentElement, 'yes'); await say(q.say, bub, false, /^(penny|gerry)$/i.test(t.who || '') ? t.who.toLowerCase() : undefined);
        opts.innerHTML = `<b>What did ${t.who} say?</b>` + q.opts.map(([e, w]) => `<button class="lk" data-w="${w}"><i>${e}</i>${w}</button>`).join('');
        opts.querySelectorAll('.lk').forEach(o => o.addEventListener('click', () => {
          if (o.dataset.w !== q.a) return wrong(o);
          right(o, 16); b.classList.add('tick'); b.classList.remove('cur'); opts.innerHTML = '';
          if (--left === 0) s.ready();
        }));
      }));
      s.line(() => t.line({}));
    },
    // MY BOOK: the online version of the whole worksheet. One page per activity: the child's work, their sentence,
    // and their own recording ("Hear me!"). "Hear my whole book" plays every page in turn and finishes the place.
    book(t) {
      const a = box.querySelector('#act'), P = plays(); let n = -1, busy = false, audio = null, urls = {};   // n = -1 is the COVER (the month's worksheet cover); the pages are 0..
      a.style.setProperty('--c', t.col);
      a.innerHTML = `<button class="back pill">← Room <small>방으로</small></button><h2>My Speech Book</h2>` +
        `<div class="bk"><div class="pg l"><h3></h3><div class="work"></div><small class="ft"></small><div class="sheet"></div></div><div class="pg r"><div class="cov"><img src="art/pages/${ctx.month}/cover.webp" alt="" onerror="this.remove()"><b class="by"></b></div><div class="sent"></div>` +
        `<button class="hearme"><b>▶</b><span class="wv">${[18, 34, 52, 40, 64, 30, 48, 58, 26, 44, 60, 36, 20, 46].map((h, i) => `<i style="height:${h}px;--d:${i * -.09}s"></i>`).join('')}</span><em></em></button>` +
        `<div class="bst"></div><button class="again">🎤 Say it again</button></div></div>` +
        `<button class="bturn prev">‹</button><button class="bturn next">›</button>` +
        `<div class="pdots"><i data-n="-1" class="cv">Cover</i>${P.map((_, i) => `<i data-n="${i}">${i + 1}</i>`).join('')}<button class="hearall">▶ Hear my whole book</button></div>` +
        `<img class="hl g" src="art/crew/gerry/stand.webp" alt=""><img class="hl p" src="art/crew/penny/stand.webp" alt=""><button class="ok">Done ✓</button>`;
      a.classList.add('on'); delete a.dataset.hinted; Crew.add(a.querySelector('.hl.p'), 'penny', 3); Crew.add(a.querySelector('.hl.g'), 'gerry', 3);
      const $ = q => a.querySelector(q), ok = $('.ok'), hm = $('.hearme'), bk = $('.bk');
      if (isDone(t.id)) ok.classList.add('on');
      const d = i => D[P[i].id] || {};
      // what the child made on that page: their drawing, the things they chose, or the page's own picture
      const work = (p, v) => {
        if (v.draw) return `<img class="dr" src="${v.draw}" alt="">${v.name ? `<div class="nm2">${v.name}</div>` : ''}`;
        const ws = v.words || v.good || (v.like ? [v.like] : null);
        if (ws && ws.length) return `<div class="chips2">${ws.map(w => `<span><i>${emo(p, w)}</i>${w}</span>`).join('')}</div>`;
        if (v.n) return `<div class="blk2">${Array.from({ length: Math.min(10, v.n) }, (_, i) => `<i style="background:${['#e8492e', '#ffd23f', '#3a86ff', '#2fb86a', '#b9a5e6'][i % 5]}"></i>`).join('')}</div>`;
        const ims = p.kid ? [p.kid] : (p.targets || []).map(x => x.img).filter(Boolean);
        return ims.length ? `<div class="kids2">${ims.map(u => `<img src="${u}" alt="">`).join('')}</div>` : `<div class="star2">⭐</div>`;
      };
      const seenPg = new Set();   // Done lights up once every page has been opened (or the whole book has been heard)
      let audioDone = null, halt = false;   // halt = the child pressed Stop
      const stop = () => { if (audio) { try { audio.pause(); } catch (e) {} audio = null; } if (audioDone) { const f = audioDone; audioDone = null; f(); } hm.classList.remove('playing'); Crew.mute(false); Crew.hush(); };
      const show = dir => {
        // the cover: the book is shut, only the worksheet cover shows, with the child's name on it
        bk.classList.toggle('cover', n < 0);
        a.querySelectorAll('.pdots i').forEach(x => x.classList.toggle('on', +x.dataset.n === n));
        $('.prev').classList.toggle('off', n < 0); $('.next').classList.toggle('off', n === P.length - 1);
        if (n < 0) { const nm = (Object.values(D).find(x => x && x.name) || {}).name; $('.cov .by').textContent = nm ? 'by ' + nm : ''; return; }
        const p = P[n], v = d(n);
        // each spread wears the colour of its worksheet page, like the printed book (white title on dark colours, dark on light ones)
        const col = (p.page && p.pageCol) || p.col || '#fffaf0', h = col.replace('#', '');   // a real worksheet page: the facing page takes ITS colour
        const lum = (parseInt(h.slice(0, 2), 16) * .299 + parseInt(h.slice(2, 4), 16) * .587 + parseInt(h.slice(4, 6), 16) * .114) / 255;
        [$('.pg.l'), $('.pg.r')].forEach(x => { x.style.setProperty('--pc', col); x.classList.toggle('lt', lum > .7); });
        $('.pg.l h3').innerHTML = `<span>Page ${n + 1}</span>${p.title}`; $('.work').innerHTML = work(p, v);
        // an activity that matches a printed worksheet page shows THAT page, with the child's own drawing and words placed where they answer
        // (spots are in the page's own pixels, 905 x 1280; the .sheet box is scaled down to the book page)
        $('.pg.l').classList.toggle('sheeted', !!p.page);
        $('.pg.l .sheet').innerHTML = !p.page ? '' : `<img class="pgimg" src="${p.page}" alt="">` + (p.spots || []).map(sp => {
          if (sp.draw) { const [x, y, w, h] = sp.draw; return v.draw ? `<img class="mine" src="${v.draw}" alt="" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${sp.oval ? 'clip-path:ellipse(50% 50%);' : ''}${sp.rot ? `rotate:${sp.rot}deg;` : ''}">` : ''; }
          if (sp.text) { const tx = sp.text(v) || ''; return tx ? `<div class="ink" style="left:${sp.at[0]}px;top:${sp.at[1]}px;font-size:${sp.size}px;${sp.rot ? `rotate:${sp.rot}deg;` : ''}">${String(tx).replace(/</g, '&lt;')}</div>` : ''; }
          if (sp.ring) { const [x, y, r] = sp.ring; return v.ok ? `<div class="ring" style="left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px"></div>` : ''; }
          return ''; }).join('');
        $('.pg.l .ft').textContent = `START PBL · ${ctx.month} · WEEK ${ctx.week} · ${String(n + 1).padStart(2, '0')}`;
        $('.sent').textContent = v.said || '…'; $('.bst').innerHTML = '★'.repeat(v.stars || 0) + '<i>' + '★'.repeat(3 - (v.stars || 0)) + '</i>';
        hm.querySelector('em').textContent = v.voice ? 'Hear me!' : 'Listen!';
        seenPg.add(n); if (seenPg.size >= P.length && !ok.classList.contains('on')) { ok.classList.add('on'); if (!a.classList.contains('reading')) { K().snd.win(); cheer(); } }
      };
      // TURN THE PAGE like a real book: the page lifts at its outer edge and swings over the spine.
      // Its front is the page you were on; its back is the page you land on.
      let flipping = false;
      const turn = m => {
        if (m === n || flipping) return; flipping = true;
        const dir = m > n ? 1 : -1, pl = $('.pg.l'), pr = $('.pg.r'), oldL = pl.cloneNode(true), oldR = pr.cloneNode(true);
        const fromCover = n < 0; n = m; show(0);
        const newL = pl.cloneNode(true), newR = pr.cloneNode(true);
        const cover = dir > 0 ? oldL : oldR, front = dir > 0 ? oldR : oldL, back = dir > 0 ? newL : newR;
        if (fromCover) front.classList.add('iscover'); if (n < 0) back.classList.add('iscover');   // the turning page is the cover itself
        cover.classList.add('cover'); if (!fromCover) bk.appendChild(cover);                    // the side that is still hidden under the turning page
        const f = document.createElement('div'); f.className = 'flp ' + (dir > 0 ? 'r' : 'l');
        front.classList.add('fside'); back.classList.add('bside'); f.append(front, back); bk.appendChild(f);
        const fz = (location.hash.match(/flip=(-?[\d.]+)/) || [])[1];   // checking stills: #flip=0.5 stops the page half-way round (minus = turning back)
        if (fz) { bk.classList.add('turning'); f.style.transition = 'none'; f.style.transform = `rotateY(${(dir > 0 ? -180 : 180) * Math.abs(+fz)}deg)`; bk.querySelectorAll('.pg').forEach(x => x.style.setProperty('--fz', Math.sin(Math.PI * Math.abs(+fz)))); bk.classList.add('frozen'); return; }
        K().snd.whoosh(); bk.classList.add('turning'); void f.offsetWidth; f.classList.add('go');
        setTimeout(() => K().snd.poof(), 400);
        setTimeout(() => { cover.remove(); f.remove(); bk.classList.remove('turning'); flipping = false; }, 640);
      };
      // play this page: the child's own recording if there is one, else a helper reads the sentence
      const playPage = async () => {
        const v = d(n), id = P[n].id; hm.classList.add('playing');
        let blob = v.voice ? await VDB.get(vkey(id)) : null;
        if (blob && a.classList.contains('on')) {
          Crew.mute(true); urls[id] = urls[id] || URL.createObjectURL(blob);
          await new Promise(res => { audioDone = res; audio = new Audio(urls[id]); audio.onended = audio.onerror = res; audio.play().catch(res); setTimeout(res, 20000); });
          audioDone = null; audio = null; Crew.mute(false);
        } else if (v.said) await say(v.said, $('.sent'));
        hm.classList.remove('playing');
      };
      // Hear me: press again to stop
      hm.addEventListener('click', async () => { if (n < 0 || a.classList.contains('reading')) return; if (busy) { stop(); return; } busy = true; stop(); K().snd.pop(); await playPage(); busy = false; });
      const go = k2 => { if (busy || flipping) return; const m = n + k2; if (m < -1 || m >= P.length) return wrong(bk); stop(); turn(m); };
      $('.next').addEventListener('click', () => go(1)); $('.prev').addEventListener('click', () => go(-1));
      a.querySelectorAll('.pdots i').forEach(x => x.addEventListener('click', () => { if (busy || flipping) return; const m = +x.dataset.n; if (m === n) return; stop(); turn(m); }));
      // Hear my whole book: every page in turn. While it plays the button is a STOP button.
      const ha = $('.hearall');
      ha.addEventListener('click', async () => {
        if (a.classList.contains('reading')) { halt = true; stop(); K().snd.pop(); return; }
        if (busy || flipping) return; busy = true; halt = false; stop(); K().snd.pop(); a.classList.add('reading'); ha.textContent = '■ Stop';
        let all = true;
        for (let i = 0; i < P.length; i++) {
          if (halt || !a.classList.contains('on')) { all = false; break; }
          if (i !== n) { turn(i); await wait(680); } await wait(450); if (halt) { all = false; break; }
          await playPage(); if (halt) { all = false; break; } await wait(350);
        }
        a.classList.remove('reading'); ha.textContent = '▶ Hear my whole book'; busy = false;
        if (all && a.classList.contains('on')) { ok.classList.add('on'); clap(); cheer(); const k = K(); let i = 0; const iv = setInterval(() => { k.burst(rnd(150, k.W() - 150), rnd(120, 420), 16, 320); if (++i > 6) clearInterval(iv); }, 220); chat('What a wonderful Speech Book! Press Done.', 2); }
      });
      $('.again').addEventListener('click', () => { if (busy || n < 0) return; stop(); const p = P[n]; goPage(p, false); });
      $('.back').addEventListener('click', () => { stop(); a.classList.remove('on'); });
      ok.addEventListener('click', () => {
        if (!ok.classList.contains('on')) return; stop();
        const first = !isDone(t.id); D[t.id] = Object.assign(D[t.id] || {}, { ok: true, at: Date.now() }); save();
        const k = K(); k.snd.win(); k.burst(k.W() / 2, 380, 40, 440); a.classList.remove('on'); paint(); crew();
        if (first) setTimeout(() => close(true), 900);   // the whole book has been heard: this place is finished
      });
      const fz0 = (location.hash.match(/flip=(-?[\d.]+)/) || [])[1]; if (fz0) setTimeout(() => { if (+fz0 < 0) { n = 2; show(0); turn(1); } else turn(1); }, 300);
      show(0); chat(isDone(t.id) ? 'Here is your Speech Book again!' : 'This is your Speech Book! Turn the pages and hear yourself.', 2);
      bk.addEventListener('click', () => { if (n < 0) go(1); });   // press the cover to open the book
    },
    // a few quick questions, one card at a time: look or listen, then tap the right answer
    pick(t) {
      const s = screen(t, t.sub, `<div class="pk"><div class="show"></div><div class="po"></div><div class="pips">${t.rows.map(() => '<i></i>').join('')}</div></div>`);
      const show = s.a.querySelector('.show'), po = s.a.querySelector('.po'), pips = [...s.a.querySelectorAll('.pips i')]; let n = 0;
      const draw = () => {
        const r = t.rows[n]; show.innerHTML = r.show; K().again(show, 'yes'); pips.forEach((p, i) => p.classList.toggle('on', i === n));
        po.innerHTML = r.opts.map(o => `<button class="pb" data-v="${o}">${o}</button>`).join(''); if (r.say) say(r.say);
        po.querySelectorAll('.pb').forEach(b => b.addEventListener('click', () => {
          if (b.dataset.v !== r.ans) return wrong(b);
          right(b, 16); b.classList.add('on'); po.querySelectorAll('.pb').forEach(x => { x.disabled = true; });
          setTimeout(() => { if (!s.a.classList.contains('on')) return; if (++n < t.rows.length) draw(); else { show.innerHTML = t.end || '⭐'; po.innerHTML = ''; K().snd.win(); s.ready(); } }, 750);
        }));
      };
      draw(); s.line(() => t.line({}));
    },
    // build a tower: every tap drops one more block; it has to be tall enough
    tower(t) {
      let n = (D[t.id] || {}).n || 0; const COLS = ['#e8492e', '#ffd23f', '#3a86ff', '#2fb86a', '#b9a5e6'], min = t.min || 5;
      const s = screen(t, t.sub, `<div class="tw"><div class="stack"></div><div class="base"></div></div><div class="side"><button class="addb">＋ Add a block</button><button class="rmb">Knock it down ↺</button><p class="line2">My tower has <b></b> blocks.</p></div>`);
      const st = s.a.querySelector('.stack'), out = s.a.querySelector('.line2 b');
      const draw = drop => { st.innerHTML = Array.from({ length: n }, (_, i) => `<i style="background:${COLS[i % 5]};--x:${i % 2 ? 9 : -9}px"${drop && i === n - 1 ? ' class="new"' : ''}></i>`).join(''); out.textContent = n; s.ready(n >= min); };
      s.a.querySelector('.addb').addEventListener('click', () => {
        if (n >= 10) return wrong(st); n++; draw(true); K().snd.ding(n); setTimeout(K().snd.boing, 220);
        if (n === min) { const o = at(st); K().burst(o.x, o.y, 30, 380); cheer(); say('What a tall tower!'); }
      });
      s.a.querySelector('.rmb').addEventListener('click', () => { if (!n) return; n = 0; K().snd.rattle(); K().again(st, 'no'); draw(); });
      s.line(() => t.line({ n })); s.onSave(() => ({ n })); draw();
    },
    // SPEECH TIME: the curtain opens and the child answers the week's key question with their own speech
    stage(t) {
      const L = R.speech(D), pg = R.book(D).slice(1, 5);
      const s = screen(t, t.sub, `<div class="thea"><div class="cards">${pg.map(p => `<div class="leaf small">${p.html}</div>`).join('')}</div><div class="talk"><h5>${R.key}</h5>${L.map(l => `<p>${l}</p>`).join('')}</div><i class="cl"></i><i class="cr"></i><button class="openc">Open the curtain!</button></div>`);
      const th = s.a.querySelector('.thea'), ps = [...s.a.querySelectorAll('.talk p')];
      s.a.querySelector('.openc').addEventListener('click', async () => {
        th.classList.add('open'); K().snd.whoosh(); clap(); cheer(); await wait(900); await say(R.key);
        for (const p of ps) { if (!s.a.classList.contains('on')) return; await say(p.textContent, p); }
        s.ready();
      });
      s.line(() => L.join(' ')); s.onSaid(() => { clap(); const k = K(); let i = 0; const iv = setInterval(() => { k.burst(rnd(150, k.W() - 150), rnd(120, 420), 16, 320); if (++i > 6) clearInterval(iv); }, 220); });
    }
  };
  // what a helper says when a thing is opened
  const INTRO = { mirror: 'Look in the mirror! Draw your face.', mind: 'What do you like? Pick some!', toys: 'So many toys! Pick your favourite.', paint: "Ooh, paint! Let's make a picture.", tower: "Let's build a tall tower!" };
  // always someone talking: what to say next when the room has been quiet
  Crew.idle(() => {
    if (!box || !box.classList.contains('on') || !R) return null;
    if (box.querySelector('.vpop')) return false;
    const a = box.querySelector('#act');
    if (a && a.classList.contains('on')) {
      if (a.querySelector('.bk')) return a.classList.contains('reading') || Crew.muted() ? false : a.querySelector('.ok.on') ? 'Press Done!' : Crew.pick(['Press "Hear my whole book"!', 'Turn the page!']);
      if (a.querySelector('.ok.on')) return Crew.pick(['You did it! Press Done.', 'All finished! Press Done.']);
      if (a.querySelector('.sayit.on')) { if (a.dataset.hinted) return false; a.dataset.hinted = 1; return Crew.pick(['Press the microphone and say it!', 'Your turn! Say it out loud.']); }   // one reminder only
      return Crew.pick(['Keep going!', 'You can do it!', 'Take your time.']);
    }
    const n = count(), N = plays().length, bt = bookT();
    if (bt && isDone(bt.id)) return Crew.pick(['We did everything here!', "Let's go outside!"]);
    if (n >= N) return 'Your Speech Book is ready! Open it.';
    return Crew.pick([n ? 'Press KEEP GOING!' : 'Press START!', `${N - n} more to go!`, R.key]);
  });
  // The week's video opens as a POP-UP over the room. The browser's own player gives play / pause, full screen and
  // dragging along the timeline to any moment. A room names its file as  video: 'video/1-1.mp4'  (none made yet).
  function video() {
    K().snd.pop(); Crew.hush();
    let v = box.querySelector('.vpop'); if (v) v.remove();
    v = document.createElement('div'); v.className = 'vpop';
    v.innerHTML = `<div class="vbox"><button class="vx" title="Close">✕</button>` +
      (R.video ? `<video src="${R.video}" controls playsinline preload="metadata"></video>` : `<div class="vnone"><b>▶</b><p>The week's video plays here.<br><small>not made yet · 영상 준비 중</small></p></div>`) + `</div>`;
    box.appendChild(v); void v.offsetWidth; v.classList.add('on');
    const vid = v.querySelector('video'); if (vid) { Crew.mute(true); vid.play().catch(() => {}); }
    const shut = () => { if (!v.isConnected) return; if (vid) { try { vid.pause(); } catch (e) {} Crew.mute(false); } v.remove(); if (!D._tv) { D._tv = 1; save(); K().snd.win(); } paint(); };
    v.querySelector('.vx').addEventListener('click', shut);
    v.addEventListener('click', e => { if (e.target === v) shut(); });
  }

  // ---------- the rooms (data) ----------
  const pic = d => d ? `<img src="${d}" alt="">` : '<em>?</em>';
  const g = (D, id) => D[id] || {};
  const ROOMS = {
    // Island 1 · place 1 · ME (ME, YOU & WE week 1): the house
    '1-1': {
      art: 'art/room-house.jpg', tv: [.483, .01, .166, .18], key: 'Who am I?',
      video: 'video/1-1.mp4',   // the week's opening video, made in start-pbl/video/week-1 (stand-in voice until Sunny is recorded)
      things: [
        { id: 'mirror', zone: [.018, .34, .135, .46], title: 'Who am I?', col: '#6fb1e6', type: 'mirror', sub: 'Draw your face in the magic mirror. Then tap the letters of your name.', line: v => `My name is ${v.name}.`,
          page: 'art/pages/1/01.webp', pageCol: '#6fb1e4', spots: [{ draw: [220, 334, 464, 538], oval: 1 }, { text: v => v.name, at: [498, 1132], size: 58 }] },   // worksheet week 1 · 01: the drawing goes in the mirror, the name on the line
        { id: 'tablet', zone: [.152, .45, .105, .15], title: 'Hello! I am Emma.', col: '#ffd23f', type: 'call', sub: 'Emma is calling you! Answer the call.', who: 'Emma', kid: 'art/ws/emma.png',
          lines: ['Hello! I am Emma.', 'I am eight.', 'I like drawing.', 'I like soccer.', 'I am friendly.'], ask: 'How old is Emma? Pop the balloon!', opts: [6, 7, 8], ans: 8, line: () => 'Emma is eight.',
          page: 'art/pages/1/02.webp', pageCol: '#ffd23f', spots: [{ ring: [636, 902, 62] }] },   // worksheet week 1 · 02: the 8 is circled
        { id: 'frames', zone: [.272, .133, .168, .16], title: 'Sam and Lily', col: '#f6a58f', type: 'sort', sub: 'Sam likes music. Lily likes animals. Drag each thing to the right friend!', big: 'We are different!',
          targets: [{ img: 'art/ws/sam.png', text: 'Sam likes music.' }, { img: 'art/ws/lily.png', text: 'Lily likes animals.' }], items: [['🎸', 0], ['🐶', 1], ['🥁', 0], ['🐱', 1], ['🎤', 0], ['🐰', 1]], line: () => 'We are different.' },
        { id: 'board', zone: [.457, .207, .228, .218], title: 'Words about me', col: '#4fae62', type: 'mind', sub: 'Catch the words that are true for you. Two or more!', centre: 'ME',
          words: [['😊', 'happy'], ['❤️', 'kind'], ['📏', 'tall'], ['📖', 'reading'], ['✏️', 'drawing'], ['🎵', 'singing']], say: w => `I am ${w}.`, line: v => `I am ${v.words.slice(0, 2).join(' and ')}.` },
        { id: 'shelf', zone: [.26, .335, .186, .255], title: 'What am I good at?', col: '#b9a5e6', type: 'toys', sub: 'Tap a toy to see its trick. Take the ones you are good at!', lead: 'I am good at',
          items: [['✏️', 'drawing', 'scrib'], ['🎵', 'singing', 'sing'], ['👟', 'running', 'run'], ['📖', 'reading', 'flip'], ['🧱', 'building', 'stack'], ['❤️', 'helping', 'beat']], say: w => `I am good at ${w}.`, line: v => `I am good at ${v.good[0] || '…'}.` },
        { id: 'easel', zone: [.676, .266, .102, .35], title: 'This is me!', col: '#e8492e', type: 'paint', sub: 'Paint yourself. Add stamps! Then pick what you like.', lead: 'I like',
          likes: [['✏️', 'drawing'], ['⚽', 'soccer'], ['🎵', 'music'], ['🐶', 'animals'], ['📖', 'books'], ['🧱', 'blocks']], say: w => `I like ${w}.`, line: v => `I like ${v.like}.`,
          page: 'art/pages/1/08.webp', pageCol: '#f277a8', spots: [{ draw: [196, 318, 512, 610], rot: -3 }, { text: v => v.like ? `I like ${v.like}.` : '', at: [300, 958], size: 40, rot: -3 }] },   // worksheet week 1 · 08: the drawing goes in the photo, their words under it
        { id: 'book', zone: [.455, .446, .203, .17], title: 'My book about me', col: '#ff8f6b', type: 'book', sub: 'Your own book! Turn the pages.', line: () => 'This is my book about me.' },
        { id: 'stage', zone: [.777, .128, .223, .51], title: 'Hello, everyone!', col: '#27a7a0', type: 'stage', sub: 'Speech Time! Open the curtain and tell everyone who you are.' }
      ],
      speech: D => ['Hello, everyone!', `My name is ${g(D, 'mirror').name || '…'}.`, `I am ${(g(D, 'board').words || []).slice(0, 2).join(' and ') || '…'}.`, `I am good at ${(g(D, 'shelf').good || [])[0] || '…'}.`, `I like ${g(D, 'easel').like || '…'}.`],
      book(D) {
        const L = this.speech(D), T = id => this.things.find(t => t.id === id), m = g(D, 'mirror'), e = g(D, 'easel');
        return [{ say: 'All about me!', html: `<h4>ALL ABOUT ME</h4>${pic(m.draw)}<span>by ${m.name || '…'}</span>` },
          { say: L[1], html: `${pic(m.draw)}<span>${L[1]}</span>` },
          { say: L[2], html: `<em>${(g(D, 'board').words || []).map(w => emo(T('board'), w)).join(' ')}</em><span>${L[2]}</span>` },
          { say: L[3], html: `<em>${(g(D, 'shelf').good || []).map(w => emo(T('shelf'), w)).join(' ')}</em><span>${L[3]}</span>` },
          { say: L[4], html: `${pic(e.draw)}<span>${L[4]} ${emo(T('easel'), e.like)}</span>` }];
      }
    },
    // Island 2 · place 1 · MEET MY FRIENDS (worksheets/start-pbl/pbl-02-my-friends-and-me, week 1, pages 1-8): the treehouse club
    '2-1': {
      art: 'art/room-treehouse.jpg', tv: [.435, .07, .15, .165], key: 'Who is my friend?',
      things: [
        { id: 'photos', zone: [.01, .10, .19, .35], title: 'Meet my friends!', col: '#ffd23f', type: 'mind', sub: 'What do friends do? Catch two or more!', centre: 'FRIENDS', min: 2,
          words: [['😊', 'smile'], ['🍪', 'share'], ['⚽', 'play'], ['🤝', 'help']], say: w => `Friends ${w}.`, line: v => `Friends ${v.words.slice(0, 2).join(' and ') || '…'}.` },
        { id: 'cans', zone: [.2, .16, .085, .21], title: 'Hello, friend!', col: '#6fb1e6', type: 'call', sub: 'Mia is calling on the can phone! Answer it.', who: 'Mia', icon: '🥫', kid: 'art/ws/mia.png',
          lines: ['Hi! I am Mia.', 'What is your name?', 'Nice to meet you!', 'Let’s play!'], ask: 'What does Mia want to do? Pop it!', opts: ['sleep', 'play', 'eat'], ans: 'play', line: () => 'Nice to meet you!' },
        { id: 'frames', zone: [.285, .16, .14, .13], title: 'Ben and Mia', col: '#f6a58f', type: 'sort', sub: 'Ben likes soccer. Mia likes books. Drag each thing to the right friend!', big: 'Different, but friends!',
          targets: [{ img: 'art/ws/ben.png', text: 'Ben likes soccer.' }, { img: 'art/ws/mia.png', text: 'Mia likes books.' }], items: [['⚽', 0], ['📚', 1], ['🥅', 0], ['📖', 1], ['👟', 0], ['🔖', 1]], line: () => 'Ben and Mia are friends.' },
        { id: 'desk', zone: [.285, .30, .17, .23], title: 'Ask a friend', col: '#27a7a0', type: 'ask', sub: 'Ask Penny three questions. Listen, then tap what she said.', who: 'Penny', friend: 'art/penny.png',
          qs: [{ q: 'What is your favorite food?', say: 'I like pizza!', a: 'pizza', opts: [['🍎', 'apples'], ['🍕', 'pizza'], ['🍦', 'ice cream']] },
            { q: 'What is your favorite game?', say: 'I like soccer!', a: 'soccer', opts: [['⚽', 'soccer'], ['🧩', 'puzzles'], ['🪁', 'kites']] },
            { q: 'What are you good at?', say: 'I am good at singing!', a: 'singing', opts: [['🏊', 'swimming'], ['✏️', 'drawing'], ['🎵', 'singing']] }], line: () => 'My friend likes pizza.' },
        { id: 'scope', zone: [.625, .29, .11, .27], title: 'Find a friend who ...', col: '#b9a5e6', type: 'sort', sub: 'Look through the telescope! Give each thing to the friend who likes it.', big: 'I found my friends!',
          targets: [{ img: 'art/ws/sam.png', text: 'Sam likes music.' }, { img: 'art/ws/lily.png', text: 'Lily likes dogs.' }, { img: 'art/ws/ben.png', text: 'Ben likes soccer.' }],
          items: [['🎵', 0], ['🐶', 1], ['⚽', 2], ['🎸', 0], ['🦴', 1], ['🥅', 2]], line: () => 'My friend likes music.' },
        { id: 'board', zone: [.765, .13, .19, .24], title: 'Words about friends', col: '#4fae62', type: 'mind', sub: 'Catch the words about a good friend. Two or more!', centre: 'FRIEND', min: 2,
          words: [['🍪', 'share'], ['🤝', 'help'], ['👂', 'listen'], ['😊', 'smile'], ['⚽', 'play'], ['❤️', 'care']], say: w => `Friends ${w}.`, line: v => `Friends ${v.words[0] || 'share'}.` },
        { id: 'chest', zone: [.01, .47, .2, .29], title: 'What do we do together?', col: '#e8492e', type: 'toys', sub: 'Tap each toy. Take the things you do with your friends!', lead: 'We', tail: 'together.',
          items: [['⚽', 'play ball', 'run'], ['📖', 'read', 'flip'], ['✏️', 'draw', 'scrib'], ['🎵', 'sing', 'sing'], ['🧱', 'build', 'stack'], ['🍎', 'eat lunch', 'beat']], say: w => `We ${w} together.`, line: v => `We ${v.good[0] || 'play'} together.` },
        { id: 'easel', zone: [.21, .39, .105, .31], title: 'My friend and me', col: '#ff5d8f', type: 'paint', sub: 'Paint you and your friend. Add stamps!', caption: 'This is my friend.', line: () => 'This is my friend.' },
        { id: 'book', zone: [.45, .43, .17, .14], title: 'My friend book', col: '#ff8f6b', type: 'book', sub: 'Your own friend book! Turn the pages.', line: () => 'This is my friend book.' },
        { id: 'stage', zone: [.74, .38, .26, .36], title: 'Speech Time', col: '#27a7a0', type: 'stage', sub: 'Open the curtain and tell everyone about your friend.' }
      ],
      speech: D => ['Hello, everyone!', 'This is my friend.', `Friends ${(g(D, 'photos').words || []).slice(0, 2).join(' and ') || '…'}.`, `We ${(g(D, 'chest').good || [])[0] || '…'} together.`, 'Nice to meet you!'],
      book(D) {
        const L = this.speech(D), T = id => this.things.find(t => t.id === id), e = g(D, 'easel');
        return [{ say: 'My friend book!', html: `<h4>MY FRIEND</h4>${pic(e.draw)}<span>my friend and me</span>` },
          { say: L[1], html: `${pic(e.draw)}<span>${L[1]}</span>` },
          { say: L[2], html: `<em>${(g(D, 'photos').words || []).map(w => emo(T('photos'), w)).join(' ')}</em><span>${L[2]}</span>` },
          { say: L[3], html: `<em>${(g(D, 'chest').good || []).map(w => emo(T('chest'), w)).join(' ')}</em><span>${L[3]}</span>` },
          { say: 'Friends share and help.', html: `<em>${(g(D, 'board').words || []).map(w => emo(T('board'), w)).join(' ')}</em><span>Friends ${(g(D, 'board').words || []).slice(0, 2).join(' and ') || '…'}.</span>` }];
      }
    }    ,
    // Island 2 · place 2 · SAME & DIFFERENT (pbl-02 week 2, pages 9-16): the art hut
    '2-2': {
      art: 'art/room-arthut.jpg', tv: [.425, .065, .165, .175], key: 'How are we the same and different?',
      things: [
        { id: 'portraits', zone: [.13, .14, .27, .16], title: 'We are all different', col: '#6fb1e6', type: 'sort', sub: 'Who is it? Give each thing to the right friend.', big: 'Everyone is different!',
          targets: [{ img: 'art/ws/kid-glasses.png', text: 'Leo has glasses.' }, { img: 'art/ws/kid-wheelchair.png', text: 'Ann has a wheelchair.' }, { img: 'art/ws/lily.png', text: 'Lily has a cat.' }, { img: 'art/ws/ben.png', text: 'Ben likes soccer.' }],
          items: [['⚽', 3], ['👓', 0], ['🐱', 2], ['🦽', 1]], line: () => 'Everyone is different.' },
        { id: 'hoops', zone: [.15, .34, .17, .19], title: 'Same and different', col: '#ffd23f', type: 'toys', sub: 'What do you and your friend BOTH like? Take them!', lead: 'We both like',
          items: [['⚽', 'soccer', 'run'], ['📖', 'books', 'flip'], ['✏️', 'drawing', 'scrib'], ['🎵', 'music', 'sing'], ['🍎', 'apples', 'beat'], ['🐶', 'dogs', 'stack']], say: w => `We both like ${w}.`, line: v => `We both like ${v.good[0] || '…'}.` },
        { id: 'baskets', zone: [.44, .30, .14, .12], title: 'Same or different?', col: '#f6a58f', type: 'pick', sub: 'Look at the two things. Same or different?', end: '👍',
          rows: [{ show: '🍎 🍎', opts: ['same', 'different'], ans: 'same' }, { show: '🐶 🐱', opts: ['same', 'different'], ans: 'different' }, { show: '⚽ 📖', opts: ['same', 'different'], ans: 'different' }, { show: '⭐ ⭐', opts: ['same', 'different'], ans: 'same' }], line: () => 'We are different.' },
        { id: 'heartjar', zone: [.595, .25, .085, .16], title: 'Is it kind?', col: '#4fae62', type: 'pick', sub: 'Listen. Is it kind? Yes or no?', end: '❤️',
          rows: [{ show: '“Nice picture!”', say: 'Nice picture!', opts: ['yes', 'no'], ans: 'yes' }, { show: '“You can’t play.”', say: "You can't play.", opts: ['yes', 'no'], ans: 'no' }, { show: '“Let’s play together!”', say: "Let's play together!", opts: ['yes', 'no'], ans: 'yes' }, { show: '“You are slow!”', say: 'You are slow!', opts: ['yes', 'no'], ans: 'no' }], line: () => 'Nice picture!' },
        { id: 'door', zone: [.065, .21, .075, .36], title: 'Everyone can play', col: '#b9a5e6', type: 'pick', sub: 'What is the good way? Tap it.', end: '🤝',
          rows: [{ show: 'Mia is new. She is alone. 😔', say: 'Mia is new. She is alone.', opts: ['Say hi.', 'Walk away.'], ans: 'Say hi.' }, { show: 'Leo can’t reach the book. 📖', say: "Leo can't reach the book.", opts: ['Laugh.', 'Help him.'], ans: 'Help him.' }], line: () => 'Come and play!' },
        { id: 'thumb', zone: [.685, .29, .07, .24], title: 'Thumbs up!', col: '#e0a020', type: 'mind', sub: 'Catch kind words to say to a friend. Two or more!', centre: '👍', min: 2,
          words: [['👍', 'Great job!'], ['✏️', 'Nice drawing!'], ['⭐', 'You can do it!'], ['❤️', 'Thank you!']], say: w => w, line: v => v.words[0] || 'Great job!' },
        { id: 'easel', zone: [.325, .31, .105, .36], title: 'Be kind!', col: '#27a7a0', type: 'paint', sub: 'Make a poster. Paint a kind friend!', caption: 'We are kind.', line: () => 'We are kind.' },
        { id: 'pad', zone: [.08, .63, .24, .21], title: 'All friends', col: '#ff5d8f', type: 'paint', sub: 'Paint you and three friends.', caption: 'We are friends.', line: () => 'We are friends.' },
        { id: 'book', zone: [.455, .42, .16, .14], title: 'My friend book', col: '#ff8f6b', type: 'book', sub: 'Your own book! Turn the pages.', line: () => 'We are friends.' },
        { id: 'stage', zone: [.75, .33, .25, .38], title: 'Speech Time', col: '#27a7a0', type: 'stage', sub: 'Open the curtain and tell everyone how we are the same and different.' }
      ],
      speech: D => ['Hello, everyone!', 'Everyone is different.', `We both like ${(g(D, 'hoops').good || [])[0] || '…'}.`, 'We are kind.', 'We are friends.'],
      book(D) {
        const L = this.speech(D), T = id => this.things.find(t => t.id === id);
        return [{ say: 'Same and different!', html: `<h4>SAME &amp; DIFFERENT</h4>${pic(g(D, 'pad').draw)}<span>all friends</span>` },
          { say: L[1], html: `<em>👓 🦽 🐱 ⚽</em><span>${L[1]}</span>` },
          { say: L[2], html: `<em>${(g(D, 'hoops').good || []).map(w => emo(T('hoops'), w)).join(' ')}</em><span>${L[2]}</span>` },
          { say: L[3], html: `${pic(g(D, 'easel').draw)}<span>${L[3]}</span>` },
          { say: L[4], html: `${pic(g(D, 'pad').draw)}<span>${L[4]}</span>` }];
      }
    },
    // Island 2 · place 3 · KIND FRIENDS (pbl-02 week 3, pages 17-24): the sharing stand
    '2-3': {
      art: 'art/room-share.jpg', tv: [.42, .02, .17, .18], key: 'How can I be a kind friend?',
      things: [
        { id: 'masks', zone: [.025, .15, .175, .12], title: 'How does he feel?', col: '#ffd23f', type: 'pick', sub: 'Look at the face. How does he feel?', end: '🤗',
          rows: [{ show: '😢', opts: ['happy', 'sad', 'angry'], ans: 'sad' }, { show: '😠', opts: ['happy', 'sad', 'angry'], ans: 'angry' }, { show: '😊', opts: ['happy', 'sad', 'angry'], ans: 'happy' }], line: () => 'Are you okay?' },
        { id: 'medals', zone: [.03, .29, .15, .14], title: 'A good friend ...', col: '#6fb1e6', type: 'pick', sub: 'Is it what a good friend does? Yes or no?', end: '🏅',
          rows: [{ show: '👂 listens.', say: 'A good friend listens.', opts: ['yes', 'no'], ans: 'yes' }, { show: '😠 shouts.', say: 'A good friend shouts.', opts: ['yes', 'no'], ans: 'no' }, { show: '🍪 shares.', say: 'A good friend shares.', opts: ['yes', 'no'], ans: 'yes' }, { show: '🤝 helps.', say: 'A good friend helps.', opts: ['yes', 'no'], ans: 'yes' }], line: () => 'A good friend helps.' },
        { id: 'cookies', zone: [.215, .27, .085, .17], title: 'Let’s share!', col: '#e8492e', type: 'call', sub: 'Tom has a story for you. Answer the call!', who: 'Tom', icon: '🍪', kid: 'art/ws/tom.png',
          lines: ['I have two cookies.', 'Mia has no cookies.', 'Here, Mia! One for you.', 'Now we are both happy!'], ask: 'What does Tom do? Pop it!', opts: ['hide', 'share', 'run'], ans: 'share', line: () => "Let's share!" },
        { id: 'mailbox', zone: [.33, .38, .09, .2], title: 'Caring words', col: '#b9a5e6', type: 'mind', sub: 'Catch caring words for a friend. Two or more!', centre: '❤️', min: 2,
          words: [['😔', 'Are you okay?'], ['🤝', 'Can I help you?'], ['❤️', 'I’m sorry.'], ['😊', 'Thank you!']], say: w => w, line: v => v.words[0] || "I'm sorry." },
        { id: 'sign', zone: [.615, .37, .125, .22], title: 'What should we do?', col: '#4fae62', type: 'pick', sub: 'Which way is the kind way? Tap it.', end: '🌈',
          rows: [{ show: 'Two friends want the red block. 🧱', say: 'Two friends want the red block.', opts: ['Take turns.', 'Grab it.'], ans: 'Take turns.' }, { show: 'Your friend falls down. 🤕', say: 'Your friend falls down.', opts: ['Laugh.', 'Help.'], ans: 'Help.' }], line: () => 'We take turns.' },
        { id: 'board', zone: [.41, .22, .195, .2], title: 'Words about kindness', col: '#f6a58f', type: 'mind', sub: 'Catch the kind words. Two or more!', centre: 'KIND', min: 2,
          words: [['🍪', 'share'], ['🤝', 'help'], ['😊', 'smile'], ['👂', 'listen'], ['🤗', 'hug'], ['💬', 'say sorry']], say: w => `I ${w}.`, line: () => 'I am kind.' },
        { id: 'card', zone: [.01, .47, .19, .2], title: 'Thank you, friend!', col: '#ff5d8f', type: 'paint', sub: 'Make a thank-you card. Paint you and your friend!', caption: 'Thank you!', line: () => 'Thank you, friend!' },
        { id: 'calendar', zone: [.815, .15, .115, .18], title: 'My kind week', col: '#27a7a0', type: 'toys', sub: 'What kind things did you do? Take them!', lead: 'I',
          items: [['🍪', 'shared', 'beat'], ['🤝', 'helped', 'stack'], ['😊', 'said thank you', 'sing'], ['❤️', 'said sorry', 'flip']], say: w => `I ${w}.`, line: v => `I ${v.good[0] || 'helped'}.` },
        { id: 'book', zone: [.43, .45, .18, .12], title: 'My kind book', col: '#ff8f6b', type: 'book', sub: 'Your own book! Turn the pages.', line: () => 'I am kind.' },
        { id: 'stage', zone: [.745, .36, .255, .36], title: 'Speech Time', col: '#27a7a0', type: 'stage', sub: 'Open the curtain and tell everyone how you are a kind friend.' }
      ],
      speech: D => ['Hello, everyone!', 'A good friend helps.', 'I am kind.', `I ${(g(D, 'calendar').good || [])[0] || '…'}.`, 'Thank you, friend!'],
      book(D) {
        const L = this.speech(D), T = id => this.things.find(t => t.id === id);
        return [{ say: 'My kind book!', html: `<h4>KIND FRIENDS</h4>${pic(g(D, 'card').draw)}<span>my friend and me</span>` },
          { say: L[1], html: `<em>👂 🍪 🤝</em><span>${L[1]}</span>` },
          { say: L[2], html: `<em>${(g(D, 'board').words || []).map(w => emo(T('board'), w)).join(' ')}</em><span>${L[2]}</span>` },
          { say: L[3], html: `<em>${(g(D, 'calendar').good || []).map(w => emo(T('calendar'), w)).join(' ')}</em><span>${L[3]}</span>` },
          { say: L[4], html: `${pic(g(D, 'card').draw)}<span>${L[4]}</span>` }];
      }
    },
    // Island 2 · place 4 · TEAMWORK (pbl-02 week 4, pages 25-32): the builders' workshop
    '2-4': {
      art: 'art/room-build.jpg', tv: [.42, .045, .175, .19], key: 'How do we work as a team?',
      things: [
        { id: 'flag', zone: [.03, .10, .125, .33], title: 'Let’s work together!', col: '#4fae62', type: 'mind', sub: 'What does a team do? Catch two or more!', centre: 'TEAM', min: 2,
          words: [['🧱', 'build'], ['📋', 'plan'], ['🤝', 'help'], ['🍪', 'share']], say: w => `We ${w}.`, line: () => 'We are a team.' },
        { id: 'puppets', zone: [.14, .32, .16, .26], title: 'The tower challenge', col: '#ffd23f', type: 'call', sub: 'Amy has a story about the tower. Answer the call!', who: 'Amy', icon: '🎭', kid: 'art/ws/amy.png',
          lines: ['Tom gets the blocks.', 'I make a plan.', 'Oh no! The tower falls down.', 'We try again. We did it!'], ask: 'The tower falls. What do they do? Pop it!', opts: ['cry', 'try again', 'go home'], ans: 'try again', line: () => "Let's try again!" },
        { id: 'hats', zone: [.19, .16, .2, .14], title: 'Everyone has a job!', col: '#e8492e', type: 'toys', sub: 'Try on the jobs. Which one do you like?', lead: 'I can be the',
          items: [['🧢', 'leader', 'beat'], ['👷', 'builder', 'stack'], ['🎨', 'designer', 'scrib'], ['🎤', 'reporter', 'sing']], say: w => `I can be the ${w}.`, line: v => `I can be the ${v.good[0] || '…'}.` },
        { id: 'radios', zone: [.875, .16, .085, .12], title: 'Team talk', col: '#6fb1e6', type: 'mind', sub: 'Catch good team words. Two or more!', centre: '📻', min: 2,
          words: [['🤝', 'Can I help you?'], ['💡', 'I have an idea!'], ['🧱', 'Let’s try again!'], ['😊', 'It’s your turn!']], say: w => w, line: v => v.words[0] || 'I have an idea!' },
        { id: 'blocks', zone: [.01, .57, .26, .3], title: 'Build a tower!', col: '#27a7a0', type: 'tower', sub: 'Build a tall tower! Five blocks or more.', min: 5, line: v => `My tower has ${v.n} blocks.` },
        { id: 'tree', zone: [.61, .23, .15, .38], title: 'Our friendship tree', col: '#b9a5e6', type: 'mind', sub: 'Hang your friends on the tree. Two or more!', centre: '🌳', min: 2,
          words: [['🙂', 'Mia'], ['😄', 'Ben'], ['😊', 'Sam'], ['🙂', 'Lily'], ['😄', 'Tom'], ['😊', 'Amy']], say: w => `${w} is my friend.`, line: () => 'Friends forever!' },
        { id: 'stars', zone: [.41, .26, .19, .19], title: 'We grow together!', col: '#e0a020', type: 'toys', sub: 'What can you do now? Take a star for each one!', lead: 'I can',
          items: [['💬', 'talk about my friend', 'sing'], ['❤️', 'be kind', 'beat'], ['🍪', 'share', 'flip'], ['🧱', 'work in a team', 'stack']], say: w => `I can ${w}.`, line: () => 'We are better together!' },
        { id: 'book', zone: [.42, .46, .18, .12], title: 'My friend book', col: '#ff8f6b', type: 'book', sub: 'Your own book! Turn the pages.', line: () => 'You are my friend.' },
        { id: 'stage', zone: [.745, .36, .255, .36], title: 'Speech Time', col: '#27a7a0', type: 'stage', sub: 'Open the curtain and tell everyone how your team works.' }
      ],
      speech: D => ['Hello, everyone!', 'We are a team.', `I can be the ${(g(D, 'hats').good || [])[0] || '…'}.`, `My tower has ${g(D, 'blocks').n || '…'} blocks.`, 'We are better together!'],
      book(D) {
        const L = this.speech(D), T = id => this.things.find(t => t.id === id);
        return [{ say: 'My friend book!', html: `<h4>MY FRIEND</h4><em>🧱</em><span>our team</span>` },
          { say: L[1], html: `<em>${(g(D, 'flag').words || []).map(w => emo(T('flag'), w)).join(' ')}</em><span>${L[1]}</span>` },
          { say: L[2], html: `<em>${(g(D, 'hats').good || []).map(w => emo(T('hats'), w)).join(' ')}</em><span>${L[2]}</span>` },
          { say: L[3], html: `<em>${'🧱'.repeat(Math.min(6, g(D, 'blocks').n || 0))}</em><span>${L[3]}</span>` },
          { say: L[4], html: `<em>${(g(D, 'tree').words || []).join(' ')}</em><span>${L[4]}</span>` }];
      }
    }
  };
  addEventListener('resize', () => setTimeout(lay, 0));   // after sky.js has measured the new window (this file loads first, so its listener runs first)
  return { open, lay, data: () => all, rooms: ROOMS, kidVoice, play: id => { const t = R.things.find(x => x.id === id); if (t) TYPES[t.type](t); }, voice: VDB };
})();
