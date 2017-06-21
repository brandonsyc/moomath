
// Numerator and denominator of time signature
var numerator = 4;
var denominator = 4;

// Beats per minute
var bpm = 120;

// Beats per second
var bps = bpm/60.0;

// Beats per millisecond
var bpms = bps/1000.0;

// Minutes per beat
var mpb = 1.0/bpm;

// Seconds per beat
var spb = 1.0/bps;

// Milliseconds per beat
var mspb = 1.0/bpms

// Approximate time resolution (ms)
var timeRes = 10;

// File locations for sounds
var accent1 = "sounds/accent1.wav";
var click1 = "sounds/click1.wav";
var click2 = "sounds/click2.wav";
var click3 = "sounds/click3.wav";

// Beat number (goes from 0 to numerator - 1)
var beatNumber = 0;

// Accented beats (boolean array)
var accents = [true, false, false, false];

var prevBeatTime = 0;

function playSoundAsync(url) {
    var date = new Date().getTime();
    console.log(date - prevBeatTime);
    prevBeatTime = date;
    // Plays a sound asynchronously, given its location
    new Audio(url).play();
    return;
}

function updateSignature() {
    // Updates the time signature
    var givenNumerator = document.getElementById("numerator").value;
    var givenDenominator = document.getElementById("denominator").value;
    
    if (1 <= givenNumerator && givenNumerator <= 50) {
        // If the numerator is in the range 1 <= n <= 50, it is considered valid
        numerator = givenNumerator;
        document.getElementById("numerator").style.backgroundColor = "white";
    } else {
        // If the numerator is invalid, color the input box salmon as an alert
        document.getElementById("numerator").style.backgroundColor = "#FF9184";
    }
    
    if (1 <= givenDenominator && givenDenominator <= 64 && Math.log2(givenDenominator) % 1 === 0) {
        // If the numerator is a power of two in the range 1 <= n <= 64, it is considered valid
        denominator = givenDenominator;
        document.getElementById("denominator").style.backgroundColor = "white";
    } else {
        document.getElementById("denominator").style.backgroundColor = "#FF9184";
    }
    return;
}

function accurateTimeout(func, delay) {
    // Provides an significantly more accurate timeout function, based on wall clock time rather than CPU time.
    if (delay < timeRes) {
        setTimeout(func(),0);
        return;
    }
    var timeoutStart = new Date().getTime();
    
    // console.log(delay);
    // console.log(timeoutStart);
    timeoutSelfCall(func, timeoutStart + delay);
}

function timeoutSelfCall(func, desiredTime) {
    var cTime = new Date().getTime();
    
    // console.log(desiredTime);
    // console.log(cTime);
    
    if (desiredTime - cTime < timeRes) {
        setTimeout(func(),0);
        return;
    }
    
    // console.log(Math.max((desiredTime-cTime)/2.0,0));
    
    setTimeout(function(){timeoutSelfCall(func,desiredTime);}, Math.max((desiredTime-cTime)/2.0,0));
}

function playBeat(playTime = -1) {
    
    if (playTime === -1) {
        playTime = new Date().getTime();
    }
    
    var cTime = new Date().getTime();
    
    if (accents[beatNumber]) {
        playSoundAsync(accent1);
    } else {
        playSoundAsync(click1);
    }
    
    accurateTimeout(function() {playBeat(playTime + mspb);},mspb + playTime - cTime);
    
    beatNumber = (beatNumber + 1) % numerator;
    return;
}

playBeat();


