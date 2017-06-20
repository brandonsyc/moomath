// JavaScript Document
var numbers = [-1, -1];
var units = [];
var values = [];

function search(x)
{
	"use strict";
	var type = document.querySelector('input[name = "type"]:checked').value;
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", type + ".txt", false);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status === 0)
			{
				var allText = rawFile.responseText;
				var array = allText.split(":");
				array[0] = array[0].split("\n");
				values = array[1].split("\n");
				values.shift();
				for (var i = 0; i < array[0].length; i++) {
					units.push(array[0][i].split(","));
				}
			}
		}
	};
	rawFile.send(null);
	
	var search = document.getElementsByClassName("search")[x];
	var unit = document.getElementsByClassName("unit")[x / 2];
	var number = -1;
	for (var i = 0; i < units.length; i++) {
		var current = units[i];
		for (var j = 0; j < current.length; j++) {
			if (search.value.toLowerCase() === current[j].toLowerCase().trim()) {
				number = i;
			}
		}
		if (number !== -1) {
			break;
		}
	}
	numbers[x / 2] = number;
	if (number !== -1) {
		unit.innerHTML = units[number][0].charAt(0).toUpperCase() + units[number][0].slice(1) + " (" + units[number][2].trim() + ")";
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

function update() 
{
	"use strict";
	units = [];
	values = [];
	change();
	change();
}