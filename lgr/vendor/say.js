/* Let's Go Readers: one way to speak (24 Nov 2026).
   Say(text or [part, part, ...], { who: 'penny' | 'gerry', slow })  -> Promise, resolves when everything has been said.
   Say.who = 'gerry'   sets the page's usual speaker.     Say.stop()   silence at once (always before the microphone).

   It plays Penny's and Gerry's RECORDED clips through the shared GPFIS voice kit when the page has loaded it
   (gpfis-site/voice/clips.js + gpfis-site/kit/voice.js); a line with no clip, or a page without the kit, falls back
   to the browser's own voice. Parts are said one after another, so "Almost! Listen." and "airplane" are two short
   recordings that serve every word, not one recording for every pair. Every fixed line is listed in
   app/voice-lines.json (tools/make_voice_lines.cjs): a new or reworded line must be added there to get a clip. */
(function () {
  let run = 0;
  const synth = (text, o) => new Promise(res => {
    if (window.Talk && Talk.say) return Talk.say(text, o).then(res);
    if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = o.slow ? .7 : .95; u.pitch = 1.25; u.onend = res; u.onerror = res;
    speechSynthesis.cancel(); speechSynthesis.speak(u); setTimeout(res, 800 + text.length * 120);
  });
  const one = (text, o) => window.Voice ? Voice.say(text, o) : synth(text, o);
  const Say = window.Say = async (parts, o = {}) => {
    const mine = ++run, list = (Array.isArray(parts) ? parts : [parts]).map(p => String(p == null ? '' : p).trim()).filter(Boolean);
    const opt = { who: o.who || Say.who, slow: !!o.slow };
    for (const p of list) { if (mine !== run) return; await one(p, opt); }
  };
  Say.who = 'penny';
  Say.stop = () => { run++; if (window.Voice) Voice.stop(); if ('speechSynthesis' in window) speechSynthesis.cancel(); };
})();
