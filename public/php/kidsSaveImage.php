<?php

	define('UPLOAD_DIR', '../drawings/');
	$img = $_POST['imgBase64'];
	$img = str_replace('data:image/jpeg;base64,', '', $img);
	$img = str_replace(' ', '+', $img);
	$data = base64_decode($img);
	$datetime = date("Ymd") . date("His") . uniqid();
	$file = UPLOAD_DIR . $datetime . '.jpeg';
	$success = file_put_contents($file, $data);
	echo $success ? $file : "File failed to save.";

?>