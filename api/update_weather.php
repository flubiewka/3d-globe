<?php
header('Content-Type: application/json');
include '../includes/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;

if (!$id) {
    echo json_encode(['error' => 'No id provided']);
    exit;
}

$stmt = $conn->prepare("SELECT lat, lng FROM places WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['error' => 'City not found']);
    exit;
}

$env_path = __DIR__ . '/../.env';
$env = file_exists($env_path) ? parse_ini_file($env_path) : [];
$api_key = $env['WEATHER_API_KEY'] ?? '';

if (!$api_key) {
    echo json_encode(['error' => 'API Key missing']);
    exit;
}

$url = "https://api.openweathermap.org/data/2.5/weather?lat={$row['lat']}&lon={$row['lng']}&units=metric&appid={$api_key}";

$context = stream_context_create(['http' => ['ignore_errors' => true]]);
$response = file_get_contents($url, false, $context);
$weather = json_decode($response, true);

if (!$weather || !isset($weather['main'])) {
    echo json_encode(['error' => 'Weather API failed']);
    exit;
}

$temp = (int)round($weather['main']['temp']);
$desc = $weather['weather'][0]['description'];

$update_stmt = $conn->prepare("UPDATE places SET temp = ?, weather_desc = ?, last_updated = NOW() WHERE id = ?");
$update_stmt->bind_param("dsi", $temp, $desc, $id);

if ($update_stmt->execute()) {
    echo json_encode(['success' => true, 'temp' => $temp, 'desc' => $desc]);
} else {
    echo json_encode(['error' => 'Update failed']);
}

$update_stmt->close();
$conn->close();
?>