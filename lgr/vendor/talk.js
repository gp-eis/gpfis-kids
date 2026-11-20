/* GPFIS shared speaking kit — used by Start PBL, Let's Go Readers and Fresh Math.
   An activity only gives: the line, an optional recorded voice clip, and what counts as a good answer.

   Talk.say(text, {clip, slow})      play the model voice (recorded clip if given, else the browser voice for the sample)
   Talk.listen({ms, onLevel, onWords}) open the microphone; resolves {heard:[...alternatives], conf, clip}
   Talk.score(expected, heard)       0–100 closeness of what was said to the line (free stand-in for a real
                                     pronunciation scorer; later swapped for Azure / SpeechSuper behind a small server)
   Talk.stars(score)                 1–3 stars (never 0: trying always earns a star)
   Talk.has(heard, words)            true if every word (or one of its alternatives "seven|7") was said
   Talk.burst(x, y), Talk.ding(), Talk.boop()   celebration pieces (bounce/burst/sound, like the Fresh Math world)

   Sample note: the free browser recognition (Chrome, Edge, Android, newer Safari) only hears WORDS; it cannot judge
   sounds. The score here is how close the words were. Test hook: ?say=text answers every listen with that text. */
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const T = { canHear: !!SR, fake: new URLSearchParams(location.search).get('say') };
  let stream = null, actx = null;

  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const words = s => String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(' ').filter(Boolean)
    .map(w => (/^[0-9]+$/.test(w) && NUM[+w]) || w.replace(/'/g, ''));

  /* ---------- voice ---------- */
  let voice = null;
  const pickVoice = () => {
    const v = speechSynthesis.getVoices().filter(v => /^en(-|_)US/i.test(v.lang));
    voice = v.find(v => /female|zira|aria|jenny|samantha|google us/i.test(v.name)) || v[0] || null;
  };
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  T.say = (text, o = {}) => new Promise(res => {
    if (o.clip) { const a = new Audio(o.clip); a.playbackRate = o.slow ? .75 : 1; a.onended = res; a.onerror = res; a.play().catch(res); return; }
    if (!('speechSynthesis' in window)) return res();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; if (voice) u.voice = voice;
    u.rate = o.slow ? .7 : .95; u.pitch = 1.25; u.onend = res; u.onerror = res;
    speechSynthesis.speak(u); setTimeout(res, 800 + text.length * 120);   // never hang if the voice is silent
  });

  /* ---------- microphone ---------- */
  T.listen = (o = {}) => new Promise(async res => {
    const ms = o.ms || 7000;
    if (T.fake) { let t = 0; const iv = setInterval(() => o.onLevel && o.onLevel(.3 + .5 * Math.abs(Math.sin(t += .5))), 60);
      setTimeout(() => { clearInterval(iv); o.onLevel && o.onLevel(0); o.onWords && o.onWords(T.fake); res({ heard: [T.fake], conf: .9, clip: null }); }, 1200); return; }
    let rec = null, chunks = [], meter = 0, done = false;
    try {   // own recording, so the child can hear themself next to the model voice
      stream = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const an = actx.createAnalyser(); an.fftSize = 256; actx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const tick = () => { if (done) return; an.getByteTimeDomainData(buf); let m = 0; for (const b of buf) m = Math.max(m, Math.abs(b - 128));
        o.onLevel && o.onLevel(Math.min(1, m / 50)); meter = requestAnimationFrame(tick); };
      tick();
      if (window.MediaRecorder) { rec = new MediaRecorder(stream); rec.ondataavailable = e => chunks.push(e.data); rec.start(); }
    } catch (e) { /* no microphone permission: the page shows "Press and say" instead */ }
    const finish = (heard, conf) => {
      if (done) return; done = true; cancelAnimationFrame(meter); o.onLevel && o.onLevel(0);
      const out = clip => res({ heard, conf, clip });
      if (rec && rec.state !== 'inactive') { rec.onstop = () => out(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }))); rec.stop(); } else out(null);
    };
    if (!SR) { setTimeout(() => finish([], 0), 2500); return; }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = !!o.long;
    let alts = [], conf = 0, text = '';
    r.onresult = e => {
      text = ''; for (const x of e.results) text += x[0].transcript + ' ';
      o.onWords && o.onWords(text.trim());
      const last = e.results[e.results.length - 1];
      if (last.isFinal) { alts = [...last].map(a => (o.long ? text : a.transcript)); conf = last[0].confidence || 0; }
    };
    r.onerror = () => {}; r.onend = () => finish(alts.length ? alts : (text ? [text] : []), conf);
    r.start(); setTimeout(() => { try { r.stop(); } catch (e) {} }, ms);
  });

  /* ---------- scoring ---------- */
  const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length]; };
  const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length);
  T.score = (expected, heard) => {
    const E = words(expected); if (!E.length || !heard || !heard.length) return 0;
    let best = 0;
    for (const h of heard) {
      const H = words(h); if (!H.length) continue;
      const each = E.map(w => Math.max(...H.map(x => sim(w, x))));
      const extra = Math.max(0, H.length - E.length) * .04;           // a few extra words cost a little
      best = Math.max(best, each.reduce((a, b) => a + b, 0) / E.length - extra);
    }
    return Math.max(0, Math.min(100, Math.round(best * 100)));
  };
  T.stars = s => (s >= 85 ? 3 : s >= 60 ? 2 : 1);
  T.has = (heard, need) => (heard || []).some(h => { const H = words(h);
    return need.every(n => n.split('|').some(alt => { const A = words(alt); return A.every(a => H.some(x => sim(a, x) >= .8)); })); });
  T.words = words;

  /* ---------- celebration (Fresh Math world feel) ---------- */
  const tone = (f, t0, d, type = 'sine', v = .18) => {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, actx.currentTime + t0); g.gain.linearRampToValueAtTime(v, actx.currentTime + t0 + .02);
    g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + t0 + d); o.connect(g).connect(actx.destination);
    o.start(actx.currentTime + t0); o.stop(actx.currentTime + t0 + d + .05); };
  T.ding = (n = 3) => { [659, 784, 988, 1319].slice(0, n + 1).forEach((f, i) => tone(f, i * .09, .35, 'triangle')); };
  T.boop = () => { tone(330, 0, .18, 'sine', .14); tone(262, .1, .25, 'sine', .12); };
  T.pop = () => tone(880, 0, .08, 'square', .06);
  T.burst = (x, y, n = 18) => {
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'); s.className = 'tk-spark'; s.textContent = '★';
      const a = Math.PI * 2 * i / n + Math.random() * .3, r = 90 + Math.random() * 90;
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px;color:hsl(${40 + Math.random() * 30},100%,${55 + Math.random() * 15}%);font-size:${14 + Math.random() * 16}px`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 900);
    }
  };
  const css = document.createElement('style');
  css.textContent = `.tk-spark{position:fixed;z-index:9999;pointer-events:none;transform:translate(-50%,-50%);animation:tkspark .85s cubic-bezier(.2,.8,.3,1) forwards;text-shadow:0 0 6px rgba(255,200,0,.7)}
@keyframes tkspark{to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.3) rotate(200deg);opacity:0}}`;
  document.head.appendChild(css);
  window.Talk = T;
})();
