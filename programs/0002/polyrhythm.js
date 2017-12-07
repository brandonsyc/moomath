var beatNum = 0;
var play = false;

var beat1 = 5;
var beat2 = 3;

var bpm = 120;

var c = document.getElementById("beater");
var ctx = c.getContext("2d");
ctx.font = "20px Segoe, \"Segoe UI\", \"DejaVu Sans\", \"Trebuchet MS\", Verdana, \"sans-serif\"";
ctx.align = "center";

var backAndForth = false;

var start;
var nextAt;
var beatsLater;

var volume = 0.8;

var doSubdivisions = true;
var showFlyline = true;
var playAccents = true;

var metronome = new METRO.Metronome();

metronome.audio.addSample("sounds/click1.wav", "click1");
metronome.audio.addSample("sounds/click2.wav", "click2");
metronome.audio.addSample("sounds/click3.wav", "click3");

metronome.audio.addSample("sounds/accent1.wav", "accent1");

function playSoundAsync(url) {
  return;
}

function resetVars() {
  "use strict";
  start = null;
  nextAt = null;

  oneFrameCircles = [];
  queuedCircles = [];

  beatsLater = 1;
}

function togglePlayback() {
  play = !play;

  if (play) {
    beatsLater = 1;
    beatNum = 0;
    document.getElementById("toggle").innerHTML = "Stop";
    start = new Date().getTime();
    nextAt = start;
		metronome.players = {};

		metronome.addBeat(new METRO.ConstantBeat({sound: "click1", bpm: bpm}));
		metronome.addBeat(new METRO.ConstantBeat({sound: "click3", bpm: bpm * Math.max(beat1 / beat2, beat2 / beat1)}));

		metronome.startAll();
    playBeat();
  } else {
    document.getElementById("toggle").innerHTML = "Play";
    drawBeats();

		metronome.stopAll();
		for (let i = 0; i < metronome.players.length; i++) {
			delete metronome.players[i];
		}
  }
}

function playBeat() {
  "use strict";
  var drift = null;

  /**console.log(start);
  console.log(nextAt);
  console.log(beatsLater);**/

  if (doSubdivisions) {
    drift = (new Date().getTime() - start) % (Math.min(60000.0 / Math.max(beat1, beat2) / bpm));
  } else {
    drift = (new Date().getTime() - start) % (beatsLater * 60000.0 / Math.max(beat1, beat2) / bpm);
  }

  //console.log(drift + " ms");
  if (beat1 === -1 || beat2 === -1) {
    play = false;
    document.getElementById("toggle").innerHTML = "Play";

		metronome.stopAll();
		for (let i = 0; i < metronome.players.length; i++) {
			delete metronome.players[i];
		}
    return;
  }
  if (beatNum % (beat1 * beat2) === 0) {
    flyLine(0, false);
    queueFillCircle(0, 0, beat1, 20, "#08b");
    queueFillCircle(0, 1, beat2, 20, "#08b");
  } else {
    if (beatNum % beat1 === 0) {
      queueFillCircle((beatNum / beat2) % beat1, 1, beat1, 20, "#096");
    }
    if (beatNum % beat2 === 0) {
      queueFillCircle((beatNum / beat1) % beat2, 0, beat2, 20, "#096");
    }
  }
  for (var i = beatNum + 1; i <= beat1 * beat2 + beatNum - (beatNum % (beat1 * beat2)); i++) {
    if (i % beat1 === 0 || i % beat2 === 0) {
      beatsLater = i - beatNum;
      break;
    }
  }
  if (doSubdivisions) {
    beatNum += 1;
    nextAt += 60000.0 / Math.max(beat1, beat2) / bpm;
  } else {
    beatNum += beatsLater;
    nextAt += beatsLater * 60000.0 / Math.max(beat1, beat2) / bpm;
  }

  /**beatNum += 1;
  nextAt += 60000.0/Math.max(beat1,beat2)/bpm;**/
  if (play) {
    setTimeout(function() {
      playBeat();
    }, nextAt - new Date().getTime());
  }
  return;
}

function drawCircle(a, beat, beats, rad) {
  "use strict";
  ctx.beginPath();
  ctx.arc(1300 / beats * a + 100, 100 * beat + 50, rad, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "black";
  var beatString = String(a % ((beat === 0) ? beat1 : beat2) + 1);
  if (beatString.length === 2) {
    ctx.font = "20px Arial";
    ctx.fillText(String(a % ((beat === 0) ? beat1 : beat2) + 1), 1300 / beats * a + 89, 100 * beat + 55);
    ctx.font = "20px Arial";
  } else {
    ctx.fillText(String(a % ((beat === 0) ? beat1 : beat2) + 1), 1300 / beats * a + 94, 100 * beat + 55);
  }
}

function drawFillCircle(a, beat, beats, rad, color) {
  "use strict";
  ctx.beginPath();
  ctx.arc(1300 / beats * a + 100, 100 * beat + 50, rad, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
}

function initializeAudio() {
  "use strict";
  var sound = document.createElement('audio');
  sound.setAttribute('src', "sounds/click1.mp3");
  sound.setAttribute('id', 'click1');
  document.body.appendChild(sound);

  sound = document.createElement('audio');
  sound.setAttribute('src', "sounds/click2.mp3");
  sound.setAttribute('id', 'click2');
  document.body.appendChild(sound);

  sound = document.createElement('audio');
  sound.setAttribute('src', "sounds/accent1.mp3");
  sound.setAttribute('id', 'accent1');
  document.body.appendChild(sound);
}

var queuedCircles = [];
var oneFrameCircles = [];

function queueFillCircle(a, beat, beats, rad, color) {
  "use strict";
  queuedCircles.push([a, beat, beats, rad, color]);
  return;
}

function clearCanvas() {
  "use strict";
  ctx.clearRect(0, 0, c.width, c.height);
}

function drawBeats() {
  "use strict";
  clearCanvas();

  updateShowFlyline();
  updateAccents();

  for (var i = 0; i <= beat1; i++) {
    drawCircle(i, 0, beat1, 20);
  }

  for (i = 0; i <= beat2; i++) {
    drawCircle(i, 1, beat2, 20);
  }
}

function updateRhythm() {
  "use strict";
  var r1 = document.getElementById("meter1").value;
  var r2 = document.getElementById("meter2").value;

  if (r1 % 1 === 0 && r2 % 1 === 0 && 1 <= r1 && r1 <= 50 && 1 <= r2 && r2 <= 50) {
    beat1 = r1;
    beat2 = r2;

    play = false;
    document.getElementById("toggle").innerHTML = "Play";

    drawBeats();

		metronome.stopAll();
		for (let i = 0; i < metronome.players.length; i++) {
			delete metronome.players[i];
		}
  }
  resetVars();
}

function flyLine(s, back) {
  "use strict";
  drawBeats();
  var x = 100 + 1300 / (60 * Math.min(beat1, beat2) / bpm) * s;
  if (x > 1400) {
    if (backAndForth) {
      flyLine(s, true);
    }
    return;
  }
  if (showFlyline) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 200);
    ctx.stroke();
  }
  var circle;
  for (var i = 0; i < queuedCircles.length; i++) {
    circle = queuedCircles[i];
    drawFillCircle(circle[0], circle[1], circle[2], circle[3], circle[4]);
  }
  for (i = 0; i < oneFrameCircles.length; i++) {
    circle = oneFrameCircles[i];
    drawFillCircle(circle[0], circle[1], circle[2], circle[3], circle[4]);
  }
  oneFrameCircles = [];
  oneFrameCircles = queuedCircles;
  queuedCircles = [];
  if (play) {
    if (back) {
      setTimeout(function() {
        flyLine(s - 1 / 60.0);
      }, 1000.0 / 60.0);
    } else {
      setTimeout(function() {
        flyLine(s + 1 / 60.0);
      }, 1000.0 / 60.0);
    }
  }
}

function updateBPM() {
  "use strict";
  var givenBPM = document.getElementById("bpminput").value;
  if (1 < givenBPM && givenBPM < 500) {
    bpm = givenBPM;
  }
  resetVars();
}

function updateVolume() {
  "use strict";
  volume = document.getElementById("volume").value / 100.0;
}

function updateShowFlyline() {
  "use strict";
  showFlyline = Boolean(document.getElementById("showFlyline").checked);
}

function updateAccents() {
  "use strict";
  playAccents = true;
}

updateRhythm();
updateBPM();
initializeAudio();
