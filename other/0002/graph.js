var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

var user = document.getElementById("user");
var xes = document.getElementById("xes");

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
	"use strict";
	ctx.fillStyle = "#eee";
	
}

function addEquation() {
	"use strict";
	var input = document.createElement("INPUT");
	var li1 = document.createElement("LI");
	li1.classList.add("active");
	li1.appendChild(input);
	var children = user.children;
	user.insertBefore(li1, children[children.length - 1]);
	input.focus();
	
	var button = document.createElement("BUTTON");
	button.innerHTML = "&#128473;";
	var li2 = document.createElement("LI");
	li2.appendChild(button);
	xes.appendChild(li2);
}