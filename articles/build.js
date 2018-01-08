var path;

var rawFile = new XMLHttpRequest();
rawFile.open("GET", "https://nichodon.github.io/articles/" + path + "/article.txt", false);
rawFile.onreadystatechange = function () {
	"use strict";
	if (rawFile.readyState === 4) {
		if (rawFile.status === 200 || rawFile.status === 0) {
			var array = rawFile.responseText.split("\n");
			console.log(array);
			
			var article = document.createElement("div");
			document.body.appendChild(article);
			
			var out = "<p>";
			
			for (var i = 0; i < array.length; i++) {
				out += "\t" + array[i] + "\n";
				if (array[i] === "") {
					out += "</p>\n\n<p>\n";
				}
			}
			
			out += "</p>";
			
			article.innerHTML = out;
		}
	}
};
rawFile.send(null);