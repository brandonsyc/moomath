// JavaScript Document
var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
var x = 0;

function bulb() {
	"use strict";
	++x;
   	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.arc(100, x, 100, 0, 2 * Math.PI);
	ctx.stroke();
	setTimeout(function() {
		bulb(); 
	}, 1000.0/60.0);
}
bulb();