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

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Get all documents, sorted by created_at DESC
    $stmt = $db->prepare("
        SELECT * FROM documents 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $documents = $stmt->fetchAll();
    
    // Convert to camelCase
    $result = array_map(function($doc) {
        return convertKeysToCamel($doc);
    }, $documents);
    
    sendResponse(200, $result);
    
} catch (Exception $e) {
    error_log("Documents list error: " . $e->getMessage());
    sendError(500, 'Failed to fetch documents');
}
