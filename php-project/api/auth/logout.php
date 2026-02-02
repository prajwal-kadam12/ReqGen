<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

session_start();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

// Clear session
clearUserSession();

sendSuccess(null, 'Logout successful');
