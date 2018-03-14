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
			} else {
				element.value = getParameterByName(parameters[i]);
			}
		}
	}
}

function getUrlVars() {
	"use strict";
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
	for (var i = 0; i < hashes.length; i++) {
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
	} else if (!results[2]) {
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
	var children = document.getElementsByTagName("*");
	var box = document.getElementsByClassName("content")[0];
	
	var credit = document.createElement("p");
	credit.style.color = "#bbb";
	credit.innerHTML = 'From Moomath; view original <a href="' + window.location.href.split("?")[0] + '" target="_blank">here</a><br>';
	box.insertBefore(credit, box.childNodes[0]);
	
	for (var i = 0; i < children.length; i++) {
		if (!isDescendant(box, children[i]) && box !== children[i]) {
			children[i].style.transition = "0s";
			children[i].style.visibility = "hidden";
			children[i].style.height = "0px";
			children[i].style.position = "fixed";
			children[i].style.top = "0";
		}
	}
}
