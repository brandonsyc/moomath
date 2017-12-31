<html>
<body>

<?php
if (strcmp(hash("sha256", $_POST["password"]), "c0652329a1b42110e658be85e74734175f69f3571ced784280f5d7050e9a6775") == 0) {
  echo "Correct password.";
  shell_exec("touch markRestart.txt");
} else {
  echo "Incorrect password.";
}
?>

</body>
</html>
