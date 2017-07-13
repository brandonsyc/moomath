/** This JS file controls all systems and logic behind the
entirely JavaScript-powered base-motif fractal generator at
nichodon.github.io/fractals/0003.

Written by anematode, July 7, 2017**/

// Canvas variables
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

// String maniuplation functions
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
    // Determines what happens when the mouse is pressed down on the base-motif canvas
    if (!(lastX < btransx || lastX > btransx + bwidth || lastY < btransy || lastY > btransy + bheight)) {
        // If the mouse is inside the base grid...
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

        // Get mouse position relative to canvas
        lastX = evt.offsetX || (evt.pageX - baseMotif.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - baseMotif.offsetTop);

        // Calculate corresponding coordinates
        bdragStartX = (lastX - btransx) / bwidth * (bxmax - bxmin) + bxmin;
        bdragStartY = (bheight - lastY + btransy) / bheight * (bymax - bymin) + bymin;

        // Temporarily save the coordinates
        tempbxmin = bxmin;
        tempbymin = bymin;
        tempbxmax = bxmax;
        tempbymax = bymax;
    }

    if (!(lastX < mtransx || lastX > mtransx + mwidth || lastY < mtransy || lastY > mtransy + mheight)) {
        // Same for motif grid
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

        lastX = evt.offsetX || (evt.pageX - baseMotif.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - baseMotif.offsetTop);

        mdragStartX = (lastX - mtransx) / mwidth * (mxmax - mxmin) + mxmin;
        mdragStartY = (mheight - lastY + mtransy) / mheight * (mymax - mymin) + mymin;

        tempmxmin = mxmin;
        tempmymin = mymin;
        tempmxmax = mxmax;
        tempmymax = mymax;
    }
},false);

baseMotif.addEventListener('mousemove',function(evt) {
    // Determines what happens when the mouse is moved on the base-motif canvas
    lastX = evt.offsetX || (evt.pageX - baseMotif.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - baseMotif.offsetTop);
    dragged = true;

    if (bdragStartX) {
        // If the mouse has a defined drag starting position, change the bounds of the base grid accordingly
        var dragEndX = (lastX - btransx) / bwidth * (tempbxmax - tempbxmin) + tempbxmin;
        var dragEndY = (bheight - lastY + btransy) / bheight * (tempbymax - tempbymin) + tempbymin;
        if (tempbxmin - dragEndX + bdragStartX < -1000 || tempbxmax - dragEndX + bdragStartX > 1000
          || tempbymin -  dragEndY + bdragStartY < -1000 || tempbymax - dragEndY + bdragStartY > 1000) {
            // If dragging will move the grid out of a 2000 x 2000 square centered at the origin, return
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
    // Reset the base grid zoom
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

function bLine(x1, y1, x2, y2) {
    // Draws a line between coords (x1, y1) and (x2, y2) on the base grid
    bMctx.strokeStyle = "#FF0000";
    bMctx.lineWidth = 2;

    // Define a clipping region around the base grid so that lines are not drawn outside the grid
    bMctx.save();
    bMctx.beginPath();
    bMctx.moveTo(btransx, btransy);
    bMctx.lineTo(btransx + bwidth, btransy);
    bMctx.lineTo(btransx + bwidth, btransy + bwidth);
    bMctx.lineTo(btransx, btransy + bwidth);
    bMctx.lineTo(btransx, btransy);
    bMctx.clip();

    bMctx.beginPath();
    bMctx.moveTo(bwidth * (x1 - bxmin) / (bxmax - bxmin) + btransx,
        bheight * (1 - (y1 - bymin) / (bymax - bymin)) + btransy);
    bMctx.lineTo(bwidth * (x2 - bxmin) / (bxmax - bxmin) + btransx,
        bheight * (1 - (y2 - bymin) / (bymax - bymin)) + btransy);
    bMctx.stroke();
    bMctx.lineWidth = 1;

    bMctx.restore();
    return;
}

function drawBaseGrid() {
    // Draws a grid on the base side of the base-motif canvas

    // Draw base title
    bMctx.textAlign = "left";
    bMctx.font = titleFont;
    bMctx.fillText("Base Curve",btransx+10,40);
    bMctx.font = axisFont;

    // Calculates separation between grid lines and width of view, to the nearest power of 10
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

            // Line styling and positioning logic; chooses density based on zoom width
            if (60 * separation < bymax - bymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (30 * separation < bymax - bymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < bymax - bymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1) - 1) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            }

        } else {
            bMctx.strokeStyle = thinLineColor;
        }

        // Draw vertical line with style settings
        bMctx.beginPath();
        bMctx.moveTo(xpos, btransy);
        bMctx.lineTo(xpos, bwidth + btransy);
        bMctx.stroke();

        if (addNumber) {
            // Draw a number on the x axis
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
            } else if (30 * separation < bxmax - bxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    bMctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < bxmax - bxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1) - 1) > 0.01) {
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

    // Draws the base pattern on the base grid
    for (i = 0; i < base.length - 1; i++) {
        var c = base[i];
        var d = base[i+1];
        bLine(c[0], c[1], d[0], d[1]);
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

function mLine(x1, y1, x2, y2) {
    // Draws a line between coords (x1, y1) and (x2, y2) on the base grid
    bMctx.strokeStyle = "#FF0000";
    bMctx.lineWidth = 2;

    bMctx.save();
    bMctx.beginPath();
    bMctx.moveTo(mtransx, mtransy);
    bMctx.lineTo(mtransx + mwidth, mtransy);
    bMctx.lineTo(mtransx + mwidth, mtransy + mwidth);
    bMctx.lineTo(mtransx, mtransy + mwidth);
    bMctx.lineTo(mtransx, mtransy);
    bMctx.clip();

    bMctx.beginPath();
    bMctx.moveTo(mwidth * (x1 - mxmin) / (mxmax - mxmin) + mtransx,
        mheight * (1 - (y1 - mymin) / (mymax - mymin)) + mtransy);
    bMctx.lineTo(mwidth * (x2 - mxmin) / (mxmax - mxmin) + mtransx,
        mheight * (1 - (y2 - mymin) / (mymax - mymin)) + mtransy);
    bMctx.stroke();
    bMctx.lineWidth = 1;

    bMctx.restore();
    return;
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

    for (i = 0; i < pattern.length - 1; i++) {
        var c = gPairs[i];
        var d = gPairs[i+1];
        mLine(c[0], c[1], d[0], d[1]);
    }
}

function redrawBM() {
    // Redraw entire BM canvas (clear canvas, draw base grid, draw motif grid)

    clearBMCanvas();
    drawBaseGrid();
    drawMotifGrid();
}

function updateBM() {
    // Updates the base-motif input as series of coordinates

    // Coordinates as raw input
    var baseCoords = document.getElementById("baseinput").value;
    var motifCoords = document.getElementById("motifinput").value;

    // Replace {}, [] with (); remove spaces, trim characters
    baseCoords = baseCoords.replace(/\[/g,'(').replace(/\{/g,'(').replace(/\]/g,')').replace(/\}/g,')').replace(/ /g,'').trim('(').trim(')');
    motifCoords = motifCoords.replace(/\[/g,'(').replace(/\{/g,'(').replace(/\]/g,')').replace(/\}/g,')').replace(/ /g,'').trim('(').trim(')');

    // Return list of pairs in the base
    var basePairs = baseCoords.split('),(');
    var valid = (basePairs.length != 1);

    var pairs = [];

    // Parse coordinates as 2-tuples of floats
    for (i = 0; i < basePairs.length; i++) {
        var bse = basePairs[i].split(',');
        try {
            var x = parseFloat(bse[0]);
            var y = parseFloat(bse[1]);
            if (!isNaN(x) && !isNaN(y)) {
                pairs.push([x,y]);
            } else {
                throw "";
            }
        } catch (e) {
            valid = false;
            break;
        }
    }

    if (!valid) {
        // Color the background of the input "salmon" to denote a bad input
        document.getElementById("baseinput").style.backgroundColor = "#FF9184";
    } else {
        document.getElementById("baseinput").style.backgroundColor = "#FFFFFF";
        base = pairs;
    }

    var motifPairs = motifCoords.split('),(');
    var valid = (motifPairs.length != 1);

    var pairs = [];

    // Stores the maximum distance between two consecutive pairs
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
                    // Keep track of maxMotifDis
                    maxMotifDis = pairDis;
                }
            }

            if (!isNaN(x) && !isNaN(y)) {
                pairs.push([x,y]);
            } else {
                throw "";
            }
        } catch (e) {
            valid = false;
            break;
        }
    }

    try {
        var totalDis = Math.hypot(pairs[pairs.length - 1][0] - pairs[0][0],
            pairs[pairs.length - 1][1] - pairs[0][1]);
    } catch (e) {;}

    if (maxMotifDis > 0.9 * totalDis && valid) {
        /** If the maximum motif distance is greater than 0.9 x totalDis,
        drawing it will take an unreasonable amount of time, so it is deemed invalid. **/
        document.getElementById("warningP").innerHTML = "The motif cannot contain a line segment longer than its size.";
        valid = false;

        gPairs = pairs;
    } else {
        document.getElementById("warningP").innerHTML = "&nbsp;";
    }

    if (!valid) {
        document.getElementById("motifinput").style.backgroundColor = "#FF9184";
    } else {
        document.getElementById("motifinput").style.backgroundColor = "#FFFFFF";

        // Rotate the given motif to start at (0,0) and end at (1,0), which is needed for the algorithm
        var npairs = [];
        var fpairs = [];

        for (i = 0; i < pairs.length; i++) {
            npairs.push([(pairs[i][0] - pairs[0][0])/totalDis, (pairs[i][1] - pairs[0][1])/totalDis]);
        }

        var angle = Math.atan2(npairs[npairs.length - 1][1], npairs[npairs.length - 1][0]);
        for (i = 0; i < npairs.length; i++) {
            fpairs.push(rotatePoint(npairs[i], -angle));
        }

        pattern = fpairs;
        gPairs = pairs;
    }

    redrawBM();
}

// Begin logic for main canvas

// User defined settings
var pattern = [[0,0],[0.5,0.5],[1,0]];
var base = [[-0.25,0],[0.25,0]];
var depthlimit = 25;
var fractalColor = "#333333";
var drawGridlines = true;
var drawAxes = true;
var gPairs = pattern;

// Last date of a pause in the recursion function
var lastPausalDate;
var recallFinished = true;
var gcSequence = [];
var startDate = new Date().getTime();
var stop = false;

function clearCanvas() {
    // Clears the central canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fLine(x1, y1, x2, y2) {
    // Draws a line between coords (x1, y1) and (x2, y2) on the central canvas
    ctx.beginPath();
    ctx.moveTo(fwidth * (x1 - fxmin) / (fxmax - fxmin), fheight * (1 - (y1 - fymin) / (fymax - fymin)));
    ctx.lineTo(fwidth * (x2 - fxmin) / (fxmax - fxmin), fheight * (1 - (y2 - fymin) / (fymax - fymin)));
    ctx.stroke();
    return;
}

function rotatePoint(a, angle) {
    // Rotates a point (x1, y1) by some angle in radians about the origin, counterclockwise
    var s = Math.sin(angle);
    var c = Math.cos(angle);
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

function fRecurse(depth, tpattern, callSequence) {
    // The central recursion function

    if (stop) return false;

    if (depth >= depthlimit) {
        // If the depth is sufficient, just draw the pattern and return
        for (var a = 0; a < tpattern.length - 1; a++) {
            var c = tpattern[a];
            var d = tpattern[a+1];
            fLine(c[0],c[1],d[0],d[1]);
        }
        return;
    }

    // Starting limit, in case it's a recall recursion
    var lim = 0;

    if (depth >= gcSequence.length-1) {
        recallFinished = true;
    }

    if (!recallFinished) {
        lim = gcSequence[depth];
    }

    for (a = lim; a < tpattern.length - 1; a++) {

        // For every consecutive pair c,d in the current pattern...
        var c = tpattern[a];
        var d = tpattern[a+1];

        // Distance between c and d
        var ds = Math.hypot(d[0] - c[0], d[1] - c[1]);

        // If the distance between c and d is sufficiently small, draw the line
        if (ds < (fxmax - fxmin) / canvas.width) {
            fLine(c[0], c[1], d[0], d[1]);
            continue;
        }

        ds *= 2;

        // If the pair is at least 2*ds units outside of the viewing field, continue to next pair
        if ((c[0] > fxmax + ds && d[0] > fxmax + ds)
          || (c[0] < fxmin - ds && d[0] < fxmin - ds)
          || (c[1] > fymax + ds && d[1] > fymax + ds)
          || (c[1] < fymin - ds && d[1] < fymin - ds)) {
            continue;
        }

        // Keep track of current call sequence
        var newCallSequence = callSequence.slice(0);
        newCallSequence.push(a);

        if (lastPausalDate + 30 < new Date().getTime()) {

            // setTimeout to do a recall into the recursion later
            setTimeout(function() {lastPausalDate = new Date().getTime();
              recallFinished = false;
              document.getElementById("progress").innerHTML = "Rendering Time: " + String(lastPausalDate - startDate) + " ms";
              gcSequence = callSequence.slice();
              fRecurse(0, base, []);}, 15);

            return false;
        }

        if (fRecurse(depth + 1, fitPattern(c, d), newCallSequence) === false) return false;
    }
}

// Variables for canvas size
var fxmin = -1;
var fxmax = 1;
var fymin = -1;
var fymax = 1;

// Variables for canvas displacement
var ftransx = 0;
var ftransy = 0;

var fwidth = 1024;
var fheight = 1024;

// Scroll fractal reupdate timeout
var sFRT = null;

function drawFractalGrid() {
    // Draws a grid on the fractal canvas

    var zoomMag = Math.floor(Math.log10(fxmax - fxmin))-1;
    var separation = Math.pow(10, zoomMag);

    for (i = Math.round10(fxmin, zoomMag) + separation; i < Math.round10(fxmax, zoomMag) - separation/2; i += separation) {
        // Vertical lines
        var xpos = Math.round(fwidth * (i - fxmin) / (fxmax - fxmin)) + ftransx + 0.5;
        var addNumber = false;

        ctx.lineWidth = 1;

        if (Math.abs(i) < separation/100.0) {
            ctx.strokeStyle = axesColor;
            ctx.lineWidth = 2;

            // If drawing axes is turned off, draw it as a normal line if drawGridlines is true, or do nothing if it is false
            if (!drawAxes) {
                if (!drawGridlines) continue;
                ctx.strokeStyle = thickLineColor;

                ctx.beginPath();
                ctx.moveTo(xpos, ftransy);
                ctx.lineTo(xpos, fwidth + ftransy);
                ctx.stroke();

                continue;
            }

        } else if (Math.abs(Math.round10(i, zoomMag) - i) < separation/100.0) {

            if (!drawGridlines) continue;
            ctx.strokeStyle = thickLineColor;
            addNumber = true;

            if (60 * separation < fymax - fymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    ctx.strokeStyle = thinLineColor;
                }
            } else if (30 * separation < fymax - fymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    ctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < fymax - fymin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1)-1) > 0.01) {
                    addNumber = false;
                    ctx.strokeStyle = thinLineColor;
                }
            }

        } else {
            ctx.strokeStyle = thinLineColor;
        }

        ctx.beginPath();
        ctx.moveTo(xpos, ftransy);
        ctx.lineTo(xpos, fwidth + ftransy);
        ctx.stroke();

        if (addNumber && drawAxes) {
            // Only draw numbers if drawAxes is true
            var addNumberYPos = fheight - fheight * (-fymin) / (fymax - fymin) + ftransy;
            if (addNumberYPos < fheight + ftransy && addNumberYPos > ftransy) {
                var text = String(Math.round10(i, zoomMag));
                ctx.textAlign = "right";
                ctx.fillText(text, xpos - 3, addNumberYPos + 14);
            }
        }
    }

    for (i = Math.round10(fymin, zoomMag) + separation; i < Math.round10(fymax, zoomMag) - separation/2; i += separation) {
        // Horizontal lines
        var ypos = Math.round10(fheight - fheight * (i - fymin) / (fymax - fymin)) + ftransy + 0.5;
        var addNumber = false;

        ctx.lineWidth = 1;

        if (Math.abs(i) < separation/100.0) {
            ctx.strokeStyle = axesColor;
            ctx.lineWidth = 2;

            if (!drawAxes) {
                if (!drawGridlines) continue;
                ctx.strokeStyle = thickLineColor;

                ctx.beginPath();
                ctx.moveTo(ftransx, ypos);
                ctx.lineTo(ftransx + fwidth, ypos);
                ctx.stroke();

                continue;
            }

        } else if (Math.abs(Math.round10(i, zoomMag) - i) < separation/100.0) {

            if (!drawGridlines) continue;
            ctx.strokeStyle = thickLineColor;
            addNumber = true;
            if (60 * separation < fxmax - fxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 10 - 5) - 5) > 0.01) {
                    addNumber = false;
                    ctx.strokeStyle = thinLineColor;
                }
            } else if (30 * separation < fxmax - fxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 5 - 2.5) - 2.5) > 0.01) {
                    addNumber = false;
                    ctx.strokeStyle = thinLineColor;
                }
            } else if (10 * separation < fxmax - fxmin) {
                if (Math.abs(Math.abs((Math.round10(Math.abs(i), zoomMag) / separation) % 2 - 1)-1) > 0.01) {
                    addNumber = false;
                    ctx.strokeStyle = thinLineColor;
                }
            }
        } else {
            ctx.strokeStyle = thinLineColor;
        }

        ctx.beginPath();
        ctx.moveTo(ftransx, ypos);
        ctx.lineTo(ftransx + fwidth, ypos);
        ctx.stroke();

        if (addNumber && drawAxes) {
            var addNumberXPos = fwidth * (-fxmin) / (fxmax - fxmin) + ftransx;
            if (addNumberXPos < fwidth + ftransx && addNumberXPos > ftransx) {
                var text = String(Math.round10(i, zoomMag));
                ctx.textAlign = "right";
                ctx.fillText(text, addNumberXPos - 3, ypos + 14);
            }
        }
    }
}

function drawFractal() {
    // Draw the fractal
    stop = true;
    recallFinished = true;
    clearCanvas();

    // Update the lastPausalDate so it does not unnecessarily pause immediately
    lastPausalDate = new Date().getTime();
    drawFractalGrid();

    // Asynchronously call fRecurse so that other processes can run for the period of cancelling time
    setTimeout(function() {stop = false; ctx.strokeStyle = fractalColor; startDate = new Date().getTime(); fRecurse(0, base, [], false);}, 40);

}

function resetFZoom() {
    // Reset the fractal zoom
    fxmin = -1;
    fxmax = 1;
    fymin = -1;
    fymax = 1;

    drawFractal();
}

function fZoom(x, y, delta, evt) {
    // Update zoom on fractal curve graph
    evt.preventDefault();
    if (((fxmin < -1000 || fxmax > 1000 || fymin < -1000 || fymax > 1000)
      && (delta > 0)) || ((fxmax - fxmin < 0.001) && (delta < 0))) {
        // Return if zoom will go out of bounds
        return;
    }
    if (x < ftransx || x > ftransx + fwidth || y < ftransy || y > ftransy + fheight) {
        // Return if cursor is outside of graph
        return;
    }
    // Prevent the event from scrolling the page

    // Calculate new bounds
    var trueX = (x - ftransx) / fwidth * (fxmax - fxmin) + fxmin;
    var trueY = (fheight - y + ftransy) / fheight * (fymax - fymin) + fymin;

    fxmin = Math.pow(zoomrate, delta) * (fxmin - trueX) + trueX;
    fxmax = Math.pow(zoomrate, delta) * (fxmax - trueX) + trueX;
    fymin = Math.pow(zoomrate, delta) * (fymin - trueY) + trueY;
    fymax = Math.pow(zoomrate, delta) * (fymax - trueY) + trueY;
}

// Variables for keeping track of dragging on the fractal canvas
var fdragStartX,fdragStartY,tempfxmin,tempfymin,tempfxmax,tempfymax;
var flastX = 512;
var flastY = 512;

canvas.addEventListener('mousedown',function(evt) {
    if (!(flastX < ftransx || flastX > ftransx + fwidth || flastY < ftransy || flastY > ftransy + fheight)) {

        // Try to clear out the sFRT timeout so the fractal doesn't draw while we're dragging
        try {clearTimeout(sFRT);} catch (e) {;}

        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        fdragStartX = (flastX - ftransx) / fwidth * (fxmax - fxmin) + fxmin;
        fdragStartY = (fheight - flastY + ftransy) / fheight * (fymax - fymin) + fymin;

        tempfxmin = fxmin;
        tempfymin = fymin;
        tempfxmax = fxmax;
        tempfymax = fymax;
    }
},false);

canvas.addEventListener('mousemove',function(evt) {
    flastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    flastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

    if (fdragStartX) {
        try {clearTimeout(sFRT);} catch (e) {;}

        var dragEndX = (flastX - ftransx) / fwidth * (tempfxmax - tempfxmin) + tempfxmin;
        var dragEndY = (fheight - flastY + ftransy) / fheight * (tempfymax - tempfymin) + tempfymin;

        if (tempfxmin - dragEndX + fdragStartX < -1000 || tempfxmax - dragEndX + fdragStartX > 1000
          || tempfymin - dragEndY + fdragStartY < -1000 || tempfymax - dragEndY + fdragStartY > 1000) {
            return;
        }

        fxmin = (tempfxmin - dragEndX + fdragStartX);
        fymin = (tempfymin - dragEndY + fdragStartY);
        fxmax = (tempfxmax - dragEndX + fdragStartX);
        fymax = (tempfymax - dragEndY + fdragStartY);

        clearCanvas();
        drawFractalGrid();
    }
},false);

canvas.addEventListener('mouseup',function(evt) {
    // Stop dragging if mouse is up

    fdragStartX = null;
    fdragStartY = null;

    drawFractal();

},false);

canvas.onwheel = function(evt) {
    // Ran when scrolling

    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    if (delta) {
        fZoom(evt.offsetX, evt.offsetY, delta, evt);

        if (depthlimit < 6) {
            // If the curve complexity is sufficiently small, draw the fractal live
            drawFractal();
        } else {
            clearCanvas();
            drawFractalGrid();
            try {
                // Try to cancel previous sFRT timeouts, so the fractal only draws some time after scrolling stops
                clearTimeout(sFRT);
            } catch (e) {
                ;
            }
            // Set the sFRT timeout
            sFRT = setTimeout(drawFractal, depthlimit * 10);
        }
    }
};

function updateIterations() {
    // Update the number of iterations (depthlimit) drawn on the canvas
    depthlimit = document.getElementById("iterations").value;

    drawFractal();
}

function updateColor() {
    // Update the color of the fractal, given as a hex value
    var color = document.getElementById("color").value.replace(/ /g,'');

    // Tests if the color is a valid hex color
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) {
        fractalColor = color;
        document.getElementById("color").style.backgroundColor = "#FFFFFF";
    } else {
        document.getElementById("color").style.backgroundColor = "#FF9184";
    }

    try {
        // This is the same timeout system as canvas.onwheel
        clearTimeout(sFRT);
    } catch (e) {
        ;
    }
    sFRT = setTimeout(drawFractal, 500);
}

function updateDrawGrid() {
    // Update whether to draw the grid on the fractal canvas
    drawGridlines = document.getElementById("drawGrid").checked;

    drawFractal();
}

function updateDrawAxes() {
    // Update whether the draw the axes on the fractal canvas
    drawAxes = document.getElementById("drawAxes").checked;

    drawFractal();
}

function stopDrawing() {
    stop = true;
}

window.onload = function() {
    // Draw the fractal and grids as soon as the window loads

    drawFractal();
    drawBaseGrid();
    drawMotifGrid();
}
