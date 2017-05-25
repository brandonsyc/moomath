document.getElementById("top").innerHTML =
	'<div class="header">' +
		'<h1>VISUAL MATH</h1><hr>' +
		'<p>A lovely math blog</p>' +
	'</div>' +

	'<div class="topnav">' +
		'<a href="https://nichodon.github.io">Home</a>' +
		'<a href="https://nichodon.github.io/fractals/">Fractals</a>' +
		'<a href="https://nichodon.github.io/programming/">Programming</a>' +
		'<a href="https://nichodon.github.io/coming_soon/">Calculators</a>' +
		'<a href="https://nichodon.github.io/coming_soon/">More Math</a>' +
		'<a href="https://nichodon.github.io/coming_soon/">Worksheets</a>' +
		'<a href="https://nichodon.github.io/about/">About</a>' +
	'</div>';

document.getElementsByClassName("footer")[0].innerHTML =
	"<p>Copyright &copy; 2017 &ndash; All Rights Reserved &ndash; <a href=\"https://github.com/Nichodon\" target=\"_blank\">Nichodon</a> &ndash; <a href=\"#top\">Go to Top</a></p>";

var linkz = document.getElementsByClassName("topnav")[0].children;
for (var i = 0; i < linkz.length; i++) {
	if (linkz[i].href === window.location.href.replace("#top", "").replace("index","")) {
		linkz[i].classList.add('active');
	}
}
