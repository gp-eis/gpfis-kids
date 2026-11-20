// Source: Phonics Writing A-1, pages 6-7 (ant).
// DRAFT TEXT BY CLAUDE: the boss has not sent a text for "ant". Written in her pattern (10 sentences, a different verb each).
// Pictures: ChatGPT flat-vector parts joined in scene.js (legs and antennae move). No yellow behind the golden cookies.
(function () {
  const YOLK = 'bg:#ffd23f', SALMON = 'bg:#f6b3a3', LAV = 'bg:#b9a3e3', BLUE = 'bg:#6fb1e4', MINT = 'bg:#8fd6c0', SAND = '#c98a4b', GRASS = '#4da863', TEAL = '#1f8a8a';
  window.LGR_BOOK = {
    id: 'a-ant', title: 'My Ant', cover: ['ant', 480, 220, 430, 0], draft: true,
    pages: [
      { en: 'I {see} an ant.', ko: '나는 개미를 봐요.', scene: [MINT, ['ground', 0, 400, 82, SAND], ['boy', 130, 150, 120], ['ant', 470, 150, 340, 0]] },
      { en: 'An ant {walks} on the ground.', ko: '개미가 땅 위를 걸어요.', scene: [SALMON, ['ground', 0, 400, 82, SAND], ['ant', 230, 90, 410, 0, 'zoom'], ['lines', 700, 200, 120]] },
      { en: 'An ant {climbs} a hill.', ko: '개미가 언덕을 올라가요.', scene: [BLUE, ['hill', 120, 230, 760], ['ant', 300, 20, 300, 24]] },
      { en: 'An ant {finds} a cookie.', ko: '개미가 쿠키를 찾아요.', scene: [LAV, ['ground', 0, 400, 82, TEAL], ['cookie', 110, 220, 210], ['spark', 70, 150, 1.2], ['ant', 440, 110, 390, 0]] },
      { en: 'An ant {carries} the cookie.', ko: '개미가 쿠키를 옮겨요.', scene: [MINT, ['ground', 0, 400, 82, SAND], ['ant', 220, 110, 400, 0, 'zoom'], ['cookie', 450, 60, 170, -10]] },
      { en: 'An ant {digs} a hole.', ko: '개미가 구멍을 파요.', scene: [SALMON, ['ground', 0, 360, 122, SAND], ['hole', 130, 330, 330], ['dirt', 280, 250, 1], ['ant', 440, 70, 390, -12]] },
      { en: 'An ant {works} hard.', ko: '개미는 열심히 일해요.', scene: [BLUE, ['ground', 0, 400, 82, SAND], ['cookie-round', 70, 120, 150], ['cookie', 150, 250, 160], ['cookie-round', 40, 270, 140], ['ant', 400, 100, 400, 0, 'zoom'], ['sweat', 450, 70, 1]] },
      { en: 'An ant {helps} its friends.', ko: '개미는 친구들을 도와요.', scene: [LAV, ['ground', 0, 400, 82, TEAL], ['cookie-round', 380, 60, 190], ['ant-top', 40, 150, 330, 0], ['ant', 580, 150, 330, 0]] },
      { en: 'An ant {goes} home.', ko: '개미가 집으로 가요.', scene: [MINT, ['ground', 0, 390, 92, SAND], ['anthill', 560, 180, 350], ['ant-top', 110, 110, 330, 0, 'zoomr']] },
      { en: 'I {like} the little ant.', ko: '나는 작은 개미가 좋아요.', scene: [YOLK, ['ground', 0, 420, 62, GRASS], ['girl', 90, 210, 190, 0, 'hop'], ['ant', 440, 130, 340, 0, 'float'], ['heart', 60, 100, 1], ['heart', 340, 70, .8], ['heart', 860, 110, 1], ['heart', 380, 330, .8]] }
    ],
    activity: { find: [1, 4, 5], own: { en: 'An ant {carries} a big cookie.', ko: '개미가 큰 쿠키를 옮겨요.' } }
  };
})();
