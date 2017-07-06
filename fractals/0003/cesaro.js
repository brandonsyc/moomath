
var canvas = document.getElementById("cesaro");
canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.transform = "translate(-50%, 0)";
var ctx = canvas.getContext('2d');

var baseMotif = document.getElementById("base-motif");
var bMctx = baseMotif.getContext('2d');

// Vars for dimensions of base canvas
var bxmin = -1;
var bxmax = 1;
var bymin = -1;
var bymax = 1;

// Vars for position of base canvas
var bwidth = 450;
var bheight = 450;
var btransx = 0;
var btransy = 512 - 450;

// Vars for dimensions of motif canvas
var mxmin = -1;
var mxmax = 1;
var mymin = -1;
var mymax = 1;

// Vars for position of motif canvas
var mwidth = 450;
var mheight = 450;
var mtransx = 512;
var mtransy = 512 - 450;

// Styles for the grid
var axesColor = "rgba(0,0,0,1)";
var thickLineColor = "rgba(0,0,0,0.5)";
var thinLineColor = "rgba(0,0,0,0.2)";

// Zoom rate
var zoomrate = 1.04;

// Styles
var titleFont = "20px Cambria";
var axisFont = "14px Cambria";

// Various rounding functions
function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // If the value is negative...
    if (value < 0) {
        return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

function isNormalInteger(str) {
    // Tests if str is a positive integer
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

// Decimal round
if (!Math.round10) {
    Math.round10 = function(value, exp) {
        return decimalAdjust('round', value, exp);
    };
}
// Decimal floor
if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
        return decimalAdjust('floor', value, exp);
    };
}
// Decimal ceil
if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
        return decimalAdjust('ceil', value, exp);
    };
}

String.prototype.trimLeft = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return this.replace(new RegExp("^[" + charlist + "]+"), "");
};

String.prototype.trimRight = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.trim = function(charlist) {
    return this.trimLeft(charlist).trimRight(charlist);
};

// Begin logic for the canvas containing the base and motif

function clearBMCanvas() {
    // Clears the BM canvas
    bMctx.clearRect(0, 0, baseMotif.width, baseMotif.height);
}

// Stores the last position of the mouse
var lastX = 450;
var lastY = 450;

baseMotif.onwheel = function(evt) {
    // Ran when scrolling

    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    if (delta) {
        bZoom(evt.offsetX, evt.offsetY, delta, evt);
        mZoom(evt.offsetX, evt.offsetY, delta, evt);
    }

    redrawBM();
};

// Logic for dragging the mouse (translating)

var bdragStartX,bdragStartY,tempbxmin,tempbymin,tempbxmax,tempbymax;
var mdragStartX,mdragStartY,tempmxmin,tempmymin,tempmxmax,tempmymax;

baseMotif.addEventListener('mousedown',function(evt) {
    if (!(lastX < btransx || lastX > btransx + bwidth || lastY < btransy || lastY > btransy + height)) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - baseMotif.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - baseMotif.offsetTop);
        bdragStartX = (lastX - btransx) / bwidth * (bxmax - bxmin) + bxmin;
        bdragStartY = (bheight - lastY + btransy) / bheight * (bymax - bymin) + bymin;
        tempbxmin = bxmin;
        tempbymin = bymin;
        tempbxmax = bxmax;
        tempbymax = bymax;
        dragged = false;
    }
    if (!(lastX < mtransx || lastX > mtransx + mwidth || lastY < mtransy || lastY > mtransy + height)) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - baseMotif.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - baseMotif.offsetTop);
        mdragStartX = (lastX - mtransx) / mwidth * (mxmax - mxmin) + mxmin;
        mdragStartY = (mheight - lastY + mtransy) / mheight * (mymax - mymin) + mymin;
        tempmxmin = mxmin;
        tempmymin = mymin;
        tempmxmax = mxmax;
        tempmymax = mymax;
        dragged = false;
    }
},false);

baseMotif.addEventListener('mousemove',function(evt) {
    lastX = evt.offsetX || (evt.pageX - baseMotif.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - baseMotif.offsetTop);
    dragged = true;
    if (bdragStartX) {
        var dragEndX = (lastX - btransx) / bwidth * (tempbxmax - tempbxmin) + tempbxmin;
        var dragEndY = (bheight - lastY + btransy) / bheight * (tempbymax - tempbymin) + tempbymin;
        if (tempbxmin - dragEndX + bdragStartX < -1000 || tempbxmax - dragEndX + bdragStartX > 1000
          || tempbymin -  dragEndY + bdragStartY < -1000 || tempbymax - dragEndY + bdragStartY > 1000) {
            return;
        }
        bxmin = (tempbxmin - dragEndX + bdragStartX);
        bymin = (tempbymin - dragEndY + bdragStartY);
        bxmax = (tempbxmax - dragEndX + bdragStartX);
        bymax = (tempbymax - dragEndY + bdragStartY);
    }

    if (mdragStartX) {
        var dragEndX = (lastX - mtransx) / mwidth * (tempmxmax - tempmxmin) + tempmxmin;
        var dragEndY = (mheight - lastY + mtransy) / mheight * (tempmymax - tempmymin) + tempmymin;
        if (tempmxmin - dragEndX + mdragStartX < -1000 || tempmxmax - dragEndX + mdragStartX > 1000
          || tempmymin -  dragEndY + mdragStartY < -1000 || tempmymax - dragEndY + mdragStartY > 1000) {
            return;
        }
        mxmin = (tempmxmin - dragEndX + mdragStartX);
        mymin = (tempmymin - dragEndY + mdragStartY);
        mxmax = (tempmxmax - dragEndX + mdragStartX);
        mymax = (tempmymax - dragEndY + mdragStartY);
    }

    redrawBM();
},false);

baseMotif.addEventListener('mouseup',function(evt) {
    // Stop dragging if mouse is up

    bdragStartX = null;
    bdragStartY = null;
    mdragStartX = null;
    mdragStartY = null;

},false);

function resetBZoom() {
    // Reset the base zoom
    bxmin = -1;
    bxmax = 1;
    bymin = -1;
    bymax = 1;

    redrawBM();
}

function bZoom(x, y, delta, evt) {
    // Update zoom on base curve graph
    if (((bxmin < -1000 || bxmax > 1000 || bymin < -1000 || bymax > 1000)
      && (delta > 0)) || ((bxmax - bxmin < 0.001) && (delta < 0))) {
        // Return if zoom will go out of bounds
        return;
    }
    if (x < btransx || x > btransx + bwidth || y < btransy || y > btransy + bheight) {
        // Return if cursor is outside of graph
        return;
    }
    // Prevent the event from scrolling the page
    evt.preventDefault();

    // Calculate new bounds
    var trueX = (x - btransx) / bwidth * (bxmax - bxmin) + bxmin;
    var trueY = (bheight - y + btransy) / bheight * (bymax - bymin) + bymin;

    bxmin = Math.pow(zoomrate, delta) * (bxmin - trueX) + trueX;
    bxmax = Math.pow(zoomrate, delta) * (bxmax - trueX) + trueX;
    bymin = Math.pow(zoomrate, delta) * (bymin - trueY) + trueY;
    bymax = Math.pow(zoomrate, delta) * (bymax - trueY) + trueY;
}

function drawBaseGrid() {
    // Draws a grid on the base side of the base-motif canvas

    // Draw base title
    bMctx.textAlign = "left";
    bMctx.font = titleFont;
    bMctx.fillText("Base Curve",btransx+10,40);
    bMctx.font = axisFont;


    var zoomMag = Math.floor(Math.log10(bxmax - bxmin))-1;
    var separation = Math.pow(10, zoomMag);

    for (i = Math.round10(bxmin, zoomMag) + separation; i < Math.round10(bxmax, zoomMag) - separation/2; i += separation) {
        // Vertical lines
        var xpos = Math.round(mwidth * (i - bxmin) / (bxmax - bxmin)) + btransx + 0.5;
        var addNumber = false;

        bMctx.lineWidth = 1;

        if (Math.abs(i) < separation/100.0) {
            bMctx.strokeStyle = axesColor;
            bMctx.lineWidth = 2;
        } else if (Math.abs(Math.round10(i, zoomMag) - i) < separation/100.0) {
            bMctx.strokeStyle = thickLineColor;
            addNumber = true;

            // Line styling logic
            if (60 * separation < bymax - bymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }
            if (30 * separation < bymax - bymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < bymax - bymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1)-1) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }

        } else {
            bMctx.strokeStyle = thinLineColor;
        }

        bMctx.beginPath();
        bMctx.moveTo(xpos, btransy);
        bMctx.lineTo(xpos, bwidth + btransy);
        bMctx.stroke();

        if (addNumber) {
            // Draw the numbers
            var addNumberYPos = bheight - bheight * (-bymin) / (bymax - bymin) + btransy;
            if (addNumberYPos < bheight + btransy && addNumberYPos > btransy) {
                var text = String(Math.round10(i, zoomMag));
                bMctx.textAlign = "right";
                bMctx.fillText(text, xpos - 3, addNumberYPos + 14);
            }
        }
    }

    for (i = Math.round10(bymin, zoomMag) + separation; i < Math.round10(bymax, zoomMag) - separation/2; i += separation) {
        // Horizontal lines
        var ypos = Math.round10(bheight - bheight * (i - bymin) / (bymax - bymin)) + btransy + 0.5;
        var addNumber = false;

        bMctx.lineWidth = 1;

        if (Math.abs(i) < separation/100.0) {
            bMctx.strokeStyle = axesColor;
            bMctx.lineWidth = 2;
        } else if (Math.abs(Math.round10(i, zoomMag) - i) < separation/100.0) {
            bMctx.strokeStyle = thickLineColor;
            addNumber = true;
            if (60 * separation < bxmax - bxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }
            if (30 * separation < bxmax - bxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < bxmax - bxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1)-1) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }
        } else {
            bMctx.strokeStyle = thinLineColor;
        }

        bMctx.beginPath();
        bMctx.moveTo(btransx, ypos);
        bMctx.lineTo(btransx + bwidth, ypos);
        bMctx.stroke();

        if (addNumber) {
            var addNumberXPos = bwidth * (-bxmin) / (bxmax - bxmin) + btransx;
            if (addNumberXPos < bwidth + btransx && addNumberXPos > btransx) {
                var text = String(Math.round10(i, zoomMag));
                bMctx.textAlign = "right";
                bMctx.fillText(text, addNumberXPos - 3, ypos + 14);
            }
        }
    }
}

function resetMZoom() {
    // Resets motif grid

    mxmin = -1;
    mxmax = 1;
    mymin = -1;
    mymax = 1;

    redrawBM();
}

function mZoom(x, y, delta, evt) {
    // Update zoom for motif graph
    if (((mxmin < -1000 || mxmax > 1000 || mymin < -1000 || mymax > 1000) &&
      (delta > 0)) || ((mxmax - mxmin < 0.001) && (delta < 0))) {
        return;
    }
    if (x < mtransx || x > mtransx + mwidth || y < mtransy || y > mtransy + mheight) {
        return;
    }

    evt.preventDefault();

    var trueX = (x - mtransx) / mwidth * (mxmax - mxmin) + mxmin;
    var trueY = (mheight - y + mtransy) / mheight * (mymax - mymin) + mymin;

    mxmin = Math.pow(zoomrate, delta) * (mxmin - trueX) + trueX;
    mxmax = Math.pow(zoomrate, delta) * (mxmax - trueX) + trueX;
    mymin = Math.pow(zoomrate, delta) * (mymin - trueY) + trueY;
    mymax = Math.pow(zoomrate, delta) * (mymax - trueY) + trueY;
}

function drawMotifGrid() {
    // Draws a grid on the motif side of the base-motif canvas

    bMctx.textAlign = "left";
    bMctx.font = titleFont;
    bMctx.fillText("Motif",mtransx+10,40);
    bMctx.font = axisFont;

    var zoomMag = Math.floor(Math.log10(mxmax - mxmin))-1;
    var separation = Math.pow(10, zoomMag);

    for (i = Math.round10(mxmin, zoomMag) + separation; i < Math.round10(mxmax, zoomMag) - separation/2; i += separation) {
        // Vertical lines
        var xpos = Math.round(mwidth * (i - mxmin) / (mxmax - mxmin)) + mtransx + 0.5;
        var addNumber = false;

        bMctx.lineWidth = 1;

        if (Math.abs(i) < separation/100.0) {
            bMctx.strokeStyle = axesColor;
            bMctx.lineWidth = 2;
        } else if (Math.abs(Math.round10(i, zoomMag) - i) < separation/100.0) {
            bMctx.strokeStyle = thickLineColor;
            addNumber = true;

            if (60 * separation < mymax - mymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }
            if (30 * separation < mymax - mymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < mymax - mymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1)-1) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }

        } else {
            bMctx.strokeStyle = thinLineColor;
        }

        bMctx.beginPath();
        bMctx.moveTo(xpos, mtransy);
        bMctx.lineTo(xpos, mwidth + mtransy);
        bMctx.stroke();

        if (addNumber) {
            var addNumberYPos = mheight - mheight * (-mymin) / (mymax - mymin) + mtransy;
            if (addNumberYPos < mheight + mtransy && addNumberYPos > mtransy) {
                var text = String(Math.round10(i, zoomMag));
                bMctx.textAlign = "right";
                bMctx.fillText(text, xpos - 3, addNumberYPos + 14);
            }
        }
    }

    for (i = Math.round10(mymin, zoomMag) + separation; i < Math.round10(mymax, zoomMag) - separation/2; i += separation) {
        // Horizontal lines
        var ypos = Math.round10(mheight - mheight * (i - mymin) / (mymax - mymin)) + mtransy + 0.5;
        var addNumber = false;

        bMctx.lineWidth = 1;

        if (Math.abs(i) < separation/100.0) {
            bMctx.strokeStyle = axesColor;
            bMctx.lineWidth = 2;
        } else if (Math.abs(Math.round10(i, zoomMag) - i) < separation/100.0) {
            bMctx.strokeStyle = thickLineColor;
            addNumber = true;
            if (60 * separation < mxmax - mxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }
            if (30 * separation < mxmax - mxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < mxmax - mxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1)-1) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }
        } else {
            bMctx.strokeStyle = thinLineColor;
        }

        bMctx.beginPath();
        bMctx.moveTo(mtransx, ypos);
        bMctx.lineTo(mtransx + mwidth, ypos);
        bMctx.stroke();

        if (addNumber) {
            var addNumberXPos = mwidth * (-mxmin) / (mxmax - mxmin) + mtransx;
            if (addNumberXPos < mwidth + mtransx && addNumberXPos > mtransx) {
                var text = String(Math.round10(i, zoomMag));
                bMctx.textAlign = "right";
                bMctx.fillText(text, addNumberXPos - 3, ypos + 14);
            }
        }
    }
}

function redrawBM() {
    // Redraw entire BM canvas

    clearBMCanvas();
    drawBaseGrid();
    drawMotifGrid();
}

function updateBM() {
    var baseCoords = document.getElementById("baseinput").value;
    var motifCoords = document.getElementById("motifinput").value;

    baseCoords = baseCoords.replace(/\[/g,'(').replace(/\{/g,'(').replace(/\]/g,')').replace(/\}/g,')').replace(/ /g,'').trim('(').trim(')');
    motifCoords = motifCoords.replace(/\[/g,'(').replace(/\{/g,'(').replace(/\]/g,')').replace(/\}/g,')').replace(/ /g,'').trim('(').trim(')');

    var basePairs = baseCoords.split('),(');
    var valid = (basePairs.length != 1);

    var pairs = [];

    for (i = 0; i < basePairs.length; i++) {
        base = basePairs[i].split(',');
        try {
            var x = parseFloat(base[0]);
            var y = parseFloat(base[1]);
            if (!isNaN(x) && !isNaN(y)) {
                pairs.push([x,y]);
            } else {
                throw "back thursday";
            }
        } catch (e) {
            valid = false;
            break;
        }
    }

    if (!valid) {
        document.getElementById("baseinput").style.backgroundColor = "#FF9184";
    } else {
        document.getElementById("baseinput").style.backgroundColor = "#FFFFFF";
        base = pairs;
    }

    var motifPairs = motifCoords.split('),(');
    var valid = (motifPairs.length != 1);

    var pairs = [];

    var maxMotifDis = 0;

    for (i = 0; i < motifPairs.length; i++) {
        motif = motifPairs[i].split(',');
        try {
            var x = parseFloat(motif[0]);
            var y = parseFloat(motif[1]);

            if (pairs.length != 0) {
                var prevPair = pairs[pairs.length-1];
                var pairDis = Math.hypot(prevPair[0] - x, prevPair[1] - y);
                if (pairDis > maxMotifDis) {
                    maxMotifDis = pairDis;
                }
            }

            if (!isNaN(x) && !isNaN(y)) {
                pairs.push([x,y]);
            } else {
                throw "the udders";
            }
        } catch (e) {
            valid = false;
            break;
        }
    }
    try {
        var totalDis = Math.hypot(pairs[pairs.length-1][0]-pairs[0][0],pairs[pairs.length-1][1]-pairs[0][1]);
    } catch (e) {}
    if (maxMotifDis > 0.9 * totalDis) {
        valid = false;
    }

    if (!valid) {
        document.getElementById("motifinput").style.backgroundColor = "#FF9184";
    } else {
        document.getElementById("motifinput").style.backgroundColor = "#FFFFFF";
        pattern = pairs;
    }

}

// End baseMotif Logic

var width = canvas.width;
var height = canvas.height;

var xmin = -1;
var xmax = 2;
var ymin = -1;
var ymax = 2;

var pattern = [[0,0],[0.5,0.5],[1,0]];
var base = [[0,0],[1,0]];
var depthlimit = 30;

var lastPausalDate;
var stop = false;

function clearCanvas() {
    // Clears the central canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function line(x1, y1, x2, y2) {
    // Draws a line between coords (x1, y1) and (x2, y2) on the central canvas
    ctx.beginPath();
    ctx.moveTo(canvas.width * (x1 - xmin) / (xmax - xmin), canvas.height * (1 - (y1 - ymin) / (ymax - ymin)));
    ctx.lineTo(canvas.width * (x2 - xmin) / (xmax - xmin), canvas.height * (1 - (y2 - ymin) / (ymax - ymin)));
    ctx.stroke();
    return;
}

function rotatePoint(a, angle) {
    // Rotates a point (x1, y1) by some angle in radians about the origin, counterclockwise
    s = Math.sin(angle);
    c = Math.cos(angle);
    return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
}

function fitPattern(a, b) {
    // Rotates the motif to fit between two points
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
    // The central recursion function
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

function drawFractal() {
    lastPausalDate = new Date().getTime();
    stop = false;
    clearCanvas();
    setTimeout(recurse(0, base),0);
}

function stopComputation() {
    stop = true;
}

drawFractal();

drawBaseGrid();
drawMotifGrid();
