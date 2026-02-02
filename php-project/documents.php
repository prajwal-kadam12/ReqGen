<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$pageTitle = 'Documents';

// Get all documents
$conn = getDBConnection();
$documents = [];

if ($conn) {
    $result = $conn->query("SELECT * FROM documents ORDER BY created_at DESC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $documents[] = $row;
        }
    }
    $conn->close();
}

require_once 'includes/header.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h2><i class="fas fa-folder-open me-2"></i>All Documents</h2>
                <p class="text-muted">Manage your generated documents</p>
            </div>
            <a href="create-document.php" class="btn btn-primary">
                <i class="fas fa-plus-circle me-2"></i>Create New
            </a>
        </div>
    </div>
</div>

<?php if (empty($documents)): ?>
<div class="row mt-4">
    <div class="col-12">
        <div class="card shadow text-center py-5">
            <div class="card-body">
                <i class="fas fa-inbox fa-5x text-muted mb-3"></i>
                <h4>No Documents Yet</h4>
                <p class="text-muted">Create your first document to get started!</p>
                <a href="create-document.php" class="btn btn-primary mt-3">
                    <i class="fas fa-plus-circle me-2"></i>Create Document
                </a>
            </div>
        </div>
    </div>
</div>
<?php else: ?>
<div class="row mt-4">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Company</th>
                                <th>Project</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($documents as $doc): ?>
                            <tr>
                                <td>
                                    <strong><?php echo htmlspecialchars($doc['name']); ?></strong>
                                </td>
                                <td>
                                    <?php
                                    $typeColors = [
                                        'brd' => 'primary',
                                        'srs' => 'success',
                                        'sdd' => 'warning',
                                        'po' => 'danger'
                                    ];
                                    $color = $typeColors[$doc['type']] ?? 'secondary';
                                    ?>
                                    <span class="badge bg-<?php echo $color; ?>"><?php echo strtoupper($doc['type']); ?></span>
                                </td>
                                <td><?php echo htmlspecialchars($doc['company_name'] ?? 'N/A'); ?></td>
                                <td><?php echo htmlspecialchars($doc['project_name'] ?? 'N/A'); ?></td>
                                <td>
                                    <small><?php echo date('M d, Y H:i', strtotime($doc['created_at'])); ?></small>
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="view-document.php?id=<?php echo $doc['id']; ?>" 
                                           class="btn btn-sm btn-info" title="View">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="api/generate-pdf.php?id=<?php echo $doc['id']; ?>" 
                                           class="btn btn-sm btn-success" title="Download PDF" target="_blank">
                                            <i class="fas fa-file-pdf"></i>
                                        </a>
                                        <button onclick="showEmailModal('<?php echo $doc['id']; ?>')" 
                                                class="btn btn-sm btn-warning" title="Send Email">
                                            <i class="fas fa-envelope"></i>
                                        </button>
                                        <button onclick="deleteDocument('<?php echo $doc['id']; ?>')" 
                                                class="btn btn-sm btn-danger" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<!-- Email Modal -->
<div class="modal fade" id="emailModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-envelope me-2"></i>Send Document via Email</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="emailForm">
                    <input type="hidden" id="email_doc_id" name="document_id">
                    <div class="mb-3">
                        <label for="recipient_email" class="form-label">Recipient Email</label>
                        <input type="email" class="form-control" id="recipient_email" name="recipient_email" required>
                    </div>
                    <div class="mb-3">
                        <label for="email_subject" class="form-label">Subject</label>
                        <input type="text" class="form-control" id="email_subject" name="subject" 
                               value="Document from ReqGen" required>
                    </div>
                    <div class="mb-3">
                        <label for="email_message" class="form-label">Message</label>
                        <textarea class="form-control" id="email_message" name="message" rows="3">Please find the attached document.</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="sendEmail()">
                    <i class="fas fa-paper-plane me-2"></i>Send Email
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer"></div>

<script>
let emailModal;

document.addEventListener('DOMContentLoaded', function() {
    emailModal = new bootstrap.Modal(document.getElementById('emailModal'));
});

function showEmailModal(documentId) {
    document.getElementById('email_doc_id').value = documentId;
    emailModal.show();
}

async function sendEmail() {
    const form = document.getElementById('emailForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch('api/send-email.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Email sent successfully!', 'success');
            emailModal.hide();
            form.reset();
        } else {
            showToast(result.message || 'Failed to send email', 'danger');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'danger');
    }
}

async function deleteDocument(documentId) {
    if (!confirmDelete('Are you sure you want to delete this document?')) {
        return;
    }
    
    try {
        const response = await fetch('api/delete-document.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ document_id: documentId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Document deleted successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(result.message || 'Failed to delete document', 'danger');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'danger');
    }
}
</script>

<?php require_once 'includes/footer.php'; ?>
