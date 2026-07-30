// ─── Utilities ────────────────────────────────────────────────────────────────

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

function simplifyFraction(num, den) {
  if (den === 0) return { num: 0, den: 1 };
  const g = gcd(Math.abs(num), Math.abs(den));
  let n = num / g, d = den / g;
  if (d < 0) { n = -n; d = -d; }
  return { num: n, den: d };
}

function fractionStr(num, den) {
  const s = simplifyFraction(num, den);
  if (s.den === 1) return String(s.num);
  return `${s.num}/${s.den}`;
}

// Parse user input as fraction "a/b" or integer, returns { num, den } or null
function parseAnswer(str) {
  str = str.trim().replace(/\s/g, '');
  if (/^-?\d+\/\d+$/.test(str)) {
    const parts = str.split('/');
    return { num: parseInt(parts[0]), den: parseInt(parts[1]) };
  }
  if (/^-?\d+$/.test(str)) {
    return { num: parseInt(str), den: 1 };
  }
  return null;
}

function fractionsEqual(a, b) {
  // cross-multiply
  return a.num * b.den === b.num * a.den;
}

// ─── Topic Generators ─────────────────────────────────────────────────────────

const generators = {

  // ── Bruchrechnen ─────────────────────────────────────────────────────────
  bruch(diff) {
    const ops = ['+', '-', '×', '÷'];
    let op, a1, a2, b1, b2;

    const maxDen = diff === 'easy' ? 6 : diff === 'medium' ? 12 : 20;
    const maxNum = diff === 'easy' ? 5 : diff === 'medium' ? 10 : 15;

    op = ops[rnd(0, diff === 'easy' ? 1 : 3)];
    a1 = rnd(1, maxNum);
    b1 = rnd(2, maxDen);
    a2 = rnd(1, maxNum);
    b2 = rnd(2, maxDen);

    // ensure b2 ≠ b1 for addition/subtraction variety
    if ((op === '+' || op === '-') && b2 === b1) b2 = b1 + 1;

    let ansNum, ansDen;

    if (op === '+') {
      const l = lcm(b1, b2);
      ansNum = a1 * (l / b1) + a2 * (l / b2);
      ansDen = l;
    } else if (op === '-') {
      const l = lcm(b1, b2);
      ansNum = a1 * (l / b1) - a2 * (l / b2);
      ansDen = l;
    } else if (op === '×') {
      ansNum = a1 * a2;
      ansDen = b1 * b2;
    } else { // ÷
      ansNum = a1 * b2;
      ansDen = b1 * a2;
    }

    const simplified = simplifyFraction(ansNum, ansDen);
    const answerStr = fractionStr(ansNum, ansDen);

    return {
      question: `${a1}/${b1}  ${op}  ${a2}/${b2}  =  ?`,
      hint: 'Kürze dein Ergebnis so weit wie möglich. Format: Zähler/Nenner oder ganze Zahl',
      checkAnswer(input) {
        const parsed = parseAnswer(input);
        if (!parsed) return false;
        return fractionsEqual(parsed, simplified);
      },
      solutionStr: answerStr
    };
  },

  // ── Negative Zahlen ───────────────────────────────────────────────────────
  negativ(diff) {
    const range = diff === 'easy' ? 10 : diff === 'medium' ? 20 : 50;
    const ops = diff === 'easy' ? ['+', '-'] : ['+', '-', '×', '÷'];
    const op = ops[rnd(0, ops.length - 1)];

    let a, b, ans;

    if (op === '+' || op === '-') {
      a = rnd(-range, range);
      b = rnd(-range, range);
      ans = op === '+' ? a + b : a - b;
    } else if (op === '×') {
      a = rnd(-range / 5, range / 5);
      b = rnd(-range / 5, range / 5);
      ans = a * b;
    } else {
      // division: ensure clean result
      b = rnd(1, Math.max(2, range / 5));
      b = Math.random() < 0.5 ? -b : b;
      ans = rnd(-range / 5, range / 5);
      a = ans * b;
    }

    const opSymbol = op === '×' ? '·' : op === '÷' ? ':' : op;

    // BUG FIX #2: Only wrap b in parentheses when it is negative
    const bDisplay = b < 0 ? `(${b})` : b;

    return {
      question: `${a}  ${opSymbol}  ${bDisplay}  =  ?`,
      hint: 'Achte auf Vorzeichen: (−) · (−) = (+)',
      checkAnswer(input) {
        const v = parseInt(input.trim());
        return !isNaN(v) && v === ans;
      },
      solutionStr: String(ans)
    };
  },

  // ── Ausklammern ───────────────────────────────────────────────────────────
  ausklammern(diff) {
    // Generate: a·x + a·b = a(x + b)  or more complex
    const maxA = diff === 'easy' ? 5 : diff === 'medium' ? 10 : 15;
    const maxB = diff === 'easy' ? 8 : diff === 'medium' ? 15 : 20;

    const a = rnd(2, maxA);
    const b = rnd(1, maxB);
    const c = rnd(1, maxB);

    // Three sub-modes
    const mode = rnd(0, diff === 'easy' ? 0 : 2);

    let question, hint, correct;

    if (mode === 0) {
      // a·b + a·c → a(b + c)
      const term1 = a * b;
      const term2 = a * c;
      question = `${term1}x + ${term2}  =  ?`;
      hint = `Finde den größten gemeinsamen Teiler. Format: z.B. 3(2x + 5)`;

      // Accept variants: a(bx + c) or a·(bx + c)
      const g = gcd(term1, term2);
      const f1 = term1 / g;
      const f2 = term2 / g;
      correct = `${g}(${f1}x + ${f2})`;

      return {
        question,
        hint,
        checkAnswer(input) {
          const s = input.trim().replace(/\s/g, '').replace(/·|\*/g, '');
          // Accept any factoring that matches a valid factored form
          // Parse k(mx + n)
          const m = s.match(/^(\d+)\((\d+)x\+(\d+)\)$/);
          if (!m) return false;
          const k = parseInt(m[1]), mx = parseInt(m[2]), n = parseInt(m[3]);
          return k * mx === term1 && k * n === term2;
        },
        solutionStr: correct
      };
    } else if (mode === 1) {
      // a·b·x + a·c·x² → ax(b + cx)
      const term1 = a * b;
      const term2 = a * c;
      question = `${term1}x + ${term2}x²  =  ?`;
      hint = 'Klammere x und den ggT aus. Format: z.B. 4x(3 + 2x)';
      const g = gcd(term1, term2);
      const f1 = term1 / g;
      const f2 = term2 / g;
      correct = `${g}x(${f1} + ${f2}x)`;

      return {
        question,
        hint,
        checkAnswer(input) {
          const s = input.trim().replace(/\s/g, '').replace(/·|\*/g, '');
          const m = s.match(/^(\d+)x\((\d+)\+(\d+)x\)$/);
          if (!m) return false;
          const k = parseInt(m[1]), f = parseInt(m[2]), h = parseInt(m[3]);
          return k * f === term1 && k * h === term2;
        },
        solutionStr: correct
      };
    } else {
      // (a+d)·b·x + (a+d)·c  → (a+d)(bx + c)
      const d = rnd(2, maxA);
      const term1 = a * b + d * b; // (a+d)b
      const term2 = a * c + d * c; // (a+d)c
      const g = gcd(Math.abs(term1), Math.abs(term2));
      const f1 = term1 / g;
      const f2 = term2 / g;
      question = `${term1}x + ${term2}  =  ?`;
      hint = 'Klammere den ggT aus. Format: z.B. 6(3x + 2)';
      correct = `${g}(${f1}x + ${f2})`;

      return {
        question,
        hint,
        checkAnswer(input) {
          const s = input.trim().replace(/\s/g, '').replace(/·|\*/g, '');
          const m = s.match(/^(\d+)\((\d+)x\+(\d+)\)$/);
          if (!m) return false;
          const k = parseInt(m[1]), mx = parseInt(m[2]), n = parseInt(m[3]);
          return k * mx === term1 && k * n === term2;
        },
        solutionStr: correct
      };
    }
  },

  // ── Einfache Gleichungen ───────────────────────────────────────────────────
  gleichung(diff) {
    const range = diff === 'easy' ? 10 : diff === 'medium' ? 20 : 40;

    // x = solution (always integer for clean answers)
    const x = rnd(-range / 2, range / 2);

    const mode = rnd(0, diff === 'easy' ? 1 : 3);
    let question, hint, checkAnswer, solutionStr;

    if (mode === 0) {
      // ax + b = c
      const a = rnd(1, diff === 'easy' ? 5 : 10);
      const b = rnd(-range, range);
      const c = a * x + b;
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      question = `${a}x ${bStr}  =  ${c}`;
      // BUG FIX #1: was `hint: '';` (label statement, no-op) — now a proper assignment
      hint = 'Bringe die Zahl auf die rechte Seite, dann teile durch den Koeffizienten.';
      checkAnswer = (input) => parseInt(input.trim()) === x;
      solutionStr = String(x);

    } else if (mode === 1) {
      // ax = b
      const a = rnd(2, diff === 'easy' ? 8 : 15);
      const b = a * x;
      question = `${a}x  =  ${b}`;
      hint = 'Löse nach x auf. Gib nur die Zahl ein.';
      checkAnswer = (input) => parseInt(input.trim()) === x;
      solutionStr = String(x);

    } else if (mode === 2) {
      // ax + b = cx + d  (two sides)
      const a = rnd(2, 8), c = rnd(1, a - 1);
      const b = rnd(-range, range);
      const d = (a - c) * x + b;
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const dStr = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
      question = `${a}x ${bStr}  =  ${c}x ${dStr}`;
      hint = 'Löse nach x auf. Gib nur die Zahl ein.';
      checkAnswer = (input) => parseInt(input.trim()) === x;
      solutionStr = String(x);

    } else {
      // (x + a) / b = c
      const b = rnd(2, 8);
      const a = rnd(-range / 2, range / 2);
      const c = (x + a);
      const realC = c / b;
      if (!Number.isInteger(realC)) {
        // fallback to ax = b
        const a2 = rnd(1, 5);
        const b2 = a2 * x + rnd(-10, 10);
        question = `${a2}x  =  ${b2}`;
        hint = 'Löse nach x auf. Gib nur die Zahl ein.';
        const sol = b2 / a2;
        if (!Number.isInteger(sol)) {
          checkAnswer = (input) => {
            const p = parseAnswer(input);
            if (!p) return false;
            return fractionsEqual(p, simplifyFraction(b2, a2));
          };
          solutionStr = fractionStr(b2, a2);
        } else {
          checkAnswer = (input) => parseInt(input.trim()) === sol;
          solutionStr = String(sol);
        }
      } else {
        const aStr = a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
        question = `(x ${aStr}) / ${b}  =  ${realC}`;
        hint = 'Multipliziere beide Seiten mit dem Nenner, dann löse nach x auf.';
        checkAnswer = (input) => parseInt(input.trim()) === x;
        solutionStr = String(x);
      }
    }

    return {
      question,
      hint,
      checkAnswer,
      solutionStr
    };
  }
};

// ─── State ────────────────────────────────────────────────────────────────────

let currentTopic = 'bruch';
let currentDiff  = 'easy';
let currentTask  = null;
let score        = { correct: 0, wrong: 0, total: 0 };
let history      = []; // 'c' or 'w'
let answered     = false;

// ─── DOM ──────────────────────────────────────────────────────────────────────

const questionEl  = document.getElementById('question');
const hintEl      = document.getElementById('hint');
const answerEl    = document.getElementById('answer');
const feedbackEl  = document.getElementById('feedback');
const checkBtn    = document.getElementById('checkBtn');
const nextBtn     = document.getElementById('nextBtn');
const dotsEl      = document.getElementById('progressDots');

function updateScore() {
  document.getElementById('scoreCorrect').textContent = score.correct;
  document.getElementById('scoreWrong').textContent   = score.wrong;
  document.getElementById('scoreTotal').textContent   = score.total;
}

function updateDots() {
  dotsEl.innerHTML = '';
  history.slice(-30).forEach(r => {
    const d = document.createElement('div');
    d.className = 'dot ' + r;
    dotsEl.appendChild(d);
  });
}

function loadTask() {
  answered = false;
  answerEl.value = '';
  answerEl.className = '';
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  currentTask = generators[currentTopic](currentDiff);
  questionEl.textContent = currentTask.question;
  hintEl.textContent = currentTask.hint || '';
  answerEl.focus();
}

function checkAnswer() {
  if (answered) return;
  const input = answerEl.value;
  if (!input.trim()) return;

  answered = true;
  score.total++;

  if (currentTask.checkAnswer(input)) {
    feedbackEl.textContent = '✓ Richtig!';
    feedbackEl.className = 'feedback correct';
    answerEl.classList.add('correct');
    score.correct++;
    history.push('c');
  } else {
    feedbackEl.textContent = `✗ Falsch. Lösung: ${currentTask.solutionStr}`;
    feedbackEl.className = 'feedback wrong';
    answerEl.classList.add('wrong');
    score.wrong++;
    history.push('w');
  }

  updateScore();
  updateDots();
}

// ─── Events ───────────────────────────────────────────────────────────────────

// Tab clicks
document.getElementById('tabs').addEventListener('click', e => {
  if (e.target.dataset.topic) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    currentTopic = e.target.dataset.topic;
    loadTask();
  }
});

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.classList.remove('active-easy', 'active-medium', 'active-hard');
    });
    const diff = btn.dataset.diff;
    btn.classList.add(`active-${diff}`);
    currentDiff = diff;
    loadTask();
  });
});

checkBtn.addEventListener('click', checkAnswer);

answerEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!answered) checkAnswer();
    else loadTask();
  }
});

nextBtn.addEventListener('click', loadTask);

// ─── Init ─────────────────────────────────────────────────────────────────────
loadTask();
