<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "status" => "success",
    "message" => "API is accessible",
    "server_time" => date('Y-m-d H:i:s'),
    "php_version" => PHP_VERSION,
    "server_ip" => $_SERVER['SERVER_ADDR'],
    "client_ip" => $_SERVER['REMOTE_ADDR']
]);
?> 