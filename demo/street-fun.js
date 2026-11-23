/* Story Street: fun layer (20 Nov 2026). The Fresh Math world is the bar for fun (bounce, bursts, sounds, celebrations),
   and every programme must make children SPEAK (age 5+). Loaded after street.html's own script; it wraps
   arrive / goIn / pan from that script.
   - petals drift down, gems / telescope / stars twinkle, any tap bursts
   - signs bob, then squash when Penny walks over; arrival = star burst + chime
   - tap Penny: she hops and says something
   - magic words: every door opens when the child says its magic words (shared speaking kit, kit/talk.js)
   - stars earned by speaking are kept on this device ('gpfis.stars') and shown top right */
(function () {
  const rot = document.getElementById('rot'), $ = id => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `
#fx{position:absolute;left:0;top:0;pointer-events:none;z-index:2500}
.sign{animation:sbob 2.8s ease-in-out infinite}
.sign[data-s=lgr]{animation-delay:-.9s}.sign[data-s=fm]{animation-delay:-1.8s}
@keyframes sbob{50%{translate:0 -5px}}
.boing{animation:boing .6s cubic-bezier(.3,1.7,.45,1),sbob 2.8s ease-in-out .6s infinite!important}
@keyframes boing{0%{scale:1}25%{scale:1.22 .82}55%{scale:.9 1.12}100%{scale:1}}
#penny .body{pointer-events:auto;cursor:pointer}
#mateSw{left:24px;top:150px;width:84px;height:84px;transform-origin:0 0;overflow:hidden;padding:0;box-shadow:0 0 0 6px #fff,0 8px 0 rgba(0,0,0,.18)}#mateSw img{width:100%;height:100%;object-fit:cover}
#chip{position:fixed;z-index:4000;right:152px;top:30px;height:92px;padding:0 30px 0 18px;border-radius:999px;background:#fff;display:flex;align-items:center;gap:10px;font:700 46px Fredoka;color:#d99a1c;box-shadow:0 9px 0 rgba(0,0,0,.14),0 14px 22px rgba(0,0,0,.16);transform-origin:100% 0}
#chip i{width:58px;height:58px;background:#ffc94a;clip-path:polygon(50% 4%,62% 36%,96% 38%,70% 60%,79% 94%,50% 75%,21% 94%,30% 60%,4% 38%,38% 36%)}
#chip.bump{animation:bump .5s cubic-bezier(.3,1.7,.45,1)}@keyframes bump{30%{scale:1.3;rotate:-6deg}}
#door{position:absolute;left:50%;bottom:22px;z-index:3500;display:flex;align-items:center;gap:22px;padding:16px 22px 16px 30px;background:#fffdf6;border-radius:999px;box-shadow:0 10px 0 #ecd9a8,0 18px 36px rgba(60,30,0,.3);transform:translateX(-50%) translateY(160%) scale(.7);transition:transform .45s cubic-bezier(.3,1.6,.5,1);transform-origin:50% 100%}
#door.on{transform:translateX(-50%) translateY(0) scale(var(--k,1))}
#door .ph{display:flex;flex-direction:column;align-items:center;gap:2px}
#door .ph small{font:600 22px Fredoka;color:#a07a2a}
#door .ph b{font:700 44px Fredoka;color:#3b2a57;white-space:nowrap}
#door .ph b span{display:inline-block;padding:0 4px;border-radius:10px;transition:background .2s,translate .2s}
#door .ph b span.hit{background:#d9f7c9;translate:0 -3px}
#door .ph em{font:500 22px Fredoka;color:#6f6390;font-style:normal;min-height:1.2em}
#door button{border:0;cursor:pointer;border-radius:50%;display:grid;place-items:center}
#door .ear{width:76px;height:76px;font-size:38px;background:#fff;box-shadow:0 6px 0 #e3d6ff}
#door .mic{width:120px;height:120px;font-size:58px;color:#fff;background:radial-gradient(circle at 40% 35%,#ff8aa8,#ff3d6e);box-shadow:0 8px 0 #c21d4b,0 0 0 calc(var(--lv,0)*30px) rgba(255,61,110,.25);animation:breathe 1.5s ease-in-out infinite}
#door .mic.live{animation:none;background:radial-gradient(circle at 40% 35%,#ffd36b,#ff9f1a);box-shadow:0 8px 0 #c76f00,0 0 0 calc(var(--lv,0)*36px + 6px) rgba(255,170,30,.3)}
#door .said{display:none;white-space:nowrap;font:700 28px Fredoka;color:#fff;background:#ff3d6e;border-radius:999px!important;padding:18px 28px;box-shadow:0 7px 0 #c21d4b}
#door .st{position:absolute;right:26px;top:-58px;font-size:52px;color:#ffc31a;text-shadow:0 4px 0 #e09300;letter-spacing:4px;opacity:0;scale:.3;transition:scale .45s cubic-bezier(.3,1.7,.45,1),opacity .2s}
#door .st.on{opacity:1;scale:1}#door .st i{font-style:normal;color:#eee3c8;text-shadow:none}
@keyframes breathe{50%{scale:1.07}}
#door .x{position:absolute;right:-10px;top:-10px;width:44px;height:44px;font:700 22px Fredoka;color:#a07a2a;background:#fff;box-shadow:0 3px 0 #ecd9a8}`;
  document.head.appendChild(css);

  /* ---------- sounds, made in code (the sound switch mutes them) ---------- */
  let AC; const ac = () => AC || (AC = new (window.AudioContext || window.webkitAudioContext)());
  function tone(f0, f1, t, vol = .08, type = 'sine', when = 0) {
    if (!sound) return;
    try { const a = ac(), o = a.createOscillator(), g = a.createGain(), n = a.currentTime + when; o.type = type; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f1, n + t);
      g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(.001, n + t); o.connect(g).connect(a.destination); o.start(n); o.stop(n + t + .02); } catch (e) {}
  }
  const snd = { pop: () => tone(420, 880, .12, .06), boing: () => tone(180, 520, .22, .08, 'triangle'), whoosh: () => tone(220, 900, .6, .04, 'sawtooth'),
    ding: () => [784, 1047].forEach((f, i) => tone(f, f, .3, .07, 'triangle', i * .09)), nope: () => tone(300, 220, .18, .05, 'triangle'),
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f * 1.01, .3, .08, 'triangle', i * .1)) };

  /* ---------- effects canvas over the whole window ---------- */
  const cv = document.createElement('canvas'); cv.id = 'fx'; rot.appendChild(cv); const c = cv.getContext('2d');
  const size = () => { cv.width = Turn.W; cv.height = Turn.H; }; addEventListener('resize', size); size();
  const scr = (x, y) => [FIT.ox + x * FIT.s, FIT.top + y * FIT.s];            // stage picture px -> window px
  const COLS = ['#ffc94a', '#fff', '#ff8fa0', '#7be3ff', '#b7f27a', '#ffe27a'];
  let parts = [], last = performance.now();
  function burst(x, y, n = 24, power = 9, star = true) {   // window px
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = power * (.35 + Math.random() * .75);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * .25, g: .26, life: 1, d: .013 + Math.random() * .014, r: 5 + Math.random() * 9, c: COLS[i % COLS.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, star }); }
  }
  const burstAt = (x, y, n, p) => { const [sx, sy] = scr(x, y); burst(sx, sy, n, p); };
  window.burstAt = burstAt;
  /* petals from the blossom trees */
  const petals = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), s: .6 + Math.random() * .8, w: Math.random() * 6.3, v: .5 + Math.random() * .6, r: Math.random() * 6 }));
  /* where the painting has something shiny: crystals, gems, telescope, painted stars, door lights (whole panorama) */
  const SHINE = [[880, 105], [838, 165], [930, 158], [800, 172], [960, 190], [887, 288], [775, 322], [985, 322], [1452, 165], [1412, 462], [1452, 412], [1122, 418],
    [1182, 522], [1258, 452], [1488, 540], [338, 178], [160, 432], [520, 300], [1012, 498], [755, 500],
    [2957, 48], [2957, 120], [2800, 180], [3110, 180], [2955, 560], [2700, 330], [3240, 330]];   // Hall of Fame end: star, dome, trophy, finials
  let tw = [];
  function star4(x, y, r, a) { c.beginPath(); for (let i = 0; i < 8; i++) { const q = i % 2 ? r * .22 : r, t = i * Math.PI / 4; c.lineTo(x + Math.cos(t) * q, y + Math.sin(t) * q); } c.closePath(); c.globalAlpha = a; c.fill(); }
  function starPath(x, y, r, rot) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, q = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
  function frame(now) {
    const dt = Math.min(2.5, (now - last) / 16.7); last = now; const W = cv.width, H = cv.height, k = FIT.s;
    c.clearRect(0, 0, W, H);
    // petals
    for (const p of petals) {
      p.y += .0012 * p.v * dt; p.w += .03 * dt; p.x += Math.sin(p.w) * .0006 * dt + .0003 * dt; p.r += .03 * dt;
      if (p.y > 1.05) { p.y = -.05; p.x = Math.random() * 1.1 - .05; } if (p.x > 1.05) p.x = -.05;
      c.save(); c.translate(p.x * W, p.y * H); c.rotate(p.r); c.scale(1, .55 + .45 * Math.sin(p.w * 1.7));
      c.globalAlpha = .85; c.fillStyle = '#ffc6dc'; c.beginPath(); c.ellipse(0, 0, 9 * p.s * Math.max(.5, k), 6 * p.s * Math.max(.5, k), 0, 0, 6.3); c.fill(); c.restore();
    }
    // twinkles on the shiny things
    if (Math.random() < .12 * dt) { const [x, y] = SHINE[Math.random() * SHINE.length | 0]; tw.push({ x: x + (Math.random() - .5) * 20, y: y + (Math.random() - .5) * 20, t: 0, r: 10 + Math.random() * 12 }); }
    c.fillStyle = '#fff';
    for (const s of tw) { s.t += .03 * dt; const a = Math.sin(Math.min(1, s.t) * Math.PI), [x, y] = scr(s.x, s.y);
      c.shadowColor = '#fff6c0'; c.shadowBlur = 12; star4(x, y, s.r * k * (.4 + a), a); }
    c.shadowBlur = 0; tw = tw.filter(s => s.t < 1);
    // bursts
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= .985; p.rot += p.vr * dt; p.life -= p.d * dt;
      c.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); c.fillStyle = p.c;
      if (p.star) { starPath(p.x, p.y, Math.max(0, p.r * (.5 + p.life * .6)), p.rot); c.fill(); } else { c.beginPath(); c.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, 6.3); c.fill(); } }
    parts = parts.filter(p => p.life > 0 && p.y < H + 40); c.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  rot.addEventListener('pointerdown', e => { const [fx, fy] = Turn.frac(e, rot); burst(fx * Turn.W, fy * Turn.H, 8, 4, false); snd.pop(); });

  /* ---------- signs squash, arrival bursts, scene step whooshes ---------- */
  const signOf = k => document.querySelector(`[data-s="${k}"]`);
  const boing = el => { if (!el) return; el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); };
  document.querySelectorAll('.spot').forEach(el => el.addEventListener('mouseenter', () => { boing(signOf(el.dataset.k)); snd.boing(); }));
  const _arrive = arrive;
  arrive = k => {
    _arrive(k); if (!PLACES[k] || !PLACES[k].say) return;
    const s = signOf(k); boing(s); snd.ding();
    if (s) { const r = s.getBoundingClientRect(), [fx, fy] = Turn.frac({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, rot); burst(fx * Turn.W, fy * Turn.H, 22, 8); }
  };
  const _pan = pan; pan = sc => { if (sc !== SCN) snd.whoosh(); _pan(sc); };

  /* ---------- tap Penny ---------- */
  const wave = () => { P.classList.remove('wave', 'hop'); void P.offsetWidth; P.classList.add('wave'); setTimeout(() => P.classList.remove('wave'), 1600); };

  const LINES = [`Hi! I'm ${MATE.name}!`, 'Hee hee, that tickles!', "Let's speak English!", 'Where shall we go?', 'You are my best friend!'];
  let li = 0;
  P.querySelector('.body').addEventListener('click', e => {
    e.stopPropagation(); wave(); snd.boing();
    const say = LINES[li++ % LINES.length], s = depth(pos.y); bub.textContent = say;
    const side = -1;   /* Penny's bubble always opens to her LEFT: Gerry stands on her right */ bub.classList.toggle('flip', side < 0);
    bub.style.left = vx(pos.x) + side * 120 * s + 'px'; bub.style.top = pos.y - 250 * s + 'px'; bub.classList.add('on'); fixBub(); talk(say);
    burstAt(vx(pos.x), pos.y - 300 * s, 14, 6);
  });

  /* ---------- tap Gerry: he waves and says something in his own voice ---------- */
  const GLINES = ["Hi! I'm Gerry!", "Yay! Let's go!", "Let's give it a try!", 'We can do it together!', 'No problem!'];
  let gi = 0;
  G.querySelector('.body').addEventListener('click', e => {
    e.stopPropagation(); if (!gpos) return; gWaveT = performance.now() + 1500; snd.boing();
    const say = GLINES[gi++ % GLINES.length], s = depth(gpos.y); hush(); bub.textContent = say;
    const side = 1; bub.classList.toggle('flip', side < 0);
    bub.style.left = gpos.x + side * 110 * s + 'px'; bub.style.top = gpos.y - 250 * s + 'px'; bub.classList.add('on');
    gTalking = true; setTimeout(() => { gTalking = false; }, 1300);
    Voice.say(say, { who: 'gerry' });
    burstAt(gpos.x, gpos.y - 300 * s, 14, 6);
  });
  /* ---------- stars earned by speaking ---------- */
  let stars = 0; try { stars = +localStorage.getItem('gpfis.stars') || 0; } catch (e) {}
  const chip = document.createElement('div'); chip.id = 'chip'; chip.innerHTML = `<i></i><b>${stars}</b>`; rot.appendChild(chip);   // inside the turned screen, so it sits by the sound button on phones too
  const addStars = n => { stars += n; try { localStorage.setItem('gpfis.stars', stars); } catch (e) {} chip.querySelector('b').textContent = stars; chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); };
  function sizeUI() { const k = Math.max(.55, Math.min(1, FIT.s)); chip.style.transform = `scale(${k})`; chip.style.right = 24 + 128 * k + 'px'; chip.style.top = 20 + 10 * k + 'px';
    door.style.setProperty('--k', Math.max(.36, Math.min(1, FIT.s * 1.05))); door.style.bottom = FIT.s < .5 ? '3px' : '22px';   /* phones: tucked right at the bottom so it hides less of Penny and Gerry */ size(); }
  addEventListener('resize', () => setTimeout(sizeUI, 0));

  /* ---------- magic words: say them and the door opens ---------- */
  const MAGIC = { hello: 'Hello, Penny and Gerry!', pbl: "I'm ready to make!", lgr: "Let's go, Readers!", fm: 'Three, two, one, blast off!', books: 'Open the book, please!', hall: 'Hall of Fame, here I come!' };
  const door = document.createElement('div'); door.id = 'door';
  door.innerHTML = `<button class="ear" title="Listen">🔊</button><div class="ph"><small>Say the magic words!</small><b></b><em></em></div>
    <button class="mic" title="Press and speak">🎤</button><button class="said">I said it! ✋</button><div class="st"></div><button class="x" title="Close">✕</button>`;
  rot.appendChild(door);
  const mic = door.querySelector('.mic'), said = door.querySelector('.said'), heardEl = door.querySelector('em'), stEl = door.querySelector('.st');
  /* the free browser listener sends the child's voice to the browser maker's servers, so on the public site the microphone stays OFF
     (the child says the words and presses 'I said it!') until the paid scorer and the parents' consent exist. It is on when testing
     on this computer, or with ?mic=1 in the address. */
  const MIC_OK = window.Talk && Talk.canHear && (/^(localhost|127.0.0.1)$/.test(location.hostname) || /[?&]mic=1/.test(location.search));
  if (!MIC_OK) { mic.style.display = 'none'; said.style.display = 'block'; }
  let D = null;   // {k, phrase, tries, done}
  function openDoor(k, done) {
    D = { k, phrase: MAGIC[k], tries: 0, done }; heardEl.textContent = ''; stEl.classList.remove('on');
    door.querySelector('b').innerHTML = D.phrase.split(' ').map(w => `<span>${w}</span>`).join(' ');
    door.classList.add('on'); hush(); if (k === 'hello') { wave(); gWaveT = performance.now() + 1700; }
    const s = depth(pos.y); bub.textContent = 'Say the magic words!'; const side = -1;   /* Penny's bubble always opens to her LEFT: Gerry stands on her right */ bub.classList.toggle('flip', side < 0);
    bub.style.left = vx(pos.x) + side * 120 * s + 'px'; bub.style.top = pos.y - 250 * s + 'px'; bub.classList.add('on'); fixBub();
    talk('Say the magic words! ' + D.phrase);
  }
  function closeDoor() { door.classList.remove('on'); D = null; }
  function opened(n, sc) {
    stEl.innerHTML = '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i>' + (sc != null ? `<small style="font:700 30px Fredoka;color:#3fae49;margin-left:10px">${sc}</small>` : '');
    stEl.classList.add('on'); addStars(n); snd.win(); gThumbT = performance.now() + 2200;   /* Gerry: thumbs up! */ P.classList.remove('hop', 'wave'); void P.offsetWidth; P.classList.add('hop');   // both arms up: hooray!
    const r = mic.getBoundingClientRect(), [fx, fy] = Turn.frac({ clientX: r.left + r.width / 2, clientY: r.top }, rot); burst(fx * Turn.W, fy * Turn.H, 14 + n * 8, 10);
    burstAt(vx(pos.x), pos.y - 200, 30, 11);
    const d = D; bub.textContent = n === 3 ? 'Wonderful!' : 'Yay, it opened!'; talk(bub.textContent);
    setTimeout(() => { closeDoor(); d.done && d.done(); }, 1300);
  }
  async function listenDoor() {
    if (!D || mic.classList.contains('live')) return; Voice.stop();
    mic.classList.add('live'); heardEl.textContent = '…';
    const r = await Talk.listen({ ms: 6000, onLevel: v => mic.style.setProperty('--lv', v), onWords: t => heardEl.textContent = t });
    mic.classList.remove('live'); if (!D) return;
    if (!r.heard.length) { heardEl.textContent = ''; snd.nope(); bub.textContent = "I can't hear you. Louder!"; talk(bub.textContent); return; }
    D.tries++; heardEl.textContent = r.heard[0];
    const sc = Talk.score(D.phrase, r.heard), n = Talk.stars(sc);
    door.querySelectorAll('.ph b span').forEach(w => { const W = Talk.words(w.textContent)[0]; w.classList.toggle('hit', r.heard.some(h => Talk.words(h).some(x => x === W))); });
    if (sc >= 60 || D.tries >= 3) opened(D.tries >= 3 && sc < 60 ? 1 : n, sc);
    else { snd.nope(); bub.textContent = 'Almost! Listen…'; talk('Almost! Listen. ' + D.phrase).then(() => sound && D && Voice.say(D.phrase, { who: 'penny', slow: true })); }
  }
  mic.onclick = e => { e.stopPropagation(); listenDoor(); };
  said.onclick = e => { e.stopPropagation(); if (D) opened(2); };
  door.querySelector('.ear').onclick = e => { e.stopPropagation(); if (D && sound) Voice.say(D.phrase, { who: 'penny', slow: D.tries > 0 }); };
  door.querySelector('.x').onclick = e => { e.stopPropagation(); closeDoor(); bub.classList.remove('on'); };
  door.addEventListener('pointerdown', e => e.stopPropagation());

  /* 23 Nov 2026 (user): no speaking to open anything on Story Street. Doors open at once and Penny does not ask for a hello.
     The panel code stays, switched off, in case the magic words come back. */
  const MAGIC_ON = false;
  const _goIn = goIn;
  if (MAGIC_ON) goIn = k => { if (!MAGIC[k]) return _goIn(k); if (!(D && D.k === k)) openDoor(k, () => _goIn(k)); };
  window.FUN = { openDoor, burstAt, addStars, MAGIC };

  /* hello: once per visit, after Penny walks in, she asks the child to greet her */
  let greeted = false; try { greeted = sessionStorage.getItem('gpfis.hello') === '1'; } catch (e) {}
  if (MAGIC_ON && !greeted && !/scene=hall|pose=|open=/.test(location.hash)) setTimeout(() => { try { sessionStorage.setItem('gpfis.hello', '1'); } catch (e) {}
    const t = setInterval(() => { if (target || D) return; clearInterval(t); openDoor('hello', () => { bub.textContent = 'Where shall we go?'; talk(bub.textContent); }); }, 300); }, 1800);
  sizeUI();
})();
