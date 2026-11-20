// Source: Phonics Writing A-1, pages 4-5 (alligator). Sentences: the boss's ChatGPT draft "My Alligator", unchanged.
// Pictures: ChatGPT flat-vector parts joined in scene.js (jaws, tail and legs move). Page colours chosen by hand:
// never green or mint behind the green alligator, and never blue behind the blue water.
(function () {
  const YOLK = 'bg:#ffd23f', SALMON = 'bg:#f6b3a3', LAV = 'bg:#b9a3e3', BLUE = 'bg:#6fb1e4', SAND = '#c98a4b';
  window.LGR_BOOK = {
    id: 'a-alligator', title: 'My Alligator', cover: ['alligator', 260, 330, 660, 0],
    pages: [
      { en: 'An alligator {lives} in a river.', ko: '악어는 강에서 살아요.', scene: [YOLK, ['sun', 760, 30, 120], ['alligator', 170, 150, 620, 0], ['water', 0, 350, 132]] },
      { en: 'An alligator {swims} in the water.', ko: '악어는 물속에서 헤엄쳐요.', scene: [LAV, ['alligator', 180, 110, 620, 0, 'swim'], ['water', 0, 290, 192]] },
      { en: 'An alligator {opens} its mouth.', ko: '악어는 입을 벌려요.', scene: [SALMON, ['ground', 0, 400, 82, SAND], ['alligator-mouth', 110, 110, 780, 0]] },
      { en: 'An alligator {closes} its eyes.', ko: '악어는 눈을 감아요.', scene: [BLUE, ['ground', 0, 400, 82, SAND], ['alligator-sleep', 150, 160, 660, 0], ['word', 250, 90, 1, 'z z z']] },
      { en: 'An alligator {crawls} on the ground.', ko: '악어는 땅 위를 기어가요.', scene: [YOLK, ['ground', 0, 380, 102, SAND], ['alligator', 130, 150, 640, 0, 'zoom'], ['lines', 800, 250, 110]] },
      { en: 'An alligator {catches} a fish.', ko: '악어는 물고기를 잡아요.', scene: [LAV, ['alligator-mouth', 300, 110, 620, 0], ['fish', 90, 200, 190, 0, 'float'], ['water', 0, 350, 132]] },
      { en: 'An alligator {eats} meat.', ko: '악어는 고기를 먹어요.', scene: [SALMON, ['ground', 0, 400, 82, SAND], ['meat', 150, 250, 120, -20], ['alligator-mouth', 290, 150, 620, 0]] },
      { en: 'An alligator {hides} in the water.', ko: '악어는 물속에 숨어요.', scene: [YOLK, ['alligator', 170, 150, 620, 0], ['water', 0, 262, 220]] },
      { en: 'An alligator {moves} its tail.', ko: '악어는 꼬리를 움직여요.', scene: [BLUE, ['ground', 0, 400, 82, SAND], ['alligator', 110, 160, 660, 0, 'wag'], ['arcs', 790, 130, 120]] },
      { en: 'An alligator {rests} in the sun.', ko: '악어는 햇볕 아래에서 쉬어요.', scene: [SALMON, ['sun', 720, 30, 160], ['ground', 0, 400, 82, SAND], ['alligator-sleep', 130, 160, 660, 0]] }
    ],
    activity: { find: [1, 2, 5], own: { en: 'An alligator {swims} in the river.', ko: '악어는 강에서 헤엄쳐요.' } }
  };
})();
