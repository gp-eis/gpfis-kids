/* Video controls for the kids' sites (user, 24 Nov 2026: "all the videos to be able to full screen and toggle on the
   timestamps"). Self-contained (brings its own styles), so Start PBL and Let's Go Readers can use the same file.

     VCtl.attach(box)        box = an element that holds one <video>; adds two round buttons at the top right
                             (time bar on/off, full screen) and a time bar along the bottom:
                             play/pause · a bar to drag · current time / length.
   The time bar is hidden until its button is pressed; the choice is remembered on this device ('gp.vbar').
   Full screen puts the whole box on the screen, so the bar and buttons stay; iPhones use the video's own full screen.
   Nothing here plays or pauses the video by itself except the bar's own play button. */
(function () {
  const css = `
.vc-tools{position:absolute;right:10px;top:10px;display:flex;gap:8px;z-index:4}
.vc-b{width:46px;height:46px;border:0;border-radius:50%;background:rgba(16,20,58,.72);cursor:pointer;display:grid;place-items:center;padding:0;transition:transform .15s}
.vc-b:active{transform:scale(.9)} .vc-b.on{background:#ffc94a} .vc-b svg{width:26px;height:26px;display:block}
.vc-b path,.vc-b circle{fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round} .vc-b.on path,.vc-b.on circle{stroke:#4a3200}
.vc-bar{position:absolute;left:0;right:0;bottom:0;height:54px;display:flex;align-items:center;gap:12px;padding:0 16px 0 10px;background:linear-gradient(180deg,rgba(16,20,58,0),rgba(16,20,58,.88) 45%);z-index:4;box-sizing:border-box}
.vc-bar[hidden]{display:none}
.vc-pp{width:38px;height:38px;border:0;border-radius:50%;background:#fff;cursor:pointer;flex:none;display:grid;place-items:center;padding:0}
.vc-pp svg{width:20px;height:20px;display:block} .vc-pp path{fill:#1c2050}
.vc-seek{flex:1;height:22px;margin:0;accent-color:#ffc94a;cursor:pointer}
.vc-t{flex:none;min-width:92px;text-align:right;font:700 17px/1 'Fredoka',sans-serif;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}
.vc-box:fullscreen{width:100vw!important;height:100vh!important;border:0!important;border-radius:0!important;background:#000!important;box-shadow:none!important}
.vc-box:fullscreen video{object-fit:contain!important;width:100%;height:100%}
.vc-box:fullscreen .vc-bar{height:72px;padding:0 28px 0 20px} .vc-box:fullscreen .vc-t{font-size:22px;min-width:120px}
.vc-box:fullscreen .vc-tools{right:20px;top:20px} .vc-box:fullscreen .vc-b{width:58px;height:58px} .vc-box:fullscreen .vc-b svg{width:32px;height:32px}`;
  const I = { clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
    small: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',
    play: '<svg viewBox="0 0 20 20"><path d="M6 3.5v13l11-6.5z"/></svg>', pause: '<svg viewBox="0 0 20 20"><path d="M5 3.5h3.6v13H5zM11.4 3.5H15v13h-3.6z"/></svg>' };
  const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const get = () => { try { return localStorage.getItem('gp.vbar') === '1'; } catch (e) { return false; } };
  const set = v => { try { localStorage.setItem('gp.vbar', v ? '1' : '0'); } catch (e) {} };
  window.VCtl = {
    attach(box) {
      const v = box && box.querySelector('video'); if (!v || box.querySelector('.vc-tools')) return null;
      if (!document.getElementById('vc-css')) { const st = document.createElement('style'); st.id = 'vc-css'; st.textContent = css; document.head.appendChild(st); }
      box.classList.add('vc-box'); if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
      const tools = document.createElement('div'); tools.className = 'vc-tools';
      tools.innerHTML = `<button class="vc-b vc-time" aria-label="Show the time bar" title="Time bar">${I.clock}</button><button class="vc-b vc-full" aria-label="Full screen" title="Full screen">${I.full}</button>`;
      const bar = document.createElement('div'); bar.className = 'vc-bar';
      bar.innerHTML = `<button class="vc-pp" aria-label="Play or pause">${I.play}</button><input class="vc-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Move through the video"><span class="vc-t">0:00 / 0:00</span>`;
      box.appendChild(tools); box.appendChild(bar);
      const tb = tools.querySelector('.vc-time'), fb = tools.querySelector('.vc-full'), pp = bar.querySelector('.vc-pp'), seek = bar.querySelector('.vc-seek'), tt = bar.querySelector('.vc-t'); let drag = false;
      const showBar = on => { bar.hidden = !on; tb.classList.toggle('on', on); };
      const paint = () => { const d = v.duration || 0; tt.textContent = mmss(v.currentTime) + ' / ' + mmss(d); if (!drag && d) seek.value = Math.round(v.currentTime / d * 1000); pp.innerHTML = v.paused ? I.play : I.pause; };
      showBar(get());
      const stopEv = e => e.stopPropagation();   // the controls never count as a tap on the video or on the page behind
      [tools, bar].forEach(el => ['click', 'pointerdown', 'touchstart'].forEach(n => el.addEventListener(n, stopEv)));
      tb.onclick = () => { const on = bar.hidden; showBar(on); set(on); };
      pp.onclick = () => { if (v.paused) v.play().catch(() => {}); else v.pause(); };
      seek.oninput = () => { drag = true; const d = v.duration || 0; tt.textContent = mmss(seek.value / 1000 * d) + ' / ' + mmss(d); };
      seek.onchange = () => { const d = v.duration || 0; if (d) v.currentTime = seek.value / 1000 * d; drag = false; };
      const isFull = () => (document.fullscreenElement || document.webkitFullscreenElement) === box;
      fb.onclick = () => { if (isFull()) return (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        const go = box.requestFullscreen || box.webkitRequestFullscreen;
        if (go) { const p = go.call(box); if (p && p.catch) p.catch(() => { if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); }); } else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); };
      const onFs = () => { fb.innerHTML = isFull() ? I.small : I.full; fb.classList.toggle('on', isFull()); };
      document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
      ['timeupdate', 'loadedmetadata', 'durationchange', 'play', 'pause', 'ended', 'seeked'].forEach(n => v.addEventListener(n, paint)); paint();
      return { showBar, bar, tools };
    } };
})();
