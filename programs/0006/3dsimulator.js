var renderer,scene,camera,controls,sun,earth;


function init() {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;

		VIEW_ANGLE = 45;
		ASPECT = WIDTH / HEIGHT;
		NEAR = 0.1;
		FAR = 1000000;

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

		RADIUS = 50;
		SEGMENTS = 16;
		RINGS = 16;

		var sphereMaterial =
		  new THREE.MeshLambertMaterial(
		    {
		      color: 0xCC0000
		    });

		earth = new THREE.Mesh(new THREE.SphereGeometry(0.0042,SEGMENTS,RINGS),sphereMaterial);

		earth.position.x = 100*3.571108873714297E-1;
		earth.position.z = 100*-9.517262002262744E-01;
		earth.position.y = 100*-3.840370853737805E-05;

		scene.add(earth);

		THREE.ImageUtils.crossOrigin = '';
		var texture = THREE.ImageUtils.loadTexture('images/sunTexture.jpg',THREE.SphericalRefractionMapping);

		var sunMaterial = new THREE.MeshPhongMaterial({ map: texture });

		console.log(sunMaterial);

		sun= new THREE.Mesh(new THREE.SphereGeometry(0.46,SEGMENTS,RINGS),sunMaterial);

		sun.overdraw = true;

		sun.position.x = 0
		sun.position.y = 0
		sun.position.z = 0

		scene.add(sun);

		pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.x = 0;
		pointLight.position.y = 0;
		pointLight.position.z = 2;

		scene.add(pointLight);

		var gridXZ = new THREE.GridHelper(100, 10);
		gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
		scene.add(gridXZ);

		document.getElementById('webgl-container').appendChild(renderer.domElement);

		controls = new THREE.OrbitControls(camera, renderer.domElement);
		renderer.render(scene, camera);

		requestAnimationFrame(update);
}

function update () {
		controls.update();
  	renderer.render(scene, camera);

		var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
		var height = 2 * Math.tan( vFOV / 2 ) * Math.hypot(sun.position.x-camera.position.x,
			sun.position.y-camera.position.y,sun.position.z-camera.position.z); // visible height

		var sunheight = 0.46*2/height * window.innerHeight;

		sun.scale.x = Math.max(10/sunheight,1);
		sun.scale.y = Math.max(10/sunheight,1);
		sun.scale.z = Math.max(10/sunheight,1);

		var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
		var height = 2 * Math.tan( vFOV / 2 ) * Math.hypot(earth.position.x-camera.position.x,
			earth.position.y-camera.position.y,earth.position.z-camera.position.z); // visible height

		var earthheight = 0.0042*2/height * window.innerHeight;

		earth.scale.x = Math.max(10/earthheight,1);
		earth.scale.y = Math.max(10/earthheight,1);
		earth.scale.z = Math.max(10/earthheight,1);
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
