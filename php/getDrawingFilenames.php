<?php
$dir    = '../drawings';
$files = scandir($dir, 1);
echo json_encode($files);
?>