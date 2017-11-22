#include <vector>
#include "position.h"

#ifndef POLYOMINO_H
#define POLYOMINO_H

enum Rotation {
  X90,
  X180,
  X270,
  Y90,
  Y180,
  Y270,
  Z90,
  Z180,
  Z270,
};

class Polyomino {
private:
  Position minCornerCube;
  Position maxCornerCube;

  unsigned long hashResult;
  int width;
  int height;
  int depth;
  int cubeCount;

  bool hashComputed;
  bool reoriented;

  std::vector<Position> cubes;

public:

  Polyomino();
  ~Polyomino();

  int getWidth();
  int getHeight();
  int getDepth();
  Position minCorner();
  Position maxCorner();

  int boundingVolume();

  size_t getCubeCount();
  bool isCubeAt(int,int,int);
  bool isCubeAt(Position&);
  bool cubeTouching(int,int,int);
  bool cubeTouching(Position&);
  Polyomino& addCube(int,int,int);
  Polyomino& addCube(Position&);
  Polyomino& removeCube(int,int,int);
  Polyomino& removeCube(Position&);
  Polyomino& reorient();

  void recomputeBounding();
  void recomputeCorners();
  void recomputeDims();

  Position getCube(int);
  Polyomino& translate(int,int,int);
  Polyomino& translate(Position&);
  Polyomino& rotate(int);
  Polyomino& moveToOrigin();
  Polyomino& join(Polyomino&);
  bool equals(Polyomino&);
  bool intersecting(Polyomino&);
  bool operator== (Polyomino&);
  Polyomino& popLast();

  hashType hash();

  const std::string toString();
  friend std::ostream& operator<< (std::ostream& os, Polyomino& c);
};

#endif // POLYOMINO_H
