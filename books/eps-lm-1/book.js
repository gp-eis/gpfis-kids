/* GP EPS Literacy and Math · Book 1 (March) — sample data for the GPFIS book reader.
   Pages: pages/<n>.webp, the printed PDF pages cut on the trim box (no corner marks, colour bars or grey strip) (D:\GP Books\GP EPS (Literacy and Math)).
   Positions are in the book's own page pixels (1563 x 2145, the PDF page as rendered at 1563 wide); the reader converts them.
   Answers, hints and explanations are written by us for the sample: GP should check them before anything goes live.

   Item kinds:
     num  { x, y, w, h, a: '10' | ['5','10'] }   a box the child types a number into (number pad)
     cmp  { x, y, r, a: '<' | '>' }               a circle the child fills with < or >
   Page fields: say (Penny reads it when the page opens), draw (pen page: no checking), right (shown when every item is right),
   hint (after a wrong try), and per-item why (shown if the child needs the answer after two tries). ko = Korean line (가 button). */
window.BOOK = {
  id: 'eps-lm-1', title: 'Literacy and Math', number: 1, month: 'March',
  pageSize: [1563, 2145], trim: [78, 78, 1406, 1989],   // the trim box the printer's corner marks point to, in page pixels
  pages: [
    { n: 0, say: 'Literacy and Math, book one! Let’s open it.' },
    { n: 4, say: 'This is your book. Let’s start!' },
    { n: 5, say: 'Today, it’s my younger sister’s birthday. We bought a cake and have a birthday party.' },
    { n: 6, draw: true, say: 'We cut the cake into four pieces and eat the cake. Please cut it! Draw two lines with the crayon.',
      right: 'Yummy! Two lines make four pieces.', ko: '선을 두 개 그으면 케이크가 네 조각이 돼요.' },
    { n: 7, say: 'Today, it’s my older brother’s birthday. Our family consists of six people. We bought a cake and have a birthday party.' },
    { n: 8, draw: true, say: 'We cut the cake into six pieces and eat the cake. Please cut it! Draw three lines with the crayon.',
      right: 'Six pieces, one for each person in the family!', ko: '선을 세 개 그으면 여섯 조각, 가족 한 명에 한 조각씩!' },
    { n: 9, draw: true, say: 'It’s a snake! Let’s run away. On the snake’s body, there are round spots. Draw round spots on the snake!' ,
      right: 'Round spots, like little balls!' },
    { n: 10, say: 'On each snake, there are ten spots. How many spots are there in total? Tap a box to write a number.',
      items: [
        { k: 'num', x: 447, y: 1482, w: 99, h: 83, a: '10' }, { k: 'num', x: 605, y: 1482, w: 99, h: 83, a: '10' },
        { k: 'num', x: 764, y: 1482, w: 99, h: 83, a: '10' }, { k: 'num', x: 922, y: 1482, w: 99, h: 83, a: '10' },
        { k: 'num', x: 1081, y: 1482, w: 99, h: 83, a: '10' }, { k: 'num', x: 1238, y: 1482, w: 99, h: 83, a: '50' },
        { k: 'num', x: 447, y: 1592, w: 99, h: 83, a: ['5', '10'], pair: 1 }, { k: 'num', x: 605, y: 1592, w: 81, h: 83, a: ['10', '5'], pair: 1 },
        { k: 'num', x: 750, y: 1592, w: 99, h: 83, a: '50' }],
      hint: 'Each snake has ten spots. Count the snakes: one, two, three, four, five.',
      right: 'Each snake has 10 spots, and there are 5 snakes. 10 + 10 + 10 + 10 + 10 = 50. Five tens make 50!',
      ko: '뱀마다 점이 10개, 뱀은 5마리. 10을 다섯 번 더하면 50이에요!' },
    { n: 11, draw: true, say: 'Don’t get bitten! On the snake’s body, there are oval spots. Draw oval spots on the snake!',
      right: 'Oval spots, like little eggs!' },
    { n: 12, say: 'On each snake, there are seven spots. How many spots are there in total?',
      items: [
        { k: 'num', x: 447, y: 1482, w: 99, h: 83, a: '7' }, { k: 'num', x: 605, y: 1482, w: 99, h: 83, a: '7' },
        { k: 'num', x: 764, y: 1482, w: 99, h: 83, a: '7' }, { k: 'num', x: 922, y: 1482, w: 99, h: 83, a: '7' },
        { k: 'num', x: 1081, y: 1482, w: 99, h: 83, a: '7' }, { k: 'num', x: 1238, y: 1482, w: 99, h: 83, a: '35' },
        { k: 'num', x: 447, y: 1592, w: 99, h: 83, a: ['5', '7'], pair: 1 }, { k: 'num', x: 605, y: 1592, w: 81, h: 83, a: ['7', '5'], pair: 1 },
        { k: 'num', x: 750, y: 1592, w: 99, h: 83, a: '35' }],
      hint: 'Each snake has seven spots. There are five snakes.',
      right: 'Each snake has 7 spots, and there are 5 snakes. 7 + 7 + 7 + 7 + 7 = 35, and 5 × 7 = 35!',
      ko: '뱀마다 점이 7개, 뱀은 5마리. 7을 다섯 번 더하면 35예요!' },
    { n: 13, say: 'Don’t be scared. If we solve the problem, the snakes will go away! Fill in the blanks with the correct numbers.',
      items: [
        { k: 'num', x: 255, y: 828, w: 135, h: 110, a: '37', why: 'Just before 38 comes 37.' },
        { k: 'num', x: 1008, y: 828, w: 135, h: 110, a: '40', why: '39, then 40, then 41.' },
        { k: 'num', x: 508, y: 1245, w: 135, h: 110, a: '53', why: '52, then 53, then 54.' },
        { k: 'num', x: 1258, y: 1245, w: 135, h: 110, a: '56', why: 'After 55 comes 56.' },
        { k: 'num', x: 1012, y: 1640, w: 128, h: 120, a: '90', why: 'After 89 comes 90.' },
        { k: 'num', x: 1265, y: 1640, w: 128, h: 120, a: '91', why: 'After 90 comes 91.' }],
      hint: 'The numbers go up by one. Say them out loud: thirty-eight, thirty-nine…',
      right: 'The snakes count up by one every time. Off they go!', ko: '숫자가 하나씩 커져요. 뱀들이 도망갔어요!' },
    { n: 14, say: 'Let’s be brave. The snake is back. Fill in the blanks with the correct numbers.',
      items: [
        { k: 'num', x: 273, y: 828, w: 135, h: 110, a: '47', why: 'Just before 48 comes 47.' },
        { k: 'num', x: 1025, y: 828, w: 135, h: 110, a: '50', why: '49, then 50, then 51.' },
        { k: 'num', x: 1028, y: 1240, w: 128, h: 120, a: '70', why: 'After 69 comes 70.' },
        { k: 'num', x: 1281, y: 1240, w: 128, h: 120, a: '71', why: 'After 70 comes 71.' },
        { k: 'num', x: 525, y: 1658, w: 135, h: 110, a: '73', why: '72, then 73, then 74.' },
        { k: 'num', x: 1278, y: 1658, w: 135, h: 110, a: '76', why: 'After 75 comes 76.' }],
      hint: 'Count up by one from the number before the blank.',
      right: 'Brave work! Every snake counts up by one.', ko: '용감해요! 숫자가 하나씩 커져요.' },
    { n: 15, say: 'Express the following equations in numbers. Read each sentence, then write it with numbers.',
      items: [
        ...[[495, '0', '6', '6'], [660, '0', '9', '9'], [826, '2', '0', '2'], [991, '2', '4', '6'], [1156, '3', '3', '0'],
            [1322, '4', '3', '7'], [1487, '5', '2', '3'], [1653, '5', '5', '10'], [1818, '5', '0', '5']]
          .flatMap(([y, a, b, c]) => [
            { k: 'num', x: 920, y: y - 42, w: 101, h: 84, a },
            { k: 'num', x: 1074, y: y - 42, w: 101, h: 84, a: b },
            { k: 'num', x: 1223, y: y - 42, w: 129, h: 84, a: c }])],
      hint: 'Zero is 0, six is 6. Write each number word as a number.',
      right: 'You turned the words into numbers! Zero plus six equals six is 0 + 6 = 6.',
      ko: '말로 된 식을 숫자로 바꿨어요! zero plus six equals six = 0 + 6 = 6' },
    { n: 16 }, { n: 17, say: 'Compare the two numbers. Tap the circle and choose: is it less than, or greater than?',
      items: [
        { k: 'cmp', x: 477, y: 826, r: 50, a: '<', why: '24 has 2 tens, 33 has 3 tens. 24 is less than 33.' },
        { k: 'cmp', x: 1090, y: 826, r: 50, a: '<', why: 'Both have 4 tens. 3 is less than 5, so 43 is less than 45.' },
        { k: 'cmp', x: 479, y: 1324, r: 50, a: '<', why: '49 has 4 tens, 53 has 5 tens. 49 is less than 53.' },
        { k: 'cmp', x: 1090, y: 1324, r: 50, a: '>', why: '97 has 9 tens, 69 has 6 tens. 97 is greater than 69.' },
        { k: 'cmp', x: 477, y: 1822, r: 50, a: '<', why: '28 has 2 tens, 47 has 4 tens. 28 is less than 47.' },
        { k: 'cmp', x: 1090, y: 1822, r: 50, a: '<', why: '67 has 6 tens, 76 has 7 tens. 67 is less than 76.' }],
      hint: 'Count the long towers first. More towers means a bigger number. The open mouth faces the bigger number.',
      right: 'Count the tens first! The open mouth always eats the bigger number.', ko: '십의 자리부터 비교해요! 벌린 입은 큰 수를 먹어요.' },
    ...[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(n => ({ n })),
  ],
};
