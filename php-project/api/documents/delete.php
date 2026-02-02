<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';
require_once '../../config/database.php';

session_start();
requireAuth();

// Only allow DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError(405, 'Method not allowed');
}

// Get document ID from query string
if (!isset($_GET['id'])) {
    sendError(400, 'Document ID is required');
}

$id = $_GET['id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError(500, 'Database connection failed');
    }
    
    // Check if document exists
    $stmt = $db->prepare("SELECT id FROM documents WHERE id = ?");
    $stmt->execute([$id]);
    
    if (!$stmt->fetch()) {
        sendError(404, 'Document not found');
    }
    
    // Delete document
    $stmt = $db->prepare("DELETE FROM documents WHERE id = ?");
    $stmt->execute([$id]);
    
    sendSuccess(null, 'Document deleted successfully');
    
} catch (Exception $e) {
    error_log("Document deletion error: " . $e->getMessage());
    sendError(500, 'Failed to delete document');
}
