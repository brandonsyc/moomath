// JavaScript Document
var units = [["gram", "grams", "g"], ["pound", "pounds", "lb"], ["kilogram", "kilograms", "kg"]];
var values = [0.001, 2.20462262185, 1];
var numbers = [-1, -1];

function search(x)
{
	"use strict";
	var search = document.getElementsByClassName("search")[x];
	var unit = document.getElementsByClassName("unit")[x / 2];
	var number = -1;
	for (var i = 0; i < units.length; i++) {
		var current = units[i];
		for (var j = 0; j < current.length; j++) {
			if (search.value.toLowerCase().replace(" ","").replace(".","") === current[j]) {
				number = i;
			}
		}
		if (number !== -1) {
			break;
		}
	}
	numbers[x / 2] = number;
	if (number !== -1) {
		unit.innerHTML = units[number][0].charAt(0).toUpperCase() + units[number][0].slice(1);
	}
	else {
		unit.innerHTML = "Input";
	}
	check();
}

function check()
{
	"use strict";
	var input = document.getElementsByClassName("search")[1];
	var output = document.getElementsByClassName("search")[3];
	if (numbers[0] > -1 && numbers[1] > -1 && input.value !== "") {
		output.value = input.value * values[numbers[0]] / values[numbers[1]];
	}
}