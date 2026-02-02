<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';
require_once '../../config/database.php';

session_start();
requireAuth();

// Only allow POST or PATCH
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH'])) {
    sendError(405, 'Method not allowed');
}

// Get notification ID from query string
if (!isset($_GET['id'])) {
    sendError(400, 'Notification ID is required');
}

$notificationId = $_GET['id'];
$user = getCurrentUser();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Update user_notification to mark as read
    $stmt = $db->prepare("
        UPDATE user_notifications 
        SET is_read = 'true', read_at = NOW()
        WHERE notification_id = ? AND user_id = ?
    ");
    
    $stmt->execute([$notificationId, $user['id']]);
    
    if ($stmt->rowCount() === 0) {
        sendError(404, 'Notification not found for this user');
    }
    
    sendSuccess(null, 'Notification marked as read');
    
} catch (Exception $e) {
    error_log("Mark notification read error: " . $e->getMessage());
    sendError(500, 'Failed to mark notification as read');
}
