#include <iostream>
#include <vector>
#include <algorithm>
#include "position.h"

#include "polyomino.h"

// Constructor and destructor
Polyomino::Polyomino() {
  width = 0;
  height = 0;
  depth = 0;

  cubeCount = 0;
  hashComputed = false;
  reoriented = false;
}
Polyomino::~Polyomino() {}

// Access to private members
int Polyomino::getWidth() {
  return width;
}

int Polyomino::getHeight() {
  return height;
}

int Polyomino::getDepth() {
  return depth;
}

Position Polyomino::minCorner() {
  return minCornerCube;
}

Position Polyomino::maxCorner() {
  return maxCornerCube;
}

// Volume of bounding box
int Polyomino::boundingVolume() {
  return width * height * depth;
}

size_t Polyomino::getCubeCount() {
  return cubeCount;
}

Polyomino& Polyomino::addCube(int x, int y, int z) {
  if (!isCubeAt(x, y, z)) {
    Position k = Position(x, y, z);

    if (x < minCornerCube.x) minCornerCube.x = x;
    if (y < minCornerCube.y) minCornerCube.y = y;
    if (z < minCornerCube.z) minCornerCube.z = z;

    if (x > maxCornerCube.x) maxCornerCube.x = x;
    if (y > maxCornerCube.y) maxCornerCube.y = y;
    if (z > maxCornerCube.z) maxCornerCube.z = z;

    cubes.push_back(k);
    cubeCount++;

    recomputeDims();

    if (hashComputed) {
      hashResult ^= k.hash();
    }

    reoriented = false;
  }
  return *this;
}

Polyomino& Polyomino::addCube(Position& p) {
  return addCube(p.x, p.y, p.z);
}

bool Polyomino::cubeTouching(int x, int y, int z) {
  return (isCubeAt(x + 1, y, z) || isCubeAt(x - 1, y, z) ||
    isCubeAt(x, y + 1, z) || isCubeAt(x, y - 1, z) ||
    isCubeAt(x, y, z+1) || isCubeAt(x, y, z-1));
}

bool Polyomino::cubeTouching(Position& p) {
  return cubeTouching(p.x, p.y, p.z);
}

Polyomino& Polyomino::rotate(int dir) {
  hashComputed = false;
  reoriented = false;

  switch (dir)  {
    case X90: {
      int temp;
      for (int i = 0; i < cubeCount; i++) {
        temp = cubes[i].y;
        cubes[i].y = -cubes[i].z;
        cubes[i].z = temp;
      }
      break;
    }
    case X180: {
      for (int i = 0; i < cubeCount; i++) {
        cubes[i].z = -cubes[i].z;
        cubes[i].y = -cubes[i].y;
      }
      break;
    }
    case X270: {
      int temp;
      for (int i = 0; i < cubeCount; i++) {
        temp = cubes[i].y;
        cubes[i].y = cubes[i].z;
        cubes[i].z = -temp;
      }
      break;
    }
    case Y90: {
      int temp;
      for (int i = 0; i < cubeCount; i++) {
        temp = cubes[i].x;
        cubes[i].x = cubes[i].z;
        cubes[i].z = -temp;
      }
      break;
    }
    case Y180: {
      for (int i = 0; i < cubeCount; i++) {
        cubes[i].x = -cubes[i].x;
        cubes[i].z = -cubes[i].z;
      }
      break;
    }
    case Y270: {
      int temp;
      for (int i = 0; i < cubeCount; i++) {
        temp = cubes[i].x;
        cubes[i].x = -cubes[i].z;
        cubes[i].z = temp;
      }
      break;
    }
    case Z90: {
      int temp;
      for (int i = 0; i < cubeCount; i++) {
        temp = cubes[i].x;
        cubes[i].x = -cubes[i].y;
        cubes[i].y = temp;
      }
      break;
    }
    case Z180: {
      for (int i = 0; i < cubeCount; i++) {
        cubes[i].y = -cubes[i].y;
        cubes[i].x = -cubes[i].x;
      }
      break;
    }
    case Z270: {
      int temp;
      for (int i = 0; i < cubeCount; i++) {
        temp = cubes[i].x;
        cubes[i].x = cubes[i].y;
        cubes[i].y = -temp;
      }
      break;
    }
  }

  recomputeBounding();

  return *this;
}

Polyomino& Polyomino::translate(int x, int y, int z) {
  hashComputed = false;
  reoriented = false;

  for (int i = 0; i < cubeCount; i++) {
    cubes[i].x += x;
    cubes[i].y += y;
    cubes[i].z += z;
  }

  minCornerCube.x += x;
  minCornerCube.y += y;
  minCornerCube.z += z;

  maxCornerCube.x += x;
  maxCornerCube.y += y;
  maxCornerCube.z += z;

  return *this;
}

Polyomino& Polyomino::translate(Position& p) {
  return translate(p.x, p.y, p.z);
}

Polyomino& Polyomino::moveToOrigin() {
  translate(-minCornerCube.x, -minCornerCube.y, -minCornerCube.z);
  return *this;
}

Position Polyomino::getCube(int index) {
  return cubes.at(index);
}

const std::string Polyomino::toString() {
  // TODO: Set up udderly display in isometric

  std::string output = "";
  for (int i = 0; i < cubeCount; i++) {
    output = output + "x: " + std::to_string(cubes[i].x)
      + ", y: " + std::to_string(cubes[i].y)
      + ", z: " + std::to_string(cubes[i].z) + "\n";
  }

  return output;
}

std::ostream& operator<< (std::ostream& os, Polyomino& p) {
  os << p.toString();
  return os;
}

bool Polyomino::isCubeAt(int x, int y, int z) {
  Position q;
  for (int i = 0; i < cubeCount; i++) {
    q = cubes.at(i);
    if (q.x == x && q.y == y && q.z == z) {
      return true;
    }
  }
  return false;
}

bool Polyomino::isCubeAt(Position& p) {
  return isCubeAt(p.x, p.y, p.z);
}

void Polyomino::recomputeBounding() {
  recomputeCorners();
  recomputeDims();
}

Polyomino& Polyomino::join(Polyomino& p) {
  reoriented = false;
  hashComputed = false;

  Position* w;

  for (int i = 0; i < p.cubeCount; i++) {
    w = &p.cubes[i];
    addCube(w->x, w->y, w->z);
  }

  return *this;
}

void Polyomino::recomputeCorners() {
  minCornerCube.x = 1e9;
  minCornerCube.y = 1e9;
  minCornerCube.z = 1e9;

  maxCornerCube.x = -1e9;
  maxCornerCube.y = -1e9;
  maxCornerCube.z = -1e9;

  Position* k;

  for (int i = 0; i < cubeCount; i++) {
    k = &cubes[i];

    if (minCornerCube.x > k->x) minCornerCube.x = k->x;
    if (minCornerCube.y > k->y) minCornerCube.y = k->y;
    if (minCornerCube.z > k->z) minCornerCube.z = k->z;

    if (maxCornerCube.x < k->x) maxCornerCube.x = k->x;
    if (maxCornerCube.y < k->y) maxCornerCube.y = k->y;
    if (maxCornerCube.z < k->z) maxCornerCube.z = k->z;
  }
}

void Polyomino::recomputeDims() {
  width = maxCornerCube.x - minCornerCube.x;
  depth = maxCornerCube.y - minCornerCube.y;
  height = maxCornerCube.z - minCornerCube.z;
}

Polyomino& Polyomino::reorient() {
  if (reoriented) return *this;

  hashType minimumHash = std::numeric_limits<hashType>::max();
  int bestI = 0;
  int bestJ = 0;
  bool zRotNeeded = false;

  moveToOrigin();

  for (int i = 0; i < 4; i++) { // Note that this loop is an identity transformation after completion
    for (int j = 0; j < 4; j++) { // Ditto
      if (hash() < minimumHash) {
        minimumHash = hash();
        zRotNeeded = false;

        bestI = i;
        bestJ = j;
      }

      rotate(X90);
      moveToOrigin();
    }
    rotate(Y90);
    moveToOrigin();
  }

  for (int i = 0; i < 2; i++) {
    rotate((i == 0) ? Z90 : Z180);
    moveToOrigin();

    for (int j = 0; j < 4; j++) { // Ditto
      if (hash() < minimumHash) {
        minimumHash = hash();
        zRotNeeded = true;

        bestI = i;
        bestJ = j;
      }

      rotate(X90);
      moveToOrigin();
    }
  }

  rotate(Z90);

  if (zRotNeeded) {
    rotate((bestI == 0) ? Z90 : Z270);

    for (int j = 0; j < bestJ; j++) {
      rotate(X90);
    }
  } else {
    for (int i = 0; i < bestI; i++) {
      rotate(Y90);
    }
    for (int j = 0; j < bestJ; j++) {
      rotate(X90);
    }
  }

  moveToOrigin();
  reoriented = true;

  return *this;
}

hashType Polyomino::hash() {
  if (hashComputed) return hashResult;

  hashType x = 49207;
  for (int i = 0; i < cubeCount; i++) {
    x ^= cubes[i].hash();
  }

  hashResult = x;
  return x;
}

bool Polyomino::equals(Polyomino& p) {
  if (cubeCount != p.cubeCount) return false;

  return hash() == p.hash();
}

bool Polyomino::operator== (Polyomino& p) {
  return equals(p);
}

Polyomino& Polyomino::removeCube(int x, int y, int z) {
  Position k;
  for (int i = 0; i < cubeCount; i++) {
    k = cubes[i];

    if (k.x == x && k.y == y && k.z == z) {
      cubes.erase(cubes.begin() + i);
      return *this;
    }
  }

  cubeCount--;
  return *this;
}

Polyomino& Polyomino::popLast() {
  cubes.pop_back();
  cubeCount--;

  return *this;
}

bool Polyomino::intersecting(Polyomino& p) {
  for (int i = 0; i < cubeCount; i++) {
    if (p.isCubeAt(cubes[i])) {
      return true;
    }
  }

  return false;
}
