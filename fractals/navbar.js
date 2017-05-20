document.getElementsByClassName("topnav")[0].innerHTML =
	'<a href=\"../index.html\">Home</a>' +
	'<a href=\"../fractals.html\">Fractals</a>' +
	'<a href=\"../coming_soon\">Programming</a>' +
	'<a href=\"../coming_soon\">Calculators</a>' +
	'<a href=\"../coming_soon\">More Math</a>' +
	'<a href=\"../coming_soon\">Worksheets</a>' +
	'<a href=\"../about.html\">About</a>';

var linkz = document.getElementsByClassName("topnav")[0].children;
for (var i = 0; i < linkz.length; i++) {
	if (linkz[i].href === window.location.href) {
		linkz[i].classList.add('active');
	}
}