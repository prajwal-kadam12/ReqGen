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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input)) {
    sendError(400, 'No update data provided');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Get existing settings
    $stmt = $db->prepare("SELECT * FROM settings LIMIT 1");
    $stmt->execute();
    $existing = $stmt->fetch();
    
    // Build update query
    $updates = [];
    $params = [];
    
    // Map camelCase to snake_case
    $fieldMap = [
        'companyName' => 'company_name',
        'address' => 'address',
        'phone' => 'phone',
        'email' => 'email',
        'apiKey' => 'api_key',
        'logo' => 'logo'
    ];
    
    foreach ($fieldMap as $camelKey => $snakeKey) {
        if (isset($input[$camelKey])) {
            $updates[] = "$snakeKey = ?";
            $params[] = $input[$camelKey];
        }
    }
    
    if (empty($updates)) {
        sendError(400, 'No valid fields to update');
    }
    
    // Add updated_at
    $updates[] = "updated_at = NOW()";
    
    // Add ID for WHERE clause
    $params[] = $existing['id'];
    
    // Execute update
    $sql = "UPDATE settings SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Fetch updated settings
    $stmt = $db->prepare("SELECT * FROM settings WHERE id = ?");
    $stmt->execute([$existing['id']]);
    $updatedSettings = $stmt->fetch();
    
    sendResponse(200, convertKeysToCamel($updatedSettings));
    
} catch (Exception $e) {
    error_log("Settings update error: " . $e->getMessage());
    sendError(500, 'Failed to update settings');
}
