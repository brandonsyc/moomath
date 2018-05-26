var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.y = 50;

var controls = new THREE.OrbitControls( camera );

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, 100 );
scene.add( light );

class Body {
    constructor(px, py, pz, vx, vy, vz, mass, obj) {
        this.px = px;
        this.py = py;
        this.pz = pz;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.mass = mass;
        this.obj = obj;
    }
}

function distance(b1, b2) {
    "use strict";
    var dx = b2.px - b1.px;
    var dy = b2.py - b1.py;
    var dz = b2.pz - b1.pz;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calc(b1, b2) {
    "use strict";
    var dist = distance(b1, b2);
    var mag = b2.mass / (dist * dist);
    b1.vx += mag * (b2.px - b1.px) / dist;
    b1.vy += mag * (b2.py - b1.py) / dist;
    b1.vz += mag * (b2.pz - b1.pz) / dist;
}

var bodies = [];

function add(px, py, pz, vx, vy, vz, mass, size, color) {
    "use strict";
    var geometry = new THREE.SphereGeometry( size, 32, 32 );
    var material = new THREE.MeshLambertMaterial( {color: color} );
    var sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    bodies.push(new Body(px, py, pz, vx, vy, vz, mass, sphere));
}

add(0, 0, 0, 0.015, 0.01, -0.05, 10, 2, 0x00ffff);
add(0, 15, 0, -0.15, -0.1, 0.5, 1, 1, 0x00ff00);
add(50, 0, 0, 0.05, -0.015, 0.4, 0, 0.5, 0xff0000);
add(40, 0, 0, 0.05, 0.01, 0.5, 0, 0.5, 0xff0000);THREE.ImageUtils.crossOrigin = '';

    var geometry = new THREE.SphereGeometry( 100, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'https://nichodon.github.io/programs/extremethreed/map.jpg')  } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.material.side = THREE.BackSide;
    scene.add( sphere );

function animate() {
    "use strict";
	requestAnimationFrame( animate );
    
    light.position.copy( camera.position );
    
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        body.obj.position.x = body.px;
        body.obj.position.y = body.py;
        body.obj.position.z = body.pz;
    
        for (var j = 0; j < bodies.length; j++) {
            if (j != i && bodies[j].mass > 0) {
                calc(body, bodies[j]);
            }
        }
    }
    
    
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        body.px += body.vx;
        body.py += body.vy;
        body.pz += body.vz;
    }
    
	renderer.render( scene, camera );
}
animate();