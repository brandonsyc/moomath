typedef enum { false, true } bool;

bool init() {
  if (!resource1_init()) goto resource1;
  if (!resource2_init()) goto resource2;
  if (!resource3_init()) goto resource3;

  return true; // Only returns true if all initializations were successful

  resource3:
  resource3_deinit();

  resource2:
  resource2_deinit();

  resource1:
  resource2_deinit();

  return false;
}
