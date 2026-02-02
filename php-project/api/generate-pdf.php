<?php
require_once '../config/config.php';
require_once '../config/database.php';

if (!isLoggedIn()) {
    die('Unauthorized');
}

$documentId = $_GET['id'] ?? '';

if (empty($documentId)) {
    die('Document ID required');
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
    die('Document not found');
}

// Check if Composer autoload is available
if (file_exists('../vendor/autoload.php')) {
    require_once '../vendor/autoload.php';
    
    // Try to use TCPDF if available
    if (class_exists('TCPDF')) {
        generatePDFWithTCPDF($document);
        exit;
    }
}

// Fallback: Generate simple PDF using PHP
generateSimplePDF($document);

/**
 * Generate PDF using TCPDF library
 */
function generatePDFWithTCPDF($document) {
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
    // Document information
    $pdf->SetCreator('ReqGen');
    $pdf->SetAuthor('ReqGen System');
    $pdf->SetTitle(htmlspecialchars($document['name'], ENT_QUOTES, 'UTF-8'));
    
    // Header and footer
    $pdf->SetHeaderData('', 0, 'ReqGen', htmlspecialchars($document['name'], ENT_QUOTES, 'UTF-8'));
    $pdf->setFooterData(array(0,64,0), array(0,64,128));
    
    // Margins
    $pdf->SetMargins(15, 27, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(10);
    
    $pdf->SetAutoPageBreak(TRUE, 25);
    $pdf->SetFont('helvetica', '', 11);
    
    $pdf->AddPage();
    
    // Content is already HTML-escaped when stored, safe to render
    $html = $document['content'];
    $pdf->writeHTML($html, true, false, true, false, '');
    
    // Output PDF
    $filename = sanitizeFilename($document['name']) . '.pdf';
    $pdf->Output($filename, 'D');
}

/**
 * Generate simple PDF without library (fallback)
 */
function generateSimplePDF($document) {
    // Set headers for PDF download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . sanitizeFilename($document['name']) . '.pdf"');
    
    // Create simple PDF structure
    $pdf = "%PDF-1.4\n";
    $pdf .= "1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n";
    $pdf .= "2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n";
    $pdf .= "3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n";
    $pdf .= "4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n";
    
    // Convert HTML to plain text (content is already escaped)
    $text = strip_tags($document['content']);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    // Create content stream
    $stream = "BT\n/F1 12 Tf\n50 750 Td\n";
    $lines = explode("\n", wordwrap($text, 80));
    $y = 750;
    
    foreach ($lines as $line) {
        if ($y < 50) break;
        // Escape special PDF characters
        $line = str_replace(['(', ')', '\\'], ['\\(', '\\)', '\\\\'], $line);
        $stream .= "($line) Tj\n0 -15 Td\n";
        $y -= 15;
    }
    
    $stream .= "ET";
    $length = strlen($stream);
    
    $pdf .= "5 0 obj\n<<\n/Length $length\n>>\nstream\n$stream\nendstream\nendobj\n";
    $pdf .= "xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\n0000000262 00000 n\n0000000341 00000 n\n";
    $pdf .= "trailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n" . (strlen($pdf) + 40) . "\n%%EOF";
    
    echo $pdf;
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename($filename) {
    $filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $filename);
    return substr($filename, 0, 50);
}
?>
