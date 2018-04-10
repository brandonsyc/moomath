var plot = document.getElementById("plotter");
var cx = plot.clientWidth / 2;
var cy = plot.clientHeight / 2;

function x(x) {
	"use strict";
	return cx + x;
}

function y(y) {
	"use strict";
	return cy - y;
}

function circle(x, y, r, color, opacity) {
	"use strict";
	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute("cx", x);
	circle.setAttribute("cy", y);
	circle.setAttribute("r", r);
	circle.setAttribute("stroke", color);
	circle.setAttribute("stroke-opacity", opacity);
	circle.setAttribute("fill", "rgba(0, 0, 0, 0)");
	plot.appendChild(circle);
	return circle;
}

function line(x1, y1, x2, y2, color, opacity) {
	"use strict";
	var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
	line.setAttribute("x1", x1);
	line.setAttribute("y1", y1);
	line.setAttribute("x2", x2);
	line.setAttribute("y2", y2);
	line.setAttribute("stroke", color);
	line.setAttribute("stroke-opacity", opacity);
	plot.appendChild(line);
	return line;
}

var xInt = 10;
var yInt = 10;
var gColor = [0.2, 0.1];
for (var i = 1; i < 51; i++) {
	circle(x(0), y(0), yInt * i, "#000", i % 5 === 0 ? gColor[0] : gColor[1]);
}
for (var i = -50; i < 51; i++) {
	line(x(i * xInt), 0, x(i * xInt), plot.clientHeight, "#000", i % 5 === 0 ? gColor[0] : gColor[1]);
}
line(0, y(0), plot.clientWidth, y(0), "#000", 0.2);

var directrix = line(x(0), 0, x(0), plot.clientHeight, "#000", 0.5);
var points = [];
var xAxis;
var yAxis = line(x(0), 0, x(0), plot.clientHeight, "#fd0", 0.9);

function point(v) {
	"use strict";
	for (var i = 0; i < points.length; i++) {
		plot.removeChild(points[i]);
	}
	points = [];
	for (i = 0; i < 75; i++) {
		points.push(circle(
			x((v / 2 - Math.sign(v) * i) * xInt),
			y(Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
			2, "#096", 0.9));
		if (i < 10) {
			points.push(line(
				x((v / 2 - Math.sign(v) * i) * xInt),
				y(Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
				x(0), y(0), "#08b", 0.2));
			points.push(line(
				x((v / 2 - Math.sign(v) * i) * xInt),
				y(Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
				x(v * xInt),
				y(Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
				"#08b", 0.2));
			points.push(line(
				x((v / 2 - Math.sign(v) * i) * xInt),
				y(-Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
				x(0), y(0), "#08b", 0.2));
			points.push(line(
				x((v / 2 - Math.sign(v) * i) * xInt),
				y(-Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
				x(v * xInt),
				y(-Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt),
				"#08b", 0.2));
		}
		points.push(circle(
			x((v / 2 - Math.sign(v) * i) * xInt),
			y(-(Math.sqrt(Math.sign(v) * (Math.pow(v / 2 + i, 2) - Math.pow(v / 2 - i, 2))) * yInt)),
			2, "#096", 0.9));
	}
	points.push(line(x(0), y(v * yInt), x(0), y(-v * yInt), "#08b", 0.9));
}

function updir(v) {
	"use strict";
	v = Number(v.split("x=")[1]);
	directrix.setAttribute("x1", x(v * xInt));
	directrix.setAttribute("x2", x(v * xInt));
	point(v);
}