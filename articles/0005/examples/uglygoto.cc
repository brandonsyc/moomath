int f() {
  int x = 10, y = 10;
  loop1:

  y += x;

  if (y > 5 * x) goto loop2;

  y += 2 * x;

  loop2:

  x -= 1;

  if (x <= 0) goto exit;

  goto loop1;
  exit:

  return y;
}
