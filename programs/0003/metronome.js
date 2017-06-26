/** This javascript file controls all logic and timing systems behind the
entirely JavaScript-powered metronome at nichodon.github.io/programs/0003. **/

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
var timeRes = 30;

// File locations for sounds
var accent1 = "sounds/accent1.wav";
var click1 = "sounds/click1.wav";
var click2 = "sounds/click2.wav";
var click3 = "sounds/click3.wav";

// Beat number (goes from 0 to numerator - 1)
var measureNumber = 0;

// Accented beats (boolean array)
var accents = [true, false, false, false];

// Volume
var volume = 0.8;

// Playing boolean
var play = false;

// Canvas variables
var canvas = document.getElementById("beater");
var ctx = canvas.getContext("2d");

// Circle sizes
var accentCircleRadius = 20;
var normalCircleRadius = 10;
var eighthCircleRadius = 5;
var sixteenthCircleRadius = 2;
var tripletCircleRadius = 4;

// Counts how many flylines have passed
var flylineNumber = 0;

// Audios
var audios = [];

// Stop/start button click number
var stopStartCount = 0;

// Beat length in quarter notes
var beatLength = 0.25;

// Display of subdivisions
var eighthNoteSub = false;
var sixteenthNoteSub = false;
var tripletNoteSub = false;

// Boolean controlling whether the program should play non accented Beats
var playNonAccentedBeats = true;

function resetVars() {
    // Reset user-uncontrolled variables
    measureNumber = 0;
    return;
}

window.onload = init;
var context;
var bufferLoader;
var gainNode;

function BufferLoader(context, urlList, callback) {
    // BufferLoader function that runs XMLHttpRequests to get audio files from server
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(request.response,
                                       function(buffer) {
                                            if (!buffer) {
                                                alert('error decoding file data: ' + url);
                                                return;
                                            }
                                            loader.bufferList[index] = buffer;
                                            if (++loader.loadCount === loader.urlList.length)
                                                loader.onload(loader.bufferList);
                                        },
                                       function(error) {
                                            console.error('decodeAudioData error', error);
                                            }
                                       );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

function init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    gainNode = context.createGain();
    gainNode.connect(context.destination);

    bufferLoader = new BufferLoader(context,
                                    [
                                     'https://nichodon.github.io/programs/0003/sounds/click1.wav',
                                     'https://nichodon.github.io/programs/0003/sounds/click2.wav',
                                     'https://nichodon.github.io/programs/0003/sounds/click3.wav',
                                     'https://nichodon.github.io/programs/0003/sounds/accent1.wav'
                                     ],
                                    finishedLoading
                                    );

    bufferLoader.load();
}

var click1 = null;
var click2 = null;
var click3 = null;
var accent1 = null;

var buffers = null;

var start = null;

function finishedLoading(bufferList) {
    // Create two sources and play them both together.
    click1 = context.createBufferSource();
    click2 = context.createBufferSource();
    click3 = context.createBufferSource();
    accent1 = context.createBufferSource();
    click1.buffer = bufferList[0];
    click2.buffer = bufferList[1];
    click3.buffer = bufferList[2];
    accent1.buffer = bufferList[3];

    click1.connect(context.destination);
    click2.connect(context.destination);
    click3.connect(context.destination);
    accent1.connect(context.destination);

    buffers = bufferList;
}

function playSound(buffer, time) {
    if (!play) {
        return;
    }
    var source = context.createBufferSource();
    source.buffer = buffers[buffer];
    source.start(time);
    source.connect(gainNode);
    gainNode.connect(context.destination);
    audios.push(source);
}

function playSoundAsync(url) {
    var date = context.currentTime * 1000;
    // console.log(date - prevBeatTime);
    prevBeatTime = date;

    // Plays a sound asynchronously, given its location
    var click = new Audio(url);
    click.volume = volume;
    click.play();
    return;
}

function togglePlayback() {
    // Toggles playback (from button press)
    var playButton = document.getElementById("togglePlayback");
    stopStartCount += 1;
    play = !play;
    if (play) {
        playButton.innerHTML = "Stop";
        playBeat(-1,stopStartCount);
    } else {
        playButton.innerHTML = "Play";
        stopAll();
        resetVars();
    }
    return;
}

function isNormalInteger(str) {
    // Tests if str is a positive integer
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

// Basic String manipulation functions

String.prototype.trimLeft = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return this.replace(new RegExp("^[" + charlist + "]+"), "");
};

String.prototype.trimRight = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.trim = function(charlist) {
    return this.trimLeft(charlist).trimRight(charlist);
};

function updateSignature() {
    // Updates the time signature
    var givenNumerator = document.getElementById("numerator").value;
    var givenDenominator = document.getElementById("denominator").value;


    /*1 <= givenNumerator && givenNumerator <= 50*/
    // If the numerator is a '+' separated list of whole numbers, it is considered okay

    var beatSeparations = givenNumerator.replace(" ","").trim('+').split('+');
    if (beatSeparations.length === 0) return;

    var accentPosition = 0;
    var length = 0;
    var valid = true;

    for (i = 0; i < beatSeparations.length; i++) {
        accents[accentPosition] = true;
        var prevPosition = accentPosition;
        var separation = beatSeparations[i];
        if (isNormalInteger(separation)) {
            accentPosition += parseInt(separation);
            length += parseInt(separation);
        } else {
            valid = false;
        }
        for (j = prevPosition + 1; j < accentPosition; j++) {
            accents[j] = false;
        }
    }

    if (valid) {
        document.getElementById("numerator").style.backgroundColor = "white";
        numerator = length;
    } else {
        document.getElementById("numerator").style.backgroundColor = "#FF9184";
    }

    if (isNormalInteger(givenDenominator)) {
        givenDenominator = parseInt(givenDenominator);
    } else {
        document.getElementById("denominator").style.backgroundColor = "#FF9184";
        return;
    }

    if (1 <= givenDenominator && givenDenominator <= 64 && Math.log2(givenDenominator) % 1 === 0) {
        // If the numerator is a power of two in the range 1 <= n <= 64, it is considered valid
        denominator = givenDenominator;
        document.getElementById("denominator").style.backgroundColor = "white";
    } else {
        document.getElementById("denominator").style.backgroundColor = "#FF9184";
    }

    if (play) togglePlayback();

    updateBPM();
    clearCanvas();
    drawBeats();

    return;
}

function updateVolume() {
    // Updates the volume
    volume = document.getElementById("volume").value/100.0;
    gainNode.gain.value = volume;
    return;
}

function updateBPM() {
    // Updates the BPM
    var givenBPM = document.getElementById("bpm").value;

    if (5.0 <= givenBPM && givenBPM <= 800.0) {
        bpm = givenBPM;
        bpm *= beatLength * denominator;
    } else return;

    bps = bpm/60.0;
    bpms = bps/1000.0;
    mpb = 1.0/bpm;
    spb = 1.0/bps;
    mspb = 1.0/bpms

    if (play) togglePlayback();
    return;
}

function accurateTimeout(func, delay) {
    // Provides an significantly more accurate timeout function, based on wall clock time rather than CPU time
    if (!play) return;

    if (delay < timeRes) {
        setTimeout(func(),0);
        return;
    }
    var timeoutStart = context.currentTime * 1000;

    timeoutSelfCall(func, timeoutStart + delay);
    return;
}

function timeoutSelfCall(func, desiredTime) {
    // Companion to the accurateTimeout function
    if (!play) return;

    var cTime = context.currentTime * 1000;

    if (desiredTime - cTime < timeRes) {
        if (play) {
            setTimeout(func(),0);
        }
        return;
    }

    setTimeout(function(){timeoutSelfCall(func,desiredTime);}, Math.max((desiredTime-cTime)/2.0,0));
    return;
}

function stopAll() {
    // Stop all audios in progress
    for (i = 0; i < audios.length; i++) {
        audios[i].stop();
    }
}

function playBeat(playTime = -1, ssc) {
    // SSC identifying is used to cancel playBeat() calls that are from previous stopped measures
    if (ssc != stopStartCount) {
        return;
    }
    // "Recursive" function which plays the beat

    if (!play) return;
    if (playTime === -1) playTime = context.currentTime * 1000;

    audios = [];

    flyLine();

    for (i = 0; i < numerator; i++) {
        if (accents[i]) {
            playSound(3, playTime / 1000.0 + i * spb);
        } else if (playNonAccentedBeats){
            playSound(0, playTime / 1000.0 + i * spb);
        }
        if (playNonAccentedBeats) {
            if (eighthNoteSub) {
                playSound(1, playTime / 1000.0 + (i + 0.5) * spb);
            } else if (sixteenthNoteSub) {
                playSound(2, playTime / 1000.0 + (i + 0.25) * spb);
                playSound(2, playTime / 1000.0 + (i + 0.5) * spb);
                playSound(2, playTime / 1000.0 + (i + 0.75) * spb);
            } else if (tripletNoteSub) {
                playSound(1, playTime / 1000.0 + (i + 1.0/3.0) * spb);
                playSound(1, playTime / 1000.0 + (i + 2.0/3.0) * spb);
            }
        }
    }

    var cTime = context.currentTime * 1000;

    // Determine how far CPU clock has fallen out of sync, then adjust next delay accordingly
    var sscDuplicate = stopStartCount;

    accurateTimeout(function() {playBeat(playTime + mspb * numerator, sscDuplicate);}, mspb * numerator + playTime - cTime - 20);

    measureNumber += 1;

    return;
}

function flyLine(frameTime = -1, frame = 0) {
    // "Recursive" function which controls the line that goes across the canvas and the animations
    clearCanvas();

    if (!play) {
        drawBeats();
        return;
    }

    var lineX = 100 + frame * 1300 / (60 * spb * numerator);

    drawBeats(lineX);

    if (lineX >= 1400) {
        return;
    }

    ctx.beginPath();
    ctx.moveTo(lineX,0);
    ctx.lineTo(lineX,200);
    ctx.stroke();

    if (frameTime === -1) {
        frameTime = context.currentTime * 1000;
    }
    var cTime = context.currentTime * 1000;

    accurateTimeout(function() {flyLine(frameTime + 1000.0/60.0, frame + 1);}, frameTime - cTime + 1000.0/60.0);

    return;
}

function beatToCoords(beat) {
    // Moves a beat to a pair of coordinates on the canvas
    return [100 + beat * 1300 / (numerator), 100];
}

function drawCircle(coords,radius) {
    // Draws a circle with a certain radius at the coords
    ctx.beginPath();
    ctx.arc(coords[0], coords[1], radius, 0, 2*Math.PI);
    ctx.stroke();
    return;
}

function drawFilledCircle(coords,radius) {
    // Draws a circle with a certain radius at the coords
    ctx.beginPath();
    ctx.arc(coords[0], coords[1], radius, 0, 2*Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    return;
}

function clearCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBeats(lineX) {
    // Draw the beats to the canvas
    if (!eighthNoteSub && !sixteenthNoteSub && !tripletNoteSub) {
        for (i = 0; i <= numerator; i++) {
            var circleCoords = beatToCoords(i);
            if (i != numerator && Math.abs(circleCoords[0] - lineX + 5.0) < 20.0) {
                if (accents[i % numerator]) {
                    drawFilledCircle(beatToCoords(i), accentCircleRadius);
                } else if (playNonAccentedBeats) {
                    drawFilledCircle(beatToCoords(i), normalCircleRadius);
                }
            } else {
                if (accents[i % numerator]) {
                    drawCircle(beatToCoords(i), accentCircleRadius);
                } else if (playNonAccentedBeats) {
                    drawCircle(beatToCoords(i), normalCircleRadius);
                }
            }
        }
    }
    if (eighthNoteSub) {
        for (i = 0; i <= numerator; i += 0.5) {
            var circleCoords = beatToCoords(i);
            if (i != numerator && Math.abs(circleCoords[0] - lineX + 5.0) < 20.0) {
                if (i % 1 === 0) {
                    if (accents[i % numerator]) {
                        drawFilledCircle(beatToCoords(i), accentCircleRadius);
                    } else if (playNonAccentedBeats) {
                        drawFilledCircle(beatToCoords(i), normalCircleRadius);
                    }
                } else if (playNonAccentedBeats) {
                    drawFilledCircle(beatToCoords(i), eighthCircleRadius);
                }
            } else {
                if (i % 1 === 0) {
                    if (accents[i % numerator]) {
                        drawCircle(beatToCoords(i), accentCircleRadius);
                    } else if (playNonAccentedBeats) {
                        drawCircle(beatToCoords(i), normalCircleRadius);
                    }
                } else if (playNonAccentedBeats) {
                    drawCircle(beatToCoords(i), eighthCircleRadius);
                }
            }
        }
    }
    if (tripletNoteSub) {
        for (i = 0; i <= numerator; i += 1.0 / 3.0) {
            var circleCoords = beatToCoords(i);
            if (i != numerator && Math.abs(circleCoords[0] - lineX + 5.0) < 20.0) {
                if (0.5 - Math.abs(i % 1 - 0.5) < 0.01) {
                    if (accents[i % numerator]) {
                        drawFilledCircle(beatToCoords(i), accentCircleRadius);
                    } else if (playNonAccentedBeats) {
                        drawFilledCircle(beatToCoords(i), normalCircleRadius);
                    }
                } else {
                    drawFilledCircle(beatToCoords(i), tripletCircleRadius);
                }
            } else {
                if (0.5 - Math.abs(i % 1 - 0.5) < 0.01) {
                    if (accents[i % numerator]) {
                        drawCircle(beatToCoords(i), accentCircleRadius);
                    } else if (playNonAccentedBeats) {
                        drawCircle(beatToCoords(i), normalCircleRadius);
                    }
                } else if (playNonAccentedBeats) {
                    drawCircle(beatToCoords(i), tripletCircleRadius);
                }
            }
        }
    }
    if (sixteenthNoteSub) {
        for (i = 0; i <= numerator; i += 0.25) {
            var circleCoords = beatToCoords(i);
            if (i != numerator && Math.abs(circleCoords[0] - lineX + 5.0) < 20.0) {
                if (i % 1 === 0) {
                    if (accents[i % numerator]) {
                        drawFilledCircle(beatToCoords(i), accentCircleRadius);
                    } else if (playNonAccentedBeats) {
                        drawFilledCircle(beatToCoords(i), normalCircleRadius);
                    }
                } else if (playNonAccentedBeats) {
                    drawFilledCircle(beatToCoords(i), sixteenthCircleRadius);
                }
            } else {
                if (i % 1 === 0) {
                    if (accents[i % numerator]) {
                        drawCircle(beatToCoords(i), accentCircleRadius);
                    } else if (playNonAccentedBeats) {
                        drawCircle(beatToCoords(i), normalCircleRadius);
                    }
                } else if (playNonAccentedBeats) {
                    drawCircle(beatToCoords(i), sixteenthCircleRadius);
                }
            }
        }
    }
    return;
}

function updateBeatLength(length) {
    // Length is given in quarter notes
    beatLength = length/4.0;
    updateBPM();
}

function updateSubdivisions(subdivision) {
    // Update subdivision of beats
    if (subdivision === 0) {
        eighthNoteSub = false;
        tripletNoteSub = false;
        sixteenthNoteSub = false;
    } else if (subdivision === 1) {
        eighthNoteSub = true;
        tripletNoteSub = false;
        sixteenthNoteSub = false;
    } else if (subdivision === 2) {
        eighthNoteSub = false;
        tripletNoteSub = true;
        sixteenthNoteSub = false;
    } else if (subdivision === 3) {
        eighthNoteSub = false;
        tripletNoteSub = false;
        sixteenthNoteSub = true;
    }

    clearCanvas();
    drawBeats();
    return;
}

function updatePlayNA() {

    playNonAccentedBeats = document.getElementById("playNonAccentedBeats").checked;
    console.log('3');
    console.log(playNonAccentedBeats);
    return;
}

function initCanvas() {
    // Initialize the canvas
    drawBeats();
}

initCanvas();
