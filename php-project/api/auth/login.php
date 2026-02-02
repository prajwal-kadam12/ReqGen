<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';
require_once '../../config/database.php';

session_start();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['email']) || !isset($input['password']) || !isset($input['role'])) {
    sendError(400, 'Email, password, and role are required');
}

$email = trim($input['email']);
$password = $input['password'];
$role = trim($input['role']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError(400, 'Invalid email format');
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Find user by email and role
    $stmt = $db->prepare("
        SELECT id, username, email, password, role, name 
        FROM users 
        WHERE email = ? AND role = ?
    ");
    $stmt->execute([$email, $role]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError(401, 'Invalid credentials or role');
    }
    
    // Verify password (plain text for demo - use password_verify() in production!)
    if ($password !== $user['password']) {
        sendError(401, 'Invalid credentials');
    }
    
    // Set session
    setUserSession($user);
    
    // Return user data (convert to camelCase for frontend)
    $userData = convertKeysToCamel([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['name']
    ]);
    
    sendSuccess(['user' => $userData], 'Login successful');
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendError(500, 'Server error during login');
}
