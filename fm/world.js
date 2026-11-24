/* Fresh Math space world (sample, 2026-11-20). The world only: 4 galaxies = 4 levels, 6 planets each = 24 months.
   Tap a planet and the rocket lands on it: five stops on a path, then the landing pad. The stops are EMPTY slots;
   the math activities come later from the 목차 worksheets. Rewards here are this world's own: stars, alien friends,
   Space Passport. Progress is kept on this device only (localStorage 'fm.world.sample'). */
(function () {
  let W = 1180; const H = 820, BASE = 1180, $ = s => document.querySelector(s);   // W grows with the window, so the scene fills a wide screen
  const GAL = [
    { en: 'Milky Way', ko: '은하수', at: [215, 570] }, { en: 'Andromeda', ko: '안드로메다', at: [470, 425] },
    { en: 'Whirlpool', ko: '소용돌이 은하', at: [735, 315] }, { en: 'Pinwheel', ko: '바람개비 은하', at: [985, 240] },
  ];
  const PL = [[165, 610], [345, 440], [540, 600], [725, 410], [905, 585], [1035, 330]];        // six planets on the star path
  const STOPS = [[450, 558], [545, 444], [695, 421], [850, 416], [1003, 369]], PAD = [1026, 232], START = [300, 640];   // centres measured from the road's pixels; the road is only about 55 px tall   // measured on the path's centre line   // on art/surface.jpg
  const HUE = [0, 35, 205, 318, 95, 160];                                                           // each planet's own colour, from one painting
  /* the 24 lessons, one planet each: from worksheets/contents/fresh-math-24-months.md (목차 draft, 20 Nov 2026) */
  const LESSONS = [['Shapes Around Us', '여러 가지 모양'], ['Shape Builders', '도형 만들기'], ['Lines Everywhere', '여러 가지 선'], ['Lines & Angles', '선과 각'], ['Blocks & Balls', '입체도형'], ['Build It Up!', '쌓기나무'],
    ["Let's Measure!", '길이 재기'], ['Long & Short', '길이 비교와 단위'], ['Big & Small', '넓이 비교'], ['Cover It Up!', '넓이와 둘레'], ['Weigh It!', '무게 재기'], ['Heavy & Light', '무게 비교와 단위'],
    ['Find the Pattern', '규칙 찾기'], ['Make a Pattern', '규칙 만들기'], ['Sort It Out', '분류하기'], ['Sort & Count', '표와 그래프'], ['My Day', '시각 읽기'], ['Telling Time', '시간과 달력'],
    ['Add & Subtract', '덧셈과 뺄셈'], ['Carry & Borrow', '받아올림과 받아내림'], ['Times Tables', '곱셈'], ['Share It Equally', '나눗셈'], ['Fractions & Decimals', '분수와 소수'], ['Mixed Calculation', '혼합 계산과 문장제']];
  const nm = n => `<span class="nm">${LESSONS[n][0]}<small>${LESSONS[n][1]}</small></span>`;
  let S = load(), busy = false;
  function load() { try { return Object.assign({ done: 0, stars: 0, stop: 0, deco: [] }, JSON.parse(localStorage.getItem('fm.world.sample'))); } catch (e) { return { done: 0, stars: 0, stop: 0, deco: [] }; } }
  const save = () => { try { localStorage.setItem('fm.world.sample', JSON.stringify(S)); } catch (e) {} };
  const curG = () => Math.min(3, Math.floor(S.done / 6));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  let redraw = null;
  function fit() {
    let k = innerHeight / H, w = Math.round(innerWidth / k); if (w < BASE) { w = BASE; k = innerWidth / BASE; } w = Math.min(w, 2100);
    const st = $('#stage').style, changed = w !== W; W = w; st.width = W + 'px'; st.transform = `scale(${k})`; st.left = (innerWidth - W * k) / 2 + 'px'; st.top = (innerHeight - H * k) / 2 + 'px';
    if (changed) { document.querySelectorAll('#stage canvas').forEach(c => { c.width = W; }); if (redraw && !busy) redraw(); }
  }
  const X = x => x * W / BASE;                       // spread a 1180-wide layout over the real width
  addEventListener('resize', fit); fit(); let _w = 0, _h = 0; setInterval(() => { if (innerWidth !== _w || innerHeight !== _h) { _w = innerWidth; _h = innerHeight; fit(); } }, 400);
  const pt = e => { const r = $('#stage').getBoundingClientRect(), k = r.width / W; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };

  /* ---------- little sounds, made in code (quiet; the kids' site will own the real sound switch) ---------- */
  let AC; const ac = () => AC || (AC = new (window.AudioContext || window.webkitAudioContext)());
  function tone(f0, f1, t, vol = .09, type = 'sine', when = 0) {
    try { const a = ac(), o = a.createOscillator(), g = a.createGain(), n = a.currentTime + when; o.type = type; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f1, n + t);
      g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(.001, n + t); o.connect(g).connect(a.destination); o.start(n); o.stop(n + t + .02); } catch (e) {}
  }
  const snd = { pop: () => tone(420, 880, .12), boing: () => tone(180, 520, .22, .1, 'triangle'), nope: () => tone(300, 220, .18, .06, 'triangle'),
    whoosh: () => tone(200, 900, .7, .05, 'sawtooth'), ding: k => tone(520 + k * 110, 560 + k * 110, .2, .1, 'triangle'),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, .28, .09, 'triangle', i * .11)),
    level: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f * 1.01, .4, .1, 'triangle', i * .12)) };

  /* ---------- effects: twinkling stars, shooting stars, bursts, rocket trail ---------- */
  const bgc = $('#fx').getContext('2d'), fgc = $('#fx2').getContext('2d');
  const tw = Array.from({ length: 190 }, () => ({ x: Math.random() * 2100, y: Math.random() * H, r: Math.random() * 2.2 + .6, p: Math.random() * 6.3, s: Math.random() * 2 + 1 }));
  let shoot = null, parts = [], last = performance.now(), sky = true;
  const COLS = ['#ffc94a', '#fff', '#ff8fa0', '#5ff2c8', '#9db4ff', '#ffe27a'];
  function burst(x, y, n = 26, power = 9, star = true) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = power * (.35 + Math.random() * .75);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * .25, g: .28, life: 1, d: .012 + Math.random() * .014, r: 5 + Math.random() * 9, c: COLS[i % COLS.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, star }); }
  }
  function starPath(c, x, y, r, rot) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, q = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
  function frame(now) {
    const dt = Math.min(2.5, (now - last) / 16.7); last = now;
    bgc.clearRect(0, 0, W, H);
    if (sky) {
      for (const s of tw) { const a = .35 + .65 * Math.abs(Math.sin(now / 1000 * s.s + s.p)); bgc.globalAlpha = a; bgc.fillStyle = '#fff'; bgc.beginPath(); bgc.arc(s.x, s.y, s.r * (.7 + a * .5), 0, 6.3); bgc.fill(); }
      if (!shoot && Math.random() < .004 * dt) shoot = { x: Math.random() * W * .8, y: -20, vx: 9 + Math.random() * 5, vy: 5 + Math.random() * 3, life: 1 };
      if (shoot) { shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; shoot.life -= .012 * dt; const g = bgc.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 12, shoot.y - shoot.vy * 12);
        g.addColorStop(0, 'rgba(255,255,255,' + Math.max(0, shoot.life) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); bgc.globalAlpha = 1; bgc.strokeStyle = g; bgc.lineWidth = 4; bgc.lineCap = 'round';
        bgc.beginPath(); bgc.moveTo(shoot.x, shoot.y); bgc.lineTo(shoot.x - shoot.vx * 12, shoot.y - shoot.vy * 12); bgc.stroke(); if (shoot.life <= 0 || shoot.y > H) shoot = null; }
    }
    bgc.globalAlpha = 1; fgc.clearRect(0, 0, W, H);
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= .985; p.rot += p.vr * dt; p.life -= p.d * dt;
      fgc.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); fgc.fillStyle = p.c;
      if (p.star) { starPath(fgc, p.x, p.y, Math.max(0, p.r * (.5 + p.life * .6)), p.rot); fgc.fill(); } else { fgc.beginPath(); fgc.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, 6.3); fgc.fill(); } }
    parts = parts.filter(p => p.life > 0 && p.y < H + 40); fgc.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  $('#stage').addEventListener('pointerdown', e => { const [x, y] = pt(e); burst(x, y, 7, 4, false); });

  /* ---------- the rocket ---------- */
  const rk = $('#rocket'); let rpos = [0, 0];
  function park(x, y) { rpos = [x, y]; rk.style.transform = `translate(${x}px, ${y}px)`; rk.classList.add('idle'); }
  function fly(to, done) {
    const from = rpos.slice(), dx = to[0] - from[0], dy = to[1] - from[1], dist = Math.hypot(dx, dy); if (dist < 4) { done && done(); return; }
    const c = [(from[0] + to[0]) / 2 - dy * .25, (from[1] + to[1]) / 2 - Math.abs(dx) * .3 - 60], T = Math.max(600, Math.min(1400, dist * 1.9)), t0 = performance.now();
    rk.classList.remove('idle'); snd.whoosh(); let px = from[0], py = from[1], over = false;
    const land = () => { if (over) return; over = true; rpos = to.slice(); rk.style.transform = `translate(${to[0]}px, ${to[1]}px)`; rk.classList.add('idle'); done && done(); };
    setTimeout(land, T + 400);                       // the flight always ends, even if the browser pauses animation frames
    (function step(now) {
      if (over) return; const t = Math.min(1, (now - t0) / T), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - e;
      const x = u * u * from[0] + 2 * u * e * c[0] + e * e * to[0], y = u * u * from[1] + 2 * u * e * c[1] + e * e * to[1];
      const ang = Math.atan2(y - py, x - px) * 180 / Math.PI + 90, sq = 1 + Math.sin(t * Math.PI) * .18;
      rk.style.transform = `translate(${x}px, ${y}px) rotate(${t < 1 ? ang : 0}deg) scale(${2 - sq}, ${sq})`;
      for (let i = 0; i < 2; i++) parts.push({ x: x + (Math.random() - .5) * 14, y: y - 44 + (Math.random() - .5) * 14, vx: (px - x) * .3 + (Math.random() - .5) * 2, vy: (py - y) * .3 + (Math.random() - .5) * 2, g: .02, life: 1, d: .035, r: 7 + Math.random() * 8, c: ['#ffc94a', '#ff8fa0', '#fff'][Math.random() * 3 | 0], rot: 0, vr: 0, star: false });
      px = x; py = y; if (t < 1) requestAnimationFrame(step); else land();
    })(t0);
  }
  const flyP = to => new Promise(r => fly(to, r));

  /* ---------- screens ---------- */
  const starSvg = `<svg viewBox="0 0 60 60"><path d="M30 4 L37.5 21 L56 23 L42 36 L46 55 L30 45 L14 55 L18 36 L4 23 L22.5 21z" fill="#ffc94a" stroke="#d99a1c" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
  function setTitle(en, ko) { $('#bookb').hidden = true; $('#title').innerHTML = `<span>${en}<small>${ko}</small></span>`; }
  function setBack(en, ko, fn) { const b = $('#back'); b.hidden = !en; if (en) { b.querySelector('.l').innerHTML = `${en}<small>${ko}</small>`; b.onclick = () => { if (!busy) { snd.pop(); fn(); } }; } }
  function setStars(bump) { const c = $('#stars'); c.querySelector('b').textContent = S.stars; if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
  function toast(en, ko) { const t = $('#toast'); t.innerHTML = `${en}<small>${ko}</small>`; t.hidden = false; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2300); }
  let stopGame = null;
  function swap(to, build) {
    $('#mapb').hidden = to !== 'uni'; if (stopGame) { stopGame(); stopGame = null; }
    const same = $('.screen.on'); if (same && same.id === to) { same.classList.remove('on'); build(same); void same.offsetWidth; same.classList.add('on'); return; }   // same screen: rebuild in place
    if (same) { same.classList.remove('on'); same.classList.add('out'); setTimeout(() => { same.classList.remove('out'); same.innerHTML = ''; }, 300); }
    setTimeout(() => { const s = $('#' + to); build(s); s.classList.add('on'); }, same ? 260 : 0);
  }
  function universe(flyIn) {
    swap('uni', s => {
      const g = curG(); sky = true; redraw = () => universe(false); rk.style.setProperty('--rs', 1); const GA = GAL.map(G => [X(G.at[0]), G.at[1]]); setBack(); setTitle('Fresh Math Space', '우주여행 미션'); $('#pass').hidden = false;
      let d = `M${GA[0][0]} ${GA[0][1]}`; for (let i = 1; i < 4; i++) { const a = GA[i - 1], b = GA[i]; d += ` Q${(a[0] + b[0]) / 2 + 30} ${a[1] - 10} ${b[0]} ${b[1]}`; }
      s.innerHTML = `<svg class="link" viewBox="0 0 ${W} ${H}"><path d="${d}"/></svg>` + GAL.map((G, i) => {
        const n = Math.max(0, Math.min(6, S.done - i * 6)), st = n >= 6 ? 'done' : i === g ? 'now' : i < g ? 'done' : 'sleep';
        return `<button class="gx ${st}" data-g="${i}" style="left:${GA[i][0]}px;top:${GA[i][1]}px;animation-delay:${i * .12}s"><span class="in"><i class="ring"></i><img src="art/g${i + 1}.png" alt="">
          <b class="lvl">${i + 1}</b>${st === 'sleep' ? '<i class="zz">z z</i>' : ''}${n >= 6 ? `<i class="crown">${starSvg}</i>` : ''}
          <span class="lab">${G.en}<small>${G.ko}</small></span><span class="dots">${'<i class="d"></i>'.repeat(n)}${'<i></i>'.repeat(6 - n)}</span></span></button>`; }).join('')
        + `<button class="hm gm" style="left:${X(640)}px;top:690px"><span class="in"><img src="art/pal.png" alt=""><span class="lab">Shape Catch<small>모양 잡기 · 말하기</small></span></span></button>`
        + `<button class="hm" style="left:${X(1020)}px;top:640px"><span class="in"><img src="art/home.png" alt=""><span class="lab">My Planet<small>나의 행성</small></span></span></button>`;
      const home = [GA[g][0] + 108, GA[g][1] + 40];
      if (flyIn) setTimeout(() => fly(home, () => { burst(home[0], home[1] - 50, 30, 10); snd.boing(); }), 500); else park(home[0], home[1]);
      s.onclick = e => { if (e.target.closest('.gm') && !busy) { busy = true; snd.pop(); fly([X(640), 690], () => { busy = false; game(); }); return; }
        if (e.target.closest('.hm') && !busy) { busy = true; snd.pop(); fly([X(1020), 640], () => { busy = false; mine(); }); return; }
        const b = e.target.closest('.gx'); if (!b || busy) return; const i = +b.dataset.g;
        if (b.classList.contains('sleep')) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); snd.nope(); toast('Still asleep! Finish the galaxy before it.', '아직 자고 있어요! 앞의 은하를 먼저 끝내요.'); return; }
        busy = true; snd.pop(); burst(GA[i][0], GA[i][1], 22, 8); fly([GA[i][0], GA[i][1] + 30], () => { busy = false; galaxy(i); }); };
    });
  }
  function galaxy(g) {
    swap('gal', s => {
      const base = g * 6, n = Math.max(0, Math.min(6, S.done - base)), P = PL.map(q => [X(q[0]), q[1]]); sky = true; redraw = () => galaxy(g); rk.style.setProperty('--rs', 1); setBack('Galaxies', '은하', () => universe(false)); setTitle(`${GAL[g].en} · Level ${g + 1}`, `${GAL[g].ko} · 레벨 ${g + 1}`); $('#pass').hidden = false;
      let d = `M${P[0][0]} ${P[0][1]}`; for (let i = 1; i < 6; i++) { const a = P[i - 1], b = P[i]; d += ` Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 70} ${b[0]} ${b[1]}`; }
      s.innerHTML = `<svg class="link" viewBox="0 0 ${W} ${H}"><path d="${d}"/></svg>` + P.map((p, i) => {
        const st = i < n ? 'done' : i === n ? 'now' : 'todo';
        return `<button class="pl ${st}" data-p="${i}" style="left:${p[0]}px;top:${p[1]}px;animation-delay:${i * .09}s"><span class="in">${st === 'now' ? '<i class="glow"></i><i class="arrow"></i>' : ''}
          <img src="art/p${base + i + 1}.png" alt="">${st === 'done' ? `<i class="badge">${starSvg}</i>` : ''}<b class="num">${base + i + 1}</b>${nm(base + i)}</span></button>`; }).join('');
      const at = Math.min(5, n); park(P[at][0] + 78, P[at][1] + 30);
      s.onclick = e => { const b = e.target.closest('.pl'); if (!b || busy) return; const i = +b.dataset.p;
        if (b.classList.contains('todo')) { b.classList.remove('squash'); void b.offsetWidth; b.classList.add('squash'); snd.nope(); toast('Not yet! Finish the glowing planet first.', '아직이에요! 빛나는 행성을 먼저 끝내요.'); return; }
        busy = true; snd.pop(); fly([P[i][0] + 78, P[i][1] + 30], () => { b.classList.remove('squash'); void b.offsetWidth; b.classList.add('squash'); snd.boing(); burst(P[i][0], P[i][1], 18, 7);
          setTimeout(() => { busy = false; planet(g, i); }, 380); }); };
    });
  }
  /* on a planet: five stops on the path, then the landing pad. Each stop is an empty slot for one worksheet activity. */
  function planet(g, i) {
    const num = g * 6 + i + 1, finished = S.done >= num; let at = finished ? 4 : (S.done === num - 1 ? Math.min(3, S.stop || 0) : 0);   // 4 stops = the month's 4 weeks; the 5th tile is the book
    swap('land', s => {
      const f = W / BASE, OY = 380, M = q => [(q[0] - 590) * f + W / 2, (q[1] - OY) * f + OY], ST = STOPS.map(M), PD = M(PAD), SR = M(START);   // where things are on the real stage
      sky = false; redraw = () => planet(g, i); rk.style.setProperty('--rs', f); setBack(GAL[g].en, GAL[g].ko, () => galaxy(g)); setTitle(`${num} · ${LESSONS[num - 1][0]}`, `미션 ${num} · ${LESSONS[num - 1][1]}`); $('#pass').hidden = true; $('#bookb').hidden = false; $('#bookb').onclick = () => { if (!busy) missionLog(num); }; 
      let d = `M${START[0]} ${START[1]}`; STOPS.forEach(p => d += ` L${p[0]} ${p[1]}`); d += ` L${PAD[0]} ${PAD[1]}`;
      s.innerHTML = `<div class="zoom" style="left:${(W - BASE) / 2}px;transform:scale(${Math.max(f, W / BASE)});transform-origin:590px ${OY}px"><img class="surf" src="art/surface.jpg" alt="" style="filter:hue-rotate(${HUE[i]}deg)"><svg class="link" viewBox="0 0 ${BASE} ${H}"><path d="${d}"/></svg>
        <span class="flag ${finished ? 'up' : ''}" style="left:${PAD[0] - 96}px;top:${PAD[1] + 10}px"><img src="art/flag.png" alt=""></span>
        ${STOPS.slice(0, 4).map((p, k) => `<button class="stp ${k < at ? 'done' : k === at ? 'now' : 'todo'}" data-k="${k}" style="left:${p[0]}px;top:${p[1]}px;animation-delay:${.15 + k * .08}s"><span class="in"><b>${k + 1}</b></span></button>`).join('')}
        <button class="bk5${finished || at > 0 ? '' : ' locked'}" style="left:${STOPS[4][0]}px;top:${STOPS[4][1]}px"><img src="art/book.png" alt=""><b>Discussion Book</b></button>
        <img class="pal p1" src="art/pal.png" alt=""><img class="pal p2" src="art/pal.png" alt=""></div>`;
      const padAt = [PD[0] + 6 * f, PD[1] + 16 * f], home = finished ? padAt : at ? [ST[at - 1][0], ST[at - 1][1] - 8 * f] : SR;
      rpos = [home[0] - 260, -140]; rk.style.transform = `translate(${rpos[0]}px, ${rpos[1]}px)`; busy = true;
      setTimeout(() => fly(home, () => { busy = false; snd.boing(); burst(home[0], home[1], 16, 6, false); if (!finished && !at) toast('We landed! Tap week 1.', '착륙했어요! 1주를 눌러요.'); }), 350);
      let rest = home;   // where the rocket waits now
      s.onclick = async e => {
        const bt = e.target.closest('.bk5');   // the 5th step: My Discussion Book, open once the four weeks are done (as in Start PBL)
        if (bt) { if (busy) return; if (S.done < num && !(S.done === num - 1 && S.stop > 0)) { bt.classList.remove('shake'); void bt.offsetWidth; bt.classList.add('shake'); snd.nope(); return toast('Your Discussion Book opens when week 1 is done.', '1주를 하면 디스커션 북이 열려요.'); }
          snd.pop(); return discussionBook(num); }
        const b = e.target.closest('.stp'); if (!b || busy) return; const k = +b.dataset.k;
        if (b.classList.contains('done')) {   // a finished stop can be played again: the rocket flies back, the activity opens, no second star
          b.classList.remove('squash'); void b.offsetWidth; b.classList.add('squash'); snd.pop(); const again = ACTS[`${num}-${k}`];
          if (!again) { toast(`Week ${k + 1} is done. Its activities and talking go here.`, `${k + 1}주 완료! 여기에 이 주의 활동과 말하기가 들어가요.`); return; }
          busy = true; await flyP([ST[k][0], ST[k][1] - 8 * f]); const ok = await again(); if (ok) { S.book = S.book || {}; S.book[`${num}-${k}`] = 1; save(); burst(ST[k][0], ST[k][1], 22, 8); toast('You did it again! Great talking!', '다시 해냈어요! 말하기 최고!'); }
          await flyP(rest); busy = false; return; }
        if (b.classList.contains('todo')) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); snd.nope(); return; }
        busy = true; snd.pop(); await flyP([ST[k][0], ST[k][1] - 8 * f]);
        const act = ACTS[`${num}-${k}`]; if (act && !(await act())) { busy = false; return; }
        if (act) { S.book = S.book || {}; S.book[`${num}-${k}`] = 1; save(); }
        rest = [ST[k][0], ST[k][1] - 8 * f]; s.querySelector('.bk5').classList.remove('locked'); b.className = 'stp done squash'; snd.ding(k); burst(ST[k][0], ST[k][1], 22, 8); S.stars += 1; S.stop = k + 1; save(); setStars(true);
        toast(act ? `Week ${k + 1} done! Great talking!` : `Week ${k + 1} done! Its activities and talking go here.`, act ? `${k + 1}주 완료! 말하기 최고!` : `${k + 1}주 완료! 여기에 이 주의 활동과 말하기가 들어가요.`);
        const nx = s.querySelector(`.stp[data-k="${k + 1}"]`); if (nx) { nx.className = 'stp now'; busy = false; return; }
        await wait(500); await flyP(padAt); rest = padAt; s.querySelector('.flag').classList.add('up'); s.querySelectorAll('.pal').forEach(p => p.classList.add('jump'));
        snd.win(); burst(PD[0], PD[1] - 60 * f, 60, 13); S.done = Math.max(S.done, num); S.stop = 0; save(); s.querySelector('.bk5').classList.remove('locked'); await wait(1300); busy = false; party(g, i);
      };
    });
  }
  function party(g, i) {
    const num = g * 6 + i + 1, L = $('#levelup');
    L.innerHTML = `<i class="rays"></i><div class="lu"><img class="friend" src="art/alien.png" alt="" style="filter:hue-rotate(${HUE[i] + g * 50}deg) drop-shadow(0 0 30px rgba(255,226,122,.8))"><h1 class="sm">Mission complete!</h1>
      <p>${LESSONS[num - 1][0]}: a new friend from planet ${num}!<small>행성 ${num}에서 새 친구가 왔어요! · 여권에 도장 쾅!</small></p>
      <button class="go"><span>▶</span><span class="l">Hooray!<small>야호!</small></span></button>${BOOKS[num] ? '<button class="pill bookgo"><span class="l">Open my Discussion Book<small>디스커션 북 열기</small></span></button>' : ''}</div>`;
    L.hidden = false; let k = 0; const iv = setInterval(() => { burst(W * (.1 + Math.random() * .8), 120 + Math.random() * 400, 26, 11); if (++k > 4) clearInterval(iv); }, 300);
    const on = () => { if (S.done % 6 === 0 && S.done === num) levelUp(g); else galaxy(g); };
    L.querySelector('.go').onclick = () => { clearInterval(iv); L.hidden = true; snd.pop(); on(); };
    const bg = L.querySelector('.bookgo'); if (bg) bg.onclick = () => { clearInterval(iv); L.hidden = true; discussionBook(num, on); };   // the last step: the book; closing it carries on
  }
  function levelUp(g) {
    const lastOne = g >= 3, L = $('#levelup'), nx = GAL[Math.min(3, g + 1)];
    L.innerHTML = `<i class="rays"></i><div class="lu"><img class="g" src="art/g${Math.min(4, g + 2)}.png" alt=""><h1>${lastOne ? 'You did it!' : 'Level up!'}</h1>
      <p>${lastOne ? 'You explored all four galaxies!' : `Next galaxy: ${nx.en}`}<small>${lastOne ? '네 개의 은하를 모두 탐험했어요!' : `다음 은하: ${nx.ko} · 레벨 ${g + 2}`}</small></p>
      <button class="go"><span>▶</span><span class="l">${lastOne ? 'Look at my galaxies' : 'Fly there!'}<small>${lastOne ? '나의 은하 보기' : '날아가요!'}</small></span></button></div>`;
    L.hidden = false; snd.level(); let k = 0; const iv = setInterval(() => { burst(W * (.1 + Math.random() * .8), 120 + Math.random() * 400, 34, 12); if (++k > 7) clearInterval(iv); }, 280);
    L.querySelector('.go').onclick = () => { clearInterval(iv); L.hidden = true; snd.pop(); universe(true); };
  }
  /* ---------- a mission stop = one worksheet page online: VIDEO -> GAME -> SPEAKING, with Gerry talking all the way ----------
     SAMPLE: planet 1, stop 1 = FRESH MATH 1 · VERTICES · Week 1 · 04 "A Circle Has No Vertices"
     (worksheets/fresh-math/fm-01-shapes-around-us, page p06): its four shapes, its Think questions, its words.
     Gerry = painted pose pictures (art/gerry, switched whole, never a puppet) + recorded clips (voice/, tools/make_voice.cjs).
     Stand-ins: the lesson video (not made yet), Gerry's voice (free Windows voice), "Press and say" (the kids' site's shared piece). */
  const vid = t => { let h = 2166136261; for (const c of String(t).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim()) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
  /* "Press and say" stand-in: waits until the child has really finished. The microphone is only used on this device to
     see how loud it is and to keep the child's own voice for My Discussion Book (kept in this browser only, never sent
     anywhere): it ends after the child has spoken and then been quiet for 1.5 s, or when the button is tapped again.
     No microphone: tap again when finished. It does not check the words. Resolves with the recording (a Blob) or null. */
  function listen(b) {
    return new Promise(async done => { let over = false, iv = 0, stream = null, ctx = null; const lab = b.querySelector('.l');
      let rec = null; const chunks = [];
      const end = () => { if (over) return; over = true; clearInterval(iv); b.onclick = null; b.style.removeProperty('--lv');
        const fin = clip => { if (stream) stream.getTracks().forEach(t => t.stop()); if (ctx) ctx.close().catch(() => {}); done(clip); };
        if (rec && rec.state !== 'inactive') { rec.onstop = () => fin(chunks.length ? new Blob(chunks, { type: rec.mimeType }) : null); rec.stop(); } else fin(null); };
      b.classList.add('on'); lab.innerHTML = 'I am listening…<small>말해요! 다 말하면 눌러요</small>'; snd.pop(); setTimeout(() => { if (!over) b.onclick = end; }, 700);
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); if (over) { stream.getTracks().forEach(t => t.stop()); return; }
        if (window.MediaRecorder) { try { rec = new MediaRecorder(stream); rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); }; rec.start(); } catch (e) { rec = null; } }
        ctx = new (window.AudioContext || window.webkitAudioContext)(); const an = ctx.createAnalyser(); an.fftSize = 512; ctx.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.fftSize), t0 = Date.now(); let spoke = 0, quiet = 0;
        iv = setInterval(() => { an.getByteTimeDomainData(buf); let q = 0; for (const v of buf) q += (v - 128) ** 2; const lv = Math.sqrt(q / buf.length) / 128;
          b.style.setProperty('--lv', Math.min(1, lv * 7).toFixed(2)); if (lv > .04) { spoke += 100; quiet = 0; } else quiet += 100;
          if ((spoke >= 500 && quiet >= 1500) || Date.now() - t0 > 20000) end(); }, 100);
      } catch (e) { lab.innerHTML = 'Say it, then tap me!<small>말하고 나서 눌러요</small>'; } });
  }
  let gAudio = null, gTick = 0;
  function gerry(en, ko, rest = 'stand') {   // Gerry says a line: bubble + voice + talking mouth; resolves when he has finished
    return new Promise(done => { const g = $('#gy'), bub = $('#gsay'); if (!g) return done();
      if (gAudio) { gAudio.onended = gAudio.onerror = null; gAudio.pause(); } clearInterval(gTick); clearTimeout(gerry.t); if (gerry.end) gerry.end(true);
      bub.innerHTML = `${en}<small>${ko}</small>`; bub.classList.remove('in'); void bub.offsetWidth; bub.classList.add('in');
      let open = true, over = false; g.src = 'art/gerry/talk.webp'; gTick = setInterval(() => { open = !open; g.src = `art/gerry/${open ? 'talk' : 'stand'}.webp`; }, 170);
      const end = cut => { if (over) return; over = true; if (cut !== true) { clearInterval(gTick); clearTimeout(gerry.t); if ($('#gy')) $('#gy').src = `art/gerry/${rest}.webp`; } done(); }; gerry.end = end;
      /* voice: 1 the kids' site's shared recorded Gerry (gpfis-site/kit/voice.js) when this line has a clip there,
         2 this sample's own stand-in clip, 3 the shared kit's fallback (the browser's reading voice) */
      const k = vid(en), V = window.Voice;
      if (V && V.has(en, 'gerry')) V.say(en, { who: 'gerry' }).then(end);
      else if (window.FMCLIPS && FMCLIPS[k]) { gAudio = new Audio(`voice/${k}.mp3`); gAudio.onended = end; gAudio.onerror = end; gAudio.play().catch(() => {}); }
      else if (V) V.say(en, { who: 'gerry' }).then(end);
      gerry.t = setTimeout(end, Math.max(1500, en.length * 85)); });   // also the way on when sound is off
  }
  const track = (what, week) => { try { if (window.GPTrack) GPTrack.play('fm', what, { week }); } catch (e) {} };   // 'video' | 'game' | 'talk', for the star board and the reports
  const ACTS = {
    '1-0': () => new Promise(finish => {
      const c = $('#card'), SH = [   // the four shapes of the worksheet's activity, in play order, with their vertices
        { n: 'triangle', col: '#ff8fa0', v: [[150, 52], [258, 240], [42, 240]], d: '<polygon points="150,52 258,240 42,240"/>' },
        { n: 'circle', col: '#7fd4ff', v: [], d: '<circle cx="150" cy="150" r="104"/>' },
        { n: 'square', col: '#8be28a', v: [[52, 52], [248, 52], [248, 248], [52, 248]], d: '<rect x="52" y="52" width="196" height="196"/>' },
        { n: 'oval', col: '#c9a2ff', v: [], d: '<ellipse cx="150" cy="150" rx="128" ry="78"/>' }];
      const NUM = ['One!', 'Two!', 'Three!', 'Four!'], NUMK = ['하나!', '둘!', '셋!', '넷!']; let alive = true, cur = -1, got = 0, lock = true;
      c.innerHTML = `<div class="play"><button class="x" aria-label="Close">×</button><button class="pill ws">Worksheet page<small>Week 1 · 04</small></button>
        <div class="shelf">${SH.map((q, i) => `<span class="slot" data-i="${i}"><svg viewBox="0 0 300 300"><g fill="none" stroke="rgba(255,255,255,.35)" stroke-width="16" stroke-linejoin="round">${q.d}</g></svg><b></b></span>`).join('')}</div>
        <img id="gy" src="art/gerry/wave.webp" alt=""><div id="gsay"></div><div class="arena"></div></div>`;
      c.hidden = false; snd.pop(); const A = c.querySelector('.arena');
      const out = ok => { alive = false; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); c.hidden = true; c.onclick = null; c.innerHTML = ''; finish(ok); };

      /* 1 the lesson video */
      const video = async () => {
        // the week's lesson video (forest-math/video/week1-circles, copied to world/video/): big play button, tap the picture to pause
        A.innerHTML = `<div class="tv"><div class="scr vid"><video src="video/fm01-week1-circles.mp4" poster="video/fm01-week1-circles.jpg" playsinline preload="metadata"></video><button class="playb" aria-label="Play"></button></div><button class="go next">Start the activity<small>활동 하러 가요</small></button></div>`;
        const v = A.querySelector('video'), pb = A.querySelector('.playb');
        let seen = false; v.onplay = () => { if (!seen) { seen = true; track('video', 1); } pb.hidden = true; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); if ($('#gy')) $('#gy').src = 'art/gerry/stand.webp'; };   // Gerry is quiet while the video talks
        v.onpause = () => { pb.hidden = false; }; v.onended = () => { pb.hidden = false; A.querySelector('.next').classList.add('ready'); if ($('#gy')) $('#gy').src = 'art/gerry/thumb.webp'; };
        await gerry("Hi! I'm Gerry! First, let's watch the video.", '안녕! 나는 게리야! 먼저 영상을 봐요.', 'point'); };
      /* 2 the game: catch the vertices of each shape as it flies in */
      const next = async () => { if (!alive) return; cur++; got = 0; lock = true;
        if (cur >= SH.length) return speak();
        const q = SH[cur];
        A.innerHTML = `<div class="ship"><svg viewBox="0 0 300 300" class="shape"><g class="outl" fill="${q.col}" stroke="#fff" stroke-width="14" stroke-linejoin="round">${q.d}</g>${q.v.map(([x, y], j) => `<circle class="vx" data-j="${j}" cx="${x}" cy="${y}" r="40"/>`).join('')}</svg><b class="count">0</b></div>
          <button class="zero"><b>0</b><span>No vertices!<small>꼭짓점이 없어요</small></span></button>`;
        snd.whoosh(); await gerry(`Here comes the ${q.n}! ${q.v.length ? 'Tap its vertices!' : 'Does it have vertices?'}`, q.v.length ? '꼭짓점을 눌러요!' : '꼭짓점이 있을까요?', q.v.length ? 'point' : 'think'); lock = false; };
      const solved = async () => { const q = SH[cur], sl = c.querySelector(`.slot[data-i="${cur}"]`); lock = true; snd.win(); burst((W * 1.01 + 490) / 2, 400, 60, 14);
        const line = q.v.length ? gerry(q.v.length === 3 ? 'Three vertices! Great job!' : 'Four vertices! Wow!', q.v.length === 3 ? '꼭짓점이 세 개! 잘했어요!' : '꼭짓점이 네 개! 우와!', 'cheer')
          : gerry(q.n === 'circle' ? 'Yes! A circle has no vertices!' : 'Right! An oval has no vertices!', '맞아요! 꼭짓점이 없어요!', 'cheer');
        await wait(700); if (!alive) return; A.querySelector('.ship').classList.add('away'); await line; if (!alive) return;
        sl.classList.add('full'); sl.querySelector('g').setAttribute('fill', q.col); sl.querySelector('g').setAttribute('stroke', '#fff'); sl.querySelector('b').textContent = q.v.length; snd.ding(cur); await wait(350); next(); };
      /* 3 the speaking that belongs to this page: say the reason, then answer an opposite idea */
      const turn = (key, alien, en, ko, frame, frameKo) => new Promise(async done => {
        A.innerHTML = `<div class="talkp">${alien ? '<div class="claim"><img src="art/alien.png" alt=""><span>“A circle has no points!”<small>“동그라미에는 점이 없어!”</small></span></div>' : ''}
          <div class="frame"><span>Say it:</span>${frame}<small>${frameKo}</small></div><button class="go say"><span class="mic"></span><span class="l">Press and say<small>누르고 말해요</small></span></button></div>`;
        A.querySelector('.say').onclick = async e => { const b = e.currentTarget; if (b.classList.contains('on')) return; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); clearTimeout(gerry.t); if ($('#gy')) $('#gy').src = 'art/gerry/stand.webp';
          const clip = await listen(b); if (clip) VDB.put(key, clip); if (!alive) return; snd.win(); burst((W * 1.01 + 490) / 2, 380, 50, 13); $('#gy').src = 'art/gerry/thumb.webp'; setTimeout(done, 700); };
        await gerry(en, ko, alien ? 'think' : 'point'); });
      const speak = async () => { track('talk', 1);
        await turn('1-0-a', false, 'Why does a circle have no vertices? Press the button and say it!', '동그라미는 왜 꼭짓점이 없을까요? 버튼을 누르고 말해요!', 'A circle has no vertices because it is <b>round all around</b>.', '동그라미는 둥글어서 꼭짓점이 없어요.'); if (!alive) return;
        await turn('1-0-b', true, 'Uh-oh! The alien says a circle has no points. Is that right? Tell him!', '외계인이 동그라미에는 점이 없대요. 맞을까요? 말해 줘요!', 'No! A circle has <b>many points</b>, but no vertices.', '아니에요! 동그라미에는 점이 아주 많지만 꼭짓점은 없어요.'); if (!alive) return;
        A.innerHTML = ''; burst(W / 2, 360, 80, 15); await gerry('Great talking! You get a star!', '말하기 최고! 별을 받아요!', 'cheer'); await wait(500); if (alive) out(true); };

      c.onclick = e => {
        if (e.target.closest('.x')) return out(false);
        if (e.target.closest('.ws')) { const im = document.createElement('div'); im.className = 'wsview'; im.innerHTML = '<img src="art/ws/fm01-w1-04.png" alt="">'; im.onclick = ev => { ev.stopPropagation(); im.remove(); }; c.appendChild(im); return; }
        if (e.target.closest('.playb')) { const v = A.querySelector('video'); if (v) v.play().catch(() => {}); return; }
        if (e.target.closest('.scr.vid video')) { const v = e.target; if (!v.paused) v.pause(); return; }
        if (e.target.closest('.next')) { const v = A.querySelector('video'); if (v) v.pause(); snd.pop(); track('game', 1); gerry("Now let's play! Catch the vertices!", '이제 놀아요! 꼭짓점을 잡아요!', 'cheer').then(next); A.innerHTML = ''; return; }
        if (lock || cur < 0 || cur >= SH.length) return; const q = SH[cur], at = pt(e), ship = A.querySelector('.ship');
        const vx = e.target.closest('.vx');
        if (vx) { if (vx.classList.contains('on')) return; vx.classList.add('on'); vx.setAttribute('r', 22); got++; const cn = A.querySelector('.count'); cn.textContent = got; cn.classList.remove('bump'); void cn.offsetWidth; cn.classList.add('bump'); snd.ding(got); burst(at[0], at[1], 18, 7);
          if (got === q.v.length) solved(); else gerry(NUM[got - 1], NUMK[got - 1], 'point'); return; }
        if (e.target.closest('.zero')) { if (q.v.length) { snd.nope(); gerry('Look again! Where do two sides meet?', '다시 봐요! 두 변이 만나는 곳은 어디일까요?', 'think'); } else { const cn = A.querySelector('.count'); cn.classList.add('bump'); solved(); } return; }
        if (e.target.closest('.shape')) { ship.classList.remove('roll', 'nope'); void ship.offsetWidth;
          if (q.v.length) { ship.classList.add('nope'); snd.nope(); gerry('Vertices are where two sides meet. Try again!', '꼭짓점은 두 변이 만나는 곳이에요. 다시 해 봐요!', 'point'); }
          else { ship.classList.add('roll'); snd.boing(); gerry('Hee hee! It is round all around. No sides meet!', '히히! 둥글둥글해요. 만나는 변이 없어요!', 'think'); } }
      };
      video();
    }),
  };
  /* ---------- My Discussion Book (boss, 24 Nov 2026: the same idea as Start PBL's My Speech Book) ----------
     One book per month, the 5th step of the planet, open once the four weeks are done. It opens shut on the month's
     worksheet cover and then shows ALL the month's worksheet pages, two by two like the printed book (user, 24 Nov).
     On a page the child did online, their answers sit where they would write them. Every week has its recordings:
     under the book, the sentences the child said that week, each with their OWN voice to hear again.
     The recordings stay in this browser (IndexedDB fm-voice) and are never sent anywhere.
     BOOKS[month] = { cover, n pages (art/ws/<month>/NN.webp, 8 a week), weeks: [{ key (the stop), says [{ clip, a }] }],
       ans: { page index: { key, dots [[x, y]] coloured vertices, nums [[x, y, text]] } } (x, y on the 905 x 1280 page) }.
     Sample: month 1; only Week 1 · 04 has an online activity so far. */
  const VDB = (() => { let p; const db = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open('fm-voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = (mode, f) => db().then(d => new Promise((res, rej) => { const q = f(d.transaction('clips', mode).objectStore('clips')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })).catch(() => null);
    return { put: (k, b) => tx('readwrite', st => st.put(b, k)), get: k => tx('readonly', st => st.get(k)) }; })();
  const BOOKS = { 1: { cover: 'art/ws/fm01-cover.jpg', n: 32, name: 'FRESH MATH 1 · Vertices',
    weeks: [{ key: '1-0', t: 'The World of Circles', says: [{ clip: '1-0-a', a: 'A circle has no vertices because it is round all around.' }, { clip: '1-0-b', a: 'A circle has many points, but no vertices.' }] },
      { key: '1-1', t: 'The World of Triangles', says: [] }, { key: '1-2', t: 'The World of Quadrilaterals', says: [] }, { key: '1-3', t: 'The World of Polygons', says: [] }],
    ans: { 3: { key: '1-0', dots: [[164, 751], [221, 851], [107, 851], [497, 756], [599, 756], [599, 858], [497, 858]], nums: [[164, 903, '3'], [356, 903, '0'], [548, 903, '4'], [740, 903, '0']] } } } };
  function discussionBook(month, after) {
    const BK = BOOKS[month]; if (!BK) { toast('This month\'s Discussion Book is coming soon.', '이 달의 디스커션 북은 곧 나와요.'); if (after) after(); return; }
    const c = $('#card'), SP = BK.n / 2, did = key => !!(S.book && S.book[key]), pg = i => `art/ws/${month}/${String(i + 1).padStart(2, '0')}.webp`;
    let n = -1, audio = null, alive = true, token = 0; const urls = {};   // n = -1 is the cover; then spread n shows pages 2n and 2n + 1
    // the book grows week by week: a week's pages open when that week's stop is done
    const OPEN = S.done >= month ? BK.weeks.length : S.done === month - 1 ? Math.min(BK.weeks.length, S.stop || 0) : 0, LAST = Math.max(0, OPEN * 4) - 1;
    c.innerHTML = `<div class="dbk"><button class="pill dback"><span>←</span><span class="l">Planet<small>행성으로</small></span></button><h2 class="dtitle">My Discussion Book</h2>
      <div class="dwk"><i data-w="-1" class="cv">Cover</i>${BK.weeks.map((_, w) => `<i data-w="${w}"${w < OPEN ? '' : ' class="shut"'}>Week ${w + 1}</i>`).join('')}</div>
      <div class="dbook"><div class="dpg l"><img class="sheet" alt=""><div class="ans"></div></div><div class="dpg r"><div class="dcov"><img src="${BK.cover}" alt=""></div><img class="sheet" alt=""><div class="ans"></div></div></div>
      <button class="dturn prev" aria-label="Back"></button><button class="dturn next" aria-label="Next"></button>
      <div class="dvoice"></div><img id="gy" src="art/gerry/wave.webp" alt=""><div id="gsay"></div></div>`;
    c.hidden = false; const q = x => c.querySelector(x), bk = q('.dbook');
    const stop = () => { token++; if (audio) { audio.pause(); audio = null; } c.querySelectorAll('.listen.on').forEach(b => b.classList.remove('on')); };
    const play = async (key, btn) => { stop(); const my = token; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); clearTimeout(gerry.t); if ($('#gy')) $('#gy').src = 'art/gerry/stand.webp';
      const blob = await VDB.get(key); if (my !== token || !alive) return false; if (!blob) { if (btn) { btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope'); } snd.nope(); return false; }
      urls[key] = urls[key] || URL.createObjectURL(blob); audio = new Audio(urls[key]); if (btn) btn.classList.add('on');
      return new Promise(res => { const fin = () => { if (btn) btn.classList.remove('on'); res(true); }; audio.onended = fin; audio.onerror = fin; audio.play().catch(fin); }); };
    const answers = i => { const A = BK.ans[i]; return A && did(A.key) ? A.dots.map(([x, y], j) => `<i class="vd" style="left:${x / 9.05}%;top:${y / 12.8}%;animation-delay:${j * .07}s"></i>`).join('') + A.nums.map(([x, y, t], j) => `<b class="wn" style="left:${x / 9.05}%;top:${y / 12.8}%;animation-delay:${.5 + j * .1}s">${t}</b>`).join('') : ''; };
    const show = async k => { stop(); n = Math.max(-1, Math.min(SP - 1, LAST, k)); const w = n < 0 ? -1 : Math.floor(n / 4); bk.classList.toggle('shut', n < 0); bk.classList.remove('flip'); void bk.offsetWidth; bk.classList.add('flip');
      c.querySelectorAll('.dwk i').forEach(d => d.classList.toggle('on', +d.dataset.w === w)); q('.prev').disabled = n < 0; q('.next').disabled = n >= Math.min(SP - 1, LAST); snd.pop();
      const V = q('.dvoice'), all = '<button class="go hearall"><span class="tri"></span>Hear my whole book</button>';
      if (n < 0) { V.innerHTML = all; return; }
      [q('.dpg.l'), q('.dpg.r')].forEach((P, j) => { P.querySelector('.sheet').src = pg(2 * n + j); P.querySelector('.ans').innerHTML = answers(2 * n + j); });
      const W = BK.weeks[w], has = await Promise.all(W.says.map(sy => VDB.get(sy.clip).then(b => !!b))); if (!alive || Math.floor(n / 4) !== w) return;
      V.innerHTML = `<b class="wkl">Week ${w + 1} · my voice</b>` + (did(W.key) && W.says.length ? W.says.map((sy, i) => `<button class="listen${has[i] ? '' : ' none'}" data-clip="${sy.clip}" title="${has[i] ? 'Listen to me!' : 'No voice yet'}"><b></b><em>${sy.a}</em></button>`).join('')
        : `<span class="none">${W.says.length ? `Play week ${w + 1} to hear yourself here.` : `The talking for week ${w + 1} comes with its activities.`}</span>`); };
    const out = () => { alive = false; stop(); Object.values(urls).forEach(u => URL.revokeObjectURL(u)); if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); c.hidden = true; c.onclick = null; c.innerHTML = ''; if (after) after(); };
    c.onclick = async e => { const t = e.target;
      if (t.closest('.dback')) return out();
      if (t.closest('.dcov') || t.closest('.next')) return show(n + 1);
      if (t.closest('.prev')) return show(n - 1);
      const d = t.closest('.dwk i'); if (d) { if (d.classList.contains('shut')) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); snd.nope(); return toast(`Week ${+d.dataset.w + 1} opens here when you finish it.`, `${+d.dataset.w + 1}주를 하면 여기에 열려요.`); }
        return show(+d.dataset.w < 0 ? -1 : +d.dataset.w * 4); }
      const l = t.closest('.listen'); if (l) { if (l.classList.contains('on')) return stop(); return play(l.dataset.clip, l); }
      if (t.closest('.hearall')) { let any = false;   // every week's voices in order, each on the page it belongs to
        for (let w = 0; w < BK.weeks.length && alive; w++) { const W = BK.weeks[w]; if (!did(W.key) || !W.says.length) continue;
          const at = Object.keys(BK.ans).map(Number).find(i => BK.ans[i].key === W.key); await show(at == null ? w * 4 : Math.floor(at / 2)); await wait(600);
          for (const b of [...c.querySelectorAll('.dvoice .listen:not(.none)')]) { if (!alive || Math.floor(n / 4) !== w) return; any = (await play(b.dataset.clip, b)) || any; await wait(350); } }
        if (!any && alive) { snd.nope(); toast('No voice in your book yet. Play a week first!', '아직 목소리가 없어요. 먼저 한 주를 해 봐요!'); } } };
    show(-1); gerry('This is your Discussion Book! Turn the pages and hear yourself.', '디스커션 북이에요! 쪽을 넘기고 내 목소리를 들어 봐요.', 'point');
  }
  /* ---------- My Mission Log: the month's report, one card a week (user chose option 1, 24 Nov 2026) ----------
     Boss: a monthly report with weekly progress: how many times opened, which parts were done and how often.
     The three parts of a week are called Video, Activity and Discussion (user: Fresh Math does not call anything a game).
     Numbers come from the kids' site's shared counter (GPTrack, kept on this device), so they match Story Street's star
     board; what is finished comes from this world's own save. The counter still names the activity 'game' inside. */
  function missionLog(month) {
    const BK = BOOKS[month]; if (!BK) return toast('This month\'s Mission Log is coming soon.', '이 달의 미션 기록은 곧 나와요.');
    const c = $('#card'), D = window.GPTrack ? GPTrack.days() : {}, WK = BK.weeks, did = key => !!(S.book && S.book[key]), per = WK.map(() => ({ video: 0, game: 0, talk: 0 })); let opens = 0, days = 0;
    for (const k in D) { const f = D[k].fm; if (!f) continue; days++; opens += f.o || 0;
      for (const a of ['video', 'game', 'talk']) { const x = f.a && f.a[a]; if (x && x.p) per[Math.min(WK.length, Math.max(1, x.w || 1)) - 1][a] += x.p; } }
    const PARTS = [['video', 'Video'], ['game', 'Activity'], ['talk', 'Discussion']], ready = w => !!ACTS[WK[w].key];
    const stars = w => (per[w].video ? 1 : 0) + (did(WK[w].key) ? 2 : 0), weeksDone = WK.filter(w => did(w.key)).length, allStars = WK.reduce((n, _, w) => n + stars(w), 0);
    c.innerHTML = `<div class="mlog"><button class="pill dback"><span>←</span><span class="l">Planet<small>행성으로</small></span></button>
      <h2 class="dtitle">My Mission Log<small>${BK.name} · 미션 기록</small></h2>
      <div class="msum"><div><b>${opens}</b>times opened</div><div><b>${days}</b>days played</div><div><b>${S.stars}</b>stars</div><div><b>${weeksDone} of ${WK.length}</b>weeks done</div></div>
      <div class="mweeks">${WK.map((W, w) => `<div class="mwk${ready(w) ? '' : ' soon'}" style="animation-delay:${.08 * w}s"><h3>Week ${w + 1}<em class="${did(W.key) ? 'ok' : ''}">${did(W.key) ? 'done' : ready(w) ? 'not yet' : 'coming soon'}</em></h3><div class="t">${W.t}</div>
        ${PARTS.map(([id, lab]) => `<div class="mact${per[w][id] ? '' : ' z'}"><img src="art/ic-${id}.png" alt=""><span>${lab}</span><b>${per[w][id] ? '× ' + per[w][id] : '–'}</b></div>`).join('')}
        <div class="mst">${[0, 1, 2].map(i => `<i class="${i < stars(w) ? 'on' : ''}"></i>`).join('')}</div></div>`).join('')}</div></div>`;
    c.hidden = false; snd.pop(); c.onclick = e => { if (e.target.closest('.dback')) { c.hidden = true; c.onclick = null; c.innerHTML = ''; } };
  }
  /* My Planet: the child's own little planet. Stars buy decorations; the alien friends from finished missions live here. */
  const DECO = [['Crystals', '크리스탈', 5, -32], ['Space tree', '우주 나무', 8, 30], ['Dome house', '돔 하우스', 12, 0], ['Flag', '깃발', 5, 62], ['Slide', '미끄럼틀', 15, -64], ['Dish', '안테나', 10, 94]];   // name, ko, price, angle from the top
  const FR_AT = [-96, 124, -124, 152, -152];   // friends stand around the sides and underneath, away from the decorations
  function mine() {
    swap('mine', s => {
      sky = true; setBack('Galaxies', '은하', () => universe(false)); setTitle('My Planet', '나의 행성'); $('#pass').hidden = true; rk.classList.remove('idle'); rk.style.transform = 'translate(-400px, -400px)'; rpos = [X(1020), 640]; redraw = () => mine();
      const C = [W / 2, 378], R = 176;
      const draw = fresh => {
        const own = S.deco, nf = Math.min(S.done, FR_AT.length);
        s.innerHTML = `<div class="myp" style="left:${C[0]}px;top:${C[1]}px"><div class="sway"><img class="ball" src="art/home.png" alt="" style="width:${R * 2}px;height:${R * 2}px;margin:${-R}px 0 0 ${-R}px">
            ${own.map(k => `<span class="slot" style="--a:${DECO[k][3]}deg;--r:${R - 16}px"><img class="dc ${k === fresh ? 'new' : ''}" src="art/d${k + 1}.png" alt=""></span>`).join('')}
            ${Array.from({ length: nf }, (_, j) => { const m = S.done - nf + j; return `<span class="slot" style="--a:${FR_AT[j]}deg;--r:${R - 10}px"><img class="fr2" src="art/alien.png" alt="" style="filter:hue-rotate(${HUE[m % 6] + Math.floor(m / 6) * 50}deg);animation-delay:${j * -.17}s"></span>`; }).join('')}
          </div></div>
          <div class="tray">${DECO.map((d, k) => `<button class="it ${own.includes(k) ? 'own' : ''}" data-k="${k}"><img src="art/d${k + 1}.png" alt=""><b>${d[0]}<small>${d[1]}</small></b><em>${own.includes(k) ? '✓' : `<i class="st"></i>${d[2]}`}</em></button>`).join('')}</div>
          ${!own.length && !nf ? '' : ''}`;
      };
      draw(-1);
      if (!S.deco.length) setTimeout(() => toast('Spend your stars! Tap something for your planet.', '별을 써 봐요! 행성에 놓을 것을 눌러요.'), 700);
      s.onclick = e => {
        if (e.target.closest('.ball, .fr2, .dc')) { const w = s.querySelector('.myp'); w.classList.remove('boing'); void w.offsetWidth; w.classList.add('boing'); snd.boing(); burst(C[0], C[1] - R, 18, 8); return; }
        const b = e.target.closest('.it'); if (!b) return; const k = +b.dataset.k, price = DECO[k][2];
        if (S.deco.includes(k)) { snd.pop(); const d = s.querySelector(`.slot img[src="art/d${k + 1}.png"]`); if (d) { d.classList.remove('new'); void d.offsetWidth; d.classList.add('new'); } return; }
        if (S.stars < price) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); snd.nope(); toast(`You need ${price - S.stars} more stars. Finish a stop!`, `별이 ${price - S.stars}개 더 필요해요. 정거장을 끝내요!`); return; }
        S.stars -= price; S.deco.push(k); save(); setStars(true); draw(k); snd.win();
        const a = DECO[k][3] * Math.PI / 180; burst(C[0] + Math.sin(a) * (R + 40), C[1] - Math.cos(a) * (R + 40), 40, 11);
      };
    });
  }
  /* My Journey: all 24 planets on one long star path, galaxy after galaxy. Drag or scroll sideways. */
  function journey() {
    swap('map', s => {
      sky = true; redraw = () => journey(); setBack('Galaxies', '은하', () => universe(false)); setTitle('My Journey', '나의 여행 · 행성 24개'); $('#pass').hidden = true;
      rk.classList.remove('idle'); rk.style.transform = 'translate(-400px, -400px)';
      const STEP = 236, PX = 250, total = PX * 2 + 23 * STEP, cur = Math.min(23, S.done), pos = n => [PX + n * STEP, 440 + Math.sin(n * 1.05) * 130];
      let d = `M${pos(0)[0]} ${pos(0)[1]}`; for (let n = 1; n < 24; n++) { const a = pos(n - 1), b = pos(n); d += ` Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 60} ${b[0]} ${b[1]}`; }
      s.innerHTML = `<div class="jscroll"><div class="jin" style="width:${total}px"><svg class="link" style="width:${total}px" viewBox="0 0 ${total} ${H}"><path d="${d}"/></svg>
        ${GAL.map((G, g) => `<div class="jgal ${g > curG() ? 'sleep' : ''}" style="left:${PX + g * 6 * STEP - STEP / 2}px;width:${6 * STEP}px"><img class="big" src="art/g${g + 1}.png" alt=""><span class="tag"><img src="art/g${g + 1}.png" alt=""><b>${g + 1}</b><span>${G.en}<small>${G.ko} · 레벨 ${g + 1}</small></span></span></div>`).join('')}
        ${Array.from({ length: 24 }, (_, n) => { const q = pos(n), st = n < S.done ? 'done' : n === cur ? 'now' : 'todo';
          return `<button class="pl ${st}" data-n="${n}" style="left:${q[0]}px;top:${q[1]}px;animation-delay:${Math.min(.6, Math.abs(n - cur) * .05)}s"><span class="in">${st === 'now' ? '<i class="glow"></i><i class="arrow"></i>' : ''}
            <img src="art/p${n + 1}.png" alt="">${st === 'done' ? `<i class="badge">${starSvg}</i>` : ''}<b class="num">${n + 1}</b>${nm(n)}</span></button>`; }).join('')}
        <img class="jrk" src="art/rocket.png" alt="" style="left:${pos(cur)[0] + 78}px;top:${pos(cur)[1] + 30}px"></div></div>`;
      const sc = s.querySelector('.jscroll'), toCur = () => { sc.scrollLeft = pos(cur)[0] - W / 2; }; toCur(); setTimeout(toCur, 40); setTimeout(toCur, 320);   // the screen is not laid out yet while it is being built
      let down = null, moved = false;
      sc.onpointerdown = e => { down = [e.clientX, sc.scrollLeft]; moved = false; };
      sc.onpointermove = e => { if (!down) return; const k = $('#stage').getBoundingClientRect().width / W, dx = (e.clientX - down[0]) / k; if (Math.abs(dx) > 8) moved = true; sc.scrollLeft = down[1] - dx; };
      sc.onpointerup = sc.onpointerleave = () => { down = null; };
      sc.onwheel = e => { sc.scrollLeft += e.deltaY + e.deltaX; e.preventDefault(); };
      s.onclick = e => { const b = e.target.closest('.pl'); if (!b || busy || moved) return; const n = +b.dataset.n;
        if (b.classList.contains('todo')) { b.classList.remove('squash'); void b.offsetWidth; b.classList.add('squash'); snd.nope(); toast('Not yet! Finish the glowing planet first.', '아직이에요! 빛나는 행성을 먼저 끝내요.'); return; }
        snd.pop(); const c = pt(e); burst(c[0], c[1], 18, 7); rpos = [c[0], c[1]]; planet(Math.floor(n / 6), n % 6); };
    });
  }
  /* Shape Catch: a LESSON game that ends with speaking (boss, 2026-11-20: games must follow the lesson and be about speaking).
     Sample lesson = number 1: circle, triangle, square and counting to 5. Catch 5 of today's shape; other shapes bounce off.
     Then two speaking turns: say what you did, and tell the alien why it is wrong (first taste of debate). Stars come
     AFTER speaking. "Press and say" is a stand-in: the shared listen-and-speak piece of the kids' site will replace it. */
  const SHAPES = {
    circle: { en: 'circle', pl: 'circles', ko: '동그라미', col: '#ff6b7d', svg: '<circle cx="50" cy="50" r="30"/>', wrong: 'A circle has vertices!', right: 'No! A circle is <b>round</b>. It has <b>no</b> vertices.', rko: '아니에요! 동그라미는 둥글어요. 꼭짓점이 없어요.' },
    triangle: { en: 'triangle', pl: 'triangles', ko: '세모', col: '#2fc48d', svg: '<polygon points="50,18 84,78 16,78"/>', wrong: 'A triangle has four vertices!', right: 'No! A triangle has <b>three</b> vertices.', rko: '아니에요! 세모는 꼭짓점이 세 개예요.' },
    square: { en: 'square', pl: 'squares', ko: '네모', col: '#4a8cff', svg: '<rect x="22" y="22" width="56" height="56" rx="4"/>', wrong: 'A square has three vertices!', right: 'No! A square has <b>four</b> vertices.', rko: '아니에요! 네모는 꼭짓점이 네 개예요.' },
  };
  const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five'];
  const token = k => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff"/><circle cx="50" cy="50" r="48" fill="url(#tk)" opacity=".5"/><g fill="${SHAPES[k].col}" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linejoin="round">${SHAPES[k].svg}</g><ellipse cx="34" cy="24" rx="16" ry="7" fill="#fff" opacity=".8"/></svg>`;
  let G = null;
  function game(which) {
    const key = which || ['circle', 'triangle', 'square'][Math.min(23, S.done) % 3], T = SHAPES[key], others = Object.keys(SHAPES).filter(k => k !== key);
    swap('game', s => {
      const GOAL = 5, RY = 730; sky = true; redraw = null; setBack('Galaxies', '은하', () => universe(false)); setTitle(`Catch the ${T.pl}`, `${T.ko} 잡기 · 다섯 개`); $('#pass').hidden = true;
      s.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="tk" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#c9cbe6"/></radialGradient></defs></svg>
        <div class="tally">${`<i>${token(key)}</i>`.repeat(GOAL)}</div><div class="fsky"></div>`;
      const skyEl = s.querySelector('.fsky'), tally = [...s.querySelectorAll('.tally i')]; rk.classList.remove('idle'); rk.style.setProperty('--rs', 1.3);
      G = { key, got: 0, items: [], run: true, rx: W / 2, tx: W / 2, t: 0, next: 20, wob: 0, goal: GOAL };
      toast(`Catch 5 ${T.pl}! Only the ${T.pl}.`, `${T.ko}만 다섯 개 잡아요!`);
      s.onpointermove = s.onpointerdown = e => { if (G) G.tx = Math.max(70, Math.min(W - 70, pt(e)[0])); };
      const spawn = () => { const good = Math.random() < .55, k = good ? key : others[Math.random() * 2 | 0], el = document.createElement('i'); el.className = 'tok'; el.innerHTML = token(k);
        skyEl.appendChild(el); G.items.push({ el, k, bad: !good, x: 90 + Math.random() * (W - 180), y: -90, vx: 0, v: 2.2 + Math.random() * 1.3, r: 0, vr: (Math.random() - .5) * .04 }); };
      G.step = dt => {
        if (!G.run) return; G.t += dt; if (G.t >= G.next) { spawn(); G.next = G.t + 52 + Math.random() * 36; }
        G.rx += (G.tx - G.rx) * Math.min(1, .2 * dt); G.wob *= Math.pow(.92, dt);
        rk.style.transform = `translate(${G.rx}px, ${RY}px) rotate(${(G.tx - G.rx) * .1 + Math.sin(G.t * .6) * G.wob}deg)`;
        for (const it of G.items) { it.y += it.v * dt; it.x += it.vx * dt; it.r += it.vr * dt; it.el.style.transform = `translate(${it.x}px, ${it.y}px) rotate(${it.r}rad)`;
          if (!it.hit && Math.abs(it.x - G.rx) < 78 && it.y > RY - 170 && it.y < RY - 10) { it.hit = true;
            if (it.bad) { G.wob = 26; it.v = -5; it.vx = it.x < G.rx ? -6 : 6; it.vr = .25; snd.boing(); toast(`That is a ${SHAPES[it.k].en}. We want ${T.pl}!`, `그건 ${SHAPES[it.k].ko}예요. ${T.ko}를 잡아요!`); }
            else { it.gone = true; const n = G.got++; if (tally[n]) tally[n].className = 'd'; snd.ding(n % 6); burst(it.x, it.y, 22, 8); if (G.got >= GOAL) { G.run = false; setTimeout(speak, 500); return; } } }
          if (it.y > H + 120 || it.y < -200 || it.x < -150 || it.x > W + 150) it.gone = true; }
        G.items = G.items.filter(it => { if (it.gone) it.el.remove(); return !it.gone; });
      };
      /* speaking turns: the reward waits for the child's voice */
      const L = $('#levelup');
      const sayStep = (img, hue, ask, askKo, frame, frameKo, done) => {
        L.innerHTML = `<i class="rays"></i><div class="lu talk"><img class="friend" src="art/${img}.png" alt="" style="${hue ? `filter:hue-rotate(${hue}deg)` : ''}"><div class="askb">${ask}<small>${askKo}</small></div>
          <div class="frame"><span>Say it:</span>${frame}<small>${frameKo}</small></div>
          <button class="go say"><span class="mic"></span><span class="l">Press and say<small>누르고 말해요</small></span></button></div>`;
        L.hidden = false; G.say = (G.say || 0) + 1;
        L.querySelector('.say').onclick = e => { const b = e.currentTarget; if (b.classList.contains('on')) return; b.classList.add('on'); b.querySelector('.l').innerHTML = 'Listening…<small>듣고 있어요</small>'; snd.pop();
          setTimeout(() => { snd.win(); burst(W / 2, 330, 50, 13); done(); }, 1500); };
      };
      const speak = () => sayStep('pal', 0, `How many ${T.pl} did you catch?`, `${T.ko}를 몇 개 잡았어요?`, `I caught <b>${NUMW[GOAL]}</b> ${T.pl}.`, `${T.ko} 다섯 개를 잡았어요.`,
        () => sayStep('alien', 0, `“${T.wrong}” Is that right?`, '외계인 친구의 말이 맞을까요?', T.right, T.rko, win));
      const win = () => { S.stars += 5; save(); setStars(true); snd.level(); let k = 0; const iv = setInterval(() => { burst(W * (.1 + Math.random() * .8), 120 + Math.random() * 400, 30, 12); if (++k > 5) clearInterval(iv); }, 280);
        L.innerHTML = `<i class="rays"></i><div class="lu"><img class="friend" src="art/pal.png" alt=""><h1 class="sm">Great talking!</h1><p>5 stars for saying it!<small>말해서 별 5개를 받았어요!</small></p>
          <button class="go" data-a="again"><span>▶</span><span class="l">Play again<small>한 번 더</small></span></button> <button class="pill" data-a="back"><span class="l">Galaxies<small>은하</small></span></button></div>`;
        L.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; clearInterval(iv); L.hidden = true; L.onclick = null; snd.pop(); if (b.dataset.a === 'again') game(); else universe(false); }; };
      G.speak = speak;
      let last = performance.now(); (function loop(now) { if (!G || !G.run) return; G.step(Math.min(3, (now - last) / 16.7)); last = now; requestAnimationFrame(loop); })(last);
      stopGame = () => { if (G) G.run = false; rk.style.setProperty('--rs', 1); L.hidden = true; L.onclick = null; };
    });
  }
  /* Space Passport: one stamp for every finished mission, and the friends who came along */
  function passport() {
    const c = $('#card');
    c.innerHTML = `<div class="box wide"><button class="x" aria-label="Close">×</button><h2 class="top">Space Passport<small>우주 여권 · ${S.done} / 24</small></h2>
      <div class="pgrid">${GAL.map((G, g) => `<div class="prow"><b><img src="art/g${g + 1}.png" alt=""><span>${G.en}<small>${G.ko}</small></span></b>${PL.map((_, i) => { const n = g * 6 + i + 1, d = S.done >= n;
        return `<i class="${d ? 'd' : ''}" style="animation-delay:${(g * 6 + i) * .025}s"><img src="art/p${n}.png" alt=""><em>${n}</em>${d ? `<img class="fr" src="art/alien.png" alt="" style="filter:hue-rotate(${HUE[i] + g * 50}deg)">` : ''}</i>`; }).join('')}</div>`).join('')}</div></div>`;
    c.hidden = false; snd.pop(); c.onclick = e => { if (e.target.closest('.x') || e.target === c) { c.hidden = true; snd.pop(); } };
  }
  $('#pass').onclick = () => { if (!busy) passport(); };
  $('#mapb').onclick = () => { if (!busy) { snd.pop(); journey(); } };
  $('#reset').onclick = () => { S = { done: 0, stars: 0, stop: 0, deco: [] }; save(); setStars(); $('#card').hidden = true; $('#levelup').hidden = true; busy = false; universe(false); };
  /* for pictures of the sample: index.html#done=8 shows 8 missions done, #done=8&g=1 opens galaxy 2, #done=8&g=1&p=2 lands on its planet 3 */
  const hp = new URLSearchParams(location.hash.slice(1)); if (hp.has('still')) document.body.classList.add('still'); if (hp.has('done')) { S.done = +hp.get('done'); S.stars = S.done * 5; S.stop = +(hp.get('stop') || 0); }
  setStars(); if (hp.has('deco')) S.deco = hp.get('deco').split('').map(Number);
  if (hp.has('log')) { planet(0, 0); setTimeout(() => missionLog(1), 1800); } else if (hp.has('book')) { planet(0, 0); setTimeout(() => discussionBook(1), 1800); } else if (hp.has('act')) { planet(0, 0); setTimeout(() => ACTS['1-0'](), 1800); } else if (hp.has('map')) journey(); else if (hp.has('game')) { game(hp.get('game') in SHAPES ? hp.get('game') : null); if (hp.has('say')) setTimeout(() => G && (G.run = false, G.speak()), 900); } else if (hp.has('mine')) mine(); else if (hp.has('p')) planet(+hp.get('g') || 0, +hp.get('p')); else if (hp.has('g')) galaxy(+hp.get('g')); else universe(false);
  if (hp.has('pass')) setTimeout(passport, 600);
  window.__fmWorld = { get game() { return G; }, journey, startGame: game, get state() { return S; }, get busy() { return busy; }, set(n) { S.done = n; S.stars = n * 5; S.stop = 0; S.deco = []; save(); setStars(); universe(false); } };   // for testing the sample
})();
