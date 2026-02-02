<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

session_start();

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(405, 'Method not allowed');
}

// Check if authenticated
if (!isAuthenticated()) {
    sendError(401, 'Not authenticated');
}

// Get current user
$user = getCurrentUser();

// Convert to camelCase
$userData = convertKeysToCamel($user);

sendSuccess(['user' => $userData]);
