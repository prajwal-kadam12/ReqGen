<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

// Test database connection
require_once __DIR__ . '/../config/database.php';

$dbStatus = 'disconnected';
$dbMessage = 'Not tested';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        $dbStatus = 'connected';
        $dbMessage = 'Successfully connected to MySQL database';
    } else {
        $dbStatus = 'failed';
        $dbMessage = 'Failed to connect to database';
    }
} catch (Exception $e) {
    $dbStatus = 'error';
    $dbMessage = $e->getMessage();
}

$response = [
    'status' => 'success',
    'message' => 'ReqGen PHP API v1.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'database' => [
        'status' => $dbStatus,
        'message' => $dbMessage
    ],
    'endpoints' => [
        'authentication' => [
            'POST /api/auth/login.php' => 'User login',
            'POST /api/auth/logout.php' => 'User logout',
            'GET /api/auth/check.php' => 'Check authentication status'
        ],
        'documents' => [
            'POST /api/documents/create.php' => 'Create new document',
            'GET /api/documents/list.php' => 'List all documents',
            'PATCH /api/documents/update.php?id={id}' => 'Update document',
            'DELETE /api/documents/delete.php?id={id}' => 'Delete document'
        ],
        'settings' => [
            'GET /api/settings/get.php' => 'Get company settings',
            'POST /api/settings/update.php' => 'Update settings'
        ],
        'notifications' => [
            'POST /api/notifications/create.php' => 'Create notification',
            'GET /api/notifications/list.php' => 'List user notifications',
            'POST /api/notifications/mark-read.php?id={id}' => 'Mark notification as read',
            'POST /api/notifications/clear-all.php' => 'Clear all notifications'
        ],
        'services' => [
            'POST /api/email/send.php' => 'Send email with document',
            'POST /api/transcribe/transcribe.php' => 'Transcribe audio (Deepgram)',
            'POST /api/refine/refine.php' => 'Refine document with AI (OpenAI)'
        ]
    ],
    'documentation' => [
        'setup_guide' => '/reqgen/PHP_COMPLETE_SETUP_HINDI.md',
        'database_schema' => '/reqgen/database/schema.sql'
    ],
    'features' => [
        '✅ User Authentication (Session-based)',
        '✅ Document Management (CRUD)',
        '✅ AI Document Refinement (OpenAI)',
        '✅ Voice Transcription (Deepgram)',
        '✅ Email Sending (SMTP)',
        '✅ Notifications System',
        '✅ Settings Management',
        '✅ Multi-language Support (Hindi, Marathi, English)'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
