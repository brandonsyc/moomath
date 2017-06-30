// JavaScript Document
var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
var bodies = [];
var mouse;
var press;
var colors = ["#096", "#08b", "#c03", "#fd0"];
var last = new Date();

function bulb() {
	"use strict";
	var fps = 1000 / (new Date - last);
	last = new Date();
	document.getElementById("fps").innerHTML = Math.round(fps);
	ctx.fillStyle = "#333";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		ctx.fillStyle = body[5];
		ctx.beginPath();
		ctx.arc(body[0], body[1], 10, 0, 2 * Math.PI);
		ctx.fill();
		body[0] += body[2];
		body[1] += body[3];
		for (var j = 0; j < bodies.length; j++) {
			if (i !== j) {
				var other = bodies[j];
				var distance = Math.hypot(other[0] - body[0], other[1] - body[1]);
				var magnitude = 0.0008887 * other[4] / (distance * distance);
				var ax = magnitude * (other[0] - body[0]) / distance;
				var ay = magnitude * (other[1] - body[1]) / distance;
				body[2] += ax;
				body[3] += ay;
			}
		}
	}
	if (document.getElementById("body").checked) {
		if (mouse !== undefined) {
			ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
			ctx.beginPath();
			ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
	setTimeout(function() {
		bulb(); 
	}, 1000.0/60.0);
}

bulb();

function pressed() {
	"use strict";
	if (document.getElementById("body").checked) {
		press = mouse;
	}
}

function clicked() {
	"use strict";
	if (document.getElementById("body").checked) {
		var color;
		for (var i = 0; i < colors.length; i++) {
			if (document.getElementsByName("color")[i + 1].checked) {
				color = colors[i];
			}
		}
		bodies.push([press.x, press.y, (mouse.x - press.x) / 40, (mouse.y - press.y) / 40, document.getElementById("mass").value, color]);
	}
}

function getMousePos(canvas, evt) {
	"use strict";
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function goodbye() {
	"use strict";
	bodies = [];
}

canvas.addEventListener('mousemove', function(evt) {
	"use strict";
	mouse = getMousePos(canvas, evt);
}, false);

canvas.addEventListener('mouseout', function(evt) {
	"use strict";
	mouse = undefined;
}, false);