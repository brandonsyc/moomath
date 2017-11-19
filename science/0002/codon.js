var data = ["A", "T", "G", "C"];
var comp = ["U", "A", "C", "G"];
var dna = document.getElementById("dna");
var rna = document.getElementById("rna");
var amino = document.getElementById("amino");

var table = {};
table.uuu = "Phe"; table.uuc = "Phe"; table.uua = "Leu"; table.uug = "Leu";
table.cuu = "Leu"; table.cuc = "Leu"; table.cua = "Leu"; table.cug = "Leu";
table.auu = "Ile"; table.auc = "Ile"; table.aua = "Ile"; table.aug = "Met";
table.guu = "Val"; table.guc = "Val"; table.gua = "Val"; table.gug = "Val";
table.ucu = "Ser"; table.ucc = "Ser"; table.uca = "Ser"; table.ucg = "Ser";
table.ccu = "Pro"; table.ccc = "Pro"; table.cca = "Pro"; table.ccg = "Pro";
table.acu = "Thr"; table.acc = "Thr"; table.aca = "Thr"; table.acg = "Thr";
table.gcu = "Ala"; table.gcc = "Ala"; table.gca = "Ala"; table.gcg = "Ala";
table.uau = "Tyr"; table.uac = "Tyr"; table.uaa = "Stop"; table.uag = "Stop";
table.cau = "His"; table.cac = "His"; table.caa = "Gln"; table.cag = "Gln";
table.aau = "Asn"; table.aac = "Asn"; table.aaa = "Lys"; table.aag = "Lys";
table.gau = "Asp"; table.gac = "Asp"; table.gaa = "Glu"; table.gag = "Glu";
table.ugu = "Cys"; table.ugc = "Cys"; table.uga = "Stop"; table.ugg = "Trp";
table.cgu = "Arg"; table.cgc = "Arg"; table.cga = "Arg"; table.cgg = "Arg";
table.agu = "Ser"; table.agc = "Ser"; table.aga = "Arg"; table.agg = "Arg";
table.ggu = "Gly"; table.ggc = "Gly"; table.gga = "Gly"; table.ggg = "Gly";

function check(x) {
	"use strict";
	var input = document.getElementById(x);
	for (var i = 0; i < input.value.length; i++) {
		if (data.includes(input.value.charAt(i).toUpperCase())) {
			var p = document.createElement("P");
			p.innerHTML = input.value.charAt(i).toUpperCase();
			dna.insertBefore(p, input);
			p.onclick = function() {
				replace(p);
			};
			p.className = input.value.charAt(i).toLowerCase();
		}
	}
	input.value = "";
    if (event.keyCode === 8 && event.type === "keydown" && dna.children.length > 3) {
		dna.removeChild(input.previousSibling);
	}
	stringit();
}

function replace(x) {
	"use strict";
	var old = document.getElementById("semi");
	add(old);
	var semi = document.createElement("INPUT");
	semi.id = "semi";
	dna.insertBefore(semi, x);
	semi.onkeydown = function() {
		check("semi");
	};
	semi.onkeyup = semi.onkeydown;
	semi.focus();
	stringit();
}

function update() {
	"use strict";
	var semi = document.getElementById("semi");
	add(semi);
	stringit();
}

function add(x) {
	"use strict";
	var p = document.createElement("P");
	if (x !== null) {
		if (x.value !== "") {
			p.innerHTML = x.value;
			dna.insertBefore(p, x);
			p.onclick = function() {
				replace(p);
			};
			p.className = x.value.toLowerCase();
		}
		dna.removeChild(x);
	}
}

function stringit() {
	"use strict";
	var out = " ";
	while (rna.children.length > 2) {
    	rna.removeChild(rna.lastChild);
	}
	while (amino.children.length > 2) {
    	amino.removeChild(amino.lastChild);
	}
	for (var i = 2; i < dna.children.length - 1; i++) {
		var p = document.createElement("P");
		if (data.includes(dna.children[i].innerHTML)) {
			var swap = comp[data.indexOf(dna.children[i].innerHTML)];
			p.innerHTML = swap;
			rna.appendChild(p);
			p.className = swap.toLowerCase();
			out += swap.toLowerCase();
		} else {
			var fake = document.createElement("INPUT");
			rna.appendChild(fake);
			fake.disabled = true;
		}
		dna.children[i].classList.add("dis");
		rna.children[i].classList.add("dis");
	}
	var regex = [/aug/.exec(out)];
	out = out.replace(/.*?aug/, "aug");
	var checked = " ";
	for (i = 0; i < out.length; i++) {
		checked += out.charAt(i);
		checked += checked.length % 4 === 0 ? " " : "";
	}
	regex.push(/(uaa|uag|uga)/.exec(checked));
	var go = false;
	if (regex[0] !== null && regex[1] !== null) {
		var start = [regex[0].index, regex[1].index];
		start[1] -= Math.floor(start[1] / 4) - start[0] + 1;
		for (i = 2; i < dna.children.length - 1; i++) {
			if (dna.children[i].innerHTML === "") {
				start[0]++;
				start[1]++;
			} else if (start[0] + 1 === i) {
				go = true;
			} else if (start[1] + 4 === i) {
				go = false;
			}
			if (go) {
				dna.children[i].classList.remove("dis");
				rna.children[i].classList.remove("dis");
			}
		}	
	}
	var input = document.createElement("INPUT");
	rna.appendChild(input);
	input.disabled = true;
	var match = /aug.*?(uaa|uag|uga)/.exec(checked);
	if (match !== null) {
		var acids = match[0].split(" ");
		var a = document.createElement("P");
		a.innerHTML = "Start";
		amino.appendChild(a);
		for (i = 1; i < acids.length; i++ ) {
			a = document.createElement("P");
			a.innerHTML = table[acids[i]];
			amino.appendChild(a);
		}
	}
}

function cleanse() {
	"use strict";
	while (dna.children.length > 3) {
    	dna.removeChild(dna.lastChild.previousSibling.previousSibling);
	}
	stringit();
}