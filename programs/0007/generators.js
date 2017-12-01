
var constantOptimizingValid = true;

document.getElementById('constant-optimizing').addEventListener('input', function() {
  var value = parseInt(this.value);

  if (!isNaN(value)) {
    if (value >= 0 && value < 256) {
      constantOptimizingValid = false;

      var prefix = '';
      if (!document.getElementById('constant-optimizing-zero').checked) {
        prefix = '[-]';
      }

      if (value <= 128) {
        document.getElementById('constant-optimizing-output').innerHTML =
          prefix + Array(value + 1).join('+');
      } else {
        document.getElementById('constant-optimizing-output').innerHTML =
          prefix + Array(257 - value).join('-');
      }
    } else {
      constantOptimizingValid = false;
      document.getElementById('constant-optimizing-output').innerHTML =
        '<span class="error">Input must be an integer from 0 to 255.</span>';
    }
  } else {
    constantOptimizingValid = false;
    document.getElementById('constant-optimizing-output').innerHTML =
      '<span class="error">Input must be an integer from 0 to 255.</span>';
  }
});

document.getElementById('constant-optimizing-copy').addEventListener('click', function() {
  if (constantOptimizingValid) {
    copyTextToClipboard(document.getElementById('constant-optimizing-output').innerText);
  }
});
