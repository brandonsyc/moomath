var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

var user = document.getElementById("user");
var xes = document.getElementById("xes");
var render = document.getElementById("render");

user.children[0].onclick = function() {
	"use strict";
	addEquation();
};

MathJax.Hub.Config({
	messageStyle: "none"
});

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
	input.oninput = function() {
		parse(input);
	};
	
	var button1 = document.createElement("BUTTON");
	button1.innerHTML = "&#9881;";
	var button2 = document.createElement("BUTTON");
	button2.innerHTML = "&#128473;";
	var li2 = document.createElement("LI");
	li2.appendChild(button1);
	li2.appendChild(button2);
	xes.appendChild(li2);
	button2.onclick = function() {
		removeEquation(li2);
	};
}

function removeEquation(x) {
	"use strict";
	var array = Array.prototype.slice.call(xes.children);
	var index = array.indexOf(x);
	user.removeChild(user.children[index]);
	xes.removeChild(xes.children[index]);
}

function parse(x) {
	"use strict";
	render.style.color = "rgba(0, 0, 0, 0)";
	render.innerHTML = "$$" + x.value + "$$";
	MathJax.Hub.Queue(["Typeset", MathJax.Hub, render], function() {
		render.style.color = "#333";
	});
}