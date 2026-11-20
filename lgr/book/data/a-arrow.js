// Source: Phonics Writing A-1, pages 10-11 (arrow). Sentences: the boss's ChatGPT draft "My Arrow", unchanged.
// Pictures: ChatGPT flat-vector cut-outs. The arrow picture points RIGHT; turn = degrees clockwise.
(function () {
  const YOLK = 'bg:#ffd23f', SALMON = 'bg:#f6b3a3', LAV = 'bg:#b9a3e3', BLUE = 'bg:#6fb1e4', MINT = 'bg:#8fd6c0', GRASS = '#4da863', TEAL = '#1f8a8a';
  window.LGR_BOOK = {
    id: 'a-arrow', title: 'My Arrow', cover: ['arrow', 420, 360, 480, -24],
    pages: [
      { en: 'I {hold} an arrow.', ko: '나는 화살을 잡아요.', scene: [YOLK, ['ground', 0, 410, 72, GRASS], ['girl', 370, 190, 200], ['arrow', 320, 130, 300, 0]] },
      { en: 'I {see} an arrow.', ko: '나는 화살을 봐요.', scene: [MINT, ['ground', 0, 410, 72, TEAL], ['pointer', 110, 190, 160], ['arrow', 400, 110, 420, -20, 'float']] },
      { en: 'I {draw} an arrow.', ko: '나는 화살을 그려요.', scene: [SALMON, ['paper', 220, 50, 500], ['pencil', 560, 40, 180, 0, 'float']] },
      { en: 'I {point} an arrow at the target.', ko: '나는 화살을 과녁 쪽으로 겨눠요.', scene: [LAV, ['ground', 0, 410, 72, GRASS], ['target', 660, 100, 240], ['arrow', 90, 180, 290, 0], ['dots', 400, 222, 250]] },
      { en: 'I {shoot} an arrow.', ko: '나는 화살을 쏴요.', scene: [BLUE, ['ground', 0, 410, 72, GRASS], ['bow', 150, 50, 118], ['arrow', 250, 160, 320, 0, 'zoomr'], ['spark', 600, 150, 1.2]] },
      { en: 'An arrow {flies} through the air.', ko: '화살이 공중을 날아가요.', scene: [YOLK, ['cloud', 70, 330, 200, 'drift'], ['cloud', 660, 50, 180, 'drift'], ['arrow', 270, 170, 400, -18, 'float']] },
      { en: 'An arrow {hits} the target.', ko: '화살이 과녁에 맞아요.', scene: [MINT, ['ground', 0, 410, 72, TEAL], ['target', 500, 40, 340], ['arrow', 370, 170, 310, 0], ['spark', 610, 120, 1.3]] },
      { en: 'An arrow {moves} fast.', ko: '화살이 빠르게 움직여요.', scene: [SALMON, ['lines', 110, 150, 230], ['arrow', 400, 180, 420, 0, 'zoomr']] },
      { en: 'I {find} an arrow on the ground.', ko: '나는 땅에서 화살을 찾아요.', scene: [LAV, ['ground', 0, 330, 152, GRASS], ['boy', 150, 110, 120], ['arrow', 430, 350, 320, 6], ['spark', 760, 280, 1.2]] },
      { en: 'I {put} an arrow in my box.', ko: '나는 화살을 상자에 넣어요.', scene: [BLUE, ['box', 290, 210, 380], ['arrow', 350, 80, 260, 90, 'fall']] }
    ],
    activity: { find: [5, 6, 7], own: { en: 'An arrow {flies} high through the air.', ko: '화살이 공중을 높이 날아가요.' } }
  };
})();
