/* Sideways on upright phones (like GB Magic Library's phone frame): the GPFIS screens are landscape only.
   When the window is taller than it is wide, everything inside #rot is drawn turned 90°, so the child just turns the
   phone and sees the normal wide screen. On Android the first tap also asks for full screen and locks landscape
   (iPhones cannot do that from a web page, so they stay turned).
   Turn.W / Turn.H = the landscape width and height to lay the page out in.
   Turn.frac(e, el) = where a pointer event is inside el, as [x, y] fractions of el's own box (works turned or not).
   Turn.dx(e, start) = sideways movement since start {x, y} in the page's own direction (for swipes).
   Load after the #rot element; call Turn.update() at the start of the page's fit(). */
(function () {
  const rot = document.getElementById('rot');
  const T = window.Turn = {
    up: false, W: innerWidth, H: innerHeight,
    update() {
      const up = innerHeight > innerWidth;
      T.up = up; T.W = up ? innerHeight : innerWidth; T.H = up ? innerWidth : innerHeight;
      Object.assign(rot.style, { width: T.W + 'px', height: T.H + 'px', transform: up ? `translate(${innerWidth}px,0) rotate(90deg)` : '' });
      document.documentElement.classList.toggle('turned', up);
    },
    frac(e, el) {
      const r = el.getBoundingClientRect();
      return T.up ? [(e.clientY - r.top) / r.height, (r.right - e.clientX) / r.width] : [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    },
    dx(e, start) { return T.up ? e.clientY - start.y : e.clientX - start.x; },
  };
  addEventListener('pointerdown', function once() {
    removeEventListener('pointerdown', once, true);
    if (!matchMedia('(pointer: coarse)').matches) return;
    const d = document.documentElement;
    if (d.requestFullscreen && !document.fullscreenElement)
      d.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null).catch(() => {});
  }, true);
  T.update();
})();
