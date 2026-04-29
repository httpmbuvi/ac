<?php
// Allow access from any origin (Fixes 'Failed to fetch' CORS issues)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db_connect.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// --- 1. GET ALL PROJECTS ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_projects') {
    $sql = "SELECT * FROM projects ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $projects = [];
    while($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }
    echo json_encode($projects);
    exit;
}

// --- 2. UPLOAD PROJECT ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload') {
    $title = $_POST['title'] ?? '';
    $desc = $_POST['description'] ?? '';
    $cat = $_POST['category'] ?? '';
    
    // Validate File
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No image file sent.']);
        exit;
    } elseif ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $msg = 'Upload error code: ' . $_FILES['image']['error'];
        if ($_FILES['image']['error'] == UPLOAD_ERR_INI_SIZE) $msg = 'File too large (server limit).';
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }

    $file = $_FILES['image'];
    $fileName = $file['name'];
    $fileTmp = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Allowed Extensions
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($fileType, $allowed)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File type not supported. Only JPG, PNG, WEBP allowed.']);
        exit;
    }

    // Max Size (5MB)
    if ($fileSize > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large. Max 5MB.']);
        exit;
    }

    // Rename File
    $newFileName = uniqid('proj_') . '.' . $fileType;
    $uploadDir = 'uploads/projects/';
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
    
    $destination = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmp, $destination)) {
        // Insert into DB
        $stmt = $conn->prepare("INSERT INTO projects (title, description, category, image) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database Error: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("ssss", $title, $desc, $cat, $destination);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Project uploaded successfully!']);
        } else {
            // Cleanup image if DB insert fails
            unlink($destination);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file. Check permissions.']);
    }
    exit;
}

// --- 3. DELETE PROJECT ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = $input['id'] ?? 0;

    // Get image path first to delete file
    $stmt = $conn->prepare("SELECT image FROM projects WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->bind_result($imagePath);
    $stmt->fetch();
    $stmt->close();

    if ($imagePath && file_exists($imagePath)) unlink($imagePath);

    $stmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'DB Error: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
?>