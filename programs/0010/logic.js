var inputs = document.getElementsByTagName("INPUT");
inputs[0].oninput = function() {
	"use strict";
	check();
};

var keys = [
	[">", "\u21D2"],
	["<", "\u21D4"],
	["~", "\u00AC"],
	["&", "\u2227"],
	["|", "\u2228"],
];

function check() {
	"use strict";
	var code = document.activeElement.value;
	for (var i = 0; i < keys.length; i++) {
		code = code.replace(keys[i][0], keys[i][1]);
	}
	document.activeElement.value = code;
}