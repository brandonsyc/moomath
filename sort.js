var type;

var list = document.getElementById("list");
var found = false;

var rawFile = new XMLHttpRequest();
rawFile.open("GET", "https://nichodon.github.io/" + type + "/list.txt", false);
rawFile.onreadystatechange = function () {
	"use strict";

	if (rawFile.readyState === 4) {
		if (rawFile.status === 200 || rawFile.status === 0) {
			var array = rawFile.responseText.split("\n");
			for (var i = 0; i < array.length; i++) {
				found = true;

				var sub = array[i].split(" - ");

				var block = document.createElement("div");
				block.classList.add("block");
				list.appendChild(block);
				
				var ta = document.createElement("div");
				block.appendChild(ta);

				var title = document.createElement("h2");
				title.innerHTML = sub[0];
				ta.appendChild(title);
				
				var thing = document.createElement("title");
				thing.innerHTML = sub[0];
				document.head.appendChild(thing);

				var author = document.createElement("p");
				author.innerHTML = "by <a href=\"https://github.com/" + sub[2] + "\" target=\"_blank\">" + sub[2] + "</a> &ndash; " + sub[1];
				ta.appendChild(author);

				var text = document.createElement("p");

				var rf2 = new XMLHttpRequest();
				rf2.open("GET", "https://nichodon.github.io/" + type + "/" + sub[3] + "/" + type.slice(0, -1) + ".txt", false);
				rf2.onreadystatechange = function () {
					if (rf2.readyState === 4) {
						if (rf2.status === 200 || rf2.status === 0) {
							text.innerHTML = rf2.responseText.split("\n")[0];
						}
					}
				};
				rf2.send(null);

				block.appendChild(text);

				var more = document.createElement("p");
				more.classList.add("more");
				more.innerHTML = "<a href=\"" + sub[3] + "\">Read More</a>";
				block.appendChild(more);
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
			if (x === "") {
				children[i].classList.remove("flex");
				children[i].children[1].style.display = "initial";
			} else {
				children[i].classList.add("flex");
				children[i].children[1].style.display = "none";
			}
		} else {
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