var cows = 0;

document.getElementsByTagName("p")[0].onclick = function() {
	"use strict";
	cow();
};

function cow() {
	"use strict";
	cows++;
	var div = document.createElement("div");
	div.style.backgroundImage = "url(https://nichodon.github.io/images/back.png)";
	if (Math.random() < 0.5) {
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
	var h1 = document.getElementsByTagName("h1")[0];
	h1.style.transition = "0.5s";
	h1.style.color = "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",1)";
	if (cows === 1024) {
		window.location.replace("https://moomath.com");
	} else if (cows >= 512) {
		h1.innerHTML = "EXPLOSIVE MOO!";
	} else if (cows >= 256) {
		h1.innerHTML = "Huger Moo!";
	} else if (cows >= 128) {
		h1.innerHTML = "Greater Moo!";
	} else if (cows >= 64) {
		h1.innerHTML = "Larger Moo!";
	} else if (cows >= 32) {
		h1.innerHTML = "Bigger Moo!";
	} else if (cows >= 16) {
		h1.innerHTML = "Huge Moo!";
	} else if (cows >= 8) {
		h1.innerHTML = "Great Moo!";
	} else if (cows >= 4) {
		h1.innerHTML = "Large Moo!";
	} else if (cows >= 2) {
		h1.innerHTML = "Big Moo!";
	} else {
		h1.innerHTML = "Moo!";
	}
}
