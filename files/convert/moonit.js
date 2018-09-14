class Moonit {
    onready() {}
    
    mode(type) {
        let req = new XMLHttpRequest();
        let self = this;
        req.onload = function() {
            parse(this.responseText);
            self.onready();
            console.log(data);
        };
        req.open('get', 'https://moomath.com/programs/0001/' + type + '.txt');
        req.send();
    }
    
    convert(v, a, b) {
        return v * data[a] / data[b];
    }
    
    load() {
        let req = new XMLHttpRequest();
        let self = this;
        req.onload = function() {
            console.log(this.responseText);
        };
        req.open('get', 'request/data.json');
        req.send();
    }
}

class Unit {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

let data = {};

/*
    This is for the .txt system (bad)
*/
function parse(file) {
    let names = [];
    let parts = file.split(':');
    parts[0].split('\n').forEach(function(line) {
        if (line !== '') {
            names.push(line.split(',')[0]);
        }
    });
    let n = -1;
    parts[1].split('\n').forEach(function(line) {
        if (n >= 0) {
            data[names[n]] = line;
        }
        n++;
    });
}