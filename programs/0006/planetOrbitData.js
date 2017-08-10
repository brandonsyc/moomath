// Note that all angles are in degrees.

// Data for planets as Float32Array's, one for each of Mercury, Venus, ..., Saturn.

// Format: [semi-major axis, orbital eccentricity, inclination, longitude of the ascending node, mean anomaly, mean motion, argument of perihelion, semi-major axis, ...]
var planetOrbitData = {};

// Data for more minor objects (and Uranus and Neptune) as Float32Array's

// Format: semi-major axis, orbital eccentricity, inclination, longitude of the ascending node, mean anomaly, mean motion, argument of perihelion]
var minorOrbitData = {
'Uranus': new Float32Array([19.2294159294,.0444055667,.0134837914,1.2913577306,2.49504943941,2.040055e-4,1.68497029757]),
'Neptune': new Float32Array([30.1036348652,.0112152295,.0308571501,2.30023750462,4.67338138035,1.041512e-4,4.63646042335])
};

// Length of each epoch for planetOrbitData (between groups of 7 data points)
var epochLength = 660;

var zeroVector = new THREE.Vector3(0,0,0);

function calculateBodyPosition(name,t,forceEpoch = null) {
  // Calculate position of "name" at Julian Date t

  // Find corresponding data
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

  // Calculate epoch
  var epoch = null;

  if (forceEpoch != null) {
	   epoch = forceEpoch;
	   console.log(epoch);
  } else {
	   epoch = Math.max(0,Math.round((t + 1930633.5) / (epochLength)));
  }

  var adjT = t + 1930633.5 - epoch * epochLength;
  epoch *= 7;

  // Get data from array
  var axis = thisData[epoch] + adjT * (thisData[epoch+7] - thisData[epoch]) / epochLength;
  var ecc = thisData[epoch+1] + adjT * (thisData[epoch+8] - thisData[epoch+1]) / epochLength;
  var incl = thisData[epoch+2] + adjT * (thisData[epoch+9] - thisData[epoch+2]) / epochLength;
  var ascn = thisData[epoch+3] + adjT * (thisData[epoch+10] - thisData[epoch+3]) / epochLength;
  var anomaly = (thisData[epoch+4] + adjT * thisData[epoch+5]) % (2 * Math.PI);
  var peri = thisData[epoch+6] + adjT * (thisData[epoch+13] - thisData[epoch+6]) / epochLength;

  // Calculate body position
  return calculateBodyPositionFromOrbit(axis,ecc,incl,ascn,anomaly,peri);
}

function calculateBodyPositionFromOrbit(a,e,i,W,M,w) {
  // Calculates the position of a body given its orbbital parameters

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

  // Rotate x, y, z coords relative to J2000 ecliptic
  var x = r * (Math.cos(W) * Math.cos(w + v) - Math.sin(W) * Math.sin(w + v) * Math.cos(i));
  var y = r * (Math.sin(W) * Math.cos(w + v) + Math.cos(W) * Math.sin(w + v) * Math.cos(i));
  var z = r * (Math.sin(i) * Math.sin(w + v));

  return new THREE.Vector3(x,z,y).multiplyScalar(149597870.7);
}

function getOrbitalPeriod(bodyIndex) {
  // Finds the period of a body's orbit
	if (planetOrbitData[bodies[bodyIndex].name]) {
		return 1 / (planetOrbitData[bodies[bodyIndex].name][5] / (2 * Math.PI));
	} else if (minorOrbitData[bodies[bodyIndex].name]) {
		return 1 / (minorOrbitData[bodies[bodyIndex].name][5] / (2 * Math.PI));
	} else {
		return 1;
	}
}

var planetNames = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn'];
var requests = []; // XMLHTTPRequests (asynchronous)
var loadedBodyDatas = 0;
var knownBodyNames = planetNames.slice(); // List of body names

for (var body in minorOrbitData) {
  if (minorOrbitData.hasOwnProperty(body)) {
    knownBodyNames.push(body);
  }
}

for (i = 0; i < planetNames.length; i++) {
  // Send HTTP requests for planets

  requests[i] = new XMLHttpRequest();
  requests[i].open("GET", "data/planets/" + planetNames[i].toLowerCase() + "330float32.bin", true);
  requests[i].responseType = "arraybuffer";

  requests[i].udder = i;

  requests[i].onload = function (self,oEvent) {
    // Process returned request
    var arrayBuffer = requests[self.srcElement.udder].response;
    if (arrayBuffer) {
      planetOrbitData[planetNames[self.srcElement.udder]] = new Float32Array(arrayBuffer);
      loadedBodyDatas += 1;
    }
  };

  requests[i].send(null);
}

var asteroidRequest = new XMLHttpRequest();
asteroidRequest.open("GET", "data/astJ2000.bin", true);
asteroidRequest.responseType = "arraybuffer";

asteroidRequest.onload = function (self,oEvent) {
  // Process returned request
  var arrayBuffer = asteroidRequest.response;
  if (arrayBuffer) {
    var viewer = new DataView(arrayBuffer);

    var arrayPos = 0;
    var loadedAsteroids = 0;
    var thisLength = 0;
    var nameArray = null;

    var totalArrayLength = arrayBuffer.byteLength;

    while (loadedAsteroids < 1000) {
      thisLength = viewer.getInt8(arrayPos);
      nameArray = new Uint8Array(arrayBuffer.slice(arrayPos + 1,
        arrayPos + thisLength + 1));
      var thisName = String.fromCharCode.apply(null,nameArray);
      knownBodyNames.push(thisName);
      arrayPos += thisLength + 1;
      minorOrbitData[thisName] = new Float32Array(arrayBuffer.slice(arrayPos,arrayPos + 28));
      arrayPos += 28;
      loadedAsteroids += 1;
    }
    positionsLoaded = true;
    drawOrbits();

    asteroidRequest.response = null;
  }
};

asteroidRequest.send(null);
