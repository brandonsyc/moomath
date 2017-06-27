// JavaScript Document
var states = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var chords = [[4, 7],
			  [3, 7],
			  [4, 8],
			  [3, 6],
			  [3, 6, 9],
			  [3, 6, 10],
			  [3, 7, 10],
			  [3, 7, 11],
			  [4, 7, 10],
			  [4, 7, 11],
			  [4, 8, 10],
			  [4, 8, 11],
			  [2, 4, 7],
			  [4, 5, 7],
			  [5, 7]
			 ];
var names = [["Major Triad", ""], 
			 ["Minor Triad", "m"], 
			 ["Augmented Triad", "aug"],
			 ["Diminished Triad", "dim"],
			 ["Diminished Seventh", "<sup>o7</sup>"],
			 ["Half-Diminished Seventh", "<sup>&oslash;7</sup>"],
			 ["Minor Seventh", "m<sup>7</sup>"],
			 ["Minor Major Seventh", "m<sup>M7</sup>"],
			 ["Dominant Seventh", "<sup>7</sup>"],
			 ["Major Seventh", "M<sup>7</sup>"],
			 ["Augmented Seventh", "+<sup>7</sup>"],
			 ["Augmented Major Seventh", "+<sup>M7</sup>"],
			 ["Add Nine", "<sup>2</sup>"],
			 ["Add Fourth", "<sup>4</sup>"],
			 ["Suspended Fourth", "<sup>sus4</sup>"]
			];
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
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
		if (indices.indexOf(i % 12) === -1) {
        	indices.push(i % 12);
		}
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
			chord = names[j][0] + " (" + notes[((indices[0] % 12) + 12) % 12] + names[j][1] + ")";
			break;
		}
		indices.splice(0, 0, indices[indices.length - 1] - 12);
		indices.pop();
	}
	document.getElementById("output").innerHTML = chord;
}