// Brainf*** interpreter :)

var bfcanvas = document.getElementById('bfvisualizer');
var bfcontext = bfcanvas.getContext('2d', {
  alpha: true
});

var bufferLength = 30000;
var bufferType = Uint8Array;
var bufferByte = 1;

var buffer = new bufferType(bufferLength);

var bfcode = document.getElementById('bf-code');

function resetBuffer() {
  if (bufferLength != buffer.length || bufferByte != buffer.BYTES_PER_ELEMENT) {
    buffer = new bufferType(bufferLength);
  } else {
    for (i = 0; i < bufferLength; i++) {
      buffer[i] = 0;
    }
  }
}

function setBufferType(type) {
  // Type is either 1, 2, or 4 (bytes per element)
  if (type == 1) {
    bufferByte = 1;
    bufferType = Uint8Array;
  } else if (type == 2) {
    bufferByte = 2;
    bufferType = Uint16Array;
  } else if (type == 4) {
    bufferByte = 4;
    bufferType = Uint32Array;
  }
}

function raiseError(string) {
  console.error(string);
}

var outputPre = document.getElementById('output');

function output(char) {
  outputPre.innerHTML += String.fromCharCode(char);
  if (outputPre.innerHTML.length > 1000) {
    return;
  }
}

function clearOutput() {
  outputPre.innerHTML = '';
}

var inputIndex = 0;
var input = "udders";

function input() {
  inputIndex++;
  if (inputIndex - 1 >= input.length) {
    console.log('complete');
    return 0;
  }
  return input.charCodeAt(inputIndex - 1);
}

var pointer = 0;
var brackets = [];

var runBFRecall = null;
var stop = false;

var stopMode = 0;

// 0: No stop, 1: stop at output, 2: Stop at next loop exit, 3: Next pointer move, 4: Step by step

var lastFramePause = 0;

function runBF(code, reset = true, start_position = 0) {
  if (reset) {
    resetBuffer();
    clearOutput();

    inputIndex = 0;

    pointer = 0;
    brackets = [];

    runBFRecall = null;

    lastFramePause = new Date().getTime();
  }

  for (j = start_position; j < code.length; j++) {
    if (code[j] === '>') {
      pointer++;
      if (pointer >= bufferLength) {
        raiseError("Pointer went past end of buffer.");
        return;
      }
      if (stopMode == 3) {
        stop = true;
      }
    } else if (code[j] === '<') {
      pointer--;
      if (pointer < 0) {
        raiseError("Pointer went before beginning of buffer.");
        return;
      }
      if (stopMode == 3) {
        stop = true;
      }
    } else if (code[j] === '+') {
      buffer[pointer] += 1;
    } else if (code[j] === '-') {
      buffer[pointer] -= 1;
    } else if (code[j] === '.') {
      output(buffer[pointer]);
      if (stopMode == 1) {
        stop = true;
      }
    } else if (code[j] === ',') {
      code[j] = input();
    } else if (code[j] === '[') {
      brackets.push(j);
    } else if (code[j] === ']') {
      try {
        if (buffer[pointer] != 0) {
          j = brackets.pop() - 1;
        } else {
          brackets.pop();
        }
      } catch (e) {
        raiseError('Mismatched brackets.');
        return;
      }
      if (stopMode == 2) {
        stop = true;
      }
    }

    if (new Date().getTime() > lastFramePause + 1000/60) {
      var k = j;
      runBFRecall = function() {
        lastFramePause = new Date().getTime();
        runBF(code, reset = false, start_position = k)
      };
      updateCanvas();
      setTimeout(runBFRecall,1000/60);
    }

    if (stop || stopMode == 4) {
      var k = j;
      runBFRecall = function() {
        lastFramePause = new Date().getTime();
        runBF(code, reset = false, start_position = k + 1)
      };
      stop = false;
      return;
    }
  }

  runBFRecall = null;
}

var asciiCodes = {
  0: '(NUL)',
  1: '(SOH)',
  2: '(STX)',
  3: '(ETX)',
  4: '(EOT)',
  5: '(ENQ)',
  6: '(ACK)',
  7: '(BEL)',
  8: '(BS)',
  9: '(TAB)',
  10: '(LF)',
  11: '(VT)',
  12: '(FF)',
  13: '(CR)',
  14: '(SO)',
  15: '(SI)',
  16: '(DLE)',
  17: '(DC1)',
  18: '(DC2)',
  19: '(DC3)',
  20: '(DC4)',
  21: '(NAK)',
  22: '(SYN)',
  23: '(ETB)',
  24: '(CAN)',
  25: '(EM)',
  26: '(SUB)',
  27: '(ESC)',
  28: '(FS)',
  29: '(GS)',
  30: '(RS)',
  31: '(US)',
  32: '(Space)',
  33: '!',
  33: '!',
  34: '"',
  35: '#',
  36: '$',
  37: '%',
  38: '&',
  39: '\'',
  40: '(',
  41: ')',
  42: '*',
  43: '+',
  44: ',',
  45: '-',
  46: '.',
  47: '/',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  58: ':',
  59: ';',
  60: '<',
  61: '=',
  62: '>',
  63: '?',
  64: '@',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z',
  91: '[',
  92: '\\',
  93: ']',
  94: '^',
  95: '_',
  96: '`',
  97: 'a',
  98: 'b',
  99: 'c',
  100: 'd',
  101: 'e',
  102: 'f',
  103: 'g',
  104: 'h',
  105: 'i',
  106: 'j',
  107: 'k',
  108: 'l',
  109: 'm',
  110: 'n',
  111: 'o',
  112: 'p',
  113: 'q',
  114: 'r',
  115: 's',
  116: 't',
  117: 'u',
  118: 'v',
  119: 'w',
  120: 'x',
  121: 'y',
  122: 'z',
  123: '{',
  124: '|',
  125: '}',
  126: '~',
  127: '(DEL)'
}

var charCodes = asciiCodes;

bfcontext.textAlign = "center";

var bufferLeft = 0;
var bufferRight = 20;

CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
};

function updateCanvas() {
  bfcontext.clear();
  for (i = parseInt(bufferLeft) - 1; i < parseInt(bufferRight) + 1; i++) {
    if (i < 0 || i > buffer.length) {
      continue;
    }

    bfcontext.beginPath();

    var centerX = bfcanvas.width * (i + 0.5 - bufferLeft) / (bufferRight - bufferLeft);
    var spacing = bfcanvas.width / (bufferRight - bufferLeft);

    if (i == pointer) {
      bfcontext.font = "20px Segoe"
      bfcontext.fillText('^', centerX, 3 * bfcanvas.height / 4);
    }

    bfcontext.fillStyle = "black";

    var number = String(parseInt(buffer[i]));
    bfcontext.font = 0.9 * spacing / Math.max(2, number.length) + 'px Cambria'

    bfcontext.fillText(number, centerX, bfcanvas.height / 4);

    var character = charCodes[buffer[i]];
    bfcontext.font = 1.6 * spacing / Math.max(5, character.length) + 'px Cambria';
    bfcontext.fillText(charCodes[buffer[i]], centerX, bfcanvas.height / 2);

    var index = i;
    bfcontext.font = 1 * spacing / Math.max(5, index.length) + 'px Cambria';
    bfcontext.fillText(index, centerX, 7 * bfcanvas.height / 8);

    bfcontext.rect(centerX - spacing / 2, 0, spacing, bfcanvas.height);
    bfcontext.stroke();
  }
}

window.onload = function() {
  updateCanvas();
};

var prevX = 0;
var prevY = 0;

var mouseDown = false;

function handleMouseDown() {
  var boundingRect = bfcanvas.getBoundingClientRect();

  var left = boundingRect.left;
  var top = boundingRect.top;

  prevX = window.event.clientX - left;
  prevY = window.event.clientY - top;

  mouseDown = true;
}

function handleMouseMove() {
  if (!mouseDown) return;

  var boundingRect = bfcanvas.getBoundingClientRect();

  var left = boundingRect.left;
  var top = boundingRect.top;

  var spacing = bfcanvas.width / (bufferRight - bufferLeft);

  var transitX = window.event.clientX - left;
  var transitY = window.event.clientY - top;

  var move = (transitX - prevX) / spacing;

  bufferLeft -= move;
  bufferRight -= move;

  prevX = transitX;
  prevY = transitY;

  updateCanvas();
}

function handleMouseUp() {
  mouseDown = false;

  updateCanvas();
}

function jumpIndex() {
  var index = parseInt(document.getElementById('jump-index').value);

  if (index < 0 || index > bufferLength) {
    raiseError('Index is invalid.');
  } else {
    bufferLeft = index;
    bufferRight = index + 20;
  }

  updateCanvas();
}

function jumpPointer() {
  bufferLeft = pointer;
  bufferRight = pointer + 20;

  updateCanvas();
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  textArea.style.width = '2em';
  textArea.style.height = '2em';

  textArea.style.padding = 0;

  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  textArea.style.background = 'transparent';

  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
  } catch (e) {;}

  document.body.removeChild(textArea);
}

function setChangeListener(div, listener) {
    div.addEventListener("blur", listener);
    div.addEventListener("keyup", listener);
    div.addEventListener("paste", listener);
    div.addEventListener("copy", listener);
    div.addEventListener("cut", listener);
    div.addEventListener("delete", listener);
    div.addEventListener("mouseup", listener);
}

function copyTapeData() {
  var tapeData = "";
  var previ = 0;

  for (i = 0; i < buffer.length; i++) {
    if (buffer[i] != 0) {
      for (j = previ; j < i + 1; j++) {
        tapeData = tapeData + parseInt(buffer[j]) + ', ';
      }
      previ = i+1;
    }
  }
  if (tapeData === '') {
    return;
  }
  copyTextToClipboard(tapeData.slice(0,tapeData.length-2));
}
