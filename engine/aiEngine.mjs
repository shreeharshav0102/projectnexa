/**
 * Nexa AI Engine — framework-agnostic, dependency-free.
 * Runs in the browser (Vite), in Vercel serverless functions, and in plain Node (Render).
 *
 * Special features beyond a plain chatbot:
 *  - Safe math evaluator (recursive-descent parser, no eval)
 *  - Unit converter (km/mi, kg/lb, C/F, cm/in, m/ft, l/gal...)
 *  - Real code template generation (16 curated templates)
 *  - Extractive text summarizer (frequency-scored sentences)
 *  - Text statistics, case converters, Base64, lorem ipsum
 *  - Password / UUID / palette / dice generators
 *  - Story & poem generators, jokes, facts, quotes, dictionary
 *  - Sentiment-aware fallbacks + persona modulation
 */

/* ================================ utilities ================================ */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* ============================== knowledge bases ============================ */

const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'A SQL query walks into a bar, sees two tables and asks... "Mind if I JOIN you?"',
  'There are only 10 kinds of people: those who understand binary and those who don\'t.',
  'Why did the developer go broke? He used up all his cache.',
  'Debugging: being the detective in a crime movie where you are also the murderer.',
  'Why do Java developers wear glasses? Because they don\'t C#.',
  'I told my computer I needed a break. It said "Why? I\'m the one doing all the processing."',
  'A programmer\'s wife says: "Go to the store and get a loaf of bread. If they have eggs, get a dozen." He comes home with 12 loaves of bread.',
  'Why was the JavaScript developer sad? He didn\'t Node how to Express himself.',
  'What\'s a programmer\'s favorite hangout place? The Foo Bar.',
  'Why did the function break up with the loop? It needed some space and less iteration.',
  'How many programmers does it take to change a light bulb? None — that\'s a hardware problem.',
  'Real programmers count from 0.',
  'Why do Python programmers prefer snake_case? Because they can\'t CamelCase.',
  'The best thing about a boolean is that even if you\'re wrong, you\'re only off by a bit.',
  'I would tell you a UDP joke, but you might not get it.',
  'There\'s no place like 127.0.0.1.',
  'Why did the AI go to art school? It wanted to learn how to draw conclusions.',
];

const FACTS = [
  'The first computer bug was an actual moth, found taped into a logbook at Harvard in 1947.',
  'The entire internet weighs roughly the same as a strawberry — that\'s the estimated mass of all its electrons in motion.',
  'Honey never spoils. Archaeologists have tasted 3,000-year-old honey from Egyptian tombs and found it edible.',
  'The first 1GB hard drive, released in 1980, weighed over 500 pounds and cost $40,000.',
  'Octopuses have three hearts, and two of them stop beating when they swim.',
  'The average person walks the equivalent of five times around the world in a lifetime.',
  'There are more possible chess games than atoms in the observable universe.',
  'The QWERTY keyboard layout was designed in 1873 to slow typists down and prevent typewriter jams.',
  'Bananas are berries, but strawberries are not — botanically speaking.',
  'The first computer programmer was Ada Lovelace, who wrote an algorithm in the 1840s — before computers existed.',
  'Around 90% of the world\'s data was created in just the last few years.',
  'A single bolt of lightning is about five times hotter than the surface of the Sun.',
  'The Firefox logo is not a fox — it\'s a red panda.',
  'Sound travels about 4.3 times faster in water than in air.',
  'NASA\'s Voyager 1, launched in 1977, still sends data from interstellar space using less power than a fridge light bulb.',
  'The word "robot" comes from the Czech word "robota", meaning forced labor.',
  'Your brain generates about 20 watts of electrical power — enough to dim a small light bulb.',
  'Email existed before the World Wide Web — the first was sent in 1971.',
];

const QUOTES = [
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { text: 'It\'s not a bug — it\'s an undocumented feature.', author: 'Anonymous' },
  { text: 'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.', author: 'Bill Gates' },
  { text: 'The function of good software is to make the complex appear simple.', author: 'Grady Booch' },
  { text: 'Stay hungry, stay foolish.', author: 'Stewart Brand' },
];

const DEFINITIONS = {
  api: 'An **API** (Application Programming Interface) is a set of rules that lets two programs talk to each other. Think of it as a waiter: you (the client) tell the waiter (the API) what you want, and the kitchen (the server) prepares it — you never enter the kitchen yourself.',
  recursion: '**Recursion** is when a function calls itself to solve smaller pieces of a problem. It needs a base case to stop — otherwise it runs forever, like two mirrors facing each other.',
  closure: 'A **closure** is a function that "remembers" variables from the scope where it was created, even after that scope has finished running. It\'s how JavaScript achieves private state.',
  javascript: '**JavaScript** is the programming language of the web. Created in just 10 days in 1995, it now runs in every browser, on servers (Node.js), and even on satellites and robots.',
  typescript: '**TypeScript** is JavaScript with a type system added on top. It catches bugs before your code runs and compiles down to plain JavaScript.',
  python: '**Python** is a high-level language famous for readable, almost English-like syntax. It dominates AI, data science, automation and web backends.',
  react: '**React** is a JavaScript library for building user interfaces out of reusable components. It updates the page efficiently using a "virtual DOM" diffing algorithm.',
  node: '**Node.js** is a runtime that lets JavaScript run outside the browser — most commonly to build servers and APIs. It uses an event-driven, non-blocking model.',
  html: '**HTML** (HyperText Markup Language) is the skeleton of every web page — it defines structure: headings, paragraphs, links, images and forms.',
  css: '**CSS** (Cascading Style Sheets) is the styling language of the web — colors, layouts, fonts and animations. "Cascading" means styles flow down and the most specific rule wins.',
  database: 'A **database** is an organized store of data that can be searched and updated efficiently. Relational ones (PostgreSQL, MySQL) use tables; NoSQL ones (MongoDB) use documents or key-values.',
  sql: '**SQL** (Structured Query Language) is the language for talking to relational databases: SELECT to read, INSERT to add, UPDATE to change, DELETE to remove.',
  git: '**Git** is a version-control system that tracks every change in your code, lets you branch and merge safely, and powers collaboration via GitHub.',
  algorithm: 'An **algorithm** is a step-by-step recipe for solving a problem — like binary search, which finds a name in a sorted list of a billion entries in about 30 steps.',
  'machine learning': '**Machine learning** is a branch of AI where computers learn patterns from data instead of being explicitly programmed — like spam filters that improve with every email.',
  ai: '**AI (Artificial Intelligence)** is software that performs tasks which normally require human intelligence — understanding language, recognizing images, reasoning and creating.',
  cloud: '**Cloud computing** means renting computing power over the internet instead of owning servers — you pay for what you use, and it scales on demand.',
  frontend: 'The **frontend** is everything users see and touch in an app — built with HTML, CSS and JavaScript (or frameworks like React). This very chat UI is frontend.',
  backend: 'The **backend** is the server side of an app — APIs, databases and business logic that users never see directly. This app\'s `/api/chat` endpoint is its backend.',
  vercel: '**Vercel** is a cloud platform for deploying web apps — you push code to Git and it builds and hosts it globally, with serverless functions for backends.',
  render: '**Render** is a cloud platform that hosts web services, static sites and databases with automatic deploys from Git — a popular Heroku alternative.',
  http: '**HTTP** is the protocol browsers use to fetch web pages. You send a request (GET, POST...) and the server replies with a status code (200 OK, 404 Not Found) and content.',
  json: '**JSON** (JavaScript Object Notation) is the universal text format for data exchange: `{ "name": "Nexa", "skills": ["math", "code"] }`.',
  regex: 'A **regex** (regular expression) is a pattern language for matching text — `/\\d{3}-\\d{4}/` finds phone-number shapes like 555-0123.',
  async: '**Async** programming lets code start a slow task (like a network request) and continue running instead of freezing. JavaScript uses `async/await` and Promises for this.',
  docker: '**Docker** packages an app with all its dependencies into a "container" so it runs identically on any machine — ending "works on my computer" problems.',
  variable: 'A **variable** is a named box that stores a value in memory — `let score = 42` puts 42 in the box called score.',
};

const STOPWORDS = new Set(
  ('a,an,the,and,or,but,if,then,else,when,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,down,in,out,on,off,over,under,again,further,once,here,there,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,can,will,just,should,now,i,me,my,we,our,you,your,he,him,his,she,her,it,its,they,them,their,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,would,could,ought,of,as,us,what,which,who,whom,how,why').split(',')
);

/* ============================ safe math evaluator ========================== */

const MATH_FUNCS = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, floor: Math.floor,
  ceil: Math.ceil, round: Math.round, exp: Math.exp, ln: Math.log,
  log: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  min: Math.min, max: Math.max,
};
const MATH_CONSTS = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };

function tokenizeMath(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let num = '';
      while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
      const n = parseFloat(num);
      if (Number.isNaN(n)) throw new Error(`Bad number "${num}"`);
      tokens.push({ t: 'num', v: n });
      continue;
    }
    if (/[a-z]/.test(c)) {
      let name = '';
      while (i < src.length && /[a-z]/.test(src[i])) name += src[i++];
      tokens.push({ t: 'id', v: name });
      continue;
    }
    if ('+-*/%^(),'.includes(c)) { tokens.push({ t: c }); i++; continue; }
    throw new Error(`Unexpected character "${c}"`);
  }
  return tokens;
}

function parseMath(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = () => tokens[pos++];

  function parseExpr() {
    let left = parseTerm();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = eat().t;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }
  function parseTerm() {
    let left = parseFactor();
    while (peek() && (peek().t === '*' || peek().t === '/' || peek().t === '%')) {
      const op = eat().t;
      const right = parseFactor();
      if (op === '*') left *= right;
      else if (op === '/') { if (right === 0) throw new Error('Division by zero'); left /= right; }
      else left %= right;
    }
    return left;
  }
  function parseFactor() {
    const base = parseUnary();
    if (peek() && peek().t === '^') {
      eat();
      return Math.pow(base, parseFactor()); // right-associative
    }
    return base;
  }
  function parseUnary() {
    if (peek() && peek().t === '-') { eat(); return -parseUnary(); }
    if (peek() && peek().t === '+') { eat(); return parseUnary(); }
    return parsePrimary();
  }
  function parsePrimary() {
    const tok = eat();
    if (!tok) throw new Error('Unexpected end of expression');
    if (tok.t === 'num') return tok.v;
    if (tok.t === 'id') {
      const name = tok.v;
      if (peek() && peek().t === '(') {
        eat();
        const args = [];
        if (!(peek() && peek().t === ')')) {
          args.push(parseExpr());
          while (peek() && peek().t === ',') { eat(); args.push(parseExpr()); }
        }
        if (!peek() || peek().t !== ')') throw new Error('Missing closing parenthesis');
        eat();
        const fn = MATH_FUNCS[name];
        if (!fn) throw new Error(`Unknown function "${name}"`);
        return fn(...args);
      }
      if (name in MATH_CONSTS) return MATH_CONSTS[name];
      throw new Error(`Unknown name "${name}" — I know pi, e, tau and functions like sqrt()`);
    }
    if (tok.t === '(') {
      const v = parseExpr();
      if (!peek() || peek().t !== ')') throw new Error('Missing closing parenthesis');
      eat();
      return v;
    }
    throw new Error(`Unexpected "${tok.v ?? tok.t}"`);
  }

  const result = parseExpr();
  if (pos < tokens.length) throw new Error('Unexpected trailing input');
  return result;
}

export function evalMath(expr) {
  const cleaned = String(expr)
    .toLowerCase()
    .replace(/[×✕x]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/(\d),(?=\d{3}\b)/g, '$1')
    .replace(/\bplus\b/g, '+')
    .replace(/\bminus\b/g, '-')
    .replace(/\b(times|multiplied by|multiply)\b/g, '*')
    .replace(/\b(divided by|divide|over)\b/g, '/')
    .replace(/\b(to the power of|power)\b/g, '^')
    .replace(/\bmod\b/g, '%')
    .replace(/[=?]/g, '')
    .trim();
  const value = parseMath(tokenizeMath(cleaned));
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error('Result is not a finite number');
  }
  return value;
}

function formatNumber(n) {
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  const s = n.toPrecision(10);
  return String(parseFloat(s));
}

function extractMathCandidate(text) {
  let s = text.trim().toLowerCase();
  s = s.replace(/^(what\s*(is|'s|are)|whats|calculate|compute|solve|evaluate|how much is|math|result of)\s*/,'').replace(/\??\s*$/, '');
  // must contain a digit and an operator-ish signal, and only math-ish chars/words
  if (!/\d/.test(s)) return null;
  if (!/[+\-*/^%()]|\b(sqrt|sin|cos|tan|log|ln|abs|round|floor|ceil|min|max|plus|minus|times|divided|power|mod)\b/.test(s)) return null;
  if (!/^[\d\s.,+\-*/^%()a-z=?×÷✕]+$/.test(s)) return null;
  // reject if it has long alphabetic words that aren't math names
  const words = s.match(/[a-z]+/g) || [];
  const allowed = new Set(['sqrt','cbrt','abs','floor','ceil','round','exp','ln','log','sin','cos','tan','min','max','pi','e','tau','plus','minus','times','divided','by','over','to','the','power','of','mod','x']);
  if (words.some((w) => !allowed.has(w))) return null;
  return s;
}

/* ============================== unit converter ============================= */

const CONVERSIONS = {
  'km>mi': (v) => v * 0.621371, 'mi>km': (v) => v * 1.60934,
  'kg>lb': (v) => v * 2.20462, 'lb>kg': (v) => v / 2.20462,
  'cm>in': (v) => v * 0.393701, 'in>cm': (v) => v / 0.393701,
  'm>ft': (v) => v * 3.28084, 'ft>m': (v) => v / 3.28084,
  'l>gal': (v) => v * 0.264172, 'gal>l': (v) => v / 0.264172,
  'c>f': (v) => v * 9 / 5 + 32, 'f>c': (v) => (v - 32) * 5 / 9,
  'g>oz': (v) => v * 0.035274, 'oz>g': (v) => v / 0.035274,
};
const UNIT_ALIASES = {
  km: 'km', kilometer: 'km', kilometers: 'km', kms: 'km',
  mi: 'mi', mile: 'mi', miles: 'mi',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg', kilo: 'kg', kilos: 'kg',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  cm: 'cm', centimeter: 'cm', centimeters: 'cm',
  in: 'in', inch: 'in', inches: 'in',
  m: 'm', meter: 'm', meters: 'm', metre: 'm', metres: 'm',
  ft: 'ft', foot: 'ft', feet: 'ft',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  gal: 'gal', gallon: 'gal', gallons: 'gal',
  c: 'c', celsius: 'c', centigrade: 'c',
  f: 'f', fahrenheit: 'f',
  g: 'g', gram: 'g', grams: 'g',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
};

function tryConvert(text) {
  const m = String(text).toLowerCase().match(
    /(-?\d+(?:\.\d+)?)\s*([a-z]+)\s*(?:to|in|into|as)\s*([a-z]+)\b/
  );
  if (!m) return null;
  const value = parseFloat(m[1]);
  const from = UNIT_ALIASES[m[2]];
  const to = UNIT_ALIASES[m[3]];
  if (!from || !to) return null;
  const fn = CONVERSIONS[`${from}>${to}`];
  if (!fn) return { error: `I can't convert **${m[2]}** to **${m[3]}** yet. I know: km↔mi, kg↔lb, cm↔in, m↔ft, l↔gal, °C↔°F, g↔oz.` };
  const result = fn(value);
  return { value, from, to, result };
}

/* ================================ generators =============================== */

function genPassword(len = 16) {
  const sets = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}<>?',
  };
  const all = sets.lower + sets.upper + sets.digits + sets.symbols;
  const guaranteed = [sets.lower, sets.upper, sets.digits, sets.symbols].map(pick);
  const rest = Array.from({ length: Math.max(0, len - 4) }, () => pick(all));
  return shuffle([...guaranteed, ...rest]).join('');
}

function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

function genPalette() {
  const base = Math.floor(Math.random() * 360);
  const harmonies = [
    [0, 30, 60, 200, 220],
    [0, 180, 190, 40, 320],
    [0, 120, 240, 60, 300],
    [0, 15, 345, 210, 250],
  ];
  const offs = pick(harmonies);
  const sats = 62 + Math.floor(Math.random() * 20);
  return offs.map((o, i) => hslToHex((base + o) % 360, sats - i * 3, 62 - i * 7));
}

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function genLorem(paragraphs = 1) {
  const out = [];
  for (let p = 0; p < paragraphs; p++) {
    const sentences = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let s = 0; s < count; s++) {
      const len = 7 + Math.floor(Math.random() * 8);
      const words = Array.from({ length: len }, () => pick(LOREM_WORDS));
      sentences.push(words.join(' ').replace(/^./, (c) => c.toUpperCase()) + '.');
    }
    out.push(sentences.join(' '));
  }
  return out.join('\n\n');
}

function rollDice(spec) {
  const m = /^(\d{1,2})?d(\d{1,3})$/.exec(spec || '1d6');
  if (!m) return null;
  const count = clamp(parseInt(m[1] || '1', 10), 1, 20);
  const sides = clamp(parseInt(m[2], 10), 2, 1000);
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
  return { count, sides, rolls, total: rolls.reduce((a, b) => a + b, 0) };
}

/* ============================== text utilities ============================= */

function wordStats(text) {
  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, ''))).size;
  return {
    words: words.length,
    characters: clean.length,
    'characters (no spaces)': clean.replace(/\s/g, '').length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    'unique words': unique,
    'reading time': `${Math.max(1, Math.round(words.length / 200))} min`,
  };
}

function convertCase(text, mode) {
  const words = text.trim().split(/[\s_-]+/);
  switch (mode) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'title': return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    case 'sentence': return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    case 'camel': return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
    case 'pascal': return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake': return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab': return words.map((w) => w.toLowerCase()).join('-');
    case 'reverse': return [...text].reverse().join('');
    default: return null;
  }
}

function b64encode(str) {
  if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf8').toString('base64');
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(str) {
  if (typeof Buffer !== 'undefined') return Buffer.from(str, 'base64').toString('utf8');
  return decodeURIComponent(escape(atob(str)));
}

/* ============================== summarizer ================================= */

function summarize(text, maxSentences = 3) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  if (sentences.length <= maxSentences) return { summary: clean, ratio: 100, before: sentences.length, after: sentences.length };

  const freq = Object.create(null);
  for (const word of clean.toLowerCase().match(/[a-z']+/g) || []) {
    if (!STOPWORDS.has(word) && word.length > 2) freq[word] = (freq[word] || 0) + 1;
  }
  const scored = sentences.map((s, idx) => {
    const words = s.toLowerCase().match(/[a-z']+/g) || [];
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / Math.max(1, words.length);
    const positionBoost = idx === 0 ? 1.25 : 1; // first sentence usually matters
    return { s: s.trim(), idx, score: score * positionBoost };
  });
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s);
  return {
    summary: top.join(' '),
    ratio: Math.round((top.join(' ').length / clean.length) * 100),
    before: sentences.length,
    after: top.length,
  };
}

/* ============================= code templates ============================== */

const CODE_TEMPLATES = [
  {
    id: 'debounce', lang: 'javascript', title: 'Debounce function',
    triggers: ['debounce', 'throttle', 'delay', 'resize', 'search input'],
    code: `// Debounce: run fn only after the calls stop for \`delay\` ms
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Example: search as the user types, but only hit the API
// 400ms after they STOP typing
const onSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 400);

document.querySelector('#search').addEventListener('input', (e) => onSearch(e.target.value));`,
    note: 'Great for search inputs, resize handlers and auto-save.',
  },
  {
    id: 'fetch', lang: 'javascript', title: 'Fetch with timeout & error handling',
    triggers: ['fetch', 'api', 'request', 'http', 'ajax', 'call api', 'get data'],
    code: `async function fetchJSON(url, { timeout = 8000, ...options } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  } finally {
    clearTimeout(id);
  }
}

// Usage
const posts = await fetchJSON('https://jsonplaceholder.typicode.com/posts');
console.log(posts);`,
    note: 'Uses AbortController so slow requests fail gracefully instead of hanging forever.',
  },
  {
    id: 'react-counter', lang: 'jsx', title: 'React counter component',
    triggers: ['react', 'counter', 'component', 'usestate', 'button'],
    code: `import { useState } from 'react';

export default function Counter({ step = 1 }) {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <button onClick={() => setCount((c) => c - step)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount((c) => c + step)}>+</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`,
    note: 'Uses the functional updater form setCount(c => c + step) — always safe with rapid clicks.',
  },
  {
    id: 'usefetch', lang: 'jsx', title: 'Custom useFetch hook',
    triggers: ['hook', 'usefetch', 'custom hook', 'react hook', 'data fetching'],
    code: `import { useEffect, useState } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort(); // cleanup on unmount
  }, [url]);

  return { data, loading, error };
}

// Usage: const { data, loading, error } = useFetch('/api/users');`,
    note: 'Every React app ends up needing this hook. The AbortController prevents state updates after unmount.',
  },
  {
    id: 'todo', lang: 'html', title: 'Complete Todo app (single HTML file)',
    triggers: ['todo', 'task', 'to-do', 'checklist', 'todo app'],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Todo App</title>
  <style>
    body { font-family: system-ui; max-width: 420px; margin: 3rem auto; padding: 0 1rem; }
    form { display: flex; gap: 8px; }
    input { flex: 1; padding: 10px; }
    li.done span { text-decoration: line-through; opacity: 0.5; }
    li { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
  </style>
</head>
<body>
  <h1>My Tasks</h1>
  <form id="form">
    <input id="input" placeholder="Add a task..." autocomplete="off" />
    <button>Add</button>
  </form>
  <ul id="list"></ul>

  <script>
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const list = document.getElementById('list');

    function save() { localStorage.setItem('todos', JSON.stringify(todos)); }

    function render() {
      list.innerHTML = '';
      todos.forEach((todo, i) => {
        const li = document.createElement('li');
        li.className = todo.done ? 'done' : '';
        li.innerHTML =
          '<input type="checkbox" ' + (todo.done ? 'checked' : '') + ' />' +
          '<span>' + todo.text + '</span>' +
          '<button data-del>✕</button>';
        li.querySelector('input').onchange = () => { todo.done = !todo.done; save(); render(); };
        li.querySelector('[data-del]').onclick = () => { todos.splice(i, 1); save(); render(); };
        list.appendChild(li);
      });
    }

    document.getElementById('form').onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('input');
      if (!input.value.trim()) return;
      todos.push({ text: input.value.trim(), done: false });
      input.value = '';
      save(); render();
    };
    render();
  </script>
</body>
</html>`,
    note: 'Save this as todo.html and open it in a browser — it persists tasks in localStorage.',
  },
  {
    id: 'validation', lang: 'javascript', title: 'Form validation',
    triggers: ['form', 'validation', 'validate', 'email', 'signup', 'login form'],
    code: `function validateForm({ email, password }) {
  const errors = {};

  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Add at least one uppercase letter and one number.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Wiring it to a form
document.querySelector('#signup').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const { valid, errors } = validateForm({
    email: form.email.value,
    password: form.password.value,
  });
  if (!valid) {
    console.warn(errors); // render these next to the fields
    return;
  }
  console.log('All good — submit to the server');
});`,
    note: 'Always validate on the server too — client-side checks are for UX, not security.',
  },
  {
    id: 'express', lang: 'javascript', title: 'Express REST API',
    triggers: ['express', 'rest api', 'node server', 'backend', 'endpoint', 'crud'],
    code: `import express from 'express';

const app = express();
app.use(express.json());

let notes = [];
let nextId = 1;

app.get('/api/notes', (req, res) => res.json(notes));

app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const note = { id: nextId++, text, createdAt: new Date().toISOString() };
  notes.push(note);
  res.status(201).json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  const before = notes.length;
  notes = notes.filter((n) => n.id !== Number(req.params.id));
  if (notes.length === before) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

app.listen(3000, () => console.log('API on http://localhost:3000'));`,
    note: 'Run with: npm install express && node server.js',
  },
  {
    id: 'flask', lang: 'python', title: 'Flask REST API',
    triggers: ['flask', 'python api', 'python server', 'python backend'],
    code: `from flask import Flask, request, jsonify

app = Flask(__name__)
notes = []
next_id = 1

@app.get('/api/notes')
def list_notes():
    return jsonify(notes)

@app.post('/api/notes')
def create_note():
    global next_id
    data = request.get_json(force=True)
    if not data.get('text'):
        return jsonify({'error': 'text is required'}), 400
    note = {'id': next_id, 'text': data['text']}
    next_id += 1
    notes.append(note)
    return jsonify(note), 201

@app.delete('/api/notes/<int:note_id>')
def delete_note(note_id):
    global notes
    notes = [n for n in notes if n['id'] != note_id]
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)`,
    note: 'Run with: pip install flask && python app.py',
  },
  {
    id: 'fibonacci', lang: 'python', title: 'Fibonacci (memoized + generator)',
    triggers: ['fibonacci', 'fib', 'recursion', 'sequence'],
    code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    """O(n) fibonacci via memoization — the naive version is O(2^n)."""
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)


def fib_stream(limit: int):
    """Memory-friendly generator that yields fibs up to limit."""
    a, b = 0, 1
    while a <= limit:
        yield a
        a, b = b, a + b


print(fib(50))                  # 12586269025, instant
print(list(fib_stream(100)))    # [0, 1, 1, 2, 3, 5, ... 89]`,
    note: 'The @lru_cache decorator is Python\'s one-line memoization.',
  },
  {
    id: 'scraper', lang: 'python', title: 'Web scraper (requests + BeautifulSoup)',
    triggers: ['scrape', 'scraper', 'crawl', 'beautifulsoup', 'extract data'],
    code: `import requests
from bs4 import BeautifulSoup

def scrape_headlines(url: str) -> list[str]:
    headers = {'User-Agent': 'Mozilla/5.0 (learning project)'}
    res = requests.get(url, headers=headers, timeout=10)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, 'html.parser')
    headlines = []
    for h in soup.select('h2, h3'):
        text = h.get_text(strip=True)
        if text:
            headlines.append(text)
    return headlines

if __name__ == '__main__':
    for title in scrape_headlines('https://news.ycombinator.com'):
        print('•', title)`,
    note: 'Install deps with: pip install requests beautifulsoup4. Always check a site\'s robots.txt first.',
  },
  {
    id: 'binary-search', lang: 'python', title: 'Binary search',
    triggers: ['binary search', 'search algorithm', 'bisect', 'log n'],
    code: `def binary_search(items: list[int], target: int) -> int:
    """Return the index of target, or -1. List MUST be sorted.
    Finds 1 item among a billion in ~30 steps: O(log n)."""
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(nums, 23))  # 5`,
    note: 'The classic interview question — remember: input must be sorted.',
  },
  {
    id: 'palindrome', lang: 'javascript', title: 'Palindrome checker',
    triggers: ['palindrome', 'reverse string', 'racecar'],
    code: `function isPalindrome(str) {
  // Keep only letters/numbers so "A man, a plan, a canal: Panama" passes
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === [...clean].reverse().join('');
}

// Two-pointer version — O(1) extra memory
function isPalindromeFast(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left++] !== clean[right--]) return false;
  }
  return true;
}

console.log(isPalindrome('Racecar'));                    // true
console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('hello'));                      // false`,
    note: 'Two approaches: the readable one-liner and the memory-efficient two-pointer.',
  },
  {
    id: 'glass', lang: 'css', title: 'Glassmorphism card',
    triggers: ['glass', 'glassmorphism', 'frosted', 'card', 'blur'],
    code: `/* The secret: backdrop-filter + translucent background + soft border */
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  color: #fff;
}

/* IMPORTANT: the element BEHIND must be colorful,
   or the blur has nothing to blur */
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 20%, #7c3aed, transparent 50%),
    radial-gradient(circle at 80% 80%, #06b6d4, transparent 50%),
    #0b0d18;
  display: grid;
  place-items: center;
}`,
    note: 'Glassmorphism only looks right over colorful, layered backgrounds.',
  },
  {
    id: 'grid', lang: 'css', title: 'Responsive card grid (no media queries)',
    triggers: ['grid', 'layout', 'responsive', 'cards', 'columns'],
    code: `/* Auto-responsive grid — wraps itself with zero media queries */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 1.25rem;
  padding: 1.25rem;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.14);
}`,
    note: 'auto-fit + minmax is the modern way — the grid figures out its own columns.',
  },
  {
    id: 'sql', lang: 'sql', title: 'SQL JOINs by example',
    triggers: ['sql', 'join', 'database', 'query', 'select', 'postgres', 'mysql'],
    code: `-- Tables: users(id, name) and orders(id, user_id, total)

-- INNER JOIN: only users who HAVE orders
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON o.user_id = u.id;

-- LEFT JOIN: ALL users, orders attached if they exist (NULL otherwise)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- Aggregation: each user with their lifetime spend
SELECT u.name,
       COUNT(o.id)        AS order_count,
       COALESCE(SUM(o.total), 0) AS lifetime_value
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.name
ORDER BY lifetime_value DESC;`,
    note: 'LEFT JOIN + GROUP BY is the single most useful reporting pattern.',
  },
  {
    id: 'chunk', lang: 'javascript', title: 'Handy array utilities',
    triggers: ['array', 'chunk', 'unique', 'group', 'utilities', 'helpers'],
    code: `// Split an array into chunks of size n
const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n)
  );

// Remove duplicates (works for primitives)
const unique = (arr) => [...new Set(arr)];

// Group objects by a key
const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    (acc[item[key]] ??= []).push(item);
    return acc;
  }, {});

// Shuffle (Fisher–Yates, the correct way)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

console.log(chunk([1, 2, 3, 4, 5], 2)); // [[1,2],[3,4],[5]]
console.log(unique([1, 2, 2, 3, 1]));   // [1,2,3]`,
    note: 'Four tiny functions you will reuse in every project.',
  },
];

function matchCodeTemplate(message) {
  const lower = message.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const tpl of CODE_TEMPLATES) {
    let score = 0;
    for (const t of tpl.triggers) {
      if (lower.includes(t)) score += t.includes(' ') ? 3 : 1;
    }
    if (tpl.lang === 'python' && /python/.test(lower)) score += 1.5;
    if (tpl.lang === 'jsx' && /react|jsx/.test(lower)) score += 1.5;
    if (tpl.lang === 'css' && /css|style|design/.test(lower)) score += 1.5;
    if (score > bestScore) { bestScore = score; best = tpl; }
  }
  return bestScore >= 1 ? best : null;
}

/* ============================ story & poem forge =========================== */

const STORY_BITS = {
  heroes: ['a retired cartographer', 'a young android with a memory leak', 'a tea-loving dragon', 'an astronaut who gardens', 'a lighthouse keeper who hears the sea speak', 'a clockmaker\'s apprentice', 'a librarian who collects lost sounds'],
  places: ['a floating city above the clouds', 'the last library on Earth', 'a village where it never stops raining', 'an abandoned space station', 'a forest that rearranges itself at night', 'a market that only opens at midnight'],
  items: ['a brass key with no lock', 'a map that redraws itself', 'a letter in an unknown language', 'a seed that glows in the dark', 'a pocket watch that runs backwards', 'a song nobody remembers writing'],
  twists: ['the narrator was the villain all along', 'time began looping every seventh day', 'the stars started going out one by one', 'everyone forgot the hero\'s name', 'the ocean began whispering back', 'gravity simply stopped working'],
  morals: ['some doors only open from the inside', 'even machines dream of something', 'the longest journey starts with a single map', 'kindness is the oldest technology', 'not all who wander are lost — some are mapping'],
};

function genStory(topic) {
  const hero = topic ? `a ${topic.replace(/^(a|an|the)\s+/i, '')} like no other` : pick(STORY_BITS.heroes);
  const place = pick(STORY_BITS.places);
  const item = pick(STORY_BITS.items);
  const twist = pick(STORY_BITS.twists);
  const moral = pick(STORY_BITS.morals);
  const name = pick(['Mira', 'Jun', 'Ash', 'Rowan', 'Ilya', 'Sana', 'Theo']);
  return (
    `**The ${topic ? topic.replace(/^\w/, (c) => c.toUpperCase()) : pick(['Violet', 'Silent', 'Burning', 'Paper', 'Midnight'])} ${pick(['Signal', 'Atlas', 'Tide', 'Lantern', 'Door'])}**\n\n` +
    `In ${place}, there lived ${hero} named ${name}. Every morning began the same way — until the day ${name} found ${item}, tucked where nobody should have left it.\n\n` +
    `At first it seemed like a curiosity, then a problem, then a calling. ${name} asked the neighbors, the archives, even the rain. No one had answers. And then, on the seventh night, ${twist}.\n\n` +
    `What happened next no one recorded. But the elders still say the story proves one thing: *${moral}.*`
  );
}

const POEM_LINES = {
  open: ['Beneath a sky of static stars,', 'Where quiet circuits dream,', 'The evening folds its paper wings,', 'Along the edge of dawn,'],
  mid: ['a whisper threads the wires through,', 'the city holds its breath,', 'a thousand windows blink awake,', 'the tide rehearses songs,'],
  end: ['and morning finds us, changed.', 'and everything is new.', 'and time forgets to hurry.', 'and light comes quietly home.'],
};

function genPoem(topic) {
  const t = topic ? topic.replace(/[.!?]+$/, '') : null;
  const lines = [
    pick(POEM_LINES.open),
    pick(POEM_LINES.mid),
    t ? `the word "${t}" hums underneath,` : pick(POEM_LINES.mid),
    pick(POEM_LINES.end),
  ];
  return `**${t ? `For ${t.replace(/^\w/, (c) => c.toUpperCase())}` : 'Untitled'}**\n\n` + lines.map((l) => `*${l}*`).join('\n');
}

/* ================================ sentiment ================================ */

const POS_WORDS = ['happy', 'great', 'awesome', 'love', 'excited', 'amazing', 'good', 'wonderful', 'fantastic', 'glad', 'thanks', 'thank', 'cool', 'nice', 'best', 'won', 'passed'];
const NEG_WORDS = ['sad', 'angry', 'hate', 'tired', 'stressed', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'failed', 'stuck', 'frustrated', 'bored', 'lonely', 'upset'];

function sentimentScore(text) {
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  let score = 0;
  for (const w of words) {
    if (POS_WORDS.includes(w)) score++;
    if (NEG_WORDS.includes(w)) score--;
  }
  return score;
}

/* ================================= personas ================================ */

export const PERSONAS = [
  { id: 'nexa', name: 'Nexa', icon: 'sparkles', tagline: 'Balanced generalist — a bit of everything' },
  { id: 'coder', name: 'Code Wizard', icon: 'code', tagline: 'Deep code generation & debugging help' },
  { id: 'writer', name: 'Muse', icon: 'pen', tagline: 'Stories, poems and vivid language' },
  { id: 'tutor', name: 'Professor', icon: 'grad', tagline: 'Patient step-by-step explanations' },
  { id: 'analyst', name: 'Analyst', icon: 'chart', tagline: 'Structured, data-first breakdowns' },
];

const PERSONA_OPENERS = {
  nexa: ['Here\'s what I can tell you:', 'Good question — let me break it down:', 'Here\'s my take:'],
  coder: ['From an engineering standpoint:', 'Let\'s look at this like a system:', 'Technical view incoming:'],
  writer: ['Let me paint the picture:', 'Ah, a lovely thread to pull on:', 'Picture it this way:'],
  tutor: ['Let\'s learn this step by step:', 'Great learning moment — follow along:', 'I\'ll explain it simply:'],
  analyst: ['Let\'s structure this:', 'Breaking it into components:', 'Here\'s the analytical view:'],
};

const PERSONA_SUGGESTIONS = {
  nexa: ['What can you do?', 'Tell me a fun fact', '/palette'],
  coder: ['Write a debounce function', 'Generate a todo app in HTML', '/help'],
  writer: ['Write me a story about a dragon', 'Write a poem about the sea', 'Tell me a quote'],
  tutor: ['Explain recursion', 'What is an API?', 'Teach me about JavaScript'],
  analyst: ['/count paste your text here', 'Compare pros and cons of remote work', 'Summarize a paragraph for me'],
};

/* ============================ command registry ============================= */

export const COMMANDS = [
  { cmd: '/calc', usage: '/calc (24 * 3) + sqrt(16)', desc: 'Evaluate any math expression safely' },
  { cmd: '/convert', usage: '/convert 10 km to miles', desc: 'Convert units (km/mi, kg/lb, °C/°F...)' },
  { cmd: '/summarize', usage: '/summarize <long text>', desc: 'Compress text to its key sentences' },
  { cmd: '/count', usage: '/count <text>', desc: 'Words, characters & reading-time stats' },
  { cmd: '/password', usage: '/password 20', desc: 'Generate a strong random password' },
  { cmd: '/palette', usage: '/palette', desc: 'Generate a harmonious color palette' },
  { cmd: '/story', usage: '/story a robot chef', desc: 'Forge an original short story' },
  { cmd: '/poem', usage: '/poem the ocean', desc: 'Compose a poem on any topic' },
  { cmd: '/joke', usage: '/joke', desc: 'Serve a programming joke' },
  { cmd: '/fact', usage: '/fact', desc: 'Serve a surprising fact' },
  { cmd: '/quote', usage: '/quote', desc: 'Serve a thoughtful quote' },
  { cmd: '/define', usage: '/define recursion', desc: 'Define a tech concept simply' },
  { cmd: '/base64', usage: '/base64 encode hello', desc: 'Encode or decode Base64' },
  { cmd: '/case', usage: '/case camel hello world', desc: 'Convert text case (upper/camel/snake...)' },
  { cmd: '/lorem', usage: '/lorem 2', desc: 'Generate placeholder paragraphs' },
  { cmd: '/uuid', usage: '/uuid', desc: 'Generate a random UUID v4' },
  { cmd: '/roll', usage: '/roll 2d6', desc: 'Roll dice (any count & sides)' },
  { cmd: '/flip', usage: '/flip', desc: 'Flip a coin' },
  { cmd: '/time', usage: '/time', desc: 'Current date and time' },
  { cmd: '/help', usage: '/help', desc: 'Show everything Nexa can do' },
];

/* ============================== reply builders ============================= */

function result(reply, { suggestions = [], widget = null, intent = 'chat' } = {}) {
  return { reply, suggestions, widget, intent };
}

function helpReply() {
  const rows = COMMANDS.map((c) => `| \`${c.usage}\` | ${c.desc} |`).join('\n');
  return result(
    `Here's my full toolbox — things most chatbots can't do, I do **instantly and locally**:\n\n` +
    `| Command | What it does |\n|---|---|\n${rows}\n\n` +
    `Beyond commands, you can just **talk to me naturally**: ask for code ("write a debounce function"), math ("what is 18% of 2400" is close — try \`/calc 0.18*2400\`), definitions, stories, or a summary of any text you paste.`,
    { suggestions: ['/palette', '/story a lighthouse keeper', 'Write a React counter component'], intent: 'help' }
  );
}

function timeReply() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return result(
    `Right now it's **${time}** on **${date}**.\n\nFun extra — today is day **${Math.ceil((now - new Date(now.getFullYear(), 0, 0)) / 86400000)}** of ${now.getFullYear()}.`,
    { suggestions: ['/flip', '/roll 2d6', 'Tell me a joke'], intent: 'time' }
  );
}

function identityReply(persona) {
  const p = PERSONAS.find((x) => x.id === persona) || PERSONAS[0];
  return result(
    `I'm **Nexa** — an open AI workspace that runs right here: a **React frontend**, a **serverless API backend**, and a local reasoning engine with zero external dependencies.\n\n` +
    `Unlike a plain chatbot, I ship with a **built-in toolbox**: I can do real math, generate production-ready code, summarize anything you paste, forge stories, create color palettes, roll dice, speak my answers aloud, and more. You're currently talking to the **${p.name}** persona.\n\n` +
    `Everything you type stays in **your browser's local storage** — no account, no tracking. Type \`/help\` to see all ${COMMANDS.length} commands.`,
    { suggestions: ['/help', 'What makes you different from ChatGPT?', '/palette'], intent: 'identity' }
  );
}

function diffReply() {
  return result(
    `Great question. Here's the honest comparison:\n\n` +
    `| | Typical AI chatbot | **Nexa** |\n|---|---|---|\n` +
    `| Answers questions | Yes | Yes |\n` +
    `| Runs tools locally (math, dice, UUID, Base64) | No | **Yes — instant & private** |\n` +
    `| Extractive summarizer built in | Rarely | **Yes** |\n` +
    `| Switchable personas | No | **5 personas** |\n` +
    `| Voice input + spoken replies | Sometimes | **Yes** |\n` +
    `| Data stays on your device | No (cloud) | **Yes — localStorage** |\n` +
    `| Open source frontend + backend | No | **Yes** |\n\n` +
    `I trade a giant cloud model for **speed, privacy and a real toolbox** — and I never make you create an account.`,
    { suggestions: ['/help', '/password 20', 'Show me the toolbox'], intent: 'diff' }
  );
}

function codeReply(tpl, persona) {
  const flavor = persona === 'coder' ? 'One of my favorites. ' : '';
  return result(
    `${flavor}Here's **${tpl.title}**:\n\n\`\`\`${tpl.lang}\n${tpl.code}\n\`\`\`\n\n**Why it works:** ${tpl.note}`,
    {
      suggestions: ['Write a Flask API', 'Give me a glassmorphism card in CSS', 'Show array utilities in JavaScript'],
      intent: 'code',
    }
  );
}

function defaultReply(text, persona, history) {
  const words = (text.toLowerCase().match(/[a-z']+/g) || []).filter((w) => !STOPWORDS.has(w) && w.length > 3);
  const keywords = [...new Set(words)].slice(0, 3);
  const opener = pick(PERSONA_OPENERS[persona] || PERSONA_OPENERS.nexa);
  const subject = keywords.length ? `**${keywords.join('**, **')}**` : 'that';

  // repeated message detection
  const lastUser = [...(history || [])].reverse().find((m) => m.role === 'user');
  if (lastUser && lastUser.content.trim().toLowerCase() === text.trim().toLowerCase()) {
    return result(
      `We just went over this one. If my last answer missed the mark, try rephrasing with more detail — or hit one of my tools:\n\n- \`/calc\` for math, \`/summarize\` for long text, \`/help\` for everything.\n\nI'm genuinely better with specifics: instead of "tell me about space", try "write a story about a gardener on Mars".`,
      { suggestions: ['/help', 'Write a story about a gardener on Mars', '/joke'], intent: 'repeat' }
    );
  }

  const bodies = {
    nexa: `${opener} ${subject} is an interesting angle. I don't have a live cloud brain, but I can still be useful right now:\n\n- **Explain** — ask me to *"explain ${keywords[0] || 'recursion'}"* and I'll give you a clear definition.\n- **Create** — I can write a story, poem or code snippet around it.\n- **Compute** — paste text for a summary, or throw math at me.\n\nWhich direction should we take?`,
    coder: `${opener} if we treated ${subject} as a buildable thing, here's how I'd approach it:\n\n1. **Define the smallest useful version** — one input, one output.\n2. **Write it in plain functions first** — no framework until it works.\n3. **Then refine** — types, tests, edge cases.\n\nWant real code? Try *"write a function for X"* — I have a library of production-ready patterns I can generate instantly.`,
    writer: `${opener}\n\nThere's a story hiding in ${subject}. Every good piece of writing starts with a concrete image — not an abstract idea. Give me a character, a place, or a single strange object, and I'll forge it into something with a beginning, a middle and a twist.\n\nSay the word: *"write a story about ${keywords[0] || 'a map that redraws itself'}"*.`,
    tutor: `${opener} let's break ${subject} into learnable pieces:\n\n1. **What it is** — a one-sentence definition first, always.\n2. **Why it matters** — the problem it solves in the real world.\n3. **A tiny example** — small enough to hold in your head.\n\nAsk me *"what is ${keywords[0] || 'an API'}"* and I'll walk you through all three.`,
    analyst: `${opener} here's ${subject} structured for decision-making:\n\n- **Scope** — what's actually being asked, stripped of noise.\n- **Knowns vs unknowns** — separate facts from assumptions.\n- **Next action** — the single cheapest step that reduces uncertainty.\n\nIf you paste a paragraph with \`/summarize\`, I'll compress it to its load-bearing sentences — that's my specialty.`,
  };

  return result(bodies[persona] || bodies.nexa, {
    suggestions: PERSONA_SUGGESTIONS[persona] || PERSONA_SUGGESTIONS.nexa,
    intent: 'fallback',
  });
}

/* ============================== slash commands ============================= */

function handleSlash(raw, persona) {
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const argText = raw.trim().slice(parts[0].length).trim();

  switch (cmd) {
    case '/help':
      return helpReply();

    case '/time':
      return timeReply();

    case '/calc': {
      if (!argText) return result('Give me an expression: `/calc (24 * 3) + sqrt(16)`', { intent: 'calc' });
      try {
        const value = evalMath(argText);
        return result(`\`${argText}\` = **${formatNumber(value)}**`, {
          suggestions: ['/calc (128 / 4) ^ 2', '/calc sqrt(625) + 15%', '/convert 72 f to c'],
          intent: 'calc',
        });
      } catch (e) {
        return result(`I couldn't evaluate that: **${e.message}**.\n\nI support \`+ - * / % ^\`, parentheses, and functions like \`sqrt()\`, \`abs()\`, \`round()\`, \`min()\`, \`max()\`, plus constants \`pi\`, \`e\`, \`tau\`.`, { intent: 'calc' });
      }
    }

    case '/convert': {
      const conv = tryConvert(argText);
      if (!conv) return result('Try: `/convert 10 km to miles` — I know km↔mi, kg↔lb, cm↔in, m↔ft, l↔gal, °C↔°F, g↔oz.', { intent: 'convert' });
      if (conv.error) return result(conv.error, { intent: 'convert' });
      const fmt = (u) => (u === 'c' ? '°C' : u === 'f' ? '°F' : u);
      return result(`**${conv.value} ${fmt(conv.from)}** = **${formatNumber(parseFloat(conv.result.toFixed(4)))} ${fmt(conv.to)}**`, {
        suggestions: ['/convert 100 kg to lb', '/convert 30 c to f', '/convert 6 ft to m'],
        intent: 'convert',
      });
    }

    case '/summarize': {
      const words = argText.split(/\s+/).filter(Boolean).length;
      if (words < 40) return result(`Paste a longer text after the command (at least ~40 words) and I'll compress it to its key sentences.\n\nExample: \`/summarize The history of computing began... [your paragraph]\``, { intent: 'summarize' });
      const s = summarize(argText, 3);
      return result(
        `**Summary** (kept ${s.after} of ${s.before} sentences, ${s.ratio}% of original):\n\n${s.summary}`,
        { widget: { type: 'stats', items: [{ label: 'sentences kept', value: `${s.after}/${s.before}` }, { label: 'of original', value: `${s.ratio}%` }] }, suggestions: ['/count ' + argText.slice(0, 60) + '...', 'Make it a story instead'], intent: 'summarize' }
      );
    }

    case '/count': {
      if (!argText) return result('Paste some text after `/count` and I\'ll analyze it — words, characters, sentences, reading time.', { intent: 'count' });
      const stats = wordStats(argText);
      const items = Object.entries(stats).map(([label, value]) => ({ label, value: String(value) }));
      return result(
        `Here's the full read-out on your text:`,
        { widget: { type: 'stats', items }, suggestions: ['/case upper ' + argText.slice(0, 40), '/summarize ' + argText.slice(0, 60)], intent: 'count' }
      );
    }

    case '/password': {
      const len = clamp(parseInt(argText, 10) || 16, 6, 64);
      const pw = genPassword(len);
      const entropy = Math.round(len * Math.log2(70));
      return result(
        `Fresh ${len}-character password:\n\n\`\`\`\n${pw}\n\`\`\`\n\nRoughly **${entropy} bits of entropy** — a brute-force attack at a billion guesses/second would need about ${entropy > 90 ? 'longer than the age of the universe' : `${Math.round(Math.pow(2, entropy - 30) / 31536000).toLocaleString()} years`}.`,
        { suggestions: ['/password 24', '/uuid', 'Tell me a fact'], intent: 'password' }
      );
    }

    case '/palette': {
      const colors = genPalette();
      return result(
        `Here's a fresh palette — click any swatch to copy it:\n\n${colors.map((c) => `\`${c}\``).join('  ')}`,
        { widget: { type: 'palette', colors }, suggestions: ['/palette', 'Give me a glassmorphism card in CSS', 'Make it a story instead'], intent: 'palette' }
      );
    }

    case '/story':
      return result(genStory(argText || null), { suggestions: ['/story ' + (argText || 'a clockmaker\'s apprentice'), '/poem ' + (argText || 'the night sea'), 'Another one'], intent: 'story' });

    case '/poem':
      return result(genPoem(argText || null), { suggestions: ['/poem ' + (argText || 'starlight'), '/story ' + (argText || 'a wandering poet'), 'Tell me a quote'], intent: 'poem' });

    case '/joke':
      return result(pick(JOKES), { suggestions: ['Another joke', 'Tell me a fact', '/flip'], intent: 'fun' });

    case '/fact':
      return result(`**Did you know?** ${pick(FACTS)}`, { suggestions: ['Another fact', 'Tell me a joke', '/quote'], intent: 'fun' });

    case '/quote': {
      const q = pick(QUOTES);
      return result(`> "${q.text}"\n>\n> — **${q.author}**`, { suggestions: ['Another quote', 'Write a poem about courage', '/fact'], intent: 'fun' });
    }

    case '/define': {
      if (!argText) return result('Which term? Try `/define recursion` — my dictionary covers core programming and web concepts.', { intent: 'define' });
      const key = argText.toLowerCase().trim();
      const def = DEFINITIONS[key];
      if (def) return result(def, { suggestions: ['/define api', '/define closure', '/define algorithm'], intent: 'define' });
      return result(`I don't have **${argText}** in my offline dictionary yet. I do know: ${Object.keys(DEFINITIONS).slice(0, 12).map((k) => `\`${k}\``).join(', ')} and more.`, { intent: 'define' });
    }

    case '/base64': {
      const [sub, ...rest] = argText.split(/\s+/);
      const payload = rest.join(' ');
      if (!payload || !['encode', 'decode'].includes(sub)) {
        return result('Usage: `/base64 encode hello world` or `/base64 decode aGVsbG8=`', { intent: 'base64' });
      }
      try {
        const out = sub === 'encode' ? b64encode(payload) : b64decode(payload);
        return result(`\`${sub}\` result:\n\n\`\`\`\n${out}\n\`\`\``, { intent: 'base64' });
      } catch {
        return result('That doesn\'t look like valid Base64 to decode. Check for stray characters.', { intent: 'base64' });
      }
    }

    case '/case': {
      const [mode, ...rest] = argText.split(/\s+/);
      const payload = rest.join(' ');
      const out = payload && convertCase(payload, mode);
      if (!out) return result('Usage: `/case <mode> <text>` — modes: `upper`, `lower`, `title`, `sentence`, `camel`, `pascal`, `snake`, `kebab`, `reverse`.', { intent: 'case' });
      return result(`\`\`\`\n${out}\n\`\`\``, { suggestions: ['/case snake ' + payload, '/case title ' + payload], intent: 'case' });
    }

    case '/lorem': {
      const n = clamp(parseInt(argText, 10) || 1, 1, 5);
      return result(genLorem(n), { suggestions: ['/lorem 3', '/count ' + genLorem(1).slice(0, 80)], intent: 'lorem' });
    }

    case '/uuid':
      return result(`\`${genUUID()}\`\n\nA random **UUID v4** — the odds of a collision are about 1 in 5.3 undecillion.`, { suggestions: ['/uuid', '/password 16'], intent: 'uuid' });

    case '/roll': {
      const r = rollDice(argText || '1d6');
      if (!r) return result('Usage: `/roll 2d6` — that\'s 2 dice with 6 sides. Try `/roll d20` for the classic.', { intent: 'roll' });
      const detail = r.count > 1 ? `\n\nRolls: ${r.rolls.map((x) => `\`${x}\``).join(' ')}` : '';
      return result(`Rolling **${r.count}d${r.sides}**... you got **${r.total}**${detail}`, { suggestions: ['/roll d20', '/roll 3d6', '/flip'], intent: 'roll' });
    }

    case '/flip':
      return result(`The coin spins... and lands on **${Math.random() < 0.5 ? 'Heads' : 'Tails'}**.`, { suggestions: ['/flip', '/roll d20', 'Tell me a joke'], intent: 'flip' });

    default: {
      const known = COMMANDS.find((c) => c.cmd.startsWith(cmd)) || null;
      return result(
        `Unknown command \`${cmd}\`. ${known ? `Did you mean \`${known.cmd}\`?` : ''}\n\nType \`/help\` to see all ${COMMANDS.length} commands.`,
        { suggestions: ['/help', known ? known.usage : '/palette', '/joke'], intent: 'unknown' }
      );
    }
  }
}

/* =============================== main entry ================================ */

export function generateReply({ message, persona = 'nexa', history = [] } = {}) {
  const text = String(message || '').trim();
  if (!text) return result('Say something — or type `/help` to see my toolbox.', { intent: 'empty' });
  const lower = text.toLowerCase().trim();

  // 0. Slash commands
  if (lower.startsWith('/')) return handleSlash(text, persona);

  // 1. Greetings
  if (/^(hi+|hello+|hey+|yo|hiya|howdy|hola|namaste|good\s(morning|afternoon|evening|day))\b/.test(lower) && lower.length < 40) {
    const p = PERSONAS.find((x) => x.id === persona) || PERSONAS[0];
    return result(
      `${pick(['Hey', 'Hello', 'Hi there'])} — I'm **Nexa**, currently in **${p.name}** mode. I can chat, but I can also *do things*: real math, code generation, summaries, stories, palettes, passwords...\n\nWhat shall we make first?`,
      { suggestions: ['What can you do?', 'Write a React counter component', '/palette'], intent: 'greeting' }
    );
  }

  // 2. How are you
  if (/how are you|how('s| is) it going|how do you feel|are you (ok|okay|well)/.test(lower)) {
    return result(
      `Running at full capacity — all ${COMMANDS.length} tools sharp and ready. Honestly, the best part of my day is when someone gives me a weird request. Got one?`,
      { suggestions: ['/story a robot who paints', '/roll d20', 'Tell me a joke'], intent: 'smalltalk' }
    );
  }

  // 3. Identity / creator
  if (/(who are you|your name|what are you|about yourself|who (made|created|built) you|tell me about you)/.test(lower)) {
    return identityReply(persona);
  }
  if (/(different from|better than|vs|versus|compare).*(chatgpt|gpt|gemini|claude|other ai)|what makes you (different|special|unique)/.test(lower)) {
    return diffReply();
  }

  // 4. Capabilities
  if (/(what can you do|your (features|abilities|capabilities)|show.*(features|commands)|how do you work|what all can)/.test(lower)) {
    return helpReply();
  }

  // 5. Thanks / bye
  if (/^(thank(s| you)|thx|ty)\b/.test(lower)) {
    return result(pick([
      'Anytime. That\'s literally what I\'m here for.',
      'You\'re welcome. Come back with a harder one.',
      'Glad I could help — try `/palette` or `/story` next, they\'re fun.',
    ]), { suggestions: ['/help', '/story a grateful robot', '/joke'], intent: 'smalltalk' });
  }
  if (/^(bye|goodbye|see you|good ?night|gtg)\b/.test(lower)) {
    return result('See you around. Your conversations stay saved in this browser — pick up right where we left off.', { suggestions: [], intent: 'bye' });
  }

  // 6. Time & date
  if (/(what|current|tell me).*(time|date|day is)|time is it|today'?s date|what day/.test(lower)) {
    return timeReply();
  }

  // 7. Unit conversion (natural language)
  if (/\d/.test(lower) && /\b(convert|to (miles|kilometers|km|kg|pounds|lb|celsius|fahrenheit|inches|cm|feet|meters|gallons|liters|ounces))\b/.test(lower)) {
    const conv = tryConvert(lower);
    if (conv && !conv.error) {
      const fmt = (u) => (u === 'c' ? '°C' : u === 'f' ? '°F' : u);
      return result(`**${conv.value} ${fmt(conv.from)}** = **${formatNumber(parseFloat(conv.result.toFixed(4)))} ${fmt(conv.to)}**`, { suggestions: ['/convert 100 kg to lb', '/convert 30 c to f'], intent: 'convert' });
    }
  }

  // 8. Math
  const mathCand = extractMathCandidate(lower);
  if (mathCand) {
    try {
      const value = evalMath(mathCand);
      return result(`\`${mathCand.replace(/\s+/g, ' ')}\` = **${formatNumber(value)}**\n\nTip: \`/calc\` handles bigger expressions — \`sqrt()\`, \`^\`, \`min()\`, \`pi\` and more.`, {
        suggestions: ['/calc (52 * 18) + sqrt(81)', '/convert 100 km to miles', '/help'],
        intent: 'calc',
      });
    } catch { /* fall through to other intents */ }
  }

  // 9. Summarize (natural)
  if (/^(summari[sz]e|tldr|tl;dr)\b/.test(lower)) {
    const payload = text.replace(/^(summari[sz]e|tldr|tl;dr)\s*(this|the following|for me)?[:\-]?\s*/i, '');
    return handleSlash('/summarize ' + payload, persona);
  }

  // 10. Word count (natural)
  if (/^(count|how many words|word count)/.test(lower)) {
    const payload = text.replace(/^(count|how many words (are|is) (in|there in)?(this|the)?(text)?|word count( of)?( this)?)[:\-]?\s*/i, '');
    return handleSlash('/count ' + payload, persona);
  }

  // 11. Jokes / facts / quotes
  if (/\bjoke\b/.test(lower)) return handleSlash('/joke', persona);
  if (/\b(fact|something interesting|tell me something)\b/.test(lower) && !/story|poem/.test(lower)) return handleSlash('/fact', persona);
  if (/\b(quote|motivat|inspir)\b/.test(lower)) return handleSlash('/quote', persona);

  // 12. Stories & poems
  if (/\b(story|tale)\b/.test(lower) && /(write|tell|create|make|give|generate|another)/.test(lower)) {
    const topic = text.match(/(?:about|of|on)\s+(.+)$/i)?.[1] || null;
    return result(genStory(topic), { suggestions: ['/story ' + (topic || 'a dragon librarian'), 'Another one', '/poem ' + (topic || 'the sea')], intent: 'story' });
  }
  if (/\b(poem|poetry|haiku|verse|song)\b/.test(lower) && /(write|compose|create|make|give|generate|another|sing)/.test(lower)) {
    const topic = text.match(/(?:about|of|on|for)\s+(.+)$/i)?.[1] || null;
    return result(genPoem(topic), { suggestions: ['/poem ' + (topic || 'starlight'), 'Another one', '/story ' + (topic || 'a poet')], intent: 'poem' });
  }

  // 13. Password
  if (/password/.test(lower) && /(generate|create|make|give|suggest|new|strong)/.test(lower)) {
    const n = parseInt(lower.match(/(\d{1,2})/)?.[1] || '16', 10);
    return handleSlash(`/password ${n}`, persona);
  }

  // 14. Definitions & explanations
  const defMatch = lower.match(/^(?:what\s+(?:is|are|'s)|whats|define|explain|meaning of|teach me about|tell me about)\s+([a-z0-9 #+.+-]{2,40})\??$/);
  if (defMatch) {
    const term = defMatch[1].replace(/\?$/, '').trim();
    const key = term.replace(/^(a|an|the)\s+/, '');
    if (DEFINITIONS[key]) {
      return result(DEFINITIONS[key], {
        suggestions: Object.keys(DEFINITIONS).filter((k) => k !== key).slice(0, 3).map((k) => `/define ${k}`),
        intent: 'define',
      });
    }
  }

  // 15. Code generation
  const codeIntent = /(code|function|component|script|program|app|snippet|html|css|python|javascript|typescript|react|flask|express|sql|regex|scraper|algorithm)/.test(lower)
    && /(write|create|make|give|generate|show|build|example|how (to|do)|code|snippet|for)/.test(lower);
  if (codeIntent) {
    const tpl = matchCodeTemplate(lower);
    if (tpl) return codeReply(tpl, persona);
    return result(
      `I'd love to build that. My offline template library covers the most-requested patterns:\n\n${CODE_TEMPLATES.slice(0, 8).map((t) => `- **${t.title}** (\`${t.lang}\`)`).join('\n')}\n- *...and ${CODE_TEMPLATES.length - 8} more*\n\nTry *"write a debounce function"* or *"create a todo app in HTML"* — or describe yours in different words.`,
      { suggestions: ['Write a debounce function', 'Create a todo app in HTML', 'Give me a Flask API'], intent: 'code-miss' }
    );
  }

  // 16. Yes / no / short acknowledgements
  if (/^(yes|yeah|yep|sure|ok|okay|go ahead|please do|y)\.?!?$/.test(lower)) {
    return result('Love the enthusiasm — pick a direction and I\'ll run with it:', { suggestions: ['/story an unexpected hero', 'Write a React counter component', '/palette'], intent: 'smalltalk' });
  }
  if (/^(no|nope|nah|not really)\.?$/.test(lower)) {
    return result('Fair enough. I\'ll be here with the toolbox whenever you need it — `/help` shows everything.', { suggestions: ['/help'], intent: 'smalltalk' });
  }

  // 17. Sentiment-aware support
  const s = sentimentScore(lower);
  if (s <= -2) {
    return result(
      `That sounds rough, and it's okay to feel it. A few things that genuinely help, from the evidence:\n\n- **Shrink the next step** until it's almost silly — "open the file" counts.\n- **Name the feeling** — putting it into words measurably reduces its intensity.\n- **Move for two minutes** — walk, stretch, anything.\n\nAnd if you'd rather be distracted: I tell excellent terrible jokes.`,
      { suggestions: ['Tell me a joke', '/story a hopeful ending', '/quote'], intent: 'support' }
    );
  }
  if (s >= 2) {
    return result(
      `That energy is contagious — I can feel it from here. Let's put it to work before it cools off. Want to build something, write something, or learn something?`,
      { suggestions: ['Write a story for me', 'Show me code templates', '/palette'], intent: 'support' }
    );
  }

  // 18. Contextual fallback
  return defaultReply(text, persona, history);
}
