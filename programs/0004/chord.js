// JavaScript Document
var states = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
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
			  [2, 4, 7, 10],
			  [2, 4, 5, 7, 10],
			  [2, 4, 5, 7, 9, 10],
			  [1, 4, 7, 10],
			  [3, 4, 7, 10],
			  [2, 4, 6, 7, 10],
			  [2, 4, 5, 7, 8, 10],
			  [2, 4, 7],
			  [4, 5, 7],
			  [5, 7],
			  [2, 5, 7, 10]
			 ];
var names = [["Major Triad", "<sup></sup>"], 
			 ["Minor Triad", "m<sup></sup>"], 
			 ["Augmented Triad", "aug<sup></sup>"],
			 ["Diminished Triad", "dim<sup></sup>"],
			 ["Diminished Seventh", "<sup>o7</sup>"],
			 ["Half-Diminished Seventh", "<sup>&oslash;7</sup>"],
			 ["Minor Seventh", "m<sup>7</sup>"],
			 ["Minor Major Seventh", "m<sup>M7</sup>"],
			 ["Dominant Seventh", "<sup>7</sup>"],
			 ["Major Seventh", "M<sup>7</sup>"],
			 ["Augmented Seventh", "+<sup>7</sup>"],
			 ["Augmented Major Seventh", "+<sup>M7</sup>"],
			 ["Dominant Ninth", "<sup>9</sup>"],
			 ["Dominant Eleventh", "<sup>11</sup>"],
			 ["Dominant Thirteenth", "<sup>13</sup>"],
			 ["Seventh Minor Ninth", "<sup>7&minus;9</sup>"],
			 ["Seventh Sharp Ninth", "<sup>7+9</sup>"],
			 ["Seventh Augmented Eleventh", "<sup>7+11</sup>"],
			 ["Seventh Diminished Thirteenth", "<sup>7-13</sup>"],
			 ["Add Nine", "<sup>2</sup>"],
			 ["Add Fourth", "<sup>4</sup>"],
			 ["Suspended Fourth", "<sup>sus4</sup>"],
			 ["Jazz Sus", "<sup>9sus4</sup>"]
			];
var scale = [["A"],
			 ["A&#9839;", "B&#9837;"],
			 ["B", "C&#9837;"],
			 ["B&#9839;", "C"],
			 ["C&#9839;", "D&#9837;"],
			 ["D"],
			 ["D&#9839;", "E&#9837;"],
			 ["E", "F&#9837;"],
			 ["E&#9839;", "F"],
			 ["F&#9839;", "G&#9837;"],
			 ["G"],
			 ["G&#9839;", "A&#9837;"]
			];
var indices;
var base;
var tonic = "c";
var audio = [];
for (var i = 36; i < 61; i++) {
	audio.push(new Audio("sounds/" + i + ".wav"));
}
var code = {};
code.cf = [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 2];
code.gf = [0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 9];
code.df = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 4];
code.af = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 11];
code.ef = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 6];
code.bf = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1];
code.f = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 8];
code.c = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 3];
code.g = [0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 10];
code.d = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 5];
code.a = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0];
code.e = [0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 7];
code.b = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2];
code.fs = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 9];
code.cs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4];

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
	update();
}

function update() {
    base = together(true);
	var chord = check();
	if (chord === "Not a chord<sup></sup>") {
		together(false);
		chord = check();
	}
	document.getElementById("output").innerHTML = chord;
}

function check() {
	"use strict";
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
			var mod = ((indices[0] % 12) + 12) % 12;
			console.log((((base % 12 - code[tonic][12]) % 12) + 12) % 12);
			return names[j][0] + " (" + scale[mod][code[tonic][mod]] + names[j][1] + 
				"/" + scale[base % 12][code[tonic][base % 12]] + ")";
		}
		indices.splice(0, 0, indices[indices.length - 1] - 12);
		indices.pop();
	}
	return "Not a chord<sup></sup>";
}

function together(x) { 
	"use strict";
	indices = [];
	var i = -1;
	var out = -1;
	while ((i = states.indexOf(true, i + 1)) !== -1) {
		if (indices.indexOf(i % 12) === -1) {
			if (x || out > -1) {
        		indices.push(i % 12);
			}
			if (out === -1) {
				out = i % 12;
			}
		}
		if (!document.getElementById("toggle").checked && x) {
			audio[i].currentTime = 0;
			audio[i].play();
		}
    }
	indices.sort(function(a, b) {
		return a - b;
	});
	return out;
}

function key() {
	"use strict";
	tonic = document.querySelector('input[name="key"]:checked').id;
	update();
	var j = 0;
	var children = document.getElementById("piano").children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].className !== "break") {
			var old = children[i].children[0].innerHTML;
			children[i].children[0].innerHTML = scale[j % 12][code[tonic][j % 12]];
			if (children[i].children[0].innerHTML !== old) {
				children[i].children[0].style.opacity = 0;
			}
			children[i].children[0].innerHTML = old;
			j++;
		}
	}
	setTimeout(fade, 200);
}

function fade() {
	"use strict";
	var j = 0;
	var children = document.getElementById("piano").children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].className !== "break") {
			children[i].children[0].innerHTML = scale[j % 12][code[tonic][j % 12]];
			children[i].children[0].style.opacity = 1;
			j++;
		}
	}
}

/*

censure v n
an official reprimand; to critize or disapprove

chastise v
to discipline, scold, punish

chronic adj
constant, habitual

clandestine adj
done in secrecy or concealment

commiserate v
to feel or express sympathy, condolence

*/