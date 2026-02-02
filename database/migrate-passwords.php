<?php
/**
 * Password Migration Script
 * 
 * This script migrates plain text passwords to hashed passwords
 * Run this ONCE after initial setup to secure demo accounts
 * 
 * Usage:
 * php database/migrate-passwords.php
 */

require_once __DIR__ . '/../php-project/config/database.php';

echo "🔐 Password Migration Script\n";
echo "==========================\n\n";

$conn = getDBConnection();

if (!$conn) {
    die("❌ Database connection failed\n");
}

echo "✅ Connected to database\n";

// Get all users with plain text passwords
$result = $conn->query("SELECT id, username, email, password FROM users");

if (!$result) {
    die("❌ Failed to query users table\n");
}

$migrated = 0;
$skipped = 0;

while ($user = $result->fetch_assoc()) {
    // Check if password is already hashed
    if (password_get_info($user['password'])['algo'] !== 0) {
        echo "⏭️  Skipping {$user['username']} - already hashed\n";
        $skipped++;
        continue;
    }
    
    // Hash the plain text password
    $hashedPassword = password_hash($user['password'], PASSWORD_DEFAULT);
    
    // Update in database
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("ss", $hashedPassword, $user['id']);
    
    if ($stmt->execute()) {
        echo "✅ Migrated {$user['username']} ({$user['email']})\n";
        $migrated++;
    } else {
        echo "❌ Failed to migrate {$user['username']}\n";
    }
    
    $stmt->close();
}

$conn->close();

echo "\n==========================\n";
echo "✅ Migration complete!\n";
echo "   Migrated: $migrated\n";
echo "   Skipped: $skipped\n";
echo "\n";
echo "🔒 All passwords are now securely hashed!\n";
echo "\n";
echo "Demo login credentials (unchanged):\n";
echo "  analyst@reqgen.com / analyst123\n";
echo "  admin@reqgen.com / admin123\n";
echo "  client@reqgen.com / client123\n";
?>
