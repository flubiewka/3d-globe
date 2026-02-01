<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../includes/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$city_input = $data['city'] ?? '';
$status = $data['status'] ?? 'visited';

if (empty($city_input)) {
    echo json_encode(['error' => 'City is empty']);
    exit;
}

$script_path = __DIR__ . '/get_coords.py';
$command = 'python ' . escapeshellarg($script_path) . ' ' . escapeshellarg($city_input) . ' 2>&1';
$output = shell_exec($command);
$result = json_decode($output, true);

if (!$result || isset($result['error'])) {
    echo json_encode(['error' => 'City not found', 'details' => $output]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO visited_places (city_name, lat, lng, temp, weather_desc, status) VALUES (?, ?, ?, ?, ?, ?)");

$city_name = $result['city'] ?? $city_input;
$lat = (float)($result['lat'] ?? 0);
$lng = (float)($result['lng'] ?? 0);
$temp = (int)($result['temp'] ?? 0);
$desc = $result['desc'] ?? 'no data';

$stmt->bind_param("sddiss", 
    $city_name, 
    $lat, 
    $lng, 
    $temp, 
    $desc, 
    $status
);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => $stmt->error]);
}

$stmt->close();
$conn->close();