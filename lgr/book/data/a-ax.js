// Source: Phonics Writing A-1, pages 12-13 (ax). Sentences: the boss's ChatGPT draft "My Ax", unchanged.
// To raise with her: sentences 1, 2 and 4 have the child holding and using an ax. The pictures show Dad, never a child, with the ax: he holds it by the handle
// with the sharp edge pointing away from him (user, 2026-11-19: he must really hold it, blade never toward the person).
// Pictures: ChatGPT flat-vector cut-outs. No yellow behind the yellow ax handle.
(function () {
  const SALMON = 'bg:#f6b3a3', LAV = 'bg:#b9a3e3', BLUE = 'bg:#6fb1e4', MINT = 'bg:#8fd6c0', GRASS = '#4da863', SAND = '#c98a4b', TEAL = '#1f8a8a';
  window.LGR_BOOK = {
    id: 'a-ax', title: 'My Ax', cover: ['ax', 360, 380, 540, -14],
    pages: [
      { en: 'I {have} an ax.', ko: '나는 도끼를 가지고 있어요.', scene: [BLUE, ['card', 174, 96, 600], ['ax', 224, 150, 500, 0]] },
      { en: 'I {hold} an ax.', ko: '나는 도끼를 잡아요.', scene: [MINT, ['ground', 0, 410, 72, GRASS], ['dad-hold', 370, 60, 190]] },
      { en: 'I {see} an ax.', ko: '나는 도끼를 봐요.', scene: [LAV, ['ground', 0, 410, 72, TEAL], ['pointer', 110, 190, 160], ['ax', 400, 110, 470, -6]] },
      { en: 'Dad {uses} an ax to cut wood.', ko: '아빠는 도끼로 나무를 잘라요.', scene: [SALMON, ['ground', 0, 400, 82, SAND], ['log', 170, 225, 170], ['ax', 205, 92, 430, 0, 'chop']] },
      { en: 'Dad {carries} an ax.', ko: '아빠가 도끼를 옮겨요.', scene: [BLUE, ['ground', 0, 410, 72, GRASS], ['lines', 170, 190, 120], ['dad-carry', 390, 62, 190, 0, 'zoomr']] },
      { en: 'Dad {chops} wood with an ax.', ko: '아빠가 도끼로 장작을 패요.', scene: [MINT, ['ground', 0, 410, 72, SAND], ['log', 455, 262, 150], ['dad-chop', 200, 30, 270]] },
      { en: 'An ax {cuts} the wood.', ko: '도끼가 나무를 잘라요.', scene: [LAV, ['ground', 0, 410, 72, SAND], ['split', 300, 190, 290], ['ax', 395, 40, 430, -14], ['spark', 330, 110, 1.3]] },
      { en: 'I {put} the ax in the shed.', ko: '나는 도끼를 창고에 넣어요.', scene: [SALMON, ['ground', 0, 400, 82, GRASS], ['shed', 470, 70, 410], ['ax', 90, 250, 340, -8, 'zoomr']] },
      { en: 'The ax {looks} heavy.', ko: '도끼가 무거워 보여요.', scene: [BLUE, ['ground', 0, 400, 82, SAND], ['weight', 400, 50, 150], ['ax', 190, 220, 560, 0]] },
      { en: 'We {keep} the ax in a safe place.', ko: '우리는 도끼를 안전한 곳에 보관해요.', scene: [MINT, ['ground', 0, 400, 82, GRASS], ['shedlock', 264, 26, 420]] }
    ],
    activity: { find: [4, 5, 6], own: { en: 'Dad {chops} big wood with an ax.', ko: '아빠가 도끼로 큰 장작을 패요.' } }
  };
})();
