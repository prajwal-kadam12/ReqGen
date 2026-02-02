<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$documentId = $_GET['id'] ?? '';

if (empty($documentId)) {
    redirect('documents.php');
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
    redirect('documents.php');
}

$pageTitle = $document['name'];
require_once 'includes/header.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2><i class="fas fa-file-alt me-2"></i><?php echo htmlspecialchars($document['name']); ?></h2>
            <div class="btn-group">
                <a href="documents.php" class="btn btn-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Back
                </a>
                <a href="api/generate-pdf.php?id=<?php echo $document['id']; ?>" class="btn btn-success" target="_blank">
                    <i class="fas fa-file-pdf me-2"></i>Download PDF
                </a>
                <button onclick="print()" class="btn btn-info">
                    <i class="fas fa-print me-2"></i>Print
                </button>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card shadow">
            <div class="card-body document-viewer">
                <?php echo $document['content']; ?>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="card shadow mb-3">
            <div class="card-header bg-primary text-white">
                <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Document Info</h6>
            </div>
            <div class="card-body">
                <p><strong>Type:</strong> 
                    <span class="badge bg-primary"><?php echo strtoupper($document['type']); ?></span>
                </p>
                <p><strong>Company:</strong> <?php echo htmlspecialchars($document['company_name'] ?? 'N/A'); ?></p>
                <p><strong>Project:</strong> <?php echo htmlspecialchars($document['project_name'] ?? 'N/A'); ?></p>
                <p><strong>Created:</strong> <?php echo date('M d, Y H:i', strtotime($document['created_at'])); ?></p>
            </div>
        </div>
        
        <div class="card shadow">
            <div class="card-header bg-secondary text-white">
                <h6 class="mb-0"><i class="fas fa-sticky-note me-2"></i>Original Notes</h6>
            </div>
            <div class="card-body">
                <p class="small"><?php echo nl2br(htmlspecialchars($document['original_note'])); ?></p>
            </div>
        </div>
        
        <?php if ($document['refined_note']): ?>
        <div class="card shadow mt-3">
            <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="fas fa-check-circle me-2"></i>Refined Notes</h6>
            </div>
            <div class="card-body">
                <p class="small"><?php echo nl2br(htmlspecialchars($document['refined_note'])); ?></p>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<style>
.document-viewer {
    padding: 40px;
    background: white;
}

.document-viewer h1 {
    color: #333;
    border-bottom: 3px solid #667eea;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.document-viewer h2 {
    color: #555;
    margin-top: 20px;
}

.document-viewer h3 {
    color: #667eea;
    margin-top: 20px;
    margin-bottom: 15px;
}

.document-viewer .doc-info {
    background: #f8f9fa;
    padding: 15px;
    border-left: 4px solid #667eea;
    margin-bottom: 30px;
}

.document-viewer .requirements-section,
.document-viewer .refined-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 15px 0;
}

.document-viewer ul {
    margin-left: 20px;
}

.document-viewer .signatures {
    margin-top: 60px;
}

@media print {
    .navbar,
    .btn-group,
    .card:not(.document-viewer),
    .col-lg-4 {
        display: none !important;
    }
    
    .col-lg-8 {
        width: 100%;
        max-width: 100%;
    }
}
</style>

<?php require_once 'includes/footer.php'; ?>
