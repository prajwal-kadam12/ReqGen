<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$pageTitle = 'Settings';

// Get settings from database
$conn = getDBConnection();
$settings = null;
$success = '';
$error = '';

if ($conn) {
    $result = $conn->query("SELECT * FROM settings LIMIT 1");
    if ($result && $result->num_rows > 0) {
        $settings = $result->fetch_assoc();
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $conn) {
    $companyName = $_POST['company_name'] ?? '';
    $address = $_POST['address'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $apiKey = $_POST['api_key'] ?? '';
    
    if ($settings) {
        // Update existing settings
        $stmt = $conn->prepare("UPDATE settings SET company_name = ?, address = ?, phone = ?, email = ?, api_key = ? WHERE id = ?");
        $stmt->bind_param("ssssss", $companyName, $address, $phone, $email, $apiKey, $settings['id']);
    } else {
        // Insert new settings
        $id = uniqid('set_', true);
        $stmt = $conn->prepare("INSERT INTO settings (id, company_name, address, phone, email, api_key) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $id, $companyName, $address, $phone, $email, $apiKey);
    }
    
    if ($stmt->execute()) {
        $success = 'Settings saved successfully!';
        // Refresh settings
        $result = $conn->query("SELECT * FROM settings LIMIT 1");
        if ($result && $result->num_rows > 0) {
            $settings = $result->fetch_assoc();
        }
    } else {
        $error = 'Failed to save settings';
    }
    
    $stmt->close();
}

if ($conn) {
    $conn->close();
}

require_once 'includes/header.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <h2><i class="fas fa-cog me-2"></i>Settings</h2>
        <p class="text-muted">Configure your application settings</p>
    </div>
</div>

<?php if ($success): ?>
<div class="alert alert-success alert-dismissible fade show" role="alert">
    <i class="fas fa-check-circle me-2"></i><?php echo $success; ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="fas fa-exclamation-circle me-2"></i><?php echo $error; ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<div class="row mt-4">
    <div class="col-lg-8">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-building me-2"></i>Company Information</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="company_name" class="form-label">Company Name</label>
                        <input type="text" class="form-control" id="company_name" name="company_name" 
                               value="<?php echo htmlspecialchars($settings['company_name'] ?? ''); ?>">
                    </div>
                    
                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea class="form-control" id="address" name="address" rows="3"><?php echo htmlspecialchars($settings['address'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="phone" class="form-label">Phone</label>
                            <input type="text" class="form-control" id="phone" name="phone" 
                                   value="<?php echo htmlspecialchars($settings['phone'] ?? ''); ?>">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" 
                                   value="<?php echo htmlspecialchars($settings['email'] ?? ''); ?>">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="api_key" class="form-label">API Key (Optional)</label>
                        <input type="text" class="form-control" id="api_key" name="api_key" 
                               value="<?php echo htmlspecialchars($settings['api_key'] ?? ''); ?>"
                               placeholder="For future AI features">
                        <div class="form-text">For AI-powered document generation (optional)</div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Save Settings
                    </button>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="card shadow mb-3">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="fas fa-envelope me-2"></i>Email Configuration</h6>
            </div>
            <div class="card-body">
                <p class="small">To enable email sending, configure SMTP settings in <code>config/config.php</code>:</p>
                <ul class="small">
                    <li>SMTP_HOST</li>
                    <li>SMTP_PORT</li>
                    <li>SMTP_USERNAME</li>
                    <li>SMTP_PASSWORD</li>
                </ul>
                <div class="alert alert-warning small mb-0">
                    <strong>Gmail Users:</strong> Use App Password instead of your regular password.
                </div>
            </div>
        </div>
        
        <div class="card shadow">
            <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>System Info</h6>
            </div>
            <div class="card-body">
                <p class="small mb-1"><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
                <p class="small mb-1"><strong>Server:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></p>
                <p class="small mb-0"><strong>Database:</strong> MySQL</p>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
