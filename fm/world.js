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
     No microphone: tap again when finished. The WORDS are heard with the browser's own speech recognition (the same way the
     kids' site's shared speaking kit and Start PBL do; in Chrome that recognition runs on Google's servers), and the turn
     scores them with the shared kit's Talk.score / Talk.stars. Resolves { clip: the recording (a Blob) or null, heard: [text] }. */
  function listen(b, onWords) {
    return new Promise(async done => { let over = false, iv = 0, stream = null, ctx = null; const lab = b.querySelector('.l');
      let rec = null, sr = null, finalT = '', liveT = ''; const chunks = [], alts = [];
      const fake = window.Talk && Talk.fake;   // test hook of the shared kit: ?say=text answers every listen with that text
      const end = () => { if (over) return; over = true; clearInterval(iv); b.onclick = null; b.style.removeProperty('--lv');
        const fin = clip => { if (stream) stream.getTracks().forEach(t => t.stop()); if (ctx) ctx.close().catch(() => {});
          const said = (finalT + ' ' + liveT).trim(), heard = fake ? [fake] : [...new Set([said, ...alts].filter(Boolean))]; done({ clip, heard }); };
        const wrap = () => { if (rec && rec.state !== 'inactive') { rec.onstop = () => fin(chunks.length ? new Blob(chunks, { type: rec.mimeType }) : null); rec.stop(); } else fin(null); };
        if (sr) { let w = false; const go = () => { if (!w) { w = true; wrap(); } }; sr.onend = go; try { sr.stop(); } catch (e) {} setTimeout(go, 900); } else wrap(); };   // give the last words a moment to arrive
      b.classList.add('on'); lab.innerHTML = 'I am listening…<small>말해요! 다 말하면 눌러요</small>'; snd.pop(); setTimeout(() => { if (!over) b.onclick = end; }, 700);
      if (fake) { if (onWords) onWords(fake); setTimeout(end, 1200); return; }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) { try { sr = new SR(); sr.lang = 'en-US'; sr.continuous = true; sr.interimResults = true; sr.maxAlternatives = 3;
        sr.onresult = e => { finalT = ''; liveT = ''; for (const r of e.results) { if (r.isFinal) { finalT += r[0].transcript + ' '; for (let i = 1; i < r.length; i++) alts.push(r[i].transcript); } else liveT += r[0].transcript + ' '; }
          if (onWords) onWords((finalT + liveT).trim()); };
        sr.onerror = () => {}; sr.start(); } catch (e) { sr = null; } }
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
  /* ---------- the worksheet pages of a week, online ----------
     WEEKS['<planet>-<stop>'] = the week's 8 worksheet pages, in the book's order. For each page:
       t      its title on the worksheet
       says   (its sentence has the page's TRACED LINE as its main point, plus a short reason: user, 24 Nov 2026)
              the Discussion that belongs to the page: [Gerry asks (en, ko), the sentence to say (<b> = the key words), ko, alien?]
              taken from the page's own Think questions and facts
       ans    how the child's answers look ON the printed page in My Discussion Book: SVG in the page picture's own
              905 x 1280 units (U() turns the worksheet's 595-wide drawing units into those), from the saved answers d
     The activities themselves (what the child taps) are in ACTS below, one per page, in the same order. */
  const U = v => +(v * 1.521).toFixed(1), INKB = '#2f6fdb', REDV = '#e23939';
  const WEEKS = { '1-0': [
    { t: 'A Tiny Dot', act: 'Draw dots. Name them A, B, C, D.', says: [['What does a point show? Say it!', '점은 무엇을 나타낼까요? 말해 봐요!', 'A point <b>shows a place</b>. Maths can start with one tiny dot.', '점은 자리를 나타내요. 수학은 작은 점 하나에서 시작해요.']],
      ans: d => (d.d || []).map((box, i) => box.map(([nx, ny], k) => { const x = U(66 + i * 120 + 14 + nx * 72), y = U(506 + ny * 86); return `<circle cx="${x}" cy="${y}" r="9" fill="${REDV}"/><text x="${x + 13}" y="${y - 7}" font-size="26" fill="${INKB}">${'ABCD'[k]}</text>`; }).join('')).join('') },
    { t: 'Many Dots, Many Places', act: 'Put 6 dots in each shape.', says: [['The dots are the same. Why did the shape change? Say it!', '점은 같은데 왜 모양이 바뀌었을까요? 말해 봐요!', 'Dots can make patterns when they <b>move to new places</b>.', '점들이 새 자리로 움직이면 무늬를 만들 수 있어요.']],
      ans: d => FORMS.map((F, i) => F.map(([x, y]) => `<circle cx="${U(66 + i * 160 + 75 + x * .55)}" cy="${U(552 + y * .55)}" r="8" fill="${REDV}"/>`).join('')).join('') },
    { t: 'The Circle Is Born', act: 'Count the spaces. Then draw 3 more radii.', says: [['What is in the middle of a circle? Say it!', '동그라미의 한가운데에는 무엇이 있을까요? 말해 봐요!', 'A circle has a <b>center</b>, and every radius is the same length.', '동그라미에는 중심이 있고, 반지름은 모두 길이가 같아요.']],
      ans: d => [[160, 470], [88, 542], [160, 614]].map(([x, y]) => `<line x1="${U(160)}" y1="${U(542)}" x2="${U(x)}" y2="${U(y)}" stroke="${REDV}" stroke-width="7" stroke-linecap="round"/>`).join('') + `<text x="${U(438)}" y="${U(524)}" font-size="42" text-anchor="middle" fill="${INKB}">3</text>` },
    { t: 'A Circle Has No Vertices', act: 'Colour the vertices red. Count how many.', says: [['Why does a circle have no vertices? Press the button and say it!', '동그라미는 왜 꼭짓점이 없을까요? 버튼을 누르고 말해요!', 'A circle has no vertices because it is <b>round all around</b>.', '동그라미는 둥글어서 꼭짓점이 없어요.'],
        ['Uh-oh! The alien says a circle has no points. Is that right? Tell him!', '외계인이 동그라미에는 점이 없대요. 맞을까요? 말해 줘요!', 'No! A circle has <b>many points</b>, but no vertices.', '아니에요! 동그라미에는 점이 아주 많지만 꼭짓점은 없어요.', true, 'The alien says: “A circle has no points!” Is that right?']],   // the book shows what was really asked, so the 'No!' answers it
      ans: d => [[164, 751], [221, 851], [107, 851], [497, 756], [599, 756], [599, 858], [497, 858]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="${REDV}"/>`).join('') + [[164, '3'], [356, '0'], [548, '4'], [740, '0']].map(([x, t]) => `<text x="${x}" y="919" font-size="46" text-anchor="middle" fill="${INKB}">${t}</text>`).join('') },
    { t: 'Circle or Oval?', act: 'Is it a circle or an oval?', says: [['Is an egg a circle? Why not? Say it!', '달걀은 동그라미일까요? 왜 아닐까요? 말해 봐요!', 'An egg is an oval because it is <b>round and long</b>.', '달걀은 둥글고 길어서 타원이에요.']],
      ans: d => COV.map(([n, k], i) => `<line x1="${U(92 + i * 82)}" y1="${U(534)}" x2="${U(k === 'circle' ? 176 : 418)}" y2="${U(570)}" stroke="${INKB}" stroke-width="5" stroke-linecap="round"/>`).join('') },
    { t: 'Circles Around Us', act: 'Find 5 round things.', says: [['Why is a wheel round? Say it!', '바퀴는 왜 둥글까요? 말해 봐요!', 'The wheel is round, so it can <b>roll</b>.', '바퀴는 둥글어서 굴러갈 수 있어요.']],
      ans: d => (d.p || []).map((n, i) => `<image href="art/obj/${n}.png" x="${U(110 + i * 96 - 30)}" y="${U(530 - 30)}" width="${U(60)}" height="${U(60)}"/>`).join('') },
    { t: 'The Round World', act: 'Find the rule. Then count the circles in the town.', says: [['What would you build with circles? Say it!', '동그라미로 무엇을 만들고 싶나요? 말해 봐요!', 'I can draw a circle to build a <b>round town</b>.', '나는 동그라미를 그려서 둥근 마을을 만들 수 있어요.']],
      ans: d => [495, 519].map(x => `<circle cx="${U(x)}" cy="${U(507)}" r="${U(10)}" fill="#f277a8"/>`).join('') + [[358, '3'], [488, '4']].map(([x, t]) => `<text x="${U(x)}" y="${U(589)}" font-size="40" text-anchor="middle" fill="${INKB}">${t}</text>`).join('') },
    { t: 'My Circle Gallery', act: 'Make 3 circles for your gallery.', says: [['Why is every shape special? Say it!', '모든 도형은 왜 특별할까요? 말해 봐요!', 'Every shape is special because each one is <b>different</b>.', '모든 도형은 저마다 달라서 특별해요.']],
      ans: d => (d.c || []).map((col, i) => `<circle cx="${U(136 + i * 156)}" cy="${U(510)}" r="${U(34)}" fill="${col}"/>`).join('') }] };
  // shared by the activities and by the book: where six dots go for "a straight line", "a round shape", "a star"; and which thing is a circle or an oval
  const FORMS = [[-80, -48, -16, 16, 48, 80].map(x => [x, 0]), [0, 1, 2, 3, 4, 5].map(k => [62 * Math.cos((k * 60 - 90) * Math.PI / 180), 62 * Math.sin((k * 60 - 90) * Math.PI / 180)]),
    [[0, 0]].concat([0, 1, 2, 3, 4].map(k => [70 * Math.cos((k * 72 - 90) * Math.PI / 180), 70 * Math.sin((k * 72 - 90) * Math.PI / 180)]))];
  const COV = [['plate', 'circle'], ['egg', 'oval'], ['coin', 'circle'], ['mirror', 'oval'], ['clock', 'circle'], ['balloon', 'oval']];
  const track = (what, week) => { try { if (window.GPTrack) GPTrack.play('fm', what, { week }); } catch (e) {} };   // 'video' | 'game' | 'talk', for the star board and the reports
  const ACTS = {
    '1-0': () => new Promise(finish => {
      const c = $('#card'), SH = [   // the four shapes of the worksheet's activity, in play order, with their vertices
        { n: 'triangle', col: '#ff8fa0', v: [[150, 52], [258, 240], [42, 240]], d: '<polygon points="150,52 258,240 42,240"/>' },
        { n: 'circle', col: '#7fd4ff', v: [], d: '<circle cx="150" cy="150" r="104"/>' },
        { n: 'square', col: '#8be28a', v: [[52, 52], [248, 52], [248, 248], [52, 248]], d: '<rect x="52" y="52" width="196" height="196"/>' },
        { n: 'oval', col: '#c9a2ff', v: [], d: '<ellipse cx="150" cy="150" rx="128" ry="78"/>' }];
      const NUM = ['One!', 'Two!', 'Three!', 'Four!'], NUMK = ['하나!', '둘!', '셋!', '넷!']; let alive = true, cur = -1, got = 0, lock = true, pgi = 0, onTap = null, done4 = null, talked = false;
      const WK = WEEKS['1-0'], PD = () => { S.pgd = S.pgd || {}; return S.pgd['1-0'] = S.pgd['1-0'] || {}; };   // PD()[page] = that page's saved answers
      c.innerHTML = `<div class="play"><button class="pill dback wkback"><span>←</span><span class="l">Planet<small>행성으로</small></span></button><div class="ptitle"><h2></h2><p></p></div><button class="pill ws">Worksheet page<small class="wsn">Week 1 · 01</small></button>
        <div class="pgs">${WK.map((_, i) => `<i data-i="${i}">${i + 1}</i>`).join('')}</div>
        <div class="shelf" hidden>${SH.map((q, i) => `<span class="slot" data-i="${i}"><svg viewBox="0 0 300 300"><g fill="none" stroke="rgba(255,255,255,.35)" stroke-width="16" stroke-linejoin="round">${q.d}</g></svg><b></b></span>`).join('')}</div>
        <img id="gy" src="art/gerry/wave.webp" alt=""><div id="gsay"></div><div class="arena"></div></div>`;
      c.hidden = false; snd.pop(); const A = c.querySelector('.arena');
      let mode = 'hub', run = 0; const allDone = () => WK.every((_, i) => PD()[i]), quiet = () => { if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); clearTimeout(gerry.t); };
      const head = (h, p2, back, backKo) => { c.querySelector('.ptitle h2').textContent = h; c.querySelector('.ptitle p').textContent = p2 || ''; c.querySelector('.wkback .l').innerHTML = `${back}<small>${backKo}</small>`; };
      const out = ok => { alive = false; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); c.hidden = true; c.onclick = null; c.innerHTML = ''; finish(ok); };

      /* 1 the lesson video */
      const video = async () => { mode = 'video'; run++; onTap = null; pgi = -1; c.querySelector('.shelf').hidden = true; head('Week 1 · The World of Circles', 'Watch the lesson video.', 'Week 1', '1주로');
        // the week's lesson video (forest-math/video/week1-circles, copied to world/video/): big play button, tap the picture to pause
        A.innerHTML = `<div class="tv"><div class="scr vid"><video src="video/fm01-week1-circles.mp4" poster="video/fm01-week1-circles.jpg" playsinline preload="metadata"></video><button class="playb" aria-label="Play"></button></div></div>`;
        const v = A.querySelector('video'), pb = A.querySelector('.playb'); if (window.VCtl) VCtl.attach(A.querySelector('.scr.vid'));   // full screen + a time bar to switch on (vctl.js)
        let seen = false; v.onplay = () => { if (!seen) { seen = true; track('video', 1); track('w1video', 1); S.vid = S.vid || {}; S.vid['1-0'] = 1; save(); } pb.hidden = true; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); if ($('#gy')) $('#gy').src = 'art/gerry/stand.webp'; };   // Gerry is quiet while the video talks
        v.onpause = () => { pb.hidden = false; }; v.onended = () => { pb.hidden = false; if ($('#gy')) $('#gy').src = 'art/gerry/thumb.webp'; if (mode === 'video') setTimeout(() => { if (alive && mode === 'video') hub(); }, 900); };   // back to the week screen by itself
        v.play().catch(() => {}); };
      /* the week screen: what is next (one card), Video, one big START, and My book: finished pages can be played again from the numbers */
      const hub = async cheer => { if (!alive) return; mode = 'hub'; run++; onTap = null; pgi = -1; quiet(); c.querySelector('.shelf').hidden = true;
        const i = startPage(), done = allDone(), P = WK[i]; head('Week 1 · The World of Circles', '', 'Planet', '행성으로'); c.querySelector('.wsn').textContent = `Week 1 · ${String(i + 1).padStart(2, '0')}`;
        c.querySelectorAll('.pgs i').forEach((d, k) => { d.classList.remove('on'); d.classList.toggle('ok', !!PD()[k]); d.classList.toggle('can', !!PD()[k] || k === i); });
        A.innerHTML = `<div class="hub"><div class="hcard"><span class="hk">${done ? 'All 8 pages done!' : `Page ${i + 1} of 8`}</span><h2>${done ? 'Week 1 is finished!' : P.t}</h2><p>${done ? 'Open your Discussion Book, or play a page again.' : P.act}</p></div>
          <div class="hbtn"><button class="hb hvideo"><img src="art/ic-video.png" alt=""><b>Video</b></button><button class="go hstart${done ? ' again' : ''}"><span class="l">${done ? 'PLAY AGAIN' : 'START'}<small>${done ? 'from page 1' : `Page ${i + 1} of 8`}</small></span></button><button class="hb hbook${done ? '' : ' locked'}"><img src="art/book.png" alt=""><b>My book</b></button></div></div>`;
        if (cheer) { burst(W / 2, 360, 80, 15); gerry('Great talking! You get a star!', '말하기 최고! 별을 받아요!', 'cheer'); }
        else if (!(S.vid || {})['1-0'] && !Object.keys(PD()).length) gerry("Hi! I'm Gerry! First, let's watch the video.", '안녕! 나는 게리야! 먼저 영상을 봐요.', 'point');
        else gerry(done ? 'You finished the week! Open your book.' : 'Press START!', done ? '이번 주를 다 했어요! 책을 열어 봐요.' : 'START를 눌러요!', 'point'); };
      /* 2 the game: catch the vertices of each shape as it flies in */
      const next = async () => { if (!alive || pgi !== 3) return; cur++; got = 0; lock = true;
        if (cur >= SH.length) { c.querySelector('.shelf').hidden = true; return done4({}); }
        const q = SH[cur];
        A.innerHTML = `<div class="ship"><svg viewBox="0 0 300 300" class="shape"><g class="outl" fill="${q.col}" stroke="#fff" stroke-width="14" stroke-linejoin="round">${q.d}</g>${q.v.map(([x, y], j) => `<circle class="vx" data-j="${j}" cx="${x}" cy="${y}" r="40"/>`).join('')}</svg><b class="count">0</b></div>
          <button class="zero"><b>0</b><span>No vertices!<small>꼭짓점이 없어요</small></span></button>`;
        snd.whoosh(); if (cur > 0) await gerry(`Here comes the ${q.n}! ${q.v.length ? 'Tap its vertices!' : 'Does it have vertices?'}`, q.v.length ? '꼭짓점을 눌러요!' : '꼭짓점이 있을까요?', q.v.length ? 'point' : 'think'); else await wait(900); lock = false; };
      const solved = async () => { const q = SH[cur], sl = c.querySelector(`.slot[data-i="${cur}"]`); lock = true; snd.win(); burst((W * 1.01 + 490) / 2, 400, 60, 14);
        const line = q.v.length ? gerry(q.v.length === 3 ? 'Three vertices! Great job!' : 'Four vertices! Wow!', q.v.length === 3 ? '꼭짓점이 세 개! 잘했어요!' : '꼭짓점이 네 개! 우와!', 'cheer')
          : gerry(q.n === 'circle' ? 'Yes! A circle has no vertices!' : 'Right! An oval has no vertices!', '맞아요! 꼭짓점이 없어요!', 'cheer');
        await wait(700); if (!alive || pgi !== 3) return; A.querySelector('.ship').classList.add('away'); await line; if (!alive || pgi !== 3) return;
        sl.classList.add('full'); sl.querySelector('g').setAttribute('fill', q.col); sl.querySelector('g').setAttribute('stroke', '#fff'); sl.querySelector('b').textContent = q.v.length; snd.ding(cur); await wait(350); next(); };
      /* 3 the speaking that belongs to this page: say the reason, then answer an opposite idea */
      const turn = (key, alien, en, ko, frame, frameKo) => new Promise(async done => {
        const plain = frame.replace(/<[^>]+>/g, ''), bold = (/<b>(.*?)<\/b>/.exec(frame) || [])[1] || '', bw = bold.split(' ').filter(Boolean);
        const WD = plain.split(' '), b0 = bw.length ? WD.findIndex((_, i) => bw.every((x, j) => (WD[i + j] || '').replace(/[.,!?]/g, '') === x.replace(/[.,!?]/g, ''))) : -1;
        A.innerHTML = `<div class="talkp">${alien ? '<div class="claim"><img src="art/alien.png" alt=""><span>“A circle has no points!”<small>“동그라미에는 점이 없어!”</small></span></div>' : ''}
          <div class="frame"><span>Say it:</span><p class="line">${WD.map((w, i) => `<span class="w${b0 >= 0 && i >= b0 && i < b0 + bw.length ? ' key' : ''}">${w}</span>`).join(' ')}</p><small>${frameKo}</small></div>
          <div class="heardl"><i class="sst"><b></b><b></b><b></b></i><em></em></div>
          <div class="sbtn"><button class="go say"><span class="mic"></span><span class="l">Press and say<small>누르고 말해요</small></span></button><button class="pill saidit" hidden><span class="l">I said it!<small>말했어요</small></span></button><button class="go nextt" hidden><span class="l">Next<small>다음</small></span></button></div></div>`;
        const sayB = A.querySelector('.say'), heardE = A.querySelector('.heardl em'), nextB = A.querySelector('.nextt'), manual = A.querySelector('.saidit'), T = window.Talk;
        let tries = 0, best = 0, bestScore = -1, busyL = false, closed = false;
        const stars = n => { best = Math.max(best, n); A.querySelectorAll('.sst b').forEach((x, i) => { x.classList.toggle('on', i < best); if (i < n) { x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop'); } }); };
        const reset = () => { sayB.classList.remove('on'); sayB.querySelector('.l').innerHTML = tries ? 'Say it again<small>다시 말해요</small>' : 'Press and say<small>누르고 말해요</small>'; };
        const finishT = () => { if (closed) return; closed = true; S.say = S.say || {}; S.say[key] = Math.max(best, S.say[key] || 0); save(); snd.win(); burst((W * 1.01 + 490) / 2, 380, 50, 13); if ($('#gy')) $('#gy').src = 'art/gerry/thumb.webp'; setTimeout(done, 700); };
        nextB.onclick = finishT; manual.onclick = () => { stars(2); gerry('Great speaking!', '말하기 최고!', 'cheer'); finishT(); };
        sayB.addEventListener('click', async () => { if (busyL || closed) return; busyL = true; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); clearTimeout(gerry.t); if ($('#gy')) $('#gy').src = 'art/gerry/stand.webp';   // nothing talks over the child
          heardE.textContent = ''; const r = await listen(sayB, w => { heardE.textContent = w; }); busyL = false; if (!alive || closed || !A.contains(sayB)) return; tries++; reset();
          if (!r.heard.length || !T) {   // nothing heard (no microphone, too quiet, or a browser that cannot hear words): never leave the child stuck
            if (r.clip) VDB.put(key, r.clip); manual.hidden = false; heardE.textContent = "I couldn't hear the words.";
            return gerry(tries >= 2 ? 'Say it out loud, then press "I said it!"' : "I couldn't hear you. Press the microphone and say it loudly!", tries >= 2 ? '크게 말하고 "말했어요"를 눌러요.' : '잘 안 들렸어요. 마이크를 누르고 크게 말해요!', 'think'); }
          const sc = T.score(plain, r.heard), st = T.stars(sc); heardE.textContent = '“' + r.heard[0] + '”';
          A.querySelectorAll('.line .w').forEach(w => { const Wd = T.words(w.textContent)[0] || '', hit = r.heard.some(h => T.words(h).some(x => x === Wd || (x.length > 3 && x.slice(0, 3) === Wd.slice(0, 3)))); w.classList.toggle('hit', hit); w.classList.toggle('miss', !hit); });
          if (r.clip && sc >= bestScore) { bestScore = sc; VDB.put(key, r.clip); }   // the best try is the one kept for the book
          stars(st); snd.ding(st);
          if (st === 3) { await gerry(sc >= 95 ? 'Perfect! You sound great!' : 'Wonderful speaking!', sc >= 95 ? '완벽해요! 정말 잘했어요!' : '말하기 최고!', 'cheer'); return finishT(); }
          nextB.hidden = !(st === 2 || tries >= 3);
          if (tries >= 3) return gerry("Good try! Let's say it together.", '잘했어요! 같이 말해 봐요.', 'point');
          gerry(st === 2 ? 'Nice! Try once more for three stars!' : 'Good try! Say it again.', st === 2 ? '좋아요! 별 세 개에 한 번 더 도전!' : '잘했어요! 다시 말해 봐요.', 'point'); });
        await gerry(en, ko, alien ? 'think' : 'point'); });
      /* 4 the week = its 8 worksheet pages, one after another: each page's activity, then its Discussion.
           Progress is kept page by page, so a child who stops comes back to the next page. */
      const clamp = v => Math.max(0, Math.min(1, v)), SP = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; };
      const cx0 = () => (W * 1.01 + 490) / 2, good = (e, n = 12) => { const at = pt(e); burst(at[0], at[1], n, 6); };
      const R = [
        /* 01 A Tiny Dot: "Draw dots. Name them A, B, C, D." */
        ok => new Promise(res => { const need = [1, 2, 3, 4], put = need.map(() => []);
          A.innerHTML = `<svg class="pga" viewBox="0 0 760 470">${need.map((n, i) => `<g class="bx" data-i="${i}"><rect x="${10 + i * 190}" y="30" width="170" height="350" rx="26"/><text x="${95 + i * 190}" y="76" text-anchor="middle" font-size="27">${n} ${n > 1 ? 'dots' : 'dot'}</text><g class="ds"></g></g>`).join('')}</svg>`;
          const svg = A.querySelector('svg');
          onTap = e => { const g = e.target.closest('.bx'); if (!g) return; const i = +g.dataset.i, [x, y] = SP(svg, e), bx = 10 + i * 190; if (put[i].length >= need[i]) { snd.nope(); return; }
            const nx = clamp((x - bx - 26) / 104), ny = clamp((y - 112) / 240), k = put[i].length, X = bx + 26 + nx * 104, Y = 112 + ny * 240; put[i].push([+nx.toFixed(3), +ny.toFixed(3)]);
            g.querySelector('.ds').insertAdjacentHTML('beforeend', `<g class="dd"><circle cx="${X}" cy="${Y}" r="12" fill="${REDV}"/><text x="${X + 16}" y="${Y - 9}" font-size="26" fill="#2b2d3a">${'ABCD'[k]}</text></g>`); snd.ding(k); good(e);
            if (put[i].length === need[i]) g.classList.add('ok');
            if (put.every((p, j) => p.length === need[j])) { onTap = null; snd.win(); res({ d: put }); } }; }),
        /* 02 Many Dots: "Put 6 dots in each shape." a straight line, a round shape, a star */
        ok => new Promise(res => { const NM = ['a straight line', 'a round shape', 'a star'], put = [0, 0, 0]; let made = 0;
          A.innerHTML = `<svg class="pga" viewBox="0 0 760 470">${NM.map((n, i) => `<g class="bx" data-i="${i}"><rect x="${i * 260}" y="30" width="240" height="350" rx="26"/><text x="${i * 260 + 120}" y="76" text-anchor="middle" font-size="25">${n}</text><g class="ds"></g></g>`).join('')}</svg>`;
          const svg = A.querySelector('svg');
          onTap = e => { const g = e.target.closest('.bx'); if (!g) return; const i = +g.dataset.i, [x, y] = SP(svg, e); if (put[i] >= 6) { snd.nope(); return; }
            const X = Math.max(i * 260 + 22, Math.min(i * 260 + 218, x)), Y = Math.max(110, Math.min(358, y)); put[i]++;
            g.querySelector('.ds').insertAdjacentHTML('beforeend', `<circle class="mv" r="13" fill="${REDV}" style="transform:translate(${X}px,${Y}px)"/>`); snd.ding(put[i]); good(e, 8);
            if (put[i] === 6) { g.classList.add('ok'); setTimeout(() => { if (!ok()) return; snd.whoosh(); g.querySelectorAll('.mv').forEach((d, k) => { d.style.transform = `translate(${i * 260 + 120 + FORMS[i][k][0]}px,${228 + FORMS[i][k][1]}px)`; });
              if (++made === 3) { onTap = null; setTimeout(() => { if (ok()) { snd.win(); res({}); } }, 1300); } }, 350); } }; }),
        /* 03 The Circle Is Born: "Count the spaces. Then draw 3 more radii." */
        ok => new Promise(res => { const cx = 250, cy = 225; let step = 0, n = 0;
          let g = ''; for (let r = 0; r < 7; r++) for (let q = 0; q < 7; q++) g += `<circle cx="${cx - 180 + q * 60}" cy="${cy - 180 + r * 60}" r="5" fill="#c9ccd6"/>`;
          A.innerHTML = `<svg class="pga" viewBox="0 0 760 470"><rect class="pan" x="0" y="0" width="760" height="450" rx="30"/>${g}<circle cx="${cx}" cy="${cy}" r="180" fill="none" stroke="#2b2d3a" stroke-width="7"/>
            <g class="rs"></g><line x1="${cx}" y1="${cy}" x2="${cx + 180}" y2="${cy}" stroke="${REDV}" stroke-width="9" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="11" fill="#2b2d3a"/>
            <g class="ask"><text x="610" y="62" text-anchor="middle" font-size="26">How many</text><text x="610" y="94" text-anchor="middle" font-size="26">spaces?</text>${[2, 3, 4].map((v, i) => `<g class="nb" data-n="${v}"><circle cx="610" cy="${166 + i * 100}" r="42"/><text x="610" y="${182 + i * 100}" text-anchor="middle" font-size="46">${v}</text></g>`).join('')}</g>
            <g class="rp">${[[cx, cy - 180], [cx - 180, cy], [cx, cy + 180]].map(([x, y], k) => `<circle class="rpt" data-k="${k}" data-x="${x}" data-y="${y}" cx="${x}" cy="${y}" r="24"/>`).join('')}</g></svg>`;
          const svg = A.querySelector('svg');
          onTap = e => { const nb = e.target.closest('.nb'), rp = e.target.closest('.rpt');
            if (step === 0 && nb) { if (+nb.dataset.n !== 3) { nb.classList.remove('no'); void nb.getBBox(); nb.classList.add('no'); snd.nope(); return gerry('Count the spaces again!', '칸을 다시 세어 봐요!', 'think'); }
              step = 1; nb.classList.add('ok'); svg.classList.add('step1'); snd.win(); good(e); return gerry('Yes! Three spaces. Now tap the circle to draw three more radii!', '맞아요! 세 칸. 이제 동그라미를 눌러 반지름을 세 개 더 그려요!', 'point'); }
            if (step === 1 && rp && !rp.classList.contains('on')) { rp.classList.add('on'); n++; svg.querySelector('.rs').insertAdjacentHTML('beforeend', `<line class="grow" x1="${cx}" y1="${cy}" x2="${rp.dataset.x}" y2="${rp.dataset.y}" stroke="${REDV}" stroke-width="9" stroke-linecap="round" pathLength="1"/>`); snd.ding(n); good(e);
              if (n === 3) { onTap = null; setTimeout(() => { if (ok()) { snd.win(); res({}); } }, 700); } } }; }),
        /* 04 A Circle Has No Vertices: "Colour the vertices red. Write how many." (catch the vertices of each shape) */
        ok => new Promise(res => { done4 = res; cur = -1; c.querySelector('.shelf').hidden = false; next(); }),
        /* 05 Circle or Oval?: "Draw a line to circle or oval." */
        ok => new Promise(res => { let k = 0; const n = { circle: 0, oval: 0 };
          A.innerHTML = `<div class="cob"><div class="itb"><img class="cit" src="art/obj/${COV[0][0]}.png" alt=""></div><div class="bins">${['circle', 'oval'].map(b => `<button class="bin" data-k="${b}"><svg viewBox="0 0 120 80"><ellipse cx="60" cy="40" rx="${b === 'circle' ? 32 : 52}" ry="32" fill="${b === 'circle' ? '#e3342f' : '#f277a8'}"/></svg><span>${b}</span><b>0</b></button>`).join('')}</div></div>`;
          onTap = e => { const bin = e.target.closest('.bin'), it = A.querySelector('.cit'); if (!bin || !it || it.classList.contains('go')) return;
            if (bin.dataset.k !== COV[k][1]) { it.classList.remove('no'); void it.offsetWidth; it.classList.add('no'); snd.nope(); return gerry(COV[k][1] === 'oval' ? 'Look again! It is round and long.' : 'Look again! It is the same across every way.', COV[k][1] === 'oval' ? '다시 봐요! 둥글고 길어요.' : '다시 봐요! 어느 쪽으로 재도 같아요.', 'think'); }
            it.classList.add('go', bin.dataset.k === 'circle' ? 'gl' : 'gr'); bin.querySelector('b').textContent = ++n[bin.dataset.k]; bin.classList.remove('hit'); void bin.offsetWidth; bin.classList.add('hit'); snd.ding(k); good(e);
            setTimeout(() => { if (!ok()) return; if (++k >= COV.length) { onTap = null; snd.win(); return res({}); } const ib = A.querySelector('.itb'); if (ib) ib.innerHTML = `<img class="cit" src="art/obj/${COV[k][0]}.png" alt="">`; }, 520); }; }),
        /* 06 Circles Around Us: "Find 5 round things. Draw them." */
        ok => new Promise(res => { const ALL = ['clock', 'book', 'wheel', 'door', 'coin', 'window', 'plate', 'phone', 'table', 'tv', 'button', 'donut'], ROUND = ['clock', 'wheel', 'coin', 'plate', 'table', 'button', 'donut'], got5 = [];
          A.innerHTML = `<div class="find"><div class="fgrid">${ALL.map((n, i) => `<button class="fi" data-n="${n}" style="animation-delay:${-i * .31}s"><img src="art/obj/${n}.png" alt=""></button>`).join('')}</div><div class="tray5">${[0, 1, 2, 3, 4].map(i => `<i data-i="${i}"></i>`).join('')}</div></div>`;
          onTap = e => { const b = e.target.closest('.fi'); if (!b || b.classList.contains('got')) return; const n = b.dataset.n;
            if (!ROUND.includes(n)) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); snd.nope(); return gerry('That is not round. Look for round things!', '그건 둥글지 않아요. 둥근 것을 찾아요!', 'think'); }
            b.classList.add('got'); A.querySelector(`.tray5 i[data-i="${got5.length}"]`).innerHTML = `<img src="art/obj/${n}.png" alt="">`; got5.push(n); snd.ding(got5.length); good(e);
            if (got5.length === 5) { onTap = null; setTimeout(() => { if (ok()) { snd.win(); res({ p: got5 }); } }, 500); } }; }),
        /* 07 The Round World: "Find the rule. Draw the next 2 circles." then "How many big circles in the town? small?" */
        ok => new Promise(res => { const PAT = [1, 0, 0, 1, 0, 0, 1], TOWN = [[150, 250, 62, '#4da863', 1], [370, 275, 74, '#6fb1e4', 1], [590, 250, 54, '#e3342f', 1], [262, 150, 20, '#e3b23c', 0], [480, 140, 20, '#e3b23c', 0], [690, 370, 20, '#e3b23c', 0], [60, 380, 20, '#e3b23c', 0]];
          let filled = 0, want = 1, cnt = 0;
          const phaseB = () => { A.innerHTML = `<svg class="pga" viewBox="0 0 760 470"><rect class="pan" x="0" y="0" width="760" height="450" rx="30"/>${TOWN.map(([x, y, r, col, big], i) => `<circle class="tc" data-i="${i}" cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`).join('')}<g class="cnt2"><circle cx="700" cy="60" r="42" fill="#2b2d3a"/><text x="700" y="77" text-anchor="middle" font-size="48" fill="#fff">0</text></g></svg>`;
            gerry('Now the round town. Tap the big circles!', '이제 둥근 마을이에요. 큰 동그라미를 눌러요!', 'point'); };
          A.innerHTML = `<svg class="pga" viewBox="0 0 760 470"><rect class="pan" x="0" y="0" width="760" height="450" rx="30"/>${PAT.map((b, i) => `<circle cx="${62 + i * 76}" cy="150" r="${b ? 30 : 14}" fill="${b ? '#e3342f' : '#f277a8'}"/>`).join('')}
            ${[7, 8].map(i => `<circle class="slot2" data-i="${i - 7}" cx="${62 + i * 76}" cy="150" r="30"/>`).join('')}<text x="380" y="262" text-anchor="middle" font-size="26">What comes next?</text>
            ${[['big', 1, 250, 30], ['small', 0, 510, 14]].map(([t, b, x, r]) => `<g class="pb" data-b="${b}"><rect x="${x - 110}" y="296" width="220" height="110" rx="55"/><circle cx="${x - 52}" cy="351" r="${r}" fill="${b ? '#e3342f' : '#f277a8'}"/><text x="${x + 28}" y="362" text-anchor="middle" font-size="34">${t}</text></g>`).join('')}</svg>`;
          onTap = e => { const pb = e.target.closest('.pb'), tc = e.target.closest('.tc'), svg = A.querySelector('svg');
            if (pb) { if (+pb.dataset.b !== 0) { pb.classList.remove('no'); void pb.getBBox(); pb.classList.add('no'); snd.nope(); return gerry('Look at the rule: big, small, small!', '규칙을 봐요: 크다, 작다, 작다!', 'think'); }
              const sl = svg.querySelector(`.slot2[data-i="${filled}"]`); sl.outerHTML = `<circle class="popc" cx="${sl.getAttribute('cx')}" cy="150" r="14" fill="#f277a8"/>`; filled++; snd.ding(filled); good(e);
              if (filled === 2) { snd.win(); setTimeout(() => { if (ok()) phaseB(); }, 900); } return; }
            if (tc && !tc.classList.contains('on')) { const T = TOWN[+tc.dataset.i]; if (T[4] !== want) { snd.nope(); return gerry(want ? 'That one is small. Tap the big circles!' : 'That one is big. Tap the small circles!', want ? '그건 작아요. 큰 동그라미를 눌러요!' : '그건 커요. 작은 동그라미를 눌러요!', 'think'); }
              tc.classList.add('on'); cnt++; svg.querySelector('.cnt2 text').textContent = cnt; snd.ding(cnt); good(e);
              if (want && cnt === 3) { want = 0; cnt = 0; setTimeout(() => { if (!ok()) return; svg.querySelector('.cnt2 text').textContent = 0; gerry('Three big circles! Now tap the small circles!', '큰 동그라미 세 개! 이제 작은 동그라미를 눌러요!', 'point'); }, 500); }
              else if (!want && cnt === 4) { onTap = null; setTimeout(() => { if (ok()) { snd.win(); res({}); } }, 600); } } }; }),
        /* 08 My Circle Gallery: "Draw 3 round things." (paint a circle for each frame) */
        ok => new Promise(res => { const COLS = ['#e3342f', '#ffcc00', '#2f6fdb', '#4da863', '#f277a8', '#8b5cf6'], picked = [];
          A.innerHTML = `<div class="gal"><div class="frames">${[0, 1, 2].map(i => `<i class="fr" data-i="${i}"></i>`).join('')}</div><div class="pal2">${COLS.map(col => `<button class="sw" data-c="${col}" style="background:${col}"></button>`).join('')}</div></div>`;
          onTap = e => { const sw = e.target.closest('.sw'); if (!sw || picked.length >= 3) return; const fr = A.querySelector(`.fr[data-i="${picked.length}"]`); fr.innerHTML = `<b style="background:${sw.dataset.c}"></b>`; fr.classList.add('ok'); picked.push(sw.dataset.c); snd.ding(picked.length); good(e, 16);
            if (picked.length === 3) { onTap = null; setTimeout(() => { if (ok()) { snd.win(); res({ c: picked }); } }, 700); } }; })];
      // what Gerry says when a page opens and when its activity is done
      const INTRO = [['Tap in each box to draw the dots!', '상자마다 눌러서 점을 그려요!'], ['Tap six times in each box. Watch the dots move!', '상자마다 여섯 번 눌러요. 점이 움직이는 걸 봐요!'], ['Look at the red radius. How many spaces is it?', '빨간 반지름을 봐요. 몇 칸일까요?'],
        ["Now let's play! Catch the vertices!", '이제 놀아요! 꼭짓점을 잡아요!'], ['Circle or oval? Tap the right box!', '동그라미일까요, 타원일까요? 맞는 상자를 눌러요!'], ['Find five round things!', '둥근 것 다섯 개를 찾아요!'],
        ['Find the rule. What comes next?', '규칙을 찾아요. 다음은 무엇일까요?'], ['Make your circle gallery. Tap a colour!', '동그라미 갤러리를 만들어요. 색을 눌러요!']];
      const DONE = [['Great! Every dot has a name!', '잘했어요! 점마다 이름이 있어요!'], ['Same dots, new shapes!', '같은 점인데 새 모양이에요!'], ['Four radii, all the same length!', '반지름 네 개, 모두 길이가 같아요!'], null,
        ['You sorted them all!', '모두 나눴어요!'], ['Five round things! Circles are all around us!', '둥근 것 다섯 개! 동그라미는 어디에나 있어요!'], ['Three big and four small. Well counted!', '큰 것 세 개, 작은 것 네 개. 잘 셌어요!'], ['What a lovely gallery!', '정말 멋진 갤러리예요!']];
      const startPage = () => { const D = PD(); for (let i = 0; i < WK.length; i++) if (!D[i]) return i; return 0; };   // the first page not done yet; all done = play the week again from page 1
      const runPage = async i => { if (!alive) return; const my = ++run, ok = () => alive && my === run; mode = 'page'; quiet(); pgi = i; onTap = null; track(`w1p${i + 1}`, 1); A.innerHTML = ''; head(WK[i].t, WK[i].act, 'Week 1', '1주로'); c.querySelector('.wsn').textContent = `Week 1 · ${String(i + 1).padStart(2, '0')}`;
        c.querySelectorAll('.pgs i').forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('ok', !!PD()[k] && k !== i); });
        const P = WK[i], task = R[i](ok); gerry(INTRO[i][0], INTRO[i][1], 'point'); if (i === 3) { await wait(1600); if (ok()) gerry('Here comes the triangle! Tap its vertices!', '꼭짓점을 눌러요!', 'point'); }
        const data = await task; if (!ok()) return; burst(cx0(), 380, 60, 14); if (DONE[i]) { await gerry(DONE[i][0], DONE[i][1], 'cheer'); if (!ok()) return; }
        if (!talked) { talked = true; track('talk', 1); }
        for (let k = 0; k < P.says.length; k++) { const [en, ko, fr, frKo, al] = P.says[k]; head(P.t, 'Discussion: say the sentence.', 'Week 1', '1주로'); await turn(`1-0-${i}-${'ab'[k]}`, !!al, en, ko, fr, frKo); if (!ok()) return; }
        PD()[i] = data || {}; save();
        if (i + 1 < WK.length && !WK.slice(i + 1).every((_, k) => PD()[i + 1 + k])) { A.innerHTML = ''; snd.whoosh(); await wait(400); if (ok()) runPage(i + 1); return; }   // straight on to the next page
        hub(allDone()); };

      c.onclick = e => {
        if (e.target.closest('.wkback')) { snd.pop(); const v = A.querySelector('video'); if (v) v.pause(); return mode === 'hub' ? out(allDone()) : hub(); }
        if (e.target.closest('.hvideo')) { snd.pop(); return video(); }
        if (e.target.closest('.hstart')) { snd.pop(); if (!talked) track('game', 1); return runPage(startPage()); }
        const hbk = e.target.closest('.hbook'); if (hbk) { if (!allDone()) { hbk.classList.remove('shake'); void hbk.offsetWidth; hbk.classList.add('shake'); snd.nope(); return gerry('Finish the pages first. Then your book opens!', '먼저 쪽을 다 해요. 그러면 책이 열려요!', 'think'); }
          out(true); return setTimeout(() => discussionBook(1, null, 0), 60); }   // week 1 starts on page 0 of the month's book
        const pd = e.target.closest('.pgs i'); if (pd && mode === 'hub' && pd.classList.contains('can')) { snd.pop(); return runPage(+pd.dataset.i); }
        if (e.target.closest('.ws')) { const im = document.createElement('div'); im.className = 'wsview'; im.innerHTML = `<img src="art/ws/1/${String((pgi < 0 ? startPage() : pgi) + 1).padStart(2, '0')}.webp" alt="">`; im.onclick = ev => { ev.stopPropagation(); im.remove(); }; c.appendChild(im); return; }
        if (e.target.closest('.playb')) { const v = A.querySelector('video'); if (v) v.play().catch(() => {}); return; }
        if (e.target.closest('.scr.vid video')) { const v = e.target; if (!v.paused) v.pause(); return; }
        if (pgi !== 3) { if (onTap) onTap(e); return; }   // every page but 04 looks after its own taps
        if (lock || cur < 0 || cur >= SH.length) return; const q = SH[cur], at = pt(e), ship = A.querySelector('.ship');
        const vx = e.target.closest('.vx');
        if (vx) { if (vx.classList.contains('on')) return; vx.classList.add('on'); vx.setAttribute('r', 22); got++; const cn = A.querySelector('.count'); cn.textContent = got; cn.classList.remove('bump'); void cn.offsetWidth; cn.classList.add('bump'); snd.ding(got); burst(at[0], at[1], 18, 7);
          if (got === q.v.length) solved(); else gerry(NUM[got - 1], NUMK[got - 1], 'point'); return; }
        if (e.target.closest('.zero')) { if (q.v.length) { snd.nope(); gerry('Look again! Where do two sides meet?', '다시 봐요! 두 변이 만나는 곳은 어디일까요?', 'think'); } else { const cn = A.querySelector('.count'); cn.classList.add('bump'); solved(); } return; }
        if (e.target.closest('.shape')) { ship.classList.remove('roll', 'nope'); void ship.offsetWidth;
          if (q.v.length) { ship.classList.add('nope'); snd.nope(); gerry('Vertices are where two sides meet. Try again!', '꼭짓점은 두 변이 만나는 곳이에요. 다시 해 봐요!', 'point'); }
          else { ship.classList.add('roll'); snd.boing(); gerry('Hee hee! It is round all around. No sides meet!', '히히! 둥글둥글해요. 만나는 변이 없어요!', 'think'); } }
      };
      hub();
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
    return { put: (k, b) => tx('readwrite', st => st.put(b, k)), get: k => tx('readonly', st => st.get(k)), keys: () => tx('readonly', st => st.getAllKeys()).then(k => k || []) }; })();
  const BOOKS = { 1: { cover: 'art/ws/fm01-cover.jpg', n: 32, name: 'FRESH MATH 1 · Vertices',
    weeks: [{ key: '1-0', t: 'The World of Circles' }, { key: '1-1', t: 'The World of Triangles' }, { key: '1-2', t: 'The World of Quadrilaterals' }, { key: '1-3', t: 'The World of Polygons' }] } };
  // page i of a month's book: which week it belongs to, its worksheet page (WEEKS) and the child's saved answers for it
  const bookPage = (BK, i) => { const wk = BK.weeks[Math.floor(i / 8)], P = (WEEKS[wk.key] || [])[i % 8], d = ((S.pgd || {})[wk.key] || {})[i % 8]; return { wk, P, d, id: wk.key + '-' + (i % 8) }; };
  /* The book, laid out as Start PBL's My Speech Book (user, 24 Nov: "the book pages have to show the answers they did, but also
     the recording, which should be on the next page to it, like pbl"): after the cover, every worksheet page is one spread:
     LEFT the real worksheet page with the child's answers on it, RIGHT what they said on that page: the sentence, their
     speaking stars and "Listen to me!" (their own voice). All the month's pages are there, week after week; a week's pages
     open when that week's stop is done. */
  function discussionBook(month, after, at) {
    const BK = BOOKS[month]; if (!BK) { toast('This month\'s Discussion Book is coming soon.', '이 달의 디스커션 북은 곧 나와요.'); if (after) after(); return; }
    const c = $('#card'), pg = i => `art/ws/${month}/${String(i + 1).padStart(2, '0')}.webp`;
    let n = -1, audio = null, alive = true, token = 0; const urls = {};   // n = -1 is the cover; then n = the worksheet page, 0 .. BK.n - 1
    // the book grows week by week: a week's pages open when that week's stop is done
    const OPEN = S.done >= month ? BK.weeks.length : S.done === month - 1 ? Math.min(BK.weeks.length, S.stop || 0) : 0, LAST = OPEN * 8 - 1;
    c.innerHTML = `<div class="dbk"><button class="pill dback"><span>←</span><span class="l">Planet<small>행성으로</small></span></button><h2 class="dtitle">My Discussion Book</h2>
      <div class="dwk"><i data-w="-1" class="cv">Cover</i>${BK.weeks.map((_, w) => `<i data-w="${w}"${w < OPEN ? '' : ' class="shut"'}>Week ${w + 1}</i>`).join('')}</div>
      <div class="dbook"><div class="dpg l"><img class="sheet" alt=""><div class="ans"></div></div><div class="dpg r"><div class="dcov"><img src="${BK.cover}" alt=""></div><div class="dsays"></div></div></div>
      <button class="dturn prev" aria-label="Back"></button><button class="dturn next" aria-label="Next"></button>
      <div class="dvoice"><span class="pdots"></span><button class="go hearall"><span class="tri"></span>Hear my whole book</button></div><img id="gy" src="art/gerry/wave.webp" alt=""><div id="gsay"></div></div>`;
    c.hidden = false; const q = x => c.querySelector(x), bk = q('.dbook');
    const stop = () => { token++; if (audio) { audio.pause(); audio = null; } c.querySelectorAll('.listen.on').forEach(b => b.classList.remove('on')); };
    const play = async (key, btn) => { stop(); const my = token; if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); clearTimeout(gerry.t); if ($('#gy')) $('#gy').src = 'art/gerry/stand.webp';
      const blob = await VDB.get(key); if (my !== token || !alive) return false; if (!blob) { if (btn) { btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope'); } snd.nope(); return false; }
      urls[key] = urls[key] || URL.createObjectURL(blob); audio = new Audio(urls[key]); if (btn) btn.classList.add('on');
      return new Promise(res => { const fin = () => { if (btn) btn.classList.remove('on'); res(true); }; audio.onended = fin; audio.onerror = fin; audio.play().catch(fin); }); };
    const show = async k => { stop(); n = Math.max(-1, Math.min(BK.n - 1, LAST, k)); const w = n < 0 ? -1 : Math.floor(n / 8); bk.classList.toggle('shut', n < 0); if (n < 0) q('.dpg.r').style.background = ''; bk.classList.remove('flip'); void bk.offsetWidth; bk.classList.add('flip');
      if (w >= 0 && w !== show.w) track(`w${w + 1}book`, w + 1); show.w = w;
      c.querySelectorAll('.dwk i').forEach(d => d.classList.toggle('on', +d.dataset.w === w)); q('.prev').disabled = n < 0; q('.next').disabled = n >= Math.min(BK.n - 1, LAST); snd.pop();
      q('.pdots').innerHTML = n < 0 ? '' : [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<i data-p="${w * 8 + i}" class="${w * 8 + i === n ? 'on' : ''}">${i + 1}</i>`).join('');
      if (n < 0) return; const { P, d, id } = bookPage(BK, n), my = n;
      const im = q('.dpg.l .sheet'), R = q('.dpg.r'); im.onload = () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d'); x.drawImage(im, 6, 6, 1, 1, 0, 0, 1, 1); const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
        R.style.background = `rgb(${r},${g},${b})`; R.classList.toggle('dark', r * .3 + g * .59 + b * .11 < 150); } catch (e) {} };
      q('.dpg.l .sheet').src = pg(n); q('.dpg.l .ans').innerHTML = P && d ? `<svg viewBox="0 0 905 1280">${P.ans(d)}</svg>` : '';
      const says = P && d ? P.says.map((sy, k) => ({ clip: id + '-' + 'ab'[k], a: sy[2], q: sy[5] || sy[0].replace(/\s*(Say it!|Press the button and say it!)$/, '') })) : [], has = await Promise.all(says.map(sy => VDB.get(sy.clip).then(b => !!b))); if (!alive || n !== my) return;
      q('.dsays').innerHTML = `<small class="wk">Week ${w + 1} · ${String(n % 8 + 1).padStart(2, '0')}</small>` + (says.length ? says.map((sy, i) => `<div class="dsay${says.length > 1 ? ' two' : ''}"><span class="dqq"><b>Q</b>${sy.q}</span><p>${sy.a}</p>
          <button class="listen${has[i] ? '' : ' none'}" data-clip="${sy.clip}"><b></b><span class="wv">${[18, 34, 52, 40, 64, 30, 48, 58, 26, 44, 60, 36].map((h, j) => `<i style="height:${h * .5}px;--d:${j * -.09}s"></i>`).join('')}</span><em>${has[i] ? 'Listen!' : 'No voice yet'}</em></button>
          <div class="dst">${[0, 1, 2].map(k => `<u class="${k < ((S.say || {})[sy.clip] || 0) ? 'on' : ''}"></u>`).join('')}</div></div>`).join('')
        : `<div class="dsay empty"><p>${P ? `Play page ${n % 8 + 1} to fill this page!` : 'This page is coming soon.'}</p><small>${P ? `${n % 8 + 1}쪽을 하면 여기가 채워져요` : '이 쪽은 곧 나와요'}</small></div>`); };
    const out = () => { alive = false; stop(); Object.values(urls).forEach(u => URL.revokeObjectURL(u)); if (gAudio) gAudio.pause(); if (window.Voice) Voice.stop(); clearInterval(gTick); c.hidden = true; c.onclick = null; c.innerHTML = ''; if (after) after(); };
    c.onclick = async e => { const t = e.target;
      if (t.closest('.dback')) return out();
      if (t.closest('.dcov') || t.closest('.next')) return show(n + 1);
      if (t.closest('.prev')) return show(n - 1);
      const pd = t.closest('.pdots i'); if (pd) return show(+pd.dataset.p);
      const d = t.closest('.dwk i'); if (d) { if (d.classList.contains('shut')) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); snd.nope(); return toast(`Week ${+d.dataset.w + 1} opens here when you finish it.`, `${+d.dataset.w + 1}주를 하면 여기에 열려요.`); }
        return show(+d.dataset.w < 0 ? -1 : +d.dataset.w * 8); }
      const l = t.closest('.listen'); if (l) { if (l.classList.contains('on')) return stop(); return play(l.dataset.clip, l); }
      if (t.closest('.hearall')) { let any = false;   // every voice in order, each beside the page it belongs to
        for (let k = 0; k <= LAST && alive; k++) { const { P, d } = bookPage(BK, k); if (!P || !d) continue; await show(k); await wait(600);
          for (const b of [...c.querySelectorAll('.dsays .listen:not(.none)')]) { if (!alive || n !== k) return; any = (await play(b.dataset.clip, b)) || any; await wait(350); } }
        if (!any && alive) { snd.nope(); toast('No voice in your book yet. Play a page first!', '아직 목소리가 없어요. 먼저 한 쪽을 해 봐요!'); } } };
    show(at == null ? -1 : at); gerry('This is your Discussion Book! Turn the pages and hear yourself.', '디스커션 북이에요! 쪽을 넘기고 내 목소리를 들어 봐요.', 'point');
  }
  /* ---------- My Mission Log: the month's report, one CARD a week (the look the user chose, 24 Nov 2026) ----------
     Boss: a monthly report with weekly progress: how many times opened, which parts were done and how often.
     She then asked for as much detail as Start PBL's log, but not its look ("i did not say to make the same style log").
     Top: days played, pages finished, speaking stars, recordings saved. Each week's card: the days it was played and the
     last one, the Video, each of the 8 pages and the Discussion Book with "x times played", the speaking stars out of the
     most possible, and Hear = that week's own recordings one after another.
     Times and days come from the kids' site's shared counter (GPTrack, on this device: names w<week>video, w<week>p<page>,
     w<week>book); what is finished, the stars and the recordings come from this world's own save. No part is called a game. */
  async function missionLog(month) {
    const BK = BOOKS[month]; if (!BK) return toast('This month\'s Mission Log is coming soon.', '이 달의 미션 기록은 곧 나와요.');
    const c = $('#card'), D = window.GPTrack ? GPTrack.days() : {}, WK = BK.weeks, MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const keys = await VDB.keys(), allDays = Object.keys(D).filter(k => D[k].fm).sort(); let audio = null, tok = 0;
    const rows = WK.map((W, w) => { const P = WEEKS[W.key], pd = (S.pgd || {})[W.key] || {}, pre = 'w' + (w + 1), plays = {}, days = [];
      for (const k of allDays) { const A = D[k].fm.a || {}; let any = false; for (const n in A) if (n.startsWith(pre) && A[n].p) { plays[n.slice(pre.length)] = (plays[n.slice(pre.length)] || 0) + A[n].p; any = true; } if (any) days.push(k); }
      const clips = P ? P.flatMap((pg, i) => pg.says.map((_, k) => `${W.key}-${i}-${'ab'[k]}`)) : [], got = clips.reduce((n, k) => n + ((S.say || {})[k] || 0), 0), last = days[days.length - 1];
      return { W, w, P, pd, plays, days, clips, got, max: clips.length * 3, mine: clips.filter(k => keys.includes(k)), done: P ? P.filter((_, i) => pd[i]).length : 0, last: last ? +last.slice(8) + ' ' + MON[+last.slice(5, 7) - 1] : '' }; });
    const fin = rows.reduce((n, r) => n + r.done, 0), tot = WK.length * 8, stars = rows.reduce((n, r) => n + r.got, 0), x = n => n ? '× ' + n : '–';
    c.innerHTML = `<div class="mlog"><button class="pill dback"><span>←</span><span class="l">Planet<small>행성으로</small></span></button>
      <h2 class="dtitle">My Mission Log<small>${BK.name} · 미션 기록</small></h2>
      <div class="msum"><div><b>${allDays.length}</b>days played</div><div><b>${fin} of ${tot}</b>pages finished</div><div><b>${stars}</b>speaking stars</div><div><b>${keys.length}</b>recordings saved</div></div>
      <div class="mweeks">${rows.map(r => `<div class="mwk${r.P ? '' : ' soon'}" style="animation-delay:${.08 * r.w}s"><h3>Week ${r.w + 1}<em class="${r.done === 8 ? 'ok' : ''}">${r.done === 8 ? 'done' : r.P ? (r.done ? r.done + ' of 8' : 'not yet') : 'coming soon'}</em></h3><div class="t">${r.W.t}</div>
        <div class="mdays"><span class="rk">${[0, 1, 2, 3, 4, 5, 6].map(i => `<img src="art/rocket.png" class="${i < r.days.length ? 'on' : ''}" alt="">`).join('')}</span><span>${r.days.length ? `<b>${r.days.length} ${r.days.length > 1 ? 'days' : 'day'}</b> · last ${r.last}` : 'no days yet'}</span></div>
        <div class="mact${r.plays.video ? '' : ' z'}"><img src="art/ic-video.png" alt=""><span>Video</span><b>${x(r.plays.video)}</b></div>
        <div class="mpg"><span class="ml"><img src="art/ic-game.png" alt="">Pages</span><div class="mgrid">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<span class="${r.pd[i] ? 'on' : r.plays['p' + (i + 1)] ? 'try' : ''}"><i>${i + 1}</i><em>${r.plays['p' + (i + 1)] ? '×' + r.plays['p' + (i + 1)] : ''}</em></span>`).join('')}</div></div>
        <div class="mact${r.plays.book ? '' : ' z'}"><img src="art/book.png" alt=""><span>Discussion Book</span><b>${x(r.plays.book)}</b></div>
        <div class="mfoot"><span class="mstar"><i></i><b>${r.got}</b><small>/ ${r.max || '–'}</small></span><button class="go lhear" data-w="${r.w}"${r.mine.length ? '' : ' disabled'}><span class="tri"></span>Hear</button></div></div>`).join('')}</div></div>`;
    c.hidden = false; snd.pop();
    const stop = () => { tok++; if (audio) { audio.pause(); audio = null; } c.querySelectorAll('.lhear.on').forEach(b => b.classList.remove('on')); };
    c.onclick = async e => { if (e.target.closest('.dback')) { stop(); c.hidden = true; c.onclick = null; c.innerHTML = ''; return; }
      const h = e.target.closest('.lhear'); if (!h || h.disabled) return; if (h.classList.contains('on')) return stop(); stop(); const my = tok; h.classList.add('on');
      for (const k of rows[+h.dataset.w].mine) { const blob = await VDB.get(k); if (my !== tok) return; if (!blob) continue; const u = URL.createObjectURL(blob); audio = new Audio(u);
        await new Promise(r => { audio.onended = audio.onerror = r; audio.play().catch(r); }); URL.revokeObjectURL(u); if (my !== tok) return; await wait(300); }
      if (my === tok) h.classList.remove('on'); };
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
