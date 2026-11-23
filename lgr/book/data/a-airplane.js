// Source: Phonics Writing A-1, pages 2-3 (airplane). Sentences: the boss's ChatGPT draft "My Airplane", unchanged.
// Pictures (v2, 2026-11-19): the plane and the family are ChatGPT flat-vector cut-outs (design/chatgpt, one chat);
// backgrounds are chosen by hand per page so the plane's white body and blue wings always stand out (no blue pages).
// scene = layers back to front in a 948 x 482 picture: 'bg:#colour', then [name, x, y, width, turn, motion] or a prop.
(function () {
  const YOLK = 'bg:#ffd23f', SALMON = 'bg:#f6b3a3', LAV = 'bg:#b9a3e3', MINT = 'bg:#8fd6c0', GRASS = '#4da863', TEALG = '#1f8a8a';
  window.LGR_BOOK = {
    id: 'a-airplane', title: 'My Airplane', cover: ['plane', 330, 300, 600, 6],
    pages: [
      { en: 'I {see} an airplane.', ko: '나는 비행기를 봐요.', scene: [YOLK, ['cloud', 60, 70, 170, 'drift'], ['ground', 0, 400, 82, GRASS], ['plane', 400, 40, 480, 0, 'float'], ['pointer', 110, 206, 150]] },
      { en: 'An airplane {flies} in the sky.', ko: '비행기가 하늘을 날아요.', scene: [MINT, ['cloud', 40, 330, 220, 'drift'], ['cloud', 700, 40, 180, 'drift'], ['cloud', 620, 380, 150, 'drift'], ['plane', 170, 90, 600, 4, 'float']] },
      { en: 'An airplane {carries} people.', ko: '비행기는 사람들을 태워요.', scene: [LAV, ['ground', 0, 400, 82, TEALG], ['plane', 330, 60, 600, 0], ['dad', 40, 196, 116], ['mum', 160, 204, 108], ['girl', 268, 280, 124, 0, 'hop'], ['boy', 398, 282, 74]] },
      { en: 'An airplane {moves} fast.', ko: '비행기는 빠르게 움직여요.', scene: [YOLK, ['plane', 110, 100, 600, 0, 'zoom'], ['lines', 730, 150, 170]] },
      { en: 'An airplane {takes off}.', ko: '비행기가 이륙해요.', scene: [SALMON, ['runway', 0, 396, 86], ['plane', 190, 40, 580, 14, 'float']] },
      { en: 'An airplane {flies} over the clouds.', ko: '비행기가 구름 위를 날아요.', scene: [LAV, ['plane', 190, 30, 580, 0, 'float'], ['cloud', -30, 390, 230], ['cloud', 160, 420, 200], ['cloud', 340, 385, 250], ['cloud', 560, 420, 210], ['cloud', 740, 390, 230]] },
      { en: 'An airplane {crosses} the sea.', ko: '비행기가 바다를 건너요.', scene: [YOLK, ['water', 0, 342, 140], ['plane', 200, 30, 560, 0, 'float']] },
      { en: 'An airplane {lands} at the airport.', ko: '비행기가 공항에 착륙해요.', scene: [MINT, ['runway', 0, 396, 86], ['tower', 110, 246, 54], ['plane', 300, 110, 560, -9]] },
      { en: 'I {take} an airplane with my family.', ko: '나는 가족과 함께 비행기를 타요.', scene: [SALMON, ['ground', 0, 420, 62, TEALG], ['plane', 420, 20, 500, 0, 'float'], ['dad', 60, 150, 140], ['mum', 210, 160, 132], ['boy', 356, 262, 88], ['girl', 452, 250, 150, 0, 'hop']] },
      { en: 'I {love} flying in an airplane.', ko: '나는 비행기를 타고 나는 것을 좋아해요.', scene: [YOLK, ['ground', 0, 420, 62, GRASS], ['plane', 400, 70, 500, 4, 'float'], ['girl', 120, 210, 190, 0, 'hop'], ['heart', 80, 110, 1.1], ['heart', 330, 60, .8], ['heart', 380, 330, 1], ['heart', 860, 370, .9]] }
    ],
    activity: { find: [1, 4, 7], own: { en: 'I want to {fly} in an airplane.', ko: '나는 비행기를 타고 날고 싶어요.' } }
  };
})();
