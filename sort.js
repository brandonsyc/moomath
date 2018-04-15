var type;

var list = document.getElementById("list");
var found = false;

var rawFile = new XMLHttpRequest();
rawFile.open("GET", "https://moomath.com/" + type + "/list.txt", false);
rawFile.onreadystatechange = function () {
	"use strict";

	if (rawFile.readyState === 4) {
		if (rawFile.status === 200 || rawFile.status === 0) {
			var array = rawFile.responseText.split("\n");
			for (var i = array.length - 1; i > -1; i--) {
				found = true;

				var sub = array[i].split(" - ");

				var block = document.createElement("div");
				block.classList.add("block");
				list.appendChild(block);
				
				var ta = document.createElement("div");
				ta.classList.add("ta");
				block.appendChild(ta);
				
				var inner = document.createElement("div");
				ta.appendChild(inner);

				var title = document.createElement("h2");
				title.innerHTML = sub[0];
				inner.appendChild(title);

				var author = document.createElement("p");
				author.innerHTML = "by <a href=\"https://github.com/" + sub[2] + "\" target=\"_blank\">" + sub[2] + "</a>, <br>" + sub[1];
				inner.appendChild(author);

				var more = document.createElement("p");
				more.classList.add("more");
				more.innerHTML = "<a href=\"" + sub[3] + "\">Read More</a>";
				ta.appendChild(more);

				var text = document.createElement("p");

				var rf2 = new XMLHttpRequest();
				rf2.open("GET", "https://moomath.com/" + type + "/" + sub[3] + "/" + type.slice(0, -1) + ".txt", false);
				rf2.onreadystatechange = function () {
					if (rf2.readyState === 4) {
						if (rf2.status === 200 || rf2.status === 0) {
							text.innerHTML = rf2.responseText.split("\n")[0];
						}
					}
				};
				rf2.send(null);

				block.appendChild(text);
			}
		}
	}
};
rawFile.send(null);

function update(x) {
	"use strict";
	var children = document.getElementById("list").children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].children[0].children[0].innerHTML.toUpperCase().includes(x.toUpperCase())) {
			children[i].style.display = "flex";
			if (x === "") {
				children[i].classList.remove("flex");
				children[i].children[1].style.display = "initial";
			} else {
				children[i].classList.add("flex");
				children[i].children[1].style.display = "none";
			}
		} else {
			children[i].classList.remove("flex");
			children[i].style.display = "none";
		}
	}
}

if (!found) {
	var block = document.createElement("div");
	block.classList.add("block");
	list.appendChild(block);
}

function check() {
	"use strict";
	update(document.getElementById("input").value);
}