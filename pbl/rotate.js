/* LANDSCAPE ONLY (user, 25 Nov 2026: "all the activities will be done landscape ... as what we have already established like in
   GB Magic library"). Start PBL's stage is a wide one; on a phone or tablet held UPRIGHT this screen asks the child to turn it.
   It is the same idea as GB Magic Library's (cest-la-vie/app/ui/rotate.js), in the airship's own look, with Gerry and Penny.
   Shown by CSS only on touch screens in portrait (rotate.css); the game appears again as soon as the device is turned.
   Android: the "Play sideways" button goes full screen and locks the screen sideways (works even with rotation lock on).
   iPhones cannot do that from a web page, so they get a tip about the rotation lock instead. Nothing here saves anything. */
(function () {
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'rotate.css'; document.head.appendChild(css);
  const d = document.documentElement;
  const canTurn = matchMedia('(pointer: coarse)').matches && !!d.requestFullscreen && !!(screen.orientation && screen.orientation.lock);
  function build() {
    if (document.getElementById('pbl-rotate')) return;
    const el = document.createElement('div'); el.id = 'pbl-rotate'; el.setAttribute('role', 'alert');
    el.innerHTML = `<div class="rt-box"><div class="rt-crew"><img src="art/crew/gerry/point.webp" alt=""><img src="art/crew/penny/wave.webp" alt=""></div>` +
      `<div class="rt-phone" aria-hidden="true"><span></span></div>` +
      `<p class="rt-en">Turn your phone sideways!</p><p class="rt-ko">휴대폰을 옆으로 돌려 주세요!</p>` +
      (canTurn ? `<button class="rt-go" type="button">▶ Play sideways · 가로로 시작</button>`
        : `<p class="rt-tip">Screen won't turn? Switch off rotation lock.<br>화면이 안 돌아가면 화면 회전 잠금을 꺼 주세요.</p>`) + `</div>`;
    document.body.appendChild(el);
    // taps on this screen never reach the game behind it
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(n => el.addEventListener(n, e => e.stopPropagation()));
    const go = el.querySelector('.rt-go');
    if (go) go.addEventListener('click', () => { if (document.fullscreenElement) return; d.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation.lock('landscape')).catch(() => {}); });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
