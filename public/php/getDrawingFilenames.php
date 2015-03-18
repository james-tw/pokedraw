

<?php
$path = ('../drawings');
$files = array();
$dir = opendir('../drawings');
while(($currentFile = readdir($dir)) !== false) {
    if ( $currentFile == '.' or $currentFile == '..' ) {
        continue;
    }
    $files[] = $currentFile;
}
closedir($dir);
echo json_encode(array_reverse($files));
?>

