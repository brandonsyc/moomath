hljs.initHighlightingOnLoad();
hljs.configure({ useBR: true });

let code = {

1: `// Example function 1
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
}`,

2: `// Function 1 rewritten
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
}`,
3: `f():
        push    rbp
        mov     rbp, rsp
        mov     DWORD PTR [rbp-4], 10   ; set x = 10
        mov     DWORD PTR [rbp-8], 10   ; set y = 10
.L2:
        mov     eax, DWORD PTR [rbp-4]  ; set register eax = x
        add     DWORD PTR [rbp-8], eax  ; y += x
        mov     edx, DWORD PTR [rbp-4]  ; set register edx = x
        mov     eax, edx                ; set register eax = x
        sal     eax, 2                  ; bit shift eax by 2
        add     eax, edx                ; add x to eax
        ; These operations result in eax being (x << 2) + x = 5 * x

        cmp     DWORD PTR [rbp-8], eax  ; Compare y and 5 * x
        jg      .L9                     ; Jump to L9 if comparison was greater
        mov     eax, DWORD PTR [rbp-4]  ; Set eax to x
        add     eax, eax                ; Add to itself (2 * x)
        add     DWORD PTR [rbp-8], eax  ; y += 2 * x
        jmp     .L4                     ; Unconditionally jump to L4
.L9:
        nop                             ; Do nothing
.L4:
        sub     DWORD PTR [rbp-4], 1    ; Decrement x
        cmp     DWORD PTR [rbp-4], 0    ; Compare x and 0
        jle     .L10 ; Jump to L10 if comparison was less than or equal to
        jmp     .L2                     ; Unconditionally jump to L2
.L10:
        nop                             ; Do nothing
        mov     eax, DWORD PTR [rbp-8]  ; Set eax to y (for return)
        pop     rbp
        ret`,
4: `f():
        push    rbp
        mov     rbp, rsp
        mov     DWORD PTR [rbp-4], 10
        mov     DWORD PTR [rbp-8], 10
.L4:
        mov     eax, DWORD PTR [rbp-4]
        add     DWORD PTR [rbp-8], eax
        mov     edx, DWORD PTR [rbp-4]
        mov     eax, edx
        sal     eax, 2
        add     eax, edx


        cmp     DWORD PTR [rbp-8], eax
        jg      .L2
        mov     eax, DWORD PTR [rbp-4]
        add     eax, eax
        add     DWORD PTR [rbp-8], eax



.L2:
        sub     DWORD PTR [rbp-4], 1
        cmp     DWORD PTR [rbp-4], 0
        jle     .L3
        jmp     .L4
.L3:

        mov     eax, DWORD PTR [rbp-8]
        pop     rbp
        ret`,
5: `f():
        mov     eax, 85
        ret`,
6: `f():
        mov     eax, 85
        ret`,
7: `// ...
volatile int x = 10, y = 10;
// ...`,
8: `f():
        mov     DWORD PTR [rsp-8], 10  ; x = 10
        mov     DWORD PTR [rsp-4], 10  ; y = 10
.L2:
        mov     edx, DWORD PTR [rsp-8] ; edx = x
        mov     eax, DWORD PTR [rsp-4] ; eax = y
        add     eax, edx               ; eax += edx
        mov     DWORD PTR [rsp-4], eax ; x = eax
        mov     eax, DWORD PTR [rsp-8] ; eax = x
        mov     edx, DWORD PTR [rsp-4] ; edx = y
        lea     eax, [rax+rax*4]       ; eax = 5 * x
        cmp     eax, edx               ; compare eax and edx
        jl      .L4                    ; jump if eax < edx
        mov     edx, DWORD PTR [rsp-8] ; edx = x
        mov     eax, DWORD PTR [rsp-4] ; eax = y
        lea     eax, [rax+rdx*2]       ; eax = y + 2 * x
        mov     DWORD PTR [rsp-4], eax ; y = eax
.L4:
        mov     eax, DWORD PTR [rsp-8] ; eax = x
        sub     eax, 1                 ; eax -= 1
        mov     DWORD PTR [rsp-8], eax ; x = eax
        mov     eax, DWORD PTR [rsp-8] ; eax = x
        test    eax, eax               ; bitwise and
        jg      .L2                    ; jumps if not 0 (i.e. eax != 0)
        mov     eax, DWORD PTR [rsp-4]
        ret`,
9: `f():
        mov     DWORD PTR [rsp-8], 10
        mov     DWORD PTR [rsp-4], 10
.L2:
        mov     edx, DWORD PTR [rsp-8]
        mov     eax, DWORD PTR [rsp-4]
        add     eax, edx
        mov     DWORD PTR [rsp-4], eax
        mov     eax, DWORD PTR [rsp-8]
        mov     edx, DWORD PTR [rsp-4]
        lea     eax, [rax+rax*4]
        cmp     eax, edx
        jl      .L3
        mov     edx, DWORD PTR [rsp-8]
        mov     eax, DWORD PTR [rsp-4]
        lea     eax, [rax+rdx*2]
        mov     DWORD PTR [rsp-4], eax
.L3:
        mov     eax, DWORD PTR [rsp-8]
        sub     eax, 1
        mov     DWORD PTR [rsp-8], eax
        mov     eax, DWORD PTR [rsp-8]
        test    eax, eax
        jg      .L2
        mov     eax, DWORD PTR [rsp-4]
        ret`,
10: `int init() {
  if (!resource1_init()) goto resource1;
  if (!resource2_init()) goto resource2;
  if (!resource3_init()) goto resource3;

  return 1; // Only returns true if all initializations were successful

  // Deinitializes as necessary
  resource3:
  resource3_deinit();

  resource2:
  resource2_deinit();

  resource1:
  resource2_deinit();

  return 0;
}`,
11: `int init() {
  if (resource1_init()) {
    if (resource2_init()) {
      if (resource3_init()) {
        return 1;
      }
      resource3_deinit();
    }
    resource2_deinit();
  }
  resource1_deinit();
}`,
12: `int init() {
  int count = 0;

  if (resource1_init()) count++;
  if (resource2_init()) count++;
  if (resource3_init()) count++;

  if (count == 3) return 1;

  if (count > 1) resource3_deinit();
  if (count > 0) resource2_deinit();
  resource1_deinit();
}`,
13: `void f(int a, int b) {
  int x = 0, y = 0;
  for (; x < a; x++) {
    for (; y < b; y++) {
      if (x + y > 10) {
        goto exitloop;
      }
    }
  }
  exitloop:

   /* ... some operations on x and y ... */
}`,
14: `std::pair<int, int> getPair(int a, int b) {
  int x = 0, y = 0;
  for (; x < a; x++) {
    for (; y < b; y++) {
      if (x + y > 10) {
        return std::make_pair(a, b);
      }
    }
  }
  return std::make_pair(a, b);
}

void f(int a, int b) {
   auto p = getPair(a, b);
   int x = p.first;
   int y = p.second;

   /* ... */
}`,
15: `inline void loop(int& x, int& y, int a, int b) {
  x = 0;
  y = 0;
  for (; x < a; x++) {
    for (; y < b; y++) {
      if (x + y > 10) {
        return;
      }
    }
  }
  return;
}

void f(int a, int b) {
   int x, y;
   loop(x, y, a, b);

   /* ... */
}`,
16: `void f(int a, int b) {
  int x = 10, y = 10;

  bool found = false;
  for (; x < a; x++) {
    for (; y < b; y++) {
      if (x + y > 10) {
        found = true;
        break;
      }
    }
    if (found) break;
   }

   /* ... */
}`,
17: `f(int, int):
        push    rbp
        mov     rbp, rsp
        mov     DWORD PTR [rbp-20], edi ; a
        mov     DWORD PTR [rbp-24], esi ; b
        mov     DWORD PTR [rbp-4], 10   ; x
        mov     DWORD PTR [rbp-8], 10   ; y
        mov     BYTE PTR [rbp-9], 0     ; found
.L7:
        mov     eax, DWORD PTR [rbp-4]
        cmp     eax, DWORD PTR [rbp-20]
        jge     .L2                     ; exit loop if x >= a
.L5:
        mov     eax, DWORD PTR [rbp-8]
        cmp     eax, DWORD PTR [rbp-24]
        jge     .L3
        mov     edx, DWORD PTR [rbp-4]
        mov     eax, DWORD PTR [rbp-8]
        add     eax, edx                ; add x + y
        cmp     eax, 10
        jle     .L4                     ; jump if x + y <= 10
        mov     BYTE PTR [rbp-9], 1     ; set found to true (1)
        jmp     .L3                     ; break
.L4:
        add     DWORD PTR [rbp-8], 1    ; Increment y
        jmp     .L5
.L3:
        cmp     BYTE PTR [rbp-9], 0     ; A comparison takes time!
        jne     .L9                     ; If found is true, break!
        add     DWORD PTR [rbp-4], 1
        jmp     .L7
.L9:
        nop
.L2:
        ; exits loop`,
18: `public void f(int a, int b) {
  int x = 10, y = 10;

  outer:
  for (; x < a; x++) {
    for (; y < b; y++) {
      if (x + y > 10) {
        break outer;
      }
    }
   }

   /* ... */
}`};

let count = 18;

for (let i = 1; i < count + 1; i++) {
  try {
    document.getElementById('ex' + i).innerHTML = convert(code[i]);
  } catch (e) {
    ;
  }
}

function indent(s) {
  let i = 0;
  for (; i < s.length; i++) {
    if (s[i] !== ' ') break;
  }

  return Array(2 + (i >> 1 << 2)).join(' ') + s.slice(i);
  // Such bit shift much wow
}

function convert(p) {
  let m = p.split('\n');
  return m.map(x => indent(x)).join('<br>');
}
