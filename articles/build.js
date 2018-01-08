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
				if (array[i].includes("::")) {
					var pars = array[i].split("::");
					out += "<figure>\n\t<img src=\"" + pars[1] + "\" alt=\"" + pars[2] + "\">\n\t<figcaption>" + pars[3] + "</figcaption>\n</figure>";
				} else if (array[i] === "") {
					if (!array[i - 1].includes("::")) {
						out += "</p>\n\n";
					}
					if (!array[i + 1].includes("::")) {
						out += "<p>\n";
					}
				} else {
					out += "\t" + array[i] + "\n";
				}
			}
			
			out += "</p>";
			
			article.innerHTML = out;
		}
	}
};
rawFile.send(null);