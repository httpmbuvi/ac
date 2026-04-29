<?php
require 'db_connect.php';
header('Content-Type: application/json');

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$user = $data['username'] ?? '';
$pass = $data['password'] ?? '';

if (empty($user) || empty($pass)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a username and password.']);
    exit;
}

// Check if username already exists
$stmt = $conn->prepare("SELECT id FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already taken.']);
    $stmt->close();
    exit;
}
$stmt->close();

// Hash the password
$hashed_password = password_hash($pass, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO admin_users (username, password) VALUES (?, ?)");
$stmt->bind_param("ss", $user, $hashed_password);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    // Duplicate entry error or other DB error
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

$stmt->close();
$conn->close();
?>