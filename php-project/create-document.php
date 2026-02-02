<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$pageTitle = 'Create Document';
require_once 'includes/header.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <h2><i class="fas fa-plus-circle me-2"></i>Create New Document</h2>
        <p class="text-muted">Generate professional business requirement documents</p>
    </div>
</div>

<div class="row mt-4">
    <div class="col-lg-8">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-file-alt me-2"></i>Document Information</h5>
            </div>
            <div class="card-body">
                <form id="createDocumentForm" class="needs-validation" novalidate>
                    <!-- Document Type -->
                    <div class="mb-3">
                        <label for="docType" class="form-label">Document Type <span class="text-danger">*</span></label>
                        <select class="form-select" id="docType" name="type" required>
                            <option value="">Select document type...</option>
                            <option value="brd">BRD - Business Requirement Document</option>
                            <option value="srs">SRS - Software Requirement Specification</option>
                            <option value="sdd">SDD - System Design Document</option>
                            <option value="po">Purchase Order</option>
                        </select>
                        <div class="invalid-feedback">Please select a document type.</div>
                    </div>
                    
                    <!-- Document Name -->
                    <div class="mb-3">
                        <label for="docName" class="form-label">Document Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="docName" name="name" 
                               placeholder="e.g., E-commerce Platform BRD" required>
                        <div class="invalid-feedback">Please enter a document name.</div>
                    </div>
                    
                    <!-- Company Name -->
                    <div class="mb-3">
                        <label for="companyName" class="form-label">Company Name</label>
                        <input type="text" class="form-control" id="companyName" name="company_name" 
                               placeholder="e.g., Tech Solutions Inc.">
                    </div>
                    
                    <!-- Project Name -->
                    <div class="mb-3">
                        <label for="projectName" class="form-label">Project Name</label>
                        <input type="text" class="form-control" id="projectName" name="project_name" 
                               placeholder="e.g., Mobile App Development">
                    </div>
                    
                    <!-- Original Note -->
                    <div class="mb-3">
                        <label for="originalNote" class="form-label">Requirements / Notes <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="originalNote" name="original_note" rows="6" 
                                  placeholder="Enter your requirements, features, or notes here..." required></textarea>
                        <div class="form-text">Describe what you need in detail</div>
                        <div class="invalid-feedback">Please enter requirements or notes.</div>
                    </div>
                    
                    <!-- Refined Note (Optional) -->
                    <div class="mb-3">
                        <label for="refinedNote" class="form-label">Refined/Processed Notes</label>
                        <textarea class="form-control" id="refinedNote" name="refined_note" rows="4" 
                                  placeholder="Optional: Add refined or AI-processed notes"></textarea>
                        <div class="form-text">Optional: Refined version of your requirements</div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Generate Document
                        </button>
                        <a href="dashboard.php" class="btn btn-secondary">
                            <i class="fas fa-times me-2"></i>Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="card shadow">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Document Types</h6>
            </div>
            <div class="card-body">
                <h6 class="text-primary"><i class="fas fa-file-contract me-1"></i> BRD</h6>
                <p class="small">Business Requirement Document - Defines business objectives and functional requirements.</p>
                
                <h6 class="text-success"><i class="fas fa-file-code me-1"></i> SRS</h6>
                <p class="small">Software Requirement Specification - Technical requirements for software development.</p>
                
                <h6 class="text-warning"><i class="fas fa-file-invoice me-1"></i> SDD</h6>
                <p class="small">System Design Document - Architectural and design specifications.</p>
                
                <h6 class="text-danger"><i class="fas fa-file-invoice-dollar me-1"></i> PO</h6>
                <p class="small">Purchase Order - Commercial document for purchasing goods/services.</p>
            </div>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer"></div>

<script>
document.getElementById('createDocumentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
    }
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const hideLoading = showLoading(submitBtn);
    
    const formData = new FormData(this);
    
    try {
        const response = await fetch('api/create-document.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Document created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'view-document.php?id=' + result.document_id;
            }, 1500);
        } else {
            showToast(result.message || 'Failed to create document', 'danger');
            hideLoading();
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'danger');
        hideLoading();
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
