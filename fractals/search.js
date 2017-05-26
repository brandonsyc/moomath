// JavaScript Document

var rawFile = new XMLHttpRequest();
rawFile.open("GET", "list.txt", false);
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
			for (var i = 0; i < array.length; i++) {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(array[i]));
				ul.appendChild(li);
			}
		}
	}
};
rawFile.send(null);