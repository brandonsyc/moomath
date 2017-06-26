// JavaScript Document
var path;
var rawFile = new XMLHttpRequest();
rawFile.open("GET", "https://nichodon.github.io/" + path + "/search/list.txt", false);
rawFile.onreadystatechange = function ()
{
	"use strict";
	if(rawFile.readyState === 4)
	{
		if(rawFile.status === 200 || rawFile.status === 0)
		{
			var allText = rawFile.responseText;
			var array = allText.split("\n");
			var div = document.getElementsByClassName("content")[0];
			var columns = document.createElement("DIV");
			columns.classList.add("columns");
			for (var i = array.length - 1; i > -1; i--) {
				var split = array[i].split(" -- ");
				alert((array.length - i) + "");
				var fourth = document.createElement("DIV");
				fourth.classList.add("fourth");
				var h3 = document.createElement("H3");
				h3.appendChild(document.createTextNode(split[0]));
				fourth.appendChild(h3);
				columns.appendChild(fourth);
				div.appendChild(columns);
				/**var li = document.createElement("li");
				var a = document.createElement("a");
				a.appendChild(document.createTextNode(array[i].replace("--", "\u2013")));
				a.href = "https://nichodon.github.io/" + path + "/" + ("000" + (i + 1)).slice(-4) + "/";
				li.appendChild(a);
				ul.appendChild(li);*/
			}
		}
	}
};
rawFile.send(null);
