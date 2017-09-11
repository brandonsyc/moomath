var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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
}

class Polygon {
  constructor(edges, centerX, centerY) {
    this.edges = edges;

    if ((centerX !== undefined) && (centerY !== undefined)) {
      this.centerX = centerX;
      this.centerY = centerY;
    }

    this.calculateBoundingBox();
    this.boundingBoxes = [];
  }

  edge(index) {
    return this.edges[index];
  }

  intersects(lineX1, lineY1, lineX2, lineY2) {
    for (var edge = 0; edge < this.edges.length; edge++) {
      if (getLineIntersection(this.edges[edge].x1, this.edges[edge].y1,
          this.edges[edge].x2, this.edges[edge].y2,
          lineX1, lineY1, lineX2, lineY2)) {

        return {edge: edge};
      }
    }
  }

  draw(fillIn = true) {
    ctx.beginPath();
    for (var edge = 0; edge < this.edges.length; edge++) {
      this.edges[edge].draw(!edge);
    }
    ctx.stroke();
    if (fillIn) ctx.fill();
  }

  translate(x, y) {
    for (var edge = 0; edge < this.edges.length; edge++) {
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
    var maxEdgeX = -Infinity;
    var minEdgeX = Infinity;

    var maxEdgeY = -Infinity;
    var minEdgeY = Infinity;

    var currentEdge = null;

    for (var edge = 0; edge < this.edges.length; edge++) {
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

  contains(x, y) {
    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
      return false;
    }

    for (var e = 0; e < this.edges.length; e++) {
      var currentEdge = this.edges[e];

      if (getLineIntersection(currentEdge.x1, currentEdge.y1, currentEdge.x2, currentEdge.y2, x, y, 40000, 40000)) {
        return true;
      }
    }

    return false;
  }

  corners(corner) {
    var edge1 = this.edges[corner];
    var edge2 = (corner === this.edges.length - 1 ? this.edges[0] : this.edges[corner + 1]);
    return {x: edge1.x2, y: edge1.y2, edge1: edge1, edge2: edge2};
  }
}

class GameObject {
  constructor(polygon, lives = 500, styles) {

    var styles = styles || {};

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

class Ball {
  constructor(x, y, angle, magnitude, radius = 10) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.magnitude = magnitude;
    this.radius = radius;
  }

  get movementEdge() {
    var movementV = this.movementVector;

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
    var x = value[0];
    var y = value[1];

    this.angle = Math.atan2(y, x);
    this.magnitude = Math.hypot(x, y);
  }

  draw() {
    ctx.fillStyle = '#fff';

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    this.movementLine.draw(true);
    ctx.stroke();
  }

  get movementLine() {
    if (this.movementLineEdge && false) {
      return this.movementLineEdge;
    } else {
      this.movementLineEdge = new Edge(this.x, this.y,
        this.x + this.magnitude * Math.cos(this.angle),
        this.y + this.magnitude * Math.sin(this.angle));
      return this.movementLineEdge;
    }
  }

  interacting(movement,polygon) {
    return polygon.boundingBox(this.radius).contains(movement[0],movement[1]) ||
      polygon.boundingBox(this.radius).intersects(movement[0], movement[1],
        movement[2], movement[3]);
  }

  move(geometries, movement, preventCollide) {
    // Assumes geometries are smaller than the ball in minimum dimension

    var movement = movement || this.movementEdge;

    var closestInteractionDist = Infinity;
    var closestInteraction;
    var closestInteractionPoly;

    var tX, tY, currentEdge, currentAngle, tangentDelta, intersection, dist;

    for (var j = 0; j < geometries.length; j++) {
      if (preventCollide === j) continue;

      if (this.interacting(movement,geometries[j].shape)) {

        for (var corner = 0; corner < geometries[j].shape.edges.length - 1; corner++) {
          var currentCorner = geometries[j].shape.corners(corner);

          // console.log(currentCorner.edge1.angle(), currentCorner.edge2.angle());
        }

        for (var edge = 0; edge < geometries[j].shape.edges.length; edge++) {
          currentEdge = geometries[j].shape.edges[edge];
          currentAngle = currentEdge.angle() + Math.PI / 2;

          // TODO: Reject angles more than 180 deg from movement angle

          tX = this.radius * Math.cos(currentAngle);
          tY = this.radius * Math.sin(currentAngle);

          intersection = getLineIntersection(currentEdge.x1, currentEdge.y1, currentEdge.x2, currentEdge.y2, movement[0] + tX, movement[1] + tY, movement[2] + tX, movement[3] + tY);

          if (intersection) {
            var dist = (intersection[0] - this.x - tX) * (intersection[0] - this.x - tX) +
              (intersection[1] - this.y - tY) * (intersection[1] - this.y - tY);

            if (dist < closestInteractionDist) {
              closestInteractionDist = dist;
              closestInteractionPoly = j;
              closestInteraction = {loc: [intersection[0] - tX, intersection[1] - tY], angle: currentAngle};
            }

            ctx.strokeStyle = "#f0f";
            ctx.beginPath();
            ctx.moveTo(movement[0] + tX, movement[1] + tY);
            ctx.lineTo(movement[2] + 15*tX, movement[3] + 15*tY);
            ctx.stroke();
          }
        }
      }
    }

    if (closestInteraction) {
      var newAngle = 2 * (closestInteraction.angle - Math.PI / 2 - this.angle) + this.angle;
      var newDist = this.magnitude - Math.sqrt(closestInteractionDist);

      this.x = closestInteraction.loc[0];
      this.y = closestInteraction.loc[1];
      this.angle = newAngle;

      tX = this.x + newDist * Math.cos(newAngle);
      tY = this.y + newDist * Math.sin(newAngle);

      //console.log([this.x, this.y, tX, tY]);

      this.move(geometries, [this.x,this.y, tX, tY], closestInteractionPoly);
      return;
    } else {
      this.x = movement[2];
      this.y = movement[3];
    }
  }
}

function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
  var s1_x, s1_y, s2_x, s2_y;
  s1_x = p1_x - p0_x;
  s1_y = p1_y - p0_y;
  s2_x = p3_x - p2_x;
  s2_y = p3_y - p2_y;

  var s, t;

  s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
  t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    var intX = p0_x + (t * s1_x);
    var intY = p0_y + (t * s1_y);
    return [intX, intY];
  }

  return null; // No collision
}

function Rectangle(x, y, width, height) {
  var rectEdges = [
    new Edge(x, y, x + width, y),
    new Edge(x + width, y, x + width, y + height),
    new Edge(x + width, y + height, x, y + height),
    new Edge(x, y + height, x, y)
  ];
  return new Polygon(rectEdges, x + width / 2, y + height / 2);
}

function InverseRectangle(x, y, width, height) {
  var rectEdges = [
    new Edge(x, y, x, y+height),
    new Edge(x, y+height, x+width, y+height),
    new Edge(x+width, y+height, x+width, y),
    new Edge(x+width, y, x, y)
  ];
  return new Polygon(rectEdges, x + width / 2, y + height / 2);
}

function RoundedRectangle(x, y, width, height, roundedFactor = 0.2, circlePrecision = 10) {
  var radius = roundedFactor * width;

  var rectEdges = [
    new Edge(x + radius, y, x + width - radius, y)
  ];

  var prevX = x + width - radius;
  var prevY = y;

  var newX = 0;
  var newY = 0;

  for (var angle = -Math.PI / 2; angle <= 0; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + width - radius + radius * Math.cos(angle);
    newY = y + radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  rectEdges.push(new Edge(x + width, y + radius, x + width, y + height - radius));

  prevX = x + width;
  prevY = y + height - radius;

  for (var angle = 0; angle <= Math.PI / 2; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + width - radius + radius * Math.cos(angle);
    newY = y + height - radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  rectEdges.push(new Edge(x + width - radius, y + height, x + radius, y + height));

  prevX = x + radius;
  prevY = y + height;

  for (var angle = Math.PI / 2; angle <= Math.PI; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + radius + radius * Math.cos(angle);
    newY = y + height - radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  rectEdges.push(new Edge(x, y + height - radius, x, y + radius));

  prevX = x;
  prevY = y + radius;

  for (var angle = Math.PI; angle <= 1.5 * Math.PI; angle += 0.5 * Math.PI / circlePrecision) {
    newX = x + radius + radius * Math.cos(angle);
    newY = y + radius + radius * Math.sin(angle);

    rectEdges.push(new Edge(prevX, prevY, newX, newY));

    prevX = newX;
    prevY = newY;
  }

  return new Polygon(rectEdges, x + width / 2, y + height / 2);
}

var objects = [];
var balls = [];

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var obj = 0; obj < objects.length; obj++) {
    objects[obj].shape.boundingBox(10).draw(false);
    objects[obj].draw();
  }
  for (var ball = 0; ball < balls.length; ball++) {
    balls[ball].draw();
    balls[ball].move(objects);
  }
  requestAnimationFrame(update);
}

var colors = ["#f30", "#f60", "#f90", "#fc0", "#6f0", "#09f"];
colors.reverse();

for (i = 0; i < 3; i++) {
  balls.push(new Ball(150, 150, i, 5));
}

objects.push(new GameObject(RoundedRectangle(50, 50, 50, 50)));
objects.push(new GameObject(RoundedRectangle(300, 230, 50, 50)));
objects.push(new GameObject(RoundedRectangle(250, 50, 50, 50)));

var totalBounding = new GameObject(InverseRectangle(0,0,canvas.width,canvas.height), Infinity, {display: false});
objects.push(totalBounding);

update();
