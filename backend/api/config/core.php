<?php
// Show error reporting
error_reporting(E_ALL);

// Set default timezone
date_default_timezone_set('Asia/Manila');

// Variables used for JWT
$key = "your_secret_key_here";
$issued_at = time();
$expiration_time = $issued_at + (60 * 60); // valid for 1 hour
$issuer = "http://192.168.43.91/LocalGovtAssetMgt_App/";
?> 