int f() {
  int x = 10, y = 10;

  do {
    y += x;

    if (y <= 5 * x) {
      y += 2 * x;
    }

    x -= 1;
  } while (x > 0);

  return y;
}
