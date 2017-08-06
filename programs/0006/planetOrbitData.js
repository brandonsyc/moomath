var planetOrbitData = {};
var minorOrbitData = {
'Uranus': new Float32Array([19.2294159294,.0444055667,.0134837914,1.2913577306,2.49504943941,2.040055e-4,1.68497029757]),
'Neptune': new Float32Array([30.1036348652,.0112152295,.0308571501,2.30023750462,4.67338138035,1.041512e-4,4.63646042335]),
'Ceres': new Float32Array([2.76649601664,.0783756291,.1847144893,1.40489157056,.1078029094,.0037384052,1.2901973684])
};

var epochLength = 660;
var zeroVector = new THREE.Vector3(0,0,0);

function calculateBodyPosition(name,t,forceEpoch = null) {
  var thisData = planetOrbitData[name];
  if (thisData === undefined) {
    thisData = minorOrbitData[name];
    if (thisData === undefined) {
    	return zeroVector;
    }
  var adjT = t + 1930633.5 + 2451545;
  epoch *= 7;

  var anomaly = (thisData[4] + adjT * thisData[5]) % (2 * Math.PI);

  return calculateBodyPositionFromOrbit(thisData[0],thisData[1],thisData[2],thisData[3],anomaly,thisData[6]);
  }

  var epoch = null;
  
  if (forceEpoch != null) {
	epoch = forceEpoch;
	console.log(epoch);
  } else {
	epoch = Math.max(0,Math.round((t + 1930633.5) / (epochLength)));
  }
  
  var adjT = t + 1930633.5 - epoch * epochLength;
  epoch *= 7;

  var axis = thisData[epoch] + adjT * (thisData[epoch+7] - thisData[epoch]) / epochLength;
  var ecc = thisData[epoch+1] + adjT * (thisData[epoch+8] - thisData[epoch+1]) / epochLength;
  var incl = thisData[epoch+2] + adjT * (thisData[epoch+9] - thisData[epoch+2]) / epochLength;
  var ascn = thisData[epoch+3] + adjT * (thisData[epoch+10] - thisData[epoch+3]) / epochLength;
  var anomaly = (thisData[epoch+4] + adjT * thisData[epoch+5]) % (2 * Math.PI);
  var peri = thisData[epoch+6] + adjT * (thisData[epoch+13] - thisData[epoch+6]) / epochLength;

  return calculateBodyPositionFromOrbit(axis,ecc,incl,ascn,anomaly,peri);
}

function calculateBodyPositionFromOrbit(a,e,i,W,M,w) {
  var E = M;  // Eccentric anomaly

  // Newton's method: find root of M - E + e * sin(E)
  while (true) {
    var dE = (E - e * Math.sin(E) - M)/(1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }

  // True anomaly
  var v = Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)) * 2;

  // Distance to center body
  var r = (a * (1 - e * e)) / (1 + e * Math.cos(v));

  // x, y, z coords relative to J2000 ecliptic
  var x = r * (Math.cos(W) * Math.cos(w + v) - Math.sin(W) * Math.sin(w + v) * Math.cos(i));
  var y = r * (Math.sin(W) * Math.cos(w + v) + Math.cos(W) * Math.sin(w + v) * Math.cos(i));
  var z = r * (Math.sin(i) * Math.sin(w + v));

  return new THREE.Vector3(x,z,y).multiplyScalar(149597870.7);
}

function getOrbitalPeriod(bodyIndex) {
	if (planetOrbitData[bodies[bodyIndex].name]) {
		return 1 / (planetOrbitData[bodies[bodyIndex].name][5] / (2 * Math.PI));
	} else if (minorOrbitData[bodies[bodyIndex].name]) {
		return 1 / (minorOrbitData[bodies[bodyIndex].name][5] / (2 * Math.PI));
	} else {
		return 1;
	}
}

var planetNames = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn'];
var requests = [];

var loadedBodyDatas = 0;

for (i = 0; i < planetNames.length; i++) {
requests[i] = new XMLHttpRequest();
requests[i].open("GET", "data/planets/" + planetNames[i].toLowerCase() + "330float32.bin", true);
requests[i].responseType = "arraybuffer";

requests[i].udder = i;

requests[i].onload = function (self,oEvent) {
  var arrayBuffer = requests[self.srcElement.udder].response;
  if (arrayBuffer) {
    planetOrbitData[planetNames[self.srcElement.udder]] = new Float32Array(arrayBuffer);
    loadedBodyDatas += 1;
    if (loadedBodyDatas == planetNames.length) {
	positionsLoaded = true;
	drawOrbits();
    }
  }
};

requests[i].send(null);
}
