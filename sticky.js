var navigate = document.createElement("div");
navigate.classList.add("navigate");
navigate.innerHTML = "<div><a href=\"https://moomath.com\">Home</a><a href=\"https://moomath.com/articles\">Articles</a><a href=\"https://moomath.com/programs\">Programs</a><a href=\"https://moomath.com/about\">About</a></div>";
document.body.insertBefore(navigate, document.body.children[0]);

var first = document.createElement("div");
first.classList.add("first");
first.innerHTML = "<h1>MOOMATH</h1><p>A lovely math blog</p>";
document.body.insertBefore(first, document.body.children[0]);

var sticky = document.createElement("div");
sticky.classList.add("sticky");
sticky.innerHTML = "<div><a href=\"https://moomath.com\">Home</a><a href=\"https://moomath.com/articles\">Articles</a><a href=\"https://moomath.com/programs\">Programs</a><a href=\"https://moomath.com/about\">About</a></div>";
document.body.insertBefore(sticky, document.body.children[0]);

var last = document.createElement("div");
last.classList.add("last");
last.innerHTML = "<p>&copy; 2017 &ndash; " + document.createTextNode(new Date().getFullYear()) + " Moomath<br>Contact: <a href=\"mailto:timothy.herchen@gmail.com\">timothy.herchen@gmail.com</a><br><a href=\"https://moomath.com/sitemap\">Sitemap</a> &ndash; <a href=\"https://github.com/nichodon/nichodon.github.io\">Source</a></p>";
document.body.appendChild(last);

document.body.onscroll = function() {
	"use strict";
	if (navigate.getBoundingClientRect().top < 0) {
		sticky.style.opacity = 1;
	} else {
		sticky.style.opacity = 0;
	}
};