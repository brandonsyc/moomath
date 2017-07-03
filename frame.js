document.getElementById("top").innerHTML =
	'<div class="header">' +
		'<h1>VISUAL MATH</h1>' +
		'<p>A lovely math blog</p>' +
	'</div>' +

	'<div class="topnav">' +
		'<a href="javascript:void(0);" class="icon" onclick="show()">&#9776;</a>' +
		'<div>' +
			'<a href="https://nichodon.github.io">Home</a>' +
			'<a href="https://nichodon.github.io/fractals/">Fractals</a>' +
			'<a href="https://nichodon.github.io/programs/">Programs</a>' +
			'<a href="https://nichodon.github.io/coming_soon/">More Math</a>' +
			'<a href="https://nichodon.github.io/coming_soon/">Worksheets</a>' +
			'<a href="https://nichodon.github.io/about/">About</a>' +
		'</div>' +
	'</div>' +


	'<div class="topnav" id="sticky">' +
		'<a href="javascript:void(0);" class="icon" onclick="show()">&#9776;</a>' +
		'<div>' +
			'<a href="https://nichodon.github.io">Home</a>' +
			'<a href="https://nichodon.github.io/fractals/">Fractals</a>' +
			'<a href="https://nichodon.github.io/programs/">Programs</a>' +
			'<a href="https://nichodon.github.io/coming_soon/">More Math</a>' +
			'<a href="https://nichodon.github.io/coming_soon/">Worksheets</a>' +
			'<a href="https://nichodon.github.io/about/">About</a>' +
		'</div>' +
	'</div>';

document.getElementById("bottom").innerHTML =
	'<div class="footer">' +
		'<p><a href="#top"><strong>Go to Top</strong></a><br>' +
		'&copy; ' + new Date().getFullYear() + ' CE &ndash; All Rights Reserved &ndash; <a href="https://github.com/Nichodon" target="_blank">Nichodon</a><br>' +
		'Contact: <a href="mailto:timothy.herchen@gmail.com?Subject=Visual%20Math">timothy.herchen@gmail.com</a></p>' +
	'</div>';

for (var j = 0; j < 2; j++) {
	var linkz = document.getElementsByClassName("topnav")[j].children;
	for (var i = 0; i < linkz.length; i++) {
		if (linkz[i].href === undefined) {
			var links = linkz[i].children;
			for (var k = 0; k < links.length; k++)
			{
				if (links[k].href === window.location.href.replace("#top", "")) {
					links[k].classList.add("active");
				}
			}
		}
		else if (linkz[i].href === window.location.href.replace("#top", "")) {
			linkz[i].classList.add("active");
		}
	}
}

window.onscroll = function() {
	"use strict";
	var navbar = document.getElementsByClassName("topnav")[0];
	var sticky = document.getElementById("sticky");
	if (window.scrollY > navbar.offsetTop) {
		sticky.style.display = "inline";
	}
	else {
		sticky.style.display = "none";
	}
	if (window.scrollY > navbar.offsetTop) {
		sticky.style.boxShadow = "0px 20px 25px rgba(51, 51, 51, 0.2)";
	}
	else {
		sticky.style.boxShadow = "none";
	}
};

function show() {
	"use strict";
	var navbar = document.getElementsByClassName("topnav")[0];
	var sticky = document.getElementById("sticky");
  if (navbar.className === "topnav") {
  	navbar.className += " responsive";
  }
  else {
  	navbar.className = "topnav";
  }
	if (sticky.className === "topnav") {
	  sticky.className += " responsive";
	}
	else {
	  sticky.className = "topnav";
	}
}
