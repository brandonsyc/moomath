var renderer,scene,camera,controls,raycaster,mouse;

var bodies = [];
var sunLightSource = null;

// bodies[0] is always the sun, bodies[1] is mercury, bodies[2] is venus, bodies[3] is earth, etc., until bodies[7]: neptune. The remaining ones are dynamically allocated.

// Format of body in bodies: [three.js element, second element (if necessary, otherwise null), name, radius (1/100 AU), type, information, point underneath obj]

// Types: star = sun, planet = one of 8 planets, dwarf = one of the dwarf planets, majorsat = round moon, minorsat = irregular moon

// Precision of spheres
var sphereSegmentPrecision = 32;
var sphereRingPrecision = 32;

// Size of glow relative to sun
var sunGlowScale = 1.2;

// Minimum star size
var minStarSize = 50;

// Minimum major planet
var minMajorPlanetSize = 30;

// Minimum dwarf planet
var minDwarfPlanetSize = 15;

// Minimum major satellite
var minVisibleMajorSatelliteSize = 12;

// Distance at which major satellites are displayed, in 1/100 AU
var majorSatelliteDisplayDistance = 0.2;

// Size at which planets are not displayed

// Show planets to scale or not (true: show true scale, false: show mins)
var trueScale = false;

// Between 0 and 1, scale factor of planets
var planetScaleFactor = 0.3;

var focusBody = null;

var subdots = [];

var bodyPositions = {
Mercury:[-39.0194060099,2.38758068596,-14.5885671894],
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

// Display GridHelper
var displayGridHelper = true;

var cGrid = null;

var cGridTransZ = 0;
var cGridTransY = 0;
var cGridTransX = 0;

var cGridLineWidth = 10;

// Align grid to object
var alignGridToTarget = false;

// Gridline color
var alignGridColor = "#777777";

// Sun emissiveIntensity
var sunEmissive = 0.95;

var subDots = [];

function init() {
		var VIEW_ANGLE = 45;
		var ASPECT = window.innerWidth / window.innerHeight;
		var NEAR = 0.000001;
		var FAR = 1000000;

		container = document.querySelector('#container');
		renderer = new THREE.WebGLRenderer({antialias: true });
		camera =
		    new THREE.PerspectiveCamera(
		        VIEW_ANGLE,
		        ASPECT,
		        NEAR,
		        FAR
		    );

		scene = new THREE.Scene();

		camera.position.y = 16;
		camera.position.z = 250;

		scene.add(camera);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.context.disable(renderer.context.DEPTH_TEST);

		addSun();
		addPlanets();
		addMoons();
		addDwarves();

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
		controls.keyPanSpeed = 2;
		renderer.render(scene, camera);

		requestAnimationFrame(update);

		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		document.addEventListener('click', onDocumentClick, false);
		document.addEventListener( 'dblclick', onDocumentDblClick, false );
}

function getObjects() {
		var objects = [];
		for (i = 0; i < bodies.length; i++) {
				objects.push(bodies[i][0]);
				objects[i].name = i;
		}
		return objects;
}

function shiftCameraFocus(x,y=null,z=null) {
		if (y != null && z != null) {
				//camera.lookAt(new THREE.Vector3(x,y,z));
				controls.target = new THREE.Vector3(x,y,z)
		} else {
				//camera.lookAt(x);
				controls.target = x;
		}
		camera.fov = 45;
		camera.updateProjectionMatrix();
}

var dblClickSFRT = null;

function onDocumentClick( event, run = false) {

		event.preventDefault();

		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(getObjects(), true);

		if (intersects.length > 0) {
				try {
						dblClickSFRT.cancel();
				} catch (e) {;}

				dblClickSFRT = setTimeout(function() {onDocumentClick(event, run=true)}, 500);

				if (run) {
						var x = intersects[0].object.position.x;
						var y = intersects[0].object.position.y;
						var z = intersects[0].object.position.z;
						shiftCameraFocus(x,y,z);

						focusBody = intersects[0];
				}
		}
}

function onDocumentDblClick(event) {
		event.preventDefault();

		mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(getObjects(), true);

		if (intersects.length > 0) {
				try {
						dblClickSFRT.cancel();
				} catch (e) {;}

				var x = intersects[0].object.position.x;
				var y = intersects[0].object.position.y;
				var z = intersects[0].object.position.z;
				shiftCameraFocus(x,y,z);

				var vFOV = camera.fov * Math.PI / 180;
				var cameraDistance = Math.hypot(
					controls.target.x-camera.position.x,
					controls.target.y-camera.position.y,
					controls.target.z-camera.position.z);
				var height = Math.tan(vFOV / 2) * cameraDistance;
				var bodySize = bodies[intersects[0].object.name][3] / height;

				controls.smoothDollyIntoBody(0.25 / bodySize);

				focusBody = intersects[0];
		}
}

function onDocumentClick(event) {
		event.preventDefault();

		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(getObjects(), true);

		if (intersects.length > 0) {
				var x = intersects[0].object.position.x;
				var y = intersects[0].object.position.y;
				var z = intersects[0].object.position.z;

				focusBody = intersects[0].object;

				shiftCameraFocus(x,y,z);
		}
}

function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {top: _y, left: _x};
}

function renderComparator(obj1, obj2) {
   if (obj1[1] < obj2[1]) return 1;
   if (obj1[1] > obj2[1]) return -1;
   return 0;
 }

function updateRenderOrder() {
		/* Updates the render order of all objects based on their distance,
		 a more accurate render compared to that produced by the z-buffer. */
		var objDist = [];
		for (i = 0; i < bodies.length; i++) {
				objDist.push([bodies[i][0], Math.hypot(
					bodies[i][0].position.x-camera.position.x,
					bodies[i][0].position.y-camera.position.y,
					bodies[i][0].position.z-camera.position.z)])
				if (bodies[i][1]) {
					objDist.push([bodies[i][1], Math.hypot(
						bodies[i][1].position.x-camera.position.x,
						bodies[i][1].position.y-camera.position.y,
						bodies[i][1].position.z-camera.position.z)])
				}
		}
		objDist = objDist.sort(renderComparator);
		for (i = 0; i < objDist.length; i++) {
				objDist[i][0].renderOrder = i;
		}
		return;
}

function update() {
		// Update the animation frame

		var depthTestDisabled = true;

		var vFOV = camera.fov * Math.PI / 180;

		for (i = 0; i < bodies.length; i++) {
				var cameraDistance = Math.hypot(
					bodies[i][0].position.x-camera.position.x,
					bodies[i][0].position.y-camera.position.y,
					bodies[i][0].position.z-camera.position.z);
				var height = 2 * Math.tan(vFOV / 2) * cameraDistance;
				var bodyPixelSize = bodies[i][3] / height * window.innerHeight;

				var scaleFactor = 1;

				if (cameraDistance < 0.5) {
						renderer.context.enable(renderer.context.DEPTH_TEST);
						depthTestDisabled = false;
				}

				if (!trueScale) {
						if (bodies[i][4] == "star") {
								if (bodyPixelSize < minStarSize * planetScaleFactor + 1) {
										scaleFactor = (minStarSize * planetScaleFactor + 1) / bodyPixelSize;
								}
						} else if (bodies[i][4] == "planet") {
								if (bodyPixelSize < minMajorPlanetSize * planetScaleFactor + 1) {
										scaleFactor = (minMajorPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
								}
						} else if (bodies[i][4] == "dwarf") {
								if (bodyPixelSize < minDwarfPlanetSize * planetScaleFactor + 1) {
										scaleFactor = (minDwarfPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
								}
						} else if (bodies[i][4] == "majorsat") {
								if (cameraDistance < majorSatelliteDisplayDistance) {
										if (bodyPixelSize < minVisibleMajorSatelliteSize * planetScaleFactor + 1) {
												scaleFactor = (minDwarfPlanetSize * planetScaleFactor + 1) / bodyPixelSize;
										}
								}
						}
				}

				bodies[i][0].scale.x = scaleFactor;
				bodies[i][0].scale.y = scaleFactor;
				bodies[i][0].scale.z = scaleFactor;

				if (bodies[i][1]) {
						if (bodies[i][4] == "star") {
								scaleFactor *= sunGlowScale;
						}
						bodies[i][1].scale.x = scaleFactor;
						bodies[i][1].scale.y = scaleFactor;
						bodies[i][1].scale.z = scaleFactor;
				}

				/* constructSubDot(bodies[i][0].position.x,
					alignGridToTarget ? bodies[i][0].position.y : 0,
					bodies[i][0].position.z,
					bodies[i][3] * scaleFactor); */
		}

		var height = 2 * Math.tan(vFOV / 2) *
			Math.hypot(controls.target.x-camera.position.x,
			(alignGridToTarget ? controls.target.y : 0)-camera.position.y,
			controls.target.z-camera.position.z);

		try {
				var newWidth = Math.pow(10, Math.floor(Math.log10(height)) - 1);

				if (newWidth != cGridLineWidth) {
						cGridLineWidth = newWidth;
						scene.remove(scene.getObjectByName('gridy'));
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
		} catch (e) {;}

		controls.update();
		if (depthTestDisabled) {
				updateRenderOrder();
		}
  	renderer.render(scene, camera);

		renderer.context.disable(renderer.context.DEPTH_TEST);

  	requestAnimationFrame(update);
}

window.addEventListener('resize', function() {
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });

init();

function addPlanets() {
		addMercury();
		addEarth();
		addVenus();
		addMars();
		addJupiter();
		addSaturn();
		addUranus();
		addNeptune();
		addMoon();
}

function addMoons() {
		addMoon();
		addGanymede();
		addCallisto();
		addIo();
		addEuropa();
		addTitan();
		addTitania();
		addTriton();
		addIapetus();	// IAPETUSSS!
		addTethys();
		addDione();
}

function addDwarves() {
		addPluto();
		addCeres();
}

// Body data

function addSun() {

		THREE.ImageUtils.crossOrigin = '';
		var sunTexture = THREE.ImageUtils.loadTexture('images/sunTexture.jpg',THREE.SphericalRefractionMapping);

		var sunMaterial = new THREE.MeshPhongMaterial({ map: sunTexture, emissive: "white",
		emissiveIntensity: 0.95, transparent: false});

		var glowMaterial = new THREE.ShaderMaterial(
		{uniforms:{"c": { type: "f", value: 1.0 }, "p": { type: "f", value: 1.4 },
			glowColor: {type: "c", value: new THREE.Color(0xffff66)},
			viewVector: {type: "v3", value: camera.position}
		}, vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true});

		var sun = new THREE.Mesh(new THREE.SphereGeometry(0.46, sphereSegmentPrecision, sphereRingPrecision), sunMaterial);

		sun.overdraw = true;

		sun.position.x = 0;
		sun.position.y = 0;
		sun.position.z = 0;

		sun.name = '0';

		scene.add(sun);

		var sunGlow = new THREE.Mesh(new THREE.SphereGeometry(0.46, sphereSegmentPrecision, sphereRingPrecision), glowMaterial);
		sunGlow.position = sun.position;
		sunGlow.scale.multiplyScalar(sunGlowScale);
		scene.add(sunGlow);

		bodies[0] = [sun, sunGlow, "Sun", 0.46, "star", "test"];

		var sunLightSource = new THREE.PointLight(0xffffff, 1.7, 100, decay = 0);

		sunLightSource.position.set(0, 0, 0);
		scene.add(sunLightSource);
}

function constructSubDot(x,y,z,radius) {
		var subDot = new THREE.Mesh(new THREE.CircleGeometry(radius,sphereRingPrecision),new THREE.LineBasicMaterial({color: 0x000077}));
		subDot.rotateX(Math.PI / 2);
		subDot.material.side = THREE.DoubleSide;
		scene.add(subDot);

		subdots.push(subDot.object);
}

function addMercury() {
		THREE.ImageUtils.crossOrigin = '';
		var mercuryTexture = THREE.ImageUtils.loadTexture('images/mercuryTexture.jpg',THREE.SphericalRefractionMapping);
		var mercuryMaterial = new THREE.MeshPhongMaterial({ map: mercuryTexture, shininess: 0});

		var mercury = new THREE.Mesh(new THREE.SphereGeometry(0.00116, sphereSegmentPrecision, sphereRingPrecision), mercuryMaterial);

		mercury.position.x = bodyPositions.Mercury[0];
		mercury.position.y = bodyPositions.Mercury[1];
		mercury.position.z = bodyPositions.Mercury[2];

		mercury.name = '1';

		scene.add(mercury);

		bodies[1] = [mercury, null, "Mercury", 0.00116, "planet", "udder2"];
}

function addVenus() {
		THREE.ImageUtils.crossOrigin = '';
		var venusTexture = THREE.ImageUtils.loadTexture('images/venusTexture.jpg',THREE.SphericalRefractionMapping);

		var venusMaterial = new THREE.MeshPhongMaterial({ map: venusTexture, shininess: 0});

		var venus = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), venusMaterial);

		venus.position.x = bodyPositions.Venus[0];
		venus.position.y = bodyPositions.Venus[1];
		venus.position.z = bodyPositions.Venus[2];

		venus.name = '2';

		scene.add(venus);

		bodies[2] = [venus, null, "Venus", 0.004, "planet", "udder2"];
}

function addEarth() {
		THREE.ImageUtils.crossOrigin = '';
		var earthTexture = THREE.ImageUtils.loadTexture('images/earthTexture.jpg',THREE.SphericalRefractionMapping);

		var earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 0.03});

		var earth = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), earthMaterial);

		earth.position.x = bodyPositions.Earth[0];
		earth.position.y = bodyPositions.Earth[1];
		earth.position.z = bodyPositions.Earth[2];

		earth.name = '3';

		scene.add(earth);

		bodies[3] = [earth, null, "Earth", 0.0042, "planet", "udder"];
}

function addMars() {
		THREE.ImageUtils.crossOrigin = '';
		var marsTexture = THREE.ImageUtils.loadTexture('images/marsTexture.jpg',THREE.SphericalRefractionMapping);
		var marsMaterial = new THREE.MeshPhongMaterial({ map: marsTexture, shininess: 0});

		var mars = new THREE.Mesh(new THREE.SphereGeometry(0.00226, sphereSegmentPrecision, sphereRingPrecision), marsMaterial);

		mars.position.x = bodyPositions.Mars[0];
		mars.position.y = bodyPositions.Mars[1];
		mars.position.z = bodyPositions.Mars[2];

		mars.name = '4';

		scene.add(mars);

		bodies[4] = [mars, null, "Mars", 0.00226, "planet", "udder2"];
}

function addJupiter() {
		THREE.ImageUtils.crossOrigin = '';
		var jupiterTexture = THREE.ImageUtils.loadTexture('images/jupiterTexture.jpg',THREE.SphericalRefractionMapping);
		var jupiterMaterial = new THREE.MeshPhongMaterial({ map: jupiterTexture, shininess: 0});

		jupiter = new THREE.Mesh(new THREE.SphereGeometry(0.0467, sphereSegmentPrecision, sphereRingPrecision), jupiterMaterial);

		jupiter.position.x = bodyPositions.Jupiter[0];
		jupiter.position.y = bodyPositions.Jupiter[1];
		jupiter.position.z = bodyPositions.Jupiter[2];

		jupiter.name = '5';

		scene.add(jupiter);

		bodies[5] = [jupiter, null, "Jupiter", 0.0467, "planet", "udder2"];
}

function addSaturn() {
		THREE.ImageUtils.crossOrigin = '';
		var saturnTexture = THREE.ImageUtils.loadTexture('images/saturnTexture.jpg',THREE.SphericalRefractionMapping);
		var saturnMaterial = new THREE.MeshPhongMaterial({ map: saturnTexture, shininess: 0});

		var saturn = new THREE.Mesh(new THREE.SphereGeometry(0.0389, sphereSegmentPrecision, sphereRingPrecision), saturnMaterial);

		saturn.position.x = bodyPositions.Saturn[0];
		saturn.position.y = bodyPositions.Saturn[1];
		saturn.position.z = bodyPositions.Saturn[2];

		saturn.name = '6';

		scene.add(saturn);

		var rings = new THREE.Mesh(new THREE.XRingGeometry(1.2 * 0.0389, 2 * 0.0389, 64, 5, 0, Math.PI * 2),
		 new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/saturnRings.png'),
		  side: THREE.DoubleSide, transparent: true, opacity: 0.6 }))

		rings.position.x = saturn.position.x;
		rings.position.y = saturn.position.y;
		rings.position.z = saturn.position.z;

		scene.add(rings);

		bodies[6] = [saturn, rings, "Saturn", 0.0389, "planet", "udder2"];
}

function addUranus() {
		THREE.ImageUtils.crossOrigin = '';
		var uranusTexture = THREE.ImageUtils.loadTexture('images/uranusTexture.jpg',THREE.SphericalRefractionMapping);
		var uranusMaterial = new THREE.MeshPhongMaterial({ map: uranusTexture, shininess: 0});

		var uranus = new THREE.Mesh(new THREE.SphereGeometry(0.01695, sphereSegmentPrecision, sphereRingPrecision), uranusMaterial);

		uranus.position.x = bodyPositions.Uranus[0];
		uranus.position.y = bodyPositions.Uranus[1];
		uranus.position.z = bodyPositions.Uranus[2];

		uranus.name = '7';

		scene.add(uranus);

		bodies[7] = [uranus, null, "Uranus", 0.01695, "planet", "udder2"];
}

function addNeptune() {
		THREE.ImageUtils.crossOrigin = '';
		var neptuneTexture = THREE.ImageUtils.loadTexture('images/neptuneTexture.jpg',THREE.SphericalRefractionMapping);
		var neptuneMaterial = new THREE.MeshPhongMaterial({ map: neptuneTexture, shininess: 0});

		var neptune = new THREE.Mesh(new THREE.SphereGeometry(0.01646, sphereSegmentPrecision, sphereRingPrecision), neptuneMaterial);

		neptune.position.x = bodyPositions.Neptune[0];
		neptune.position.y = bodyPositions.Neptune[1];
		neptune.position.z = bodyPositions.Neptune[2];

		neptune.name = '8';

		scene.add(neptune);

		bodies[8] = [neptune, null, "Neptune", 0.01646, "planet", "udder2"];
}

function addMoon() {
		THREE.ImageUtils.crossOrigin = '';
		var moonTexture = THREE.ImageUtils.loadTexture('images/moonTexture.jpg',THREE.SphericalRefractionMapping);
		var moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture, shininess: 0});

		var moon = new THREE.Mesh(new THREE.SphereGeometry(0.00163, sphereSegmentPrecision, sphereRingPrecision), moonMaterial);

		moon.position.x = bodyPositions.Moon[0];
		moon.position.y = bodyPositions.Moon[1];
		moon.position.z = bodyPositions.Moon[2];

		scene.add(moon);

		bodies[9] = [moon, null, "Moon", 0.00116, "majorsat", "udder2"];
}

function addGanymede() {
		THREE.ImageUtils.crossOrigin = '';
		var ganymedeTexture = THREE.ImageUtils.loadTexture('images/ganymedeTexture.jpg',THREE.SphericalRefractionMapping);
		var ganymedeMaterial = new THREE.MeshPhongMaterial({ map: ganymedeTexture, shininess: 0});

		var ganymede = new THREE.Mesh(new THREE.SphereGeometry(0.001758, sphereSegmentPrecision, sphereRingPrecision), ganymedeMaterial);

		ganymede.position.x = bodyPositions.Ganymede[0];
		ganymede.position.y = bodyPositions.Ganymede[1];
		ganymede.position.z = bodyPositions.Ganymede[2];

		scene.add(ganymede);

		bodies[10] = [ganymede, null, "Ganymede", 0.001758, "majorsat", "udder2"];
}

function addCallisto() {
		THREE.ImageUtils.crossOrigin = '';
		var callistoTexture = THREE.ImageUtils.loadTexture('images/callistoTexture.jpg',THREE.SphericalRefractionMapping);
		var callistoMaterial = new THREE.MeshPhongMaterial({ map: callistoTexture, shininess: 0});

		var callisto = new THREE.Mesh(new THREE.SphereGeometry(0.00161, sphereSegmentPrecision, sphereRingPrecision), callistoMaterial);

		callisto.position.x = bodyPositions.Callisto[0];
		callisto.position.y = bodyPositions.Callisto[1];
		callisto.position.z = bodyPositions.Callisto[2];

		scene.add(callisto);

		bodies[11] = [callisto, null, "Callisto", 0.00161, "majorsat", "udder2"];
}

function addIo() {
		THREE.ImageUtils.crossOrigin = '';
		var ioTexture = THREE.ImageUtils.loadTexture('images/ioTexture.jpg',THREE.SphericalRefractionMapping);
		var ioMaterial = new THREE.MeshPhongMaterial({ map: ioTexture, shininess: 0});

		var io = new THREE.Mesh(new THREE.SphereGeometry(0.001217, sphereSegmentPrecision, sphereRingPrecision), ioMaterial);

		io.position.x = bodyPositions.Io[0];
		io.position.y = bodyPositions.Io[1];
		io.position.z = bodyPositions.Io[2];

		scene.add(io);

		bodies[12] = [io, null, "Io", 0.001217, "majorsat", "udder2"];
}

function addEuropa() {
		THREE.ImageUtils.crossOrigin = '';
		var europaTexture = THREE.ImageUtils.loadTexture('images/europaTexture.jpg',THREE.SphericalRefractionMapping);
		var europaMaterial = new THREE.MeshPhongMaterial({ map: europaTexture, shininess: 0.04});

		var europa = new THREE.Mesh(new THREE.SphereGeometry(0.001043, sphereSegmentPrecision, sphereRingPrecision), europaMaterial);

		europa.position.x = bodyPositions.Europa[0];
		europa.position.y = bodyPositions.Europa[1];
		europa.position.z = bodyPositions.Europa[2];

		scene.add(europa);

		bodies[13] = [europa, null, "Europa", 0.001043, "majorsat", "udder2"];
}

function addTitan() {
		THREE.ImageUtils.crossOrigin = '';
		var titanTexture = THREE.ImageUtils.loadTexture('images/titanTexture.jpg',THREE.SphericalRefractionMapping);
		var titanMaterial = new THREE.MeshPhongMaterial({ map: titanTexture, shininess: 0});

		var titan = new THREE.Mesh(new THREE.SphereGeometry(0.00172, sphereSegmentPrecision, sphereRingPrecision), titanMaterial);

		titan.position.x = bodyPositions.Titan[0];
		titan.position.y = bodyPositions.Titan[1];
		titan.position.z = bodyPositions.Titan[2];

		scene.add(titan);

		bodies[14] = [titan, null, "Titan", 0.00172, "majorsat", "udder2"];
}

function addTitania() {
		THREE.ImageUtils.crossOrigin = '';
		var titaniaTexture = THREE.ImageUtils.loadTexture('images/titaniaTexture.jpg',THREE.SphericalRefractionMapping);
		var titaniaMaterial = new THREE.MeshPhongMaterial({ map: titaniaTexture, shininess: 0});

		var titania = new THREE.Mesh(new THREE.SphereGeometry(0.0005273, sphereSegmentPrecision, sphereRingPrecision), titaniaMaterial);

		titania.position.x = bodyPositions.Titania[0];
		titania.position.y = bodyPositions.Titania[1];
		titania.position.z = bodyPositions.Titania[2];

		scene.add(titania);

		bodies[15] = [titania, null, "Titania", 0.0005273, "majorsat", "udder2"];
}

function addTriton() {
		THREE.ImageUtils.crossOrigin = '';
		var tritonTexture = THREE.ImageUtils.loadTexture('images/tritonTexture.jpg',THREE.SphericalRefractionMapping);
		var tritonMaterial = new THREE.MeshPhongMaterial({ map: tritonTexture, shininess: 0});

		var triton = new THREE.Mesh(new THREE.SphereGeometry(0.00090469, sphereSegmentPrecision, sphereRingPrecision), tritonMaterial);

		triton.position.x = bodyPositions.Triton[0];
		triton.position.y = bodyPositions.Triton[1];
		triton.position.z = bodyPositions.Triton[2];

		scene.add(triton);

		bodies[16] = [triton, null, "Triton", 0.00090469, "majorsat", "udder2"];
}

function addDione() {
		THREE.ImageUtils.crossOrigin = '';
		var dioneTexture = THREE.ImageUtils.loadTexture('images/dioneTexture.jpg',THREE.SphericalRefractionMapping);
		var dioneMaterial = new THREE.MeshPhongMaterial({ map: dioneTexture, shininess: 0});

		var dione = new THREE.Mesh(new THREE.SphereGeometry(0.000376, sphereSegmentPrecision, sphereRingPrecision), dioneMaterial);

		dione.position.x = bodyPositions.Dione[0];
		dione.position.y = bodyPositions.Dione[1];
		dione.position.z = bodyPositions.Dione[2];

		scene.add(dione);

		bodies.push([dione, null, "Dione", 0.000376, "majorsat", "udder2"]);
}

function addIapetus() {
		THREE.ImageUtils.crossOrigin = '';
		var iapetusTexture = THREE.ImageUtils.loadTexture('images/iapetusTexture.jpg',THREE.SphericalRefractionMapping);
		var iapetusMaterial = new THREE.MeshPhongMaterial({ map: iapetusTexture, shininess: 0});

		var iapetus = new THREE.Mesh(new THREE.SphereGeometry(0.000491, sphereSegmentPrecision, sphereRingPrecision), iapetusMaterial);

		iapetus.position.x = bodyPositions.Iapetus[0];
		iapetus.position.y = bodyPositions.Iapetus[1];
		iapetus.position.z = bodyPositions.Iapetus[2];

		scene.add(iapetus);

		bodies.push([iapetus, null, "Iapetus", 0.000491, "majorsat", "udder2"]);
}

function addTethys() {
		THREE.ImageUtils.crossOrigin = '';
		var tethysTexture = THREE.ImageUtils.loadTexture('images/tethysTexture.jpg',THREE.SphericalRefractionMapping);
		var tethysMaterial = new THREE.MeshPhongMaterial({ map: tethysTexture, shininess: 0});

		var tethys = new THREE.Mesh(new THREE.SphereGeometry(0.0003585, sphereSegmentPrecision, sphereRingPrecision), tethysMaterial);

		tethys.position.x = bodyPositions.Tethys[0];
		tethys.position.y = bodyPositions.Tethys[1];
		tethys.position.z = bodyPositions.Tethys[2];

		scene.add(tethys);

		bodies.push([tethys, null, "Tethys", 0.0003585, "majorsat", "udder2"]);
}

function addCeres() {
		THREE.ImageUtils.crossOrigin = '';
		var ceresTexture = THREE.ImageUtils.loadTexture('images/ceresTexture.jpg',THREE.SphericalRefractionMapping);
		var ceresMaterial = new THREE.MeshPhongMaterial({ map: ceresTexture, shininess: 0});

		var ceres = new THREE.Mesh(new THREE.SphereGeometry(0.0003183, sphereSegmentPrecision, sphereRingPrecision), ceresMaterial);

		ceres.position.x = bodyPositions.Ceres[0];
		ceres.position.y = bodyPositions.Ceres[1];
		ceres.position.z = bodyPositions.Ceres[2];

		scene.add(ceres);

		bodies.push([ceres, null, "Ceres", 0.0003183, "dwarf", "udder2"]);
}

function addPluto() {
		THREE.ImageUtils.crossOrigin = '';
		var plutoTexture = THREE.ImageUtils.loadTexture('images/plutoTexture.jpg',THREE.SphericalRefractionMapping);
		var plutoMaterial = new THREE.MeshPhongMaterial({ map: plutoTexture, shininess: 0});

		var pluto = new THREE.Mesh(new THREE.SphereGeometry(0.0007921, sphereSegmentPrecision, sphereRingPrecision), plutoMaterial);

		pluto.position.x = bodyPositions.Pluto[0];
		pluto.position.y = bodyPositions.Pluto[1];
		pluto.position.z = bodyPositions.Pluto[2];

		scene.add(pluto);

		bodies.push([pluto, null, "Pluto", 0.0007921, "dwarf", "udder2"]);
}
