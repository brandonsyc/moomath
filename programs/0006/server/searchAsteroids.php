<?php
header('Access-Control-Allow-Origin: *');
header("Content-Type: text/plain");

$query='python -S query.py '.str_replace(' ','',urldecode($_SERVER['QUERY_STRING']));
$output=shell_exec(escapeshellcmd($query));
echo"$output";
?>
