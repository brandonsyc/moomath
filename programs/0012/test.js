let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

ctx.strokeStyle = "#fff";
ctx.fillStyle = "#fff";
ctx.font = '24px Segoe';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

window.onresize = function() {
  canvas.style.width = document.body.offsetWidth * 0.9375 + "px";
  canvas.style.height = document.body.offsetWidth * 0.46875 + "px";
}

window.onresize();

class Edge {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  length() {
    return Math.hypot(this.x2 - this.x1, this.y2 - this.y1);
  }

  draw(startStroke) {
    if (startStroke) {
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
    }
    ctx.lineTo(this.x2, this.y2);
    if (startStroke) ctx.stroke();
  }

  translate(x, y) {
    this.x1 += x;
    this.x2 += x;
    this.y1 += y;
    this.y2 += y;
  }

  angle() {
    return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
  }

  slope() {
    return (this.y2 - this.y1) / (this.x2 - this.x1);
  }

  bounceIntersection(x1, y1, x2, y2) {
    let intersectionPoint = getLineIntersection(x1, y1, x2, y2, this.x1, this.y1, this.x2, this.y2);
    if (intersectionPoint) {
      return {loc: intersectionPoint, angle: this.angle(), dist2: dist2(intersectionPoint[0], intersectionPoint[1], x1, y1)};
    }
    return null;
  }

  extend(dist) {
    let angle = this.angle() - Math.PI / 2;
    let transX = Math.cos(angle) * dist;
    let transY = Math.sin(angle) * dist;
    return new Edge(this.x1 + transX, this.y1 + transY, this.x2 + transX, this.y2 + transY);
  }
}

function Circle(x, y, radius, precision) {
  var circleEdges = [];
  for (let i = 0; i < precision; i++) {
    circleEdges.push(new Edge(x + Math.cos((i - 1) / precision * 2 * Math.PI),
                              y + Math.sin((i - 1) / precision * 2 * Math.PI),
                              x + Math.cos(i / precision * 2 * Math.PI),
                              y + Math.sin(i / precision * 2 * Math.PI)));
  }
  return new Polygon(circleEdges, x, y);
}

class EdgeCircle {
  constructor(x, y, angle, radius) {
    this.x = x;
    this.y = y;

    this.angle = angle;

    this.radius = 1.001 * radius;
  }

  bounceIntersection(x1, y1, x2, y2) {
    let p1 = this.x;
    let p2 = this.y;

    let t = ((p1 - x1) * (x2 - x1) + (p2 - y1) * (y2 - y1)) / ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    let k1 = x1 + t * (x2 - x1);
    let k2 = y1 + t * (y2 - y1);

    let pl = (this.radius * this.radius - (k1 - p1) * (k1 - p1) - (k2 - p2) * (k2 - p2)) / ((k1 - x1) * (k1 - x1) + (k2 - y1) * (k2 - y1));

    if (pl < 0 || pl === Infinity || pl === -Infinity) return null;

    let l = 1 - Math.sqrt(pl);

    let loc = [x1 + l * (k1 - x1), y1 + l * (k2 - y1)];
    let dist = dist2(loc[0], loc[1], x1, y1);
    if (dist >= dist2(x1, y1, x2, y2)) return null;

    let angle = Math.atan2(p2 - loc[1], p1 - loc[0]) + Math.PI / 2;

    //console.log(loc, angle, dist, x1, y1, x2, y2, p1, p2);

    return {loc: loc, angle: angle, dist2: dist};
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

class Polygon {
  constructor(edges, centerX, centerY) {
    this.edges = edges;

    if ((centerX !== undefined) && (centerY !== undefined)) {
      this.centerX = centerX;
      this.centerY = centerY;
    }

    this.calculateBoundingBox();
    this.boundingBoxes = {};
    this.boundingPhysicsList = {};
    this.cornerObjects = {};
  }

  edge(index) {
    return this.edges[index];
  }

  intersects(lineX1, lineY1, lineX2, lineY2) {
    for (let edge = 0; edge < this.edges.length; edge++) {
      if (getLineIntersection(this.edges[edge].x1, this.edges[edge].y1,
          this.edges[edge].x2, this.edges[edge].y2,
          lineX1, lineY1, lineX2, lineY2)) {

        return {
          edge: edge
        };
      }
    }
  }

  draw(fillIn = true) {
    ctx.beginPath();
    for (let edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge].draw(!edge);
    }
    ctx.stroke();
    if (fillIn) ctx.fill();
  }

  translate(x, y) {
    for (let edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge].translate(x, y);
    }
    this.centerX += x;
    this.centerY += y;
  }

  rotate(rad, centerX, centerY) {
    if (centerX === undefined || centerY === undefined) {
      centerX = this.centerX;
      centerY = this.centerY;
    }

    if (centerX === undefined || centerY === undefined) {
      return;
    }

    // TODO: Implement this
  }

  calculateBoundingBox() {
    let maxEdgeX = -Infinity;
    let minEdgeX = Infinity;

    let maxEdgeY = -Infinity;
    let minEdgeY = Infinity;

    let currentEdge = null;

    for (let edge = 0; edge < this.edges.length; edge++) {
      currentEdge = this.edges[edge];

      if (currentEdge.x1 > maxEdgeX) {
        maxEdgeX = currentEdge.x1;
      }

      if (currentEdge.x2 > maxEdgeX) {
        maxEdgeX = currentEdge.x2;
      }

      if (currentEdge.y1 > maxEdgeY) {
        maxEdgeY = currentEdge.y1;
      }

      if (currentEdge.y2 > maxEdgeY) {
        maxEdgeY = currentEdge.y2;
      }

      if (currentEdge.x1 < minEdgeX) {
        minEdgeX = currentEdge.x1;
      }

      if (currentEdge.x2 < minEdgeX) {
        minEdgeX = currentEdge.x2;
      }

      if (currentEdge.y1 < minEdgeY) {
        minEdgeY = currentEdge.y1;
      }

      if (currentEdge.y2 < minEdgeY) {
        minEdgeY = currentEdge.y2;
      }
    }

    this.maxX = maxEdgeX;
    this.maxY = maxEdgeY;
    this.minX = minEdgeX;
    this.minY = minEdgeY;
  }

  get boundingBoxPolygon() {
    return this.boundingBox(0);
  }

  recalculateBoundingBox() {
    calculateBoundingBox();

    this.boundingBox = null;
    this.boundingBoxes = {};
  }

  boundingBox(radius) {
    if (this.boundingBoxes[radius]) {
      return this.boundingBoxes[radius];
    } else {
      this.boundingBoxes[radius] = Rectangle(this.minX - radius,
        this.minY - radius, this.maxX - this.minX + 2 * radius,
        this.maxY - this.minY + 2 * radius);
      return this.boundingBoxes[radius];
    }
  }

  boundingPhysics(radius) {
    if (this.boundingPhysicsList[radius]) {
      return this.boundingPhysicsList[radius];
    } else {
      let newBoundingPhysics = [];

      for (let edge = 0; edge < this.edges.length; edge++) {
        newBoundingPhysics.push(this.edges[edge].extend(radius));
        newBoundingPhysics.push(new EdgeCircle(this.edges[edge].x1, this.edges[edge].y1, 0, radius));
      }

      this.boundingPhysicsList[radius] = newBoundingPhysics;
      return this.boundingPhysicsList[radius];
    }
  }

  contains(x, y) {
    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
      return false;
    }

    for (let e = 0; e < this.edges.length; e++) {
      let currentEdge = this.edges[e];

      if (getLineIntersection(currentEdge.x1, currentEdge.y1, currentEdge.x2, currentEdge.y2, x, y, 40000, 40000)) {
        return true;
      }
    }

    return false;
  }

  corners(corner) {
    if (this.cornerObjects[corner]) {
      return this.cornerObjects[corner];
    } else {
      let edge1 = this.edges[corner];
      let edge2 = (corner === this.edges.length - 1 ? this.edges[0] : this.edges[corner + 1]);
      this.cornerObjects[corner] = {
        x: edge1.x2,
        y: edge1.y2,
        edge1: edge1,
        edge2: edge2
      };

      return this.cornerObjects[corner];
    }
  }

  bounceIntersection(x1, y1, x2, y2) {
    let best = {dist2: Infinity};
    let nextBest;

    for (let edge = 0; edge < this.edges.length; edge++) {
      nextBest = this.edges[edge].bounceIntersection(x1, y1, x2, y2);
      if (nextBest && nextBest.dist2 < best.dist2) {
        best = nextBest;
      }
    }

    return best;
  }

  interact(mx1, my1, mx2, my2, radius) {
    let boundingBoxF = this.boundingBox(radius);

  }
}

class GameObject {
  constructor(polygon, lives = 500, styles) {

    styles = styles || {};

    this.shape = polygon;
    this.lives = lives;

    this.fillColor = (styles.fillStyle === undefined ? '#fff' : styles.fillStyle);
    this.strokeColor = (styles.strokeStyle === undefined ? '#fff' : styles.strokeStyle);

    this.textColor = (styles.textStyle === undefined ? '#000' : styles.textFont);
    this.textFont = (styles.textFont === undefined ? '24px Segoe' : styles.textFont);

    this.display = (styles.display === undefined ? true : styles.display);
  }

  draw(showHealth = true) {
    if (this.display) {
      ctx.strokeStyle = this.strokeColor;
      ctx.fillStyle = this.fillColor;

      this.shape.draw();

      ctx.fillStyle = this.textColor;
      ctx.font = this.textFont;

      if (showHealth) {
        ctx.fillText(this.lives, this.shape.centerX, this.shape.centerY);
      }
    }
  }
}

class Physics {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx || canvas.getContext('2d');

    this.balls = [];
    this.objects = [];
  }

  addBall(ball) {
    this.balls.push(ball);
  }

  removeBall(index) {
    this.balls.splice(index);
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  removeObject(index) {
    this.objects.splice(index);
  }

  get ballCount() {
    return this.balls.length;
  }

  get objectCount() {
    return this.objects.length;
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let obj = 0; obj < this.objects.length; obj++) {
      let pF = this.objects[obj].shape.boundingPhysics(10);
      for (let p = 0; p < pF.length; p++) {
        pF[p].draw(true);
      }
      this.objects[obj].draw();
    }
    for (let ball = 0; ball < this.balls.length; ball++) {
      ctx.fillStyle = "#fff";
      this.balls[ball].draw();
      this.balls[ball].move(this.objects);
    }
  }
}

class Ball {
  constructor(x, y, angle, magnitude, radius = 10) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.magnitude = magnitude;
    this.radius = radius;
  }

  get movementEdge() {
    let movementV = this.movementVector;

    return [this.x, this.y,
      this.x + movementV[0], this.y + movementV[1]
    ];
  }

  get movementVector() {
    return [this.magnitude * Math.cos(this.angle),
      this.magnitude * Math.sin(this.angle)
    ];
  }

  set movementVector(value) {
    let x = value[0];
    let y = value[1];

    this.angle = Math.atan2(y, x);
    this.magnitude = Math.hypot(x, y);
  }

  draw() {
    ctx.strokeStyle = '#fff';

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    this.movementLine.draw(true);
    ctx.stroke();
  }

  get movementLine() {
    return new Edge(this.x, this.y,
        this.x + this.magnitude * Math.cos(this.angle),
        this.y + this.magnitude * Math.sin(this.angle));
  }

  interacting(mx1, my1, mx2, my2, polygon) {
    if (polygon.boundingBox(this.radius).contains(mx1, my1) ||
      polygon.boundingBox(this.radius).intersects(mx1, my1, mx2, my2)) {

      return true;
    }
    return false;
  }

  move(geometries) {
    let geometry,edgeF,boundingP,bnceInter;

    let bouncing = true;
    let newAngle = this.angle;
    let newMag = this.magnitude;
    let newX = this.x;
    let newY = this.y;

    let mx1,my1,mx2,my2;

    let iters = 0;

    let lastInteractPoly,lastInteractEdgeF;

    while (bouncing && iters < 50) {
      iters++;
      bouncing = false;

      let bestBnceInter;
      let bestBnceInterDist2 = Infinity;
      let bestBncePoly;
      let bestBnceEdgeF;

      for (let geom = 0; geom < geometries.length; geom++) {

        mx1 = newX;
        my1 = newY;
        mx2 = newX + Math.cos(newAngle) * newMag;
        my2 = newY + Math.sin(newAngle) * newMag;

        geometry = geometries[geom].shape;

        if (this.interacting(mx1,my1,mx2,my2,geometry)) {
          boundingP = geometry.boundingPhysics(this.radius);

          for (edgeF = 0; edgeF < boundingP.length; edgeF++) {
            if (lastInteractPoly === geom && lastInteractEdgeF === edgeF) {
              continue;
            }

            bnceInter = boundingP[edgeF].bounceIntersection(mx1,my1,mx2,my2);

            if (bnceInter && bnceInter.dist2 < bestBnceInterDist2) {
              bestBnceInterDist2 = bnceInter.dist2;
              bestBnceInter = bnceInter;
              bestBncePoly = geom;
              bestBnceEdgeF = edgeF;
            }
          }
        }
      }

      if (bestBnceInter) {
        newAngle = 2 * bestBnceInter.angle - newAngle;
        newMag = newMag - Math.sqrt(bestBnceInter.dist2);

        newX = bestBnceInter.loc[0];
        newY = bestBnceInter.loc[1];

        lastInteractPoly = bestBncePoly;
        lastInteractEdgeF = bestBnceEdgeF;

        bouncing = true;
      }
    }

    this.x = mx2;
    this.y = my2;

    this.angle = newAngle;
  }
}

function square(x) {
  return x * x;
}

function dist2(x1, y1, x2, y2) {
  return (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
}

function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
  let s1_x, s1_y, s2_x, s2_y;
  s1_x = p1_x - p0_x;
  s1_y = p1_y - p0_y;
  s2_x = p3_x - p2_x;
  s2_y = p3_y - p2_y;

  let s, t;

  s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
  t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= -1e-6 && s <= 1 + 1e-6 && t >= 1e-6 && t <= 1 + 1e-6) {
    let intX = p0_x + (t * s1_x);
    let intY = p0_y + (t * s1_y);
    return [intX, intY];
  }

  return null; // No collision
}

function Rectangle(x, y, width, height) {
  let rectEdges = [
    new Edge(x, y, x + width, y),
    new Edge(x + width, y, x + width, y + height),
    new Edge(x + width, y + height, x, y + height),
    new Edge(x, y + height, x, y)
  ];
  return new Polygon(rectEdges, x + width / 2, y + height / 2);
}

function InverseRectangle(x, y, width, height) {
  let rectEdges = [
    new Edge(x, y, x, y + height),
    new Edge(x, y + height, x + width, y + height),
    new Edge(x + width, y + height, x + width, y),
    new Edge(x + width, y, x, y)
  ];
  return new Polygon(rectEdges, x + width / 2, y + height / 2);
}

function RoundedRectangle(x, y, width, height, roundedFactor = 0.2, circlePrecision = 10) {
  let radius = roundedFactor * width;

  let rectEdges = [
    new Edge(x + radius, y, x + width - radius, y)
  ];

  let prevX = x + width - radius;
  let prevY = y;

  let newX = 0;
  let newY = 0;

  for (let angle = -Math.PI / 2; angle <= 0; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + width - radius + radius * Math.cos(angle);
    newY = y + radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  rectEdges.push(new Edge(x + width, y + radius, x + width, y + height - radius));

  prevX = x + width;
  prevY = y + height - radius;

  for (let angle = 0; angle <= Math.PI / 2; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + width - radius + radius * Math.cos(angle);
    newY = y + height - radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  rectEdges.push(new Edge(x + width - radius, y + height, x + radius, y + height));

  prevX = x + radius;
  prevY = y + height;

  for (let angle = Math.PI / 2; angle <= Math.PI; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + radius + radius * Math.cos(angle);
    newY = y + height - radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  rectEdges.push(new Edge(x, y + height - radius, x, y + radius));

  prevX = x;
  prevY = y + radius;

  for (let angle = Math.PI; angle <= 1.5 * Math.PI; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + radius + radius * Math.cos(angle);
    newY = y + radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  return new Polygon(rectEdges, x + width / 2, y + height / 2);
}

let physics = new Physics(canvas, ctx);

function update() {

  physics.draw();
  requestAnimationFrame(update);
}

function Triangle(p1, p2, p3) {
  return new Polygon([new Edge(p1[0], p1[1], p2[0], p2[1]),
                      new Edge(p2[0], p2[1], p3[0], p3[1]),
                      new Edge(p3[0], p3[1], p1[0], p1[1])],
                     (p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3);
}

let colors = ["#f30", "#f60", "#f90", "#fc0", "#6f0", "#09f"];
colors.reverse();

/**setTimeout(function udder() {
  physics.addBall(new Ball(canvas.width / 2, 300, -0.4, Math.random()/0.1 * 0.5));
  setTimeout(udder, 60);
}, 250);**/

physics.addBall(new Ball(canvas.width / 2, 300, -0.4, 3));

for (i = -5; i < 6; i++) {
  physics.addObject(new GameObject(Rectangle(canvas.width / 2 - 45 / 2 + 100 * i, 100, 45, 45)));
}

physics.addObject(new GameObject(Triangle([100, 250], [160, 250], [160, 300])));

let totalBounding = new GameObject(InverseRectangle(0, 0, canvas.width, canvas.height), Infinity, {
  display: false
});

physics.addObject(totalBounding);

update();
