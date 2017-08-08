var renderer,scene,camera,controls,raycaster,mouse,rendererStats;
var frustum = new THREE.Frustum();

// Texture loader
var loader = new THREE.TextureLoader();

// Styles

var orbitColor = 0x0000ff;
var planetOrbitOpacity = 0;
var dwarfOrbitOpacity = 0;
var labelColor = "rgba(255,121,244,";

var maxOrbitOpacity = 0.7;

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
var minDwarfPlanetSize = 12;

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
	// Adds default bodies
	addBody(new constructBody(name="Mercury",radius="2439.7",type="planet",shininess=0.1,axialtilt=0.01,rotationperiod=58.646));
	addBody(new constructBody(name="Venus",radius="6051.8",type="planet",shininess=0.65,axialtilt=177.4,rotationperiod=243.025));
	addBody(new constructBody(name="Earth",radius="6371", type="planet",shininess=0.36,axialtilt=23.439,rotationperiod=0.99726968));
	addBody(new constructBody(name="Mars",radius="3389.5", type="planet",shininess=0.15,axialtilt=25.19,rotationperiod=1.025957));
	addBody(new constructBody(name="Jupiter",radius="69911", type="planet",shininess=0.34,axialtilt=3.13,rotationperiod=0.41354167));
	addBody(new constructBody(name="Saturn",radius="58232", type="planet",shininess=0.34,axialtilt=26.73,rotationperiod=0.4395833));
	addBody(new constructBody(name="Uranus",radius="25362", type="planet",shininess=0.34,axialtilt=97.77,rotationperiod=0.71833));
	addBody(new constructBody(name="Neptune",radius="24622", type="planet",shininess=0.34,axialtilt=28.32,rotationperiod=0.6713));
	addBody(new constructBody(name="Sun",radius="696342", type="star",shininess=0.03,axialtilt=0,rotationperiod=1e9));
	addBody(new constructBody(name="1 Ceres",radius="200",type="dwarf",shininess=0.03,axialtilt=0,rotationperiod=1e9,imageLocation="images/ceresTexture.jpg"));
	addBody(new constructBody(name="2 Pallas",radius="200",type="dwarf",shininess=0.03,axialtilt=0,rotationperiod=1e9,imageLocation="images/ceresTexture.jpg"));
	addBody(new constructBody(name="3 Juno",radius="200",type="dwarf",shininess=0.03,axialtilt=0,rotationperiod=1e9,imageLocation="images/ceresTexture.jpg"));
	addBody(new constructBody(name="4 Vesta",radius="200",type="dwarf",shininess=0.03,axialtilt=0,rotationperiod=1e9,imageLocation="images/ceresTexture.jpg"));
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
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		logarithmicDepthBuffer: true,
		alpha: true
	});
	camera =
	    new THREE.PerspectiveCamera(
	        VIEW_ANGLE,
	        ASPECT,
	        NEAR,
	        FAR
	    );

	scene = new THREE.Scene();

  // Canvas containing all text
	textCanvas = document.getElementById('text-canvas');
	textContext = textCanvas.getContext('2d');

	// Resize text canvas
	textCanvas.width = window.innerWidth;
	textCanvas.height = window.innerHeight;

	// Default camera starting position
	camera.position.y = 16000000;
	camera.position.z = 250000000;

	scene.add(camera);

	// Set renderer size to fill window
	renderer.setSize(window.innerWidth, window.innerHeight);

	console.log("Loading textures...");

	addBodies();

	console.log("Loaded textures.")

	// Ambient light, makes non-lit side of bodies not black
	var light = new THREE.AmbientLight(0x404040);
	scene.add(light);

	// Container for WebGL canvas
	var wbglcontainer = document.getElementById('webgl-container');

	// Append to document
	wbglcontainer.insertBefore(renderer.domElement,wbglcontainer.firstChild);

	renderer.sortObjects = true;

	// Orbit cotnrols
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.rotateSpeed = 0.8;
	controls.keyPanSpeed = 7;

	// Renderer stats, for debugging
	rendererStats = new THREEx.RendererStats();

	rendererStats.domElement.style.position	= 'absolute';
	rendererStats.domElement.style.left	= '0px';
	rendererStats.domElement.style.bottom	= '0px';
	document.body.appendChild(rendererStats.domElement);

	// Used for mouse calculations
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// Event listeners for click, double click
	document.addEventListener('click', onDocumentClick, false);
	document.addEventListener('dblclick', onDocumentDblClick, false);

	updateFrustum();
	drawOrbits();

	// Render the scene!
	renderer.render(scene, camera);
}

function updateFrustum() {
	// Sets the frustum to contain all objects in the camera's field of view
	frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(
		camera.projectionMatrix,
		camera.matrixWorldInverse));
}

function getObjects() {
	// Gets list of pointers to all objects
	// TODO: Optimize this function by keeping its result as a separate array
	// until something changes

	var objects = [];
	for (i = 0; i < bodies.length; i++) {
		objects.push(bodies[i].object);
	}
	return objects;
}

function shiftCameraFocus(bodyIndex) {
	// Shifts camera focus to bodies[bodyIndex] smoothly (linear interpolation)
	controls.smoothPanIntoBody(bodyIndex);
	camera.fov = 45;
	camera.updateProjectionMatrix();
}

function instantShiftCameraFocus(bodyIndex) {
	// Shifts camera focus to bodies[bodyIndex] instantly
	controls.shiftTarget(getBodyPosition(bodyIndex));
	camera.fov = 45;
	camera.updateProjectionMatrix();
}

// Last clicked object
var lastClickedEntity = null;

function onDocumentClick(event) {
	// Handler for click events

	// Mouse coordinates
	mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

	// Set raycaster, get intersecting objects
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(getObjects(), true);

	if (intersects.length > 0) {
		// If an intersecting body in found...
		lastClickedEntity = intersects[0];

		// Note that (Object3D).object.name gives the index of the object in bodies.
		focusBody = intersects[0].object.name;
		drawOrbits();

		if (trackBody) {
			// If camera mode is tracking, shift the camera to the focused body
			shiftCameraFocus(focusBody);
		} else {
			shiftCameraFocusToVector(getBodyPosition(focusBody));
		}
	} else {
		if (!controls.moving) {
			// If the camera is moving, don't update lastClickedEntity
			lastClickedEntity = null;
		}
	}
}

function onDocumentDblClick(event) {
	// Double click handler

	// Prevent click from happening
	event.preventDefault();

	if (lastClickedEntity) {
		// If clicked entity already found...

		/**var vFOV = camera.fov * Math.PI / 180;
		var cameraDistance = Math.hypot(
			controls.target.x-camera.position.x,
			controls.target.y-camera.position.y,
			controls.target.z-camera.position.z);
		var height = Math.tan(vFOV / 2) * cameraDistance;
		var bodySize = bodies[lastClickedEntity.object.name].radius;**/

		// Zoom into body
		controls.smoothDollyIntoBody(lastClickedEntity.object.name);

		focusBody = lastClickedEntity.object.name;
	}
}

// Check if first > 30fps frame has been rendered
var finished = false;
var lastUpdate = 0;

// Modes for camera tracking
var trackBody = true;
var lockBody = false;

// Size of sun in km (displayed)
var currentSunSize = 0;

function update() {
	// Update the animation frame

	// Calculate FOV
	var vFOV = camera.fov * Math.PI / 180;

	// Update camera movements, recalculate frustum
	updateCameraTracking();
	updateFrustum();

	// Index, position, size of sun
	var sunIndex = getBody('Sun');
	var sunPosition = getBodyPosition(sunIndex);
	currentSunSize = bodies[sunIndex].object.children[0].scale.x * bodies[sunIndex].radius;

	for (i = 0; i < bodies.length; i++) {
		// For every body...

		// Calculate size in pixels
		var cameraDistance = getCameraDistance(i);
		var height = 2 * Math.tan(vFOV / 2) * cameraDistance;
		var bodyPixelSize = bodies[i].radius / height * window.innerHeight;

		var scaleFactor = 1;

		// Calculate scaleFactor to make the object the correct size (scale up if it is too small)
		if (!trueScale) {
			scaleFactor = getScaleFactor(bodyPixelSize,bodies[i].type,cameraDistance);
		}

		scaleObject(i,scaleFactor);

		// If the object is sufficiently small, stop it from displaying
		if (bodyPixelSize * scaleFactor < 0.01) {
			bodies[i].object.visible = false;
		} else {
			bodies[i].object.visible = true;
		}

		// If the body is the sun, skip the following code
		if (i == sunIndex) continue;

		// 3D distance to Sun
		var dist = sunPosition.distanceTo(getBodyPosition(i));

		if (dist < currentSunSize) {
			var opacity = (dist - 3 * (currentSunSize - dist)) / currentSunSize;

			if (opacity <= 0) {
				bodies[i].object.visible = false;
			} else {
				// If the body intersects the Sun, fade it out to an opacity depending on the distance
				setOpacity(i, opacity);
			}
		} else {
			setOpacity(i,1);
			bodies[i].object.visible = true;
		}
	}

	if (displayGridHelper) {
		// If the grid is enabled...

		// Calculate height of grid
		var height = 2 * Math.tan(vFOV / 2) *
			Math.hypot(controls.target.x-camera.position.x,
			(alignGridToTarget ? controls.target.y : 0)-camera.position.y,
			controls.target.z-camera.position.z);

		// Calculate new width
		var newWidth = Math.pow(10, Math.floor(Math.log10(height)) - 1);
		if (newWidth != cGridLineWidth || !scene.getObjectByName('gridy')) {
			// If grid needs updating...

			// Update grid width
			cGridLineWidth = newWidth;

			try {
				// Try to remove the previous grid
				var grd = scene.getObjectByName('gridy');
				scene.remove(grd);
				grd.dispose();
			} catch (e) {;}

			// GridHelper object
			cGrid = new THREE.GridHelper(100 * cGridLineWidth, 100,
				colorCenterLine = alignGridColor, colorGrid = alignGridColor);
			cGrid.name = 'gridy';
			scene.add(cGrid);

			// Move gridHelper to correct coordinates
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
			// Try to remove the grid
			scene.remove(scene.getObjectByName('gridy'));
		} catch(e) {;}
	}

	// Update the controls (OrbitControls)
	controls.update();

	// Update the sprites (text canvas)
	updateSprites();

	// Render the scene
  renderer.render(scene, camera);

	if (!finished && new Date().getTime() - lastUpdate < 1000/30.0) {
		// Checkpoint for first frame above 30 fps
		finished = true;
		console.log("Finished setup #2");
	}

	// Update positions of bodies
	if (finished) updateBodyPositions();

	// Setup for next call to update()
	lastUpdate = new Date().getTime();
	rendererStats.update(renderer);
	requestAnimationFrame(update);
}

window.addEventListener('resize', function() {
	// Handler for resize events
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

	// Set renderer, camera, textCanvas size to size of window
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
  textCanvas.width = WIDTH;
  textCanvas.height = HEIGHT;
});

function updatePlanetarySize() {
	// Update minimum graphical size of planets based on user input

	// Width of displayed bar
	var bar = document.getElementById("bar1").style.width;

	// Parse as converted float
	minMajorPlanetSize = parseFloat(bar.substr(0,bar.length-1))/2;
	if (minMajorPlanetSize > 50) {
		minMajorPlanetSize = 50;
	}

	// This is most likely going to be temporary
	minDwarfPlanetSize = Math.floor(minMajorPlanetSize / 2);

	if (minMajorPlanetSize == 0) {
		document.getElementById('bar1-contents').innerHTML = "Real Size";
	} else {
		document.getElementById('bar1-contents').innerHTML =
			parseInt(Math.round(minMajorPlanetSize)) + '&times;';
	}
}

function updateMoonSize() {
	// Update minimum graphical size of moons based on user input

	var bar = document.getElementById("bar2").style.width;

	minVisibleMajorSatelliteSize = parseFloat(bar.substr(0,bar.length-1)) / 2;
	if (minVisibleMajorSatelliteSize > 50) {
		minVisibleMajorSatelliteSize = 50;
	}

	if (minVisibleMajorSatelliteSize == 0) {
		document.getElementById('bar2-contents').innerHTML = "Real Size";
	} else {
		document.getElementById('bar2-contents').innerHTML =
			minVisibleMajorSatelliteSize + '&times;';
	}
}

function updateSunSize() {
	// Update minimum sun size from user input

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

function updateShowGrid() {
	// Update whether to show the grid
	displayGridHelper = document.getElementById("testc").checked;
}

function addBodyFromName(bodyName) {
	// Add body from body name

	// Check if body is already in the scene, if not, add it
	if (getBody(bodyName) == -1) {
		// TODO: change default settings
		addBody(new constructBody(name=bodyName,
			radius="200",
			type="dwarf",
			shininess=0.03,
			axialtilt=0,
			rotationperiod=1e9,
			imageLocation="images/ceresTexture.jpg"));
	}

	// Moves the camera to the body, sets the focus body, and redraws orbits
	setTimeout(function() {
		var focusBody = getBody(bodyName);
		shiftCameraFocus(focusBody);
		drawOrbits();
	}, 250);
}

function deleteBodyFromName(bodyName) {
	// TODO: Fix function
	var bodyIndex = getBody(bodyName);

	var objct = bodies[bodyIndex].object;
	console.log(objct);
	scene.remove(objct);

	bodies.splice(bodyIndex,1);

	for (i = bodyIndex; i < bodies.length; i++) {
		console.log(bodyIndex,bodies[bodyIndex]);
		bodies[bodyIndex].object.name = i;
	}
}

function doGoTo(override = null) {
	// Pans and zooms the camera to a certain object

	// Body name, sets to override if override is given
	var bodyName = null;
	if (override) {
		bodyName = override;
	} else {
	  bodyName = document.getElementById("goto").value.replace(/ /g,'').toLowerCase();
	}

	var loweredBodyName = bodyName.replace(/ /g,'').toLowerCase();

	for (i = 0; i < bodies.length; i++) {
		// If a match is found, dolly into it after a 1 second delay (for the pan)
		if (bodies[i].name.replace(/ /g,'').toLowerCase() === loweredBodyName) {
			if (focusBody == i) return;

			focusBody = i;
			shiftCameraFocus(i);
			var j = i;

			setTimeout(function() {
				controls.smoothDollyIntoBody(j)
			}, 1020);
			return;
		}
	}

	// Default settings
	addBody(new constructBody(name=bodyName,
		radius="200",
		type="dwarf",
		shininess=0.03,
		axialtilt=0,
		rotationperiod=1e9,
		imageLocation="images/ceresTexture.jpg"));

	// Shift focus to new body
	shiftCameraFocus(bodies.length-1);
	drawOrbits();
}

window.onload = function() {
	// First call to requestAnimationFrame

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
 rotationperiod = null,
 imageLocation = null) {
	 // Constructor for a body
	this.name = name;
	this.radius = radius;
	this.type = type;
	this.shininess = shininess;
	this.axialtilt = axialtilt;
	this.rotationperiod = rotationperiod;
	this.imageLocation = imageLocation;
}

function addBody(body) {
	if (!body.object) {
		THREE.ImageUtils.crossOrigin = '';
		var bodyTexture,bodyMaterial;

		// Load texture as a spherical refraction mapping (equirectangular proj.)
		if (body.imageLocation) {
			bodyTexture = loader.load(imageLocation,THREE.SphericalRefractionMapping);
		} else {
			bodyTexture = loader.load('images/' +
				body.name.toLowerCase() +
				'Texture.jpg', THREE.SphericalRefractionMapping);
		}

		if (body.type === "star") {
			// Material for sun
			bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture,
				emissive: 'white',
				emissiveIntensity: sunEmissive});
		} else {
			// Material for any other object
			if (body.shininess) {
				bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture,
					shininess: body.shininess,
					transparent: true});
			} else {
				bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture,
					shininess: 0,
					transparent: true});
			}
		}

		// Mesh of the body (currently only spheres)
		var bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius,
				sphereSegmentPrecision, sphereRingPrecision), bodyMaterial);

		if (body.type === "star") {
			// If the body is the sun...

			var bodyGroup = new THREE.Group();
			bodyGroup.add(bodyMesh);

			// Light source (center of sun)
			var sunLightSource = new THREE.PointLight(0xffffff, 1.7, 100, decay = 0);

			// Material for sun halo
			var glowMaterial = new THREE.ShaderMaterial(
				{uniforms: {
					"c": { type: "f",
					value: 0.2 },
					"p": { type: "f",
					value: 1.2 },
					glowColor: {type: "c", value: new THREE.Color(0xffff66)},
					viewVector: {type: "v3", value: camera.position}
				},
				vertexShader: document.getElementById('vertexShader').textContent,
				fragmentShader: document.getElementById('fragmentShader').textContent,
				side: THREE.FrontSide,
				blending: THREE.AdditiveBlending,
				transparent: true});

			glowMaterial.depthTest = true;

			// Sun halo mesh
			var sunGlow = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.7,
				sphereSegmentPrecision, sphereRingPrecision), glowMaterial);

			bodyGroup.add(sunGlow);

			sunLightSource.position.set(0, 0, 0);
			bodyGroup.add(sunLightSource);

			bodyMesh = bodyGroup;
		}

		if (body.name === "Saturn") {
			// If body is Saturn
			var bodyGroup = new THREE.Group();

			bodyGroup.add(bodyMesh);

			// Mesh for rings (XRingGeometry)
			var rings = new THREE.Mesh(new THREE.XRingGeometry(1.2 * body.radius,
				2 * body.radius, 64, 5, 0, Math.PI * 2),
			 new THREE.MeshBasicMaterial({ map: loader.load('images/saturnRings.png'),
			  side: THREE.DoubleSide, transparent: true, opacity: 0.6 }))

			// Position rings to coincide with Saturn
			rings.position.x = bodyMesh.position.x;
			rings.position.y = bodyMesh.position.y;
			rings.position.z = bodyMesh.position.z;

			bodyGroup.add(rings);

			bodyMesh = bodyGroup;
		}

		if (bodyMesh.children.length > 0) {
			for (child = 0; child < bodyMesh.children.length; child++) {
				// For every child of the mesh, set its name to its index in bodies
				bodyMesh.children[child].name = bodies.length;
			}
		} else {
			bodyMesh.name = bodies.length;
		}

		scene.add(bodyMesh);

		// Configure the object in bodies
		body.object = bodyMesh;
		bodies.push(body);
	}
}

function Vector3toArray(v) {
	// Convert a THREE.Vector3 to an array
	return [v.x,v.y,v.z];
}

function getBody(name) {
	// Get body index corresponding with the given name (space and case-sensitive, -1 if none found)
	for (i = 0; i < bodies.length; i++) {
		if (bodies[i].name === name) {
			return i;
		}
	}
	return -1;
}

function getBodyPosition(bodyIndex,asVector = true) {
	// Get position of a body, given its index

	var positionVector = null;

	// Get position of different object, depending on whether it has children
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
	// Set body position from a THREE.Vector3
	setBodyPosition(bodyIndex,v.x,v.y,v.z);
}

function setBodyPosition(bodyIndex,x,y,z) {
	// Set body position to (x,y,z)
	if (bodies[bodyIndex].object.children.length > 0) {
		for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
			// Set all children of a body to position (x,y,z)
			bodies[bodyIndex].object.children[child].position.set(x,y,z);
		}
	} else {
		bodies[bodyIndex].object.position.set(x,y,z);
	}
}

function setOpacity(bodyIndex,opacity) {
	// Set the opacity of a body, given its index

	if (bodies[bodyIndex].name === 'Saturn') {
		// Special handler for Saturn
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
	// Update positions (and rotations) of all bodies
	for (i = 0; i < bodies.length; i++) {
		updateBodyPosition(i);
		updateBodyRotation(i);
	}

	// Increment days by necessary amount
	days += timeWarp/60;
}

function updateBodyPosition(bodyIndex) {
	// Set position of bodies[bodyIndex] to calculated position
	var positionVector = calculateBodyPosition(bodies[bodyIndex].name,days);

	if (positionVector) setBodyPositionVector(bodyIndex,positionVector);
}

function updateBodyRotation(bodyIndex) {
	// Update the rotation of a body
	if (bodies[bodyIndex].hasOwnProperty('rotationperiod')) {
		// If a rotation period has been defined...

		// Two tilts, one is rotation about the axis and one is the tilt of the axis relative to the ecliptic
		var ytilt = (days / (bodies[bodyIndex].rotationperiod) * 2 * Math.PI) % (2 * Math.PI);
		var xtilt = bodies[bodyIndex].axialtilt * Math.PI/180;

		if (bodies[bodyIndex].object.children.length > 0) {
			for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
				// Tilt every child
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
	// Get position of object

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
	// Scale object by scaleFactor

	if (bodies[bodyIndex].object.children.length > 0) {
		for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
			// Set scale of all children
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
	// Get distance from camera to bodies[bodyIndex]
	var cameraPos = camera.position;
	var bodyPos = getBodyPosition(bodyIndex);
	return Math.hypot(cameraPos.x - bodyPos.x,
		cameraPos.y - bodyPos.y,
		cameraPos.z - bodyPos.z);
}

function getScaleFactor(bodyPixelSize,bodyType,cameraDistance) {
	// Calculate factor by which to scale up a body so it meets size requirements

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

// Position, identity of previous focusBody
var lastFocusBodyPosition = new THREE.Vector3(0,0,0);
var lastFocusBody = null;

// Shift of target relative to Sun since last frame
var targetShift = new THREE.Vector3();

function updateCameraTracking() {
	// Update tracking of the camera
	// TODO: fix lockBody tracking

	if (focusBody != null) {
		var focusBodyPosition = getBodyPosition(focusBody);

		if (!controls.zooming && !controls.moving && focusBody == lastFocusBody) {
			if (focusBodyPosition != null) {
				if (lockBody) {
					// Shift camera by change in position since last frame
					camera.position.set(camera.position.x + focusBodyPosition.x - lastFocusBodyPosition.x,
						camera.position.y + focusBodyPosition.y - lastFocusBodyPosition.y,
						camera.position.z + focusBodyPosition.z - lastFocusBodyPosition.z);
				} else if (trackBody) {
					// Shift camera focus to target body
					instantShiftCameraFocus(focusBody);
				}
			}
		}

		// Update previous focusBodyPosition
		lastFocusBodyPosition.copy(focusBodyPosition);
		lastFocusBody = focusBody;
	}
}

// Materials for orbits

var planetOrbitMaterial = new THREE.LineBasicMaterial({
	color: orbitColor,
	opacity: planetOrbitOpacity,
	transparent: true
});

var dwarfOrbitMaterial = new THREE.LineBasicMaterial({
	color: orbitColor,
	opacity: dwarfOrbitOpacity,
	transparent: true
})

var highlightedOrbitMaterial = new THREE.LineBasicMaterial({
	color: 0x00ffff,
	opacity: 0.7,
	transparent: true
})

var invisibleOrbitMaterial = new THREE.LineBasicMaterial({
	color: 0x000000,
	opacity: 1,
	transparent: true
})

function drawOrbits() {
	// Draws the orbits

	for (i = 0; i < bodies.length; i++) {
		// Try to remove the previous orbit
		try {
			var previousOrbit = scene.getObjectByName(bodies[i].name + "Orbit");
			scene.remove(previousOrbit);
			previousOrbit.dispose();
		} catch (e) {
			;
		}

		// Get type of body
		var bodyType = bodies[i].type;

		if ((bodyType === "planet") || (bodyType === "dwarf") || i == focusBody) {
			// If an orbit should be drawn...

			var geometry = new THREE.Geometry();
			var period = getOrbitalPeriod(i);
			var material = null;

			// Find correct material
			if (i == focusBody) {
				material = highlightedOrbitMaterial;
			} else if (bodyType === "planet") {
				material = planetOrbitMaterial;
			} else if (bodyType === "dwarf") {
				material = dwarfOrbitMaterial;
			} else {
				material = planetOrbitMaterial;
			}

			// Calculate vertices of orbit (precision = 200 points / revolution)
			for (j = 0; j < 200; j++) {
				geometry.vertices.push(calculateBodyPosition(bodies[i].name,days + period * j / 200));
			}
			geometry.vertices.push(calculateBodyPosition(bodies[i].name,days));

			var line = new THREE.Line(geometry, material);
			line.name = bodies[i].name + "Orbit";
			scene.add(line);
		}
	}
}

function get2DPosition(bodyIndex) {
	// Get 2D position of bodies[bodyIndex] on screen

	var p = getBodyPosition(bodyIndex).clone();
  var vector = p.project(camera);
  return [(vector.x + 1) / 2 * textCanvas.width, -(vector.y - 1) / 2 * textCanvas.height];
}

function clearOverlay() {
	// Clear textCanvas
	textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
}

function updateSprites() {
	// Update text labels on textCanvas

	clearOverlay();

	// Stylling
	textContext.font = "12px Trebuchet";
	textContext.textAlign = "left";

	var sunPosition = getBodyPosition(getBody('Sun'));

	for (i = 0; i < bodies.length; i++) {
		var bodyPosition = getBodyPosition(i);
		if (frustum.containsPoint(bodyPosition)) {
			// Frustum check is used so that bodies behind the camera do not make text labels
			var dist = bodyPosition.distanceTo(sunPosition);

			// Calculate opacity based on distance to Sun
			if (dist < currentSunSize) {
				var opacity = Math.min(
					Math.max((dist - 2.5 * (currentSunSize - dist)) / currentSunSize, 0),
					labelOpacity.val);

				if (opacity == 0) continue;
				textContext.fillStyle = labelColor + String(opacity) + ')';
			} else {
				textContext.fillStyle = labelColor + String(labelOpacity.val) + ')';
			}

			var pos = get2DPosition(i);

			textContext.fillText(bodies[i].name, pos[0], pos[1]);
		}
	}
}

// Exponent of time warp calculation
var timeWarpFactor = 2.354367640272;

function updateTimeWarp() {
	// Update the time warp from user input

	var bar = document.getElementById("bar3").style.width;

	// unmodifiedWarp is from 0 to 100
	var unmodifiedWarp = parseFloat(bar.substr(0,bar.length-1));
	if (unmodifiedWarp > 100) {
		unmodifiedWarp = 100;
	}

	var modifiedWarp = 0;
	document.getElementById('bar3-contents').innerHTML = "Frozen";

	// Calculate modified Warp: 0 = Frozen, 1 = Real Time, 2+ ~= 0.01956 * w ^ 2.35437
	if (unmodifiedWarp > 0) {
		if (unmodifiedWarp <= 1) {
			// Real time
			modifiedWarp = 1/86400.0;
			document.getElementById('bar3-contents').innerHTML = "Real Time";
		} else {
			modifiedWarp = 0.0195553106517 * Math.pow(unmodifiedWarp,timeWarpFactor) + 0.1;
			document.getElementById('bar3-contents').innerHTML = String(modifiedWarp).substr(0,7) + ' days / sec';
		}
	}

	timeWarp = modifiedWarp;
}

// Whether to show labels
var showLabels = true;

// Opacity of label
var labelOpacity = {val:1};

// Number of queries in the <ul>
var queries = 0;

// Function that does nothing
var nullFunc = function() {};

function _asyncSearchBodies(query,index,handler) {
	// Asynchronous loop for the search

	for (i = index; i < Math.min(index + 100,knownBodyNames.length); i++) {
		// Look through items between index and index+100
		if (knownBodyNames[i].toLowerCase().replace(/ /g,'').includes(query)) {
			// If matching body is found, handle it
			if (handler(query,i)) return;
		}
	}

	if (index + 100 > knownBodyNames.length) {
		// If the search is complete, pass -1 to handler
		handler(query,-1);
		return;
	}

	setTimeout(function() {
		_asyncSearchBodies(query,index+100,handler)
	});
}

function asyncSearch(query,handler) {
	// FUnction call to _asyncSearchBodies
	_asyncSearchBodies(query.toLowerCase(),0,handler);
}

function searchBody(bodyName) {
	// Search for a body, given bodyName

	// Remove spaces, make lower case
	currentQuery = bodyName.replace(/ /g,'').toLowerCase();

	// Clear the existing list
	clearSearchList();

	// Call the search function
	asyncSearch(currentQuery.slice(),
		function(query,i) {
			// Entry handler
			if (i == -1) return false;
			if (query !== currentQuery) {
				clearSearchList();
				return true;
			} else {
				// If something is found, append it to the <ul>
	  		appendToSearchList(knownBodyNames[i]);

				// Stop the search if more than 20 things have been found
				return (queries >= 20);
			}
		});
}

function clearSearchList() {
	// Clear the search list <ul> and reset queries
	queries = 0;
	document.getElementById('search-results').innerHTML = '';
}

function appendToSearchList(name) {
	// Append to the search list <ul> and increment queries
	queries += 1;
	document.getElementById('search-results').innerHTML += "<li onclick=" + "'addBodyFromName(\"" + name + "\")'" + ">" + name + "</li>";
}

function interpolateColors(c1,c2,v) {
	// Linearly interpolate between two colors
	return new THREE.Color(c1.r + (c2.r - c1.r) * v,
		c1.g + (c2.g - c1.g) * v,
		c1.b + (c2.b - c1.b) * v);
}

function smoothInterpolate(x,k,time=500,cnstFunc=function(){},propt='val') {
	// Interpolate x[propt] between current value and k in time ms

	if (time < 20) {
		x[propt] = k;
		return;
	}

	x[propt] = x[propt] + (k-x[propt]) / (time * 60) * 1000;
	cnstFunc();

	setTimeout(function() {
		smoothInterpolate(x, k, time - 1000.0/60.0, cnstFunc, propt)
	}, 1000.0/60.0);
}
