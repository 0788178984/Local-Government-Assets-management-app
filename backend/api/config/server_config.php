<?php
/**
 * Server Configuration - SINGLE SOURCE OF TRUTH
 * Update this file when changing networks or server configuration
 */

// Server configuration
$server_config = [
    'ip' => '10.20.1.41',
    'base_path' => '/LocalGovtAssetMgt_App',
    'port' => '80', // Default HTTP port
    'api_path' => '/backend/api'
];

// Database configuration
$db_config = [
    'host' => 'localhost',
    'name' => 'local_govt_assets',
    'username' => 'root',
    'password' => ''
];

// Build common URLs
$port_part = ($server_config['port'] != '80') ? ':' . $server_config['port'] : '';
$base_url = "http://{$server_config['ip']}{$port_part}{$server_config['base_path']}";
$api_url = "{$base_url}{$server_config['api_path']}";
$uploads_url = "{$base_url}/backend/uploads";

// For use in other files
define('SERVER_BASE_URL', $base_url);
define('SERVER_API_URL', $api_url);
define('SERVER_UPLOADS_URL', $uploads_url);

// Make db_config available globally
global $db_config;
?>
