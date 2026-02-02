<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

session_start();
requireAuth();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['recipient']) || !isset($input['subject']) || !isset($input['documentHtml'])) {
    sendError(400, 'Recipient, subject, and documentHtml are required');
}

// Get SMTP credentials from environment or config
$smtpHost = getenv('SMTP_HOST') ?: SMTP_HOST;
$smtpPort = getenv('SMTP_PORT') ?: SMTP_PORT;
$smtpUser = getenv('SMTP_USER') ?: SMTP_USERNAME;
$smtpPass = getenv('SMTP_PASSWORD') ?: SMTP_PASSWORD;
$smtpFrom = getenv('SMTP_FROM_EMAIL') ?: SMTP_FROM_EMAIL;

// Check if SMTP is configured
if (empty($smtpHost) || empty($smtpUser) || empty($smtpPass) || empty($smtpFrom)) {
    sendError(500, 'SMTP not configured. Please set SMTP environment variables.');
}

try {
    // Use PHP mail() function with proper headers (basic implementation)
    // For production, use PHPMailer library
    
    $to = $input['recipient'];
    $subject = $input['subject'];
    $message = $input['message'] ?? '';
    $documentHtml = $input['documentHtml'];
    $documentName = $input['documentName'] ?? 'document';
    
    // Create email body
    $emailBody = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #f4f4f4; padding: 20px; border-bottom: 3px solid #007bff; }
                .content { padding: 20px; }
                .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h2>ReqGen Document</h2>
            </div>
            <div class='content'>
                <p><strong>Subject:</strong> {$subject}</p>
                " . (!empty($message) ? "<p><strong>Message:</strong><br>{$message}</p>" : "") . "
                <hr>
                <h3>Document Content:</h3>
                {$documentHtml}
            </div>
            <div class='footer'>
                <p>Sent from ReqGen - Requirement Document Generator</p>
            </div>
        </body>
        </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: ReqGen <{$smtpFrom}>" . "\r\n";
    
    // Send email using PHP mail() function
    // Note: This requires a mail server configured on the system
    // For production, use PHPMailer with SMTP authentication
    $sent = mail($to, $subject, $emailBody, $headers);
    
    if ($sent) {
        sendSuccess(null, 'Email sent successfully');
    } else {
        // Log detailed error
        error_log("Email send failed - To: $to, Subject: $subject");
        sendError(500, 'Failed to send email. Please check SMTP configuration.');
    }
    
} catch (Exception $e) {
    error_log("Email send error: " . $e->getMessage());
    sendError(500, 'Failed to send email: ' . $e->getMessage());
}
