/* GPFIS shared counter (24 Nov 2026): what the child opened, played and finished, day by day, for the star's month board on
   Story Street and for each programme's own report. Kept on this device only ('gpfis.log') until children have accounts.

   What is FINISHED is read from each programme's own save (GPTrack.sync(), run by Story Street), so the programmes need no
   change for that. Opening a programme is counted by Story Street when its door is entered.
   A programme page may also load this file (../../gpfis-site/kit/track.js) and call, each time an activity is started:
     GPTrack.play('fm', 'game', { week: 1 })
   so the board can show how many TIMES it was played, not only that it was finished.
   Programme names: 'pbl' Start PBL, 'lgr' Let's Go Readers, 'fm' Fresh Math. Activity names: see GPTrack.ACTS below; a name
   that is not listed is still counted and shows in the programme's own report.

   Reading:  GPTrack.day('2027-01-05')  -> { pbl: { o: 2, a: { video: { p: 1, d: 1, s: 0 } } }, ... } or undefined
             GPTrack.days()             -> every saved day, by date
   Saved shape: { v: 1, days: { 'YYYY-MM-DD': { <prog>: { o: opens, a: { <act>: { p: plays, d: dones, s: stars, w: last week } } } } } } */
(function () {
  const KEY = 'gpfis.log', KEEP = 200;   // days kept
  const pad = n => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const load = () => { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o && o.v === 1 && o.days) return o; } catch (e) {} return { v: 1, days: {} }; };
  const save = L => { const ks = Object.keys(L.days).sort(); while (ks.length > KEEP) delete L.days[ks.shift()]; try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {} };
  const slot = (L, prog) => { const d = L.days[dayKey()] = L.days[dayKey()] || {}; return d[prog] = d[prog] || { o: 0, a: {} }; };
  const act = (S, name) => S.a[name] = S.a[name] || { p: 0, d: 0, s: 0 };
  const note = (kind, prog, name, o) => { if (!prog || !name) return; const L = load(), A = act(slot(L, prog), String(name));
    if (kind === 'p') A.p++; else { A.d++; A.s += Math.max(0, +(o && o.stars) || 0); if (A.p < A.d) A.p = A.d; }
    if (o && o.week) A.w = +o.week; save(L);
    try { window.dispatchEvent(new CustomEvent('gptrack', { detail: { kind, prog, act: name } })); } catch (e) {} };
  const room = o => o && o.month && o.week ? o.month + '-' + o.week + '/' : '';
  const progOf = p => /\/(pbl|start-pbl)\//.test(p) ? 'pbl' : /\/(lgr|active-readers)\//.test(p) ? 'lgr' : /\/(fm|forest-math)\//.test(p) ? 'fm' : null;

  window.GPTrack = {
    /* the activities the month board shows for each programme, in order: [name, label for the parent] */
    ACTS: {   // [name, label, stand-in picture]; names are the programmes' own ids so their saves can be read as they are
      pbl: [],   // Start PBL has a different list in every room: see ROOMS and GPTrack.pblActs() below
      lgr: [['watch', 'Watch', '🎬'], ['abc', 'ABC', '🔤'], ['sheet', 'Speak', '🎤'], ['dictation', 'Grammar', '🧩'], ['book', 'Speaking Book', '📖']],
      fm: [['video', 'Video', '🎬'], ['game', 'Activity', '🧩'], ['talk', 'Discussion', '💬']] },   // Fresh Math's middle part is never called a "game" (user, 24 Nov); its id stays 'game'
    PROGS: ['pbl', 'lgr', 'fm'],
    /* Start PBL rooms ("island-place" = month-week), from the Start PBL chat (24 Nov 2026): [activity id, its title], in order.
       The video comes first and the Speech Book last in every room. A room that is not listed uses 1-1, as the game does.
       Start PBL activities are logged as '<month>-<week>/<id>' because the same ids repeat in other months. */
    ROOMS: {
      '1-1': [['mirror', 'Who am I?'], ['tablet', 'Hello! I am Emma.'], ['frames', 'Sam and Lily'], ['board', 'Words about me'], ['shelf', 'What am I good at?'], ['easel', 'This is me!']],
      '2-1': [['photos', 'Meet my friends!'], ['cans', 'Hello, friend!'], ['frames', 'Ben and Mia'], ['desk', 'Ask a friend'], ['scope', 'Find a friend who ...'], ['board', 'Words about friends'], ['chest', 'What do we do together?'], ['easel', 'My friend and me']],
      '2-2': [['portraits', 'We are all different'], ['hoops', 'Same and different'], ['baskets', 'Same or different?'], ['heartjar', 'Is it kind?'], ['door', 'Everyone can play'], ['thumb', 'Thumbs up!'], ['easel', 'Be kind!'], ['pad', 'All friends']],
      '2-3': [['masks', 'How does he feel?'], ['medals', 'A good friend ...'], ['cookies', "Let's share!"], ['mailbox', 'Caring words'], ['sign', 'What should we do?'], ['board', 'Words about kindness'], ['card', 'Thank you, friend!'], ['calendar', 'My kind week']],
      '2-4': [['flag', "Let's work together!"], ['puppets', 'The tower challenge'], ['hats', 'Everyone has a job!'], ['radios', 'Team talk'], ['blocks', 'Build a tower!'], ['tree', 'Our friendship tree'], ['stars', 'We grow together!']] },
    /* the board's list for one Start PBL room: [log name, label, picture or step number] */
    pblActs(room) { const R = this.ROOMS[room] || this.ROOMS['1-1']; return [[room + '/video', 'Video', '🎬']].concat(R.map((a, i) => [room + '/' + a[0], a[1], i + 1]), [[room + '/book', 'Speech Book', '📖']]); },
    dayKey, prog: progOf(location.pathname),
    open(prog) { if (!prog) return; const L = load(); slot(L, prog).o++; save(L); },
    play(prog, name, o) { note('p', prog, room(o) + name, o); },
    done(prog, name, o) { note('d', prog, room(o) + name, o); },
    day(k) { return load().days[k]; },
    days() { return load().days; },
    /* totals for a list of day keys: { days, opens, plays, dones, stars, by: { pbl: { o, p, d, s, a: { act: { p, d, s } } } } } */
    sum(keys) { const D = load().days, T = { days: 0, opens: 0, plays: 0, dones: 0, stars: 0, by: {} };
      for (const k of keys) { const d = D[k]; if (!d) continue; let any = false;
        for (const g in d) { const B = T.by[g] = T.by[g] || { o: 0, p: 0, d: 0, s: 0, a: {} }; B.o += d[g].o; T.opens += d[g].o; if (d[g].o) any = true;
          for (const n in d[g].a) { const a = d[g].a[n], x = B.a[n] = B.a[n] || { p: 0, d: 0, s: 0 }; x.p += a.p; x.d += a.d; x.s += a.s; B.p += a.p; B.d += a.d; B.s += a.s; T.plays += a.p; T.dones += a.d; T.stars += a.s; any = true; } }
        if (any) T.days++; }
      return T; },
    /* reads what the three programmes have saved themselves and logs anything newly finished (each thing once, kept in
       'gpfis.snap'). Start PBL saves the time of each activity, so those land on their real day; the others land on today. */
    sync() { let snap = {}; try { snap = JSON.parse(localStorage.getItem('gpfis.snap') || '{}'); } catch (e) {} const L = load(); let n = 0;
      const get = k => { try { return JSON.parse(localStorage.getItem(k) || 'null') || {}; } catch (e) { return {}; } };
      const put = (key, prog, name, stars, week, at) => { if (snap[key]) return; snap[key] = 1; n++; const dk = at ? dayKey(new Date(at)) : dayKey(), d = L.days[dk] = L.days[dk] || {}, S = d[prog] = d[prog] || { o: 0, a: {} }, A = act(S, name);
        A.d++; A.s += stars || 0; if (A.p < A.d) A.p = A.d; if (week) A.w = week; };
      const P = get('spbl.pages'); for (const m in P) for (const w in P[m]) { const D = P[m][w] || {}; if (D._tv) put('pbl:' + m + '-' + w + ':video', 'pbl', m + '-' + w + '/video', 0, +w);
        for (const id in D) if (D[id] && D[id].ok) put('pbl:' + m + '-' + w + ':' + id, 'pbl', m + '-' + w + '/' + id, +D[id].stars || 0, +w, D[id].at); }
      const R = get('lgr2'); for (const k in R) if (/^w[0-9]+$/.test(k)) for (const part in R[k]) if (R[k][part]) put('lgr:' + k + ':' + part, 'lgr', part, 1, +k.slice(1));
      const SB = get('lgr.speakbooks'); for (const k in SB) if (/^w[0-9]+$/.test(k) && SB[k]) put('lgr:' + k + ':book', 'lgr', 'book', 0, +k.slice(1));   // the week's Speaking Book: every page opened, no star
      const F = get('fm.world.sample'); for (const k in (F.book || {})) if (F.book[k]) { const wk = +k.split('-')[1] + 1 || 0;   // '<planet>-<stop>': the stop is the month's week, counted from 0
        put('fm:' + k + ':video', 'fm', 'video', 0, wk); put('fm:' + k + ':game', 'fm', 'game', 0, wk); put('fm:' + k + ':talk', 'fm', 'talk', 1, wk); }
      if (n) { save(L); try { localStorage.setItem('gpfis.snap', JSON.stringify(snap)); } catch (e) {} } return n; },
    reset() { try { localStorage.removeItem('gpfis.snap'); } catch (e) {} try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
