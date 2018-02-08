var cows = 0;

document.getElementsByTagName("p")[0].onclick = function() {
	"use strict";
	cow();
};

function cow() {
	"use strict";
	cows++;
	
	var div = document.createElement("div");
	div.style.backgroundImage = "url(https://moomath.com/images/back.png)";
	if (Math.random() < 0.5) {
		div.style.backgroundImage = "url(https://moomath.com/images/front.png)";
	}
	div.style.top = Math.random() * 100 + "%";
	div.style.left = Math.random() * 100 + "%";
	div.style.transform = "translate(-50%, -50%) rotate(" + Math.random() * 360 + "deg)";
	document.body.appendChild(div);
	
	var h1 = document.getElementsByTagName("h1")[0];
	h1.style.color = "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",1)";
	
	if (cows === 256) {
		window.location.replace("https://moomath.com");
	} else if (cows >= 128) {
		h1.innerHTML = "EXPLOSIVE Moo!";
	} else if (cows >= 64) {
		h1.innerHTML = "Largest Moo!";
	} else if (cows >= 32) {
		h1.innerHTML = "Biggest Moo!";
	} else if (cows >= 16) {
		h1.innerHTML = "Larger Moo!";
	} else if (cows >= 8) {
		h1.innerHTML = "Bigger Moo!";
	} else if (cows >= 4) {
		h1.innerHTML = "Large Moo!";
	} else if (cows >= 2) {
		h1.innerHTML = "Big Moo!";
	} else {
		h1.innerHTML = "Moo!";
	}
}
