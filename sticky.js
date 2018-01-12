var navigate = document.createElement("div");
navigate.classList.add("navigate");
navigate.innerHTML = "<a href=\"https://nichodon.github.io/\">Home</a><a>Articles</a><a>Programs</a><a>Learning C++</a>";
document.body.insertBefore(navigate, document.body.children[0]);

var first = document.createElement("div");
first.classList.add("first");
first.innerHTML = "<h1>MOOMATH</h1><p>A lovely math blog</p>";
document.body.insertBefore(first, document.body.children[0]);

var sticky = document.createElement("div");
sticky.classList.add("sticky");
sticky.innerHTML = "<a href=\"https://nichodon.github.io/\">Home</a><a>Articles</a><a>Programs</a><a>Learning C++</a>";
document.body.insertBefore(sticky, document.body.children[0]);

var last = document.createElement("div");
last.classList.add("last");
last.innerHTML = "<p>&copy; 2017 &ndash; 2018 Moomath<br>Contact: <a href=\"mailto:timothy.herchen@gmail.com\">timothy.herchen@gmail.com</a><br><a href=\"https://moomath.com/sitemap\">Sitemap</a> &ndash; <a href=\"https://github.com/nichodon/nichodon.github.io\">Source</a>";
document.body.appendChild(last);

document.body.onscroll = function() {
	"use strict";
	if (navigate.getBoundingClientRect().top < -5) {
		sticky.style.opacity = 1;
	} else {
		sticky.style.opacity = 0;
	}
};