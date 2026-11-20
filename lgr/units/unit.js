// Reading Phonics unit player. Reads window.PP_UNIT. Voice is the browser's stand-in until recorded voices exist.
// Pronunciation check is not connected yet: checkSpeech() is where it will plug in.
(function () {
  const U = window.PP_UNIT;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), work = $('work'), bubble = $('bubble'), mate = $('mate');
  const MATE = 'penny', KEY = 'pp.unit.' + U.id;
  // Opened from an activity card: ?step=N starts there, ?back=URL is where Home goes.
  const Q = new URLSearchParams(location.search), BACK = Q.get('back') || '../index.html', START = +Q.get('step') || 0;
  $('home').href = BACK;
  let muted = false, sayId = 0, talkT = null, stepI = 0;

  // --- saved progress (on this device only) ---
  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  const prog = load(KEY, { done: [], recBonus: false });
  function drawStars() { $('starN').textContent = load('pp.stars', 0); }
  function addStars(n) { save('pp.stars', load('pp.stars', 0) + n); drawStars(); }
  function finishStep(i) {
    if (!prog.done.includes(i)) { prog.done.push(i); save(KEY, prog); addStars(1); }
    drawStones();
  }

  // --- flexible stage: fills the window, never smaller than 1200 x 680 in stage px ---
  function fit() {
    const s = Math.min(innerWidth / 1200, innerHeight / 680);
    stage.style.width = innerWidth / s + 'px';
    stage.style.height = innerHeight / s + 'px';
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();

  // --- My Mate and speech ---
  function frame(f) { mate.src = '../art/mates/' + MATE + '/mate-' + f + '.webp'; }
  (function blink() {
    setTimeout(() => {
      if (!talkT) { frame('blink'); setTimeout(() => { if (!talkT) frame('idle'); }, 160); }
      blink();
    }, 2600 + Math.random() * 2400);
  })();
  function stopTalk() { clearInterval(talkT); talkT = null; frame('idle'); }
  function stopSay() {
    sayId++;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    stopTalk();
  }
  // Speaks text and calls onWord(i) as each word goes by. Word timing is estimated, because
  // browsers do not all report word positions. Always finishes, even with no voice available.
  function say(text, onWord) {
    stopSay();
    const id = sayId, words = text.split(/\s+/);
    let on = false;
    talkT = setInterval(() => { on = !on; frame(on ? 'talk' : 'idle'); }, 170);
    return new Promise(res => {
      const timers = [];
      let t = 0;
      words.forEach((w, i) => { timers.push(setTimeout(() => { if (id === sayId && onWord) onWord(i); }, t)); t += 300 + w.length * 45; });
      let over = false;
      const end = () => {
        if (over) return; over = true;
        timers.forEach(clearTimeout);
        if (id === sayId) { stopTalk(); if (onWord) onWord(-1); }
        res(id === sayId);
      };
      if (!muted && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = .85; u.pitch = 1.2; u.onend = end; u.onerror = end;
        speechSynthesis.speak(u);
        setTimeout(end, t * 1.8 + 1500);
      } else setTimeout(end, t + 200);
    });
  }
  function tell(text, spoken) { bubble.innerHTML = text; return say(spoken || bubble.textContent); }
  function boing() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
      o.frequency.setValueAtTime(320, a.currentTime); o.frequency.exponentialRampToValueAtTime(170, a.currentTime + .25);
      g.gain.value = muted ? 0 : .12; g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .28);
      o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .3);
    } catch (e) {}
  }

  // --- small builders ---
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(cls, html, fn) { const b = el('button', cls, html); b.type = 'button'; b.onclick = fn; return b; }
  function clear() { stopSay(); work.innerHTML = ''; }
  function nextBtn(label, fn) { return btn('big go', label || 'Next ▶', fn); }
  function teamHtml(word) { return word.replace(U.team, '<span class="t">' + U.team + '</span>'); }
  function partClass(p) { return /^[aeiou]{2}$/.test(p) ? 't' : 'c'; }
  function shake(e) { e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // Drawn in code until book pictures arrive.
  function houseSvg(x, y, s, wall, roof) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-110 -130 L0 -220 L110 -130Z" fill="' + roof + '" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>' +
      '<rect x="-90" y="-130" width="180" height="130" rx="10" fill="' + wall + '" stroke="#fff" stroke-width="6"/><rect x="-22" y="-74" width="44" height="74" rx="8" fill="#7d5233"/>' +
      '<rect x="-72" y="-108" width="38" height="36" rx="6" fill="#d7efff"/><rect x="34" y="-108" width="38" height="36" rx="6" fill="#d7efff"/></g>';
  }
  const PIC = {
    house: '<svg class="pic" viewBox="-130 -235 260 245" aria-hidden="true">' + houseSvg(0, 0, 1, '#ffe9a8', '#e0473a') + '</svg>',
    mouth: '<svg class="pic" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="90" fill="#ffd9b8"/><path d="M45 85 Q100 70 155 85 Q150 165 100 165 Q50 165 45 85Z" fill="#8a2230"/><path d="M58 88 Q100 78 142 88 L138 104 Q100 96 62 104Z" fill="#fff"/><ellipse cx="100" cy="142" rx="30" ry="17" fill="#ee7a86"/></svg>',
    loud: '<svg class="pic" viewBox="0 0 200 200" aria-hidden="true"><path d="M30 80 L90 80 L150 35 L150 165 L90 120 L30 120Z" fill="#f08a24" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><g fill="none" stroke="#e0473a" stroke-width="9" stroke-linecap="round"><path d="M165 75 Q180 100 165 125"/><path d="M180 55 Q205 100 180 145"/></g></svg>'
  };

  // Words become buttons, so a child can tap any word to hear it.
  function wordsHtml(host, text) {
    host.innerHTML = '';
    const spans = text.split(' ').map(w => {
      const b = btn('', w.replace(U.team, '<span class="tm">' + U.team + '</span>'), () => say(w.replace(/[^A-Za-z']/g, '')));
      host.appendChild(b); return b;
    });
    return i => spans.forEach((s, k) => s.classList.toggle('hl', k === i));
  }

  // --- 1. Look and listen ---
  function stepListen() {
    clear();
    const box = el('div', '', ''); box.style.cssText = 'flex:1;min-height:0;width:100%;display:flex';
    box.innerHTML = '<svg id="scene" viewBox="0 0 900 330" role="img" aria-label="Four houses">' +
      '<rect y="270" width="900" height="60" rx="16" fill="#a5dd97"/>' +
      '<g class="hs" data-h="big">' + houseSvg(190, 300, 1.25, '#ffe9a8', '#2f62c9') + '</g>' +
      '<g class="hs" data-h="small">' + houseSvg(405, 300, .62, '#d7f0d0', '#1f8a5b') + '</g>' +
      '<g class="hs" data-h="red">' + houseSvg(580, 300, .9, '#f48a7f', '#b5362b') + '</g>' +
      '<g class="hs" data-h="brown">' + houseSvg(780, 300, .9, '#b98a62', '#7d5233') + '</g></svg>';
    work.appendChild(box);
    const line = el('div', 'line'); work.appendChild(line);
    const row = el('div', 'row'); work.appendChild(row);
    const again = btn('big alt', '🔊 Listen again', () => readAll());
    const next = nextBtn(null, () => goStep(1)); next.hidden = !prog.done.includes(0);
    row.append(again, next);
    const glow = g => box.querySelectorAll('.hs').forEach(h => {
      const on = g === 'all' || h.dataset.h === g;
      h.classList.toggle('glow', on); h.classList.toggle('dim', !on && !!g);
    });
    box.querySelectorAll('.hs').forEach(h => { h.style.cursor = 'pointer'; h.onclick = () => { glow(h.dataset.h); say('A ' + h.dataset.h + ' house.'); }; });
    async function readAll() {
      const mine = ++readT;
      for (const l of U.reading) {
        if (mine !== readT) return;
        glow(l.glow);
        const hl = wordsHtml(line, l.text);
        const ok = await say(l.text, hl);
        if (!ok || mine !== readT) return;
        await new Promise(r => setTimeout(r, 350));
      }
      if (mine !== readT) return;
      glow(null);
      finishStep(0); next.hidden = false;
      tell('Now tap any word or house to hear it!');
    }
    bubble.textContent = 'Listen to the story. Look at the houses!';
    say(bubble.textContent).then(ok => { if (ok) readAll(); });
  }
  let readT = 0;

  // --- 2. Sound it out ---
  function stepSound() {
    clear();
    let wi = 0;
    function show() {
      clear();
      const w = U.words[wi];
      const top = el('div', 'row', PIC[w.pic]); const said = el('div', 'word', '&nbsp;'); top.appendChild(said);
      const slots = el('div', 'slots'), pool = el('div', 'pool');
      work.append(top, slots, pool);
      const row = el('div', 'row'); work.appendChild(row);
      row.appendChild(btn('big alt', '🔊 Hear it', () => say(w.word)));
      const next = nextBtn(null, () => { if (++wi < U.words.length) show(); else { finishStep(1); goStep(2); } }); next.hidden = true; row.appendChild(next);
      const cells = w.parts.map(() => { const s = el('div', 'slot'); slots.appendChild(s); return s; });
      let filled = 0;
      function place(tile, p, cell) {
        if (cell && cell !== cells[filled]) cell = null;
        if (p !== w.parts[filled]) {
          boing(); shake(tile); tell('Listen again! ' + w.word, 'Listen again! ' + w.word); return false;
        }
        const c = cells[filled];
        c.innerHTML = '<span class="' + partClass(p) + '">' + p + '</span>'; c.classList.add('full');
        tile.classList.add('used');
        filled++;
        if (filled === w.parts.length) {
          said.innerHTML = teamHtml(w.word);
          bubble.innerHTML = '<span class="L">' + w.parts.join(' + ') + ' = ' + w.word + '</span>';
          (async () => { for (const s of w.say) { if (!await say(s)) return; } if (await say(w.word)) next.hidden = false; })();
        } else say(w.say[w.parts.indexOf(p)]);
        return true;
      }
      shuffle(w.parts.concat(w.extra)).forEach(p => {
        const t = btn('tile ' + partClass(p), p);
        pool.appendChild(t);
        dragTile(t, () => place(t, p), cell => place(t, p, cell), () => cells);
      });
      tell('Hear the sounds. Tap the tiles in order: ' + w.word + '!', 'Tap the sounds in order. ' + w.word + '!');
    }
    show();
  }
  // A tile can be tapped or dragged to a slot.
  function dragTile(t, onTap, onDrop, getCells) {
    let sx, sy, ghost = null, s = 1;
    t.onpointerdown = e => {
      sx = e.clientX; sy = e.clientY; ghost = null; s = stage.getBoundingClientRect().width / stage.offsetWidth;
      t.setPointerCapture(e.pointerId);
    };
    t.onpointermove = e => {
      if (sx == null) return;
      if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) {
        ghost = t.cloneNode(true); ghost.classList.add('drag'); ghost.style.transform = 'scale(' + s + ')'; document.body.appendChild(ghost);
        t.style.opacity = .25;
      }
      if (ghost) { ghost.style.left = e.clientX - 50 * s + 'px'; ghost.style.top = e.clientY - 48 * s + 'px'; }
    };
    const up = e => {
      if (sx == null) return;
      sx = null; t.style.opacity = '';
      if (!ghost) { onTap(); return; }
      ghost.remove(); ghost = null;
      const hit = getCells().find(c => { const r = c.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
      if (hit) onDrop(hit);
    };
    t.onpointerup = up; t.onpointercancel = () => { sx = null; t.style.opacity = ''; if (ghost) { ghost.remove(); ghost = null; } };
  }

  // --- voice recording: stays on this device ---
  let dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise((res, rej) => {
      const r = indexedDB.open('pp-voice', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('clips');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbP;
  }
  function keepClip(key, blob) {
    db().then(d => d.transaction('clips', 'readwrite').objectStore('clips').put(blob, 'local|' + U.id + ':' + key)).catch(() => {});
  }
  // Records up to ms, or until stop() is called. Rejects if the microphone is not available.
  function record(ms, meter) {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => new Promise(res => {
      const chunks = [], mr = new MediaRecorder(stream), began = Date.now();
      mr.ondataavailable = e => chunks.push(e.data);
      const tick = setInterval(() => { if (meter) meter.style.width = Math.min(100, (Date.now() - began) / ms * 100) + '%'; }, 80);
      mr.onstop = () => { clearInterval(tick); stream.getTracks().forEach(t => t.stop()); res(new Blob(chunks, { type: mr.mimeType })); };
      mr.start();
      setTimeout(() => { if (mr.state !== 'inactive') mr.stop(); }, ms);
    }));
  }
  // The pronunciation check plugs in here. Until it exists, there is no verdict, so none is shown.
  function checkSpeech() { return null; }

  function recordPanel(key, text, onDone) {
    const row = el('div', 'row'), m = el('div', 'meter', '<i></i>'); m.hidden = true;
    let url = null;
    const play = btn('big alt', '▶ Hear me', () => { stopSay(); new Audio(url).play().catch(() => {}); }); play.hidden = true;
    const rec = btn('big rec', '🎤 Say it', async () => {
      stopSay(); rec.disabled = true; m.hidden = false;
      try {
        const blob = await record(3500, m.firstChild);
        url = URL.createObjectURL(blob); keepClip(key, blob); play.hidden = false; checkSpeech();
        if (!prog.recBonus) { prog.recBonus = true; save(KEY, prog); addStars(1); }
        tell('Now hear your voice!'); onDone();
      } catch (e) {
        tell("The microphone is off. Let's say it together!", "Let's say it together! " + text); onDone();
      }
      rec.disabled = false; m.hidden = true;
    });
    row.append(rec, play);
    return [row, m];
  }

  // --- 3. Read and speak ---
  function stepSpeak() {
    let qi = 0;
    function show() {
      clear();
      const q = U.speak[qi];
      const a = el('div', 'ask', q.ask), ans = el('div', 'answer');
      const hl = wordsHtml(ans, q.answer);
      const row = el('div', 'row');
      const next = nextBtn(null, () => { if (++qi < U.speak.length) show(); else { finishStep(2); goStep(3); } }); next.hidden = true;
      const [recRow, m] = recordPanel('speak' + qi, q.answer, () => { next.hidden = false; });
      row.append(btn('big', '🔊 Listen', () => say(q.answer, hl)), recRow, next);
      work.append(PIC_SMALL(), a, ans, m, row);
      tell(q.ask + ' You say it!', q.ask).then(ok => { if (ok) say(q.answer, hl).then(() => { next.hidden = false; }); });
    }
    show();
  }
  function PIC_SMALL() { const d = el('div', '', PIC.house); d.firstChild.style.cssText = 'width:120px;height:120px'; return d; }

  // --- 4. Write: complete the word, then 받아쓰기 ---
  function stepWrite() {
    let i = 0;
    function complete() {
      clear();
      const word = U.complete.words[i], [a, b] = word.split(U.team);
      const pic = U.words.find(w => w.word === word).pic;
      const shown = el('div', 'word', a + '<span class="slot" style="display:inline-grid;vertical-align:middle;margin:0 8px"></span>' + b);
      const pool = el('div', 'pool'), row = el('div', 'row');
      work.append(el('div', 'row', PIC[pic]), shown, pool, row);
      row.appendChild(btn('big alt', '🔊 Hear it', () => say(word)));
      shuffle(U.complete.choices).forEach(c => pool.appendChild(btn('tile t', c, e => {
        if (c !== U.team) { boing(); shake(e.currentTarget); tell('In ' + word + ', which letters make the sound? Try again!'); return; }
        const s = shown.querySelector('.slot'); s.textContent = c; s.classList.add('full', 't');
        say(word).then(ok => { if (!ok) return; if (++i < U.complete.words.length) complete(); else { i = 0; dictation(); } });
      })));
      tell('Which letters are missing? ' + word + '!', 'Which letters are missing? ' + word + '!');
    }
    function dictation() {
      clear();
      const word = U.dictation[i];
      const boxes = el('div', 'boxes'), inks = [];
      word.split('').forEach(ch => {
        const b = el('div', 'box', '<div class="ans">' + ch + '</div>');
        const c = document.createElement('canvas'); c.width = 256; c.height = 328; b.appendChild(c);
        inks.push(inkOn(c, '#1e2a44', 11)); boxes.appendChild(b);
      });
      const hear = btn('big alt', '🔊 Hear it', () => say(word));
      const erase = btn('big', '🧽 Erase', () => inks.forEach(k => k.clear()));
      const done = btn('big go', '✓ Done', () => {
        boxes.querySelectorAll('.box').forEach(b => b.classList.add('show'));
        row.innerHTML = '';
        row.append(btn('big go', '👍 Same!', () => {
          say('Great writing!').then(ok => { if (!ok) return; if (++i < U.dictation.length) dictation(); else { finishStep(3); goStep(4); } });
        }), btn('big', '✏️ Write again', () => dictation()));
        tell('Look! Is your word the same?');
      });
      const row = el('div', 'row'); row.append(hear, erase, done);
      work.append(boxes, row);
      tell('받아쓰기! Listen, then write the word you hear. One letter in each box.', 'Listen, then write the word you hear. ' + word + '. ' + word + '.');
    }
    complete();
  }
  // Finger or mouse drawing on a canvas.
  function inkOn(c, color, width) {
    const g = c.getContext('2d'); g.lineCap = g.lineJoin = 'round';
    let on = false, used = false; const ink = { color, width };
    const at = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
    c.onpointerdown = e => { on = true; used = true; c.setPointerCapture(e.pointerId); g.strokeStyle = ink.color; g.lineWidth = ink.width; g.beginPath(); g.moveTo(...at(e)); g.lineTo(...at(e)); g.stroke(); };
    c.onpointermove = e => { if (on) { g.lineTo(...at(e)); g.stroke(); } };
    c.onpointerup = c.onpointercancel = () => { on = false; };
    ink.clear = () => { g.clearRect(0, 0, c.width, c.height); used = false; };
    ink.used = () => used;
    return ink;
  }

  // --- 5. My own ---
  function stepOwn() {
    clear();
    const paper = el('div'); paper.id = 'paper';
    const c = document.createElement('canvas'); c.width = 900; c.height = 600;
    const out = el('div', '', '<svg viewBox="0 0 900 600" aria-hidden="true"><g fill="none" stroke="#b8b1a2" stroke-width="6" stroke-dasharray="14 12" stroke-linejoin="round"><path d="M180 290 L450 80 L720 290Z"/><rect x="230" y="290" width="440" height="270"/><rect x="400" y="410" width="100" height="150"/></g></svg>');
    paper.append(c, out.firstChild);
    work.appendChild(paper);
    const ink = inkOn(c, '#e0473a', 26);
    const crayons = el('div', 'row');
    ['#e0473a', '#f08a24', '#f2c21f', '#1f8a5b', '#2f62c9', '#7d5233'].forEach((col, i) => {
      const b = btn('crayon' + (i ? '' : ' on'), '', () => { ink.color = col; crayons.querySelectorAll('.crayon').forEach(x => x.classList.toggle('on', x === b)); });
      b.style.background = col; b.setAttribute('aria-label', 'Colour ' + (i + 1)); crayons.appendChild(b);
    });
    crayons.appendChild(btn('big', '🧽', () => ink.clear()));
    const done = btn('big go', '✓ Done', () => {
      if (ink.used()) save('pp.unit.' + U.id + '.drawing', c.toDataURL('image/webp', .7));
      crayons.innerHTML = '';
      const ans = el('div', 'answer'); const hl = wordsHtml(ans, U.own.say);
      const end = nextBtn('Finish ▶', finish); end.hidden = true;
      const [recRow, m] = recordPanel('own', U.own.say, () => { end.hidden = false; });
      crayons.append(btn('big', '🔊', () => say(U.own.say, hl)), recRow, end);
      paper.style.flex = '1'; work.insertBefore(ans, crayons); work.insertBefore(m, crayons);
      tell('Now tell me about it. Say:', 'Now tell me about it. ' + U.own.say).then(ok => { if (ok) end.hidden = false; });
    });
    crayons.appendChild(done);
    work.appendChild(crayons);
    tell(U.own.prompt);
  }
  function finish() {
    finishStep(4); clear();
    work.append(el('div', '', '<svg class="buddy" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="118" rx="72" ry="72" fill="#7fd1a8" stroke="#fff" stroke-width="6"/><circle cx="76" cy="104" r="11" fill="#1e2a44"/><circle cx="124" cy="104" r="11" fill="#1e2a44"/><circle cx="79" cy="100" r="4" fill="#fff"/><circle cx="127" cy="100" r="4" fill="#fff"/><ellipse cx="100" cy="142" rx="20" ry="16" fill="#8a2230"/><path d="M40 70 L72 62 L60 30Z M160 70 L128 62 L140 30Z" fill="#1f8a5b"/></svg>'),
      el('div', 'word', 'The <span class="t">' + U.team + '</span> buddy hatched!'));
    const row = el('div', 'row');
    row.append(btn('big', '↺ Play again', () => goStep(0)));
    const home = el('a', 'big go', '🏠 Back'); home.href = BACK; home.style.textDecoration = 'none'; row.appendChild(home);
    work.appendChild(row);
    for (let i = 0; i < 24; i++) {
      const b = el('i', 'bit'); b.style.left = Math.random() * 100 + '%'; b.style.background = ['#e0473a', '#2f62c9', '#1f8a5b', '#ffd75e'][i % 4]; b.style.animationDelay = Math.random() * .6 + 's';
      work.appendChild(b);
    }
    tell(U.team + ' says ' + U.teamSay + '! You did it!', U.teamLine + ' You did it!');
  }

  // --- steps ---
  const STEPS = [['Listen', stepListen], ['Sound it', stepSound], ['Speak', stepSpeak], ['Write', stepWrite], ['My own', stepOwn]];
  function drawStones() {
    const s = $('stones'); s.innerHTML = '';
    STEPS.forEach(([name], i) => {
      const li = el('li', (i === stepI ? 'on ' : '') + (prog.done.includes(i) ? 'done' : ''));
      li.appendChild(btn('', name, () => goStep(i))); if (i === stepI) li.setAttribute('aria-current', 'step');
      s.appendChild(li);
    });
  }
  function goStep(i) { readT++; stepI = i; drawStones(); STEPS[i][1](); }

  $('snd').onclick = e => { muted = !muted; e.currentTarget.textContent = muted ? '🔇' : '🔊'; if (muted) stopSay(); };
  $('startTitle').textContent = U.title;
  $('startBtn').onclick = () => { $('start').remove(); goStep(START); };
  drawStars(); drawStones();
})();
