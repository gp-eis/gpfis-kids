/* Start PBL airship world (test, 20 Nov 2026). Built the Fresh Math way: one stage 820 tall that grows wide,
   cut-outs that move, sounds made in code, bursts on a canvas. The mission inside each plot is a stand-in:
   the real ones are the worksheet pages as screens and end with a speaking turn (shared GPFIS listen/speak piece). */
(() => {
  const $ = s => document.querySelector(s), H = 820, WW = 9400, WH = 5600, KEY = 'spbl.airship';
  const stage = $('#stage'), sea = $('#sea'), fx = $('#fx'), world = $('#world'), cloudsEl = $('#clouds');
  const shipEl = $('#ship'), tilt = $('#ship .tilt'), landBtn = $('#land'), isleEl = $('#isle'), mapEl = $('#map');
  const sc = sea.getContext('2d'), fc = fx.getContext('2d');
  let W = 1180, k = 1, z = 1, zt = 1;   // z = how far the flying view is zoomed (1 = close, .42 = far)
  const TITLES = [
    ['ALL ABOUT ME', '나를 알아가요'], ['MY FRIENDS & ME', '친구와 함께해요'], ['MY FAMILY', '우리 가족'], ['MY NEIGHBORHOOD', '우리 동네와 이웃'],
    ['FROM A SEED TO A PLANT', '씨앗에서 식물로'], ['PLANTS AROUND THE WORLD', '세계의 다양한 식물'], ['THE AMAZING WORLD OF ANIMALS', '동물의 세계'], ['HOW ANIMALS LIVE', '동물은 어떻게 살아갈까요?'],
    ['EXPLORING THE SEVEN CONTINENTS', '세계의 7대륙'], ['DISCOVERING THE FIVE OCEANS', '세계의 5대양'], ['MATERIAL CULTURE', '물질문화'], ['INTANGIBLE CULTURE', '비물질문화'],
    ['OUR BEAUTIFUL EARTH', '아름다운 지구'], ["LET'S SAVE OUR EARTH!", '우리 지구를 지켜요!'], ['EXPLORING OUR WORLD', '우리 세계 탐험하기'], ['AMAZING DISCOVERIES', '놀라운 발견'],
    ['MY AMAZING BODY', '놀라운 우리 몸'], ['HOW MY BODY WORKS', '우리 몸은 어떻게 움직일까요?'], ['MATTER, ENERGY & MOTION', '물질·에너지·운동'], ['EARTH & NATURAL PHENOMENA', '지구와 자연현상'],
    ['GREAT MINDS THAT CHANGED THE WORLD', '세상을 바꾼 위대한 인물들'], ['WAR AND PEACE', '전쟁과 평화'], ['OUR FUTURE WORLD', '우리가 만들어 갈 미래 세계'], ['BEYOND EARTH', '지구를 넘어 우주로']
  ];
  // 24 islands on a winding route: four rows of six, every other row runs back the other way
  const ISL = TITLES.map(([t, ko], i) => {
    const r = Math.floor(i / 6), c = r % 2 ? 5 - i % 6 : i % 6, n = i + 1;
    return { n, t, ko, a: 'm' + n, x: Math.round(1250 + c * 1380 + Math.sin(n * 2.3) * 110), y: Math.round(950 + r * 1250 + Math.cos(n * 1.7) * 210) };
  });
  // the four fenced plots on the island paintings (art/isle1/s0..s4.jpg, shares of 1672 x 941): centre x, y, width
  // Every island has its own paintings, places and walking path. plots = centre x, y, width of each fenced place;
  // node = where the crew can stand (dock, path, one spot beside each place: P0..P3); up = the next stop towards the path's hub;
  // zone = the painted airship to press (left, top, width, height in %). Islands without their own set borrow island 1's for now.
  const ISLES = {
    1: { dir: 'isle1', plots: [[.516, .272, .24], [.771, .45, .24], [.35, .657, .25], [.722, .701, .25]],
      node: { L: [.176, .422], D: [.215, .468], B: [.397, .503], C: [.531, .457], P0: [.658, .324], P1: [.6, .44], P2: [.514, .619], P3: [.547, .735] },
      up: { L: 'D', D: 'B', B: 'C', P0: 'C', P1: 'C', P2: 'C', P3: 'P2' }, zone: [0, 0, 21, 40],
      names: ['My house', 'The playground', 'The party tent', 'The little theatre'] },
    2: { dir: 'isle2', plots: [[.47, .29, .27], [.78, .395, .25], [.305, .71, .28], [.715, .705, .30]],
      node: { L: [.215, .43], D: [.30, .47], A: [.365, .44], P0: [.455, .415], B: [.50, .405], C1: [.635, .375], P1: [.655, .405], H: [.36, .585], G: [.50, .625], P2: [.515, .69], P3: [.54, .765] },
      up: { L: 'D', D: 'A', P0: 'A', B: 'P0', C1: 'B', P1: 'C1', H: 'A', G: 'H', P2: 'G', P3: 'P2' }, zone: [0, 0, 30, 40],
      names: ['The treehouse club', 'The art hut', 'The sharing stand', 'The block tower'] },
    3: { dir: 'isle3', plots: [[.48, .28, .28], [.80, .365, .27], [.31, .71, .29], [.725, .70, .30]],
      node: { L: [.20, .45], D: [.30, .475], A: [.37, .475], Br1: [.455, .50], Br2: [.61, .44], P1: [.66, .45], P0: [.645, .34], M: [.50, .555], P2: [.545, .66], P3: [.545, .76] },
      up: { L: 'D', D: 'A', Br1: 'A', Br2: 'Br1', P1: 'Br2', P0: 'Br2', M: 'A', P2: 'M', P3: 'P2' }, zone: [0, 0, 30, 40],
      names: ['The family home', 'Homes of the world', 'The helping house', "Grandma and Grandpa's"] }
  };
  let ISLE = ISLES[1], PLOTS = ISLE.plots;

  if (/[?&]reset/.test(location.search)) { localStorage.removeItem(KEY); localStorage.removeItem('spbl.pages'); }
  let S = { v: 2, stars: 0, built: {}, x: 600, y: 900 };
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o.v === 2) Object.assign(S, o); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const built = n => S.built[n] || [], done = n => built(n).length >= 4, open = n => n === 1 || done(n - 1);

  // ---------- fitting ----------
  function fit() {
    k = innerHeight / H; W = Math.max(1180, Math.min(2100, innerWidth / k));
    stage.style.width = W + 'px';
    stage.style.transform = `translate(${(innerWidth - W * k) / 2}px,0) scale(${k})`;
    for (const c of [sea, fx]) { c.width = W; c.height = H; }
    layIsle(); if (mapEl.classList.contains('on')) drawMap();
  }
  const pt = e => ({ x: (e.clientX - (innerWidth - W * k) / 2) / k, y: e.clientY / k });
  addEventListener('resize', fit);

  // ---------- sounds (made in code) ----------
  let ac;
  function tone(f, d = .15, type = 'sine', v = .15, f2) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
    } catch (e) {}
  }
  const snd = {
    pop: () => tone(520, .12, 'triangle', .2, 880), boing: () => tone(180, .25, 'sine', .25, 520),
    nope: () => tone(220, .2, 'sawtooth', .07, 150), whoosh: () => tone(320, .45, 'sine', .07, 90),
    ding: (i = 0) => tone(660 * Math.pow(1.06, i % 12), .25, 'triangle', .2),
    win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .3, 'triangle', .2), i * 110)),
    splash: () => tone(900, .4, 'sine', .12, 110), poof: () => tone(700, .3, 'sine', .14, 240),
    rattle: () => [0, 70, 140].forEach(d => setTimeout(() => tone(160, .06, 'square', .08, 120), d)),
    rain: () => [0, 60, 130, 210].forEach((d, i) => setTimeout(() => tone(1500 - i * 150, .08, 'sine', .07), d)),
    gull: () => { tone(1200, .12, 'square', .04, 800); setTimeout(() => tone(1300, .16, 'square', .04, 700), 140); }
  };

  // ---------- bursts ----------
  const P = [];
  const COL = ['#ffc533', '#ff6b4a', '#4ac6ff', '#7be07b', '#fff', '#ff8ad1'];
  function burst(x, y, n = 14, pow = 260, inWorld = false, col) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, v = pow * (.4 + Math.random() * .8);
      P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - pow * .4, g: 620, life: 0, max: .6 + Math.random() * .5, s: 6 + Math.random() * 9, c: col || COL[i % COL.length], star: !col && i % 2 === 0, r: Math.random() * 6, vr: (Math.random() - .5) * 10, w: inWorld });
    }
  }
  function puff(x, y, s = 10, inWorld = true) { P.push({ x, y, vx: (Math.random() - .5) * 30, vy: -10 - Math.random() * 20, g: 0, life: 0, max: 1.1, s, c: '#fff', puff: true, w: inWorld }); }
  function rain(x, y, w) { for (let i = 0; i < 16; i++) P.push({ x: x + (Math.random() - .5) * w, y, vx: 0, vy: 80 + Math.random() * 120, g: 700, life: 0, max: .8, s: 7, c: '#bfeaff', w: false }); }
  function drawP(dt) {
    fc.clearRect(0, 0, W, H);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.life += dt; if (p.life > p.max) { P.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += (p.vr || 0) * dt;
      const a = 1 - p.life / p.max, X = p.w ? (p.x - cam.x) * z : p.x, Y = p.w ? (p.y - cam.y) * z : p.y;
      fc.globalAlpha = p.puff ? a * .6 : a; fc.fillStyle = p.c;
      if (p.puff) { fc.beginPath(); fc.arc(X, Y, p.s + p.life * 26, 0, 6.283); fc.fill(); }
      else if (p.star) { fc.save(); fc.translate(X, Y); fc.rotate(p.r); fc.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? p.s * .45 : p.s; fc.lineTo(Math.cos(j * .628) * rr, Math.sin(j * .628) * rr); } fc.fill(); fc.restore(); }
      else { fc.beginPath(); fc.arc(X, Y, p.s * .5, 0, 6.283); fc.fill(); }
    }
    fc.globalAlpha = 1;
  }

  // ---------- little helpers ----------
  const again = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
  // every message is SAID by Gerry or Penny in a speech bubble (crew.js); the plain pill only shows if they are busy with a more important line
  function toast(html) {
    const m = html.match(/^([\s\S]*?)(?:<small>([\s\S]*?)<\/small>)?$/), en = m[1].replace(/<[^>]+>/g, '').trim();
    Crew.say(en.replace(/★/g, 'stars').replace(/·/g, ','), { show: en, ko: m[2] }).then(ok => { if (ok === false) { const t = $('#toast'); t.innerHTML = html; again(t, 'on'); } });
  }
  const low = s => s.charAt(0).toLowerCase() + s.slice(1), chat = (a, level = 1) => Crew.say(Array.isArray(a) ? Crew.pick(a) : a, { level });
  let chatT = 0; const maybe = a => { if (performance.now() - chatT > 14000) { chatT = performance.now(); chat(a, 0); } };
  function addStars(n) { S.stars += n; $('#stars span').textContent = S.stars; again($('#stars'), 'bump'); save(); }
  const mk = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; (parent || world).appendChild(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  // a star that flies from where something was caught up to the counter
  function flyStar(x, y, n) {
    const e = mk('img', 'flystar', stage); e.src = 'art/star.png'; e.style.left = x + 'px'; e.style.top = y + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => { e.style.left = W - 90 + 'px'; e.style.top = '40px'; e.style.width = '34px'; }));
    setTimeout(() => { e.remove(); addStars(n); }, 650);
  }
  const tapPt = ev => pt(ev);

  // ---------- the world: islands, little clouds to catch, crates, gulls, big clouds ----------
  for (const I of ISL) {
    const e = I.el = mk('div', 'isl');
    e.style.left = I.x + 'px'; e.style.top = I.y + 'px';
    e.innerHTML = `<img class="land" src="art/${I.a}.png" alt=""><div class="flag"></div>` +
      [[-40, 30, 300, 1], [200, 90, 260, 3], [80, 170, 330, 2]].map(([l, t, w, c], j) => `<img class="fog" src="art/cloud${c}.png" style="left:${l}px;top:${t}px;width:${w}px;--bx:${(j - 1) * 260}px" alt="">`).join('') +
      `<div class="tag"><i>${I.n}</i>${I.t}<em></em></div>`;
    e.addEventListener('pointerdown', ev => { ev.stopPropagation(); if (busy || mode !== 'fly') return; goTo(I.x, I.y - 150); again(e, 'hop'); burst(I.x, I.y - 60, 10, 220, true); });
  }
  function goTo(x, y) { auto = { x, y }; ptr.down = false; snd.pop(); hintOff(); }
  function refresh() {
    for (const I of ISL) {
      I.el.classList.toggle('locked', !open(I.n)); I.el.classList.toggle('done', done(I.n));
      I.el.querySelector('em').textContent = open(I.n) ? built(I.n).length + '/4' : '?';
    }
    $('#stars span').textContent = S.stars;
  }
  const puffs = [], crates = [], gulls = [], clouds = [];
  function newPuff(s) {
    for (let tries = 0; tries < 20; tries++) { s.x = rnd(300, WW - 300); s.y = rnd(300, WH - 300); if (ISL.every(I => Math.hypot(I.x - s.x, I.y - 100 - s.y) > 360)) break; }
    s.el.style.left = s.x + 'px'; s.el.style.top = s.y + 'px'; s.el.classList.remove('got'); s.el.style.animationDelay = -Math.random() * 2 + 's'; s.on = true;
  }
  for (let i = 0; i < 90; i++) {
    const s = { el: mk('img', 'puff') }; s.el.src = `art/cloud${1 + i % 3}.png`; newPuff(s); puffs.push(s);
    s.el.addEventListener('pointerdown', ev => { ev.stopPropagation(); if (mode !== 'fly' || busy) return; goTo(s.x, s.y + 30); again(s.el, 'tap'); });
  }
  function newCrate(c) { c.x = rnd(400, WW - 400); c.y = rnd(-200, WH - 900); c.end = c.y + 1100; c.on = true; c.el.style.opacity = 1; }
  for (let i = 0; i < 12; i++) {
    const c = { el: mk('div', 'crate', null, '<img src="art/crate.png" alt="">') }; newCrate(c); c.y += i * 90; crates.push(c);
    c.el.addEventListener('pointerdown', ev => { ev.stopPropagation(); if (mode !== 'fly' || busy || !c.on) return; snd.rattle(); again(c.el, 'tap'); const p = tapPt(ev); burst(p.x, p.y, 8, 200); goTo(c.x, c.y + 120); });
  }
  const GF = [['gull1', 131, .6, .73], ['gull2', 160, .56, .45], ['gull3', 127, .56, .25]];   // file, width, body x, body y
  for (let i = 0; i < 14; i++) {
    const g = { el: mk('div', 'gull', null, '<b>' + GF.map(([f, w, bx, by]) => `<img src="art/${f}.png" style="width:${w}px;translate:${-bx * 100}% ${-by * 100}%" alt="">`).join('') + '</b>'), x: rnd(0, WW), y: rnd(200, WH - 200), v: rnd(70, 130), cool: 0, ph: Math.random() * 4 };
    g.im = [...g.el.querySelectorAll('img')]; gulls.push(g);
    g.el.addEventListener('pointerdown', ev => { ev.stopPropagation(); gullTrick(g); const p = tapPt(ev); burst(p.x, p.y, 10, 200, false, '#fff'); });
  }
  function gullTrick(g) { g.cool = 4; snd.gull(); maybe(['Hello, bird!', 'Look, it did a loop!', 'Wow, what a trick!']); again(g.el.firstChild, 'loop'); g.fast = 1.2; }
  for (let i = 0; i < 44; i++) {
    const c = { el: mk('img', '', cloudsEl), x: rnd(0, WW * 1.3), y: rnd(-100, WH * 1.3), v: rnd(6, 16), w: rnd(280, 520) }; c.el.src = `art/cloud${1 + i % 3}.png`; c.el.style.width = c.w + 'px'; clouds.push(c);
    c.el.addEventListener('pointerdown', ev => { ev.stopPropagation(); const p = tapPt(ev); snd.boing(); setTimeout(snd.rain, 150); again(c.el, 'squish'); rain(p.x, p.y + 30, c.w * .5); for (let j = 0; j < 5; j++) puff(p.x + rnd(-60, 60), p.y + rnd(-30, 30), 14, false); });
  }

  // ---------- flying ----------
  let mode = 'fly', busy = false, auto = null, near = null, collected = 0, lastT = 0, T = 0, thrust = 0;
  const ship = { x: S.x, y: S.y, vx: 0, vy: 0, face: 1 }, cam = { x: 0, y: 0 }, keys = {}, ptr = { down: false, x: 0, y: 0 };
  let hinted = false; function hintOff() { if (!hinted) { hinted = true; $('#hint').classList.add('off'); } }
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || e.target.closest('#map')) return;
    const p = pt(e); burst(p.x, p.y, 5, 120);
    if (mode !== 'fly' || busy) return;
    ptr.down = true; ptr.x = p.x; ptr.y = p.y; auto = null; snd.whoosh(); hintOff();
    try { stage.setPointerCapture(e.pointerId); } catch (er) {}
  });
  stage.addEventListener('pointermove', e => { if (ptr.down) { const p = pt(e); ptr.x = p.x; ptr.y = p.y; } });
  const up = () => { ptr.down = false; }; stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  addEventListener('keydown', e => {
    keys[e.key] = true;
    if (/^Arrow|^[wasd]$/i.test(e.key)) { auto = null; hintOff(); e.preventDefault(); }
    if ((e.key === ' ' || e.key === 'Enter') && mode === 'fly' && near) { e.preventDefault(); land(); }
    if (/^m$/i.test(e.key) && mode === 'fly') toggleMap();
    if (e.key === 'Escape') toggleMap(false);
    if (e.key === '-' || e.key === '_') zoom(.77); if (e.key === '+' || e.key === '=') zoom(1.3);
  });
  addEventListener('keyup', e => { keys[e.key] = false; });
  addEventListener('blur', () => { for (const q in keys) keys[q] = false; ptr.down = false; });

  function zoom(f) { if (mode !== 'fly') return; const o = zt; zt = Math.max(.42, Math.min(1, zt * f)); if (o !== zt) snd.pop(); hintOff(); }
  stage.addEventListener('wheel', e => { e.preventDefault(); if (!mapEl.classList.contains('on')) zoom(e.deltaY > 0 ? .86 : 1.16); }, { passive: false });
  $('#zin').addEventListener('click', () => zoom(1.3)); $('#zout').addEventListener('click', () => zoom(.77));
  function steer(dt) {
    let dx = 0, dy = 0, th = 0;
    if (keys.ArrowLeft || keys.a || keys.A) dx -= 1; if (keys.ArrowRight || keys.d || keys.D) dx += 1;
    if (keys.ArrowUp || keys.w || keys.W) dy -= 1; if (keys.ArrowDown || keys.s || keys.S) dy += 1;
    if (dx || dy) { const l = Math.hypot(dx, dy); dx /= l; dy /= l; th = 1; }
    else if (ptr.down) { const tx = ptr.x - (ship.x - cam.x) * z, ty = ptr.y - (ship.y - cam.y) * z, l = Math.hypot(tx, ty); if (l > 50) { dx = tx / l; dy = ty / l; th = Math.min(1, l / 260); } }
    else if (auto) { const tx = auto.x - ship.x, ty = auto.y - ship.y, l = Math.hypot(tx, ty); if (l < 26) auto = null; else { dx = tx / l; dy = ty / l; th = Math.min(1.5, l / 320); } }
    thrust += (Math.min(1, th) - thrust) * Math.min(1, dt * 6);
    ship.vx += dx * th * 950 * dt; ship.vy += dy * th * 950 * dt;
    const drag = Math.exp(-1.7 * dt); ship.vx *= drag; ship.vy *= drag;
    ship.x = Math.max(260, Math.min(WW - 260, ship.x + ship.vx * dt)); ship.y = Math.max(260, Math.min(WH - 200, ship.y + ship.vy * dt));
    if (Math.abs(ship.vx) > 40) ship.face = ship.vx > 0 ? 1 : -1;
    if (th > .3 && Math.random() < dt * 14) puff(ship.x - ship.face * 215, ship.y + 20);
  }
  function things(dt) {
    const sx = ship.x, sy = ship.y - 30;
    for (const s of puffs) if (s.on && Math.hypot(s.x - sx, s.y - sy) < 140) {
      s.on = false; s.el.classList.add('got'); snd.poof(); snd.ding(collected++); for (let j = 0; j < 6; j++) puff(s.x + rnd(-40, 40), s.y + rnd(-25, 25), 12);
      flyStar((s.x - cam.x) * z, (s.y - cam.y) * z, 1); crewJump(); maybe(['Got it!', 'Yay, a cloud!', 'Nice catch!', 'One more star!', 'So fluffy!']);
      setTimeout(() => newPuff(s), 15000);
    }
    for (const c of crates) {
      c.y += 46 * dt; c.x += Math.sin(T + c.end) * 14 * dt;
      if (c.on && Math.hypot(c.x - sx, c.y - sy) < 150) { c.on = false; c.el.style.opacity = 0; snd.win(); burst(c.x, c.y, 30, 380, true); flyStar((c.x - cam.x) * z, (c.y - cam.y) * z, 3); crewJump(); toast('Treasure! Three stars! <small>보물!</small>'); setTimeout(() => newCrate(c), 6000); }
      if (c.y > c.end) newCrate(c);
      c.el.style.transform = `translate(${c.x}px,${c.y}px)`;
    }
    for (const g of gulls) {
      g.fast = Math.max(0, (g.fast || 0) - dt);
      g.x += g.v * (g.fast ? 2.2 : 1) * dt; if (g.x > WW + 200) { g.x = -200; g.y = rnd(200, WH - 200); }
      g.cool -= dt;
      if (g.cool < 0 && Math.hypot(g.x - sx, g.y - sy) < 230) gullTrick(g);
      g.ph += dt * (g.fast ? 16 : 9); const f = [0, 1, 2, 1][Math.floor(g.ph) % 4];   // wings up, level, down, level
      if (f !== g.f) { g.f = f; g.im.forEach((im, j) => { im.style.opacity = j === f ? 1 : 0; }); }
      g.el.style.transform = `translate(${g.x}px,${g.y + Math.sin(T * 2 + g.v) * 18 + (f - 1) * -5}px)`;
    }
    for (const c of clouds) { c.x += c.v * dt; if (c.x > WW * 1.3 + 300) c.x = -600; c.el.style.left = c.x + 'px'; c.el.style.top = c.y + 'px'; }
    // which island is under us
    let best = null, bd = 300;
    for (const I of ISL) { const d = Math.hypot(I.x - ship.x, I.y - 150 - ship.y); if (d < bd) { bd = d; best = I; } }
    if (best !== near) {
      if (near) near.el.classList.remove('near');
      near = best;
      if (near) { near.el.classList.add('near'); landBtn.classList.toggle('locked', !open(near.n)); landBtn.innerHTML = open(near.n) ? '⚓ Land here! <small>착륙!</small>' : '☁ Still hidden <small>아직 안 보여요</small>'; snd.pop(); chat(open(near.n) ? [`Island ${near.n}! Let's land!`, `Look! ${near.t}. Press Land!`] : ['That island is still hidden.']); }
      landBtn.classList.toggle('on', !!near);
    }
    // compass to the next island
    const next = ISL.find(I => open(I.n) && !done(I.n)), cp = $('#compass');
    if (next) { cp.querySelector('b').style.transform = `rotate(${Math.atan2(next.y - 150 - ship.y, next.x - ship.x)}rad)`; cp.querySelector('span').textContent = `Island ${next.n}`; }
    else cp.querySelector('span').textContent = 'All islands done!';
  }
  let jumpT = 0;
  const shipCrew = [Crew.add($('#ship .crew.g'), 'gerry'), Crew.add($('#ship .crew.p'), 'penny')];   // whole-body pose pictures (crew.js)
  function crewJump() { if (T - jumpT < .4) return; jumpT = T; for (const c of shipEl.querySelectorAll('.crew')) again(c, 'jump'); shipCrew.forEach(c => c.pose('cheer', 650)); }

  // ---------- the sea ----------
  const hash = (a, b) => { const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); };
  function drawSea() {
    const g = sc.createLinearGradient(0, 0, 0, H), d = cam.y / WH;
    g.addColorStop(0, `hsl(${200 + d * 8},82%,${52 - d * 8}%)`); g.addColorStop(1, `hsl(${206 + d * 8},84%,${43 - d * 8}%)`);
    sc.fillStyle = g; sc.fillRect(0, 0, W, H);
    const vw = W / z, vh = H / z; sc.save(); sc.scale(z, z);
    for (const I of ISL) {                       // shallows and foam round each island
      const x = I.x - cam.x, y = I.y + 105 - cam.y; if (x < -500 || x > vw + 500 || y < -300 || y > vh + 300) continue;
      sc.fillStyle = 'rgba(120,235,225,.35)'; sc.beginPath(); sc.ellipse(x, y, 330, 120, 0, 0, 6.283); sc.fill();
      sc.fillStyle = 'rgba(160,245,235,.4)'; sc.beginPath(); sc.ellipse(x, y, 285, 98, 0, 0, 6.283); sc.fill();
      for (let j = 0; j < 2; j++) { const ph = (T * .35 + j * .5) % 1; sc.strokeStyle = `rgba(255,255,255,${.7 * (1 - ph)})`; sc.lineWidth = 5; sc.beginPath(); sc.ellipse(x, y, 262 + ph * 70, 88 + ph * 28, 0, 0, 6.283); sc.stroke(); }
    }
    sc.lineCap = 'round'; sc.lineWidth = 4;      // little waves that stay where they are on the sea
    const C = 150, x0 = Math.floor(cam.x / C) - 1, y0 = Math.floor(cam.y / C) - 1;
    for (let gy = y0; gy < y0 + vh / C + 3; gy++) for (let gx = x0; gx < x0 + vw / C + 3; gx++) {
      const r1 = hash(gx, gy), r2 = hash(gy, gx + 9), r3 = hash(gx + 3, gy + 7);
      const x = (gx + r1) * C - cam.x + Math.sin(T * .8 + r3 * 6) * 10, y = (gy + r2) * C - cam.y, l = 16 + r3 * 26;
      sc.strokeStyle = `rgba(255,255,255,${.16 + .2 * Math.sin(T * 1.6 + r1 * 6.283)})`;
      sc.beginPath(); sc.moveTo(x - l, y); sc.quadraticCurveTo(x - l / 2, y - 9, x, y); sc.quadraticCurveTo(x + l / 2, y + 9, x + l, y); sc.stroke();
    }
    if (mode === 'fly') {                        // the airship's shadow on the water
      sc.fillStyle = 'rgba(0,35,80,.22)'; sc.beginPath(); sc.ellipse(ship.x - cam.x + 30, ship.y - cam.y + 250, 150 * drop, 34 * drop, 0, 0, 6.283); sc.fill();
    }
    sc.restore();
  }
  let drop = 1;   // 1 = flying high, grows as the ship comes down to land

  function frame(now) {
    const dt = Math.min(.05, (now - lastT) / 1000 || 0); lastT = now; T += dt;
    if (mode === 'fly') {
      if (!busy) steer(dt);
      things(dt);
      const z0 = z; z += (zt - z) * Math.min(1, dt * 7);
      const vw = W / z, vh = H / z, tx = ship.x - vw / 2 + ship.vx * .22, ty = ship.y - vh * .475 + ship.vy * .22, e = z0 !== z ? 1 : Math.min(1, dt * 4);
      cam.x += (Math.max(0, Math.min(WW - vw, tx)) - cam.x) * e; cam.y += (Math.max(0, Math.min(WH - vh, ty)) - cam.y) * e;
      world.style.transform = `scale(${z}) translate(${-cam.x}px,${-cam.y}px)`;
      cloudsEl.style.transform = `scale(${z}) translate(${-cam.x * 1.3}px,${-cam.y * 1.3}px)`;
      const bob = Math.sin(T * 1.9) * 9, rot = Math.max(-11, Math.min(11, ship.vy / 45)) * ship.face + Math.sin(T * 1.3) * 1.6;
      shipEl.style.transform = `translate(${(ship.x - cam.x) * z}px,${(ship.y - cam.y + bob) * z}px) scale(${(2 - drop) * z})`;
      tilt.style.transform = `scaleX(${ship.face}) rotate(${rot}deg)`;
      tilt.style.setProperty('--sp', (.7 - thrust * .55).toFixed(2) + 's');
      drawSea();
      if (mapEl.classList.contains('on')) placeMe();
    }
    drawP(dt);
    requestAnimationFrame(frame);
  }
  setInterval(() => { S.x = Math.round(ship.x); S.y = Math.round(ship.y); save(); }, 3000);

  // always someone talking: what Gerry or Penny says next when it has been quiet (flying, or standing on an island)
  Crew.idle(() => {
    if (document.body.classList.contains('inroom') || $('#party').classList.contains('on')) return null;
    if (mapEl.classList.contains('on')) return 'Tap an island and we fly there!';
    if (busy) return false;
    if (mode === 'isle' && pic) {
      const nb = built(cur.n).length;
      if (nb >= 4) return Crew.pick(['We built the whole island!', 'Shall we fly to the next island?', 'Press a place to play again!']);
      return Crew.pick([`Press number ${nb + 1}!`, `Let's go to ${low(NAMES[nb])}!`, 'What a pretty island!', `${4 - nb} more to build!`]);
    }
    const nx = ISL.find(I => open(I.n) && !done(I.n));
    if (near) return open(near.n) ? 'Press Land here!' : 'This island is still hidden.';
    return Crew.pick(['Hold and drag to fly!', "Let's catch a cloud!", 'Look at the birds!', 'I love flying!', 'The sea is so blue!', nx ? `Let's find island ${nx.n}!` : 'We visited every island!', 'Open the map if you get lost!', 'Can you see a treasure box?']);
  });

  // ---------- landing ----------
  landBtn.addEventListener('click', land);
  function land() {
    const I = near; if (!I || busy) return;
    if (!open(I.n)) { snd.nope(); again(I.el, 'shake'); toast(`Finish island ${I.n - 1} first! <small>${I.n - 1}번 섬을 먼저 완성해요</small>`); return; }
    busy = true; auto = null; ptr.down = false; landBtn.classList.remove('on'); snd.whoosh();
    const x0 = ship.x, y0 = ship.y, x1 = I.x, y1 = I.y - 120, t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / 900), e = p * p * (3 - 2 * p);
      ship.x = x0 + (x1 - x0) * e; ship.y = y0 + (y1 - y0) * e; ship.vx = ship.vy = 0; drop = 1 + e * .28;
      if (p < 1) return requestAnimationFrame(step);
      snd.splash(); burst(I.x, I.y + 60, 26, 340, true); again(I.el, 'hop');
      setTimeout(() => openIsle(I), 550);
    })(t0);
  }

  // ---------- the map: the whole sea at once ----------
  let ms = 1;
  function drawMap() {
    const mw = Math.min(W - 140, (H - 190) * WW / WH), mh = mw * WH / WW; ms = mw / WW;
    const nx = ISL.find(I => open(I.n) && !done(I.n));
    mapEl.innerHTML = `<div class="sheet" style="width:${mw + 60}px"><h2>World map <small>세계 지도</small><button class="x">✕</button></h2><div class="seabox" style="width:${mw}px;height:${mh}px">` +
      `<svg viewBox="0 0 ${WW} ${WH}"><polyline points="${ISL.map(I => I.x + ',' + I.y).join(' ')}"/></svg>` +
      ISL.map(I => `<div class="mi${open(I.n) ? '' : ' locked'}${done(I.n) ? ' done' : ''}${nx === I ? ' next' : ''}" data-n="${I.n}" style="left:${I.x * ms}px;top:${I.y * ms}px"><img src="art/${I.a}.png" alt=""><i>${I.n}</i></div>`).join('') +
      `<div class="me"><img src="art/ship.png" alt=""><span>You are here <small>여기!</small></span></div></div>` +
      `<p>Tap an island and the airship flies there. <small>섬을 누르면 비행선이 날아가요</small></p></div>`;
    mapEl.querySelector('.x').addEventListener('click', () => toggleMap(false));
    mapEl.querySelectorAll('.mi').forEach(e => e.addEventListener('click', () => {
      const I = ISL[e.dataset.n - 1]; toggleMap(false); goTo(I.x, I.y - 150);
      toast(`Flying to island ${I.n} · ${I.t}`);
    }));
    placeMe();
  }
  function placeMe() { const me = mapEl.querySelector('.me'); if (me) { me.style.left = ship.x * ms + 'px'; me.style.top = ship.y * ms + 'px'; } }
  function toggleMap(on) {
    if (on === undefined) on = !mapEl.classList.contains('on');
    if (on && (mode !== 'fly' || busy)) return;
    if (on === mapEl.classList.contains('on')) return;
    mapEl.classList.toggle('on', on); snd.pop(); ptr.down = false; if (on) { drawMap(); hintOff(); }
  }
  $('#mapbtn').addEventListener('click', () => toggleMap());
  mapEl.addEventListener('pointerdown', e => { if (e.target === mapEl) toggleMap(false); });

  // ---------- on an island ----------
  let cur = null, pic = null, mates = [], mc = [], at = 'L', walking = 0, cp = [.176, .422], face = 1;
  // where the crew can stand, as shares of the island painting: only the dock and the dirt path, never a fence
  let NODE = ISLE.node, UP = ISLE.up, NAMES = ISLE.names;
  function route(a, b) {
    const ca = [a], cb = [b];
    while (UP[ca[ca.length - 1]]) ca.push(UP[ca[ca.length - 1]]);
    while (UP[cb[cb.length - 1]]) cb.push(UP[cb[cb.length - 1]]);
    let i = ca.length - 1, k2 = cb.length - 1;
    while (i > 0 && k2 > 0 && ca[i - 1] === cb[k2 - 1]) { i--; k2--; }
    return ca.slice(0, i + 1).concat(cb.slice(0, k2).reverse());
  }
  function layIsle() {
    if (!pic) return;
    const w = Math.max(W, H * 1672 / 941), h = w * 941 / 1672, l = (W - w) / 2, t = (H - h) / 2;
    pic.style.left = l + 'px'; pic.style.top = t + 'px'; pic.style.width = w + 'px'; pic.style.height = h + 'px';
    pic.querySelectorAll('.plot').forEach((p, i) => {
      const cx = PLOTS[i][0] * w, cy = PLOTS[i][1] * h, d = PLOTS[i][2] * w;
      p.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`;
    });
    putCrew(cp, 0);
  }
  // feet on the ground at p; further up the picture = further away = smaller
  function putCrew(p, dx) {
    const w = parseFloat(pic.style.width), h = parseFloat(pic.style.height), s = .62 + .62 * p[1];
    if (dx > .0005) face = 1; else if (dx < -.0005) face = -1;
    mates.forEach((m, n) => {
      m.style.left = p[0] * w + (n ? 1 : -1) * 46 * s + 'px'; m.style.top = p[1] * h + (n ? 8 : 0) * s + 'px';
      m.style.setProperty('--s', s.toFixed(3));   // never mirrored (the G and P would flip): they have real left and right walking pictures
    });
  }
  function crewTo(dest, then) {
    if (typeof dest === 'number') dest = 'P' + dest;
    const pts = route(at, dest).map(n => NODE[n]), id = ++walking; at = dest;
    let n = 1, last = performance.now();
    if (pts.length < 2) { then && then(); return; }
    mates.forEach(m => m.classList.add('walk'));
    (function step() {   // on a timer, not the screen's frame clock, so the walk always finishes
      const now = performance.now(); if (id !== walking || !pic) return;
      let d = Math.min(.25, Math.max(0, (now - last) / 1000)) * .25, dx = 0; last = now;
      while (d > 0 && n < pts.length) {
        const t = pts[n], ex = t[0] - cp[0], ey = (t[1] - cp[1]) * .56, l = Math.hypot(ex, ey); dx = ex;
        if (l <= d) { cp = t.slice(); d -= l; n++; } else { cp[0] += ex / l * d; cp[1] += ey / l * d / .56; d = 0; }
      }
      putCrew(cp, dx); mc.forEach(c => c.walk(face));
      if (n < pts.length) return setTimeout(step, 16);
      mates.forEach(m => m.classList.remove('walk')); mc.forEach(c => c.stop()); then && then();
    })();
  }
  function openIsle(I) {
    cur = I; mode = 'isle'; busy = false; toggleMap(false); shipEl.classList.add('down'); document.body.classList.add('onisle'); $('#hint').classList.add('off');
    $('#place').innerHTML = `<i>${I.n}</i>${I.t}<small>${I.ko}</small>`;
    // every piece that appears is its own cut-out standing on the painted grass (never a crop of another picture)
    const nb = built(I.n).length;
    ISLE = ISLES[I.n] || ISLES[1]; PLOTS = ISLE.plots; NODE = ISLE.node; UP = ISLE.up; NAMES = ISLE.names;
    const dir = 'art/' + ISLE.dir, zn = ISLE.zone;
    isleEl.innerHTML = `<div class="pic">` + [0, 1, 2, 3, 4].map(s => `<img class="bg st${s <= nb ? ' on' : ''}" src="${dir}/s${s}.jpg" alt="">`).join('') +
      // each building again as its own piece, laid exactly over itself: it can hop, glow and show its name without the island moving
      ((window.ISLE_SPR || {})[ISLE.dir] || []).map((b, i) => `<img class="under" data-i="${i}" src="${dir}/s${i}.jpg" alt="" style="clip-path:ellipse(${b[2] * 50 + 1}% ${b[3] * 50 + 1}% at ${(b[0] + b[2] / 2) * 100}% ${(b[1] + b[3] / 2) * 100}%)"><img class="spr" data-i="${i}" src="${dir}/b${i + 1}.png" alt="" style="left:${b[0] * 100}%;top:${b[1] * 100}%;width:${b[2] * 100}%;height:${b[3] * 100}%">`).join('') +
      PLOTS.map((p, i) => `<div class="plot${i < nb ? ' on' : i > nb ? ' later' : ''}" data-i="${i}"><div class="num">${i + 1}</div><b class="nm">${NAMES[i]}</b></div>`).join('') +
      `<div class="shipzone" title="Back to the airship" style="left:${zn[0]}%;top:${zn[1]}%;width:${zn[2]}%;height:${zn[3]}%"><span>Fly! <small>출발!</small></span></div>` +
      `<div class="mate"><b><img src="art/crew/gerry/stand.webp" alt=""></b></div><div class="mate"><b><img src="art/crew/penny/stand.webp" alt=""></b></div></div>`;
    pic = isleEl.querySelector('.pic'); mates = [...pic.querySelectorAll('.mate')]; mc = mates.map((m, n) => Crew.add(m.querySelector('img'), n ? 'penny' : 'gerry', 1)); at = 'L'; cp = NODE.L.slice(); face = 1; layIsle();
    pic.querySelectorAll('.plot').forEach(p => {
      p.addEventListener('pointerdown', ev => { ev.stopPropagation(); plot(+p.dataset.i, p); });
      p.addEventListener('pointerenter', () => { if (p.classList.contains('on') && !busy) alive(+p.dataset.i, 'hov'); });
      p.addEventListener('pointerleave', () => alive(+p.dataset.i, null));
    });
    pic.querySelector('.shipzone').addEventListener('pointerdown', ev => { ev.stopPropagation(); goShip(false); });
    again(isleEl, 'on'); snd.boing();
    setTimeout(() => { if (pic && !busy) crewTo('D', () => { mc[0].pose('point', 1500); mc[1].pose('wave', 1500); }); }, 600);   // they climb down and step onto the dock
    setTimeout(() => toast(built(I.n).length ? 'Welcome back! <small>다시 왔어요!</small>' : 'Pick a place to go in! <small>가고 싶은 곳을 골라요</small>'), 500);
  }
  const VOICE = [() => { tone(880, .3, 'triangle', .2); setTimeout(() => tone(660, .45, 'triangle', .2), 280); },            // ding-dong
    () => { snd.boing(); setTimeout(snd.whoosh, 180); }, () => tone(300, .5, 'sawtooth', .09, 900), () => snd.win()];
  // bring one building to life: the same pixels lifted off the painting, so only it moves
  let twinkle = 0;
  function alive(i, how) {
    if (!pic) return; const sp = pic.querySelector(`.spr[data-i="${i}"]`), un = pic.querySelector(`.under[data-i="${i}"]`), pl = pic.querySelectorAll('.plot')[i];
    if (!sp) return;
    sp.classList.remove('hov', 'hopb'); pl.classList.toggle('named', !!how); sp.classList.toggle('on', !!how);   // 'under' stays off: nothing moves, so nothing needs hiding
    clearInterval(twinkle); twinkle = 0;
    if (how === 'hov') twinkle = setInterval(() => { if (!pic) return clearInterval(twinkle); const r = pl.getBoundingClientRect(), o = pt({ clientX: r.left + r.width * (.15 + Math.random() * .7), clientY: r.top + r.height * (.05 + Math.random() * .6) }); burst(o.x, o.y, 3, 70); }, 260);
    if (how) { void sp.offsetWidth; sp.classList.add(how); }
  }
  function hopB(i) {
    alive(i, 'hopb'); VOICE[i]();
    const sp = pic.querySelector(`.spr[data-i="${i}"]`), r = sp.getBoundingClientRect(), o = pt({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    burst(o.x, o.y, 22, 340); setTimeout(() => { if (pic) alive(i, null); }, 900);
  }
  function plot(i, el) {
    if (busy) return;
    if (el.classList.contains('on')) { busy = true; hopB(i); chat(`Let's visit ${low(NAMES[i])} again!`); setTimeout(() => crewTo(i, () => goInside(i, el, true)), 650); return; }   // a built place can be visited again
    if (el.classList.contains('later')) { snd.nope(); again(el.querySelector('.num'), 'no'); toast(`Finish place ${built(cur.n).length + 1} first! <small>${built(cur.n).length + 1}번을 먼저 해요</small>`); return; }
    busy = true; snd.pop(); chat([`Let's go to ${low(NAMES[i])}!`, `Come on! ${NAMES[i]}!`]);
    crewTo(i, () => goInside(i, el));
  }
  // they walk in: the view pushes into the plot, then the place opens for the activity
  function goInside(i, el, visit) {
    const w = parseFloat(pic.style.width), h = parseFloat(pic.style.height);
    pic.style.transformOrigin = `${PLOTS[i][0] * w}px ${PLOTS[i][1] * h}px`; pic.classList.add('zoomin'); mates.forEach(m => m.classList.add('in')); snd.whoosh();
    // the room: each thing in it is one worksheet page (room.js). ok = the show and tell is done
    setTimeout(() => Room.open({ month: cur.n, week: i + 1, done: ok => {
      pic.classList.remove('zoomin'); mates.forEach(m => m.classList.remove('in')); snd.whoosh();
      setTimeout(() => { if (ok && !visit) build(i, el); else { busy = false; if (ok) { toast('You did it again! <small>또 해냈어요!</small>'); mates.forEach(m => again(m, 'jump')); mc.forEach(c => c.pose('cheer', 1100)); } } }, 750);
    } }), 650);
  }
  function build(i, el) {
    el.classList.add('on'); snd.win(); setTimeout(snd.boing, 420);
    const nb = built(cur.n).length + 1, nx = pic.querySelectorAll('.plot')[i + 1];
    // the stages are identical except for this plot, so opening the next one in a growing circle makes the building rise out of its plot
    const im = pic.querySelectorAll('img.st')[nb], pw = parseFloat(pic.style.width), ph = parseFloat(pic.style.height), at0 = `${PLOTS[i][0] * pw}px ${PLOTS[i][1] * ph}px`;
    if (im) { im.style.transition = 'none'; im.style.clipPath = `circle(0px at ${at0})`; im.classList.add('on'); void im.offsetWidth; im.style.transition = ''; im.style.clipPath = `circle(${pw * .26}px at ${at0})`; setTimeout(() => { im.style.clipPath = ''; }, 1300); }
    if (nx) nx.classList.remove('later');
    setTimeout(() => { if (pic) { hopB(i); chat([`Wow! Look at ${low(NAMES[i])} now!`, `We built ${low(NAMES[i])}! Five stars!`]); } }, 1350);   // the new building says hello
    const r = el.getBoundingClientRect(), o = pt({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    setTimeout(() => { burst(o.x, o.y, 40, 420); for (let n = 0; n < 8; n++) puff(o.x + rnd(-120, 120), o.y + 50 + rnd(-10, 20), 16, false); }, 400);
    mates.forEach(m => again(m, 'jump')); mc.forEach(c => c.pose('cheer', 1500));
    (S.built[cur.n] = built(cur.n)).push(i); addStars(5); refresh(); busy = false;
    if (done(cur.n)) setTimeout(party, 1700);
  }
  let conf = 0;
  function party() {
    const p = $('#party');
    p.querySelector('h1').innerHTML = `Island ${cur.n} is complete!`;
    p.querySelector('p').innerHTML = `Radio report: tell the airship what you built.<br><small>(the speaking turn comes here) · 섬 완성!</small>`;
    p.querySelector('.go').innerHTML = 'Back to the airship ➤';
    p.classList.add('on'); snd.win(); setTimeout(snd.win, 500);
    conf = setInterval(() => burst(rnd(100, W - 100), rnd(80, 400), 16, 300), 350);
  }
  $('#party .go').addEventListener('click', () => { clearInterval(conf); $('#party').classList.remove('on'); goShip(true); });
  $('#back').addEventListener('click', () => goShip(false));
  // the crew walk back to the ladder and climb up, then the airship takes off
  function goShip(finished) {
    if (mode !== 'isle' || busy || !pic) return;
    busy = true; snd.pop(); chat(['Back to the airship!', 'All aboard!', "Let's fly!"]);
    crewTo('L', () => { mates.forEach(m => m.classList.add('climb')); snd.boing(); setTimeout(() => { busy = false; leave(finished); }, 600); });
  }
  function leave(finished) {
    if (mode !== 'isle') return;
    mode = 'fly'; isleEl.classList.remove('on'); pic = null; shipEl.classList.remove('down'); drop = 1; near = null; landBtn.classList.remove('on');
    document.body.classList.remove('onisle'); snd.whoosh(); refresh();
    const nx = ISL.find(I => open(I.n) && !done(I.n));
    if (finished && nx) { setTimeout(() => { toast(`Island ${nx.n} has appeared! <small>새 섬이 나타났어요</small>`); snd.ding(4); }, 700); auto = { x: nx.x, y: nx.y - 150 }; }
  }

  // ---------- go ----------
  fit(); refresh();
  const h = location.hash;
  if (/still/.test(h)) document.body.classList.add('still');
  const pb = h.match(/part=(\d)/); if (pb) S.built[(h.match(/isle=(\d+)/) || [])[1] || 1] = [0, 1, 2, 3].slice(0, +pb[1]);
  const dn = h.match(/done=(\d+)/); if (dn) for (let n = 1; n <= +dn[1]; n++) S.built[n] = [0, 1, 2, 3], refresh();
  const sa = h.match(/at=(\d+)/); if (sa) { const I = ISL[sa[1] - 1]; ship.x = I.x - 200; ship.y = I.y - 150; }
  cam.x = Math.max(0, Math.min(WW - W, ship.x - W / 2)); cam.y = Math.max(0, Math.min(WH - H, ship.y - 390));
  const m = h.match(/isle=(\d+)/); if (m) { const I = ISL[m[1] - 1]; ship.x = I.x; ship.y = I.y - 120; openIsle(I); }
  if (/map/.test(h)) setTimeout(() => toggleMap(true), 300);
  const hv = h.match(/hov=(\d)/); if (hv && pic) setTimeout(() => { alive(hv[1] - 1, 'hov'); pic.querySelector(`.spr[data-i="${hv[1] - 1}"]`).style.transform = 'translateY(-26px) scale(1.06)'; }, 900);
  const rr = h.match(/room=(\w*)/); if (rr && pic) setTimeout(() => { Room.open({ month: +((h.match(/isle=(\d+)/) || [])[1] || 1), week: +((h.match(/wk=(\d)/) || [])[1] || 1), done: () => {} }); if (rr[1]) setTimeout(() => { const z = document.querySelector(`.hz[data-id=${rr[1]}]`); z.classList.remove('locked'); z.click(); }, 500); }, 800);
  const gi = h.match(/in=(\d)/); if (gi && pic) setTimeout(() => plot(gi[1] - 1, pic.querySelectorAll('.plot')[gi[1] - 1]), 1200);
  const gs = h.match(/stand=(\d)/); if (gs && pic) setTimeout(() => crewTo(gs[1] - 1), 900);
  const zm = h.match(/zoom=([\d.]+)/); if (zm) z = zt = Math.max(.42, Math.min(1, +zm[1]));
  window.__kit = { snd, burst, puff, pt, toast, again, W: () => W };
  window.__sky = { S, ship, ISL, land, toggleMap, goShip, where: () => at, plot: i => plot(i, pic.querySelectorAll('.plot')[i]), state: () => ({ mode, busy, near: near && near.n, stars: S.stars, built: S.built, map: mapEl.classList.contains('on') }) };
  requestAnimationFrame(frame);
})();
