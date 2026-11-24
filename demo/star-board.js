/* Story Street: the star opens MY MONTH BOARD (24 Nov 2026, option 1 "star calendar" + the week view).
   - month: one row a week (days 1 to 7, 8 to 14 ...), one star for every day the child played, dots for which programmes
   - tap a week: every activity of each programme, ticked when done that week, with how many times it was played
   Pictures are for the child, the small numbers are for the parent. Numbers come from the shared counter (kit/track.js,
   'gpfis.log', this device only). Try the look with made-up numbers:  street.html?board=sample
   Needs: kit/track.js before this file, and street-fun.js (the #chip). */
(function () {
  const rot = document.getElementById('rot'), T = window.GPTrack; if (!rot || !T) return;
  const SAMPLE = /[?&]board=sample/.test(location.search);
  const COL = { pbl: '#ef4b4b', lgr: '#3b82e0', fm: '#3aa76d' }, PALE = { pbl: '#ffe1d6', lgr: '#d9eefc', fm: '#dcf3df' };
  const LOGO = { pbl: 'start-pbl.png', lgr: 'lets-go-readers.png', fm: 'fresh-math.png' }, LOGOS = '../ext/logos/';
  const LT = '../lgr/art/tiles/';
  const ICON = { lgr: { watch: LT + 'watch.png', abc: LT + 'abc.png', sheet: LT + 'sheet.png', dictation: LT + 'dictation.png', book: LT + 'book.png' }, pbl: { video: '../pbl/art/icons/video.png', book: '../pbl/art/icons/book.png' }, fm: { video: '../fm/art/ic-video.png', game: '../fm/art/ic-game.png', talk: '../fm/art/ic-talk.png' } };   // painted tile pictures from the programme's own chat; the rest are stand-in emoji
  const WCOL = ['#ff7a59', '#ffb52e', '#57c26b', '#4bb3f0', '#b98be8', '#ff8fb1'];
  const css = document.createElement('style'); css.textContent = `
#chip{cursor:pointer;pointer-events:auto}
#sb{position:absolute;left:0;top:0;z-index:6000;display:none;background:rgba(24,34,58,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:Fredoka,sans-serif;color:#4a3520}
#sb,#sb *,#sb *::before,#sb *::after{box-sizing:border-box}   /* the street page has no border-box rule: without this the board is 80 px wider and 64 px taller than drawn and runs off the screen */
#sb.on{display:block}
#sbIn{position:absolute;left:50%;top:50%;width:1440px;height:650px;margin:-325px 0 0 -720px}
#sb.on #sbIn{animation:sbPop .45s cubic-bezier(.3,1.5,.45,1)}@keyframes sbPop{0%{scale:.6;opacity:0}}
#sbPenny{position:absolute;left:0;bottom:0;height:400px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3));pointer-events:none;animation:sbBob 2.4s ease-in-out infinite}@keyframes sbBob{50%{translate:0 -8px}}
#sbBoard{position:absolute;left:280px;top:36px;width:1150px;height:600px;border-radius:44px;background:#fff7e6;border:10px solid #fff;box-shadow:0 12px 0 #d9b98a,0 26px 50px rgba(0,0,0,.45);padding:22px 30px}
#sbX{position:absolute;right:-22px;top:14px;width:68px;height:68px;border-radius:50%;background:#ff6b5e;box-shadow:0 5px 0 #c4443a,0 8px 14px rgba(0,0,0,.3);cursor:pointer;z-index:3}
#sbX::before,#sbX::after{content:'';position:absolute;left:18px;top:30px;width:32px;height:8px;border-radius:4px;background:#fff;transform:rotate(45deg)}#sbX::after{transform:rotate(-45deg)}
#sbX:active,.sbRow:active,.sbBack:active{scale:.94}
#sb .p{color:#9a7b55;font-size:17px;font-weight:500;white-space:nowrap}#sb .p b{color:#6b4d28;font-weight:700}
.sbWk{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;color:#fff;font-size:40px;font-weight:700;flex:none}
.sbRows{display:flex;flex-direction:column;height:100%;justify-content:space-between}
.sbRow{display:flex;align-items:center;gap:16px;padding:0 20px;border-radius:30px;background:#fff;box-shadow:0 5px 0 #ecd9b8;cursor:pointer;transition:scale .12s}
.sbRow.now{background:#fff3c4;box-shadow:0 5px 0 #f0c64a,0 0 0 5px #ffd34d}
.sbRow.later{background:#fffaf0;cursor:default}.sbRow.later .sbWk{opacity:.6}
.sbDay{width:80px;display:flex;flex-direction:column;align-items:center;gap:4px}.sbDay.out{visibility:hidden}
.sbHole{width:var(--h,68px);height:var(--h,68px);border-radius:50%;background:#f3e6cf;box-shadow:inset 0 5px 0 #e2d0b0;display:grid;place-items:center}
.sbDay.today .sbHole{background:#fff;box-shadow:0 0 0 6px #ff8a5c,0 0 0 12px rgba(255,138,92,.3)}
.sbDay.got svg{animation:sbStar .5s cubic-bezier(.3,1.7,.45,1) backwards;animation-delay:calc(var(--i)*40ms)}@keyframes sbStar{0%{scale:0;rotate:-90deg}}
.sbDots{display:flex;gap:4px;height:10px}.sbDots i{width:10px;height:10px;border-radius:50%}
.sbSide{margin-left:auto;text-align:right;line-height:1.5}
.sbHead{display:flex;align-items:center;gap:16px;height:56px;padding:0 20px}.sbHead span:first-child{width:64px;flex:none}.sbHead img{width:232px;height:50px;object-fit:contain;flex:none}.sbHead .sbSide{width:190px;flex:none}
.sbRows.L{height:calc(100% - 62px);margin-top:6px}.sbRows.L .sbRow{height:112px}.sbRows.L .sbSide{width:190px;flex:none}.sbRow.none{background:#fffaf0}.sbRow.none .sbWk{opacity:.6}
.sbCup{width:232px;flex:none;display:flex;flex-direction:column;align-items:center;gap:7px}.sbCup .sbHole{width:72px;height:72px;box-shadow:inset 0 5px 0 #e2d0b0,0 0 0 5px var(--c)}
.sbCup.got .sbHole{background:#fff6d6}.sbCup.got svg{animation:sbStar .5s cubic-bezier(.3,1.7,.45,1) backwards;animation-delay:calc(var(--i)*60ms)}
.sbPips{display:flex;gap:5px;height:12px}.sbPips i{width:12px;height:12px;border-radius:50%;background:#eadcc3}.sbPips i.on{background:var(--c)}
.sbTop{display:flex;align-items:center;gap:16px;height:76px}
.sbBack{width:64px;height:64px;border-radius:50%;background:#fff;box-shadow:0 5px 0 #ecd9b8;display:grid;place-items:center;cursor:pointer}
.sbBack::before{content:'';width:20px;height:20px;border-left:8px solid #c98f52;border-bottom:8px solid #c98f52;border-radius:3px;transform:translateX(5px) rotate(45deg)}
.sbMini{display:flex;gap:8px;margin-left:10px}.sbMini span{width:50px;height:50px;border-radius:50%;background:#f3e6cf;display:grid;place-items:center}.sbMini span.t{background:#fff;box-shadow:0 0 0 5px #ff8a5c}.sbMini span.out{visibility:hidden}
.sbTop .p{margin-left:auto;margin-right:56px;font-size:19px!important}
.sbLane{display:flex;align-items:center;gap:14px;height:142px;margin-top:12px;padding:0 22px;border-radius:32px}
.sbLane>img{width:160px;max-height:62px;object-fit:contain;flex:none;background:#fff;border-radius:16px;padding:7px 10px;box-shadow:0 4px 0 rgba(0,0,0,.12);margin-right:6px}
.sbAct{width:112px;text-align:center}
.sbTile{position:relative;width:84px;height:84px;margin:0 auto 5px;border-radius:26px;background:#fff;box-shadow:0 6px 0 rgba(0,0,0,.16);display:grid;place-items:center;font-size:46px;line-height:1}
.sbAct.sm{width:auto;flex:1 1 0;min-width:0;max-width:96px}.sbAct.sm .sbTile{width:66px;height:66px;border-radius:22px;font-size:36px}.sbAct.sm .sbTick{right:-9px;top:-9px;width:30px;height:30px;border-width:3px}.sbAct.sm .sbTick::before{left:7px;top:3px;width:7px;height:12px;border-width:4px}
.sbAct.sm .p{white-space:normal!important;font-size:13px!important;line-height:1.15}.sbLane .sbSum{padding-left:14px;flex:none}
.sbTile span{display:grid;place-items:center}.sbTile img{width:70px;height:70px;object-fit:contain;display:block}.sbAct.sm .sbTile img{width:58px;height:58px}
.sbTile .n{font-weight:700;font-style:normal}.sbAct.no .sbTile .n{filter:none;opacity:.4}
.sbAct.no .sbTile{background:rgba(255,255,255,.55);box-shadow:0 6px 0 rgba(0,0,0,.07)}.sbAct.no .sbTile span{filter:grayscale(1);opacity:.35}
.sbTick{position:absolute;right:-10px;top:-10px;width:36px;height:36px;border-radius:50%;background:#35b24a;border:4px solid #fff}
.sbTick::before{content:'';position:absolute;left:9px;top:5px;width:8px;height:14px;border-right:5px solid #fff;border-bottom:5px solid #fff;transform:rotate(40deg)}
.sbLane .p{color:rgba(60,40,15,.78)!important;font-size:15px!important}.sbLane .p b{color:#3c280f!important}
.sbSum{margin-left:auto;text-align:right;line-height:1.5;font-size:17px!important}`;
  document.head.appendChild(css);
  const star = (s, c = '#ffb52e', edge = '#e08f0c') => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? .46 : 1; d += (i ? 'L' : 'M') + (50 + Math.cos(a) * 44 * q).toFixed(1) + ' ' + (52 + Math.sin(a) * 44 * q).toFixed(1); }
    return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><path d="${d}Z" fill="${c}" stroke="${edge}" stroke-width="7" stroke-linejoin="round"/></svg>`; };

  /* ---------- the month: rows of seven days ---------- */
  const now = new Date(), Y = now.getFullYear(), M = now.getMonth(), TODAY = T.dayKey(now), last = new Date(Y, M + 1, 0).getDate();
  const WEEKS = []; for (let d = 1; d <= last; d++) { const w = Math.floor((d - 1) / 7); (WEEKS[w] = WEEKS[w] || Array(7).fill(null))[(d - 1) % 7] = T.dayKey(new Date(Y, M, d)); }   // week 1 = days 1 to 7, week 2 = 8 to 14 ...; days 29 to 31 make a short fifth row
  const NOW = WEEKS.findIndex(w => w.includes(TODAY));

  /* ---------- the numbers: the real log, or made-up ones to try the look ---------- */
  function sample() { const D = {}; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (const w of WEEKS) for (const k of w) { if (!k || k > TODAY || rnd() < .25) continue; const d = D[k] = {};
      for (const g of T.PROGS) { if (rnd() < .35) continue; const S = d[g] = { o: 1 + (rnd() < .3), a: {} }; for (const a of (g === 'pbl' ? T.pblActs('1-1') : T.ACTS[g])) if (rnd() < .45) { const dn = +(rnd() < .8); S.a[a[0]] = { p: dn + (rnd() < .4), d: dn, s: dn * (1 + (rnd() < .5)) }; } } }
    return D; }
  let DAYS = {}; const fresh = () => { if (!SAMPLE) try { T.sync(); } catch (e) {} DAYS = SAMPLE ? (fresh.s = fresh.s || (LESSON ? sampleL() : sample())) : T.days(); };
  const sum = keys => { const R = { days: 0, plays: 0, stars: 0, by: {} }; for (const g of T.PROGS) R.by[g] = { o: 0, a: {} };
    for (const k of keys) { const d = k && DAYS[k]; if (!d) continue; R.days++; for (const g in d) { const B = R.by[g] = R.by[g] || { o: 0, a: {} }; B.o += d[g].o || 0;
      for (const n in d[g].a) { const a = d[g].a[n], x = B.a[n] = B.a[n] || { p: 0, d: 0, s: 0 }; x.p += a.p; x.d += a.d; x.s += a.s; R.plays += a.p; R.stars += a.s; } } }
    return R; };
  const total = () => { fresh(); return sum(Object.keys(DAYS)).stars; };

  /* ---------- THE BOARD: no calendar. Four rows = the month's four LESSON weeks; each week has three
     stars to win, one per programme, gold when every activity of that week is finished; pips show how far each one is ---------- */
  const LESSON = !/[?&]look=date/.test(location.search);   // 25 Nov: the board is the four lesson weeks (user: "why do we still have the five??"); the old date rows stay behind &look=date
  function sampleL() { const D = {}; const put = (w, i, g, n, o) => { const dt = new Date(Y, M, Math.min(last, (w - 1) * 7 + 2 + (i % 3) * 2)), k = T.dayKey(dt), d = D[k] = D[k] || {}, S = d[g] = d[g] || { o: 1, a: {} }; S.a[n] = Object.assign({ w }, o); };
    for (let w = 1; w <= 3; w++) for (const g of T.PROGS) actsL(g, w, 1).forEach((a, i, all) => { const dn = w === 1 || (w === 2 ? !(g === 'lgr' && i === all.length - 1) : i < Math.ceil(all.length / 2) && g !== 'fm'); if (dn) put(w, i, g, a[0], { p: 1 + (i % 3 === 0), d: 1, s: 1 + (i % 2) }); });
    return D; }
  const pblMonth = () => { let m = 1; for (const k in DAYS) for (const n in ((DAYS[k].pbl || {}).a || {})) { const x = +n.split('-')[0]; if (x > m) m = x; } return m; };   // the island the child is on now
  function actsL(g, w, mon) { return g === 'pbl' ? T.pblActs((mon || pblMonth()) + '-' + w) : T.ACTS[g]; }
  function sumL(w) { const mon = pblMonth(), R = { days: 0, plays: 0, stars: 0, by: {} }; for (const g of T.PROGS) R.by[g] = { days: 0, a: {} };
    for (const k in DAYS) { let any = false; for (const g of T.PROGS) { const A = (DAYS[k][g] || {}).a || {}; let mine = false;
        for (const n in A) { const a = A[n], wk = g === 'pbl' && n.includes('/') ? (+n.split('-')[0] === mon ? +n.split('/')[0].split('-')[1] : 0) : a.w; if (wk !== w) continue;
          const x = R.by[g].a[n] = R.by[g].a[n] || { p: 0, d: 0, s: 0 }; x.p += a.p; x.d += a.d; x.s += a.s; R.plays += a.p; R.stars += a.s; mine = true; }
        if (mine) { R.by[g].days++; any = true; } } if (any) R.days++; }
    for (const g of T.PROGS) { const acts = actsL(g, w, mon); R.by[g].acts = acts; R.by[g].done = acts.filter(a => (R.by[g].a[a[0]] || {}).d).length; R.by[g].full = R.by[g].done === acts.length; }
    R.done = T.PROGS.reduce((n, g) => n + R.by[g].done, 0); R.all = T.PROGS.reduce((n, g) => n + R.by[g].acts.length, 0); return R; }
  function monthL() { pen.src = '../art/penny/cheer.webp'; const S = [1, 2, 3, 4].map(sumL), cur = Math.max(0, S.findIndex(R => R.done < R.all));
    board.innerHTML = X + '<div class="sbHead"><span></span>' + T.PROGS.map(g => `<img src="${LOGOS + LOGO[g]}" alt="">`).join('') + '<span class="sbSide"></span></div><div class="sbRows L">' + S.map((R, i) =>
      `<div class="sbRow ${i === cur ? 'now' : ''} ${R.done ? '' : 'none'}" data-w="${i + 1}"><div class="sbWk" style="background:${WCOL[i]}">${i + 1}</div>` +
        T.PROGS.map((g, j) => { const B = R.by[g]; return `<div class="sbCup ${B.full ? 'got' : ''}" style="--c:${COL[g]};--i:${i * 3 + j}"><div class="sbHole">${B.full ? star(62) : star(46, '#eadcc3', '#dccbaa')}</div><div class="sbPips">${B.acts.map(a => `<i class="${(B.a[a[0]] || {}).d ? 'on' : ''}"></i>`).join('')}</div></div>`; }).join('') +
        `<div class="sbSide p">${R.done ? `<b>${R.done}</b> of <b>${R.all}</b> done<br>played on <b>${R.days}</b> days` : ''}</div></div>`).join('') + '</div>'; }
  function weekL(w) { pen.src = '../art/penny/point.webp'; const R = sumL(w);
    board.innerHTML = X + `<div class="sbTop"><div class="sbBack"></div><div class="sbWk" style="background:${WCOL[w - 1]}">${w}</div><div class="sbMini">` + T.PROGS.map(g => `<span style="box-shadow:0 0 0 4px ${COL[g]}">${R.by[g].full ? star(40) : ''}</span>`).join('') +
      `</div><div class="p"><b>${R.done}</b> of <b>${R.all}</b> done · played on <b>${R.days}</b> days · <b>${R.stars}</b> stars</div></div>` +
      T.PROGS.map(g => { const B = R.by[g], num = g === 'pbl';
        return `<div class="sbLane" style="background:${PALE[g]}"><img src="${LOGOS + LOGO[g]}" alt="">` +
          B.acts.map(a => { const x = B.a[a[0]] || { p: 0, d: 0 }, step = typeof a[2] === 'number', ic = (ICON[g] || {})[a[0].split('/').pop()];
            return `<div class="sbAct ${x.d ? '' : 'no'} ${num ? 'sm' : ''}" title="${a[1]}"><div class="sbTile"><span ${step ? `class="n" style="color:${COL[g]}"` : ''}>${ic ? `<img src="${ic}" alt="">` : a[2]}</span>${x.d ? '<i class="sbTick"></i>' : ''}</div><div class="p">${step ? '' : a[1]}${x.p ? ` <b>×${x.p}</b>` : step ? '&nbsp;' : ''}</div></div>`; }).join('') +
          `<div class="sbSum p"><b>${B.done}</b> of <b>${B.acts.length}</b> done<br>played on <b>${B.days}</b> days</div></div>`; }).join(''); }

  /* ---------- the board ---------- */
  const sb = document.createElement('div'); sb.id = 'sb'; sb.innerHTML = '<div id="sbIn"><img id="sbPenny" src="../art/penny/cheer.webp" alt=""><div id="sbBoard"></div></div>'; rot.appendChild(sb);
  const board = sb.querySelector('#sbBoard'), inner = sb.querySelector('#sbIn'), pen = sb.querySelector('#sbPenny');
  const X = '<div id="sbX"></div>';
  function month() { pen.src = '../art/penny/cheer.webp'; const rowH = Math.min(116, Math.floor((536 - (WEEKS.length - 1) * 12) / WEEKS.length)), hole = Math.min(68, rowH - 34);
    board.innerHTML = X + '<div class="sbRows">' + WEEKS.map((wk, w) => { const R = sum(wk), later = wk.every(k => !k || k > TODAY); let n = 0;
      return `<div class="sbRow ${w === NOW ? 'now' : later ? 'later' : ''}" data-w="${w}" style="height:${rowH}px"><div class="sbWk" style="background:${WCOL[w % 6]}">${w + 1}</div>` +
        wk.map(k => { const d = k && DAYS[k]; return `<div class="sbDay ${k ? '' : 'out'} ${k === TODAY ? 'today' : ''} ${d ? 'got' : ''}" style="--h:${hole}px;--i:${d ? n++ : 0}"><div class="sbHole">${d ? star(hole - 10) : ''}</div><div class="sbDots">${d ? T.PROGS.filter(g => d[g]).map(g => `<i style="background:${COL[g]}"></i>`).join('') : ''}</div></div>`; }).join('') +
        `<div class="sbSide p">${later ? '' : `<b>${R.days}</b> days · <b>${R.plays}</b> activities<br><b>${R.stars}</b> stars`}</div></div>`; }).join('') + '</div>'; }
  function week(w) { pen.src = '../art/penny/point.webp'; const wk = WEEKS[w], R = sum(wk);
    board.innerHTML = X + `<div class="sbTop"><div class="sbBack"></div><div class="sbWk" style="background:${WCOL[w % 6]}">${w + 1}</div><div class="sbMini">` +
      wk.map(k => `<span class="${k ? '' : 'out'} ${k === TODAY ? 't' : ''}">${k && DAYS[k] ? star(40) : ''}</span>`).join('') + `</div><div class="p"><b>${R.days}</b> days · <b>${R.plays}</b> activities · <b>${R.stars}</b> stars</div></div>` +
      T.PROGS.map(g => { const B = R.by[g], rooms = Object.keys(B.a).map(n => n.split('/')[0]).filter(r => /^[0-9]+-[0-9]+$/.test(r)).sort((a, b) => a.split('-')[0] - b.split('-')[0] || a.split('-')[1] - b.split('-')[1]),
          acts = g === 'pbl' ? T.pblActs(rooms.pop() || '1-1') : T.ACTS[g], num = g === 'pbl', done = acts.filter(a => (B.a[a[0]] || {}).d).length;
        return `<div class="sbLane" style="background:${PALE[g]}"><img src="${LOGOS + LOGO[g]}" alt="">` +
          acts.map(a => { const x = B.a[a[0]] || { p: 0, d: 0 }; const step = typeof a[2] === 'number';   // Start PBL's activities are plain numbered steps (the user's choice): the number is the picture, the title shows on hover
            return `<div class="sbAct ${x.d ? '' : 'no'} ${num ? 'sm' : ''}" title="${a[1]}"><div class="sbTile"><span ${step ? `class="n" style="color:${COL[g]}"` : ''}>${(ICON[g] || {})[a[0].split('/').pop()] ? `<img src="${ICON[g][a[0].split('/').pop()]}" alt="">` : a[2]}</span>${x.d ? '<i class="sbTick"></i>' : ''}</div><div class="p">${step ? '' : a[1]}${x.p ? ` <b>×${x.p}</b>` : step ? '&nbsp;' : ''}</div></div>`; }).join('') +
          `<div class="sbSum p"><b>${done}</b> of <b>${acts.length}</b> done<br>opened <b>${B.o}</b> times</div></div>`; }).join(''); }
  function fit() { const W = (window.Turn && Turn.W) || innerWidth, H = (window.Turn && Turn.H) || innerHeight; sb.style.width = W + 'px'; sb.style.height = H + 'px'; inner.style.transform = `scale(${Math.min(W / 1500, H / 690)})`; }
  const open = () => { fresh(); fit(); (LESSON ? monthL : month)(); sb.classList.add('on'); show(); }, close = () => sb.classList.remove('on');
  sb.addEventListener('click', e => { e.stopPropagation(); const t = e.target;
    if (t.id === 'sbX' || t === sb) return close(); if (t.closest('.sbBack')) return (LESSON ? monthL : month)();
    const r = t.closest('.sbRow'); if (r && !r.classList.contains('later')) (LESSON ? weekL : week)(+r.dataset.w); });
  for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'mousedown']) sb.addEventListener(ev, e => e.stopPropagation());   // taps on the board never walk Penny
  addEventListener('resize', () => setTimeout(fit, 0));

  /* ---------- the star chip: shows the stars won in the programmes and opens the board ---------- */
  const chip = document.getElementById('chip');
  const show = () => { if (chip) chip.querySelector('b').textContent = total(); };
  if (chip) { show(); for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'mousedown']) chip.addEventListener(ev, e => e.stopPropagation()); chip.addEventListener('click', e => { e.stopPropagation(); open(); }); }
  addEventListener('pageshow', show); document.addEventListener('visibilitychange', () => document.hidden || show());
  window.StarBoard = { open, close, week: w => (LESSON ? weekL : week)(w) };
  if (/[?&]board=(open|sample)/.test(location.search)) setTimeout(() => { open(); const m = /[?&]bweek=([0-9])/.exec(location.search); if (m && LESSON && m[1] >= 1 && m[1] <= 4) weekL(+m[1]); else if (m && WEEKS[m[1] - 1]) week(m[1] - 1); }, 600);   // for trying it out
})();
