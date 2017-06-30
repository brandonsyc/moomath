// JavaScript Document
var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
var bodies = [[300.0, 200.0, 0, 0.0, 1000], [200.0, 250.0, 0.5, 2.0, 1]];

function bulb() {
	"use strict";
   	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		ctx.beginPath();
		ctx.arc(body[0], body[1], 10, 0, 2 * Math.PI);
		ctx.stroke();
		body[0] += body[2];
		body[1] += body[3];
		for (var j = 0; j < bodies.length; j++) {
			if (i !== j) {
				var other = bodies[j];
				var distance = Math.hypot(other[0] - body[0], other[1] - body[1]);
				var magnitude = other[4] / (distance * distance);
				var ax = magnitude * (other[0] - body[0]) / distance;
				var ay = magnitude * (other[1] - body[1]) / distance;
				body[2] += ax;
				body[3] += ay;
			}
		}
	}
	setTimeout(function() {
		bulb(); 
	}, 1000.0/60.0);
}
bulb();