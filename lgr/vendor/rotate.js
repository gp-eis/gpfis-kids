/* Let's Go Readers is played LANDSCAPE (user, 25 Nov 2026: "all the activities will be done landscape ... like in GB Magic
   library"). On a phone or tablet held UPRIGHT, Penny asks the child to turn it sideways; everything shows again once it is
   turned. Same idea and words as GB Magic Library's ui/rotate.js. Shown by CSS only on touch screens in portrait, so a
   narrow window on a computer is not blocked.
   Load on every page:  <script src="vendor/rotate.js" data-base=""></script>   (data-base = the path back to app/)
   Android: the "Play sideways" button goes full screen and turns the screen even with rotation lock on. iPhones cannot
   be turned by a web page: they get a tip about the rotation lock. Brings its own styles. */
(function () {
  const me = document.currentScript, base = (me && me.dataset.base) || '';
  const st = document.createElement('style'); st.textContent = `
#lgr-rotate{display:none}
@media (orientation:portrait) and (pointer:coarse){
  #lgr-rotate{display:grid;place-items:center;position:fixed;inset:0;z-index:2147483000;padding:24px;text-align:center;color:#fff;
    background:radial-gradient(120% 80% at 50% 30%,#ef5a64,#c7222f 60%,#8f1b25);font-family:"Fredoka","Noto Sans KR",ui-rounded,system-ui,sans-serif}
  body{overflow:hidden!important}
}
#lgr-rotate .rt-box{display:grid;justify-items:center;gap:10px;max-width:340px}
#lgr-rotate .rt-mate{height:30vh;max-height:240px;filter:drop-shadow(0 10px 14px rgba(0,0,0,.35));animation:lgrHop 1.6s ease-in-out infinite}
#lgr-rotate .rt-phone{width:58px;height:96px;border:5px solid #ffd23f;border-radius:14px;position:relative;animation:lgrTurn 2.4s ease-in-out infinite;margin:6px 0}
#lgr-rotate .rt-phone span{position:absolute;left:50%;bottom:6px;width:12px;height:4px;margin-left:-6px;border-radius:2px;background:#ffd23f}
#lgr-rotate .rt-en{margin:0;font-weight:700;font-size:26px;line-height:1.2}
#lgr-rotate .rt-ko{margin:0;font-weight:700;font-size:19px;color:#ffe36a}
#lgr-rotate .rt-go{margin-top:10px;font:700 19px "Fredoka","Noto Sans KR",system-ui,sans-serif;color:#4a2508;background:linear-gradient(#ffe36a,#ffc93c);border:0;border-radius:999px;padding:14px 24px;box-shadow:0 5px 0 #c9921a}
#lgr-rotate .rt-tip{margin:8px 0 0;font-size:13px;line-height:1.5;opacity:.9}
@keyframes lgrTurn{0%,20%{transform:rotate(0)}50%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
@keyframes lgrHop{50%{transform:translateY(-8px)}}
@media (prefers-reduced-motion:reduce){#lgr-rotate .rt-phone,#lgr-rotate .rt-mate{animation:none}}`;
  document.head.appendChild(st);
  const canTurn = matchMedia('(pointer: coarse)').matches && !!document.documentElement.requestFullscreen && !!(screen.orientation && screen.orientation.lock);
  function build() {
    if (document.getElementById('lgr-rotate')) return;
    const el = document.createElement('div'); el.id = 'lgr-rotate'; el.setAttribute('role', 'alert');
    el.innerHTML = '<div class="rt-box"><img class="rt-mate" src="' + base + 'art/kingdom/penny/point.webp" alt="">' +
      '<div class="rt-phone" aria-hidden="true"><span></span></div>' +
      '<p class="rt-en">Turn your phone sideways!</p><p class="rt-ko">휴대폰을 옆으로 돌려 주세요!</p>' +
      (canTurn ? '<button class="rt-go" type="button">▶ Play sideways · 가로로 시작</button>'
        : '<p class="rt-tip">Screen won\'t turn? Switch off rotation lock.<br>화면이 안 돌아가면 화면 회전 잠금을 꺼 주세요.</p>') + '</div>';
    document.body.appendChild(el);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
  // only the "Play sideways" button asks for full screen (as in GB Magic Library: a tap anywhere must not do it)
  if (canTurn) addEventListener('click', e => { if (!(e.target.closest && e.target.closest('.rt-go')) || document.fullscreenElement) return;
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation.lock('landscape')).catch(() => {}); }, true);
})();
