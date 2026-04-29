<?php
session_start();
require 'db_connect.php';

header('Content-Type: application/json');

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$user = $data['username'] ?? '';
$pass = $data['password'] ?? '';

if (empty($user) || empty($pass)) {
    echo json_encode(['success' => false, 'message' => 'Please enter both username and password.']);
    exit;
}

// Prepare statement to prevent SQL Injection
$stmt = $conn->prepare("SELECT id, password FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($id, $hashed_password);
    $stmt->fetch();
    
    if (password_verify($pass, $hashed_password)) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $id;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid login credentials.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid login credentials.']);
}

$stmt->close();
$conn->close();
?>