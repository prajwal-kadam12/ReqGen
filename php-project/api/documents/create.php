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
if (!isset($input['name']) || !isset($input['type']) || !isset($input['content']) || !isset($input['originalNote'])) {
    sendError(400, 'Name, type, content, and originalNote are required');
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
    
    // Insert document
    $stmt = $db->prepare("
        INSERT INTO documents (
            id, name, type, content, original_note, refined_note,
            company_name, project_name, status, client_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $id,
        $input['name'],
        $input['type'],
        $input['content'],
        $input['originalNote'],
        $input['refinedNote'] ?? null,
        $input['companyName'] ?? null,
        $input['projectName'] ?? null,
        $input['status'] ?? 'pending',
        $input['clientMessage'] ?? null,
        $createdAt
    ]);
    
    // Return created document
    $document = [
        'id' => $id,
        'name' => $input['name'],
        'type' => $input['type'],
        'content' => $input['content'],
        'original_note' => $input['originalNote'],
        'refined_note' => $input['refinedNote'] ?? null,
        'company_name' => $input['companyName'] ?? null,
        'project_name' => $input['projectName'] ?? null,
        'status' => $input['status'] ?? 'pending',
        'client_message' => $input['clientMessage'] ?? null,
        'created_at' => $createdAt,
        'last_updated_at' => null,
        'updated_by' => null,
        'previous_content' => null
    ];
    
    sendSuccess(convertKeysToCamel($document), 'Document created successfully');
    
} catch (Exception $e) {
    error_log("Document creation error: " . $e->getMessage());
    sendError(500, 'Failed to create document');
}
