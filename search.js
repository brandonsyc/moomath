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
			var ul = document.getElementsByClassName("list")[0];
			for (var i = array.length - 1; i > -1; i--) {
				var li = document.createElement("li");
				var a = document.createElement('a');
				a.appendChild(document.createTextNode(array[i].replace('-', '\u2013')));
				a.href = ('../000' + (i + 1)).slice(-4) + "/";
				li.appendChild(a);
				ul.appendChild(li);
			}
		}
	}
};
rawFile.send(null);
