var path;

var rawFile = new XMLHttpRequest();
rawFile.open("GET", "https://nichodon.github.io/articles/" + path + "/article.txt", false);
rawFile.onreadystatechange = function () {
	"use strict";
	if (rawFile.readyState === 4) {
		if (rawFile.status === 200 || rawFile.status === 0) {
			var array = rawFile.responseText.split("\n");
				
			var rf2 = new XMLHttpRequest();
			rf2.open("GET", "https://nichodon.github.io/articles/list.txt", false);
			rf2.onreadystatechange = function () {
				if (rf2.readyState === 4) {
					if (rf2.status === 200 || rf2.status === 0) {
						var sub = rf2.responseText.split("\n")[path - 1].split(" - ");
						
						var header = document.createElement("header");
						header.classList.add("header");
						document.body.appendChild(header);
						
						var h1 = document.createElement("h1");
						h1.innerHTML = sub[0];
						header.appendChild(h1);
						
						var p = document.createElement("p");
						p.innerHTML = "by <a href=\"https://github.com/" + sub[1] + "\" target=\"_blank\">" + sub[1] + "</a> &ndash; " + sub[2];
						header.appendChild(p);
					}
				}
			};
			rf2.send(null);
			
			var article = document.createElement("div");
			article.classList.add("article");
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
				} else if (array[i] === "" && setting === "") {
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