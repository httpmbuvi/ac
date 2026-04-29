<?php
$servername = "localhost";
$username = "root";      // Default XAMPP username
$password = "";          // Default XAMPP password is empty
$dbname = "ancoweb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    // Return JSON instead of plain text so the frontend can display it nicely
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}
?>