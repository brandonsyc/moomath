var beatNum = 0;
var play = false;

var beat1 = 5;
var beat2 = 3;

var bpm = 120;

function playSoundAsync(url){
    new Audio(url).play();
}

function togglePlayback() {
    play = !play;
    if (play) {
        beatNum = 0;
        document.getElementById("toggle").innerHTML = "Stop";
        playBeat();
    } else {
        document.getElementById("toggle").innerHTML = "Play";
    }
}

function playBeat() {
    if (beat1 == -1 || beat2 == -1) {
        play = false;
        document.getElementById("toggle").innerHTML = "Play";
        return;
    }
    if (beatNum % (beat1 * beat2) == 0) {
        playSoundAsync("sounds/accent1.mp3");
    } else {
        if (beatNum % beat1 == 0) {
            playSoundAsync("sounds/click1.mp3");
        } else if (beatNum % beat2 == 0) {
            playSoundAsync("sounds/click2.mp3");
        }
    }
    beatNum += 1;
    if (play) {
        setTimeout(function(){
                   playBeat();}, 60000.0/Math.max(beat1,beat2)/bpm);
    }
}

function updateRhythm() {
    var r1 = document.getElementById("meter1").value;
    var r2 = document.getElementById("meter2").value;
    
    if (r1 % 1 == 0 && r2 % 1 == 0 && 1 <= r1 && r1 <= 50 && 1 <= r2 && r2 <= 50) {
        beat1 = r1;
        beat2 = r2;
        
        play = false;
        document.getElementById("toggle").innerHTML = "Play";
        return;
    }
}

function updateBPM() {
    
    givenBPM = document.getElementById("bpminput").value;
    if (1 < givenBPM && givenBPM < 500) {
        bpm = givenBPM;
    }
}
