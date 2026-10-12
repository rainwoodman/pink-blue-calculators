// Pink Calculator Logic & Web Audio Sound Effects

let currentInput = '0';
let previousInput = '';
let operator = null;
let resetDisplayOnNextDigit = false;
let soundEnabled = true;

const mainDisplay = document.getElementById('mainDisplay');
const historyDisplay = document.getElementById('historyDisplay');
const soundToggle = document.getElementById('soundToggle');

// Cute Web Audio synthesizer
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, type = 'sine', duration = 0.08) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context may fail if user hasn't interacted or unsupported
  }
}

function playCuteSound(action) {
  switch (action) {
    case 'num':
      playTone(520 + Math.random() * 80, 'sine', 0.07);
      break;
    case 'op':
      playTone(680, 'triangle', 0.1);
      break;
    case 'calculate':
      playTone(880, 'sine', 0.08);
      setTimeout(() => playTone(1174, 'sine', 0.15), 70);
      break;
    case 'clear':
      playTone(380, 'sine', 0.1);
      break;
    case 'delete':
      playTone(330, 'sine', 0.06);
      break;
    default:
      playTone(440, 'sine', 0.06);
  }
}

function updateDisplay() {
  mainDisplay.textContent = currentInput;
  if (operator && previousInput !== '') {
    historyDisplay.textContent = `${previousInput} ${operator}`;
  } else {
    historyDisplay.textContent = '';
  }
}

function inputDigit(digit) {
  playCuteSound('num');
  if (resetDisplayOnNextDigit) {
    currentInput = digit;
    resetDisplayOnNextDigit = false;
  } else {
    if (currentInput === '0') {
      currentInput = digit;
    } else {
      if (currentInput.length < 14) {
        currentInput += digit;
      }
    }
  }
  updateDisplay();
}

function inputDecimal() {
  playCuteSound('num');
  if (resetDisplayOnNextDigit) {
    currentInput = '0.';
    resetDisplayOnNextDigit = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function handleOperator(nextOp) {
  playCuteSound('op');
  const inputValue = parseFloat(currentInput);

  if (operator && !resetDisplayOnNextDigit) {
    computeResult();
  } else {
    previousInput = currentInput;
  }

  operator = nextOp;
  resetDisplayOnNextDigit = true;
  updateDisplay();
}

function computeResult() {
  if (operator === null || resetDisplayOnNextDigit) return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(curr)) return;

  let result = 0;
  switch (operator) {
    case '+':
      result = prev + curr;
      break;
    case '-':
    case '−':
      result = prev - curr;
      break;
    case '×':
    case '*':
      result = prev * curr;
      break;
    case '÷':
    case '/':
      if (curr === 0) {
        currentInput = 'Oops! 💕';
        operator = null;
        previousInput = '';
        resetDisplayOnNextDigit = true;
        updateDisplay();
        return;
      }
      result = prev / curr;
      break;
    default:
      return;
  }

  // Format to round floating issues
  result = Math.round(result * 100000000) / 100000000;
  historyDisplay.textContent = `${prev} ${operator} ${curr} =`;
  currentInput = String(result);
  operator = null;
  resetDisplayOnNextDigit = true;
  updateDisplay();
}

function clearAll() {
  playCuteSound('clear');
  currentInput = '0';
  previousInput = '';
  operator = null;
  resetDisplayOnNextDigit = false;
  updateDisplay();
}

function deleteLast() {
  playCuteSound('delete');
  if (resetDisplayOnNextDigit) {
    clearAll();
    return;
  }
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
}

function percent() {
  playCuteSound('op');
  const val = parseFloat(currentInput);
  if (!isNaN(val)) {
    currentInput = String(val / 100);
    updateDisplay();
  }
}

// Event Listeners for buttons
document.querySelector('.keypad').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const val = btn.getAttribute('data-val');
  const action = btn.getAttribute('data-action');

  if (action === 'operator') {
    handleOperator(val);
  } else if (action === 'calculate') {
    playCuteSound('calculate');
    computeResult();
  } else if (action === 'clear') {
    clearAll();
  } else if (action === 'delete') {
    deleteLast();
  } else if (action === 'percent') {
    percent();
  } else if (val === '.') {
    inputDecimal();
  } else if (val) {
    inputDigit(val);
  }
});

// Sound Toggle
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle('muted', !soundEnabled);
  soundToggle.textContent = soundEnabled ? '🔔' : '🔕';
});

// Physical Keyboard Support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key);
  } else if (e.key === '.') {
    inputDecimal();
  } else if (e.key === '+' || e.key === '-') {
    handleOperator(e.key === '-' ? '−' : '+');
  } else if (e.key === '*') {
    handleOperator('×');
  } else if (e.key === '/') {
    e.preventDefault();
    handleOperator('÷');
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    playCuteSound('calculate');
    computeResult();
  } else if (e.key === 'Backspace') {
    deleteLast();
  } else if (e.key === 'Escape') {
    clearAll();
  } else if (e.key === '%') {
    percent();
  }
});
