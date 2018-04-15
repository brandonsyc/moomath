#include <ostream>

#ifndef POSITION_H
#define POSITION_H

typedef unsigned long long int hashType;

struct Position {
  Position(); // Constructor with no arguments
  Position(int, int, int); // Constructor (x, y, z)
  ~Position(); // Destructor

  int x;
  int y;
  int z;

  hashType hash(); // Hash (unsigned long long)
  const std::string toString(); // String output for debugging

  friend bool operator== (Position&, Position&); // Equality operator
  friend std::ostream& operator<< (std::ostream&, Position);
};

#endif
