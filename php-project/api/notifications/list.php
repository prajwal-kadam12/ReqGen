<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';
require_once '../../config/database.php';

session_start();
requireAuth();

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(405, 'Method not allowed');
}

$user = getCurrentUser();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Get notifications for current user with read status
    $stmt = $db->prepare("
        SELECT 
            n.*,
            un.is_read,
            un.read_at
        FROM user_notifications un
        JOIN notifications n ON un.notification_id = n.id
        WHERE un.user_id = ?
        ORDER BY n.created_at DESC
    ");
    
    $stmt->execute([$user['id']]);
    $notifications = $stmt->fetchAll();
    
    // Convert to camelCase
    $result = array_map(function($notif) {
        return convertKeysToCamel($notif);
    }, $notifications);
    
    sendResponse(200, $result);
    
} catch (Exception $e) {
    error_log("Notifications list error: " . $e->getMessage());
    sendError(500, 'Failed to fetch notifications');
}
