// Try changing these!

var dotSize = 1;
var dotDensity = 25;

var rootFunc = function(x,y) {
	return x*x + y*y - 0.5;
}

// These are a little more finnicky

var grapherCanvas = document.getElementById('grapher');
var grapherCtx = grapherCanvas.getContext('2d');

var xmin = -1;
var xmax = 1;
var ymin = -1;
var ymax = 1;

var canvasWidth = 640;
var canvasHeight = 640;

var xDotSeparate = (xmax-xmin) / dotDensity;
var yDotSeparate = (ymax-ymin) / dotDensity;

var derivativeSize = 0.00000005;

var pointIndex = 0;

var pointsX = new Float32Array(dotDensity * dotDensity);
var pointsY = new Float32Array(dotDensity * dotDensity);

var autoRegenerate = false;

function convertPointX(x) {
	return (x - xmin) / (xmax - xmin) * canvasWidth;
}

function convertPointY(y) {
	return (1 - (y - ymin) / (ymax - ymin)) * canvasHeight;
}

function drawCanvasPoint(x,y) {
	grapherCtx.beginPath();
	grapherCtx.arc(x,y,dotSize,0,2*Math.PI);
	grapherCtx.stroke();
}

function drawPoint(x,y) {
	drawCanvasPoint(convertPointX(x),convertPointY(y));
}

function clearCanvas() {
	grapherCtx.clearRect(0,0,canvasWidth,canvasHeight);
}

function iteratePoints() {
	var pointX = 0;
  var pointY = 0;

  var pointValue = 0;
  var nPointValue = 0;
  var nPointX = 0;

  var axisMax = 0;
  var axisID = 0;
  var axisVal = 0;

  var pX = 0;
  var pY = 0;
  var nX = 0;
  var nY = 0;

	for (i = 0; i < pointIndex; i++) {
  	pointX = pointsX[i];
    pointY = pointsY[i];

    pointValue = rootFunc(pointX,pointY);
		if (pointValue === false) {
			pointsX[i] = udderFactor * ((Math.random() * (xmax - xmin)) + xmin);
			pointsY[i] = udderFactor * ((Math.random() * (ymax - ymin)) + ymin);
			continue;
		}
		if (Math.abs(pointValue) < 1e-5) continue;

    axisMax = 0;

    nPointValue = rootFunc(pointX + derivativeSize, pointY);
		if (nPointValue !== false) {
	    nPointX = -Math.sign(nPointValue) * (nPointValue - pointValue) / derivativeSize;
	    if (nPointX > axisMax) {
	    	axisMax = nPointX;
	      axisID = 0;
	      axisVal = nPointValue;
	    }
		}

		nPointValue = rootFunc(pointX - derivativeSize, pointY);
		if (nPointValue !== false) {
	    nPointX = -Math.sign(nPointValue) * (nPointValue - pointValue) / derivativeSize;
	    if (nPointX > axisMax) {
	    	axisMax = nPointX;
	      axisID = 1;
	      axisVal = nPointValue;
	    }
		}

		nPointValue = rootFunc(pointX, pointY + derivativeSize);
		if (nPointValue !== false) {
	    nPointX = -Math.sign(nPointValue) * (nPointValue - pointValue) / derivativeSize;
	    if (nPointX > axisMax) {
	    	axisMax = nPointX;
	      axisID = 2;
	      axisVal = nPointValue;
	    }
		}

		nPointValue = rootFunc(pointX, pointY - derivativeSize);
		if (nPointValue !== false) {
	    nPointX = -Math.sign(nPointValue) * (nPointValue - pointValue) / derivativeSize;
	    if (nPointX > axisMax) {
	    	axisMax = nPointX;
	      axisID = 3;
	      axisVal = nPointValue;
	    }
		}

    switch (axisID) {
    	case 0: pointsX[i] = pointX + pointValue / (pointValue - axisVal) * derivativeSize; break;
      case 1: pointsX[i] = pointX - pointValue / (pointValue - axisVal) * derivativeSize; break;
      case 2: pointsY[i] = pointY + pointValue / (pointValue - axisVal) * derivativeSize; break;
      case 3: pointsY[i] = pointY - pointValue / (pointValue - axisVal) * derivativeSize; break;
    }
    //console.log(pointX,pointY,pointValue,pX,nX,pY,nY);
    //console.log(pointX,pointY,pointValue,axisID);
  }
}

var udderFactor = 1.5;

function regeneratePoints() {
	autoRegenerate = false;

	pointIndex = 0;
	for (count = 0; count < dotDensity * dotDensity; count++) {
		var i = udderFactor * ((Math.random() * (xmax - xmin)) + xmin);
		var j = udderFactor * ((Math.random() * (ymax - ymin)) + ymin);

	  pointsX[pointIndex] = i;
	  pointsY[pointIndex] = j;
		drawPoint(i,j);

	  pointIndex += 1;
	}
}

function drawPoints() {
	if (autoRegenerate) {
		regeneratePoints();
	}
	clearCanvas();
	for (i = 0; i < pointIndex; i++) {
		drawPoint(pointsX[i],pointsY[i]);
	}
}

var caretReplace = function(_s) {
    if (_s.indexOf("^") > -1) {
        var tab = [];
        var powfunc="Math.pow";
        var joker = "___joker___";
        while (_s.indexOf("(") > -1) {
            _s = _s.replace(/(\([^\(\)]*\))/g, function(m, t) {
                tab.push(t);
                return (joker + (tab.length - 1));
            });
        }

        tab.push(_s);
        _s = joker + (tab.length - 1);
        while (_s.indexOf(joker) > -1) {
            _s = _s.replace(new RegExp(joker + "(\\d+)", "g"), function(m, d) {
                return tab[d].replace(/(\w*)\^(\w*)/g, powfunc+"($1,$2)");
            });
        }
    }
    return _s;
};

var sin = function(x) {
	return Math.sin(x);
};
var cos = function(x) {
	return Math.cos(x);
};
var tan = function(x) {
	return Math.tan(x);
};
var sec = function(x) {
	return 1 / Math.cos(x);
};
var csc = function(x) {
	return 1 / Math.sin(x);
};
var cot = function(x) {
	return 1 / Math.tan(x);
};

regeneratePoints();
