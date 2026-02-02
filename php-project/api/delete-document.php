<?php
require_once '../config/config.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'message' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['success' => false, 'message' => 'Invalid request method'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$documentId = $input['document_id'] ?? '';

if (empty($documentId)) {
    sendJSON(['success' => false, 'message' => 'Document ID required'], 400);
}

$conn = getDBConnection();

if (!$conn) {
    sendJSON(['success' => false, 'message' => 'Database connection failed'], 500);
}

try {
    $stmt = $conn->prepare("DELETE FROM documents WHERE id = ?");
    $stmt->bind_param("s", $documentId);
    
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        $stmt->close();
        $conn->close();
        sendJSON(['success' => true, 'message' => 'Document deleted successfully']);
    } else {
        throw new Exception('Document not found or already deleted');
    }
} catch (Exception $e) {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    sendJSON(['success' => false, 'message' => $e->getMessage()], 500);
}
?>
