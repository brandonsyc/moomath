var cows = 0;

function cow() {
	"use strict";
	cows++;
	var div = document.createElement("DIV");
	div.style.backgroundImage = "url(https://nichodon.github.io/images/back.png)";
	if (Math.random() < 0.5)
	{
	div.style.backgroundImage = "url(https://nichodon.github.io/images/front.png)";
	}
	div.style.width = "100px";
	div.style.height = "200px";
	div.style.backgroundSize = "contain";
	div.style.backgroundRepeat = "no-repeat";
	div.style.position = "fixed";
	div.style.top = Math.random() * 100 + "%";
	div.style.left = Math.random() * 100 + "%";
	div.style.transform = "translate(-50%, -50%) rotate(" + Math.random() * 360 + "deg)";
	div.style.zIndex = "1";
	document.body.appendChild(div);
	var span = document.getElementsByTagName("span")[0];
	span.style.transition = "0.5s";
	span.style.color = "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",1)";
	if (cows === 1024) {
	window.location.replace("http://moomath.com/");
	} else if (cows >= 512) {
		span.innerHTML = "EXPLOSIVE MOO!";
	} else if (cows >= 256) {
		span.innerHTML = "Hugest MOO!";
	} else if (cows >= 128) {
		span.innerHTML = "Biggest MOO!";
	} else if (cows >= 64) {
		span.innerHTML = "Huger Moo!";
	} else if (cows >= 32) {
		span.innerHTML = "Bigger Moo!";
	} else if (cows >= 16) {
		span.innerHTML = "Mega Moo!";
	} else if (cows >= 8) {
		span.innerHTML = "Super Moo!";
	} else if (cows >= 4) {
		span.innerHTML = "Huge Moo!";
	} else if (cows >= 2) {
		span.innerHTML = "Big Moo!";
	} else {
		span.innerHTML = "Moo!";
	}
}
