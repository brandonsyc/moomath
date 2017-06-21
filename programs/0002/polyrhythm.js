var beatNum = 0;
var play = false;

var beat1 = 5;
var beat2 = 3;

var bpm = 120;

var c=document.getElementById("beater");
var ctx=c.getContext("2d");

var backAndForth = false;

var start;
var nextAt;
var beatsLater;

var doSubdivisions = true;

function playSoundAsync(url) {
	"use strict";
    //document.getElementById(url).play();
    new Audio("sounds/" + url + ".mp3").play();
}

function resetVars() {
    start = null;
    nextAt = null;
    
    oneFrameCircles = [];
    queuedCircles = [];
    
    beatsLater = 1;
}

function togglePlayback() {
	"use strict";
    play = !play;
    if (play) {
        beatsLater = 1;
        beatNum = 0;
        document.getElementById("toggle").innerHTML = "Stop";
        start = new Date().getTime();
        nextAt = start;
        playBeat();
    }
	else {
        document.getElementById("toggle").innerHTML = "Play";
        drawBeats();
    }
}

function playBeat() {
	"use strict";
    var drift = null;
    
    /**console.log(start);
    console.log(nextAt);
    console.log(beatsLater);**/
    
    if (doSubdivisions) {
        drift = (new Date().getTime() - start) % (Math.min(60000.0/Math.max(beat1,beat2)/bpm));
    } else {
        drift = (new Date().getTime() - start) % (beatsLater*60000.0/Math.max(beat1,beat2)/bpm);
    }
    
    //console.log(drift + " ms");
    if (beat1 === -1 || beat2 === -1) {
        play = false;
        document.getElementById("toggle").innerHTML = "Play";
        return;
    }
    if (beatNum % (beat1 * beat2) === 0) {
        playSoundAsync("accent1");
        flyLine(0,false);
        queueFillCircle(0, 0, beat1, 10, "red");
        queueFillCircle(0, 1, beat2, 10, "red");
    }
	else {
        if (beatNum % beat1 === 0) {
            playSoundAsync("click1");
            queueFillCircle((beatNum/beat2) % beat1, 1, beat1, 10, "green");
        }
        if (beatNum % beat2 === 0) {
            playSoundAsync("click2");
            queueFillCircle((beatNum/beat1) % beat2, 0, beat2, 10, "green");
        }
    }
    for (i = beatNum+1; i <= beat1*beat2 + beatNum - (beatNum % (beat1*beat2)); i++) {
        if (i % beat1 == 0 || i % beat2 == 0) {
            beatsLater = i - beatNum;
            break;
        }
    }
    if (doSubdivisions) {
        beatNum += 1;
        nextAt += 60000.0/Math.max(beat1,beat2)/bpm;
    } else {
        beatNum += beatsLater;
        nextAt += beatsLater * 60000.0/Math.max(beat1,beat2)/bpm;
    }
    
    /**beatNum += 1;
    nextAt += 60000.0/Math.max(beat1,beat2)/bpm;**/
    if (play) {
        setTimeout(function(){
                   playBeat();}, nextAt - new Date().getTime());
    }
    return;
}

function drawCircle(a, beat, beats, rad) {
    ctx.beginPath();
    ctx.arc(1300/beats*a + 100,100*beat+50,rad,0,2*Math.PI);
    ctx.stroke();
}

function drawFillCircle(a, beat, beats, rad, color) {
    ctx.beginPath();
    ctx.arc(1300/beats*a + 100,100*beat+50,rad,0,2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function initializeAudio() {
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
    queuedCircles.push([a, beat, beats, rad, color]);
    return;
}

function clearCanvas() {
    ctx.clearRect(0, 0, c.width, c.height);
}

function drawBeats() {
    clearCanvas();
    
    for (i = 0; i <= beat1; i++) {
        drawCircle(i, 0, beat1, 10);
    }
    
    for (i = 0; i <= beat2; i++) {
        drawCircle(i, 1, beat2, 10);
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
        
        return;
    }
    resetVars();
}

function flyLine(s,back) {
    drawBeats();
    var x = 100+1300/(60*Math.min(beat1,beat2)/bpm)*s;
    if (x > 1400) {
        if (backAndForth) {
            flyLine(s,true);
        }
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,200);
    ctx.stroke();
    for (i = 0; i < queuedCircles.length; i++) {
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
            setTimeout(function(){
                   flyLine(s-1/60.0);}, 1000.0/60.0);
        } else {
            setTimeout(function(){
                       flyLine(s+1/60.0);}, 1000.0/60.0);
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

updateRhythm();
updateBPM();
initializeAudio();







