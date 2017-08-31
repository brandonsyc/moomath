//If embed is disired
if (getParameterByName("embed") !== null) {
	prepareEmbed();
	var start = 1;
	if (getParameterByName("disabled") !== null) {
		start = 2;
		var disabled = getParameterByName("disabled").split(",");
		for (var i = 0; i < disabled.length; i++) {
			var element = document.getElementById(disabled[i]);
			if (element !== null && element.classList.contains("embed")) {
				element.disabled = true;
			}
		}
	}
	var parameters = getUrlVars();
	for (var i = start; i < parameters.length; i++) {
		var element = document.getElementById(parameters[i]);
		if (element !== null && element.classList.contains("embed")) {
			var code = getParameterByName(parameters[i]);
			if (code === "checked" || code === "unchecked") {
				element.checked = code === "checked";
			}
			else {
				element.value = getParameterByName(parameters[i]);
			}
		}
	}
}

function getUrlVars()
{
	"use strict";
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
	for(var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split("=");
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}


function getParameterByName(name, url) {
	"use strict";
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(url);
	if (!results) {
		return null;
	}
	if (!results[2]) {
		return "";
	}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function isDescendant(parent, child) {
	"use strict";
	var node = child.parentNode;
	while (node !== null) {
		if (node === parent) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}

function prepareEmbed() {
	"use strict";
	var divs = document.getElementsByTagName("div");
	var box = document.getElementsByClassName("box")[0];
	box.insertBefore(document.createElement("BR"), box.childNodes[0]);
	var credit = document.createElement("P");
	credit.style.color = "#bbb";
	credit.innerHTML = 'From Moomath; view original <a href="' + window.location.href.split("?")[0] + '" target="_blank">here</a>';
	box.insertBefore(credit, box.childNodes[0]);
	var load = document.createElement("DIV");
	load.style.width = "100%";
	load.style.height = "100%";
	load.style.backgroundColor = "#08b";
	load.style.zIndex = "1";
	load.style.position = "relative";
	load.style.transition = "opacity 1s 1s, z-index 0s 2s";
	document.body.appendChild(load);
	for (var i = 0; i < divs.length; i++) {
		if (divs[i] !== load) {
			divs[i].style.transition = "0s";
			if (!isDescendant(box, divs[i]) && box !== divs[i]) {
				divs[i].style.visibility = "hidden";
				divs[i].style.height = "0px";
				divs[i].style.position = "fixed";
				divs[i].style.top = "0px";
			}
			else {
				divs[i].style.visibility = "visible";
			}
		}
	}
	var start = document.createElement("BUTTON");
	start.innerHTML = "Start!";
	start.style.position = "fixed";
	start.style.top = "50%";
	start.style.left = "50%";
	start.style.backgroundColor = "#333";
	start.style.transform = "translate(-50%, -50%)";
	start.onclick = function () {
		load.style.opacity = "0";
		load.style.zIndex = "-1";
		start.style.opacity = "0";
	};
	load.appendChild(start);
}
