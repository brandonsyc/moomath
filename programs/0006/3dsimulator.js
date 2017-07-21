var renderer,scene,camera,controls,raycaster,mouse,rendererStats;

// Texture loader
var loader = new THREE.TextureLoader();

var bodies = [];

// bodies[0] is always the sun, bodies[1] is mercury, bodies[2] is venus, bodies[3] is earth, etc., until bodies[7]: neptune. The remaining ones are dynamically allocated.

// Format of body in bodies: [three.js element, second element (if necessary, otherwise null), name, radius (1/100 AU), type, mass]

// Types: star = sun, planet = one of 8 planets, dwarf = one of the dwarf planets, majorsat = round moon, minorsat = irregular moon

// Precision of spheres
var sphereSegmentPrecision = 32;
var sphereRingPrecision = 32;

// Minimum star size
var minStarSize = 50;

// Minimum major planet
var minMajorPlanetSize = 48;

// Minimum dwarf planet
var minDwarfPlanetSize = 23;

// Minimum major satellite size
var minVisibleMajorSatelliteSize = 25;

// Distance at which major satellites are displayed, in 1/100 AU
var majorSatelliteDisplayDistance = 1000000000;

// Size at which planets are not displayed

// Show planets to scale or not (true: show true scale, false: show mins)
var trueScale = false;

// Between 0 and 1, scale factor of planets
var planetScaleFactor = 0.5;

// Body which the camera is pointing at
var focusBody = null;

// Convert 1/100 AU to kilometers
var AUtokm = 1.496e6;

// The positions of the bodies
var bodyPositions = {
Sun:[0,0,0],
Mercury:[-39.0194060099,2.38758068596,-14.5885671894,
1.30415112897 * AUtokm,-0.2804456443263 * AUtokm,-1.9679060038 * AUtokm],
Venus:[72.5136170661,-4.16432596262,1.47040747204],
Earth:[37.7892192997,0.00387667752922,-94.3616270401],
Moon:[38.0439865727,-0.00668693660424,-94.4023730406],
Mars:[-77.0553248556,4.90073104281,143.621148364],
Jupiter:[-492.428344472,11.9884295423,-233.522256309],
Saturn:[-85.3633985402,20.8155818981,-1002.10904643],
Uranus:[1802.14184064,-20.1825994952,848.656425163],
Neptune:[2852.41589213,-46.9753950288,-911.188165466],
Ganymede:[-492.735008671,11.9599525915,-234.168031998],
Callisto:[-491.285603673,11.9876009973,-234.029948286],
Io:[-492.35950765,11.9796949816,-233.795046294],
Europa:[-492.089215333,11.9816113415,-233.820948653],
Pluto:[1025.56188422,42.9536504448,-3174.83082786],
Titan:[-84.5729151643,20.7666057257,-1002.16625217],
Titania:[1802.30573287,-19.9412778803,848.654236274],
Ceres:[29.1770247393,3.01001246499,266.45869175],
Triton:[2852.34464407,-47.0962957406,-911.379328695],
Iapetus:[-86.6077562811,20.5944187799,-1000.06730292],
Tethys:[-85.2039736091,20.7494902911,-1002.01407282],
Dione:[-85.511871372,20.9211865396,-1002.28326267]
};

function addBodies() {
	addBody(new constructBody(name="Mercury",radius="2439.7",type="planet",shininess=0.1,mass="3.302e23"));
	addBody(new constructBody(name="Venus",radius="6051.8",type="planet",shininess=0.65));
	addBody(new constructBody(name="Earth",radius="6371", type="planet",shininess=0.36));
	addBody(new constructBody(name="Mars",radius="3389.5", type="planet",shininess=0.15));
	addBody(new constructBody(name="Jupiter",radius="69911", type="planet",shininess=0.34));
	addBody(new constructBody(name="Saturn",radius="58232", type="planet",shininess=0.34));
	addBody(new constructBody(name="Uranus",radius="25362", type="planet",shininess=0.34));
	addBody(new constructBody(name="Neptune",radius="24622", type="planet",shininess=0.34));
	addBody(new constructBody(name="Sun",radius="696342", type="star",shininess=0.03,mass=1.988544e30));
	addBody(new constructBody(name="Ganymede",radius="2634.1", type="majorsat",shininess=0.03));
	addBody(new constructBody(name="Titan",radius="2576", type="majorsat",shininess=0.03));
	addBody(new constructBody(name="Callisto",radius="2410.3",type="majorsat",shininess=0.03));
	addBody(new constructBody(name="Io",radius="1821.6",type="majorsat"));
	addBody(new constructBody(name="Moon",radius="1737.1",type="majorsat"));
	addBody(new constructBody(name="Europa",radius="1560.8",type="majorsat"));
	addBody(new constructBody(name="Triton",radius="1353.4",type="majorsat"));
	addBody(new constructBody(name="Pluto",radius="1186",type="dwarf"));
	addBody(new constructBody(name="Titania",radius="788.4",type="majorsat"));
	addBody(new constructBody(name="Iapetus",radius="734.5",type="majorsat"));
	addBody(new constructBody(name="Tethys",radius="531.1",type="majorsat"));
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

// Sun emissiveIntensity
var sunEmissive = 0.9;

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

	requestAnimationFrame(update);

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.addEventListener('click', onDocumentClick, false);
	document.addEventListener( 'dblclick', onDocumentDblClick, false );
}

function getObjects() {
	var objects = [];
	for (i = 0; i < bodies.length; i++) {
		objects.push(bodies[i].object);
	}
	return objects;
}

function shiftCameraFocus(x,y=null,z=null) {
	if (y != null && z != null) {
		//camera.lookAt(new THREE.Vector3(x,y,z));
		controls.smoothPanIntoBody(x,y,z);
	} else {
		//camera.lookAt(x);
		controls.target = x;
	}
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
		var x,y,z;
		if (intersects[0].object.children.length > 0) {
			x = intersects[0].object.children[0].position.x;
			y = intersects[0].object.children[0].position.y;
			z = intersects[0].object.children[0].position.z;
		} else {
			x = intersects[0].object.position.x;
			y = intersects[0].object.position.y;
			z = intersects[0].object.position.z;
		}
		shiftCameraFocus(x,y,z);

		focusBody = intersects[0];
	} else {
		if (!controls.moving) {
			lastClickedEntity = null;
		}
	}
}

function onDocumentDblClick(event) {
	event.preventDefault();

	if (lastClickedEntity) {
		var x = lastClickedEntity.object.position.x;
		var y = lastClickedEntity.object.position.y;
		var z = lastClickedEntity.object.position.z;
		shiftCameraFocus(x,y,z);

		var vFOV = camera.fov * Math.PI / 180;
		var cameraDistance = Math.hypot(
			controls.target.x-camera.position.x,
			controls.target.y-camera.position.y,
			controls.target.z-camera.position.z);
		var height = Math.tan(vFOV / 2) * cameraDistance;
		var bodySize = bodies[lastClickedEntity.object.name].radius;

		controls.smoothDollyIntoBody(bodySize);

		focusBody = lastClickedEntity;
	}
}

var lastUpdate = 0;
var finished = false;

function update() {
	// Update the animation frame

	var vFOV = camera.fov * Math.PI / 180;

	for (i = 0; i < bodies.length; i++) {
		if (bodies[i].object.children.length === 0) {
		var cameraDistance = Math.hypot(
			bodies[i].object.position.x-camera.position.x,
			bodies[i].object.position.y-camera.position.y,
			bodies[i].object.position.z-camera.position.z);
		var height = 2 * Math.tan(vFOV / 2) * cameraDistance;
		var bodyPixelSize = bodies[i].radius / height * window.innerHeight;

		var scaleFactor = 1;

		if (!trueScale) {
			if (bodies[i].type == "star") {
				if (bodyPixelSize < minStarSize * planetScaleFactor + 1) {
					scaleFactor = (minStarSize * planetScaleFactor + 1) / bodyPixelSize;
				}
			} else if (bodies[i].type == "planet") {
				if (bodyPixelSize < minMajorPlanetSize * planetScaleFactor + 1) {
					scaleFactor = (minMajorPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
				}
			} else if (bodies[i].type == "dwarf") {
				if (bodyPixelSize < minDwarfPlanetSize * planetScaleFactor + 1) {
					scaleFactor = (minDwarfPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
				}
			} else if (bodies[i].type == "majorsat") {
				if (cameraDistance < majorSatelliteDisplayDistance) {
					if (bodyPixelSize < minVisibleMajorSatelliteSize * planetScaleFactor + 1) {
						scaleFactor = (minVisibleMajorSatelliteSize * planetScaleFactor + 1) / bodyPixelSize;
					}
				}
			}
		}

		bodies[i].object.scale.x = scaleFactor;
		bodies[i].object.scale.y = scaleFactor;
		bodies[i].object.scale.z = scaleFactor;

		if (bodyPixelSize * scaleFactor < 0.01) {
			bodies[i].object.visible = false;
		} else {
			bodies[i].object.visible = true;
		}
		} else {
		var cameraDistance = Math.hypot(
			bodies[i].object.position.x-camera.position.x,
			bodies[i].object.position.y-camera.position.y,
			bodies[i].object.position.z-camera.position.z);
		var height = 2 * Math.tan(vFOV / 2) * cameraDistance;
		var bodyPixelSize = bodies[i].radius / height * window.innerHeight;

		var scaleFactor = 1;

		if (!trueScale) {
			if (bodies[i].type == "star") {
				if (bodyPixelSize < minStarSize * planetScaleFactor + 1) {
					scaleFactor = (minStarSize * planetScaleFactor + 1) / bodyPixelSize;
				}
			} else if (bodies[i].type == "planet") {
				if (bodyPixelSize < minMajorPlanetSize * planetScaleFactor + 1) {
					scaleFactor = (minMajorPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
				}
			} else if (bodies[i].type == "dwarf") {
				if (bodyPixelSize < minDwarfPlanetSize * planetScaleFactor + 1) {
					scaleFactor = (minDwarfPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
				}
			} else if (bodies[i].type == "majorsat") {
				if (cameraDistance < majorSatelliteDisplayDistance) {
					if (bodyPixelSize < minVisibleMajorSatelliteSize * planetScaleFactor + 1) {
						scaleFactor = (minVisibleMajorSatelliteSize * planetScaleFactor + 1) / bodyPixelSize;
					}
					console.log(3,bodies[i].name);
				}
			}
		}
		bodies[i].object.scale.x = scaleFactor;
		bodies[i].object.scale.y = scaleFactor;
		bodies[i].object.scale.z = scaleFactor;

		if (bodyPixelSize * scaleFactor < 0.01) {
			bodies[i].object.visible = false;
		} else {
			bodies[i].object.visible = true;
		}
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
				scene.remove(scene.getObjectByName('gridy'));
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
  	renderer.render(scene, camera);

	if (!finished && new Date().getTime() - lastUpdate < 1000/30.0) {
		finished = true;
		console.log("Finished setup #2");
	}
	lastUpdate = new Date().getTime();
	rendererStats.update(renderer);
  	requestAnimationFrame(update);

	updateMercury();
}

window.addEventListener('resize', function() {
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });

function updatePlanetarySize() {
	var bar = document.getElementById("bar1").style.width;
	minMajorPlanetSize = parseFloat(bar.substr(0,bar.length-1));
	if (minMajorPlanetSize > 100) {
		minMajorPlanetSize = 100;
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
			var x = bodies[i].object.position.x;
			var y = bodies[i].object.position.y;
			var z = bodies[i].object.position.z;
			focusBody = bodies[i].object;
			shiftCameraFocus(x,y,z);

			var bodySize = bodies[i].radius;
			setTimeout(function() {controls.smoothDollyIntoBody(bodySize)},1020);
		}
	}
}

window.onload = function() {
	console.log("Finished setup.");
}

init();

// General body properties: (example is Earth)
// name: "Earth"
// radius: 0.0042
// type: planet
// shininess: 0.03
// imageLocation: earthTexture.jpg (or blank)
// coords: new THREE.Vector3(x,y,z)
// velocity: new THREE.Vector3(x,y,z)
// mass: 5.9722e24

function constructBody(name = null,
 radius = null,
 type = null,
 shininess = null,
 mass = null,
 imageLocation = null,
 coords = null,
 velocity = null,
 object = null) {
	this.name = name;
	this.radius = radius;
	this.type = type;
	this.shininess = shininess;
	this.imageLocation = imageLocation;
	this.coords = coords;
	this.velocity = velocity;
	this.mass = mass;
	this.object = object;
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
				bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture, shininess: body.shininess});
			} else {
				bodyMaterial = new THREE.MeshPhongMaterial({map: bodyTexture, shininess: 0});
			}
		}

		var bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius,
				sphereSegmentPrecision, sphereRingPrecision), bodyMaterial);

		if (body.coords) {
			if (body.coords instanceof THREE.Vector3) {
				bodyMesh.position = body.coords;
			} else {
				bodyMesh.position.x = body.coords.x;
				bodyMesh.position.y = body.coords.y;
				bodyMesh.position.z = body.coords.z;
			}
		} else {
			bodyMesh.position.x = bodyPositions[body.name][0];
			bodyMesh.position.y = bodyPositions[body.name][1];
			bodyMesh.position.z = bodyPositions[body.name][2];
		}

		bodyMesh.position = bodyMesh.position.multiplyScalar(AUtokm);
		
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

		bodyMesh.name = bodies.length;
		
		scene.add(bodyMesh);

		body.object = bodyMesh;
		bodies.push(body);
	}
}

function getBody(name) {
	for (i = 0; i < bodies.length; i++) {
		if (bodies[i].name === name) {
			return i;
		}
	}
}

function updateMercury() {
	mercuryIndex = getBody("Mercury");
	sunIndex = getBody("Sun");

	mercuryPos = bodies[mercuryIndex].object.position;

	var distance = Math.hypot(0 - mercuryPos.x, 0 - mercuryPos.y, 0 - mercuryPos.z);
	var magnitude = 3.9405e-10 * bodies[sunIndex].mass / (distance * distance);
	var ax = magnitude * (0 - mercuryPos.x) / distance;
	var ay = magnitude * (0 - mercuryPos.y) / distance;
	var az = magnitude * (0 - mercuryPos.z) / distance;
	bodyPositions['Mercury'][3] += ax;
	bodyPositions['Mercury'][4] += ay;
	bodyPositions['Mercury'][5] += az;

	mercuryPos.x += bodyPositions['Mercury'][3];
	mercuryPos.y += bodyPositions['Mercury'][4];
	mercuryPos.z += bodyPositions['Mercury'][5];
	/**var G = 8.9405e-12;
	var distance = Math.hypot(mercuryPos.x,mercuryPos.y,mercuryPos.z);
	var magnitude = G * (bodies[sunIndex].mass) / (distance * distance * distance);
	bodyPositions['Mercury'][3] -= magnitude * mercuryPos.x;
	bodyPositions['Mercury'][4] -= magnitude * mercuryPos.y;
	bodyPositions['Mercury'][5] -= magnitude * mercuryPos.z;**/
	console.log(bodyPositions['Mercury']);
	console.log(mercuryPos,distance,magnitude);
	bodies[mercuryIndex].object.position = mercuryPos;
}
