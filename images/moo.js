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
	if (cows === 128) {
	window.location.replace("https://nichodon.github.io/");
	} else if (cows >= 64) {
		span.innerHTML = "EXPLOSIVE Moo!";
	} else if (cows >= 32) {
		span.innerHTML = "Hugest Moo!";
	} else if (cows >= 16) {
		span.innerHTML = "Biggest Moo!";
	} else if (cows >= 8) {
		span.innerHTML = "Huger Moo!";
	} else if (cows >= 4) {
		span.innerHTML = "Bigger Moo!";
	} else if (cows >= 2) {
		span.innerHTML = "Huge Moo!";
	} else {
		span.innerHTML = "Big Moo!";
	}
}
