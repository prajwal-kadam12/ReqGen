<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';
require_once '../../config/database.php';

session_start();
requireAuth();

// Allow PATCH or PUT
if (!in_array($_SERVER['REQUEST_METHOD'], ['PATCH', 'PUT'])) {
    sendError(405, 'Method not allowed');
}

// Get document ID from query string
if (!isset($_GET['id'])) {
    sendError(400, 'Document ID is required');
}

$id = $_GET['id'];
$user = getCurrentUser();

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
    
    // Get existing document
    $stmt = $db->prepare("SELECT * FROM documents WHERE id = ?");
    $stmt->execute([$id]);
    $existingDoc = $stmt->fetch();
    
    if (!$existingDoc) {
        sendError(404, 'Document not found');
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    // Track if content is being changed by admin/analyst
    $previousContent = $existingDoc['previous_content'];
    $isAdminOrAnalyst = in_array($user['role'], ['admin', 'analyst']);
    
    if (isset($input['content']) && $input['content'] !== $existingDoc['content'] && 
        $isAdminOrAnalyst && $existingDoc['previous_content'] === null) {
        $previousContent = $existingDoc['content'];
    }
    
    // Map camelCase to snake_case and build update
    $fieldMap = [
        'name' => 'name',
        'type' => 'type',
        'content' => 'content',
        'originalNote' => 'original_note',
        'refinedNote' => 'refined_note',
        'companyName' => 'company_name',
        'projectName' => 'project_name',
        'status' => 'status',
        'clientMessage' => 'client_message'
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
    
    // Add metadata
    $updates[] = "last_updated_at = ?";
    $params[] = date('Y-m-d H:i:s');
    
    $updates[] = "updated_by = ?";
    $params[] = $user['username'];
    
    $updates[] = "previous_content = ?";
    $params[] = $previousContent;
    
    // Add ID for WHERE clause
    $params[] = $id;
    
    // Execute update
    $sql = "UPDATE documents SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Fetch updated document
    $stmt = $db->prepare("SELECT * FROM documents WHERE id = ?");
    $stmt->execute([$id]);
    $updatedDoc = $stmt->fetch();
    
    sendSuccess(convertKeysToCamel($updatedDoc), 'Document updated successfully');
    
} catch (Exception $e) {
    error_log("Document update error: " . $e->getMessage());
    sendError(500, 'Failed to update document');
}
