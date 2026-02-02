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

$documentId = $_POST['document_id'] ?? '';
$recipientEmail = $_POST['recipient_email'] ?? '';
$subject = $_POST['subject'] ?? 'Document from ReqGen';
$message = $_POST['message'] ?? 'Please find the attached document.';

// Validation
if (empty($documentId) || empty($recipientEmail)) {
    sendJSON(['success' => false, 'message' => 'Document ID and recipient email required'], 400);
}

if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
    sendJSON(['success' => false, 'message' => 'Invalid email address'], 400);
}

// Get document from database
$conn = getDBConnection();
$document = null;

if ($conn) {
    $stmt = $conn->prepare("SELECT * FROM documents WHERE id = ?");
    $stmt->bind_param("s", $documentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $document = $result->fetch_assoc();
    }
    
    $stmt->close();
    $conn->close();
}

if (!$document) {
    sendJSON(['success' => false, 'message' => 'Document not found'], 404);
}

// Check if PHPMailer is available
$phpMailerPath = '../vendor/phpmailer/phpmailer/src/PHPMailer.php';

if (file_exists($phpMailerPath)) {
    // Use PHPMailer library
    require_once $phpMailerPath;
    require_once '../vendor/phpmailer/phpmailer/src/SMTP.php';
    require_once '../vendor/phpmailer/phpmailer/src/Exception.php';
    
    $result = sendEmailWithPHPMailer($recipientEmail, $subject, $message, $document);
} else {
    // Fallback: Use PHP mail() function
    $result = sendEmailSimple($recipientEmail, $subject, $message, $document);
}

if ($result['success']) {
    sendJSON($result);
} else {
    sendJSON($result, 500);
}

/**
 * Send email using PHPMailer library
 */
function sendEmailWithPHPMailer($to, $subject, $message, $document) {
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        
        $emailBody = "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <h2>Document from ReqGen</h2>
            <p>{$message}</p>
            <hr>
            <h3>{$document['name']}</h3>
            <p><strong>Type:</strong> " . strtoupper($document['type']) . "</p>
            <p><strong>Company:</strong> {$document['company_name']}</p>
            <p><strong>Project:</strong> {$document['project_name']}</p>
            <hr>
            <div>{$document['content']}</div>
        </body>
        </html>
        ";
        
        $mail->Body = $emailBody;
        $mail->AltBody = strip_tags($message . "\n\n" . $document['content']);
        
        $mail->send();
        
        return ['success' => true, 'message' => 'Email sent successfully'];
        
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to send email: ' . $mail->ErrorInfo];
    }
}

/**
 * Send email using PHP mail() function (fallback)
 */
function sendEmailSimple($to, $subject, $message, $document) {
    $headers = "From: " . SMTP_FROM_EMAIL . "\r\n";
    $headers .= "Reply-To: " . SMTP_FROM_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    $emailBody = "
    <html>
    <body style='font-family: Arial, sans-serif;'>
        <h2>Document from ReqGen</h2>
        <p>{$message}</p>
        <hr>
        <h3>{$document['name']}</h3>
        <p><strong>Type:</strong> " . strtoupper($document['type']) . "</p>
        <p><strong>Company:</strong> {$document['company_name']}</p>
        <p><strong>Project:</strong> {$document['project_name']}</p>
        <hr>
        <div>{$document['content']}</div>
    </body>
    </html>
    ";
    
    if (mail($to, $subject, $emailBody, $headers)) {
        return ['success' => true, 'message' => 'Email sent successfully'];
    } else {
        return ['success' => false, 'message' => 'Failed to send email. Please check SMTP configuration.'];
    }
}
?>
