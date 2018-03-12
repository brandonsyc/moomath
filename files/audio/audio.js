var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var oscillator = audioCtx.createOscillator();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

var data = "zsxdcvgbhnjmq2w3er5t6y7ui";

document.onkeypress = function(evt) {
    var x = data.indexOf(String.fromCharCode(evt.keyCode)) + 40;
	var hertz = Math.pow(Math.pow(2, 1 / 12), x - 49) * 440;
	oscillator.frequency.setValueAtTime(hertz, audioCtx.currentTime);
};

oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
oscillator.connect(biquadFilter);
biquadFilter.connect(audioCtx.destination);
oscillator.start();

biquadFilter.type = "lowpass";

function freq() { "use strict"; var x = document.getElementById("freq").value;
	if (x >= 13 && x <= 76) {
		var hertz = Math.pow(Math.pow(2, 1 / 12), x - 49) * 440;
		oscillator.frequency.setValueAtTime(hertz, audioCtx.currentTime);}}

function det() { "use strict"; var x = document.getElementById("det").value;
	if (x >= -100 && x <= 100) {
		oscillator.detune.setValueAtTime(x, audioCtx.currentTime);}}

function otype() { "use strict"; var x = document.getElementById("type");
	oscillator.type = x.options[x.selectedIndex].value;}

function bffreq() { "use strict"; var x = document.getElementById("bffreq").value;
	if (x >= 0 && x <= 1000) {
		biquadFilter.frequency.setValueAtTime(x, audioCtx.currentTime);}
}

function bfdet() { "use strict"; var x = document.getElementById("bfdet").value;
	if (x >= -100 && x <= 100) {
		biquadFilter.detune.setValueAtTime(x, audioCtx.currentTime);}
}

function bfq() { "use strict"; var x = document.getElementById("bfq").value;
	if (x >= -4 && x <= 3) {
		var hertz = Math.pow(10, x);
		biquadFilter.Q.setValueAtTime(hertz, audioCtx.currentTime);}}

function bfgain() { "use strict"; var x = document.getElementById("bfgain").value;
	if (x >= -40 && x <= 40) {
		biquadFilter.gain.setValueAtTime(x, audioCtx.currentTime);}}

function bftype() { "use strict"; var x = document.getElementById("bftype");
	biquadFilter.type = x.options[x.selectedIndex].value;}