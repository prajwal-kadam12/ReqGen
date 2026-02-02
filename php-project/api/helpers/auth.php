<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is authenticated
function isAuthenticated() {
    return isset($_SESSION['user_id']) && isset($_SESSION['user_email']);
}

// Get current user data from session
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'],
        'username' => $_SESSION['user_username'] ?? '',
        'role' => $_SESSION['user_role'] ?? '',
        'name' => $_SESSION['user_name'] ?? ''
    ];
}

// Require authentication (call this at the start of protected endpoints)
function requireAuth() {
    if (!isAuthenticated()) {
        require_once __DIR__ . '/response.php';
        sendError(401, 'Unauthorized - Please login');
    }
}

// Set user session
function setUserSession($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_username'] = $user['username'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_name'] = $user['name'];
}

// Clear user session
function clearUserSession() {
    session_unset();
    session_destroy();
}
