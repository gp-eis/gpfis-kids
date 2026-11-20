/* GP EPS Play and Speak · Book 1 (March) — data for the GPFIS book reader.
   Pages: pages/<n>.webp = the printed PDF pages cut on the trim box (D:\GP Books\GP EPS (Play and Speak)\GP EPS 1 - Play and Speak - 2026.pdf).
   n = the PDF page (printed page number = n - 3). Positions are in the PDF page's own pixels as rendered 1750 wide.
   This is a SPEAKING book: almost every page ends with the child saying a sentence.
   Week 1 (printed pages 2-9) has the full activities; the other pages open with Penny's line and the pen (mazes, writing)
   until their activities are built the same way. Answers and "why" lines are ours: GP should check them before going live.

   Item kinds used here (see reader.html):
     say   { x,y,r | x,y,w,h, text }   the speaker icon / a printed sentence: Penny says it, the child says it back
     pick  { opts, a | any, ask, say | says }   tap the right word (or the child's own choice), then SAY the sentence
     order { spots (in sentence order), text, from, nosay }   tap the word circles in order; the numbers appear
   The phone-number boxes on printed page 7 are left for paper: a child should not type a parent's number into a website. */
window.BOOK = {
  id: 'eps-ps-1', title: 'Play and Speak', number: 1, month: 'March',
  pageSize: [1750, 2403], trim: [87, 87, 1575, 2228],
  pages: [
    { n: 0, say: 'Play and Speak, book one! Let’s open it.' },
    { n: 4, say: 'This is your book. Let’s play and speak!' },
    /* ---------- Week 1 ---------- */
    { n: 5, draw: true, say: 'This is a restaurant. Follow the path with the pen. Then tap the speaker and say the words.',
      right: 'You said it! Friends eat together.',
      items: [{ k: 'say', x: 755, y: 2110, r: 72, text: 'Don’t eat alone. Let’s be friends.' }] },
    { n: 6, draw: true, say: 'My friend is… Write your friend’s name and age with the pen. Then say the sentence and tap the words in order.',
      right: 'Thank you for being my friend!', hint: 'Listen to the sentence again. Which word comes next?',
      items: [{ k: 'say', x: 262, y: 1445, r: 70, text: 'Thank you for being my friend.' },
        { k: 'order', nosay: true, from: 1, text: 'Thank you for being my friend.', spots: [[327, 1650], [699, 2076], [297, 2015], [778, 1630], [442, 1870], [759, 1855]] }] },
    { n: 7, draw: true, say: 'How do you feel when you eat alone? Tap your answer and say it. Then try the mazes with the pen.',
      right: 'Thank you for telling me how you feel.',
      items: [{ k: 'pick', any: true, ask: 'How do you feel when you eat alone?', opts: [[228, 758, 570, 90], [228, 915, 480, 90], [228, 1075, 580, 90]],
        says: ['I feel lonely.', 'I feel sad.', 'I feel relaxed.'] }] },
    { n: 8, draw: true, say: 'My best friend. Write about your best friend with the pen. Then tap the yellow sentences and say them.',
      right: 'Your friend is lucky to have you!',
      items: [{ k: 'say', x: 150, y: 1235, w: 700, h: 105, text: 'We are good friends.' },
        { k: 'say', x: 150, y: 1525, w: 1010, h: 105, text: 'Thank you for being my friend.' }] },
    { n: 9, draw: true, say: 'We eat pizza together. Follow the pizza slices with the pen. Then say the words.',
      right: 'Yummy! We eat pizza together.',
      items: [{ k: 'say', x: 285, y: 1822, r: 62, text: 'We eat pizza together.' },
        { k: 'say', x: 470, y: 1985, w: 480, h: 170, text: 'Let’s sit on a chair and eat.' }] },
    { n: 10, draw: true, say: 'Let’s order takeout! Say the sentence. Then tap the words in order.',
      right: 'The pizza is on its way!', hint: 'Listen to the sentence again. Which word comes next?',
      items: [{ k: 'say', x: 252, y: 1410, r: 70, text: 'Please deliver the pizza to our home.' },
        { k: 'order', nosay: true, from: 1, text: 'Please deliver the pizza to our home.', spots: [[282, 1617], [291, 2015], [1059, 1553], [680, 1583], [763, 2065], [698, 1817], [270, 1860]] }] },
    { n: 11, draw: true, say: 'Where do you want to sit? Tap your answer and say it. Then try the mazes with the pen.',
      right: 'Good choice! Let’s sit down.',
      items: [{ k: 'pick', any: true, ask: 'Where do you want to sit?', opts: [[180, 645, 660, 90], [190, 855, 640, 90], [170, 1060, 680, 90]],
        says: ['I want to sit on the chair.', 'I want to sit on the sofa.', 'I want to sit on the bench.'] }] },
    { n: 12, say: 'I want to eat pizza! Tap the correct word in each sentence. Then say the sentence.',
      right: 'You can order a pizza in English!', hint: 'Read the sentence with each word. Which one sounds right?',
      items: [
        { k: 'pick', a: 0, opts: [[783, 518, 58, 88], [876, 518, 94, 88]], say: 'Hello! I want to order a pizza.', why: 'We say a pizza.' },
        { k: 'pick', a: 0, opts: [[320, 710, 168, 88], [530, 710, 174, 88]], say: 'How much is the pizza?', why: 'We ask how much for a price.' },
        { k: 'pick', a: 0, opts: [[593, 900, 176, 88], [816, 900, 112, 88]], say: 'How much is a bottle of coke?', why: 'Coke comes in a bottle.' },
        { k: 'pick', a: 0, opts: [[320, 1090, 138, 88], [503, 1090, 98, 88]], say: 'How long will it take to deliver?', why: 'We ask how long for time.' },
        { k: 'pick', a: 0, opts: [[376, 1280, 208, 88], [628, 1280, 188, 88]], say: 'Please deliver the pizza to my address.', why: 'Deliver means bring it to me.' }] },
    /* ---------- Weeks 2-4: open with the pen; activities to be built like Week 1 ---------- */
    { n: 13, draw: true, say: 'Let’s eat chicken together. Follow the path and say the words.' },
    { n: 14, draw: true, say: 'My family is… Write about your family. Then say: I love my family.' },
    { n: 15, draw: true, say: 'What do you eat with? Choose one and say it. Then try the mazes.' },
    { n: 16, draw: true, say: 'My lovely family. Write about your family.' },
    { n: 17, draw: true, say: 'Let’s eat cookies together. Follow the path and say the words.' },
    { n: 18, draw: true, say: 'How much is it? A cookie costs one dollar.' },
    { n: 19, draw: true, say: 'Cookies crumble. What else crumbles?' },
    { n: 20, draw: true, say: 'I went shopping. Circle the words and solve the math problem.' },
    { n: 21, draw: true, say: 'Let’s eat together. Follow the path and say the words.' },
    { n: 22, draw: true, say: 'Say hello. Write the order of the sentences.' },
    { n: 23, draw: true, say: 'What do people say during a day?' },
    { n: 24, draw: true, say: 'How to make a salad. Write the number order.' },
    { n: 25, draw: true, say: 'Let’s eat pie together. Find the pie in the center.' },
    { n: 26, draw: true, say: 'When shall we meet? Draw the time on the clocks.' },
    { n: 27, draw: true, say: 'When do you eat together?' },
    { n: 28, draw: true, say: 'What time do you wake up? Draw the time on the clock.' },
    { n: 29, draw: true, say: 'Don’t play alone. Follow the right path and say the words.' },
    { n: 30, draw: true, say: 'Where should we play?' },
    { n: 31, draw: true, say: 'Where do you enjoy playing?' },
    { n: 32, draw: true, say: 'Do’s and don’ts. Read the rules of playing together.' },
    { n: 33, draw: true, say: 'Let’s play together. Follow the right path and say the words.' },
    { n: 34, draw: true, say: 'How many people are there in a team?' },
    { n: 35, draw: true, say: 'What are you two? Are you friends?' },
    { n: 36, draw: true, say: 'Rules for sports. Choose the correct answer for each sport.' },
    { n: 37, draw: true, say: 'Write about your friends. Then write about your family.' },
    { n: 38, draw: true, say: 'Write about how to make appointments. Then write about sports rules.' },
    { n: 39, draw: true, say: 'Make your own story using this book.' },
  ],
};
