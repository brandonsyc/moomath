// JavaScript Document
var states = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var chords = [[4, 7],
			  [3, 7],
			  [3, 8]
			 ];
var names = ["Major Triad", "Minor Triad", "Augmented Triad"];
function toggle(x)
{
	"use strict";
	var key = document.getElementsByClassName("key")[x];
    if (key.className === "key" || key.className === "key black") {
        key.className += " down";
    }
    else {
        key.className = key.className.replace(" down", "");
    }
	states[x] = !states[x];
    
	var indices = [], i = -1;
	while ((i = states.indexOf(true, i + 1)) !== -1) {
        indices.push(i);
    }
	
	var chord = "Not a chord";
	for (i = 0; i < indices.length; i++) {
		var dist = [];
		for (var j = 1; j < indices.length; j++) {
			dist.push(indices[j] - indices[0]);
		}
		var index = -1;
		for (j = 0; j < chords.length; j++) {
			var found = true;
			if (dist.length === chords[j].length) {
				for (var k = 0; k < dist.length; k++) {
					if (dist[k] !== chords[j][k]) {
						found = false;
						break;
					}
				}
				if (found) {
					index = j;
					break;
				}
			}
		}
		if (index > -1) {
			chord = names[j];
			break;
		}
		indices.splice(0, 0, indices[indices.length - 1] - 12);
		indices.pop();
	}
	document.getElementById("output").innerHTML = chord;
}