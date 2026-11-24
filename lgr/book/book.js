// Reading book player: cover → one sentence per page → final activity → ending (the reading joins "My A Book").
// Opens the book named in ?b= (default a-airplane). Voice is the browser's stand-in. Progress stays on this device.
(function () {
  const $ = id => document.getElementById(id);
  const Q = new URLSearchParams(location.search), SET = window.LGR_SET, S = window.LGR_SCENE;
  const id = SET.books.some(b => b.id === Q.get('b')) ? Q.get('b') : SET.books[0].id;
  const meta = SET.books.find(b => b.id === id);
  const stage = $('stage'), page = $('page'), next = $('next'), prev = $('prev');
  let B, N, LAST, at = 0, ko = false, actDone = false, sayId = 0, talked = false;

  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 800);
    stage.style.transform = 'scale(' + s + ') translate(-50%,-50%)';
    document.body.style.setProperty('--s', s);
  }
  addEventListener('resize', fit); fit();
  $('home').href = Q.get('back') || 'index.html';

  // "I {see} an airplane." → words; the {curly} part is the action word
  function words(en) {
    const out = [];
    en.split(/(\{[^}]+\})/).forEach(part => {
      if (!part) return;
      if (part[0] === '{') out.push({ t: part.slice(1, -1), verb: true });
      else part.trim().split(/\s+/).forEach(w => w && out.push({ t: w, verb: false }));
    });
    return out;
  }
  const plain = en => en.replace(/[{}]/g, '');
  function sentHtml(en) { return words(en).map(w => '<span class="w' + (w.verb ? ' v' : '') + '">' + w.t + '</span>').join(' ').replace(/ (<span class="w">[.!?,]+<\/span>)/g, '$1'); }

  function say(text, spans) {
    const n = ++sayId;
    if (spans) {
      let t = 0;
      spans.forEach((sp, i) => { setTimeout(() => { if (n === sayId) spans.forEach((x, k) => x.classList.toggle('on', k === i)); }, t); t += 330 + sp.textContent.length * 45; });
      setTimeout(() => { if (n === sayId) spans.forEach(x => x.classList.remove('on')); }, t + 200);
    }
    if (window.Say) return void Say(text);          // Penny's recorded voice (vendor/say.js); text may be [part, part]
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance([].concat(text).join(' ')); u.lang = 'en-US'; u.rate = .8; u.pitch = 1.2; speechSynthesis.speak(u);
  }
  const kor = t => '<div class="kor"' + (ko ? '' : ' hidden') + '>' + t + '</div>';

  function sentencePage(i) {
    const p = B.pages[i];
    page.innerHTML = '<div class="pic">' + S.render(p.scene, i) + '</div><div class="text"><button class="say" aria-label="Listen">🔊</button><div class="sent">' + sentHtml(p.en) + '</div>' + kor(p.ko) + '<span class="no">' + (i + 1) + '</span></div>';
    const read = () => say(plain(p.en), [...page.querySelectorAll('.w')]);
    page.querySelector('.say').onclick = read; page.querySelector('.sent').onclick = read;
    if (talked) read();
  }
  function cover() {
    const [my, ...rest] = B.title.split(' '), c = B.cover;
    page.innerHTML = '<div class="cover" style="--c:' + meta.color + '"><svg class="art" viewBox="0 0 948 632" preserveAspectRatio="xMidYMid slice"><rect y="470" width="948" height="162" fill="rgba(43,45,58,.14)"/>' +
      S.item(c[0], c[1], c[2], c[3], c[4], 'float') + '</svg><p class="kick">' + SET.name.toUpperCase() + ' · ' + (SET.books.indexOf(meta) + 1) + '</p><h1>' + my + '<br><span>' + rest.join(' ') + '</span></h1>' +
      '<div class="aa">A a</div>' + (B.draft ? '<span class="tag">draft text</span>' : '') + '</div>';
  }
  function activity() {
    let round = 0;
    const list = B.activity.find, stars = k => '<div class="stars">' + list.map((_, j) => '<span class="' + (j < k ? 'on' : '') + '">⭐</span>').join('') + '</div>';
    function ask() {
      const p = B.pages[list[round]];
      page.innerHTML = '<div class="center"><h2>Find the verb!</h2>' + stars(round) + '<div class="tiles"></div>' + kor(p.ko) + '</div>';
      const tiles = page.querySelector('.tiles');
      words(p.en).forEach(w => {
        const b = document.createElement('button'); b.className = 'tile'; b.textContent = w.t;
        b.onclick = () => {
          if (w.verb) { b.classList.add('ok'); say(w.t); setTimeout(() => { round++; round < list.length ? ask() : own(); }, 1100); }
          else { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); say(['Hmm!', plain(p.en)]); }
        };
        tiles.appendChild(b);
      });
      if (talked) say(['Find the verb!', plain(p.en)]);
    }
    function own() {
      const o = B.activity.own;
      page.innerHTML = '<div class="center">' + stars(list.length) + '<h2>Now you say it!</h2><div class="sent big-sent">' + sentHtml(o.en) + '</div>' + kor(o.ko) + '<div class="row"><button class="big alt" id="hear">🔊 Listen</button><button class="big" id="did">I said it! ★</button></div></div>';
      const read = () => say(plain(o.en), [...page.querySelectorAll('.w')]);
      $('hear').onclick = read; read();
      $('did').onclick = () => { actDone = true; go(LAST); };
    }
    actDone ? own() : ask();
  }
  function collected() { try { return JSON.parse(localStorage.getItem('lgr.pages') || '[]'); } catch (e) { return []; } }
  function ending() {
    const got = collected();
    if (!got.includes(id)) { got.push(id); try { localStorage.setItem('lgr.pages', JSON.stringify(got)); } catch (e) {} }
    const n = SET.books.filter(b => got.includes(b.id)).length, all = n === SET.books.length;
    page.innerHTML = '<div class="center"><h2>The End</h2><div class="line">You read <b>' + B.title + '</b>! It goes into <b>' + SET.name + '</b>.</div><div class="shelfbook">' +
      SET.books.map((b, i) => got.includes(b.id)
        ? '<a class="slot got' + (b.id === id ? ' new' : '') + '" style="background:' + b.color + '" href="book.html?b=' + b.id + '">' + S.icon(b.img, 96) + '<span>' + b.word + '</span></a>'
        : '<a class="slot" href="book.html?b=' + b.id + '">' + (i + 1) + '<br>' + b.word + '</a>').join('') +
      '</div><div class="small">' + (all ? 'All 6 readings done. ' + SET.name + ' is finished!' : n + ' of ' + SET.books.length + ' readings. Read them all to finish the book!') + '</div><div class="row"><button class="big alt" id="again">↺ Read again</button><a class="big" href="index.html">' + SET.name + ' ▶</a></div></div>';
    $('again').onclick = () => go(0);
    if (talked) say('The end! You read ' + B.title + '!');
  }

  addEventListener('pointerdown', () => { talked = true; }, { once: true });
  function go(i) {
    at = Math.max(0, Math.min(LAST, i)); sayId++;
    if (window.Say) Say.stop(); else if ('speechSynthesis' in window) speechSynthesis.cancel();
    page.classList.remove('turn'); void page.offsetWidth; page.classList.add('turn');
    if (at === 0) cover(); else if (at <= N) sentencePage(at - 1); else if (at === N + 1) activity(); else ending();
    prev.disabled = at === 0;
    next.disabled = at === LAST || (at === N + 1 && !actDone);   // the activity opens the last page
    next.classList.toggle('glow', at === 0);
    $('dots').innerHTML = Array.from({ length: LAST + 1 }, (_, k) => '<i class="' + (k === at ? 'on' : '') + '"></i>').join('');
  }
  next.onclick = () => go(at + 1); prev.onclick = () => go(at - 1);
  addEventListener('keydown', e => { if (e.key === 'ArrowRight' && !next.disabled) go(at + 1); if (e.key === 'ArrowLeft') go(at - 1); });
  $('ko').onclick = e => { ko = !ko; e.currentTarget.setAttribute('aria-pressed', ko); page.querySelectorAll('.kor').forEach(k => { k.hidden = !ko; }); };

  // load this book's words and pictures, then open it
  const sc = document.createElement('script'); sc.src = 'data/' + id + '.js';
  sc.onload = () => {
    B = window.LGR_BOOK; N = B.pages.length; LAST = N + 2;
    document.title = B.title + " · Let's Go Readers";
    if (Q.get('ko')) $('ko').click();
    const start = +Q.get('p'); go(start >= 0 && start <= LAST ? start : 0);
  };
  document.head.appendChild(sc);
})();
