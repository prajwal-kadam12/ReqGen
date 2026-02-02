<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$user = getCurrentUser();
$pageTitle = 'My Profile';

require_once 'includes/header.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <h2><i class="fas fa-user me-2"></i>My Profile</h2>
        <p class="text-muted">View your account information</p>
    </div>
</div>

<div class="row mt-4">
    <div class="col-lg-6">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-id-card me-2"></i>Account Details</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label text-muted">Full Name</label>
                    <p class="h5"><?php echo htmlspecialchars($user['name']); ?></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-muted">Username</label>
                    <p class="h6"><?php echo htmlspecialchars($user['username']); ?></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-muted">Email Address</label>
                    <p class="h6"><?php echo htmlspecialchars($user['email']); ?></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-muted">Role</label>
                    <p>
                        <span class="badge bg-primary">
                            <?php echo ucfirst($user['role']); ?>
                        </span>
                    </p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-muted">User ID</label>
                    <p class="small text-muted"><code><?php echo htmlspecialchars($user['id']); ?></code></p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-lg-6">
        <div class="card shadow mb-3">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="fas fa-shield-alt me-2"></i>Security</h6>
            </div>
            <div class="card-body">
                <p>Password management and security settings will be available in future updates.</p>
                <button class="btn btn-outline-primary" disabled>
                    <i class="fas fa-key me-2"></i>Change Password
                </button>
            </div>
        </div>
        
        <div class="card shadow">
            <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Quick Stats</h6>
            </div>
            <div class="card-body">
                <?php
                $conn = getDBConnection();
                $totalDocs = 0;
                
                if ($conn) {
                    $result = $conn->query("SELECT COUNT(*) as total FROM documents");
                    if ($result) {
                        $row = $result->fetch_assoc();
                        $totalDocs = $row['total'];
                    }
                    $conn->close();
                }
                ?>
                <p class="mb-2"><strong>Total Documents:</strong> <?php echo $totalDocs; ?></p>
                <p class="mb-0"><strong>Account Type:</strong> <?php echo ucfirst($user['role']); ?></p>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
