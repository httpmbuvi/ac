<?php
require 'db_connect.php';

// 1. Create Uploads Directory
$uploadDir = "uploads/projects/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
    echo "Created uploads folder: $uploadDir <br>";
}

// 2. Create Projects Table
$sql = "CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'projects' created or checked successfully.<br>";
} else {
    echo "Error creating table: " . $conn->error . "<br>";
}

echo "<br><strong>Setup Complete.</strong> You can now use the <a href='admin.html'>Admin Dashboard</a>.";
$conn->close();
?>