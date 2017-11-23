#include <iostream>
#include "polyomino.h"

int mainf() {
  Polyomino p;

  p.addCube(0, 0, 0).addCube(0, 0, 1).addCube(0, 1, 1).addCube(0, 1, 0);

  std::cout << p << std::endl;

  p.popLast();

  std::cout << p << std::endl;

  p.popLast();

  std::cout << p << std::endl;
  return 0;
}
