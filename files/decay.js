function alpha(a, m) {
    return [a[0] - 4 * m, a[1] - 2 * m];
}

function proton(a, m) {
    return [a[0] - m, a[1] - m];
}

function neutron(a, m) {
    return [a[0] - m, a[1]];
}

function positron(a, m) {
    return [a[0], a[1] - m];
}

function beta(a, m) {
    return [a[0], a[1] + m];
}


function load() {
    console.log(this.responseText);
}

let xhr = new XMLHttpRequest();
xhr.addEventListener("load", load);
xhr.open("GET", "chem/data/1.json");
xhr.send();
