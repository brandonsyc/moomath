var renderer, scene, camera, controls, raycaster, mouse, rendererStats;
var frustum = new THREE.Frustum();

// Texture loader
var loader = new THREE.TextureLoader();

// Styles

var orbitColor = 0x0000ff;
var planetOrbitOpacity = 0;
var dwarfOrbitOpacity = 0;
var majorSatOrbitOpacity = 0;
var labelColor = "rgba(255,121,244,";

var maxOrbitOpacity = 0.7;

var bodies = [];

// Types: star = sun, planet = one of 8 planets, dwarf = one of the dwarf planets, majorsat = round moon, minorsat = irregular moon

// Precision of spheres
var sphereSegmentPrecision = 32;
var sphereRingPrecision = 32;

// Minimum star size
var minStarSize = 50;

// Minimum major planet
var minMajorPlanetSize = 23;

// Minimum dwarf planet
var minDwarfPlanetSize = 12;

// Minimum major satellite size
var minVisibleMajorSatelliteSize = 25;

// Distance at which major satellites are displayed, in km
var majorSatelliteDisplayDistance = 1e9;

// Show planets to scale or not (true: show true scale, false: show mins)
var trueScale = false;

// Between 0 and 1, scale factor of planets
var planetScaleFactor = 0.5;

// Body which the camera is pointing at
var focusBody = 8;

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
  addBody(new constructBody(name = "Mercury", radius = "2439.7", type = "planet", shininess = 0.1, axialtilt = 0.01, rotationperiod = 58.646));
  addBody(new constructBody(name = "Venus", radius = "6051.8", type = "planet", shininess = 0.65, axialtilt = 177.4, rotationperiod = 243.025));
  addBody(new constructBody(name = "Earth", radius = "6371", type = "planet", shininess = 0.36, axialtilt = 23.439, rotationperiod = 0.99726968));
  addBody(new constructBody(name = "Mars", radius = "3389.5", type = "planet", shininess = 0.15, axialtilt = 25.19, rotationperiod = 1.025957));
  addBody(new constructBody(name = "Jupiter", radius = "69911", type = "planet", shininess = 0.34, axialtilt = 3.13, rotationperiod = 0.41354167));
  addBody(new constructBody(name = "Saturn", radius = "58232", type = "planet", shininess = 0.34, axialtilt = 26.73, rotationperiod = 0.4395833));
  addBody(new constructBody(name = "Uranus", radius = "25362", type = "planet", shininess = 0.34, axialtilt = 97.77, rotationperiod = 0.71833));
  addBody(new constructBody(name = "Neptune", radius = "24622", type = "planet", shininess = 0.34, axialtilt = 28.32, rotationperiod = 0.6713));
  addBody(new constructBody(name = "Sun", radius = "696342", type = "star", shininess = 0.03, axialtilt = 0, rotationperiod = 1e9));
  addBody(new constructBody(name = "1 Ceres", radius = "200", type = "dwarf", shininess = 0.03, axialtilt = 0, rotationperiod = 1e9, imageLocation = "images/ceresTexture.jpg"));
  addBody(new constructBody(name = "2 Pallas", radius = "200", type = "dwarf", shininess = 0.03, axialtilt = 0, rotationperiod = 1e9, imageLocation = "images/ceresTexture.jpg"));
  addBody(new constructBody(name = "3 Juno", radius = "200", type = "dwarf", shininess = 0.03, axialtilt = 0, rotationperiod = 1e9, imageLocation = "images/ceresTexture.jpg"));
  addBody(new constructBody(name = "4 Vesta", radius = "200", type = "dwarf", shininess = 0.03, axialtilt = 0, rotationperiod = 1e9, imageLocation = "images/ceresTexture.jpg"));
  addBody(new constructBody(name = "Moon", radius = "1000", type = "majorsat", shininess = 0.03, axialtilt = 0, rotationperiod = 31, imageLocation = "images/moonTexture.jpg"));
	addBody(new constructBody(name = "Ganymede", radius = "1000", type = "majorsat", shininess = 0.03, axialtilt = 0, rotationperiod = 31, imageLocation = "images/ganymedeTexture.jpg"));
	addBody(new constructBody(name = "Io", radius = "1000", type = "majorsat", shininess = 0.03, axialtilt = 0, rotationperiod = 31, imageLocation = "images/ioTexture.jpg"));
	addBody(new constructBody(name = "Callisto", radius = "1000", type = "majorsat", shininess = 0.03, axialtilt = 0, rotationperiod = 31, imageLocation = "images/callistoTexture.jpg"))
	addBody(new constructBody(name = "Europa", radius = "1000", type = "majorsat", shininess = 0.03, axialtilt = 0, rotationperiod = 31, imageLocation = "images/europaTexture.jpg"))
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
  var VIEW_ANGLE = 45; // FOV of camera
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
  wbglcontainer.insertBefore(renderer.domElement, wbglcontainer.firstChild);

  renderer.sortObjects = true;

  // Orbit cotnrols
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.rotateSpeed = 0.8;
  controls.keyPanSpeed = 7;

  // Renderer stats, for debugging
  rendererStats = new THREEx.RendererStats();

  rendererStats.domElement.style.position = 'absolute';
  rendererStats.domElement.style.left = '0px';
  rendererStats.domElement.style.bottom = '0px';
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
  if (bodyIndex == focusBody) {
    return;
  }
  if (lockBody && !isLockBodyCameraTransition) {
		disableLockBody();
    isLockBodyCameraTransition = true;
    setTimeout(function() {
			isLockBodyCameraTransition = false;
      enableLockBody();
    }, 750);
  }
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

    if (trackBody) {
      // If camera mode is tracking, shift the camera to the focused body
      shiftCameraFocus(intersects[0].object.name);
    } else {
      shiftCameraFocusToVector(getBodyPosition(intersects[0].object.name));
    }

    // Note that (Object3D).object.name gives the index of the object in bodies.
    focusBody = intersects[0].object.name;
    drawOrbits();
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
    if (lockBody) {
      lockBodySmoothDollyIntoBody(lastClickedEntity.object.name);
    } else {
      controls.smoothDollyIntoBody(lastClickedEntity.object.name);
    }

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
  updateFrustum();
  updateCameraTracking();
  controls.update();

  // Index, position, size of sun
  var sunIndex = getBody('Sun');
	var saturnIndex = getBody('Saturn');
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
      scaleFactor = getScaleFactor(bodyPixelSize, bodies[i].type, cameraDistance);
    }

    scaleObject(i, scaleFactor);

    // If the object is sufficiently small, stop it from displaying
    if (bodyPixelSize * scaleFactor < 0.01) {
      bodies[i].object.visible = false;
    } else {
      bodies[i].object.visible = true;
    }

    // If the body is the sun, skip the following code
    if (i == sunIndex) continue;

    if (bodies[i].type === "majorsat") {
      var parent = getBody(moonOrbitData[bodies[i].name].parent);
      var parentPosition = getBodyPosition(parent);
      var currentParentSize = getScale(parent) * bodies[parent].radius;

			// TODO: Math.max(getScale(parent),25)

      var dist = parentPosition.distanceTo(getBodyPosition(i));

      if (dist < 1.7 * currentParentSize) {
        var opacity = (dist - 3 * (1.7 * currentParentSize - dist)) / currentParentSize / 1.7;

        if (opacity <= 0) {
          bodies[i].object.visible = false;
        } else {
          // If the body intersects the Sun, fade it out to an opacity depending on the distance
          setOpacity(i, opacity);
        }
      } else {
        setOpacity(i, 1);
        bodies[i].object.visible = true;
      }
      continue;
    }

    // 3D distance to Sun
    var dist = sunPosition.distanceTo(getBodyPosition(i));

		var fFactor = (i == saturnIndex) ? 4 : 2;

    if (dist < fFactor * currentSunSize) {
      var opacity = (dist - 3 * (fFactor * currentSunSize - dist)) / currentSunSize / fFactor;

      if (opacity <= 0) {
        bodies[i].object.visible = false;
      } else {
        // If the body intersects the Sun, fade it out to an opacity depending on the distance
        setOpacity(i, opacity);
      }
    } else {
      setOpacity(i, 1);
      bodies[i].object.visible = true;
    }
  }

  if (displayGridHelper) {
    // If the grid is enabled...

    // Calculate height of grid
    var height = 2 * Math.tan(vFOV / 2) *
      Math.hypot(controls.target.x - camera.position.x,
        (alignGridToTarget ? controls.target.y : 0) - camera.position.y,
        controls.target.z - camera.position.z);

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
      } catch (e) {;
      }

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
    } catch (e) {;
    }
  }

  // Render the scene
  renderer.render(scene, camera);
  //controls.update();

  // Update the sprites (text canvas)
  updateSprites();
  updateMoonOrbitObjects();

  if (!finished && new Date().getTime() - lastUpdate < 1000 / 30.0) {
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

function getScale(i) {
  if (bodies[i].object.children.length > 0) {
    return bodies[i].object.children[0].scale.x;
  }
  return bodies[i].object.scale.x;
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

function addSkyBox() {
	// TODO: Find images!

	var imagePrefix = "images/stars-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );
}

function updatePlanetarySize() {
  // Update minimum graphical size of planets based on user input

  // Width of displayed bar
  var bar = document.getElementById("bar1").style.width;

  // Parse as converted float
  minMajorPlanetSize = parseFloat(bar.substr(0, bar.length - 1)) / 2;
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

  minVisibleMajorSatelliteSize = parseFloat(bar.substr(0, bar.length - 1)) / 3;
  if (minVisibleMajorSatelliteSize > 33) {
    minVisibleMajorSatelliteSize = 33;
  }

  if (minVisibleMajorSatelliteSize == 0) {
    document.getElementById('bar2-contents').innerHTML = "Real Size";
  } else {
    document.getElementById('bar2-contents').innerHTML = String(Math.round(minVisibleMajorSatelliteSize * 100) / 100) + "&times;"
  }
}

function updateSunSize() {
  // Update minimum sun size from user input

  var bar = document.getElementById("bar4").style.width;

  minStarSize = parseFloat(bar.substr(0, bar.length - 1));
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

function contains(a, obj) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

function addBodyFromName(bodyName, autoFollow = true) {
  // Add body from body name

  // Check if body is already in the scene, if not, add it
  if (getBody(bodyName) == -1) {
    if (minorOrbitData[bodyName]) {
      addBody(new constructBody(name = bodyName,
        radius = "200",
        type = "dwarf",
        shininess = 0.03,
        axialtilt = 0,
        rotationperiod = 1e9,
        imageLocation = "images/ceresTexture.jpg"));
    } else if (moonOrbitData[bodyName]) {
      if (contains(texturedMoons, bodyName)) {
        addBody(new constructBody(name = bodyName,
          radius = "200",
          type = "majorsat",
          shininess = 0.03,
          axialtilt = 0,
          rotationperiod = 1e9,
          imageLocation = "images/" + bodyName.toLowerCase() + "Texture.jpg"));
      } else {
        addBody(new constructBody(name = bodyName,
          radius = "200",
          type = "majorsat",
          shininess = 0.03,
          axialtilt = 0,
          rotationperiod = 1e9,
          imageLocation = "images/ceresTexture.jpg"));
      }
      moonNames.push(bodyName);
    }
  }

  // Moves the camera to the body, sets the focus body, and redraws orbits
  if (autoFollow) {
    setTimeout(function() {
      focusBody = getBody(bodyName);
      if (lockBody) {
        disableLockBody();
        isLockBodyCameraTransition = true;
      }
      shiftCameraFocus(focusBody);
      setTimeout(function() {
        enableLockBody();
        isLockBodyCameraTransition = false;
      }, 1020);
      drawOrbits();
    }, 250);
  }
}

function deleteBodyFromName(bodyName) {
  // TODO: Fix function
  var bodyIndex = getBody(bodyName);

  var objct = bodies[bodyIndex].object;
  scene.remove(objct);

  bodies.splice(bodyIndex, 1);

  for (i = bodyIndex; i < bodies.length; i++) {
    console.log(bodyIndex, bodies[bodyIndex]);
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
    bodyName = document.getElementById("goto").value.replace(/ /g, '').toLowerCase();
  }

  var loweredBodyName = bodyName.replace(/ /g, '').toLowerCase();

  for (i = 0; i < bodies.length; i++) {
    // If a match is found, dolly into it after a 1 second delay (for the pan)
    if (bodies[i].name.replace(/ /g, '').toLowerCase() === loweredBodyName) {
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
  addBody(new constructBody(name = bodyName,
    radius = "200",
    type = "dwarf",
    shininess = 0.03,
    axialtilt = 0,
    rotationperiod = 1e9,
    imageLocation = "images/ceresTexture.jpg"));

  // Shift focus to new body
  shiftCameraFocus(bodies.length - 1);
  drawOrbits();
}

window.onload = function() {
  // First call to requestAnimationFrame

  console.log("Finished setup.");
  enableLockBody();
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
    var bodyTexture, bodyMaterial;

    // Load texture as a spherical refraction mapping (equirectangular proj.)
    if (body.imageLocation) {
      bodyTexture = loader.load(imageLocation, THREE.SphericalRefractionMapping);
    } else {
      bodyTexture = loader.load('images/' +
        body.name.toLowerCase() +
        'Texture.jpg', THREE.SphericalRefractionMapping);
    }

    if (body.type === "star") {
      // Material for sun
      bodyMaterial = new THREE.MeshPhongMaterial({
        map: bodyTexture,
        emissive: 'white',
        emissiveIntensity: sunEmissive
      });
    } else {
      // Material for any other object
      if (body.shininess) {
        bodyMaterial = new THREE.MeshPhongMaterial({
          map: bodyTexture,
          shininess: body.shininess,
          transparent: true
        });
      } else {
        bodyMaterial = new THREE.MeshPhongMaterial({
          map: bodyTexture,
          shininess: 0,
          transparent: true
        });
      }
    }

		if (body.type === "majorsat") {
			moonNames.push(body.name);
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
      var glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          "c": {
            type: "f",
            value: 0.2
          },
          "p": {
            type: "f",
            value: 1.2
          },
          glowColor: {
            type: "c",
            value: new THREE.Color(0xffff66)
          },
          viewVector: {
            type: "v3",
            value: camera.position
          }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

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
        new THREE.MeshBasicMaterial({
          map: loader.load('images/saturnRings.png'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6
        }))

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
  return [v.x, v.y, v.z];
}

function getBody(name) {
  // Get body index corresponding with the given name (space and case-sensitive, -1 if none found)
  for (j = 0; j < bodies.length; j++) {
    if (bodies[j].name === name) {
      return j;
    }
  }
  return -1;
}

function getBodyPosition(bodyIndex, asVector = true) {
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

function setBodyPositionVector(bodyIndex, v) {
  // Set body position from a THREE.Vector3
  setBodyPosition(bodyIndex, v.x, v.y, v.z);
}

function setBodyPosition(bodyIndex, x, y, z) {
  // Set body position to (x,y,z)
  if (bodies[bodyIndex].object.children.length > 0) {
    for (child = 0; child < bodies[bodyIndex].object.children.length; child++) {
      // Set all children of a body to position (x,y,z)
      bodies[bodyIndex].object.children[child].position.set(x, y, z);
    }
  } else {
    bodies[bodyIndex].object.position.set(x, y, z);
  }
}

function setOpacity(bodyIndex, opacity) {
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
  days += timeWarp / 60;
}

function updateBodyPosition(bodyIndex) {
  // Set position of bodies[bodyIndex] to calculated position
  var positionVector = calculateBodyPosition(bodies[bodyIndex].name, days);

  if (positionVector) setBodyPositionVector(bodyIndex, positionVector);
}

function updateBodyRotation(bodyIndex) {
  // Update the rotation of a body
  if (bodies[bodyIndex].hasOwnProperty('rotationperiod')) {
    // If a rotation period has been defined...

    // Two tilts, one is rotation about the axis and one is the tilt of the axis relative to the ecliptic
    var ytilt = (days / (bodies[bodyIndex].rotationperiod) * 2 * Math.PI) % (2 * Math.PI);
    var xtilt = bodies[bodyIndex].axialtilt * Math.PI / 180;

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

function scaleObject(bodyIndex, scaleFactor) {
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

function getScaleFactor(bodyPixelSize, bodyType, cameraDistance) {
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
var lastFocusBodyPosition = new THREE.Vector3(0, 0, 0);
var lastFocusBody = null;

// Shift of target relative to Sun since last frame
var targetShift = new THREE.Vector3();

var lockBodyOffsetTheta = {
  val: Math.PI / 2
};
var lockBodyOffsetPhi = {
  val: Math.PI / 2
};
var lockBodyOffsetR = 88602;

var lockBodyOffsetX = 50000;
var lockBodyOffsetY = 50000;
var lockBodyOffsetZ = 50000;

var isLockBodyMouseDown = false;
var lockBodyMouseDownX = 0;
var lockBodyMouseDownY = 0;

var lockBodyStartTheta = lockBodyOffsetTheta.val;
var lockBodyStartPhi = lockBodyOffsetPhi.val;

var lockBodyLastMovementTime = null;
var isLockBodyCameraTransition = false;

function lockBodyZoom(factor) {
  lockBodyOffsetR *= factor;
  updateCartesianOffsets();
}

function lockBodySmoothDollyIntoBody() {
  // Implement this!
  return;
}

function updateCartesianOffsets() {
  lockBodyOffsetX = lockBodyOffsetR * Math.cos(lockBodyOffsetTheta.val) * Math.sin(lockBodyOffsetPhi.val);
  lockBodyOffsetZ = lockBodyOffsetR * Math.sin(lockBodyOffsetTheta.val) * Math.sin(lockBodyOffsetPhi.val);
  lockBodyOffsetY = lockBodyOffsetR * Math.cos(lockBodyOffsetPhi.val);
}

function setSphericalOffsetsFromCartesian(x, y, z) {
  lockBodyOffsetR = Math.hypot(x, y, z);
  if (lockBodyOffsetR == 0) {
    lockBodyOffsetR = 50000;
  }
  lockBodyOffsetPhi.val = Math.acos(y / lockBodyOffsetR);
  var cosTheta = x / (lockBodyOffsetR * Math.sin(lockBodyOffsetPhi.val));
  var sinTheta = z / (lockBodyOffsetR * Math.sin(lockBodyOffsetPhi.val));

  if (Math.abs(cosTheta) < 0.0001) {
    if (sinTheta > 0) {
      lockBodyOffsetTheta.val = Math.PI / 4;
    } else {
      lockBodyOffsetTheta.val = -Math.PI / 4;
    }
    return;
  }

  lockBodyOffsetTheta.val = Math.atan(sinTheta / cosTheta);
}

function setSphericalFromCameraPosition() {
  setSphericalOffsetsFromCartesian(camera.position.x - controls.target.x,
    camera.position.y - controls.target.y,
    camera.position.z - controls.target.z);
}

function setSphericalFromCartesianOffsets() {
	setSphericalOffsetsFromCartesian(lockBodyOffsetX,lockBodyOffsetY,lockBodyOffsetZ);
}

function setCameraPositionFromOffsets() {
	var focusBodyPosition = getBodyPosition(focusBody);
	camera.position.set(focusBodyPosition.x + lockBodyOffsetX,
		focusBodyPosition.y + lockBodyOffsetY,
		focusBodyPosition.z + lockBodyOffsetZ);
}

function lockBodyOnWheel(event) {
  event.preventDefault();

  if ((1 + event.deltaY / 100) * lockBodyOffsetR < 1.2 * bodies[focusBody].radius) {
    return;
  }

  lockBodyZoom(1 + event.deltaY / 250);
}

function lockBodyOnMouseDown(event) {
  event.preventDefault();

  var rect = renderer.domElement.getBoundingClientRect();
  lockBodyMouseDownX = event.clientX - rect.left;
  lockBodyMouseDownY = event.clientY - rect.top;

  isLockBodyMouseDown = true;

  lockBodyStartTheta = lockBodyOffsetTheta.val;
  lockBodyStartPhi = lockBodyOffsetPhi.val;

  lockBodyLastMovementTime = null;
}

function lockBodyOnMouseMove(event) {
  if (!isLockBodyMouseDown) return;

  event.preventDefault();

  var rect = renderer.domElement.getBoundingClientRect();
  var thisX = event.clientX - rect.left;
  var thisY = event.clientY - rect.top;

  var newPhi = lockBodyStartPhi + 0.01 * (thisY - lockBodyMouseDownY);

  if (newPhi <= 0.001 || newPhi > Math.PI - 0.001) {
    return;
  }

  smoothInterpolate(lockBodyOffsetTheta, lockBodyStartTheta + 0.01 * (thisX - lockBodyMouseDownX), time = 100);
  smoothInterpolate(lockBodyOffsetPhi, lockBodyStartPhi + 0.01 * (thisY - lockBodyMouseDownY), time = 100, updateCartesianOffsets);
}

function lockBodyOnMouseUp(event) {
  isLockBodyMouseDown = false;
}

function setupLockBodyListeners() {
  renderer.domElement.addEventListener('wheel', lockBodyOnWheel, true);
  renderer.domElement.addEventListener('mousedown', lockBodyOnMouseDown, true);
  renderer.domElement.addEventListener('mousemove', lockBodyOnMouseMove, true);
  renderer.domElement.addEventListener('mouseup', lockBodyOnMouseUp, true);
}

function destroyLockBodyListeners() {
  renderer.domElement.removeEventListener('wheel', lockBodyOnWheel, true);
  renderer.domElement.removeEventListener('mousedown', lockBodyOnMouseDown, true);
  renderer.domElement.removeEventListener('mousemove', lockBodyOnMouseMove, true);
  renderer.domElement.removeEventListener('mouseup', lockBodyOnMouseUp, true);
}

function updateCameraTracking() {
  // Update tracking of the camera
  // TODO: fix lockBody tracking

  if (focusBody != null) {
    var focusBodyPosition = getBodyPosition(focusBody);

    if (!controls.zooming && !controls.moving && focusBody == lastFocusBody) {
      if (focusBodyPosition != null) {
        if (lockBody && !isLockBodyCameraTransition) {
          // Shift camera by change in position since last frame
          setCameraPositionFromOffsets();
          instantShiftCameraFocus(focusBody);
          controls.enabled = false;
        } else if (trackBody) {
          // Shift camera focus to target body
          instantShiftCameraFocus(focusBody);
          controls.enabled = true;
        }
      }
    }

    if (isLockBodyCameraTransition) {
      camera.position.set(controls.target.x + lockBodyOffsetX,
        controls.target.y + lockBodyOffsetY,
        controls.target.z + lockBodyOffsetZ);
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
  transparent: true,
  visible: false
});

var dwarfOrbitMaterial = new THREE.LineBasicMaterial({
  color: orbitColor,
  opacity: dwarfOrbitOpacity,
  transparent: true,
  visible: false
})

var majorSatOrbitMaterial = new THREE.LineBasicMaterial({
  color: orbitColor,
  opacity: majorSatOrbitOpacity,
  transparent: true,
  visible: false
})

var highlightedOrbitMaterial = new THREE.LineBasicMaterial({
  color: 0x00ffff,
  opacity: 0.7,
  transparent: true
})

var invisibleOrbitMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
  visible: false
})

function updateMoonOrbitObjects() {
  for (i = 0; i < moonNames.length; i++) {
    copyVector3(scene.getObjectByName(moonNames[i] + 'Orbit').position,
      calculateBodyPosition(moonOrbitData[moonNames[i]].parent, days));
  }
}

function drawOrbits() {
  // Draws the orbits

  for (i = 0; i < bodies.length; i++) {
    // Try to remove the previous orbit
    try {
      var previousOrbit = scene.getObjectByName(bodies[i].name + "Orbit");
      scene.remove(previousOrbit);
      previousOrbit.dispose();
    } catch (e) {;
    }

    // Get type of body
    var bodyType = bodies[i].type;

    if ((bodyType === "planet") || (bodyType === "dwarf") || (bodyType === "majorsat") || i == focusBody) {
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
      } else if (bodyType === "majorsat") {
        material = majorSatOrbitMaterial;
      } else {
        material = planetOrbitMaterial;
      }

      // Calculate vertices of orbit (precision = 200 points / revolution)
      if (bodyType === "majorsat") {
        var thisData = moonOrbitData[bodies[i].name].orbit;
        var parent = moonOrbitData[bodies[i].name].parent;
        var period = getOrbitalPeriod(i);

        var adjT, anomaly;

        for (j = 0; j < 1000; j++) {
          adjT = j / 1000 * period + 1930633.5 + 2451545;
          anomaly = (thisData[4] + adjT * thisData[5]) % (2 * Math.PI);
          geometry.vertices.push(calculateBodyPositionFromOrbit(thisData[0], thisData[1], thisData[2], thisData[3], anomaly, thisData[6]));
        }

        adjT = 1930633.5 + 2451545;
        anomaly = (thisData[4] + adjT * thisData[5]) % (2 * Math.PI);
        geometry.vertices.push(calculateBodyPositionFromOrbit(thisData[0], thisData[1], thisData[2], thisData[3], anomaly, thisData[6]));

      } else {
        for (j = 0; j < 1000; j++) {
          geometry.vertices.push(calculateBodyPosition(
            bodies[i].name,
            days + period * j / 1000));
        }
        geometry.vertices.push(calculateBodyPosition(bodies[i].name, days));
      }

      var line = new THREE.Line(geometry, material);
      line.name = bodies[i].name + "Orbit";
      scene.add(line);
    }
  }
}

function copyVector3(copyTo, from) {
  copyTo.x = from.x;
  copyTo.y = from.y;
  copyTo.z = from.z;
}

function get2DPosition(bodyIndex) {
  // Get 2D position of bodies[bodyIndex] on screen

  var vector = getBodyPosition(bodyIndex).clone().project(camera);
  return [(vector.x + 1) / 2 * textCanvas.width, -(vector.y - 1) / 2 * textCanvas.height];
}

function get2DPositionFromVector(v) {
  var vector = v.clone().project(camera);
  return [(vector.x + 1) / 2 * textCanvas.width, -(vector.y - 1) / 2 * textCanvas.height];
}

function clearOverlay() {
  // Clear textCanvas
  textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
}

function updateSprites() {
  // Update text labels on textCanvas

  clearOverlay();
  updateAxesDrawing();

  // Stylling
  textContext.font = "12px Trebuchet";
  textContext.textAlign = "left";

  var sunPosition = getBodyPosition(getBody('Sun'));

  for (i = 0; i < bodies.length; i++) {
    var bodyPosition = getBodyPosition(i);
    if (frustum.containsPoint(bodyPosition)) {
      // Frustum check is used so that bodies behind the camera do not make text labels
      if (bodies[i].type === "majorsat") {
        var parent = getBody(moonOrbitData[bodies[i].name].parent);
        var parentPosition = getBodyPosition(parent);
        var currentParentSize = getScale(parent) * bodies[parent].radius;

        var dist = bodyPosition.distanceTo(parentPosition);

        if (dist < currentParentSize) {
          var opacity = Math.min(
            Math.max((dist - 2.5 * (currentParentSize - dist)) / currentParentSize, 0),
            labelOpacity.val);
          if (opacity == 0) continue;

          textContext.fillStyle = labelColor + String(opacity) + ')';
        } else {
          textContext.fillStyle = labelColor + String(labelOpacity.val) + ')';
        }

        var pos = get2DPosition(i);

        textContext.fillText(bodies[i].name, pos[0], pos[1]);
      } else {
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
}

function translateVector2(v, x, y) {
  return [v[0] + x, v[1] + y];
}

function scaleVector2(v, factor) {
  return [v[0] * factor, v[1] * factor];
}

var xAxisDisplace = new THREE.Vector3(10000, 0, 0);
var yAxisDisplace = new THREE.Vector3(0, 10000, 0);
var zAxisDisplace = new THREE.Vector3(0, 0, 10000);

var axesSize = 100;

var axisSegments = [
  [xAxisDisplace, new THREE.Vector3(9500, 300, 0)],
  [xAxisDisplace, new THREE.Vector3(9500, -300, 0)],
  [yAxisDisplace, new THREE.Vector3(-300, 9500, 0)],
  [yAxisDisplace, new THREE.Vector3(300, 9500, 0)],
  [zAxisDisplace, new THREE.Vector3(0, -300, 9500)],
  [zAxisDisplace, new THREE.Vector3(0, 300, 9500)]
]

function updateAxesDrawing() {
  var origin = get2DPosition(focusBody).slice();
  var originPosition = getBodyPosition(focusBody);
  var tempPosition = originPosition.clone();

  var xAxisEnd = get2DPositionFromVector(tempPosition.add(xAxisDisplace));
  tempPosition.copy(originPosition);
  var yAxisEnd = get2DPositionFromVector(tempPosition.add(zAxisDisplace));
  tempPosition.copy(originPosition);
  var zAxisEnd = get2DPositionFromVector(tempPosition.add(yAxisDisplace));
  tempPosition.copy(originPosition);

  var maxDrawableX = window.innerWidth - 20;
  var maxDrawableY = window.innerHeight - 20;

  var scaleFactor = axesSize / Math.max(Math.max(origin[0], xAxisEnd[0], yAxisEnd[0], zAxisEnd[0]) -
    Math.min(origin[0], xAxisEnd[0], yAxisEnd[0], zAxisEnd[0]),
    Math.max(origin[1], xAxisEnd[1], yAxisEnd[1], zAxisEnd[1]) -
    Math.min(origin[1], xAxisEnd[1], yAxisEnd[1], zAxisEnd[1]));

  origin = scaleVector2(origin, scaleFactor);
  xAxisEnd = scaleVector2(xAxisEnd, scaleFactor);
  yAxisEnd = scaleVector2(yAxisEnd, scaleFactor);
  zAxisEnd = scaleVector2(zAxisEnd, scaleFactor);

  var maxXDrawingDisplace = maxDrawableX - Math.max(origin[0], xAxisEnd[0], yAxisEnd[0], zAxisEnd[0]);
  var maxYDrawingDisplace = maxDrawableY - Math.max(origin[1], xAxisEnd[1], yAxisEnd[1], zAxisEnd[1]);

  var xDrawingDisplace = Math.min(maxXDrawingDisplace, maxDrawableX - origin[0] - axesSize * 1.1);
  var yDrawingDisplace = Math.min(maxYDrawingDisplace, maxDrawableY - origin[1] - axesSize * 0.7);

  origin = translateVector2(origin, xDrawingDisplace, yDrawingDisplace);
  xAxisEnd = translateVector2(xAxisEnd, xDrawingDisplace, yDrawingDisplace);
  yAxisEnd = translateVector2(yAxisEnd, xDrawingDisplace, yDrawingDisplace);
  zAxisEnd = translateVector2(zAxisEnd, xDrawingDisplace, yDrawingDisplace);

  textContext.strokeStyle = "#FF0000";

  textContext.beginPath();
  textContext.moveTo(origin[0], origin[1]);
  textContext.lineTo(xAxisEnd[0], xAxisEnd[1]);
  textContext.stroke();

  textContext.beginPath();
  textContext.moveTo(origin[0], origin[1]);
  textContext.lineTo(yAxisEnd[0], yAxisEnd[1]);
  textContext.stroke();

  textContext.beginPath();
  textContext.moveTo(origin[0], origin[1]);
  textContext.lineTo(zAxisEnd[0], zAxisEnd[1]);
  textContext.stroke();

  for (seg = 0; seg < axisSegments.length; seg++) {
    var axisSegment = axisSegments[seg];

    var start = get2DPositionFromVector(tempPosition.add(axisSegment[0]));
    tempPosition.copy(originPosition);
    var end = get2DPositionFromVector(tempPosition.add(axisSegment[1]));
    tempPosition.copy(originPosition);

    start = translateVector2(scaleVector2(start, scaleFactor), xDrawingDisplace, yDrawingDisplace);
    end = translateVector2(scaleVector2(end, scaleFactor), xDrawingDisplace, yDrawingDisplace);

    textContext.beginPath();
    textContext.moveTo(start[0], start[1]);
    textContext.lineTo(end[0], end[1]);
    textContext.stroke();
  }
}

// Exponent of time warp calculation
var timeWarpFactor = 2.354367640272;

function updateTimeWarp() {
  // Update the time warp from user input

  var bar = document.getElementById("bar3").style.width;

  // unmodifiedWarp is from 0 to 100
  var unmodifiedWarp = parseFloat(bar.substr(0, bar.length - 1));
  if (unmodifiedWarp > 100) {
    unmodifiedWarp = 100;
  }

  var modifiedWarp = 0;
  document.getElementById('bar3-contents').innerHTML = "Frozen";

  // Calculate modified Warp: 0 = Frozen, 1 = Real Time, 2+ ~= 0.01956 * w ^ 2.35437
  if (unmodifiedWarp > 0) {
    if (unmodifiedWarp <= 1) {
      // Real time
      modifiedWarp = 1 / 86400.0;
      document.getElementById('bar3-contents').innerHTML = "Real Time";
    } else {
      modifiedWarp = 0.0195553106517 * Math.pow(unmodifiedWarp, timeWarpFactor) + 0.1;
      document.getElementById('bar3-contents').innerHTML = String(modifiedWarp).substr(0, 7) + ' days / sec';
    }
  }

  timeWarp = modifiedWarp;
}

// Whether to show labels
var showLabels = true;

// Opacity of label
var labelOpacity = {
  val: 1
};

// Number of queries in the <ul>
var queries = 0;

// Function that does nothing
var nullFunc = function() {};

var searchRequest = null;

function searchBody(bodyName) {
  clearSearchList();
	secondaryBarMode = 1;

  try {
    searchRequest.abort();
  } catch (e) {;
  }

  var modifiedQuery = bodyName.replace(/ /g, '').toLowerCase();

  for (i = 0; i < nonAsteroidNames.length; i++) {
    if (nonAsteroidNames[i].replace(/ /g, '').toLowerCase().indexOf(modifiedQuery) != -1) {
      appendToSearchList(nonAsteroidNames[i]);
    }
  }

  searchRequest = new XMLHttpRequest();
  searchRequest.open("GET", "http://moomath.com/programs/0006/server/searchAsteroids.php?" +
    modifiedQuery, true);

  searchRequest.onload = function(self, oEvent) {
    // Process returned request
		console.log(secondaryBarMode);
		if (secondaryBarMode == 1) {
	    var splitResponse = searchRequest.response.split(';');
	    var splitBody, data;

	    for (i = 0; i < splitResponse.length - 1; i++) {
	      splitBody = splitResponse[i].split(',');
	      data = [];
	      for (k = 1; k < 8; k++) {
	        data.push(parseFloat(splitBody[k]));
	      }
	      appendToSearchList(splitBody[0], 'addToMinorOrbitData(this.innerHTML,[' + String(data) + ']);');
	    }
		}
  };

  searchRequest.send(null);
}

function clearSearchList() {
  // Clear the search list <ul> and reset queries
  queries = 0;
  document.getElementById('search-results').innerHTML = '';
}

var maxQueries = 100;

function addToMinorOrbitData(name, args) {
  minorOrbitData[name] = new Float32Array(args);
}

function appendToSearchList(name, extraFunc = null) {
  // Append to the search list <ul> and increment queries
  queries += 1;
  if (getBody(name) === -1) {
    if (!extraFunc) {
      document.getElementById('search-results').innerHTML +=
        "<li style=\"background-color: #009966\" onclick=" +
        "addBodyFromName(this.innerHTML);drawOrbits();this.style.backgroundColor=\'rgba(0,136,187,0.5)\'>" +
        name + "</li>";
    } else {
      document.getElementById('search-results').innerHTML +=
        "<li style=\"background-color: #009966\" onclick=" +
        extraFunc + "addBodyFromName(this.innerHTML);drawOrbits();this.style.backgroundColor=\'rgba(0,136,187,0.5)\';>" +
        name + "</li>";
    }
  } else {
    var bodyID = String(getBody(name));
    if (!extraFunc) {
      document.getElementById('search-results').innerHTML +=
        "<li onclick='shiftCameraFocus(" + bodyID + ");focusBody=" +
        bodyID + ";drawOrbits()'>" + name + "</li>";
    } else {
      document.getElementById('search-results').innerHTML +=
        "<li onclick='shiftCameraFocus(" + bodyID + ");focusBody=" +
        bodyID + ";drawOrbits();'>" + name + "</li>";
    }
  }
}

function interpolateColors(c1, c2, v) {
  // Linearly interpolate between two colors
  return new THREE.Color(c1.r + (c2.r - c1.r) * v,
    c1.g + (c2.g - c1.g) * v,
    c1.b + (c2.b - c1.b) * v);
}

function smoothInterpolate(x, k, time = 500, cnstFunc = function() {}, propt = 'val') {
  // Interpolate x[propt] between current value and k in time ms

  if (time < 20) {
    x[propt] = k;
    return;
  }

  x[propt] = x[propt] + (k - x[propt]) / (time * 60) * 1000;
  cnstFunc();

  setTimeout(function() {
    smoothInterpolate(x, k, time - 1000.0 / 60.0, cnstFunc, propt)
  }, 1000.0 / 60.0);
}

function updateLockBody(lock) {
  if (lock) {
    enableLockBody();
  } else {
    disableLockBody();
  }
}

function enableLockBody() {
	updateCartesianOffsets();
	setCameraPositionFromOffsets();
  setupLockBodyListeners();
  lockBody = true;
}

function disableLockBody() {
  lockBody = false;
  destroyLockBodyListeners();
  isLockBodyCameraTransition = false;
  isLockBodyMouseDown = false;
}

function updateLockBodyFromZoom() {
	if (!isLockBodyCameraTransition) {
		if (camera.position.distanceTo(getBodyPosition(focusBody)) < 1e9) {
			enableLockBody();
		} else {
			disableLockBody();
		}
	}
}

var musicElement = document.getElementById("music");
var secondaryBar = document.getElementById('other');

var secondaryBarMode = 0;

// 0: blank, 1: search, 2: visuals, 3: audio, 4: objects

function startMusic() {
	musicElement.play();
}

function setMusicVolume(volume) {
	musicElement.volume = volume;
}

function setSecondaryToVisual() {
	secondaryBar.innerHTML = visualSettingsHTML;
	secondaryBarMode = 2;
}

function setSecondaryToAudio() {
	setSecondaryToBlank();
}

function setSecondaryToObjects() {
	setSecondaryToBlank();
}

function setSecondaryToBlank() {
	secondaryBar.innerHTML = '';
	secondaryBarMode = 0;
}

var visualSettingsHTML = `label for="testc">Enable Grid</label>
<input type="checkbox" id="testd" onclick="smoothInterpolate(planetOrbitMaterial,(this.checked ? maxOrbitOpacity : 0),250,function() {planetOrbitMaterial.visible = planetOrbitMaterial.opacity > 0.08},'opacity')">
<label for="testd">Planet Orbits</label>
<input type="checkbox" id="teste" onclick="smoothInterpolate(dwarfOrbitMaterial,(this.checked ? maxOrbitOpacity : 0),250,function() {dwarfOrbitMaterial.visible = dwarfOrbitMaterial.opacity > 0.08},'opacity')">
<label for="teste">Dwarf Orbits</label>
<input type="checkbox" id="testl" onclick="smoothInterpolate(majorSatOrbitMaterial,(this.checked ? maxOrbitOpacity : 0),250,function() {majorSatOrbitMaterial.visible = majorSatOrbitMaterial.opacity > 0.08},'opacity')">
<label for="testl">Moon Orbits</label>
<input type="checkbox" id="testf" onclick="smoothInterpolate(labelOpacity,(this.checked ? 1 : 0),250)" checked>
<label for="testf" id="labels">Labels</label>
<input type="checkbox" id="testc" onclick="updateShowGrid()">
<label for="testc">Enable Grid</label>
<div class="wrapper2">
	<div class="wrapper2inner">
		<label for="bslide">Planetary Size</label>
		<button class="bslide" onMouseDown="press(1, -1.2)" onMouseUp="lift()">&laquo;</button>
		<div class="sslider">
			<div class="bar" id="bar1"></div>
			<p id="bar1-contents">25&times;</p>
		</div>
		<button class="bslide right" onMouseDown="press(1, 1.2)" onMouseUp="lift()">&raquo;</button>
		<label for="bslide">Moon Size</label>
		<button class="bslide" onMouseDown="press(2, -1)" onMouseUp="lift()">&laquo;</button>
		<div class="sslider">
			<div class="bar" id="bar2"></div>
			<p id="bar2-contents">25&times;</p>
		</div>
		<button class="bslide right" onMouseDown="press(2, 1)" onMouseUp="lift()">&raquo;</button>
		<label for="bslide">Sun Size</label>
		<button class="bslide" onMouseDown="press(4, -1)" onMouseUp="lift()">&laquo;</button>
		<div class="sslider">
			<div class="bar" id="bar4"></div>
			<p id="bar4-contents">50&times;</p>
		</div>
		<button class="bslide right" onMouseDown="press(4, 1)" onMouseUp="lift()">&raquo;</button>
	</div>
</div>`

setSphericalFromCameraPosition();
updateBodyPositions();

/**
1. More versatile tracking
2. Fixing labels on toolbar (<blank> Orbits)
3. Fade out orbits when near body
**/
