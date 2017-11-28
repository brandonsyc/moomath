#include <iostream>
#include <vector>
#include "polyomino.h"

const int polyomino_cube_limit = 8;

const int puzzleSize = 2;

typedef std::vector<Polyomino> PolyominoList;
PolyominoList polys[polyomino_cube_limit];

bool isNew(Polyomino& p) {
  int size = p.getCubeCount();

  p.reorient();
  for (Polyomino j : polys[size - 1]) {
    if (p == j) {
      return false;
    }
  }

  return true;
}

void addPolyomino(Polyomino& p) {
  if (isNew(p)) {
    if (p.getWidth() <= puzzleSize && p.getHeight() <= puzzleSize && p.getDepth() <= puzzleSize) {
      polys[p.getCubeCount() - 1].push_back(p);
    }
  }
}

void calculatePolyominoes() {
  Polyomino singleton;
  singleton.addCube(0,0,0);

  polys[0].push_back(singleton);
  Polyomino tester;
  Position w;

  for (int cubeCount = 2; cubeCount < polyomino_cube_limit; cubeCount++) {
    for (Polyomino j : polys[cubeCount - 2]) {
      for (unsigned i = 0; i < j.getCubeCount(); i++) {
        w = j.getCube(i);

        if (!j.isCubeAt(w.x + 1, w.y, w.z)) {
          tester = Polyomino(j);
          tester.addCube(w.x + 1, w.y, w.z);
          addPolyomino(tester);
        }

        if (!j.isCubeAt(w.x, w.y + 1, w.z)) {
          tester = Polyomino(j);
          tester.addCube(w.x, w.y + 1, w.z);
          addPolyomino(tester);
        }

        if (!j.isCubeAt(w.x, w.y, w.z + 1)) {
          tester = Polyomino(j);
          tester.addCube(w.x, w.y, w.z + 1);
          addPolyomino(tester);
        }

        if (!j.isCubeAt(w.x - 1, w.y, w.z)) {
          tester = Polyomino(j);
          tester.addCube(w.x - 1, w.y, w.z);
          addPolyomino(tester);
        }

        if (!j.isCubeAt(w.x, w.y - 1, w.z)) {
          tester = Polyomino(j);
          tester.addCube(w.x, w.y - 1, w.z);
          addPolyomino(tester);
        }

        if (!j.isCubeAt(w.x, w.y, w.z - 1)) {
          tester = Polyomino(j);
          tester.addCube(w.x, w.y, w.z - 1);
          addPolyomino(tester);
        }
      }
    }
  }
}

class Puzzle {
private:
  hashType hashResult;
  std::vector<Polyomino*> polys;

  Position minCornerCube;
  Position maxCornerCube;

  int width;
  int height;
  int depth;

  int polyCount;
  int cubeCount;

  bool hashComputed;
  bool reoriented;
public:
  Puzzle() {
    width = 0;
    height = 0;
    depth = 0;

    polyCount = 0;
    cubeCount = 0;

    hashResult = 0;
    hashComputed = false;
    reoriented = false;

    minCornerCube = Position(1e9, 1e9, 1e9);
    maxCornerCube = Position(-1e9, -1e9, -1e9);
  }

  Polyomino* getPoly(int index) {
    return polys.at(index);
  }

  bool intersecting(Polyomino& p) {
    for (int i = 0; i < polyCount; i++) {
      if (polys[i]->intersecting(p)) {
        return true;
      }
    }
    return false;
  }

  bool intersecting(Polyomino* p) {
    for (int i = 0; i < polyCount; i++) {
      if (polys[i]->intersecting(*p)) {
        return true;
      }
    }
    return false;
  }

  void translate(int x, int y, int z) {
    for (auto p : polys) {
      p->translate(x,y,z);
    }

    minCornerCube.x += x;
    minCornerCube.y += y;
    minCornerCube.z += z;

    maxCornerCube.x += x;
    maxCornerCube.y += y;
    maxCornerCube.z += z;

    hashComputed = false;
    reoriented = false;
  }

  void rotate(int k) {
    for (auto p : polys) {
      p->rotate(k);
    }

    recomputeBounding();
    hashComputed = false;
    reoriented = false;
  }

  void moveToOrigin() {
    translate(-minCornerCube.x, -minCornerCube.y, -minCornerCube.z);
  }

  void recomputeBounding() {
    recomputeCorners();
    recomputeDims();
  }

  void recomputeCorners() {
    minCornerCube = Position(1e9, 1e9, 1e9);
    maxCornerCube = Position(-1e9, -1e9, -1e9);

    Position polyMinCorner;
    Position polyMaxCorner;

    for (int i = 0; i < polyCount; i++) {
      polyMinCorner = polys[i]->minCorner();
      polyMaxCorner = polys[i]->maxCorner();

      if (minCornerCube.x > polyMinCorner.x) minCornerCube.x = polyMinCorner.x;
      if (minCornerCube.y > polyMinCorner.y) minCornerCube.y = polyMinCorner.y;
      if (minCornerCube.z > polyMinCorner.z) minCornerCube.z = polyMinCorner.z;

      if (maxCornerCube.x < polyMaxCorner.x) maxCornerCube.x = polyMaxCorner.x;
      if (maxCornerCube.y < polyMaxCorner.y) maxCornerCube.y = polyMaxCorner.y;
      if (maxCornerCube.z < polyMaxCorner.z) maxCornerCube.z = polyMaxCorner.z;
    }
  }

  void recomputeDims() {
    width = maxCornerCube.x - minCornerCube.x;
    depth = maxCornerCube.y - minCornerCube.y;
    height = maxCornerCube.z - minCornerCube.z;
  }

  void addPoly(Polyomino* p) {
    polys.push_back(p);
    polyCount += 1;

    Position polyMinCorner = p->minCorner();
    Position polyMaxCorner = p->maxCorner();

    if (minCornerCube.x > polyMinCorner.x) minCornerCube.x = polyMinCorner.x;
    if (minCornerCube.y > polyMinCorner.y) minCornerCube.y = polyMinCorner.y;
    if (minCornerCube.z > polyMinCorner.z) minCornerCube.z = polyMinCorner.z;

    if (maxCornerCube.x < polyMaxCorner.x) maxCornerCube.x = polyMaxCorner.x;
    if (maxCornerCube.y < polyMaxCorner.y) maxCornerCube.y = polyMaxCorner.y;
    if (maxCornerCube.z < polyMaxCorner.z) maxCornerCube.z = polyMaxCorner.z;
  }

  hashType hash() {
    if (hashComputed) return hashResult;
    hashType r = 58121;

    for (int i = 0; i < polyCount; i++) {
      r ^= polys[i]->hash();
    }

    hashComputed = true;
    hashResult = r;
    return r;
  }

  void reorient() {
    if (reoriented) return;

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
  }

  friend std::ostream& operator<< (std::ostream& os, Puzzle& p) {
    for (int i = 0; i < p.polyCount; i++) {
      os << p.polys[i]->toString() << '\n';
    }
    return os;
  }
};

int main() {
  typedef std::chrono::high_resolution_clock fastClock;
  std::cout << "Calculating polycubes.\n";

  auto t1 = fastClock::now();
  calculatePolyominoes();
  auto t2 = fastClock::now();

  auto timef = std::chrono::duration_cast<std::chrono::duration<double>>(t2 - t1);

  std::cout << "Calculated ";
  for (int i = 0; i < polyomino_cube_limit - 1; i++) {
    std::cout << polys[i].size() << " " << i + 1 << ((i == polyomino_cube_limit - 2) ? "-cubes " : "-cubes, ");
  }
  std::cout << "in " << timef.count() << " seconds.\n";

  for (int i = 0; i < polyomino_cube_limit - 1; i++) {
    std::cout << "C";
    for (auto poly : polys[i]) {
      std::cout << "P";
      for (unsigned i = 0; i < poly.getCubeCount(); i++) {
        Position p = poly.getCube(i);
        std::cout << 'x' << p.x << 'y' << p.y << 'z' << p.z;
      }
    }
  }

  return 0;
}
