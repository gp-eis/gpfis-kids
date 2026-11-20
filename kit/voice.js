/* GPFIS shared voice — Penny and Gerry speak with RECORDED clips, so they are heard on every phone
   (the phone's own reading voice is missing in KakaoTalk's browser and on many Korean Android phones:
   the GB Magic Library problem of 12 Nov 2026).

   Voice.say(text, { who: 'penny' | 'gerry', slow, lang })  -> Promise, resolves when the line ends
   Voice.stop()            Voice.mute(true | false)

   A line's clip is found from the words themselves (Voice.id(text)), so pages need no line numbers:
   voice/<who>/<id>.mp3, listed in voice/clips.js (window.GPCLIPS), made by tools/make_voice.cjs.
   A line with no clip (a number that changes, Korean) falls back to the phone's reading voice.
   Phones only allow sound after a touch: the first tap anywhere switches the player on.
   Right now the clips are the free Windows stand-in voice (voice/made-with.txt); real voices replace the files later. */
(function () {
  const here = (document.currentScript && document.currentScript.src || '').replace(/kit\/voice\.js.*$/, '');
  const norm = t => String(t).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim();
  const id = t => { let h = 2166136261; for (const c of norm(t)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
  const PITCH = { penny: 1.4, gerry: 1.15 };
  const a = new Audio(); a.preload = 'auto';
  let muted = false, unlocked = false, done = null;
  const finish = () => { const d = done; done = null; if (d) d(); };
  a.onended = finish; a.onerror = finish;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; const p = a.play(); if (p) p.catch(() => {}); } catch (e) {}
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}   // iPhone: play even with the silent switch on
  }
  addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);
  function synth(text, o) {
    return new Promise(res => {
      if (!('speechSynthesis' in window)) return res();
      const u = new SpeechSynthesisUtterance(text.replace(/×/g, ' times ').replace(/</g, ' less than ').replace(/>/g, ' greater than '));
      u.lang = o.lang || 'en-US'; u.pitch = PITCH[o.who] || 1.3; u.rate = o.slow ? .7 : 1; u.onend = res; u.onerror = res;
      speechSynthesis.cancel(); speechSynthesis.speak(u); setTimeout(res, 900 + text.length * 110);   // never hang on a silent phone
    });
  }
  const V = window.Voice = {
    id, norm,
    has(text, who = 'penny') { const c = (window.GPCLIPS || {})[who]; return !!(c && c[id(text)]); },
    stop() { try { a.pause(); } catch (e) {} if ('speechSynthesis' in window) speechSynthesis.cancel(); finish(); },
    mute(m) { muted = !!m; if (muted) V.stop(); },
    say(text, o = {}) {
      V.stop(); if (muted || !text) return Promise.resolve();
      const who = o.who || 'penny';
      if ((o.lang || 'en-US') !== 'en-US' || !V.has(text, who)) return synth(text, { ...o, who });
      return new Promise(res => {
        done = res; a.src = here + 'voice/' + who + '/' + id(text) + '.mp3'; a.playbackRate = o.slow ? .78 : 1;
        const p = a.play(); if (p) p.catch(() => { done = null; synth(text, { ...o, who }).then(res); });
      });
    },
  };
})();
