// Pictures for the reading books, in the worksheet style: flat vector shapes on bold solid backgrounds, drawn in code.
// Main objects are built from parts so they can move (jaw, tail, legs, leaf...). A scene is a list of layers:
//   'sky' | 'river' | 'soil' | 'wood' | 'apples' | 'plain:#hex'      background (plain ones take the page's bold colour)
//   [name, x, y, width, turn, motion]                                  a main object (see ITEMS)
//   [name, x, y, size, extra]                                          a small prop (see PROPS)
(function () {
  const C = { ink: '#2b2d3a', tomato: '#e8492e', clay: '#b5371f', salmon: '#f6b3a3', grass: '#4da863', forest: '#1f6b4a', blue: '#6fb1e4', deep: '#3d7fb8',
    mustard: '#e3b23c', yolk: '#ffd23f', teal: '#1f8a8a', hot: '#f277a8', lav: '#b9a3e3', paper: '#fffaf0', wood: '#c98a4b', bark: '#8a5a3c', skin: '#f3c9a5' };
  const BG = {};   // every page takes the next bold colour, so no two pages in a row look the same
  const CYCLE = [C.yolk, C.blue, C.salmon, C.lav, '#8fd6c0'];
  const GROUND = { '#7cc373': C.grass, '#c9a476': C.wood, '#b98a62': C.wood };

  // ---- main objects: [viewBox width, height, drawing] ----
  const ITEMS = {
    airplane: [600, 290, () => '<g transform="rotate(9 300 145)">' +
      '<path d="M470 150 L560 60 L590 60 L548 160Z" fill="' + C.deep + '"/>' +                                  // tail fin
      '<path d="M40 150 Q40 108 120 104 L520 104 Q575 110 575 150 Q575 186 520 190 L120 190 Q40 190 40 150Z" fill="#fff"/>' +
      '<path d="M40 150 Q44 120 92 108 L92 150Z" fill="' + C.ink + '" opacity=".85"/>' +                         // cockpit
      '<path d="M250 170 L420 170 L300 282 L262 282Z" fill="' + C.salmon + '"/>' +                               // near wing
      '<path d="M270 110 L390 110 L330 30 L306 30Z" fill="' + C.salmon + '" opacity=".75"/>' +                   // far wing
      '<rect x="270" y="196" width="74" height="34" rx="17" fill="' + C.ink + '"/>' +                            // engine
      [150, 196, 242, 288, 334, 380, 426, 472].map(x => '<rect x="' + x + '" y="126" width="24" height="26" rx="8" fill="' + C.blue + '"/>').join('') +
      '<path d="M500 150 L580 138 L586 160 L506 172Z" fill="' + C.deep + '"/></g>'],
    alligator: [620, 250, (open) => {
      const jaw = open ? -26 : -5;
      return '<g class="p-tail"><path d="M430 150 Q540 120 610 60 Q600 150 440 200Z" fill="' + C.forest + '"/></g>' +
        '<rect x="170" y="205" width="46" height="40" rx="14" fill="' + C.forest + '"/><rect x="380" y="205" width="46" height="40" rx="14" fill="' + C.forest + '"/>' +
        '<path d="M130 150 Q150 96 300 104 Q440 108 470 160 Q450 216 300 220 Q150 220 130 190Z" fill="' + C.grass + '"/>' +                 // body
        [210, 262, 314, 366, 418].map(x => '<path d="M' + x + ' 106 l22 -30 l22 30Z" fill="' + C.forest + '"/>').join('') +             // back plates
        '<path d="M8 182 Q10 168 150 164 L170 214 Q60 220 8 198Z" fill="' + C.grass + '"/>' +                                             // lower jaw
        [34, 62, 90, 118].map(x => '<path d="M' + x + ' 170 l9 -16 l9 16Z" fill="#fff"/>').join('') +
        '<g class="p-jaw" style="--jaw:' + jaw + 'deg"><path d="M8 152 Q14 118 120 116 Q170 90 196 130 L176 168 Q60 168 8 166Z" fill="' + C.grass + '"/>' +
        [30, 58, 86, 114].map(x => '<path d="M' + x + ' 164 l9 16 l9 -16Z" fill="#fff"/>').join('') +
        '<circle cx="150" cy="120" r="19" fill="#fff"/><circle cx="146" cy="120" r="9" fill="' + C.ink + '"/><circle cx="26" cy="138" r="5" fill="' + C.forest + '"/></g>';
    }],
    'alligator-mouth': [620, 250, () => ITEMS.alligator[2](true)],
    ant: [540, 330, () => {
      const leg = (x, d, cls) => '<path class="' + cls + '" d="M' + x + ' 190 q' + d + ' 60 ' + (d * 1.6) + ' 120" stroke="' + C.ink + '" stroke-width="13" fill="none" stroke-linecap="round"/>';
      return leg(250, -34, 'p-leg') + leg(290, 6, 'p-leg2') + leg(320, 44, 'p-leg') +
        '<path d="M96 110 Q70 50 30 44 M122 100 Q120 40 90 18" stroke="' + C.ink + '" stroke-width="10" fill="none" stroke-linecap="round" class="p-ant"/>' +
        '<ellipse cx="420" cy="170" rx="112" ry="80" fill="' + C.ink + '"/><ellipse cx="282" cy="176" rx="60" ry="46" fill="' + C.ink + '"/>' +
        '<ellipse cx="150" cy="150" rx="74" ry="62" fill="' + C.ink + '"/>' +
        '<ellipse cx="400" cy="150" rx="46" ry="20" fill="#fff" opacity=".18"/>' +
        '<circle cx="122" cy="140" r="17" fill="#fff"/><circle cx="118" cy="142" r="8" fill="' + C.ink + '"/>' +
        '<path d="M96 182 Q118 196 140 184" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>';
    }],
    'ant-top': [540, 330, () => '<g transform="translate(540 0) scale(-1 1)">' + ITEMS.ant[2]() + '</g>'],
    apple: [380, 400, (col) => '<path d="M190 96 Q196 40 236 16" stroke="' + C.bark + '" stroke-width="14" fill="none" stroke-linecap="round"/>' +
      '<g class="p-leaf"><path d="M214 60 Q280 0 348 44 Q290 98 214 60Z" fill="' + C.grass + '"/></g>' +
      '<path d="M190 110 C120 60 20 110 30 230 C40 340 130 400 190 370 C250 400 340 340 350 230 C360 110 260 60 190 110Z" fill="' + (col || C.tomato) + '"/>' +
      '<ellipse cx="104" cy="190" rx="26" ry="46" fill="#fff" opacity=".35" transform="rotate(18 104 190)"/>'],
    'apple-green': [380, 400, () => ITEMS.apple[2]('#8bc34a')],
    cookie: [250, 230, () => '<path d="M125 8 L160 62 L226 52 L196 112 L240 164 L172 172 L150 226 L104 180 L40 206 L52 140 L8 92 L74 76Z" fill="' + C.mustard + '" stroke="' + C.wood + '" stroke-width="10" stroke-linejoin="round"/>' +
      [[100, 100], [150, 120], [120, 150], [164, 84]].map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + C.bark + '"/>').join('')],
    'cookie-round': [240, 240, () => '<circle cx="120" cy="120" r="108" fill="' + C.mustard + '" stroke="' + C.wood + '" stroke-width="10"/>' +
      [[80, 90], [150, 80], [110, 150], [166, 146], [124, 112]].map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="' + C.bark + '"/>').join('')],
    arrow: [400, 400, () => '<path d="M352 48 L60 340" stroke="' + C.bark + '" stroke-width="14" stroke-linecap="round"/>' +                 // points down-left
      '<path d="M22 378 L44 290 L110 356Z" fill="' + C.ink + '"/>' +
      '<path d="M352 48 l-10 -44 l44 10 l-34 34Z M318 82 l-10 -44 l44 10Z" fill="' + C.tomato + '"/><path d="M352 48 l44 10 l-10 34Z" fill="' + C.yolk + '"/>'],
    target: [340, 340, () => [[166, '#fff'], [134, C.ink], [102, C.deep], [70, C.tomato], [36, C.yolk]].map(r => '<circle cx="170" cy="170" r="' + r[0] + '" fill="' + r[1] + '"/>').join('')],
    ax: [600, 210, () => '<rect x="120" y="70" width="470" height="34" rx="17" fill="' + C.mustard + '"/><rect x="430" y="70" width="160" height="34" rx="17" fill="' + C.tomato + '"/>' +
      '<path d="M60 40 L150 44 L150 132 L190 200 L20 200 Q44 120 60 40Z" fill="' + C.ink + '"/><path d="M20 200 L190 200 L172 168 L34 168Z" fill="#cfd4dc"/>']
  };
  ITEMS.half = [220, 240, (side) => '<path d="M110 30 C40 10 0 90 20 160 C36 220 90 240 110 226 C130 240 184 220 200 160 C220 90 180 10 110 30Z" fill="' + C.tomato + '"/>' +
    '<path d="M110 50 C56 36 30 98 42 152 C54 200 92 216 110 206 C128 216 166 200 178 152 C190 98 164 36 110 50Z" fill="#fff6dc"/>' +
    '<ellipse cx="' + (side === 'l' ? 96 : 124) + '" cy="130" rx="7" ry="13" fill="' + C.bark + '"/>'];

  // ---- small props, drawn at (x, y) with a size; e = extra ----
  const P = {
    cloud: (x, y, w) => '<g transform="translate(' + x + ' ' + y + ') scale(' + w / 200 + ')"><rect y="30" width="200" height="50" rx="25" fill="#fff"/><circle cx="70" cy="34" r="34" fill="#fff"/><circle cx="124" cy="40" r="26" fill="#fff"/></g>',
    ground: (x, y, h, c) => '<rect x="0" y="' + y + '" width="948" height="' + (482 - y) + '" fill="' + (GROUND[c] || c || C.grass) + '"/>',
    runway: (x, y) => '<rect x="0" y="' + y + '" width="948" height="' + (482 - y) + '" fill="' + C.ink + '"/>' + [0, 1, 2, 3, 4, 5, 6].map(i => '<rect x="' + (20 + i * 140) + '" y="' + (y + 38) + '" width="80" height="10" rx="5" fill="' + C.yolk + '"/>').join(''),
    water: (x, y) => '<rect x="0" y="' + y + '" width="948" height="' + (482 - y) + '" fill="' + C.deep + '"/><g class="m-drift">' + [0, 1].map(r => '<path d="M-40 ' + (y + 26 + r * 52) + ' ' + Array.from({ length: 13 }, () => 'q20 -18 40 0 t40 0').join(' ') + '" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>').join('') + '</g>',
    tower: (x, y) => '<rect x="' + x + '" y="' + y + '" width="54" height="150" fill="#fff"/><rect x="' + (x - 26) + '" y="' + (y - 50) + '" width="106" height="58" rx="12" fill="' + C.yolk + '"/><rect x="' + (x - 12) + '" y="' + (y - 38) + '" width="78" height="26" rx="6" fill="' + C.ink + '"/>',
    person: (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(0 -100)"><rect x="0" y="36" width="54" height="64" rx="22" fill="' + c + '"/><circle cx="27" cy="22" r="22" fill="' + C.skin + '"/></g>',
    windows: (x, y) => '<rect x="' + x + '" y="' + y + '" width="470" height="136" rx="68" fill="#fff"/>' + [C.bark, C.ink, C.mustard, C.bark].map((c, i) => { const cx = x + 76 + i * 106, s = i > 1 ? .84 : 1; return '<g transform="translate(' + cx + ' ' + (y + 68) + ') scale(' + s + ')"><rect x="-44" y="-52" width="88" height="104" rx="42" fill="' + C.blue + '"/><circle cy="12" r="28" fill="' + C.skin + '"/><path d="M-30 4 a30 30 0 0 1 60 0Z" fill="' + c + '"/><path d="M-9 22 a9 8 0 0 0 18 0Z" fill="' + C.ink + '"/></g>'; }).join(''),
    hearts: () => [[110, 90], [800, 80], [850, 320], [110, 340], [490, 50]].map((p, i) => '<path class="m-float" style="animation-delay:' + i * .3 + 's" transform="translate(' + p[0] + ' ' + p[1] + ')" d="M0 14 C-30 -20 -58 14 0 54 C58 14 30 -20 0 14Z" fill="' + C.tomato + '"/>').join(''),
    heart: (x, y, s) => '<path class="m-float" style="animation-delay:' + (x % 7) / 10 + 's" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')" d="M0 14 C-30 -20 -58 14 0 54 C58 14 30 -20 0 14Z" fill="' + C.tomato + '"/>',
    eyes: (x, y, s) => [0, 150].map(d => '<circle cx="' + (x + d + 65) + '" cy="' + (y + 60) + '" r="65" fill="#fff"/><circle cx="' + (x + d + 84) + '" cy="' + (y + 38) + '" r="27" fill="' + C.ink + '"/>').join(''),
    lines: (x, y, w) => [[0, 0, 1], [30, 62, .75], [-10, 124, 1.05], [40, 186, .6]].map((l, i) => '<rect class="m-dash" style="animation-delay:' + i * .12 + 's" x="' + (x + l[0]) + '" y="' + (y + l[1]) + '" width="' + w * l[2] + '" height="12" rx="6" fill="#fff"/>').join(''),
    'lines-down': (x, y) => [0, 40, 80].map((d, i) => '<rect x="' + (x + d) + '" y="' + (y - i % 2 * 20) + '" width="10" height="60" rx="5" fill="#fff"/>').join(''),
    sun: (x, y, s) => '<circle cx="' + (x + s / 2) + '" cy="' + (y + s / 2) + '" r="' + s / 2 + '" fill="' + C.yolk + '"/>',
    sleepy: (x, y, s) => '<circle cx="' + (x + 75) + '" cy="' + (y + 60) + '" r="74" fill="#fff"/><path d="M' + (x + 30) + ' ' + (y + 56) + ' q18 20 36 0 M' + (x + 84) + ' ' + (y + 56) + ' q18 20 36 0" stroke="' + C.ink + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="' + (x + 100) + '" cy="' + (y + 150) + '" r="16" fill="#fff"/>',
    fish: (x, y, s) => '<g class="m-float" transform="translate(' + x + ' ' + y + ') scale(' + s / 170 + ')"><path d="M20 50 Q70 0 130 50 Q70 100 20 50Z" fill="' + C.hot + '"/><path d="M120 50 L170 14 L170 86Z" fill="' + C.hot + '"/><circle cx="50" cy="44" r="8" fill="' + C.ink + '"/></g>',
    meat: (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s / 170 + ')"><rect x="96" y="60" width="74" height="20" rx="10" fill="#fff"/><circle cx="168" cy="60" r="12" fill="#fff"/><circle cx="168" cy="80" r="12" fill="#fff"/><ellipse cx="66" cy="70" rx="62" ry="50" fill="' + C.clay + '"/><ellipse cx="54" cy="62" rx="24" ry="16" fill="' + C.tomato + '"/></g>',
    arcs: (x, y, s) => '<path class="m-blink" d="M' + x + ' ' + y + ' q40 -50 80 -40 M' + (x + 20) + ' ' + (y + 50) + ' q50 -30 90 -10" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>',
    hill: (x, y, w) => '<path d="M' + (x - 60) + ' 482 Q' + (x + w / 2) + ' ' + (y - 160) + ' ' + (x + w + 60) + ' 482Z" fill="' + C.grass + '"/>',
    spark: (x, y, s) => '<g class="m-blink" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"><path d="M30 0 L38 22 L60 30 L38 38 L30 60 L22 38 L0 30 L22 22Z" fill="#fff"/><path d="M80 50 L84 62 L96 66 L84 70 L80 82 L76 70 L64 66 L76 62Z" fill="#fff"/></g>',
    hole: (x, y, w) => '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + 60) + '" rx="' + w / 2 + '" ry="56" fill="' + C.bark + '"/><ellipse cx="' + (x + w / 2) + '" cy="' + (y + 72) + '" rx="' + w / 2.6 + '" ry="36" fill="' + C.ink + '"/>',
    dirt: (x, y) => [[0, 0], [40, -40], [90, -10], [-30, -60], [70, -70]].map((p, i) => '<circle class="m-float" style="animation-delay:' + i * .2 + 's" cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" r="' + (10 + i * 2) + '" fill="' + C.bark + '"/>').join(''),
    sweat: (x, y) => [[0, 0], [60, -30], [130, -6]].map(p => '<path class="m-blink" d="M' + (x + p[0]) + ' ' + (y + p[1]) + ' q-16 26 0 36 q16 -10 0 -36Z" fill="#fff"/>').join(''),
    anthill: (x, y, w) => '<path d="M' + x + ' 482 Q' + (x + w / 2) + ' ' + (y - 90) + ' ' + (x + w) + ' 482Z" fill="' + C.bark + '"/><ellipse cx="' + (x + w / 2) + '" cy="' + (y + 150) + '" rx="44" ry="56" fill="' + C.ink + '"/>',
    tree: (x, y, w) => '<rect x="' + (x + w / 2 - 28) + '" y="' + (y + 250) + '" width="56" height="150" fill="' + C.bark + '"/><circle cx="' + (x + w / 2) + '" cy="' + (y + 160) + '" r="160" fill="' + C.forest + '"/><circle cx="' + (x + w / 2 - 120) + '" cy="' + (y + 210) + '" r="90" fill="' + C.forest + '"/><circle cx="' + (x + w / 2 + 120) + '" cy="' + (y + 210) + '" r="90" fill="' + C.forest + '"/>',
    basket: (x, y, w) => '<path d="M' + x + ' ' + (y + 30) + ' h' + w + ' l-22 90 h-' + (w - 44) + 'Z" fill="' + C.wood + '"/><path d="M' + (x + 20) + ' ' + (y + 30) + ' q' + (w / 2 - 20) + ' -90 ' + (w - 40) + ' 0" stroke="' + C.bark + '" stroke-width="12" fill="none"/><rect x="' + (x - 8) + '" y="' + (y + 22) + '" width="' + (w + 16) + '" height="20" rx="10" fill="' + C.bark + '"/>',
    tap: (x, y, w) => '<rect x="' + (x + 40) + '" y="' + y + '" width="50" height="90" fill="#fff"/><rect x="' + x + '" y="' + (y + 70) + '" width="130" height="44" rx="22" fill="#fff"/><rect x="' + (x + 6) + '" y="' + (y + 100) + '" width="40" height="40" rx="8" fill="#fff"/>',
    drops: (x, y) => [[0, 0], [70, 30], [150, 10], [210, 60], [-30, 70]].map((p, i) => '<path class="m-fall" style="animation-delay:' + i * .25 + 's" d="M' + (x + p[0]) + ' ' + (y + p[1]) + ' q-18 30 0 42 q18 -12 0 -42Z" fill="#fff"/>').join(''),
    peel: (x, y, w) => '<path class="m-float" d="M' + x + ' ' + y + ' q80 20 40 70 t60 80 t-30 90" stroke="' + C.tomato + '" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' q80 20 40 70 t60 80 t-30 90" stroke="#fff6dc" stroke-width="10" fill="none" stroke-linecap="round" class="m-float"/>',
    board: (x, y, w) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="110" rx="26" fill="' + C.wood + '"/><circle cx="' + (x + w - 50) + '" cy="' + (y + 55) + '" r="16" fill="' + C.bark + '"/>',
    bite: (x, y, s, c) => '<circle cx="' + (x + s / 2) + '" cy="' + (y + s / 2) + '" r="' + s / 2 + '" fill="var(--bg)"/><circle cx="' + (x + s * .2) + '" cy="' + (y + s * 1.05) + '" r="' + s / 3 + '" fill="var(--bg)"/>',
    word: (x, y, s, w) => '<text class="m-blink" x="' + x + '" y="' + (y + 40) + '" font-family="Fredoka" font-weight="700" font-size="54" fill="#fff" transform="rotate(8 ' + x + ' ' + y + ')">' + w + '</text>',
    glass: (x, y, w) => '<path d="M' + x + ' ' + y + ' h' + w + ' l-26 300 h-' + (w - 52) + 'Z" fill="#fff" opacity=".9"/><path d="M' + (x + 8) + ' ' + (y + 90) + ' h' + (w - 16) + ' l-18 198 h-' + (w - 52) + 'Z" fill="' + C.mustard + '"/><rect x="' + (x + w * .62) + '" y="' + (y - 70) + '" width="14" height="260" rx="7" fill="' + C.tomato + '" transform="rotate(12 ' + (x + w * .62) + ' ' + y + ')"/>',
    bag: (x, y, w) => '<path d="M' + (x + 70) + ' ' + (y + 40) + ' q' + (w / 2 - 70) + ' -120 ' + (w - 140) + ' 0" stroke="' + C.ink + '" stroke-width="18" fill="none"/><rect x="' + x + '" y="' + (y + 30) + '" width="' + w + '" height="250" rx="46" fill="' + C.tomato + '"/><rect x="' + (x + 50) + '" y="' + (y + 150) + '" width="' + (w - 100) + '" height="100" rx="24" fill="' + C.clay + '"/>',
    paper: (x, y, w) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="380" rx="16" fill="#fff" transform="rotate(-4 ' + (x + w / 2) + ' ' + (y + 190) + ')"/><path class="m-draw" d="M' + (x + 380) + ' ' + (y + 90) + ' L' + (x + 120) + ' ' + (y + 290) + ' m0 0 l10 -70 m-10 70 l70 -6" stroke="' + C.ink + '" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    pencil: (x, y, w) => '<g class="m-float" transform="translate(' + x + ' ' + y + ') rotate(40)"><rect width="40" height="170" fill="' + C.yolk + '"/><rect y="-34" width="40" height="34" rx="10" fill="' + C.hot + '"/><path d="M0 170 h40 l-20 44Z" fill="' + C.skin + '"/><path d="M12 196 h16 l-8 18Z" fill="' + C.ink + '"/></g>',
    dots: (x, y, w) => '<path d="M' + x + ' ' + y + ' h' + w + '" stroke="#fff" stroke-width="10" stroke-dasharray="2 26" stroke-linecap="round"/>',
    bow: (x, y, s) => '<path d="M' + (x + 60) + ' ' + y + ' q-150 ' + s / 2 + ' 0 ' + s + '" stroke="' + C.bark + '" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M' + (x + 60) + ' ' + y + ' L' + (x + 130) + ' ' + (y + s / 2) + ' L' + (x + 60) + ' ' + (y + s) + '" stroke="#fff" stroke-width="5" fill="none"/>',
    box: (x, y, w) => '<path d="M' + x + ' ' + (y + 40) + ' h' + w + ' v190 h-' + w + 'Z" fill="' + C.wood + '"/><path d="M' + (x - 30) + ' ' + y + ' l30 40 h' + w + ' l30 -40Z" fill="' + C.bark + '"/><rect x="' + (x + w / 2 - 50) + '" y="' + (y + 110) + '" width="100" height="50" rx="12" fill="#fff"/>',
    card: (x, y, w) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="290" rx="36" fill="#fff"/>',
    log: (x, y, w) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="112" rx="20" fill="' + C.bark + '"/><ellipse cx="' + (x + w / 2) + '" cy="' + (y + 4) + '" rx="' + w / 2 + '" ry="24" fill="' + C.skin + '"/><ellipse cx="' + (x + w / 2) + '" cy="' + (y + 4) + '" rx="' + w / 4 + '" ry="11" fill="none" stroke="' + C.wood + '" stroke-width="5"/>',
    logsplit: (x, y, w) => [[-14, -8], [14, 8]].map((r, i) => '<g transform="rotate(' + r[0] + ' ' + (x + w / 2) + ' ' + (y + 150) + ')"><rect x="' + (x + i * w / 2 + r[1]) + '" y="' + y + '" width="' + (w / 2 - 10) + '" height="140" rx="18" fill="' + C.bark + '"/><rect x="' + (x + i * w / 2 + r[1] + (i ? 0 : w / 2 - 34)) + '" y="' + y + '" width="24" height="140" fill="' + C.skin + '"/></g>').join(''),
    shed: (x, y, w, e) => '<rect x="' + x + '" y="' + (y + 110) + '" width="' + w + '" height="232" fill="' + C.clay + '"/><path d="M' + (x - 30) + ' ' + (y + 118) + ' L' + (x + w / 2) + ' ' + y + ' L' + (x + w + 30) + ' ' + (y + 118) + 'Z" fill="' + C.ink + '"/>' + (e === 'closed' ? '<rect x="' + (x + w / 2 - 90) + '" y="' + (y + 150) + '" width="180" height="192" fill="' + C.mustard + '"/><path d="M' + (x + w / 2) + ' ' + (y + 150) + ' v192" stroke="' + C.clay + '" stroke-width="6"/>' : '<rect x="' + (x + w / 2 - 90) + '" y="' + (y + 150) + '" width="180" height="192" fill="' + C.ink + '"/>'),
    lock: (x, y, s) => '<path d="M' + (x + 18) + ' ' + (y + 40) + ' v-14 a27 27 0 0 1 54 0 v14" stroke="#fff" stroke-width="12" fill="none"/><rect x="' + x + '" y="' + (y + 38) + '" width="90" height="70" rx="14" fill="#fff"/><circle cx="' + (x + 45) + '" cy="' + (y + 70) + '" r="10" fill="' + C.ink + '"/>',
    weight: (x, y, s) => [0, 60, 120].map((d, i) => '<path class="m-fall" style="animation-delay:' + i * .2 + 's" d="M' + (x + d) + ' ' + y + ' v70 m-22 -24 l22 26 l22 -26" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>').join('')
  };

  // ---- pictures made in ChatGPT in the same flat style (cut out with tools/greenkey.py): name → [width, height, file] ----
  const IMG = { plane: [1100, 621, "plane"], dad: [322, 708, "people/dad"], mum: [301, 691, "people/mum"], girl: [350, 502, "people/girl"], boy: [208, 501, "people/boy"], pointer: [302, 511, "people/pointer"],
    apple: [384, 423, "apple/apple"], "apple-green": [382, 421, "apple/green"], half: [409, 407, "apple/half"], bitten: [370, 429, "apple/bitten"], peel: [351, 383, "apple/peel"], juice: [302, 464, "apple/juice"],
    tree: [526, 507, "apple/tree"], basket: [479, 488, "apple/basket"], bag: [473, 446, "apple/bag"], tap: [392, 246, "apple/tap"],
    arrow: [483, 135, "arrow/arrow"], target: [449, 460, "arrow/target"], bow: [192, 537, "arrow/bow"], box: [519, 326, "arrow/box"], pencil: [350, 354, "arrow/pencil"], fish: [474, 356, "arrow/fish"],
    ax: [634, 224, "ax/ax"], "dad-hold": [312, 622, "ax/dad-hold"], "dad-carry": [311, 619, "ax/dad-carry"], log: [236, 351, "ax/log"], split: [371, 344, "ax/split"], shed: [523, 440, "ax/shed"], shedlock: [481, 433, "ax/shedlock"],
    meat: [304, 391, "misc/meat"], cookie: [322, 310, "misc/cookie"], "cookie-round": [302, 301, "misc/cookie-round"], anthill: [459, 275, "misc/anthill"] };
  const pic = (f, x, y, w, h, cls) => "<image" + (cls ? " class=\"" + cls + "\"" : "") + " href=\"art/" + f + ".webp\" x=\"" + x + "\" y=\"" + y + "\" width=\"" + w + "\" height=\"" + h + "\"/>";
  for (const k in IMG) { ITEMS[k] = [IMG[k][0], IMG[k][1], () => pic(IMG[k][2], 0, 0, IMG[k][0], IMG[k][1])]; delete P[k]; }
  // Joined from separate ChatGPT parts so each part can move: the jaw opens, the tail wags, the legs step.
  ITEMS.alligator = [1300, 500, (open, sleep) => "<g class=\"p-tail\">" + pic("alligator/tail", 800, 70, 481, 296) + "</g>" +
    pic("alligator/leg1", 440, 310, 130, 155, "p-leg") + pic("alligator/leg2", 720, 296, 160, 172, "p-leg2") +
    "<g class=\"p-jawlow\" style=\"--jaw:" + (open ? -15 : -2) + "deg\">" + pic("alligator/jaw", 40, 256, 395, 140) + "</g>" +
    pic("alligator/body", 330, 150, 563, 226) +
    "<g class=\"p-jaw\" style=\"--jaw:" + (open ? 20 : 2) + "deg\">" + pic("alligator/head", 20, 104, 415, 226) +
    (sleep ? "<circle cx=\"335\" cy=\"187\" r=\"47\" fill=\"#54a459\"/><path d=\"M306 190 q29 26 58 0\" stroke=\"#1f6b4a\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/>" : "") + "</g>"];
  ITEMS["alligator-sleep"] = [1300, 500, () => ITEMS.alligator[2](false, true)];
  ITEMS["alligator-mouth"] = [1300, 500, () => ITEMS.alligator[2](true)];
  ITEMS.ant = [1010, 860, () => pic("ant/antenna", 30, 10, 190, 246, "p-ant") + pic("ant/antenna", 110, 0, 170, 220, "p-ant") +
    pic("ant/leg", 240, 540, 180, 290, "p-leg") + pic("ant/leg", 400, 550, 180, 290, "p-leg2") + pic("ant/leg", 600, 540, 180, 290, "p-leg") +
    pic("ant/body", 60, 240, 903, 361)];
  // Dad chopping: two ChatGPT poses (ax up, ax down) shown in turn, feet in the same place.
  ITEMS["dad-chop"] = [480, 760, () => pic("ax/dad-up", 0, 0, 344, 748, "f-a") + pic("ax/dad-down", 30, 190, 436, 566, "f-b")];
  ITEMS["ant-top"] = [1010, 860, () => "<g transform=\"translate(1010 0) scale(-1 1)\">" + ITEMS.ant[2]() + "</g>"];

  const MOTION = { hop: 'm-hop', float: 'm-float', zoom: 'm-zoom', zoomr: 'm-zoomr', swim: 'm-swim', wag: 'm-wag', fall: 'm-fall', chop: 'm-chop', drift: 'm-drift' };
  function item(name, x, y, w, rot, cls, extra) {
    const [vw, vh, draw] = ITEMS[name], s = w / vw;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') rotate(' + (rot || 0) + ' ' + vw / 2 + ' ' + vh / 2 + ')"><g class="' + (MOTION[cls] || '') + (name === 'alligator-mouth' ? ' open' : '') + '">' + draw(extra) + '</g></g>';
  }
  function render(scene, i) {
    const b = scene[0], bg = /^bg:/.test(b) ? b.slice(3) : BG[b] || CYCLE[i % CYCLE.length];   // 'bg:#hex' = a colour chosen by hand for this page
    let out = '<svg viewBox="0 0 948 482" preserveAspectRatio="xMidYMid slice" style="--bg:' + bg + '"><rect width="948" height="482" fill="' + bg + '"/>';
    scene.slice(1).forEach(l => {
      const n = l[0];
      if (n === 'half') out += item('half', l[1], l[2], l[3], 0, '', l[4]);
      else if (ITEMS[n]) out += item(n, l[1], l[2], l[3], l[4], l[5]);
      else if (P[n]) out += (l[4] === 'drift' ? '<g class="m-drift">' + P[n](l[1], l[2], l[3]) + '</g>' : P[n](l[1], l[2], l[3], l[4]));
    });
    return out + '</svg>';
  }
  // One object alone, for covers, the shelf and the collected pages.
  function icon(name, w) { const [vw, vh, draw] = ITEMS[name]; return '<svg viewBox="0 0 ' + vw + ' ' + vh + '" width="' + w + '">' + draw() + '</svg>'; }
  window.LGR_SCENE = { render, icon, C, item };
})();
