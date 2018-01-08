var navigate = document.createElement("navigate");
navigate.classList.add("navigate");
navigate.innerHTML = "<a>Home</a><a>Articles</a><a>Programs</a><a>Learning C++</a>";
document.body.insertBefore(navigate, document.body.children[0]);

var first = document.createElement("first");
first.classList.add("first");
first.innerHTML = "<h1>MOOMATH</h1><p>A lovely math blog</p>";
document.body.insertBefore(first, document.body.children[0]);

var sticky = document.createElement("sticky");
sticky.classList.add("sticky");
sticky.innerHTML = "<a>Home</a><a>Articles</a><a>Programs</a><a>Learning C++</a>";
document.body.insertBefore(sticky, document.body.children[0]);

document.body.onscroll = function() {
	"use strict";
	if (navigate.getBoundingClientRect().top < -5) {
		sticky.style.opacity = 1;
	} else {
		sticky.style.opacity = 0;
	}
};