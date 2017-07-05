
var canvas = document.getElementById("cesaro");
canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.transform = "translate(-50%, -25%)";
var ctx = canvas.getContext('2d');

var width = canvas.width;
var height = canvas.height;

var xmin = -1;
var xmax = 2;
var ymin = -1;
var ymax = 2;

var pattern = [[0,0],[0.5,0.5],[1,0]];
var depthlimit = 30;

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(canvas.width * (x1 - xmin) / (xmax - xmin), canvas.height * (1 - (y1 - ymin) / (ymax - ymin)));
    ctx.lineTo(canvas.width * (x2 - xmin) / (xmax - xmin), canvas.height * (1 - (y2 - ymin) / (ymax - ymin)));
    ctx.stroke();
    return;
}

function rotatePoint(a, angle) {
    s = Math.sin(angle);
    c = Math.cos(angle);
    return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
}

function fitPattern(a, b) {
    var retPattern = [];
    var angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
    var d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (w = 0; w < pattern.length; w++) {
        var c = pattern[w];
        var k = rotatePoint(c, angle);
        retPattern.push([k[0] * d + a[0], k[1] * d + a[1]]);
    }
    return retPattern;
}

function recurse(depth, tpattern) {
    if (depth >= depthlimit) {
        for (var a = 0; a < tpattern.length - 1; a++) {
            var c = tpattern[a];
            var d = tpattern[a+1];
            line(c[0],c[1],d[0],d[1]);
        }
        return;
    }
    for (var a = 0; a < tpattern.length - 1; a++) {
        var c = tpattern[a];
        var d = tpattern[a+1];

        if (Math.hypot(d[0] - c[0], d[1] - c[1]) < 2 * (xmax - xmin) / canvas.width) {
            line(c[0], c[1], d[0], d[1]);
            continue;
        }
        recurse(depth + 1, fitPattern(c, d));
    }
}

console.log(new Date().getTime());
recurse(0, [[0,0],[1,0]]);
console.log(new Date().getTime());
