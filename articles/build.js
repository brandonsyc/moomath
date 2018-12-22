let array = document.getElementById('data').innerHTML.split('\n');

let req = new XMLHttpRequest();
let self = this;
req.onload = function() {
    var sub = this.responseText.split('\n')[path - 1].split(' - ');

    let header = document.createElement('div');
    header.classList.add('header');
    document.body.insertBefore(header, article);

    let h1 = document.createElement('h1');
    h1.innerHTML = sub[0];
    header.appendChild(h1);

    let thing = document.createElement('title');
    thing.innerHTML = sub[0];
    document.head.appendChild(thing);

    let p = document.createElement('p');
    p.innerHTML = 'by <a href="https://github.com/' + sub[2] + '" target="_blank">' + sub[2] + '</a> &ndash; ' + sub[1];
    header.appendChild(p);
};
req.open('get', 'https://moomath.com/articles/list.txt');
req.send();

let article = document.createElement('div');
article.classList.add('article');
document.body.appendChild(article);

let out = '<p>';
let setting = '';

for (let i = 0; i < array.length; i++) {
    let line = array[i].trim();
	let pars;
	if (line.includes('::fig::')) {
		pars = line.split('::');
		out += '<figure><img src="' + pars[2] + '" alt="' + pars[3];
		if (pars[5] === 'no') {
			out += '" class="no';
		}
		out += '"><figcaption>' + pars[4] + '</figcaption></figure>';
	} else if (line.includes('::code::')) {
		setting = 'code';
		out += '<pre class="prettyprint">';
	} else if (line.includes('::vid::')) {
		pars = line.split('::');
		out += '<div class="video"><iframe src="' + pars[2] + '" allowfullscreen></iframe></div>';
	} else if (line === '::') {
		if (setting === 'code') {
			out += '</pre>';
		}
		setting = '';
	} else if (line === '' && setting === '') {
		if (i > 0 && !array[i - 1].includes('::')) {
			out += '</p>';
		}
		if (i < array.length - 1 && !array[i + 1].includes('::')) {
			out += '<p>';
		}
	} else {
		out += line+ '\n';
	}
}

out += '</p>';
article.innerHTML = out;
document.body.removeChild(document.getElementById('data'));