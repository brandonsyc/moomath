// Brainf*** interpreter :)

var codemirror = CodeMirror(document.getElementsByClassName('bf-container')[0], {
  value: ` 1 +++++ +++               Set Cell #0 to 8
 2 [
 3     >++++               Add 4 to Cell #1; this will always set Cell #1 to 4
 4     [                   as the cell will be cleared by the loop
 5         >++             Add 4*2 to Cell #2
 6         >+++            Add 4*3 to Cell #3
 7         >+++            Add 4*3 to Cell #4
 8         >+              Add 4 to Cell #5
 9         <<<<-           Decrement the loop counter in Cell #1
10     ]                   Loop till Cell #1 is zero
11     >+                  Add 1 to Cell #2
12     >+                  Add 1 to Cell #3
13     >-                  Subtract 1 from Cell #4
14     >>+                 Add 1 to Cell #6
15     [<]                 Move back to the first zero cell you find; this will
16                         be Cell #1 which was cleared by the previous loop
17     <-                  Decrement the loop Counter in Cell #0
18 ]                       Loop till Cell #0 is zero
19
20 The result of this is:
21 Cell No :   0   1   2   3   4   5   6
22 Contents:   0   0  72 104  88  32   8
23 Pointer :   ^
24
25 >>.                     Cell #2 has value 72 which is 'H'
26 >---.                   Subtract 3 from Cell #3 to get 101 which is 'e'
27 +++++ ++..+++.          Likewise for 'llo' from Cell #3
28 >>.                     Cell #5 is 32 for the space
29 <-.                     Subtract 1 from Cell #4 for 87 to give a 'W'
30 <.                      Cell #3 was set to 'o' from the end of 'Hello'
31 +++.----- -.----- ---.  Cell #3 for 'rl' and 'd'
32 >>+.                    Add 1 to Cell #5 gives us an exclamation point
33 >++.                    And finally a newline from Cell #6`,
  mode: "brainf"
});

var bfcanvas = $('#bfvisualizer')[0];
var bfcontext = bfcanvas.getContext('2d', {
  alpha: true
});

var statscanvas = $('#bfstats')[0];
var statscontext = statscanvas.getContext('2d', {
  alpha: true
});

statscontext.font = "24px Segoe UI";
statscontext.textAlign = "left";

var bufferLength = 30000;
var bufferType = Uint8Array;
var bufferByte = 1;

var buffer = new bufferType(bufferLength);

var bfcode = codemirror.display.wrapper;
var marker = $('#marker')[0];

var bfconsole = $('#console')[0];

var justUndid = false;

var outputPre = $('#output')[0];
var inputPre = $('#input')[0];

var inputIndex = 0;
var inputf = "";

var pointer = 0;
var prevCodePos = 0;
var codePos = 0;
var brackets = [];

var runBFRecall = null;
var stop = false;

var stopMode = 0;
var stopMarker = $('#marker')[0].value;

var running = false;

// 0: No stop, 1: stop at output, 2: Stop at next loop exit, 3: Next pointer move,
// 4: Step by step, 5: next marker

var lastFramePause = 0;

var cycles = 0;

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
  32: '(space)',
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

for (p = 127; p < 256; p++) {
  asciiCodes[p] = String.fromCharCode(p);
}

var charCodes = asciiCodes;

bfcontext.textAlign = "center";

var bufferLeft = 0;
var bufferRight = 20;

var codeF = '';

var prevX = 0;
var prevY = 0;

var mouseDown = false;

var jumpIndexElement = $('#jump-index')[0];
var splitCodeF = [];

function resetF(c) {
  var ck = c || false;

  resetBuffer();
  clearOutput();
  setEditable(true);

  clearConsole();

  running = false;

  pointer = 0;
  prevCodePos = 0;
  inputIndex = 0;
  codePos = 0;
  cycles = 0;

  brackets = [];

  inputf = inputPre.innerText;

  updateCanvas();
  clearMarks();

  runBFRecall = null;
}

function resetBuffer() {

  if (bufferLength != buffer.length || bufferByte != buffer.BYTES_PER_ELEMENT) {
    buffer = new bufferType(bufferLength);
  } else {
    for (i = 0; i < bufferLength; i++) {
      buffer[i] = 0;
    }
  }
}

function clearConsole() {
  bfconsole.innerHTML = '';
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

function consolePrint(string) {
  bfconsole.innerHTML += string + '\n';
}

function raiseError(string) {
  consolePrint("<span class='error'>Error: " + string + "</span class='error'>");
}

function checkErrors() {
  var bracketDepth = 0;

  for (i = 0; i < codeF.length; i++) {
    if (codeF[i] === '[') {
      bracketDepth += 1;
    } else if (codeF[i] === ']') {
      bracketDepth -= 1;
    }
    if (bracketDepth < 0) {
      raiseError("Mismatched brackets.");
      return true;
    }
  }

  if (bracketDepth != 0) {
    raiseError("Mismatched brackets.");
    return true;
  }

  return false;
}

function output(char) {
  outputPre.innerHTML += String.fromCharCode(char);
  if (outputPre.innerHTML.length > 1000) {
    return;
  }
}

function clearOutput() {
  outputPre.innerHTML = '';
}

function input() {
  inputIndex++;
  if (inputIndex - 1 == inputf.length) {
    consolePrint('Reached end of input.');
    return String.fromCharCode(0);
  }
  return inputf.charCodeAt(inputIndex - 1);
}

function setEditable(a) {
  if (a) {
    document.getElementsByClassName('CodeMirror')[0].contentEditable = "inherit";
    inputPre.contentEditable = true;
  } else {
    document.getElementsByClassName('CodeMirror')[0].contentEditable = false;
    inputPre.contentEditable = false;
  }

  return;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function runBF(code, reset = true, start_position = 0) {

  running = true;
  setEditable(false);

  if (reset) resetF();

  if (reset) {
    if (checkErrors()) return;
  }

  for (j = start_position; j < code.length; j++) {
    codePos = j;

    if (stopMode == 5 && code[j] === '/') {
      var endIndex = -1;
      for (m = j + 1; m < code.length; m++) {
        if (code[m] === '/') {
          endIndex = m;
          break;
        }
      }

      if (endIndex != -1) {
        if (code.slice(j + 1, endIndex).replace(/[ \/\\]*/g, '') === stopMarker) {
          stop = true;
        }
      }
    }

    if (code[j] === '>') {
      pointer++;
      if (stopMode == 3) {
        stop = true;
      }
      cycles++;
    } else if (code[j] === '<') {
      pointer--;
      if (stopMode == 3) {
        stop = true;
      }
    } else if (code[j] === '+') {
      buffer[mod(pointer, bufferLength)] += 1;
      cycles++;
    } else if (code[j] === '-') {
      buffer[mod(pointer, bufferLength)] -= 1;
      cycles++;
    } else if (code[j] === '.') {
      output(buffer[mod(pointer, bufferLength)]);
      if (stopMode == 1) {
        stop = true;
      }
      cycles++;
    } else if (code[j] === ',') {
      var inp = input();
      if (!inp) {
        break;
      }
      buffer[mod(pointer, bufferLength)] = inp;
      cycles++;
    } else if (code[j] === '[') {
      brackets.push(j);
      cycles++;
    } else if (code[j] === ']') {
      if (buffer[mod(pointer, bufferLength)] != 0) {
        j = brackets.pop() - 1;
      } else {
        brackets.pop();
      }

      if (j === undefined) {
        raiseError('Mismatched brackets.');
        return;
      }

      if (stopMode == 2) {
        stop = true;
      }
      cycles++;
    } else {
      if (stopMode != 5 || !stop) continue;
    }

    if (new Date().getTime() > lastFramePause + 1000 / 60) {
      var k = j;
      runBFRecall = function() {
        lastFramePause = new Date().getTime();
        runBF(code, reset = false, start_position = k + 1);
      };
      updateCanvas();
      setTimeout(runBFRecall, 1000 / 120);
      return;
    }

    if (stop || stopMode == 4) {
      var k = j;
      runBFRecall = function() {
        lastFramePause = new Date().getTime();
        runBF(code, reset = false, start_position = k + 1);
      };
      stop = false;
      updateCanvas();
      return;
    }
  }

  runBFRecall = null;

  setEditable(true);
  running = false;

  updateCanvas();

  consolePrint("Finished execution.");
}

function setCodeF() {
  codeF = codemirror.getValue().slice();
  splitCodeF = codeF.split('\n');
}

CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear || function(preserveTransform) {
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
  statscontext.clear();

  highlightStep();

  for (i = parseInt(bufferLeft) - 1; i < parseInt(bufferRight) + 1; i++) {
    bfcontext.beginPath();

    var centerX = bfcanvas.width * (i + 0.5 - bufferLeft) / (bufferRight - bufferLeft);
    var spacing = bfcanvas.width / (bufferRight - bufferLeft);

    var bufferI = mod(i, bufferLength);

    if (bufferI == mod(pointer, bufferLength)) {
      bfcontext.font = "20px Segoe UI"
      bfcontext.fillText('^', centerX, 3 * bfcanvas.height / 4);
    }

    bfcontext.fillStyle = "black";

    var number = String(parseInt(buffer[bufferI]));
    bfcontext.font = 0.9 * spacing / Math.max(2, number.length) + 'px Segoe UI'

    bfcontext.fillText(number, centerX, bfcanvas.height / 4);

    var character = charCodes[buffer[bufferI]];
    bfcontext.font = 1.6 * spacing / Math.max(5, character.length) + 'px Segoe UI';
    bfcontext.fillText(charCodes[buffer[bufferI]], centerX, bfcanvas.height / 2);

    var index = bufferI;
    bfcontext.font = 1.4 * spacing / Math.max(4, String(index).length) + 'px Segoe UI';
    bfcontext.fillText(index, centerX, 7 * bfcanvas.height / 8);

    bfcontext.rect(centerX - spacing / 2, 0, spacing, bfcanvas.height);
    bfcontext.stroke();
  }

  statscontext.fillText("Instructions Run: " + cycles, 20, 30);
}

window.onload = function() {
  updateCanvas();
};

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

  var move = 1.5 * (transitX - prevX) / spacing;

  bufferLeft -= move;
  bufferRight -= move;

  prevX = transitX;
  prevY = transitY;

  updateCanvas();
}

function handleMouseUp() {
  if (!mouseDown) return;
  mouseDown = false;

  updateCanvas();
}

function jumpIndex() {
  var index = parseInt(jumpIndexElement.value);

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
  } catch (e) {;
  }

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
      previ = i + 1;
    }
  }
  if (tapeData === '') {
    return;
  }
  copyTextToClipboard(tapeData.slice(0, tapeData.length - 2));
}

function nextOutput() {
  stopMode = 1;
  if (runBFRecall) {
    runBFRecall();
  } else {
    setCodeF();
    runBF(codeF);
  }
  updateCanvas();
}

function nextLoopEnd() {
  stopMode = 2;
  if (runBFRecall) {
    runBFRecall();
  } else {
    setCodeF();
    runBF(codeF);
  }
  updateCanvas();
}

function nextPointerMove() {
  stopMode = 3;
  if (runBFRecall) {
    runBFRecall();
  } else {
    setCodeF();
    runBF(codeF);
  }
  updateCanvas();
}

function nextStep() {
  stopMode = 4;
  if (runBFRecall) {
    runBFRecall();
  } else {
    setCodeF();
    runBF(codeF);
  }
  updateCanvas();
}

function nextMarker(marker) {
  stopMarker = marker.replace(/[ \/\\]*/g, '');

  stopMode = 5;
  if (runBFRecall) {
    runBFRecall();
  } else {
    setCodeF();
    runBF(codeF);
  }
  updateCanvas();
}

function censor(a) {
  // I know, I know, such weaklings, they don't even want to have the f word in code!
  // We are but children anyway.

  var bfuncensor1 = [66, 114, 97, 105, 110, 102, 117, 99, 107].map(function(b) {
    return String.fromCharCode(b);
  }).join('');
  var bfcensor1 = "Brainf*ck";
  var bfuncensor2 = [98, 114, 97, 105, 110, 102, 117, 99, 107].map(function(b) {
    return String.fromCharCode(b);
  }).join('');
  var bfcensor2 = "brainf*ck";

  if (a) {
    document.title = bfcensor1 + ' Interpreter';
    var toCensor = document.getElementsByClassName('censor');

    for (i = 0; i < toCensor.length; i++) {
      toCensor[i].innerHTML = toCensor[i].innerHTML.replace(bfuncensor1, bfcensor1).replace(bfuncensor2, bfcensor2);
    }
  } else {
    document.title = bfuncensor1 + ' Interpreter';
    var toUncensor = document.getElementsByClassName('censor');

    for (i = 0; i < toUncensor.length; i++) {
      toUncensor[i].innerHTML = toUncensor[i].innerHTML.replace(bfcensor1, bfuncensor1).replace(bfcensor2, bfuncensor2);
    }
  }
}

// TODO: Figure out how to get the frickin syntax highlighter to stop messing up clicking events

function syntaxHighlight() {
  codemirror.setValue(codemirror.getValue());
}

window.onload = function() {
  censor(true);
  updateCanvas();
};

/**$('.CodeMirror')[0].addEventListener('click', function() {
  if (running) {
    var start = codemirror.getCursor();
    resetF();
    codemirror.setCursor(start);
  }
});**/

document.getElementById('tapelength').addEventListener('input', function() {
  if (this.value && this.value > 3 && this.value <= 1000000) {
    bufferLength = parseInt(this.value);
    resetF();
  }
});

bfcanvas.addEventListener('mousedown', handleMouseDown);
bfcanvas.addEventListener('mouseup', handleMouseUp);
bfcanvas.addEventListener('mousemove', handleMouseMove);
bfcanvas.addEventListener('mouseout', handleMouseUp);

document.getElementById('copy-tape').addEventListener('click', copyTapeData);
document.getElementById('jump-pointer').addEventListener('click', jumpPointer);
document.getElementById('jump').addEventListener('click', jumpIndex);

document.getElementById('non-code').addEventListener('click', function() {
  var s = '';
  var current = codemirror.getValue();

  for (i = 0; i < current.length; i++) {
    var c = current[i];
    if (c === '<' || c === '>' || c === '.' || c === ',' || c === '+' || c === '-' || c === '[' || c === ']') {
      s += c;
    }
  }

  codemirror.setValue(s);
  syntaxHighlight();
  setEditable(true);
});

document.getElementById('reset').addEventListener('click', resetF);
document.getElementById('start').addEventListener('click', function() {
  stopMode = 0;
  setCodeF();
  runBF(codeF);
  updateCanvas();
});
document.getElementById('debug').addEventListener('click', function() {
  stopMode = 4;
  setCodeF();
  runBF(codeF);
  updateCanvas();
});
document.getElementById('goto1').addEventListener('click', nextOutput);
document.getElementById('goto2').addEventListener('click', nextLoopEnd);
document.getElementById('goto3').addEventListener('click', nextPointerMove);
document.getElementById('goto4').addEventListener('click', nextStep);
document.getElementById('goto5').addEventListener('click', function() {
  nextMarker(marker.value);
});

document.getElementById('censor-trigger').addEventListener('click', function() {
  censor(this.checked);
});

document.getElementsByClassName('CodeMirror')[0].addEventListener('click', function() {
  if (running) {
    resetF();
  }
});

var marks = [];

function clearMarks() {
  for (mark = 0; mark < marks.length; mark++) {
    marks[mark].clear();
  }
}

function highlightStep() {
  if (codePos >= 0) {
    var start = coordsFromIndex(codePos);
    var end = coordsFromIndex(codePos + 1);

    clearMarks();
    if (start && end) {
      marks.push(codemirror.markText(start, end, {
        className: 'highlight'
      }));
    }
  }
}

var coordsFromIndex = function(index) {
  var lines = splitCodeF;
  var lineCount = lines.length,
    pos = 0,
    line, ch, lineLength;
  var separatorLength = codemirror.lineSeparator().length;

  for (line = 0; line < lineCount; line++) {
    lineLength = lines[line].length + separatorLength;

    if (pos + lineLength > index) {
      ch = index - pos;
      return {
        line: line,
        ch: ch
      }
    }
    pos += lineLength;
  }
  return null;
}

window.onbeforeunload = function() {
  return "Are you sure you want to navigate away?";
}

function BFtoJS(bf) {
  var s = '';

  for (i = 0; i < bf.length; i++) {
    var c = bf[i];
    if (c === '<' || c === '>' || c === '.' || c === ',' || c === '+' || c === '-' || c === '[' || c === ']') {
      s += c;
    }
  }

  bf = s;

  var commands = [];

  return bf;
}

document.getElementsByClassName("cm-s-default")[0].onmousedown = function() {try{document.getElementsByClassName("CodeMirror-cursor")[0].innerHTML = ""}catch(e){;}}
