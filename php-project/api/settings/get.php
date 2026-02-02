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
    
    // Get settings (should be only one row)
    $stmt = $db->prepare("SELECT * FROM settings LIMIT 1");
    $stmt->execute();
    $settings = $stmt->fetch();
    
    // If no settings exist, create default
    if (!$settings) {
        $id = generateUUID();
        $stmt = $db->prepare("
            INSERT INTO settings (id, company_name, address, phone, email, api_key, logo, updated_at)
            VALUES (?, '', '', '', '', '', '', NOW())
        ");
        $stmt->execute([$id]);
        
        $settings = [
            'id' => $id,
            'company_name' => '',
            'address' => '',
            'phone' => '',
            'email' => '',
            'api_key' => '',
            'logo' => '',
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }
    
    sendResponse(200, convertKeysToCamel($settings));
    
} catch (Exception $e) {
    error_log("Settings get error: " . $e->getMessage());
    sendError(500, 'Failed to fetch settings');
}
