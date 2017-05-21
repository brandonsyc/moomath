document.getElementById("top").innerHTML =
	'<div class="content">' +
		'<h1>VISUAL MATH</h1>' +
	'</div>' +

	'<div class="topnav">' +
		'<a href=\"https://nichodon.github.io\">Home</a>' +
		'<a href=\"https://nichodon.github.io/fractals/\">Fractals</a>' +
		'<a href=\"https://nichodon.github.io/programming/\">Programming</a>' +
		'<a href=\"https://nichodon.github.io/coming_soon/\">Calculators</a>' +
		'<a href=\"https://nichodon.github.io/coming_soon/\">More Math</a>' +
		'<a href=\"https://nichodon.github.io/coming_soon/\">Worksheets</a>' +
		'<a href=\"https://nichodon.github.io/about/\">About</a>' +
	'</div>';

var linkz = document.getElementsByClassName("topnav")[0].children;
for (var i = 0; i < linkz.length; i++) {
<<<<<<< HEAD
    if (linkz[i].href === window.location.href.replace("#top", "")) {
        linkz[i].classList.add('active');
    } else if (linkz[i].className === "dropdown") {
        if (linkz[i].children[0].href === window.location.href){
            linkz[i].children[0].classList.add('active');
        }
    }
=======
	if (linkz[i].href === window.location.href.replace("#top", "")) {
		linkz[i].classList.add('active');
	}
>>>>>>> fcbf173ff79467f5a63c3fe74ed2ce0bf22b880a
}