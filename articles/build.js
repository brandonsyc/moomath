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
			var setting = "";
			
			for (var i = 0; i < array.length; i++) {
				if (array[i].includes("::fig::")) {
					var pars = array[i].split("::");
					out += "<figure>\n\t<img src=\"" + pars[2] + "\" alt=\"" + pars[3] + "\">\n\t<figcaption>" + pars[4] + "</figcaption>\n</figure>\n";
				} else if (array[i].includes("::code::")) {
					setting = "code";
					out += "<pre class=\"prettyprint\">\n";
				} else if (array[i] === "::") {
					if (setting === "code") {
						out += "</pre>";
					}
					setting = "";
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