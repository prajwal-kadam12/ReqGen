<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';
require_once '../../config/database.php';

session_start();
requireAuth();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

$user = getCurrentUser();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Mark all notifications as read for current user
    $stmt = $db->prepare("
        UPDATE user_notifications 
        SET is_read = 'true', read_at = NOW()
        WHERE user_id = ?
    ");
    
    $stmt->execute([$user['id']]);
    
    sendSuccess(null, 'All notifications cleared');
    
} catch (Exception $e) {
    error_log("Clear all notifications error: " . $e->getMessage());
    sendError(500, 'Failed to clear notifications');
}
