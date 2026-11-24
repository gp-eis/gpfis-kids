/* Let's Go Readers: the child's own voice, kept ON THIS DEVICE only (24 Nov 2026; owner's rule: children's
   recordings stay on the device until accounts exist). Nothing here is ever sent anywhere.
   Speak (app/sheet) saves the child's take of every line; My Speaking Book (app/speakbook) plays them back.
     MyVoice.put('a-airplane:0', blobOrObjectUrl)   keep a take (line 1 of My Airplane); a newer take replaces it
     MyVoice.get('a-airplane:0') -> Blob | null
     MyVoice.keys() -> ['a-airplane:0', ...]
     MyVoice.clear()                                 forget everything (kingdom.html?reset=1 calls it)
   Stored in the browser's IndexedDB "lgr-voice". Every call resolves quietly if the browser refuses storage. */
(function () {
  let p;
  const db = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open('lgr-voice', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const run = (mode, fn, empty) => db().then(d => new Promise(res => { const q = fn(d.transaction('clips', mode).objectStore('clips'));
    q.onsuccess = () => res(q.result == null ? empty : q.result); q.onerror = () => res(empty); })).catch(() => empty);
  window.MyVoice = {
    put: async (key, clip) => { try { const blob = typeof clip === 'string' ? await fetch(clip).then(r => r.blob()) : clip; if (!blob || !blob.size) return false;
      return run('readwrite', s => s.put(blob, key), false).then(() => true); } catch (e) { return false; } },
    get: key => run('readonly', s => s.get(key), null),
    keys: () => run('readonly', s => s.getAllKeys(), []),
    clear: () => run('readwrite', s => s.clear(), null)
  };
})();
