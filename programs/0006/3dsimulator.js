var renderer,scene,camera,controls,raycaster,mouse;

var bodies = [];
var sunLightSource = null;

// bodies[0] is always the sun, bodies[1] is mercury, bodies[2] is venus, bodies[3] is earth, etc., until bodies[7]: neptune. The remaining ones are dynamically allocated.

// Format of body in bodies: [three.js element, second element (if necessary, otherwise null), name, radius (1/100 AU), type, information]

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
var minDwarfPlanetSize = 5;

// Show planets to scale or not (true: show true scale, false: show mins)
var trueScale = false;

// Between 0 and 1, scale factor of planets
var planetScaleFactor = 0.3;

var bodyPositions = {Mercury:[-39.130642832,2.45818266093,-13.8494256687],Venus:[72.5257419198,-4.17311808207,0.880448760399],Earth:[37.3289535303,0.00386952200515,-94.5458508643],Moon:[37.581303542,-0.00530856874143,-94.6035418718],Mars:[-76.7092526208,4.89556028888,143.779696323],Jupiter:[-492.520447708,11.9897043349,-233.332683645]};

function init() {
		var VIEW_ANGLE = 45;
		var ASPECT = window.innerWidth / window.innerHeight;
		var NEAR = 0.001;
		var FAR = 1000000;

		container = document.querySelector('#container');
		renderer = new THREE.WebGLRenderer();
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

		addEarth();
		addSun();
		addVenus();

		var light = new THREE.AmbientLight( 0x404040 ); // soft white light
		scene.add(light);

		var gridXZ = new THREE.GridHelper(1000, 100);
		gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
		scene.add(gridXZ);

		var wbglcontainer = document.getElementById('webgl-container');

		wbglcontainer.insertBefore(renderer.domElement,wbglcontainer.firstChild);

		controls = new THREE.OrbitControls(camera, renderer.domElement);
		renderer.render(scene, camera);

		requestAnimationFrame(update);

		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function getObjects() {
		var objects = [];
		for (i = 0; i < bodies.length; i++) {
				objects.push(bodies[i][0]);
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

function onDocumentMouseDown( event ) {

		event.preventDefault();

		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(getObjects(), true);

		if (intersects.length > 0) {

				console.log(intersects[0]);
				var x = intersects[0].object.position.x;
				var y = intersects[0].object.position.y;
				var z = intersects[0].object.position.z;
				shiftCameraFocus(x,y,z);
		}
}

function addSun() {

		THREE.ImageUtils.crossOrigin = '';
		var sunTexture = THREE.ImageUtils.loadTexture('images/sunTexture.jpg',THREE.SphericalRefractionMapping);

		var sunMaterial = new THREE.MeshPhongMaterial({ map: sunTexture, emissive: "white", emissiveIntensity: 0.95});

		var glowMaterial = new THREE.ShaderMaterial(
		{uniforms:{"c": { type: "f", value: 1.0 }, "p": { type: "f", value: 1.4 },
			glowColor: {type: "c", value: new THREE.Color(0xffff66)},
			viewVector: {type: "v3", value: camera.position}
		}, vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true});

		var sun = new THREE.Mesh(new THREE.SphereGeometry(0.46, sphereSegmentPrecision, sphereRingPrecision), sunMaterial);

		sun.overdraw = true;

		sun.position.x = 0
		sun.position.y = 0
		sun.position.z = 0

		scene.add(sun);

		var sunGlow = new THREE.Mesh(new THREE.SphereGeometry(0.46, sphereSegmentPrecision, sphereRingPrecision), glowMaterial);
		sunGlow.position = sun.position;
		sunGlow.scale.multiplyScalar(sunGlowScale);
		scene.add(sunGlow);

		bodies[0] = [sun, sunGlow, "Sun", 0.46, "star", "test"];

		var sunLightSource = new THREE.PointLight(0xffffff, 2, 100, decay = 0);

		sunLightSource.position.set(0, 0, 0);
		scene.add(sunLightSource);
}

function addEarth() {
		THREE.ImageUtils.crossOrigin = '';
		var earthTexture = THREE.ImageUtils.loadTexture('images/earthTexture.jpg',THREE.SphericalRefractionMapping);

		var earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 0});

		earth = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), earthMaterial);

		earth.position.x = bodyPositions.Earth[0];
		earth.position.y = bodyPositions.Earth[1];
		earth.position.z = bodyPositions.Earth[2];

		console.log(bodyPositions.Earth[0], bodyPositions.Earth[1], bodyPositions.Earth[2])

		scene.add(earth);

		bodies[1] = [earth, null, "Earth", 0.0042, "planet", "udder"];
}

function addVenus() {
		THREE.ImageUtils.crossOrigin = '';
		var venusTexture = THREE.ImageUtils.loadTexture('images/venusTexture.jpg',THREE.SphericalRefractionMapping);

		var venusMaterial = new THREE.MeshPhongMaterial({ map: venusTexture, shininess: 0});

		venus = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), venusMaterial);

		venus.position.x = bodyPositions.Venus[0];
		venus.position.y = bodyPositions.Venus[1];
		venus.position.z = bodyPositions.Venus[2];

		scene.add(venus);

		bodies[2] = [venus, null, "Venus", 0.004, "planet", "udder2"];
}

function addMercury() {
		THREE.ImageUtils.crossOrigin = '';
		var mercuryTexture = THREE.ImageUtils.loadTexture('images/mercuryTexture.jpg',THREE.SphericalRefractionMapping);
		var mercuryMaterial = new THREE.MeshPhongMaterial({ map: mercuryTexture, shininess: 0});

		mercury = new THREE.Mesh(new THREE.SphereGeometry(0.00163, sphereSegmentPrecision, sphereRingPrecision), mercuryMaterial);

		mercury.position.x = bodyPositions.Mercury[0];
		mercury.position.y = bodyPositions.Mercury[1];
		mercury.position.z = bodyPositions.Mercury[2];

		scene.add(mercury);

		bodies[3] = [mercury, null, "Mercury", 0.00116, "planet", "udder2"];
}

function addMoon() {
		THREE.ImageUtils.crossOrigin = '';
		var moonTexture = THREE.ImageUtils.loadTexture('images/moonTexture.jpg',THREE.SphericalRefractionMapping);
		var moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture, shininess: 0});

		moon = new THREE.Mesh(new THREE.SphereGeometry(0.00163, sphereSegmentPrecision, sphereRingPrecision), moonMaterial);

		moon.position.x = bodyPositions.Moon[0];
		moon.position.y = bodyPositions.Moon[1];
		moon.position.z = bodyPositions.Moon[2];

		scene.add(moon);

		bodies[4] = [moon, null, "Moon", 0.00116, "majorsat", "udder2"];
}

function addMars() {
		THREE.ImageUtils.crossOrigin = '';
		var marsTexture = THREE.ImageUtils.loadTexture('images/marsTexture.jpg',THREE.SphericalRefractionMapping);
		var marsMaterial = new THREE.MeshPhongMaterial({ map: marsTexture, shininess: 0});

		mars = new THREE.Mesh(new THREE.SphereGeometry(0.00226, sphereSegmentPrecision, sphereRingPrecision), marsMaterial);

		mars.position.x = bodyPositions.Mars[0];
		mars.position.y = bodyPositions.Mars[1];
		mars.position.z = bodyPositions.Mars[2];

		scene.add(mars);

		bodies[4] = [mars, null, "Mars", 0.00226, "majorsat", "udder2"];
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {top: _y, left: _x};
}
var x = getOffset(document.getElementById('yourElId')).left;

function update() {
		for (i = 0; i < bodies.length; i++) {
				var vFOV = camera.fov * Math.PI / 180;
				var height = 2 * Math.tan(vFOV / 2) * Math.hypot(
					bodies[i][0].position.x-camera.position.x,
					bodies[i][0].position.y-camera.position.y,
					bodies[i][0].position.z-camera.position.z);
				var bodyPixelSize = bodies[i][3] / height * window.innerHeight;

				var scaleFactor = 1;

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
		}

		controls.update();
  	renderer.render(scene, camera);

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
