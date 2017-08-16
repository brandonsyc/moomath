var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

function run() {
	"use strict";
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

setInterval(function() {
	"use strict";
	run();
}, 1000 / 60);

function drawGrid() {
	
}