<!DOCTYPE html>
<html>
 <head>
  <meta http-equiv='content-type' content='image/jpeg'/>
 </head>
 <body>

<?php
$lcc = $_REQUEST['lcc'];

if (empty($lcc)){
	echo "  <br><br><br><br><br><br><br><br><br><br><br><br>";
	echo "  <h3><p style='text-align: center'>Dokument je ve skladu.</p></h3>";
} else {
	$pos1 = strpos($lcc, 'map');
	$pos2 = strpos($lcc, '.');
	$lcc = substr($lcc,$pos1 + 3, empty($pos2) ? strlen($lcc)-$pos1-3 : $pos2-$pos1-3);
	$url = 'http://www.techlib.cz/user-actions/get-location-image/lcc/';
	$pic = $url.$lcc;
	echo "  <img src=\"$pic\">";
}
?>
 </body>
</html>
