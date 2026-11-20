// STAND-IN content until the books arrive: from the boss's sample "My Lovely House" (content/boss-samples.md).
// One file per unit, so a new unit needs new data rather than new code.
window.PP_UNIT = {
  id: 'c-m9-ou-house', level: 'C', no: 9,
  title: 'My Lovely House',
  team: 'ou', teamSay: 'ow', teamLine: 'o and u make one sound: ow!',
  reading: [
    { text: 'Look! Look! I see a house.', show: ['big', 'small', 'red', 'brown'], glow: 'big' },
    { text: 'A big house.', glow: 'big' },
    { text: 'A small house.', glow: 'small' },
    { text: 'A red house.', glow: 'red' },
    { text: 'A brown house.', glow: 'brown' },
    { text: 'Wow! So many houses!', glow: 'all' },
    { text: 'This is my house.', glow: 'big' },
    { text: 'I love my house!', glow: 'big' }
  ],
  // say = stand-in spoken sounds for each tile. South is left out: it has no picture.
  words: [
    { word: 'house', pic: 'house', parts: ['h', 'ou', 'se'], say: ['huh', 'ow', 'ss'], extra: 'oa' },
    { word: 'mouth', pic: 'mouth', parts: ['m', 'ou', 'th'], say: ['mm', 'ow', 'th'], extra: 'ee' },
    { word: 'loud', pic: 'loud', parts: ['l', 'ou', 'd'], say: ['ll', 'ow', 'duh'], extra: 'ai' }
  ],
  speak: [
    { ask: 'What do you see?', answer: 'I see a house.' },
    { ask: 'Is it big or small?', answer: 'It is big!' },
    { ask: 'Where is your house?', answer: 'This is my house!' }
  ],
  // Picking between teams that can sound alike; dictation = 받아쓰기.
  complete: { words: ['house', 'mouth', 'loud'], choices: ['ou', 'ow', 'oa'] },
  dictation: ['house', 'mouth', 'loud'],
  own: { prompt: 'Draw your own house!', say: 'This is my house.' }
};
