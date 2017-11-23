#include <ostream>
#include "position.h"

Position::Position() {
  x = 0;
  y = 0;
  z = 0;
}

Position::Position(int xa, int ya, int za) {
  x = xa;
  y = ya;
  z = za;
}

Position::~Position() { }

hashType Position::hash() {
  hashType hash = 58897;

  for (int i = 0; i < 4; i++) {
    hash = ((hash << 5) + hash) + x;
    hash = ((hash << 5) + hash) + y;
    hash = ((hash << 5) + hash) + z;
  }

  return hash;
}

bool operator== (Position& a, Position& b) {
  return (a.x == b.x && a.y == b.y && a.z == b.z);
}

const std::string Position::toString() {
  return "x: " + std::to_string(x) + ", y: " + std::to_string(y) + ", z: " + std::to_string(z);
}

std::ostream& operator<< (std::ostream& os, Position p) {
  os << p.toString();
  return os;
}
