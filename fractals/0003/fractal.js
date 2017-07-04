var gl; // A global variable for the WebGL context

function initWebGL(canvas) {
    gl = null;

    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // If we don't have a GL context, give up now
    if (gl == null) alert('Unable to initialize WebGL. Your browser may not support it.');

    return gl;
}

function initSequence() {
    var canvas = document.getElementById('cesaro');

    // Initialize the GL context
    gl = initWebGL(canvas);

    // Only continue if WebGL is available and working
    if (!gl) return;

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.depthFunc(gl.LEQUAL);
    // Clear the color as well as the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function resizeGLContext() {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

initSequence();

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

var program = createProgram(gl, vertexShader, fragmentShader);

var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

var positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

var positions = [
  0, 0,
  0, 0.5,
  0.7, 0,
  0.7, 0.3
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.enableVertexAttribArray(positionAttributeLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
var size = 2;          // 2 components per iteration
var type = gl.FLOAT;   // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0;        // start at the beginning of the buffer

gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

var primitiveType = gl.LINES;
var offset = 0;
var count = 4;
gl.drawArrays(primitiveType, offset, count);
