<?php
require_once 'config/config.php';
require_once 'config/database.php';

// Check if user is logged in
if (!isLoggedIn()) {
    redirect('login.php');
}

$user = getCurrentUser();
$pageTitle = 'Dashboard';

// Get document statistics
$conn = getDBConnection();
$totalDocs = 0;
$recentDocs = [];

if ($conn) {
    $result = $conn->query("SELECT COUNT(*) as total FROM documents");
    if ($result) {
        $row = $result->fetch_assoc();
        $totalDocs = $row['total'];
    }
    
    $result = $conn->query("SELECT * FROM documents ORDER BY created_at DESC LIMIT 5");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $recentDocs[] = $row;
        }
    }
    
    $conn->close();
}

require_once 'includes/header.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <h2><i class="fas fa-tachometer-alt me-2"></i>Dashboard</h2>
        <p class="text-muted">Welcome back, <?php echo htmlspecialchars($user['name']); ?>!</p>
    </div>
</div>

<div class="row mt-4">
    <!-- Stats Cards -->
    <div class="col-md-4 mb-3">
        <div class="card border-left-primary shadow h-100">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                            Total Documents
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $totalDocs; ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-file-alt fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card border-left-success shadow h-100">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                            Your Role
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo ucfirst($user['role']); ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-user-tag fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card border-left-info shadow h-100">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                            Email
                        </div>
                        <div class="h6 mb-0 font-weight-bold text-gray-800"><?php echo htmlspecialchars($user['email']); ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-envelope fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <a href="create-document.php" class="btn btn-outline-primary w-100 py-3">
                            <i class="fas fa-plus-circle fa-2x mb-2 d-block"></i>
                            Create New Document
                        </a>
                    </div>
                    <div class="col-md-3 mb-3">
                        <a href="documents.php" class="btn btn-outline-success w-100 py-3">
                            <i class="fas fa-folder-open fa-2x mb-2 d-block"></i>
                            View All Documents
                        </a>
                    </div>
                    <div class="col-md-3 mb-3">
                        <a href="settings.php" class="btn btn-outline-info w-100 py-3">
                            <i class="fas fa-cog fa-2x mb-2 d-block"></i>
                            Settings
                        </a>
                    </div>
                    <div class="col-md-3 mb-3">
                        <a href="profile.php" class="btn btn-outline-warning w-100 py-3">
                            <i class="fas fa-user fa-2x mb-2 d-block"></i>
                            My Profile
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Recent Documents -->
<?php if (!empty($recentDocs)): ?>
<div class="row mt-4">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-header bg-secondary text-white">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Documents</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Company</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentDocs as $doc): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($doc['name']); ?></td>
                                <td><span class="badge bg-primary"><?php echo strtoupper($doc['type']); ?></span></td>
                                <td><?php echo htmlspecialchars($doc['company_name'] ?? 'N/A'); ?></td>
                                <td><?php echo date('M d, Y', strtotime($doc['created_at'])); ?></td>
                                <td>
                                    <a href="view-document.php?id=<?php echo $doc['id']; ?>" class="btn btn-sm btn-info">
                                        <i class="fas fa-eye"></i>
                                    </a>
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

<style>
.border-left-primary {
    border-left: 4px solid #4e73df !important;
}
.border-left-success {
    border-left: 4px solid #1cc88a !important;
}
.border-left-info {
    border-left: 4px solid #36b9cc !important;
}
</style>

<?php require_once 'includes/footer.php'; ?>
