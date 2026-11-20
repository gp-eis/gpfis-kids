// Source: Phonics Writing A-1, pages 8-9 (apple). Sentences: the boss's ChatGPT draft "My Apple", unchanged.
// Pictures: ChatGPT flat-vector cut-outs. Page colours chosen by hand: no red or salmon behind the red apples.
(function () {
  const YOLK = 'bg:#ffd23f', LAV = 'bg:#b9a3e3', BLUE = 'bg:#6fb1e4', MINT = 'bg:#8fd6c0', GRASS = '#4da863', TEAL = '#1f8a8a';
  window.LGR_BOOK = {
    id: 'a-apple', title: 'My Apple', cover: ['apple', 540, 230, 320, 0],
    pages: [
      { en: 'An apple {grows} on a tree.', ko: '사과가 나무에서 자라요.', scene: [BLUE, ['ground', 0, 400, 82, GRASS], ['tree', 250, 0, 440], ['apple', 340, 120, 60, 0], ['apple', 520, 80, 60, 0], ['apple', 440, 190, 60, 0, 'float'], ['apple', 580, 190, 60, 0]] },
      { en: 'An apple {falls} to the ground.', ko: '사과가 땅에 떨어져요.', scene: [YOLK, ['ground', 0, 400, 82, GRASS], ['tree', 90, 0, 440], ['apple', 190, 120, 60, 0], ['apple', 380, 110, 60, 0], ['lines-down', 650, 70, 1], ['apple', 630, 170, 110, 0, 'fall']] },
      { en: 'I {pick} an apple.', ko: '나는 사과를 따요.', scene: [LAV, ['ground', 0, 400, 82, TEAL], ['tree', 20, 0, 440], ['apple', 120, 120, 60, 0], ['apple', 300, 90, 60, 0], ['girl', 480, 200, 180, 0, 'hop'], ['apple', 548, 150, 60, 0], ['basket', 720, 270, 180], ['apple', 780, 300, 70, 0]] },
      { en: 'I {wash} an apple.', ko: '나는 사과를 씻어요.', scene: [MINT, ['tap', 370, 10, 300], ['drops', 400, 190, 1], ['apple', 330, 230, 210, 0]] },
      { en: 'I {peel} an apple.', ko: '나는 사과 껍질을 벗겨요.', scene: [YOLK, ['apple', 230, 90, 280, 0], ['peel', 560, 120, 240, 0, 'float']] },
      { en: 'I {cut} an apple in half.', ko: '나는 사과를 반으로 잘라요.', scene: [BLUE, ['board', 150, 330, 650], ['half', 230, 110, 230], ['half', 490, 110, 230]] },
      { en: 'I {eat} an apple.', ko: '나는 사과를 먹어요.', scene: [LAV, ['bitten', 320, 70, 300, 0], ['word', 650, 170, 1, 'crunch!']] },
      { en: 'I {share} an apple with my friend.', ko: '나는 친구와 사과를 나눠 먹어요.', scene: [YOLK, ['ground', 0, 410, 72, GRASS], ['girl', 140, 180, 190], ['boy', 680, 180, 118], ['half', 350, 170, 130, 0, 'float'], ['half', 500, 170, 130, 0, 'float']] },
      { en: 'I {make} apple juice.', ko: '나는 사과 주스를 만들어요.', scene: [MINT, ['apple', 130, 190, 210, 0], ['apple-green', 290, 250, 160, 0], ['juice', 560, 60, 240]] },
      { en: 'I {put} an apple in my bag.', ko: '나는 사과를 가방에 넣어요.', scene: [BLUE, ['bag', 300, 150, 340], ['apple', 405, 0, 130, 0, 'fall']] }
    ],
    activity: { find: [2, 3, 6], own: { en: 'I {eat} a sweet red apple.', ko: '나는 달콤한 빨간 사과를 먹어요.' } }
  };
})();
