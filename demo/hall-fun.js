/* Hall of Fame: fun layer (20 Nov 2026), same feel as Story Street and the Fresh Math world.
   Prizes twinkle, everything you touch squashes with a pop, any tap bursts, zooming into a wing whooshes and
   throws confetti, and the room welcomes you with a burst. Stars earned by speaking ('gpfis.stars') show top right. */
(function () {
  const rot = document.getElementById('rot');
  const css = document.createElement('style');
  css.textContent = `#fx{position:absolute;left:0;top:0;pointer-events:none;z-index:2500}
.at.glow{animation:glow .9s ease-out}@keyframes glow{40%{filter:brightness(1.18) drop-shadow(0 0 6px rgba(255,220,120,.9))}}   /* framed pictures stay in their frames: they light up instead of squashing */
.at.boing{animation:boing .6s cubic-bezier(.3,1.7,.45,1)}@keyframes boing{0%{scale:1}25%{scale:1.2 .84}55%{scale:.92 1.1}100%{scale:1}}
#chip{position:fixed;z-index:4000;right:152px;top:30px;height:92px;padding:0 30px 0 18px;border-radius:999px;background:#fff;display:flex;align-items:center;gap:10px;font:700 46px Fredoka;color:#d99a1c;box-shadow:0 9px 0 rgba(0,0,0,.14),0 14px 22px rgba(0,0,0,.16);transform-origin:100% 0}
#chip i{width:58px;height:58px;background:#ffc94a;clip-path:polygon(50% 4%,62% 36%,96% 38%,70% 60%,79% 94%,50% 75%,21% 94%,30% 60%,4% 38%,38% 36%)}`;
  document.head.appendChild(css);
  let muted = false; const sb = document.getElementById('snd'); if (sb) sb.addEventListener('click', () => { muted = !muted; Voice.mute(muted); });
  let AC; const ac = () => AC || (AC = new (window.AudioContext || window.webkitAudioContext)());
  function tone(f0, f1, t, vol = .08, type = 'sine', when = 0) { if (muted) return;
    try { const a = ac(), o = a.createOscillator(), g = a.createGain(), n = a.currentTime + when; o.type = type; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f1, n + t);
      g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(.001, n + t); o.connect(g).connect(a.destination); o.start(n); o.stop(n + t + .02); } catch (e) {} }
  const snd = { pop: () => tone(420, 880, .12, .06), boing: () => tone(180, 520, .22, .08, 'triangle'), whoosh: () => tone(220, 900, .5, .04, 'sawtooth'),
    tada: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, .3, .08, 'triangle', i * .1)) };

  const cv = document.createElement('canvas'); cv.id = 'fx'; rot.appendChild(cv); const c = cv.getContext('2d');
  const size = () => { cv.width = Turn.W; cv.height = Turn.H; }; addEventListener('resize', size); size();
  const COLS = ['#ffc94a', '#fff', '#ff8fa0', '#7be3ff', '#b7f27a', '#ffe27a'];
  let parts = [], tw = [], last = performance.now();
  const at = (x, y) => Turn.frac({ clientX: x, clientY: y }, rot).map((f, i) => f * (i ? Turn.H : Turn.W));
  function burst(x, y, n = 24, power = 9, star = true) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = power * (.35 + Math.random() * .75);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * .25, g: .26, life: 1, d: .013 + Math.random() * .014, r: 5 + Math.random() * 9, c: COLS[i % COLS.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, star }); } }
  const burstEl = (el, n, p) => { const r = el.getBoundingClientRect(); const [x, y] = at(r.left + r.width / 2, r.top + r.height / 2); burst(x, y, n, p); };
  function star4(x, y, r, a) { c.beginPath(); for (let i = 0; i < 8; i++) { const q = i % 2 ? r * .22 : r, t = i * Math.PI / 4; c.lineTo(x + Math.cos(t) * q, y + Math.sin(t) * q); } c.closePath(); c.globalAlpha = a; c.fill(); }
  function starPath(x, y, r, rot) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, q = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
  const shiny = () => [...document.querySelectorAll('#items .at:not(.ghost):not(.off)')].filter(e => e.offsetWidth);
  function frame(now) {
    const dt = Math.min(2.5, (now - last) / 16.7); last = now; c.clearRect(0, 0, cv.width, cv.height);
    if (Math.random() < .08 * dt) { const L = shiny(); if (L.length) { const r = L[Math.random() * L.length | 0].getBoundingClientRect();
      const [x, y] = at(r.left + Math.random() * r.width, r.top + Math.random() * r.height * .7); tw.push({ x, y, t: 0, r: 8 + Math.random() * 10 }); } }
    c.fillStyle = '#fff'; c.shadowColor = '#fff6c0'; c.shadowBlur = 12;
    for (const s of tw) { s.t += .03 * dt; star4(s.x, s.y, s.r * (.4 + Math.sin(Math.min(1, s.t) * Math.PI)), Math.sin(Math.min(1, s.t) * Math.PI)); }
    c.shadowBlur = 0; tw = tw.filter(s => s.t < 1);
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= .985; p.rot += p.vr * dt; p.life -= p.d * dt;
      c.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); c.fillStyle = p.c;
      if (p.star) { starPath(p.x, p.y, Math.max(0, p.r * (.5 + p.life * .6)), p.rot); c.fill(); } else { c.beginPath(); c.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, 6.3); c.fill(); } }
    parts = parts.filter(p => p.life > 0 && p.y < cv.height + 40); c.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  rot.addEventListener('pointerdown', e => { const [fx, fy] = Turn.frac(e, rot); burst(fx * Turn.W, fy * Turn.H, 8, 4, false); snd.pop(); }, true);
  /* everything in the room squashes when touched (and on hover with a mouse) */
  const squash = el => { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); };
  document.getElementById('items').addEventListener('pointerover', e => { const a = e.target.closest('.at'); if (!a || a.classList.contains('logo')) return; if (a.matches('.art,.empty')) { a.classList.remove('glow'); void a.offsetWidth; a.classList.add('glow'); snd.pop(); return; } squash(a); snd.boing(); });
  document.getElementById('items').addEventListener('click', e => { const a = e.target.closest('.at'); if (a) burstEl(a, 14, 6); });
  /* zooming into a wing: whoosh + confetti; back out: pop */
  const _zoomTo = zoomTo; zoomTo = k => { snd.whoosh(); _zoomTo(k); chip.style.display = 'none'; setTimeout(() => { snd.tada(); burst(Turn.W * .3, Turn.H * .35, 30, 11); burst(Turn.W * .55, Turn.H * .3, 20, 9); }, 550); };
  const _zoomOut = zoomOut; zoomOut = () => { snd.pop(); _zoomOut(); chip.style.display = ''; };
  /* stars chip */
  let stars = 0; try { stars = +localStorage.getItem('gpfis.stars') || 0; } catch (e) {}
  const chip = document.createElement('div'); chip.id = 'chip'; chip.innerHTML = `<i></i><b>${stars}</b>`; rot.appendChild(chip);
  const sizeUI = () => { const s = Math.max(.55, Math.min(1, Math.min(Turn.W / 1536, Turn.H / 1024) * 1.15)); chip.style.transform = `scale(${s})`; chip.style.right = 24 + 128 * s + 'px'; chip.style.top = 20 + 10 * s + 'px'; size(); };
  addEventListener('resize', () => setTimeout(sizeUI, 0)); sizeUI();
  /* welcome: the room bursts when you walk in */
  setTimeout(() => { burst(Turn.W * .5, Turn.H * .4, 40, 12); snd.tada(); }, 500);
})();
