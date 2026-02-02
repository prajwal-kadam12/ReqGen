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

// Get and sanitize form data
$type = $_POST['type'] ?? '';
$name = $_POST['name'] ?? '';
$companyName = $_POST['company_name'] ?? null;
$projectName = $_POST['project_name'] ?? null;
$originalNote = $_POST['original_note'] ?? '';
$refinedNote = $_POST['refined_note'] ?? null;

// Validation
if (empty($type) || empty($name) || empty($originalNote)) {
    sendJSON(['success' => false, 'message' => 'Required fields missing'], 400);
}

// Validate document type
$validTypes = ['brd', 'srs', 'sdd', 'po'];
if (!in_array($type, $validTypes)) {
    sendJSON(['success' => false, 'message' => 'Invalid document type'], 400);
}

// Generate document content based on type (with proper escaping)
$content = generateDocumentContent($type, $name, $companyName, $projectName, $originalNote, $refinedNote);

// Save to database
$conn = getDBConnection();

if (!$conn) {
    sendJSON(['success' => false, 'message' => 'Database connection failed'], 500);
}

try {
    $id = uniqid('doc_', true);
    $createdAt = date('Y-m-d H:i:s');
    
    $stmt = $conn->prepare(
        "INSERT INTO documents (id, name, type, content, original_note, refined_note, company_name, project_name, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    
    $stmt->bind_param(
        "sssssssss",
        $id,
        $name,
        $type,
        $content,
        $originalNote,
        $refinedNote,
        $companyName,
        $projectName,
        $createdAt
    );
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        sendJSON([
            'success' => true,
            'message' => 'Document created successfully',
            'document_id' => $id
        ]);
    } else {
        throw new Exception('Failed to insert document');
    }
    
} catch (Exception $e) {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    sendJSON(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
}

/**
 * Generate document content based on type with proper HTML escaping
 */
function generateDocumentContent($type, $name, $company, $project, $originalNote, $refinedNote) {
    // Escape all user input to prevent XSS
    $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $company = htmlspecialchars($company ?: 'Company Name', ENT_QUOTES, 'UTF-8');
    $project = htmlspecialchars($project ?: 'Project Name', ENT_QUOTES, 'UTF-8');
    $originalNote = htmlspecialchars($originalNote, ENT_QUOTES, 'UTF-8');
    $refinedNote = htmlspecialchars($refinedNote ?: 'To be refined during analysis phase.', ENT_QUOTES, 'UTF-8');
    
    // Convert newlines to paragraphs for better formatting
    $originalNoteParagraphs = '<p>' . nl2br($originalNote) . '</p>';
    $refinedNoteParagraphs = '<p>' . nl2br($refinedNote) . '</p>';
    
    $date = htmlspecialchars(date('F d, Y'), ENT_QUOTES, 'UTF-8');
    
    $content = '';
    
    switch ($type) {
        case 'brd':
            $content = <<<HTML
<div class="document-content">
    <h1>Business Requirement Document (BRD)</h1>
    <h2>{$name}</h2>
    
    <div class="doc-info">
        <p><strong>Company:</strong> {$company}</p>
        <p><strong>Project:</strong> {$project}</p>
        <p><strong>Date:</strong> {$date}</p>
    </div>
    
    <h3>1. Executive Summary</h3>
    <p>This Business Requirement Document outlines the business needs and objectives for {$project}.</p>
    
    <h3>2. Business Requirements</h3>
    <div class="requirements-section">
        {$originalNoteParagraphs}
    </div>
    
    <h3>3. Refined Requirements</h3>
    <div class="refined-section">
        {$refinedNoteParagraphs}
    </div>
    
    <h3>4. Scope</h3>
    <p>The scope of this project includes all requirements mentioned above and will be further detailed during the planning phase.</p>
    
    <h3>5. Success Criteria</h3>
    <ul>
        <li>All business requirements implemented successfully</li>
        <li>User acceptance testing completed</li>
        <li>Deployment to production environment</li>
    </ul>
</div>
HTML;
            break;
            
        case 'srs':
            $content = <<<HTML
<div class="document-content">
    <h1>Software Requirement Specification (SRS)</h1>
    <h2>{$name}</h2>
    
    <div class="doc-info">
        <p><strong>Company:</strong> {$company}</p>
        <p><strong>Project:</strong> {$project}</p>
        <p><strong>Date:</strong> {$date}</p>
    </div>
    
    <h3>1. Introduction</h3>
    <p>This document specifies the software requirements for {$project}.</p>
    
    <h3>2. Functional Requirements</h3>
    <div class="requirements-section">
        {$originalNoteParagraphs}
    </div>
    
    <h3>3. Technical Specifications</h3>
    <div class="refined-section">
        {$refinedNoteParagraphs}
    </div>
    
    <h3>4. System Architecture</h3>
    <p>System architecture will follow industry best practices and scalable design patterns.</p>
    
    <h3>5. Performance Requirements</h3>
    <ul>
        <li>Response time: &lt; 2 seconds</li>
        <li>Uptime: 99.9%</li>
        <li>Concurrent users: 1000+</li>
    </ul>
</div>
HTML;
            break;
            
        case 'sdd':
            $content = <<<HTML
<div class="document-content">
    <h1>System Design Document (SDD)</h1>
    <h2>{$name}</h2>
    
    <div class="doc-info">
        <p><strong>Company:</strong> {$company}</p>
        <p><strong>Project:</strong> {$project}</p>
        <p><strong>Date:</strong> {$date}</p>
    </div>
    
    <h3>1. System Overview</h3>
    <p>This document describes the system design for {$project}.</p>
    
    <h3>2. Design Requirements</h3>
    <div class="requirements-section">
        {$originalNoteParagraphs}
    </div>
    
    <h3>3. Architecture Design</h3>
    <div class="refined-section">
        {$refinedNoteParagraphs}
    </div>
    
    <h3>4. Database Design</h3>
    <p>Database schema will be designed to support all functional requirements efficiently.</p>
    
    <h3>5. Interface Design</h3>
    <p>User interfaces will follow modern UX/UI principles for optimal user experience.</p>
</div>
HTML;
            break;
            
        case 'po':
            $content = <<<HTML
<div class="document-content">
    <h1>Purchase Order</h1>
    <h2>{$name}</h2>
    
    <div class="doc-info">
        <p><strong>Vendor:</strong> {$company}</p>
        <p><strong>Purchase Order Number:</strong> PO-{$date}-001</p>
        <p><strong>Date:</strong> {$date}</p>
    </div>
    
    <h3>Items/Services</h3>
    <div class="requirements-section">
        {$originalNoteParagraphs}
    </div>
    
    <h3>Additional Notes</h3>
    <div class="refined-section">
        {$refinedNoteParagraphs}
    </div>
    
    <h3>Terms &amp; Conditions</h3>
    <ul>
        <li>Payment terms: Net 30 days</li>
        <li>Delivery: As specified</li>
        <li>Returns: Subject to vendor policy</li>
    </ul>
    
    <div class="signatures">
        <p>_______________________</p>
        <p>Authorized Signature</p>
    </div>
</div>
HTML;
            break;
    }
    
    return $content;
}
?>
