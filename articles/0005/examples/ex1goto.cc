void f(int a, int b) {
  int x = 0, y = 0;
  for (; x < a; x++) {
    for (; y < b; y++) {
      if (x + y > 10) {
        goto exitloop;
      }
     }
   }
   exitloop:

   /* … some operations on x and y … */
   return;
}

#include <iostream>

int main() {
  int i,j;

  for (i = 0; i < 5; i++) {
    for (j = 0; j < 5; j++) {
      if (i + j == 11) goto exit;
    }
  }
  exit:

  std::cout << i << " " << j << std::endl;

}
