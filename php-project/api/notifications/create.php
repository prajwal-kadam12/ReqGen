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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['title']) || !isset($input['message']) || !isset($input['targetRole'])) {
    sendError(400, 'Title, message, and targetRole are required');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Generate UUID
    $id = generateUUID();
    $createdAt = date('Y-m-d H:i:s');
    
    // Insert notification
    $stmt = $db->prepare("
        INSERT INTO notifications (
            id, title, message, target_role, document_id, document_name, creator_role, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $id,
        $input['title'],
        $input['message'],
        $input['targetRole'],
        $input['documentId'] ?? null,
        $input['documentName'] ?? null,
        $input['creatorRole'] ?? null,
        $createdAt
    ]);
    
    // Get all users with target role
    $targetRole = $input['targetRole'];
    if ($targetRole === 'all') {
        $stmt = $db->prepare("SELECT id FROM users");
        $stmt->execute();
    } else {
        $stmt = $db->prepare("SELECT id FROM users WHERE role = ?");
        $stmt->execute([$targetRole]);
    }
    $users = $stmt->fetchAll();
    
    // Create user_notifications for each target user
    $stmt = $db->prepare("
        INSERT INTO user_notifications (id, notification_id, user_id, is_read, read_at)
        VALUES (?, ?, ?, 'false', NULL)
    ");
    
    foreach ($users as $user) {
        $userNotifId = generateUUID();
        $stmt->execute([$userNotifId, $id, $user['id']]);
    }
    
    // Return created notification
    $notification = [
        'id' => $id,
        'title' => $input['title'],
        'message' => $input['message'],
        'target_role' => $input['targetRole'],
        'document_id' => $input['documentId'] ?? null,
        'document_name' => $input['documentName'] ?? null,
        'creator_role' => $input['creatorRole'] ?? null,
        'created_at' => $createdAt
    ];
    
    sendSuccess(convertKeysToCamel($notification), 'Notification created successfully');
    
} catch (Exception $e) {
    error_log("Notification creation error: " . $e->getMessage());
    sendError(500, 'Failed to create notification');
}
