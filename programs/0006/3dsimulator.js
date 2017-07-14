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

		document.getElementById('webgl-container').appendChild(renderer.domElement);

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
		var sunTexture = THREE.ImageUtils.loadTexture('http://i.imgur.com/DxEUvetr.jpg',THREE.SphericalRefractionMapping);

		var sunMaterial = new THREE.MeshPhongMaterial({ map: sunTexture, emissive: "white", emissiveIntensity: 0.8});

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
		var earthTexture = THREE.ImageUtils.loadTexture('http://i.imgur.com/nI5Qx0l.jpg',THREE.SphericalRefractionMapping);

		var earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 0});

		earth = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), earthMaterial);

		earth.position.x = 100*3.571108873714297E-1;
		earth.position.z = 100*-9.517262002262744E-01;
		earth.position.y = 100*-3.840370853737805E-05;

		scene.add(earth);

		bodies[1] = [earth, null, "Earth", 0.0042, "planet", "udder"];
}

function addVenus() {
		THREE.ImageUtils.crossOrigin = '';
		var venusTexture = THREE.ImageUtils.loadTexture('http://i.imgur.com/5tSSa8U.jpg',THREE.SphericalRefractionMapping);

		var venusMaterial = new THREE.MeshPhongMaterial({ map: venusTexture, shininess: 0});

		venus = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), venusMaterial);

		venus.position.x = 100*-3.571108873714297E-1;
		venus.position.z = 100*-9.517262002262744E-01;
		venus.position.y = 100*-3.840370853737805E-05;

		scene.add(venus);

		bodies[2] = [venus, null, "Venus", 0.004, "planet", "udder2"];
}

function addMercury() {
		THREE.ImageUtils.crossOrigin = '';
		var venusTexture = THREE.ImageUtils.loadTexture('http://i.imgur.com/5tSSa8U.jpg',THREE.SphericalRefractionMapping);

		var venusMaterial = new THREE.MeshPhongMaterial({ map: venusTexture, shininess: 0});

		venus = new THREE.Mesh(new THREE.SphereGeometry(0.0042, sphereSegmentPrecision, sphereRingPrecision), venusMaterial);

		venus.position.x = 100*-3.571108873714297E-1;
		venus.position.z = 100*-9.517262002262744E-01;
		venus.position.y = 100*-3.840370853737805E-05;

		scene.add(venus);

		bodies[3] = [venus, null, "Venus", 0.004, "planet", "udder2"];
}

function update() {
		controls.update();
  	renderer.render(scene, camera);

		for (i = 0; i < bodies.length; i++) {
				var vFOV = camera.fov * Math.PI / 180;
				var height = 2 * Math.tan(vFOV / 2) * Math.hypot(
					bodies[i][0].position.x-camera.position.x,
					bodies[i][0].position.y-camera.position.y,
					bodies[i][0].position.z-camera.position.z);
				var bodyPixelSize = bodies[i][3] / height * window.innerHeight;

				var scaleFactor = 1;
				if (bodies[i][4] == "star") {
						if (bodyPixelSize < minStarSize) {
								scaleFactor = minStarSize / bodyPixelSize;
						}
				} else if (bodies[i][4] == "planet") {
						if (bodyPixelSize < minMajorPlanetSize) {
								scaleFactor = minMajorPlanetSize / bodyPixelSize;
						}
				} else if (bodies[i][4] == "dwarf") {
						if (bodyPixelSize < minDwarfPlanetSize) {
								scaleFactor = minDwarfPlanetSize / bodyPixelSize;
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
