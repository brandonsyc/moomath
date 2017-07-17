// JavaScript Document
var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
var bodies = [];
var mouse;
var press;
var colors = ["#096", "#08b", "#c03", "#fd0"];
var trails = [];
var last = new Date();
var count = 0;
var down;

function bulb() {
	"use strict";
	count++;
	if (count === 10) {
		count = 0;
	}
	var fps = 1000 / (new Date() - last);
	last = new Date();
	document.getElementById("fps").innerHTML = Math.round(fps);
	ctx.fillStyle = "#333";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var remove = [];
	for (var i = 0; i < bodies.length; i++) {
		if (!remove.includes(i)) {
			var body = bodies[i];
			ctx.fillStyle = body[6];
			ctx.beginPath();
			ctx.arc(body[0], body[1], body[7], 0, 2 * Math.PI);
			ctx.fill();
			body[0] += body[2];
			body[1] += body[3];
			for (var j = 0; j < bodies.length; j++) {
				if (i !== j && !remove.includes(j)) {
					var other = bodies[j];
					var distance = Math.hypot(other[0] - body[0], other[1] - body[1]);
					var magnitude = 0.0008887 * other[4] / (distance * distance);
					var ax = magnitude * (other[0] - body[0]) / distance;
					var ay = magnitude * (other[1] - body[1]) / distance;
					body[2] += ax;
					body[3] += ay;
					if (body[7] + other[7] > distance) {
						bodies[i] = [getBarycenter([body, other])[0],
									 getBarycenter([body, other])[1],
								 	 (body[2] * body[4] + other[2] * other[4]) / (body[4] + other[4]),
								 	 (body[3] * body[4] + other[3] * other[4]) / (body[4] + other[4]),
								 	 body[4] + other[4],
								 	 Math.min(body[5], other[5]),
								 	 body[6],
								 	 Math.max(0.00426349651 * Math.pow(Math.abs(body[4] + other[4]), 1 / 3) * Math.pow(Math.abs(Math.min(body[5], other[5])), -2 / 3), 2)];
						trails[i] = [];
						remove.push(j);
							console.log(bodies);
								console.log(trails);
					}
				}
			}
			if (count === 0) {
				trails[i].push([body[0], body[1]]);
				if (trails[i].length > 16) {
					trails[i].shift();
				}
			}
			for (j = 0; j < trails[i].length; j++) {
				ctx.fillStyle = body[6];
				ctx.beginPath();
				ctx.arc(trails[i][j][0], trails[i][j][1], 1, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	}
	for (var i = remove.length - 1; i > -1; i--) {
		bodies.splice(remove[i], 1);
			trails.splice(remove[i], 1);
	}
	if (document.getElementById("body").checked) {
		if (!down) {
			if (mouse !== undefined) {
				ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
				ctx.beginPath();
				ctx.fillRect(mouse.x - 1, mouse.y - 10, 3, 21);
				ctx.fill();
				ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
				ctx.beginPath();
				ctx.fillRect(mouse.x - 10, mouse.y - 1, 21, 3);
				ctx.fill();
			}
		}
		else if (press !== undefined) {
			ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
			ctx.beginPath();
			ctx.fillRect(press.x - 1, press.y - 10, 3, 21);
			ctx.fill();
			ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
			ctx.beginPath();
			ctx.fillRect(press.x - 10, press.y - 1, 21, 3);
			ctx.fill();
		}
	}
}

setInterval(function() {
	"use strict";
	bulb();
}, 1000 / 60);

function getBarycenter(bodies) {
	"use strict";
	var numx = 0;
	var numy = 0;
	var den = 0;
	for (var i = 0; i < bodies.length; i++) {
		numx += bodies[i][4] * bodies[i][0];
		numy += bodies[i][4] * bodies[i][1];
		den += bodies[i][4];
	}
	return [numx / den, numy / den];
}

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
		bodies.push([press.x,
					 press.y,
					 (mouse.x - press.x) / 40,
					 (mouse.y - press.y) / 40,
					 parseInt(document.getElementById("mass").value),
					 document.getElementById("density").value,
					 color,
					 Math.max(0.00426349651 * Math.pow(Math.abs(document.getElementById("mass").value), 1 / 3) * Math.pow(Math.abs(document.getElementById("density").value), -2 / 3), 2)]);
		trails.push([]);
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
	trails = [];
}

canvas.addEventListener('mousemove', function(evt) {
	"use strict";
	mouse = getMousePos(canvas, evt);
}, false);

canvas.addEventListener('mouseout', function(evt) {
	"use strict";
	mouse = undefined;
	press = undefined;
}, false);

document.body.onmousedown = function() {
	"use strict";
	down = true;
};

document.body.onmouseup = function() {
	"use strict";
	down = false;
};
