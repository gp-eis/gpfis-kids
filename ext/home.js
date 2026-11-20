/* GPFIS shared "back to Story Street" button, for the three programmes (Start PBL, Let's Go Readers, Fresh Math).
   The GPFIS build adds it to every programme page:  <script src=".../ext/home.js" data-home=".../demo/street.html"></script>
   A painted, toy-like round badge (art/ui/home-house.webp, from the GPFIS street chat) with a little label, big enough to be
   obvious. It bobs gently, squashes when pressed, and asks before leaving so a slip does not lose the child's place.
   Position: bottom-left for now. data-pos="tl" puts it in the top-left corner once a programme has made room in its top bar. */
(function () {
  if (window.top !== window.self) return;                       // not inside a frame
  const me = document.currentScript, home = me.dataset.home || '../demo/street.html', img = me.src.replace(/home\.js.*$/, 'home.webp');
  const top = me.dataset.pos === 'tl';
  const css = document.createElement('style');
  css.textContent = `#gpHome{position:fixed;${top ? 'top:10px' : 'bottom:10px'};left:10px;z-index:99990;width:84px;display:grid;justify-items:center;gap:2px;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;animation:gpHomeBob 2.6s ease-in-out infinite;border:0;background:none;padding:0}
#gpHome img{width:76px;height:auto;display:block;filter:drop-shadow(0 5px 4px rgba(0,0,0,.3));transition:transform .18s cubic-bezier(.3,1.7,.45,1)}
#gpHome:hover img{transform:scale(1.1) rotate(-4deg)}#gpHome:active img{transform:scale(.9,.82)}
#gpHome span{font:700 12px Fredoka,system-ui,sans-serif;color:#7a4b0c;background:#fff8e6;border-radius:999px;padding:2px 9px;box-shadow:0 2px 0 rgba(0,0,0,.15);white-space:nowrap}
@keyframes gpHomeBob{50%{transform:translateY(-4px)}}
#gpHomeAsk{position:fixed;inset:0;z-index:99995;background:rgba(20,20,50,.45);display:grid;place-items:center}
#gpHomeAsk div{background:#fffdf6;border-radius:28px;padding:22px 26px;text-align:center;box-shadow:0 14px 0 #ecd9a8,0 24px 50px rgba(0,0,0,.35);font:700 24px Fredoka,system-ui,sans-serif;color:#3b2a57;max-width:86vw}
#gpHomeAsk img{width:110px;display:block;margin:0 auto 8px}
#gpHomeAsk small{display:block;font:600 15px "Malgun Gothic",sans-serif;color:#8a6a2a;margin-top:2px}
#gpHomeAsk p{display:flex;gap:14px;justify-content:center;margin:16px 0 0}
#gpHomeAsk button{border:0;border-radius:999px;padding:12px 24px;font:700 20px Fredoka,system-ui,sans-serif;cursor:pointer}
#gpHomeAsk .yes{background:#2fbf83;color:#fff;box-shadow:0 5px 0 #1d8f6c}#gpHomeAsk .no{background:#fff;color:#3b2a57;box-shadow:0 5px 0 #d8cdf0}
@media (max-height:480px){#gpHome{width:66px}#gpHome img{width:58px}#gpHome span{font-size:10px}}`;
  const b = document.createElement('button'); b.id = 'gpHome'; b.title = 'Back to Story Street';
  b.innerHTML = `<img src="${img}" alt=""><span>Story Street</span>`;
  b.addEventListener('click', e => {
    e.stopPropagation(); if (document.getElementById('gpHomeAsk')) return;
    const ask = document.createElement('div'); ask.id = 'gpHomeAsk';
    ask.innerHTML = `<div><img src="${img}" alt="">Go back to Story Street?<small>스토리 스트리트로 돌아갈까요?</small><p><button class="yes">Yes!</button><button class="no">Stay here</button></p></div>`;
    ask.addEventListener('click', ev => { ev.stopPropagation(); if (ev.target.classList.contains('yes')) location.href = home; else if (ev.target === ask || ev.target.classList.contains('no')) ask.remove(); });
    document.body.appendChild(ask);
  });
  ['pointerdown', 'mousedown', 'touchstart'].forEach(t => b.addEventListener(t, e => e.stopPropagation()));   // a press on it is not a press on the game behind
  const add = () => { if (!document.getElementById('gpHome')) { document.head.appendChild(css); document.body.appendChild(b); } };
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
})();
