// JavaScript Document
var units = [["kilogram", "kilograms", "kg"], 
			 ["gram", "grams", "g"], 
			 ["milligram", "milligrams", "mg"],
			 ["microgram", "micrograms", "\u03bcg", "ug", "mcg"],
			 ["tonne", "tonnes", "t"],
			 ["long ton", "long tons", "LT"],
			 ["short ton", "short tons", "ST"],
			 ["long hundredweight", "long hundredweights", "long cwt"],
			 ["short hundredweight", "short hundredweights", "short cwt"],
			 ["long quarter", "long quarters", "long qtr"],
			 ["short quarter", "short quarters", "short qtr"],
			 ["stone", "stones", "st"],
			 ["pound", "pounds", "lb"],
			 ["ounce", "ounces", "oz"],
			 ["drachm", "drachms", "drachm", "dram"],
			 ["grain", "grains", "gr"],
			 ["troy pound", "troy pounds", "troy pound"],
			 ["troy ounce", "troy ounces", "ozt"],
			 ["pennyweight", "pennyweights", "dwt"],
			 ["carat", "carats", "carat"]
			];
var values = [1, 
			  0.001, 
			  0.000001,
			  0.000000001,
			  1000,
			  1016.0469088,
			  907.18474,
			  50.80234544,
			  45.359237,
			  12.70058636,
			  11.33980925,
			  6.35029318,
			  0.45359237,
			  0.02834952312,
			  0.00177184519,
			  0.00006479891,
			  0.3732417216,
			  0.0311034768,
			  0.00155517384,
			  0.0002
			 ];
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
			if (search.value.toLowerCase() === current[j].toLowerCase()) {
				number = i;
			}
		}
		if (number !== -1) {
			break;
		}
	}
	numbers[x / 2] = number;
	if (number !== -1) {
		unit.innerHTML = units[number][0].charAt(0).toUpperCase() + units[number][0].slice(1) + " (" + units[number][2] + ")";
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
	else {
		output.value = "";
	}
}

function change()
{
	"use strict";
	var inputs = document.getElementsByClassName("search");
	inputs[0].value = [inputs[2].value, inputs[2].value = inputs[0].value][0];
	search(0);
	search(2);
}