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
			var content = document.getElementsByClassName("content")[0];
			var columns = document.createElement("DIV");
			columns.classList.add("columns");
			for (var i = array.length - 1; i > -1; i--) {
				var split = array[i].split(" -- ");
				
				var fourth = document.createElement("DIV");
				fourth.classList.add("fourth");
				
				var h3 = document.createElement("H3");
				h3.appendChild(document.createTextNode(split[0]));
				fourth.appendChild(h3);
				
				var thumb = document.createElement("A");
				thumb.href = "https://nichodon.github.io/" + path + "/" + ("000" + (i + 1)).slice(-4) + "/";
				var img = document.createElement("IMG");
				img.src = "https://nichodon.github.io/" + path + "/" + ("000" + (i + 1)).slice(-4) + "/images/thumb.png";
				thumb.appendChild(img);
				fourth.appendChild(thumb);
				
				var p = document.createElement("P");
				p.appendChild(document.createTextNode(split[1] + " \u2013 "));
				var people = split[2].split(" & ");
				for (var j = 0; j < people.length; j++) {
					var author = document.createElement("A");
					author.href = "https://github.com/" + people[j];
					author.appendChild(document.createTextNode(people[j]));
					p.appendChild(author);
					if (j < people.length - 1) {
						p.appendChild(document.createTextNode(" & "));
					}
				}
				fourth.appendChild(p);
				
				columns.appendChild(fourth);
				if ((array.length - i) % 4 === 0 || i === 0) {
					content.appendChild(columns);
					columns = document.createElement("DIV");
					columns.classList.add("columns");
					var clear = document.createElement("DIV");
					clear.classList.add("clear");
					content.appendChild(clear);
					var separate = document.createElement("DIV");
					separate.classList.add("separate");
					content.appendChild(separate);
				}
			}
		}
	}
};
rawFile.send(null);
