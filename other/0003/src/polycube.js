// Code for polycubes

var cubeMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('src/textures/px.jpg')});

var geometry = new THREE.CubeGeometry(1, 1, 1);
geometry.translate(-0.5, -0.5, -0.5);

function createCube(x, y, z) {
  var cube = new THREE.Mesh(geometry, cubeMaterial);
  cube.position.x += x;
  cube.position.y += y;
  cube.position.z += z;

  return cube;
}

function createPolycube(list, x, y, z) {
  var group = new THREE.Group();
  for (var i = 0; i < list.length / 3; i++) {
    var ck = createCube(list[3*i], list[3*i+1], list[3*i+2]);
    ck.polycube = group;

    group.add(ck);
  }
  group.position.x += x;
  group.position.y += y;
  group.position.z += z;
  return group;
}

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

// create the Scene
scene = new THREE.Scene();

cubes = [];

function toCubeType(p) {
  var index = 0;
  for (var i = 1; i < p; i++) {
    index += CUBES[i].length / 3 / i;
  }
  translateCamera(index);
}

function addCube(w, offX, offY, rWidth) {
  rWidth = rWidth || w;
  for (var i = 0; i < CUBES[w].length / (w * 3); i++) {
    k = createPolycube(CUBES[w].slice(w*3*i, w*3*i + w*3), offX + (w+0.5) * (i % rWidth), offY-Math.floor(i / rWidth) * (w + 0.5), 0);

    k.desc = "<br>";
    k.desc += "<h2>" + w + "-cube (" + (i + 1) + "/" + CUBES[w].length / (w * 3) + " total)</h2><br>";
    var maxX,maxY,maxZ,minX,minY,minZ;
    maxX=maxY=maxZ=-Infinity;
    minX=minY=minZ=Infinity;

    for (var j = w*i; j < w*i + w; j++) {
      if (CUBES[w][3*j] > maxX) maxX = CUBES[w][3*j];
      if (CUBES[w][3*j+1] > maxY) maxY = CUBES[w][3*j+1];
      if (CUBES[w][3*j+2] > maxZ) maxZ = CUBES[w][3*j+2];

      if (CUBES[w][3*j] < minX) minX = CUBES[w][3*j];
      if (CUBES[w][3*j+1] < minY) minY = CUBES[w][3*j+1];
      if (CUBES[w][3*j+2] < minZ) minZ = CUBES[w][3*j+2];
    }
    k.desc += "<p>Dimensions: " + (1 + maxX - minX) + " &times; " + (1 + maxY - minY) + " &times; " + (1 + maxZ - minZ) + "</p>"
    k.desc += "<p>Cube Count: " + w + "</p><br>";
    
    k.desc += "<button onclick='try{translateCamera(" + (cubes.length - 1) + ")}catch(e){;}'>Previous</button>";
    k.desc += "<button onclick='try{translateCamera(" + (cubes.length + 1) + ")}catch(e){;}'>Next</button><br>";

    if (w == 1 && i == 0) {
      document.getElementsByClassName("side")[0].innerHTML = k.desc + constf;
      controls.target.x = offX + (w+0.5) * (i % rWidth);
      controls.target.y = offY-Math.floor(i / rWidth) * (w + 0.5);
      controls.target.z = 0;
    }

    cubes.push(k);
    scene.add(k);
  }
}

function addCubes() {
  addCube(1, 0, 45);
  addCube(2, 0, 35);
  addCube(3, 0, 25);
  addCube(4, 0, 15);
  addCube(5, 0, 0);
  addCube(6, 40, 45, 10);
  addCube(7, 120, 45, 30);
}

function hideSevens() {
  var index = 0;
  for (var i = 1; i < 7; i++) {
    index += CUBES[i].length / 3 / i;
  }
  for (var j = index; j < cubes.length; j++) {
    cubes[j].traverse(function(child) {child.visible = false;})
  }
}

function showSevens() {
  var index = 0;
  for (var i = 1; i < 7; i++) {
    index += CUBES[i].length / 3 / i;
  }
  for (var j = index; j < cubes.length; j++) {
    cubes[j].traverse(function(child) {child.visible = true;})
  }
}

var constf = "<br><h3>Navigation</h3><br><button onclick='toCubeType(1)'>To 1-cube</button><br><button onclick='toCubeType(2)'>To 2-cube</button><br><button onclick='toCubeType(3)'>To 3-cubes</button><br><button onclick='toCubeType(4)'>To 4-cubes</button><br><button onclick='toCubeType(5)'>To 5-cubes</button><br><button onclick='toCubeType(6)'>To 6-cubes</button><br><button onclick='toCubeType(7);showSevens();'>To 7-cubes</button><br><br><h3>Rotation</h3><br><button onclick='rotating=false'>Stop</button><button onclick='rotating=true'>Start</button><button onclick='resetRotations()'>Reset</button><br><button onclick='synchronous=true'>Synchronize</button><button onclick='synchronous=false'>Asynchronize</button><br><br><h2>Performance Issues?</h2><br><button onclick='hideSevens()'>Hide Sevens</button><button onclick='showSevens()'>Show Sevens</button><br><br>";
var rotating = true;
var synchronous = false;
document.getElementsByClassName("side")[0].onclick = function(evt){evt.stopPropagation();evt.preventDefault();}

container = document.createElement('div');
document.body.appendChild(container);
container.appendChild(renderer.domElement);

camera.position.set(0.3898808167915783, 45.638878510477184, 5.7827179766567385);

var controls = new THREE.OrbitControls( camera );

controls.update();
controls.maxDistance = 500;
controls.minDistance = 5;

var light = new THREE.DirectionalLight(0xdddddd);
light.position.set(100, 200, 100).normalize();
scene.add(light);

var light = new THREE.DirectionalLight(0xeeeedd);
light.position.set(-230, -100, -100).normalize();
scene.add(light);

var light = new THREE.AmbientLight(0x413333);
scene.add(light);

scene.background = new THREE.Color(0xbbbbbb);

window.onresize = function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

addCubes();

function animate() {
  TWEEN.update();

  if (rotating) {
    if (!synchronous) {
      for (var i = 0; i < cubes.length; i++) {
        cubes[i].rotation.x += ((i + 2.5) % 0.7) * 0.01;
        cubes[i].rotation.y += ((i + 3.5) % 0.7) * 0.01;
        cubes[i].rotation.z += ((i + 4) % 0.35) * 0.009;
      }
    } else {
      for (var i = 0; i < cubes.length; i++) {
        cubes[i].rotation.x += 0.01;
        cubes[i].rotation.y -= 0.015;
        cubes[i].rotation.z -= 0.009;
      }
    }
  }
	render();

	requestAnimationFrame(animate);
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function shiftCamera(i) {
  TWEEN.removeAll();

  document.getElementsByClassName('side')[0].innerHTML = cubes[i].desc + constf;

  cPosition = controls.target.clone();
  var p = new TWEEN.Tween(cPosition)
    .to(cubes[i].position, 500)
    .easing(TWEEN.Easing.Quadratic.InOut);
  p.start();

  p.onUpdate(function() {
    controls.target.x = cPosition.x;
    controls.target.y = cPosition.y;
    controls.target.z = cPosition.z;
  });

  controls.update();
}

function translateCamera(i) {
  TWEEN.removeAll();

  document.getElementsByClassName('side')[0].innerHTML = cubes[i].desc + constf;

  cPosition = controls.target.clone();
  fPosition = camera.position.clone();
  var p = new TWEEN.Tween(cPosition)
    .to(cubes[i].position, 500)
    .easing(TWEEN.Easing.Quadratic.InOut);
  p.start();
  var k = new TWEEN.Tween(fPosition)
    .to(cubes[i].position.clone().add(cPosition.multiplyScalar(-1)).add(fPosition), 500)
    .easing(TWEEN.Easing.Quadratic.InOut);
  k.start();

  p.onUpdate(function() {
    controls.target.x = cPosition.x;
    controls.target.y = cPosition.y;
    controls.target.z = cPosition.z;
  });

  k.onUpdate(function() {
    camera.position.x = fPosition.x;
    camera.position.y = fPosition.y;
    camera.position.z = fPosition.z;
  });

  controls.update();
}

var moveViable = true;

window.onclick = function(evt) {
  evt.preventDefault();
  if (!moveViable) return;

	mouse.x = (evt.clientX / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y = -(evt.clientY / renderer.domElement.clientHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(cubes, true);

	if (intersects.length > 0) {
    TWEEN.removeAll();

    document.getElementsByClassName('side')[0].innerHTML = intersects[0].object.polycube.desc + constf;

    cPosition = controls.target.clone();
		var p = new TWEEN.Tween(cPosition)
      .to(intersects[0].object.polycube.position, 500)
      .easing(TWEEN.Easing.Quadratic.InOut);
    p.start();

    p.onUpdate(function() {
      controls.target.x = cPosition.x;
      controls.target.y = cPosition.y;
      controls.target.z = cPosition.z;
    });

    controls.update();
	}
}

function resetRotations() {
  for (var i = 0; i < cubes.length; i++) {
    cubes[i].rotation.x = 0;
    cubes[i].rotation.y = 0;
    cubes[i].rotation.z = 0;
  }
}

var mouseDown = false;
var mouseDTime = 0;

window.onmouseup = function() {
  setTimeout(function() {moveViable = true}, 2);
  mouseDown = false;
}

window.onmousedown = function() {
  mouseDTime = Date.now();
  mouseDown = true;
}

window.onmousemove = function() {
  if (mouseDown && Date.now() > mouseDTime + 150) moveViable = false;
}

animate();
hideSevens();
