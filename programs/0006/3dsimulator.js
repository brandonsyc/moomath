var renderer,scene,camera,controls,raycaster,mouse,rendererStats;
var frustum = new THREE.Frustum();

// Texture loader
var loader = new THREE.TextureLoader();

// Styles

var orbitColor = 0x0000ff;
var orbitOpacity = 0.7;
var labelColor = "rgba(255,121,244,";

var bodies = [];

// Types: star = sun, planet = one of 8 planets, dwarf = one of the dwarf planets, majorsat = round moon, minorsat = irregular moon

// Precision of spheres
var sphereSegmentPrecision = 24;
var sphereRingPrecision = 24;

// Minimum star size
var minStarSize = 50;

// Minimum major planet
var minMajorPlanetSize = 23;

// Minimum dwarf planet
var minDwarfPlanetSize = 23;

// Minimum major satellite size
var minVisibleMajorSatelliteSize = 25;

// Distance at which major satellites are displayed, in km
var majorSatelliteDisplayDistance = 1e7;

// Show planets to scale or not (true: show true scale, false: show mins)
var trueScale = false;

// Between 0 and 1, scale factor of planets
var planetScaleFactor = 0.5;

// Body which the camera is pointing at
var focusBody = null;

// Convert 1/100 AU to kilometers
var AUtokm = 1495979;

// Time Warp
var timeWarp = 0;

var textCanvas = null;
var textContext = null;

var days = 2451545.0;
var G = 6e-10;

// Are positions loaded
var positionsLoaded = false;

function addBodies() {
	addBody(new constructBody(name="Mercury",radius="2439.7",type="planet",shininess=0.1,axialtilt=0.01,rotationperiod=58.646));
	addBody(new constructBody(name="Venus",radius="6051.8",type="planet",shininess=0.65,axialtilt=177.4,rotationperiod=243.025));
	addBody(new constructBody(name="Earth",radius="6371", type="planet",shininess=0.36,axialtilt=23.439,rotationperiod=0.99726968));
	addBody(new constructBody(name="Mars",radius="3389.5", type="planet",shininess=0.15,axialtilt=25.19,rotationperiod=1.025957));
	addBody(new constructBody(name="Jupiter",radius="69911", type="planet",shininess=0.34,axialtilt=3.13,rotationperiod=0.41354167));
	addBody(new constructBody(name="Saturn",radius="58232", type="planet",shininess=0.34,axialtilt=26.73,rotationperiod=0.4395833));
	addBody(new constructBody(name="Uranus",radius="25362", type="planet",shininess=0.34,axialtilt=97.77,rotationperiod=0.71833));
	addBody(new constructBody(name="Neptune",radius="24622", type="planet",shininess=0.34,axialtilt=28.32,rotationperiod=0.6713));
	addBody(new constructBody(name="Sun",radius="696342", type="star",shininess=0.03,axialtilt=0,rotationperiod=1e9));
	/**addBody(new constructBody(name="Ganymede",radius="2634.1", type="majorsat",shininess=0.03));
	addBody(new constructBody(name="Titan",radius="2576", type="majorsat",shininess=0.03));
	addBody(new constructBody(name="Callisto",radius="2410.3",type="majorsat",shininess=0.03));
	addBody(new constructBody(name="Io",radius="1821.6",type="majorsat"));
	addBody(new constructBody(name="Moon",radius="1737.1",type="majorsat"));
	addBody(new constructBody(name="Europa",radius="1560.8",type="majorsat"));
	addBody(new constructBody(name="Triton",radius="1353.4",type="majorsat"));
	addBody(new constructBody(name="Titania",radius="788.4",type="majorsat"));
	addBody(new constructBody(name="Iapetus",radius="734.5",type="majorsat"));
	addBody(new constructBody(name="Tethys",radius="531.1",type="majorsat"));**/
	addBody(new constructBody(name="Pluto",radius="1186",type="dwarf",shininess=0.34,axialtilt=0,rotationperiod=32));
}

// Whether to display the grid
var displayGridHelper = false;

// The grid variable
var cGrid = null;

// The translation of the grid relative to (0,0,0)
var cGridTransZ = 0;
var cGridTransY = 0;
var cGridTransX = 0;

// The spacing between grid lines in units (changes dynamically to nearest power of 10)
var cGridLineWidth = 10;

// Align grid to object
var alignGridToTarget = true;

// Gridline color
var alignGridColor = "#777777";

var sunEmissive = 0.9;

var textCanvas = null;
var textContext = null;

function init() {
	// Initialization sequence
	var VIEW_ANGLE = 45;	// FOV of camera
	var ASPECT = window.innerWidth / window.innerHeight;
	var NEAR = 1e-4;
	var FAR = 1e16;

	container = document.querySelector('#container');
	renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true, alpha: true});
	camera =
	    new THREE.PerspectiveCamera(
	        VIEW_ANGLE,
	        ASPECT,
	        NEAR,
	        FAR
	    );

	scene = new THREE.Scene();

	textCanvas = document.getElementById('text-canvas');
	textContext = textCanvas.getContext('2d');

	textCanvas.width = window.innerWidth;
	textCanvas.height = window.innerHeight;

	camera.position.y = 16000000;
	camera.position.z = 250000000;

	scene.add(camera);

	renderer.setSize(window.innerWidth, window.innerHeight);

	console.log("Loading textures...");

	addBodies();

	console.log("Loaded textures.")

	var light = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(light);

	if (displayGridHelper) {
		cGrid = new THREE.GridHelper(1000, 100, colorCenterLine = alignGridColor, colorGrid = alignGridColor);
		cGrid.name = 'gridy';
		scene.add(cGrid);
	}

	var wbglcontainer = document.getElementById('webgl-container');

	wbglcontainer.insertBefore(renderer.domElement,wbglcontainer.firstChild);

	renderer.sortObjects = true;

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.rotateSpeed = 0.8;
	controls.keyPanSpeed = 7;
	renderer.render(scene, camera);

	rendererStats = new THREEx.RendererStats();

	rendererStats.domElement.style.position	= 'absolute';
	rendererStats.domElement.style.left	= '0px';
	rendererStats.domElement.style.bottom	= '0px';
	document.body.appendChild(rendererStats.domElement);

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.addEventListener('click', onDocumentClick, false);
	document.addEventListener( 'dblclick', onDocumentDblClick, false );

	updateFrustum();
	drawOrbits();
}

function updateFrustum() {
	frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
}

function getObjects() {
	var objects = [];
	for (i = 0; i < bodies.length; i++) {
		objects.push(bodies[i].object);
	}
	return objects;
}

function shiftCameraFocus(bodyIndex) {
	controls.smoothPanIntoBody(bodyIndex);
	camera.fov = 45;
	camera.updateProjectionMatrix();
}

function instantShiftCameraFocus(bodyIndex) {
	controls.shiftTarget(getBodyPosition(bodyIndex));
	camera.fov = 45;
	camera.updateProjectionMatrix();
}

var lastClickedEntity = null;

function onDocumentClick(event) {

	//event.preventDefault();

	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(getObjects(), true);

	if (intersects.length > 0) {
		lastClickedEntity = intersects[0];

		focusBody = intersects[0].object.name;
		if (trackBody) {
		shiftCameraFocus(focusBody);
		} else {
		shiftCameraFocusToVector(getBodyPosition(focusBody));
		}
	} else {
		if (!controls.moving) {
			lastClickedEntity = null;
		}
	}
}

function onDocumentDblClick(event) {
	event.preventDefault();

	if (lastClickedEntity) {

		var vFOV = camera.fov * Math.PI / 180;
		var cameraDistance = Math.hypot(
			controls.target.x-camera.position.x,
			controls.target.y-camera.position.y,
			controls.target.z-camera.position.z);
		var height = Math.tan(vFOV / 2) * cameraDistance;
		var bodySize = bodies[lastClickedEntity.object.name].radius;

		controls.smoothDollyIntoBody(lastClickedEntity.object.name);

		focusBody = lastClickedEntity.object.name;
	}
}

var lastUpdate = 0;
var finished = false;

var trackBody = true;
var lockBody = false;
var currentSunSize = 0;

function update() {
	// Update the animation frame

	var vFOV = camera.fov * Math.PI / 180;
	updateCameraTracking();
	updateFrustum();

	var sunIndex = getBody('Sun');
	var sunPosition = getBodyPosition(sunIndex);
	currentSunSize = bodies[sunIndex].object.children[0].scale.x * bodies[sunIndex].radius;

	for (i = 0; i < bodies.length; i++) {
		var cameraDistance = getCameraDistance(i);
		var height = 2 * Math.tan(vFOV / 2) * cameraDistance;
		var bodyPixelSize = bodies[i].radius / height * window.innerHeight;

		var scaleFactor = 1;

		if (!trueScale) {
			scaleFactor = getScaleFactor(bodyPixelSize,bodies[i].type,cameraDistance);
		}

		scaleObject(i,scaleFactor);

		if (bodyPixelSize * scaleFactor < 0.01) {
			bodies[i].object.visible = false;
		} else {
			bodies[i].object.visible = true;
		}

		if (i == sunIndex) continue;

		var dist = sunPosition.distanceTo(getBodyPosition(i));

		if (dist < currentSunSize) {
			var opacity = (dist - 3 * (currentSunSize - dist)) / currentSunSize;
			if (opacity <= 0) {
				bodies[i].object.visible = false;
			} else {
				setOpacity(i, opacity);
			}
		} else {
			setOpacity(i,1);
			bodies[i].object.visible = true;
		}
	}

	var height = 2 * Math.tan(vFOV / 2) *
		Math.hypot(controls.target.x-camera.position.x,
		(alignGridToTarget ? controls.target.y : 0)-camera.position.y,
		controls.target.z-camera.position.z);

	if (displayGridHelper) {
		var newWidth = Math.pow(10, Math.floor(Math.log10(height)) - 1);

		if (newWidth != cGridLineWidth || !scene.getObjectByName('gridy')) {
			cGridLineWidth = newWidth;
			try {
				var grd = scene.getObjectByName('gridy');
				scene.remove(grd);
				grd.dispose();
			} catch (e) {;}
			cGrid = new THREE.GridHelper(100 * cGridLineWidth, 100,
				colorCenterLine = alignGridColor, colorGrid = alignGridColor);
			cGrid.name = 'gridy';
			scene.add(cGrid);
			cGrid.translateX(Math.floor(controls.target.x / cGridLineWidth) * cGridLineWidth);
			cGridTransX = Math.floor(controls.target.x / cGridLineWidth) * cGridLineWidth;
			if (alignGridToTarget) {
				cGrid.translateY(controls.target.y);
				cGridTransY = controls.target.y;
			}
			cGrid.translateZ(Math.floor(controls.target.z / cGridLineWidth) * cGridLineWidth);
			cGridTransZ = Math.floor(controls.target.z / cGridLineWidth) * cGridLineWidth;
		}
	} else {
		try {
			scene.remove(scene.getObjectByName('gridy'));
		} catch(e) {;}
	}

	controls.update();

	updateSprites();
  	renderer.render(scene, camera);

	if (!finished && new Date().getTime() - lastUpdate < 1000/30.0) {
		finished = true;
		console.log("Finished setup #2");
	}

	if (finished) {
		updateBodyPositions();
	}

	lastUpdate = new Date().getTime();
	rendererStats.update(renderer);
	requestAnimationFrame(update);
}

window.addEventListener('resize', function() {
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
      textCanvas.width = WIDTH;
      textCanvas.height = HEIGHT;

    });

function updatePlanetarySize() {
	var bar = document.getElementById("bar1").style.width;
	minMajorPlanetSize = parseFloat(bar.substr(0,bar.length-1))/2;
	if (minMajorPlanetSize > 50) {
		minMajorPlanetSize = 50;
	}
	minDwarfPlanetSize = Math.floor(minMajorPlanetSize / 2); // This is most likely going to be temporary
	if (minMajorPlanetSize == 0) {
		document.getElementById('bar1-contents').innerHTML = "Real Size";
	} else {
		document.getElementById('bar1-contents').innerHTML = parseInt(Math.round(minMajorPlanetSize)) + '&times;';
	}
}

function updateMoonSize() {
	var bar = document.getElementById("bar2").style.width;
	minVisibleMajorSatelliteSize = parseFloat(bar.substr(0,bar.length-1)) / 2;
	if (minVisibleMajorSatelliteSize > 50) {
		minVisibleMajorSatelliteSize = 50;
	}
	if (minVisibleMajorSatelliteSize == 0) {
		document.getElementById('bar2-contents').innerHTML = "Real Size";
	} else {
		document.getElementById('bar2-contents').innerHTML = minVisibleMajorSatelliteSize + '&times;';
	}
}

function updateShowGrid() {
	displayGridHelper = document.getElementById("testc").checked;
}

function doGoTo() {
	var bodyName = document.getElementById("goto").value.replace(/ /g,'').toLowerCase();
	for (i = 0; i < bodies.length; i++) {
		if (bodies[i].name.toLowerCase() === bodyName) {
			if (focusBody == i) return;
			focusBody = i;
			shiftCameraFocus(i);
			var udder = i;
			setTimeout(function() {controls.smoothDollyIntoBody(udder)},1020);
		}
	}
}

window.onload = function() {
	console.log("Finished setup.");
	requestAnimationFrame(update);
	updateTimeWarp();
}

init();

function constructBody(name = null,
 radius = null,
 type = null,
 shininess = null,
 axialtilt = null,
 rotationperiod = null) {
	this.name = name;
	this.radius = radius;
	this.type = type;
	this.shininess = shininess;
	this.axialtilt = axialtilt;
	this.rotationperiod = rotationperiod;
}

function addBody(body) {
	if (!body.object) {
		THREE.ImageUtils.crossOrigin = '';
		var bodyTexture,bodyMaterial;

		if (body.imageLocation) {
			bodyTexture = loader.load(body.imageLocation,THREE.SphericalRefractionMapping);
		} else {
			bodyTexture = loader.load('images/' + body.name.toLowerCase() + 'Texture.jpg',THREE.SphericalRefractionMapping);
		}

		if (body.type === "star") {
			bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture, emissive: 'white', emissiveIntensity: sunEmissive});
		} else {
			if (body.shininess) {
				bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture, shininess: body.shininess, transparent: true});
			} else {
				bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture, shininess: 0, transparent: true});
			}
		}

		var bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius,
				sphereSegmentPrecision, sphereRingPrecision), bodyMaterial);

		if (body.type === "star") {
			var bodyGroup = new THREE.Group();
			bodyGroup.add(bodyMesh);
			var sunLightSource = new THREE.PointLight(0xffffff, 1.7, 100, decay = 0);

			var glowMaterial = new THREE.ShaderMaterial(
			{uniforms:{"c": { type: "f", value: 0.2 }, "p": { type: "f", value: 1.2 },
			glowColor: {type: "c", value: new THREE.Color(0xffff66)},
			viewVector: {type: "v3", value: camera.position}
			}, vertexShader: document.getElementById('vertexShader').textContent,
			fragmentShader: document.getElementById('fragmentShader').textContent,
			side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true});

			glowMaterial.depthTest = true;

			var sunGlow = new THREE.Mesh(new THREE.SphereGeometry(body.radius*1.7, sphereSegmentPrecision, sphereRingPrecision), glowMaterial);

			bodyGroup.add(sunGlow);

			sunLightSource.position.set(0, 0, 0);
			bodyGroup.add(sunLightSource);

			bodyMesh = bodyGroup;
		}
		if (body.name === "Saturn") {
			var bodyGroup = new THREE.Group();

			bodyGroup.add(bodyMesh);

			var rings = new THREE.Mesh(new THREE.XRingGeometry(1.2 * body.radius, 2 * body.radius, 64, 5, 0, Math.PI * 2),
			 new THREE.MeshBasicMaterial({ map: loader.load('images/saturnRings.png'),
			  side: THREE.DoubleSide, transparent: true, opacity: 0.6 }))

			rings.position.x = bodyMesh.position.x;
			rings.position.y = bodyMesh.position.y;
			rings.position.z = bodyMesh.position.z;

			bodyGroup.add(rings);

			bodyMesh = bodyGroup;
		}

		if (bodyMesh.children.length > 0) {
			for (child = 0; child < bodyMesh.children.length; child++) {
				bodyMesh.children[child].name = bodies.length;
			}
		} else {
			bodyMesh.name = bodies.length;
		}

		scene.add(bodyMesh);

		body.object = bodyMesh;
		bodies.push(body);
	}
}

function Vector3toArray(v) {
	return [v.x,v.y,v.z];
}

function getBody(name) {
	for (i = 0; i < bodies.length; i++) {
		if (bodies[i].name === name) {
			return i;
		}
	}
}

function getBodyPosition(bodyIndex,asVector = true) {
	var positionVector = null;
	if (bodies[bodyIndex].object.children.length > 0) {
		positionVector = bodies[bodyIndex].object.children[0].position;
	} else {
		positionVector = bodies[bodyIndex].object.position;
	}
	if (asVector) {
		return positionVector;
	} else {
		return Vector3toArray(positionVector);
	}
}

function setBodyPositionVector(bodyIndex,v) {
	setBodyPosition(bodyIndex,v.x,v.y,v.z);
}

function setBodyPosition(bodyIndex,x,y,z) {
	if (bodies[bodyIndex].object.children.length > 0) {
		for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
			bodies[bodyIndex].object.children[child].position.set(x,y,z);
		}
	} else {
		bodies[bodyIndex].object.position.set(x,y,z);
	}
}

function setOpacity(bodyIndex,opacity) {
	if (bodies[bodyIndex].name === 'Saturn') {
		bodies[bodyIndex].object.children[0].material.opacity = opacity;
		bodies[bodyIndex].object.children[1].material.opacity = 0.6 * opacity;
		return;
	}
	if (bodies[bodyIndex].object.children.length > 0) {
		for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
			bodies[bodyIndex].object.children[child].material.opacity = opacity;
		}
	} else {
		bodies[bodyIndex].object.material.opacity = opacity;
	}
}

function updateBodyPositions() {
	for (i = 0; i < bodies.length; i++) {
		updateBodyPosition(i);
		updateBodyRotation(i);
	}
	days += timeWarp/60;
}

function updateBodyPosition(bodyIndex) {
	var positionVector = calculateBodyPosition(bodies[bodyIndex].name,days);
	if (positionVector) {
	setBodyPositionVector(bodyIndex,positionVector);
	}
}

function updateBodyRotation(bodyIndex) {
	if (bodies[bodyIndex].hasOwnProperty('rotationperiod')) {
	var ytilt = (days / (bodies[bodyIndex].rotationperiod) * 2 * Math.PI) % (2 * Math.PI);
	var xtilt = bodies[bodyIndex].axialtilt * Math.PI/180;
	if (bodies[bodyIndex].object.children.length > 0) {
		for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
			bodies[bodyIndex].object.children[child].rotation.y = ytilt;
			bodies[bodyIndex].object.children[child].rotation.x = xtilt;
		}
	} else {
		bodies[bodyIndex].object.rotation.y = ytilt;
		bodies[bodyIndex].object.rotation.x = xtilt;
	}
	}
}

function getObjectPos(obj) {
	try {
	if (obj.object.children.length > 0) {
		return obj.object.children[0].position;
	} else {
		return obj.object.position;
	}
	} catch (e) {
		return lastFocusBodyPosition;
	}
}

function scaleObject(bodyIndex,scaleFactor) {
	if (bodies[bodyIndex].object.children.length > 0) {
		for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
			bodies[bodyIndex].object.children[child].scale.x = scaleFactor;
			bodies[bodyIndex].object.children[child].scale.y = scaleFactor;
			bodies[bodyIndex].object.children[child].scale.z = scaleFactor;
		}
	} else {
		bodies[bodyIndex].object.scale.x = scaleFactor;
		bodies[bodyIndex].object.scale.y = scaleFactor;
		bodies[bodyIndex].object.scale.z = scaleFactor;
	}
}

function getCameraDistance(bodyIndex) {
	var cameraPos = camera.position;
	var bodyPos = getBodyPosition(bodyIndex);
	return Math.hypot(cameraPos.x - bodyPos.x,cameraPos.y - bodyPos.y,cameraPos.z - bodyPos.z);
}

function getScaleFactor(bodyPixelSize,bodyType,cameraDistance) {
	if (bodyType == "star") {
		if (bodyPixelSize < minStarSize * planetScaleFactor + 1) {
			return (minStarSize * planetScaleFactor + 1) / bodyPixelSize;
		}
	} else if (bodyType == "planet") {
		if (bodyPixelSize < minMajorPlanetSize * planetScaleFactor + 1) {
			return (minMajorPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
		}
	} else if (bodyType == "dwarf") {
		if (bodyPixelSize < minDwarfPlanetSize * planetScaleFactor + 1) {
			return (minDwarfPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
		}
	} else if (bodyType == "majorsat") {
		if (cameraDistance < majorSatelliteDisplayDistance) {
			if (bodyPixelSize < minVisibleMajorSatelliteSize * planetScaleFactor + 1) {
				return (minVisibleMajorSatelliteSize * planetScaleFactor + 1) / bodyPixelSize;
			}
		}
	}
	return 1;
}

var lastFocusBodyPosition = new THREE.Vector3(0,0,0);
var lastFocusBody = null;

var targetShift = new THREE.Vector3();

function updateCameraTracking() {
	if (focusBody != null) {
	var focusBodyPosition = getBodyPosition(focusBody);
	if (!controls.zooming && !controls.moving && focusBody == lastFocusBody) {
	if (focusBodyPosition != null) {
		if (lockBody) {
			camera.position.set(camera.position.x + focusBodyPosition.x - lastFocusBodyPosition.x,
					camera.position.y + focusBodyPosition.y - lastFocusBodyPosition.y,
					camera.position.z + focusBodyPosition.z - lastFocusBodyPosition.z);
		} else if (trackBody) {
			instantShiftCameraFocus(focusBody);
		}
	}
	}
	lastFocusBodyPosition.copy(focusBodyPosition);
	lastFocusBody = focusBody;
	}
}

var lastDrawnOrbits = 0;

function drawOrbits() {
	lastDrawnOrbits = days;
	var linematerial = new THREE.LineBasicMaterial({
		color: orbitColor,
		opacity: orbitOpacity,
		transparent: true
	});
	for (i = 0; i < bodies.length; i++) {
		var geometry = new THREE.Geometry();
		var period = getOrbitalPeriod(i);
		for (j = 0; j < 200; j++) {
			geometry.vertices.push(calculateBodyPosition(bodies[i].name,days + period * j / 200));
		}
		geometry.vertices.push(calculateBodyPosition(bodies[i].name,days));
		var line = new THREE.Line(geometry, linematerial);
		line.name = bodies[i].name + "Orbit";
		scene.add(line);
	}
}

function get2DPosition(bodyIndex) {
	var p = getBodyPosition(bodyIndex).clone();
        var vector = p.project(camera);
        return [(vector.x + 1) / 2 * textCanvas.width, -(vector.y - 1) / 2 * textCanvas.height];
}

function clearOverlay() {
	textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
}

function updateSprites() {
	clearOverlay();
	textContext.font = "12px Cambria";
	textContext.textAlign = "left";
	var sunPosition = getBodyPosition(getBody('Sun'));
	for (i = 0; i < bodies.length; i++) {
		var bodyPosition = getBodyPosition(i);
		if (frustum.containsPoint(bodyPosition)) {
			var dist = bodyPosition.distanceTo(sunPosition);
			if (dist < currentSunSize) {
				var opacity = Math.max((dist - 2.5 * (currentSunSize - dist)) / currentSunSize,0);
				if (opacity == 0) continue;
				textContext.fillStyle = labelColor + String(opacity) + ')';
			} else {
				textContext.fillStyle = labelColor + '0.95)';
			}
			var pos = get2DPosition(i);
			textContext.fillText(bodies[i].name, pos[0], pos[1]);
		}
	}
}

function updateSunSize() {
	var bar = document.getElementById("bar4").style.width;
	minStarSize = parseFloat(bar.substr(0,bar.length-1));
	if (minStarSize > 100) {
		minStarSize = 100;
	}
	if (minStarSize == 0) {
		document.getElementById('bar4-contents').innerHTML = "Real Size";
	} else {
		document.getElementById('bar4-contents').innerHTML = parseInt(Math.round(minStarSize)) + '&times;';
	}
}

var timeWarpFactor = 2.354367640272;

function updateTimeWarp() {
	var bar = document.getElementById("bar3").style.width;
	var unmodifiedWarp = parseFloat(bar.substr(0,bar.length-1));
	if (unmodifiedWarp > 100) {
		unmodifiedWarp = 100;
	}
	var modifiedWarp = 0;
	document.getElementById('bar3-contents').innerHTML = "Frozen";
	if (unmodifiedWarp > 0) {
		if (unmodifiedWarp <= 1) {
			modifiedWarp = 1/86400.0;
			document.getElementById('bar3-contents').innerHTML = "Real Time";
		} else {
			modifiedWarp = 0.0195553106517 * Math.pow(unmodifiedWarp,timeWarpFactor) + 0.1;
			document.getElementById('bar3-contents').innerHTML = String(modifiedWarp).substr(0,7) + ' days / sec';
		}
	}
	timeWarp = modifiedWarp;
}
