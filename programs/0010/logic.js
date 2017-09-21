var rawFile = new XMLHttpRequest();
rawFile.open("GET", "https://raw.githubusercontent.com/Nichodon/nichodon.github.io/master/404.html", true);
rawFile.onreadystatechange = function ()
{
	"use strict";
	if(rawFile.readyState === 4)
	{
		if(rawFile.status === 200 || rawFile.status === 0)
		{
			var allText = rawFile.responseText;
			var array = allText.split("\n");
			console.log(array);
			console.log("s");
		}
	}
};